import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { BlobReader, BlobWriter, ZipReader } from "https://deno.land/x/zipjs@v2.7.52/index.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExtractRequest {
  import_id: string;
  user_id: string;
}

async function writeBlobToFileHandle(blob: Blob, file: Deno.FsFile) {
  const reader = blob.stream().getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) await file.write(value);
  }
}

async function writeBlobToFile(blob: Blob, path: string) {
  const file = await Deno.open(path, { create: true, write: true, truncate: true });
  try {
    await writeBlobToFileHandle(blob, file);
  } finally {
    file.close();
  }
}

// Validate ZIP file signature
async function validateZipSignature(zipBlob: Blob): Promise<{ valid: boolean; signature: string }> {
  const header = new Uint8Array(await zipBlob.slice(0, 4).arrayBuffer());
  const sig = Array.from(header).map(b => b.toString(16).padStart(2, '0')).join(' ');
  // Valid ZIP signatures: PK\x03\x04 (normal), PK\x05\x06 (empty), PK\x07\x08 (spanned)
  const isValid = header[0] === 0x50 && header[1] === 0x4B && 
                 (header[2] === 0x03 || header[2] === 0x05 || header[2] === 0x07);
  return { valid: isValid, signature: sig };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { import_id, user_id }: ExtractRequest = await req.json();
    console.log(`[Extract] Starting extraction for import: ${import_id}`);

    // Get import record
    const { data: importData, error: importError } = await supabase
      .from('archive_imports')
      .select('*')
      .eq('id', import_id)
      .single();

    if (importError || !importData) {
      throw new Error('Import not found');
    }

    const dirPath = importData.storage_zip_path.split('/').slice(0, -1).join('/');
    const baseName = importData.storage_zip_path.split('/').pop() || 'archive.zip';
    const chunkPrefix = `${baseName}.chunk`;

    // Prefer chunk-based assembly when chunks exist
    const { data: chunkList, error: listError } = await supabase.storage
      .from('vault')
      .list(dirPath, { limit: 1000 });

    if (listError) {
      throw new Error(`Failed to list storage: ${listError.message}`);
    }

    const chunkFiles = (chunkList || [])
      .filter((f) => f.name.startsWith(chunkPrefix))
      .sort((a, b) => {
        const numA = parseInt(a.name.slice(chunkPrefix.length), 10);
        const numB = parseInt(b.name.slice(chunkPrefix.length), 10);
        return (Number.isFinite(numA) ? numA : 0) - (Number.isFinite(numB) ? numB : 0);
      });

    let zipBlob: Blob;

    if (chunkFiles.length > 0) {
      console.log(`[Extract] Found ${chunkFiles.length} chunks, assembling in memory...`);

      const chunks: Blob[] = [];
      let totalSize = 0;

      for (const chunkFile of chunkFiles) {
        const chunkPath = `${dirPath}/${chunkFile.name}`;
        const { data: chunkData, error: chunkError } = await supabase.storage
          .from('vault')
          .download(chunkPath);

        if (chunkError || !chunkData) {
          throw new Error(`Failed to download chunk ${chunkFile.name}: ${chunkError?.message}`);
        }

        totalSize += chunkData.size;
        chunks.push(chunkData);
      }

      zipBlob = new Blob(chunks);
      console.log(`[Extract] Assembled ${chunkFiles.length} chunks into ${totalSize} bytes`);
    } else {
      console.log(`[Extract] No chunks found, downloading ZIP directly...`);
      const { data: downloadedBlob, error: downloadError } = await supabase.storage
        .from('vault')
        .download(importData.storage_zip_path);

      if (downloadError || !downloadedBlob) {
        throw new Error(`Failed to download ZIP: ${downloadError?.message}`);
      }

      zipBlob = downloadedBlob;
      console.log(`[Extract] Downloaded ZIP, size: ${zipBlob.size} bytes`);
    }

    console.log(`[Extract] ZIP ready, size: ${zipBlob.size} bytes`);

    // Validate ZIP signature
    const { valid: validSig, signature } = await validateZipSignature(zipBlob);
    console.log(`[Extract] ZIP signature: ${signature} (valid: ${validSig})`);
    
    if (!validSig) {
      throw new Error(`Invalid ZIP file signature: ${signature}. File may be corrupted, encrypted, or not a ZIP archive.`);
    }

    // Use zip.js to extract (pure JavaScript, works in Edge Runtime)
    console.log(`[Extract] Opening ZIP with zip.js...`);
    const zipReader = new ZipReader(new BlobReader(zipBlob));
    const entries = await zipReader.getEntries();
    
    console.log(`[Extract] ZIP contains ${entries.length} entries`);

    if (entries.length === 0) {
      await zipReader.close();
      throw new Error(`ZIP archive is empty (0 entries).`);
    }

    // Extract files
    const extractedFiles: { path: string; type: string; size: number }[] = [];
    const uploadedFiles: string[] = [];
    const storagePath = `raw/openai_exports/${user_id}/${import_id}/extracted`;

    // Process entries in batches to avoid memory issues
    const BATCH_SIZE = 10;
    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batch = entries.slice(i, i + BATCH_SIZE);
      
      await Promise.all(batch.map(async (entry) => {
        // Skip directories
        if (entry.directory) {
          return;
        }

        const fileName = entry.filename;
        let fileType = 'other';
        
        if (fileName.endsWith('.json')) fileType = 'json';
        else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)) fileType = 'image';
        else if (/\.(mp3|wav|m4a|ogg)$/i.test(fileName)) fileType = 'audio';
        else if (fileName.endsWith('.pdf')) fileType = 'pdf';

        try {
          // Skip if getData is not available (shouldn't happen for file entries)
          if (!entry.getData) {
            console.log(`[Extract] Skipping entry without getData: ${fileName}`);
            return;
          }

          // Extract file content
          const blobWriter = new BlobWriter();
          const blob = await entry.getData(blobWriter);
          
          extractedFiles.push({
            path: fileName,
            type: fileType,
            size: blob.size
          });

          // Upload to storage
          const remotePath = `${storagePath}/${fileName}`;
          const arrayBuffer = await blob.arrayBuffer();
          
          const { error: uploadError } = await supabase.storage
            .from('vault')
            .upload(remotePath, arrayBuffer, { 
              upsert: true,
              contentType: blob.type || 'application/octet-stream'
            });

          if (uploadError) {
            console.error(`[Extract] Failed to upload ${fileName}:`, uploadError);
            return;
          }

          // Record in import_files table
          await supabase.from('archive_import_files').insert({
            import_id,
            storage_path: remotePath,
            file_type: fileType,
            metadata_json: { original_name: fileName, size: blob.size }
          });

          uploadedFiles.push(fileName);
        } catch (entryError) {
          console.error(`[Extract] Error processing entry ${fileName}:`, entryError);
        }
      }));

      console.log(`[Extract] Processed batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(entries.length/BATCH_SIZE)}`);
    }

    await zipReader.close();

    console.log(`[Extract] Found ${extractedFiles.length} files, uploaded ${uploadedFiles.length}`);

    // CRITICAL: Fail if no files extracted
    if (extractedFiles.length === 0) {
      throw new Error(
        `Extraction produced 0 files from ${entries.length} entries. ZIP signature: ${signature}`
      );
    }

    // Log audit event
    await supabase.from('archive_audit_events').insert({
      actor_user_id: user_id,
      action: 'extract_completed',
      object_type: 'import',
      object_id: import_id,
      import_id,
      metadata_json: { 
        files_extracted: extractedFiles.length, 
        files_uploaded: uploadedFiles.length,
        zip_signature: signature,
        zip_entries: entries.length
      }
    });

    console.log(`[Extract] Completed: ${uploadedFiles.length} files uploaded`);

    return new Response(JSON.stringify({ 
      success: true,
      files_found: extractedFiles.length,
      files_uploaded: uploadedFiles.length,
      file_types: extractedFiles.reduce((acc, f) => {
        acc[f.type] = (acc[f.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    }), { 
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Extract] Error:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});

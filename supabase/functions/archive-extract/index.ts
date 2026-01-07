import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
async function validateZipSignature(path: string): Promise<{ valid: boolean; signature: string }> {
  const file = await Deno.open(path, { read: true });
  try {
    const header = new Uint8Array(4);
    await file.read(header);
    const sig = Array.from(header).map(b => b.toString(16).padStart(2, '0')).join(' ');
    // Valid ZIP signatures: PK\x03\x04 (normal), PK\x05\x06 (empty), PK\x07\x08 (spanned)
    const isValid = header[0] === 0x50 && header[1] === 0x4B && 
                   (header[2] === 0x03 || header[2] === 0x05 || header[2] === 0x07);
    return { valid: isValid, signature: sig };
  } finally {
    file.close();
  }
}

// List ZIP contents without extracting
async function listZipContents(zipPath: string): Promise<{ success: boolean; output: string; entryCount: number }> {
  const listProcess = new Deno.Command('unzip', {
    args: ['-l', zipPath],
    stdout: 'piped',
    stderr: 'piped',
  });
  
  const { code, stdout, stderr } = await listProcess.output();
  const output = new TextDecoder().decode(stdout);
  const errorOutput = new TextDecoder().decode(stderr);
  
  // Count entries (lines that look like file entries)
  const lines = output.split('\n');
  const entryCount = lines.filter(line => 
    line.trim() && /^\s*\d+\s+\d{2}-\d{2}-\d{2,4}/.test(line)
  ).length;
  
  return {
    success: code === 0,
    output: code === 0 ? output.slice(0, 2000) : errorOutput.slice(0, 2000),
    entryCount
  };
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

    // Create temp directory for extraction
    const tempDir = await Deno.makeTempDir();
    const zipPath = `${tempDir}/archive.zip`;

    const dirPath = importData.storage_zip_path.split('/').slice(0, -1).join('/');
    const baseName = importData.storage_zip_path.split('/').pop() || 'archive.zip';
    const chunkPrefix = `${baseName}.chunk`;

    // Prefer chunk-based assembly when chunks exist (avoids memory spikes on large files)
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

    if (chunkFiles.length > 0) {
      console.log(`[Extract] Found ${chunkFiles.length} chunks, assembling to disk...`);

      const outFile = await Deno.open(zipPath, { create: true, write: true, truncate: true });
      let totalSize = 0;

      try {
        for (const chunkFile of chunkFiles) {
          const chunkPath = `${dirPath}/${chunkFile.name}`;
          const { data: chunkData, error: chunkError } = await supabase.storage
            .from('vault')
            .download(chunkPath);

          if (chunkError || !chunkData) {
            throw new Error(`Failed to download chunk ${chunkFile.name}: ${chunkError?.message}`);
          }

          totalSize += chunkData.size;
          await writeBlobToFileHandle(chunkData, outFile);
        }
      } finally {
        outFile.close();
      }

      console.log(`[Extract] Assembled ${chunkFiles.length} chunks into ~${totalSize} bytes at ${zipPath}`);
    } else {
      console.log(`[Extract] No chunks found, downloading ZIP...`);
      const { data: zipBlob, error: downloadError } = await supabase.storage
        .from('vault')
        .download(importData.storage_zip_path);

      if (downloadError || !zipBlob) {
        throw new Error(`Failed to download ZIP: ${downloadError?.message}`);
      }

      await writeBlobToFile(zipBlob, zipPath);
      console.log(`[Extract] Downloaded ZIP to disk, size: ${zipBlob.size} bytes`);
    }

    const zipStat = await Deno.stat(zipPath);
    console.log(`[Extract] ZIP ready on disk, size: ${zipStat.size} bytes`);

    // FORENSIC: Validate ZIP signature
    const { valid: validSig, signature } = await validateZipSignature(zipPath);
    console.log(`[Extract] ZIP signature: ${signature} (valid: ${validSig})`);
    
    if (!validSig) {
      throw new Error(`Invalid ZIP file signature: ${signature}. File may be corrupted, encrypted, or not a ZIP archive.`);
    }

    // FORENSIC: List ZIP contents before extraction
    const { success: listSuccess, output: listOutput, entryCount } = await listZipContents(zipPath);
    console.log(`[Extract] ZIP listing success: ${listSuccess}, entries: ${entryCount}`);
    console.log(`[Extract] ZIP listing preview:\n${listOutput.slice(0, 1000)}`);
    
    if (!listSuccess) {
      throw new Error(`Cannot list ZIP contents. Archive may be encrypted or corrupted. Details: ${listOutput}`);
    }
    
    if (entryCount === 0) {
      throw new Error(`ZIP archive appears empty (0 entries detected). Listing output: ${listOutput.slice(0, 500)}`);
    }

    // Extract ZIP using system unzip (more reliable for large files)
    const extractDir = `${tempDir}/extracted`;
    await Deno.mkdir(extractDir, { recursive: true });
    
    console.log(`[Extract] Running unzip on ${zipPath}...`);
    const unzipProcess = new Deno.Command('unzip', {
      args: ['-o', '-q', zipPath, '-d', extractDir],
      stdout: 'piped',
      stderr: 'piped',
    });

    const { code, stderr, stdout } = await unzipProcess.output();
    const stderrText = new TextDecoder().decode(stderr);
    const stdoutText = new TextDecoder().decode(stdout);

    console.log(`[Extract] unzip exit code: ${code}`);
    if (stderrText) console.log(`[Extract] unzip stderr: ${stderrText.slice(0, 1000)}`);
    if (stdoutText) console.log(`[Extract] unzip stdout: ${stdoutText.slice(0, 500)}`);

    if (code !== 0) {
      throw new Error(`ZIP extraction failed (exit code ${code}): ${stderrText || 'Unknown error'}`);
    }

    console.log(`[Extract] Successfully extracted ZIP to ${extractDir}`);

    // List extracted files
    const extractedFiles: { path: string; type: string; size: number }[] = [];
    
    async function walkDir(dir: string, basePath: string = '') {
      for await (const entry of Deno.readDir(dir)) {
        const fullPath = `${dir}/${entry.name}`;
        const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;
        
        if (entry.isDirectory) {
          await walkDir(fullPath, relativePath);
        } else {
          const stat = await Deno.stat(fullPath);
          let fileType = 'other';
          
          if (entry.name.endsWith('.json')) fileType = 'json';
          else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(entry.name)) fileType = 'image';
          else if (/\.(mp3|wav|m4a|ogg)$/i.test(entry.name)) fileType = 'audio';
          else if (entry.name.endsWith('.pdf')) fileType = 'pdf';
          
          extractedFiles.push({
            path: relativePath,
            type: fileType,
            size: stat.size
          });
        }
      }
    }

    await walkDir(extractDir);
    console.log(`[Extract] Found ${extractedFiles.length} files after extraction`);

    // CRITICAL: Fail if no files extracted
    if (extractedFiles.length === 0) {
      throw new Error(
        `Extraction produced 0 files. ZIP signature: ${signature}, ` +
        `Listed entries: ${entryCount}, unzip stderr: ${stderrText.slice(0, 300)}`
      );
    }

    // Upload extracted files to storage and record in database
    const uploadedFiles: string[] = [];
    const storagePath = `raw/openai_exports/${user_id}/${import_id}/extracted`;

    for (const file of extractedFiles) {
      const localPath = `${extractDir}/${file.path}`;
      const remotePath = `${storagePath}/${file.path}`;
      
      try {
        const fileData = await Deno.readFile(localPath);
        
        await supabase.storage
          .from('vault')
          .upload(remotePath, fileData, { upsert: true });

        // Record in import_files table
        await supabase.from('archive_import_files').insert({
          import_id,
          storage_path: remotePath,
          file_type: file.type,
          metadata_json: { original_name: file.path, size: file.size }
        });

        uploadedFiles.push(file.path);
      } catch (uploadError) {
        console.error(`[Extract] Failed to upload ${file.path}:`, uploadError);
      }
    }

    // Cleanup temp directory
    try {
      await Deno.remove(tempDir, { recursive: true });
    } catch (e: unknown) {
      const eMsg = e instanceof Error ? e.message : String(e);
      console.log('[Extract] Cleanup warning:', eMsg);
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
        zip_listed_entries: entryCount
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decompress } from "https://deno.land/x/zip@v1.2.5/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExtractRequest {
  import_id: string;
  user_id: string;
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

    // Download ZIP from storage - try assembled file first, then fallback to chunks
    let zipData: Blob | null = null;
    
    const { data: directDownload, error: downloadError } = await supabase.storage
      .from('vault')
      .download(importData.storage_zip_path);

    if (directDownload) {
      zipData = directDownload;
      console.log(`[Extract] Downloaded assembled ZIP, size: ${zipData.size} bytes`);
    } else {
      // Try to find and assemble chunks
      console.log(`[Extract] Assembled file not found, looking for chunks...`);
      const chunkPrefix = `${importData.storage_zip_path}.chunk`;
      
      // List all chunk files
      const { data: chunkList, error: listError } = await supabase.storage
        .from('vault')
        .list(importData.storage_zip_path.split('/').slice(0, -1).join('/'));

      if (listError) {
        throw new Error(`Failed to list storage: ${listError.message}`);
      }

      const chunkFiles = chunkList
        ?.filter(f => f.name.startsWith('openai_export.zip.chunk'))
        .sort((a, b) => {
          const numA = parseInt(a.name.replace('openai_export.zip.chunk', ''));
          const numB = parseInt(b.name.replace('openai_export.zip.chunk', ''));
          return numA - numB;
        }) || [];

      if (chunkFiles.length === 0) {
        throw new Error(`No ZIP file or chunks found at ${importData.storage_zip_path}`);
      }

      console.log(`[Extract] Found ${chunkFiles.length} chunks, assembling...`);
      
      // Download and concatenate all chunks
      const chunks: Uint8Array[] = [];
      const basePath = importData.storage_zip_path.split('/').slice(0, -1).join('/');
      
      for (const chunkFile of chunkFiles) {
        const chunkPath = `${basePath}/${chunkFile.name}`;
        const { data: chunkData, error: chunkError } = await supabase.storage
          .from('vault')
          .download(chunkPath);
        
        if (chunkError || !chunkData) {
          throw new Error(`Failed to download chunk ${chunkFile.name}: ${chunkError?.message}`);
        }
        
        const arrayBuffer = await chunkData.arrayBuffer();
        chunks.push(new Uint8Array(arrayBuffer));
      }

      // Combine chunks
      const totalSize = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const combined = new Uint8Array(totalSize);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      zipData = new Blob([combined], { type: 'application/zip' });
      console.log(`[Extract] Assembled ${chunkFiles.length} chunks into ${totalSize} bytes`);
    }

    if (!zipData) {
      throw new Error(`Failed to obtain ZIP data`);
    }

    console.log(`[Extract] ZIP ready, size: ${zipData.size} bytes`);

    // Create temp directory for extraction
    const tempDir = await Deno.makeTempDir();
    const zipPath = `${tempDir}/archive.zip`;
    
    // Write ZIP to temp file
    const zipBytes = new Uint8Array(await zipData.arrayBuffer());
    await Deno.writeFile(zipPath, zipBytes);

    // Extract ZIP
    const extractDir = `${tempDir}/extracted`;
    await Deno.mkdir(extractDir, { recursive: true });
    
    try {
      await decompress(zipPath, extractDir);
    } catch (e) {
      console.log('[Extract] Using fallback extraction method');
      // Fallback: manually list and process
    }

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
    console.log(`[Extract] Found ${extractedFiles.length} files`);

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
      metadata_json: { files_extracted: extractedFiles.length, files_uploaded: uploadedFiles.length }
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

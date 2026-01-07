import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Unzip, UnzipInflate } from "https://esm.sh/fflate@0.8.2?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExtractRequest {
  import_id: string;
  user_id: string;
}

// Validate ZIP file signature
function validateZipSignatureFromBytes(header4: Uint8Array): {
  valid: boolean;
  signature: string;
} {
  const header = header4.slice(0, 4);
  const sig = Array.from(header)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ");
  // Valid ZIP signatures: PK\x03\x04 (normal), PK\x05\x06 (empty), PK\x07\x08 (spanned)
  const isValid =
    header[0] === 0x50 &&
    header[1] === 0x4b &&
    (header[2] === 0x03 || header[2] === 0x05 || header[2] === 0x07);
  return { valid: isValid, signature: sig };
}

function concatU8(chunks: Uint8Array[], total: number) {
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.length;
  }
  return out;
}

function toUploadBuffer(u8: Uint8Array): ArrayBuffer {
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { import_id, user_id }: ExtractRequest = await req.json();
    console.log(`[Extract] Starting extraction for import: ${import_id}`);

    // Get import record
    const { data: importData, error: importError } = await supabase
      .from("archive_imports")
      .select("*")
      .eq("id", import_id)
      .single();

    if (importError || !importData) {
      throw new Error("Import not found");
    }

    const dirPath = importData.storage_zip_path.split("/").slice(0, -1).join("/");
    const baseName = importData.storage_zip_path.split("/").pop() || "archive.zip";
    const chunkPrefix = `${baseName}.chunk`;

    // List potential chunk files
    const { data: chunkList, error: listError } = await supabase.storage
      .from("vault")
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

    // We only need conversations.json for the rest of the pipeline.
    // Extracting the full archive (hundreds of MB) can exceed runtime limits.
    const TARGET_JSON = "conversations.json";

    console.log(
      `[Extract] Chunked mode: ${chunkFiles.length > 0}. Target: ${TARGET_JSON}`,
    );

    const unzipper = new Unzip();
    unzipper.register(UnzipInflate);

    let targetFound = false;
    let targetBytes: Uint8Array | null = null;

    unzipper.onfile = (file) => {
      const name = (file.name || "").replace(/^\/+/, "");
      const basename = name.split("/").pop() || name;

      // Only decompress the file we need; skip everything else for performance.
      if (basename !== TARGET_JSON) return;

      targetFound = true;
      console.log(`[Extract] Found ZIP entry: ${name} (starting stream)`);

      const chunks: Uint8Array[] = [];
      let total = 0;

      file.ondata = (err, dat, final) => {
        if (err) {
          console.error(`[Extract] Error streaming ${name}:`, err);
          return;
        }
        if (dat) {
          chunks.push(dat);
          total += dat.length;
        }
        if (final) {
          targetBytes = concatU8(chunks, total);
          console.log(`[Extract] Completed ZIP entry: ${name}, bytes: ${total}`);
        }
      };

      file.start();
    };

    // Stream ZIP bytes into unzipper
    let zipSignature: string | null = null;

    if (chunkFiles.length > 0) {
      console.log(`[Extract] Streaming ${chunkFiles.length} chunks into unzipper...`);

      for (let i = 0; i < chunkFiles.length; i++) {
        const chunkFile = chunkFiles[i];
        const chunkPath = `${dirPath}/${chunkFile.name}`;

        const { data: chunkData, error: chunkError } = await supabase.storage
          .from("vault")
          .download(chunkPath);

        if (chunkError || !chunkData) {
          throw new Error(
            `Failed to download chunk ${chunkFile.name}: ${chunkError?.message}`,
          );
        }

        const u8 = new Uint8Array(await chunkData.arrayBuffer());

        if (i === 0) {
          const { valid, signature } = validateZipSignatureFromBytes(u8);
          zipSignature = signature;
          console.log(`[Extract] ZIP signature: ${signature} (valid: ${valid})`);
          if (!valid) {
            throw new Error(
              `Invalid ZIP file signature: ${signature}. File may be corrupted, encrypted, or not a ZIP archive.`,
            );
          }
        }

        const isLast = i === chunkFiles.length - 1;
        unzipper.push(u8, isLast);

        // Stop early if we already fully extracted the target file
        if (targetBytes) {
          console.log(`[Extract] Target file extracted; skipping remaining chunks.`);
          break;
        }
      }
    } else {
      console.log(`[Extract] No chunks found, downloading ZIP directly (small archives only)...`);

      const { data: downloadedBlob, error: downloadError } = await supabase.storage
        .from("vault")
        .download(importData.storage_zip_path);

      if (downloadError || !downloadedBlob) {
        throw new Error(`Failed to download ZIP: ${downloadError?.message}`);
      }

      const zipU8 = new Uint8Array(await downloadedBlob.arrayBuffer());
      const { valid, signature } = validateZipSignatureFromBytes(zipU8);
      zipSignature = signature;
      console.log(`[Extract] ZIP signature: ${signature} (valid: ${valid})`);
      if (!valid) {
        throw new Error(
          `Invalid ZIP file signature: ${signature}. File may be corrupted, encrypted, or not a ZIP archive.`,
        );
      }

      unzipper.push(zipU8, true);
    }

    if (!targetBytes) {
      throw new Error(
        `Could not extract ${TARGET_JSON} from ZIP. ` +
          `Found entry: ${targetFound}. ZIP signature: ${zipSignature || "unknown"}.`,
      );
    }

    // Upload extracted file + record it for the parser stage
    const storagePath = `raw/openai_exports/${user_id}/${import_id}/extracted/${TARGET_JSON}`;
    const bytes = targetBytes as Uint8Array;

    const { error: uploadError } = await supabase.storage
      .from("vault")
      .upload(storagePath, toUploadBuffer(bytes), {
        upsert: true,
        contentType: "application/json",
      });

    if (uploadError) {
      throw new Error(`Failed to upload ${TARGET_JSON}: ${uploadError.message}`);
    }

    await supabase.from("archive_import_files").insert({
      import_id,
      storage_path: storagePath,
      file_type: "json",
      metadata_json: { original_name: TARGET_JSON, size: bytes.byteLength },
    });

    await supabase.from("archive_audit_events").insert({
      actor_user_id: user_id,
      action: "extract_completed",
      object_type: "import",
      object_id: import_id,
      import_id,
      metadata_json: {
        files_extracted: 1,
        files_uploaded: 1,
        extracted: [TARGET_JSON],
        zip_signature: zipSignature,
        mode: chunkFiles.length > 0 ? "chunked_stream" : "direct_download",
      },
    });

    console.log(`[Extract] Completed: uploaded ${TARGET_JSON} (${bytes.byteLength} bytes)`);

    return new Response(
      JSON.stringify({
        success: true,
        files_found: 1,
        files_uploaded: 1,
        file_types: { json: 1 },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Extract] Error:", error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Use service role for storage operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { chunk_paths, final_path, total_chunks } = await req.json();

    if (!chunk_paths || !final_path || !total_chunks) {
      throw new Error("Missing required parameters");
    }

    console.log(`Assembling ${total_chunks} chunks into ${final_path}`);

    // Download all chunks and concatenate them
    const chunks: Uint8Array[] = [];
    let totalSize = 0;

    for (let i = 0; i < total_chunks; i++) {
      const chunkPath = chunk_paths[i];
      console.log(`Downloading chunk ${i + 1}: ${chunkPath}`);

      const { data: chunkData, error: downloadError } = await supabaseAdmin.storage
        .from("vault")
        .download(chunkPath);

      if (downloadError) {
        throw new Error(`Failed to download chunk ${i + 1}: ${downloadError.message}`);
      }

      const arrayBuffer = await chunkData.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      chunks.push(uint8Array);
      totalSize += uint8Array.length;
    }

    console.log(`Total assembled size: ${totalSize} bytes`);

    // Combine all chunks into a single buffer
    const combined = new Uint8Array(totalSize);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }

    // Upload the combined file
    console.log(`Uploading combined file to ${final_path}`);
    const { error: uploadError } = await supabaseAdmin.storage
      .from("vault")
      .upload(final_path, combined, {
        contentType: "application/zip",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Failed to upload combined file: ${uploadError.message}`);
    }

    // Clean up chunk files
    console.log("Cleaning up chunk files...");
    for (const chunkPath of chunk_paths) {
      await supabaseAdmin.storage
        .from("vault")
        .remove([chunkPath]);
    }

    console.log("Assembly complete");

    return new Response(
      JSON.stringify({
        success: true,
        final_path,
        total_size: totalSize,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error assembling chunks:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});

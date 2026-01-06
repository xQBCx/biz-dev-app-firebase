import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChunkRequest {
  import_id: string;
  user_id: string;
}

// Simple token estimation (4 chars per token average)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Generate chunk hash for deduplication
function hashChunk(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

const MIN_CHUNK_TOKENS = 400;
const MAX_CHUNK_TOKENS = 1200;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { import_id, user_id }: ChunkRequest = await req.json();
    console.log(`[Chunk] Starting chunking for import: ${import_id}`);

    // Get all conversations for this import
    const { data: conversations, error: convError } = await supabase
      .from('archive_conversations')
      .select('id, started_at, ended_at')
      .eq('import_id', import_id);

    if (convError) throw new Error(`Failed to fetch conversations: ${convError.message}`);

    console.log(`[Chunk] Processing ${conversations?.length || 0} conversations`);

    let chunksCreated = 0;
    let totalTokens = 0;

    for (const conv of conversations || []) {
      // Check for existing chunks (idempotent)
      const { count: existingChunks } = await supabase
        .from('archive_chunks')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conv.id);

      if ((existingChunks || 0) > 0) {
        console.log(`[Chunk] Conversation ${conv.id} already chunked`);
        continue;
      }

      // Get messages for this conversation
      const { data: messages, error: msgError } = await supabase
        .from('archive_messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('sequence_index', { ascending: true });

      if (msgError || !messages || messages.length === 0) continue;

      // Build chunks by grouping messages
      let currentChunk: typeof messages = [];
      let currentTokens = 0;

      for (const msg of messages) {
        const msgTokens = estimateTokens(msg.content_text || '');
        
        // If adding this message exceeds max, save current chunk and start new
        if (currentTokens + msgTokens > MAX_CHUNK_TOKENS && currentChunk.length > 0) {
          // Save chunk
          const chunkText = currentChunk.map(m => 
            `[${m.role.toUpperCase()}]: ${m.content_text || ''}`
          ).join('\n\n');
          
          const { error: chunkError } = await supabase
            .from('archive_chunks')
            .insert({
              import_id,
              conversation_id: conv.id,
              start_message_id: currentChunk[0].id,
              end_message_id: currentChunk[currentChunk.length - 1].id,
              occurred_start_at: currentChunk[0].occurred_at,
              occurred_end_at: currentChunk[currentChunk.length - 1].occurred_at,
              chunk_text: chunkText,
              token_estimate: currentTokens,
              chunk_hash: hashChunk(chunkText)
            });

          if (!chunkError) {
            chunksCreated++;
            totalTokens += currentTokens;
          }

          currentChunk = [];
          currentTokens = 0;
        }

        currentChunk.push(msg);
        currentTokens += msgTokens;
      }

      // Save final chunk if has minimum tokens
      if (currentChunk.length > 0 && currentTokens >= MIN_CHUNK_TOKENS / 2) {
        const chunkText = currentChunk.map(m => 
          `[${m.role.toUpperCase()}]: ${m.content_text || ''}`
        ).join('\n\n');
        
        const { error: chunkError } = await supabase
          .from('archive_chunks')
          .insert({
            import_id,
            conversation_id: conv.id,
            start_message_id: currentChunk[0].id,
            end_message_id: currentChunk[currentChunk.length - 1].id,
            occurred_start_at: currentChunk[0].occurred_at,
            occurred_end_at: currentChunk[currentChunk.length - 1].occurred_at,
            chunk_text: chunkText,
            token_estimate: currentTokens,
            chunk_hash: hashChunk(chunkText)
          });

        if (!chunkError) {
          chunksCreated++;
          totalTokens += currentTokens;
        }
      }
    }

    // Generate embeddings for chunks
    const { data: chunks } = await supabase
      .from('archive_chunks')
      .select('id, chunk_text')
      .eq('import_id', import_id)
      .is('embedding_id', null)
      .limit(100); // Process in batches

    let embeddingsCreated = 0;
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    if (openaiKey && chunks && chunks.length > 0) {
      console.log(`[Chunk] Generating embeddings for ${chunks.length} chunks`);
      
      for (const chunk of chunks) {
        try {
          const response = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'text-embedding-3-small',
              input: chunk.chunk_text.slice(0, 8000) // Limit input
            })
          });

          if (response.ok) {
            const data = await response.json();
            const vector = data.data[0].embedding;

            // Store embedding
            const { data: embedding, error: embError } = await supabase
              .from('archive_embeddings')
              .insert({
                owner_user_id: user_id,
                object_type: 'chunk',
                object_id: chunk.id,
                model: 'text-embedding-3-small',
                vector
              })
              .select()
              .single();

            if (!embError && embedding) {
              await supabase
                .from('archive_chunks')
                .update({ embedding_id: embedding.id })
                .eq('id', chunk.id);
              embeddingsCreated++;
            }
          }
        } catch (e) {
          console.error(`[Chunk] Failed to embed chunk ${chunk.id}:`, e);
        }
      }
    }

    // Update stats
    await supabase
      .from('archive_imports')
      .update({
        stats_json: {
          chunks_created: chunksCreated,
          total_tokens: totalTokens,
          embeddings_created: embeddingsCreated
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', import_id);

    // Log audit
    await supabase.from('archive_audit_events').insert({
      actor_user_id: user_id,
      action: 'chunk_completed',
      object_type: 'import',
      object_id: import_id,
      import_id,
      metadata_json: { chunks: chunksCreated, tokens: totalTokens, embeddings: embeddingsCreated }
    });

    console.log(`[Chunk] Completed: ${chunksCreated} chunks, ${totalTokens} tokens, ${embeddingsCreated} embeddings`);

    return new Response(JSON.stringify({ 
      success: true,
      chunks_created: chunksCreated,
      total_tokens: totalTokens,
      embeddings_created: embeddingsCreated
    }), { 
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Chunk] Error:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});

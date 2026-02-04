import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParseRequest {
  import_id: string;
  user_id: string;
}

interface OpenAIConversation {
  id: string;
  title: string;
  create_time: number;
  update_time: number;
  mapping: Record<string, {
    id: string;
    message?: {
      id: string;
      author: { role: string };
      content: { content_type: string; parts?: string[] };
      create_time?: number;
      metadata?: any;
    };
    parent?: string;
    children?: string[];
  }>;
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

    const { import_id, user_id }: ParseRequest = await req.json();
    console.log(`[Parse] Starting parsing for import: ${import_id}`);

    // Get import files (JSON files specifically)
    const { data: files, error: filesError } = await supabase
      .from('archive_import_files')
      .select('*')
      .eq('import_id', import_id)
      .eq('file_type', 'json');

    if (filesError) throw new Error(`Failed to fetch files: ${filesError.message}`);

    console.log(`[Parse] Found ${files?.length || 0} JSON files`);

    let conversationsCreated = 0;
    let messagesCreated = 0;

    for (const file of files || []) {
      // Look for conversations.json
      if (!file.storage_path.includes('conversations.json')) continue;

      console.log(`[Parse] Processing: ${file.storage_path}`);

      // Download file
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('vault')
        .download(file.storage_path);

      if (downloadError || !fileData) {
        console.error(`[Parse] Failed to download: ${file.storage_path}`);
        continue;
      }

      const jsonText = await fileData.text();
      let conversations: OpenAIConversation[];

      try {
        conversations = JSON.parse(jsonText);
      } catch (e) {
        console.error(`[Parse] Failed to parse JSON: ${file.storage_path}`);
        continue;
      }

      if (!Array.isArray(conversations)) {
        console.log(`[Parse] Not an array, skipping: ${file.storage_path}`);
        continue;
      }

      console.log(`[Parse] Found ${conversations.length} conversations`);

      for (const conv of conversations) {
        // Check if conversation already exists (idempotent)
        const { data: existing } = await supabase
          .from('archive_conversations')
          .select('id')
          .eq('import_id', import_id)
          .eq('external_conversation_key', conv.id)
          .single();

        if (existing) {
          console.log(`[Parse] Conversation already exists: ${conv.id}`);
          continue;
        }

        // Create conversation
        const startedAt = conv.create_time ? new Date(conv.create_time * 1000).toISOString() : null;
        const endedAt = conv.update_time ? new Date(conv.update_time * 1000).toISOString() : null;

        const { data: newConv, error: convError } = await supabase
          .from('archive_conversations')
          .insert({
            import_id,
            external_conversation_key: conv.id,
            title: conv.title || 'Untitled',
            started_at: startedAt,
            ended_at: endedAt
          })
          .select()
          .single();

        if (convError) {
          console.error(`[Parse] Failed to create conversation:`, convError);
          continue;
        }

        conversationsCreated++;

        // Extract messages from mapping
        const messageNodes = Object.values(conv.mapping || {})
          .filter(node => node.message && node.message.content)
          .sort((a, b) => {
            const timeA = a.message?.create_time || 0;
            const timeB = b.message?.create_time || 0;
            return timeA - timeB;
          });

        let sequenceIndex = 0;
        for (const node of messageNodes) {
          const msg = node.message!;
          
          // Determine content type
          let contentType = 'text';
          let contentText = '';
          
          if (msg.content.content_type === 'text' && msg.content.parts) {
            contentText = msg.content.parts.join('\n');
          } else if (msg.content.content_type === 'multimodal_text') {
            contentType = 'mixed';
            contentText = msg.content.parts?.filter((p: any) => typeof p === 'string').join('\n') || '';
          } else {
            contentType = msg.content.content_type || 'other';
          }

          const role = msg.author.role;
          if (!['user', 'assistant', 'system', 'tool'].includes(role)) continue;

          const occurredAt = msg.create_time 
            ? new Date(msg.create_time * 1000).toISOString() 
            : startedAt || new Date().toISOString();

          const { error: msgError } = await supabase
            .from('archive_messages')
            .insert({
              conversation_id: newConv.id,
              external_message_key: msg.id,
              role,
              content_type: contentType,
              content_text: contentText,
              occurred_at: occurredAt,
              sequence_index: sequenceIndex++,
              metadata_json: msg.metadata || {}
            });

          if (!msgError) {
            messagesCreated++;
          }
        }
      }
    }

    // Update stats
    await supabase
      .from('archive_imports')
      .update({
        stats_json: {
          conversations_parsed: conversationsCreated,
          messages_parsed: messagesCreated
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', import_id);

    // Log audit event
    await supabase.from('archive_audit_events').insert({
      actor_user_id: user_id,
      action: 'parse_completed',
      object_type: 'import',
      object_id: import_id,
      import_id,
      metadata_json: { conversations: conversationsCreated, messages: messagesCreated }
    });

    console.log(`[Parse] Completed: ${conversationsCreated} conversations, ${messagesCreated} messages`);

    return new Response(JSON.stringify({ 
      success: true,
      conversations_created: conversationsCreated,
      messages_created: messagesCreated
    }), { 
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Parse] Error:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});

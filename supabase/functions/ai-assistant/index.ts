import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const authHeader = req.headers.get('authorization');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Initialize Supabase client for task creation
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader! } } }
    );

    // Get user from auth header
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
    }

    // Build system prompt based on context
    let systemPrompt = `You are an AI assistant for Biz Dev App, a comprehensive business development platform. You help users with:
- CRM management (contacts, companies, deals)
- Email management and composition
- Business insights and recommendations
- Data migration and integration assistance
- Workflow automation suggestions
- Task management and reminders

IMPORTANT: When users mention tasks, to-dos, reminders, or things they need to do, you should:
1. Acknowledge the task
2. Extract the task details (what needs to be done, priority, deadline if mentioned)
3. The system will automatically create a task for them

Be concise, professional, and actionable. When asked about data, refer to the context provided.`;

    if (context?.type === 'crm') {
      systemPrompt += `\n\nCurrent CRM context: The user is viewing their CRM dashboard with ${context.contacts || 0} contacts, ${context.companies || 0} companies, and ${context.deals || 0} deals.`;
    } else if (context?.type === 'messages') {
      systemPrompt += `\n\nCurrent email context: The user is viewing their unified inbox with ${context.unreadCount || 0} unread messages.`;
    } else if (context?.type === 'integrations') {
      systemPrompt += `\n\nCurrent integrations context: The user is managing their system integrations and connectors.`;
    }

    // Prepare tools for task extraction
    const tools = [
      {
        type: "function",
        function: {
          name: "create_task",
          description: "Create a task when the user mentions something they need to do, remember, or schedule. Use this whenever the user says things like 'I need to', 'remind me to', 'schedule', 'follow up', 'don't forget to', or similar task-related phrases.",
          parameters: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "Brief title for the task"
              },
              description: {
                type: "string",
                description: "Detailed description of what needs to be done"
              },
              priority: {
                type: "string",
                enum: ["low", "medium", "high"],
                description: "Priority level based on urgency and importance"
              },
              due_date: {
                type: "string",
                description: "Due date in ISO format if mentioned, null otherwise"
              },
              activity_type: {
                type: "string",
                enum: ["task", "call", "email", "meeting", "follow_up"],
                description: "Type of activity"
              }
            },
            required: ["title", "priority", "activity_type"],
            additionalProperties: false
          }
        }
      }
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        tools: tools,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    // Stream the response and check for tool calls
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let toolCalls: any[] = [];

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') {
                  controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                  continue;
                }

                try {
                  const parsed = JSON.parse(data);
                  
                  // Check for tool calls
                  const toolCallDelta = parsed.choices?.[0]?.delta?.tool_calls;
                  if (toolCallDelta) {
                    for (const tc of toolCallDelta) {
                      if (tc.index !== undefined) {
                        if (!toolCalls[tc.index]) {
                          toolCalls[tc.index] = {
                            id: tc.id,
                            type: tc.type,
                            function: { name: tc.function?.name || '', arguments: '' }
                          };
                        }
                        if (tc.function?.arguments) {
                          toolCalls[tc.index].function.arguments += tc.function.arguments;
                        }
                      }
                    }
                  }

                  controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
                } catch (e) {
                  // Invalid JSON, skip
                }
              }
            }
          }

          // Process tool calls after streaming
          if (user && toolCalls.length > 0) {
            for (const toolCall of toolCalls) {
              if (toolCall.function.name === 'create_task') {
                try {
                  const args = JSON.parse(toolCall.function.arguments);
                  console.log('Creating task:', args);
                  
                  const { error: insertError } = await supabaseClient
                    .from('crm_activities')
                    .insert({
                      user_id: user.id,
                      subject: args.title,
                      description: args.description || null,
                      activity_type: args.activity_type || 'task',
                      status: 'pending',
                      priority: args.priority || 'medium',
                      due_date: args.due_date || null,
                      tags: ['ai-created']
                    });

                  if (insertError) {
                    console.error('Error creating task:', insertError);
                  } else {
                    console.log('Task created successfully');
                  }
                } catch (e) {
                  console.error('Error parsing tool call arguments:', e);
                }
              }
            }
          }

          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Error in ai-assistant:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

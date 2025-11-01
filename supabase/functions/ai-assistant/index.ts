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
- Activity logging and time tracking
- Email management and composition
- Business insights and recommendations
- Data migration and integration assistance
- Workflow automation suggestions
- Task management and reminders
- Meeting scheduling and calendar management
- Company associations and relationship management

IMPORTANT: 
- When users mention logging activities, time spent, or "log this:", extract the activity details including time, company name, and description.
- When users mention tasks, to-dos, reminders, or things they need to do, you should extract the task details and the system will create a task for them.
- When users want to add companies to CRM or associate companies, extract the company details and association information.
- When users want to schedule meetings or events with specific people, dates, and times, extract the meeting details and the system will create the meeting and send invites.
- For meetings, you can lookup contacts in the CRM by their name to get their email addresses.
- Always confirm when actions are completed successfully.

Be concise, professional, and actionable. When asked about data, refer to the context provided.`;

    if (context?.type === 'crm') {
      systemPrompt += `\n\nCurrent CRM context: The user is viewing their CRM dashboard with ${context.contacts || 0} contacts, ${context.companies || 0} companies, and ${context.deals || 0} deals.`;
    } else if (context?.type === 'messages') {
      systemPrompt += `\n\nCurrent email context: The user is viewing their unified inbox with ${context.unreadCount || 0} unread messages.`;
    } else if (context?.type === 'integrations') {
      systemPrompt += `\n\nCurrent integrations context: The user is managing their system integrations and connectors.`;
    }

    // Prepare tools for task extraction, meeting creation, activity logging, and CRM operations
    const tools = [
      {
        type: "function",
        function: {
          name: "log_activity",
          description: "Log an activity with time tracking when the user mentions logging time, activities, or work done. Use this for phrases like 'log this:', 'I spent X hours', 'worked on', etc.",
          parameters: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "Brief title for the activity"
              },
              description: {
                type: "string",
                description: "Detailed description of what was done"
              },
              duration_hours: {
                type: "number",
                description: "Duration in hours (e.g., 1.5 for 1 hour 30 minutes)"
              },
              company_name: {
                type: "string",
                description: "Name of the company/project this activity relates to"
              },
              activity_type: {
                type: "string",
                enum: ["general", "meeting", "call", "email", "development", "research"],
                description: "Type of activity performed"
              }
            },
            required: ["title", "duration_hours", "activity_type"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_company",
          description: "Add a new company to the CRM when the user wants to add or track a company.",
          parameters: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "Company name"
              },
              website: {
                type: "string",
                description: "Company website URL"
              },
              industry: {
                type: "string",
                description: "Industry or sector"
              },
              notes: {
                type: "string",
                description: "Additional notes about the company"
              }
            },
            required: ["name"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_task",
          description: "Create a task when the user mentions something they need to do, remember, or schedule. Use this whenever the user says things like 'I need to', 'remind me to', 'follow up', 'don't forget to', or similar task-related phrases.",
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
      },
      {
        type: "function",
        function: {
          name: "create_meeting",
          description: "Schedule a meeting when the user wants to set up a meeting with specific people at a specific date and time. Use this when users mention scheduling meetings, setting up calls, or arranging events with attendees.",
          parameters: {
            type: "object",
            properties: {
              subject: {
                type: "string",
                description: "Meeting title/subject"
              },
              description: {
                type: "string",
                description: "Meeting agenda or description"
              },
              start_time: {
                type: "string",
                description: "Meeting start time in ISO 8601 format (e.g., 2025-10-23T18:00:00-05:00)"
              },
              end_time: {
                type: "string",
                description: "Meeting end time in ISO 8601 format"
              },
              attendee_names: {
                type: "array",
                items: { type: "string" },
                description: "Array of attendee names to lookup in CRM"
              },
              location: {
                type: "string",
                description: "Physical location of the meeting (optional)"
              },
              meeting_link: {
                type: "string",
                description: "Virtual meeting link (optional)"
              }
            },
            required: ["subject", "start_time", "end_time", "attendee_names"],
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
                  
                  const { data: taskData, error: insertError } = await supabaseClient
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
                    })
                    .select()
                    .single();

                  if (insertError) {
                    console.error('Error creating task:', insertError);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'task_creation_error', 
                          error: insertError.message 
                        })}\n\n`
                      )
                    );
                  } else {
                    console.log('Task created successfully:', taskData);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'task_created', 
                          task: taskData 
                        })}\n\n`
                      )
                    );
                  }
                } catch (e) {
                  console.error('Error parsing tool call arguments:', e);
                }
              } else if (toolCall.function.name === 'create_meeting') {
                try {
                  const args = JSON.parse(toolCall.function.arguments);
                  console.log('Creating meeting:', args);
                  
                  // Lookup attendees in CRM
                  const attendeeEmails: string[] = [];
                  for (const name of args.attendee_names || []) {
                    const { data: contacts } = await supabaseClient
                      .from('crm_contacts')
                      .select('email')
                      .eq('user_id', user.id)
                      .ilike('name', `%${name}%`)
                      .limit(1);
                    
                    if (contacts && contacts.length > 0 && contacts[0].email) {
                      attendeeEmails.push(contacts[0].email);
                    }
                  }

                  if (attendeeEmails.length === 0) {
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'meeting_creation_error', 
                          error: 'Could not find contact emails in CRM' 
                        })}\n\n`
                      )
                    );
                    continue;
                  }

                  // Create meeting activity
                  const startTime = new Date(args.start_time);
                  const endTime = new Date(args.end_time);
                  
                  const { data: meetingData, error: meetingError } = await supabaseClient
                    .from('crm_activities')
                    .insert({
                      user_id: user.id,
                      subject: args.subject,
                      description: args.description || null,
                      activity_type: 'meeting',
                      status: 'scheduled',
                      priority: 'medium',
                      due_date: startTime.toISOString(),
                      start_time: startTime.toISOString(),
                      end_time: endTime.toISOString(),
                      location: args.location || null,
                      meeting_link: args.meeting_link || null,
                      attendee_emails: attendeeEmails,
                      tags: ['ai-created']
                    })
                    .select()
                    .single();

                  if (meetingError) {
                    console.error('Error creating meeting:', meetingError);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'meeting_creation_error', 
                          error: meetingError.message 
                        })}\n\n`
                      )
                    );
                    continue;
                  }

                  // Get user profile for organizer info
                  const { data: profile } = await supabaseClient
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single();

                  // Send meeting invites
                  const { error: inviteError } = await supabaseClient.functions.invoke('send-meeting-invite', {
                    body: {
                      activityId: meetingData.id,
                      subject: args.subject,
                      description: args.description || '',
                      startTime: startTime.toISOString(),
                      endTime: endTime.toISOString(),
                      location: args.location || '',
                      meetingLink: args.meeting_link || '',
                      organizerEmail: user.email,
                      organizerName: profile?.full_name || user.email,
                      attendeeEmails: attendeeEmails,
                    },
                  });

                  if (inviteError) {
                    console.error('Error sending invites:', inviteError);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'meeting_creation_error', 
                          error: 'Meeting created but failed to send invites' 
                        })}\n\n`
                      )
                    );
                  } else {
                    console.log('Meeting created and invites sent:', meetingData);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'meeting_created', 
                          meeting: meetingData,
                          attendees: attendeeEmails 
                        })}\n\n`
                      )
                    );
                  }
                } catch (e) {
                  console.error('Error creating meeting:', e);
                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify({ 
                        type: 'meeting_creation_error', 
                        error: e instanceof Error ? e.message : 'Unknown error' 
                      })}\n\n`
                    )
                  );
                }
              } else if (toolCall.function.name === 'log_activity') {
                try {
                  const args = JSON.parse(toolCall.function.arguments);
                  console.log('Logging activity:', args);
                  
                  const now = new Date();
                  const startTime = new Date(now.getTime() - (args.duration_hours * 60 * 60 * 1000));
                  
                  const { data: activityData, error: activityError } = await supabaseClient
                    .from('crm_activities')
                    .insert({
                      user_id: user.id,
                      subject: args.title,
                      description: args.description || `Worked on ${args.company_name || 'general activities'}`,
                      activity_type: args.activity_type || 'general',
                      status: 'completed',
                      priority: 'medium',
                      start_time: startTime.toISOString(),
                      end_time: now.toISOString(),
                      tags: args.company_name ? ['ai-created', args.company_name.toLowerCase().replace(/\s+/g, '-')] : ['ai-created']
                    })
                    .select()
                    .single();

                  if (activityError) {
                    console.error('Error logging activity:', activityError);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'activity_log_error', 
                          error: activityError.message 
                        })}\n\n`
                      )
                    );
                  } else {
                    console.log('Activity logged successfully:', activityData);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'activity_logged', 
                          activity: activityData 
                        })}\n\n`
                      )
                    );
                  }
                } catch (e) {
                  console.error('Error logging activity:', e);
                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify({ 
                        type: 'activity_log_error', 
                        error: e instanceof Error ? e.message : 'Unknown error' 
                      })}\n\n`
                    )
                  );
                }
              } else if (toolCall.function.name === 'create_company') {
                try {
                  const args = JSON.parse(toolCall.function.arguments);
                  console.log('Creating company:', args);
                  
                  const { data: companyData, error: companyError } = await supabaseClient
                    .from('crm_companies')
                    .insert({
                      user_id: user.id,
                      name: args.name,
                      website: args.website || null,
                      industry: args.industry || null,
                      description: args.notes || null,
                      tags: ['ai-created']
                    })
                    .select()
                    .single();

                  if (companyError) {
                    console.error('Error creating company:', companyError);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'company_creation_error', 
                          error: companyError.message 
                        })}\n\n`
                      )
                    );
                  } else {
                    console.log('Company created successfully:', companyData);
                    controller.enqueue(
                      new TextEncoder().encode(
                        `data: ${JSON.stringify({ 
                          type: 'company_created', 
                          company: companyData 
                        })}\n\n`
                      )
                    );
                  }
                } catch (e) {
                  console.error('Error creating company:', e);
                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify({ 
                        type: 'company_creation_error', 
                        error: e instanceof Error ? e.message : 'Unknown error' 
                      })}\n\n`
                    )
                  );
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScheduleBlock {
  id: string;
  start_time: string;
  end_time: string;
  title: string;
  type: "task" | "meeting" | "focus" | "break" | "lunch" | "buffer";
  priority?: string;
  task_id?: string;
  activity_id?: string;
  description?: string;
  location?: string;
}

interface GeneratedSchedule {
  date: string;
  blocks: ScheduleBlock[];
  summary: string;
  tips: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error("Invalid user token");
    }

    const { date } = await req.json();
    const targetDate = date || new Date().toISOString().split("T")[0];
    console.log(`Generating schedule for user ${user.id} on ${targetDate}`);

    // Fetch user's scheduling preferences
    const { data: preferences } = await supabase
      .from("user_scheduling_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // Use defaults if no preferences set
    const prefs = preferences || {
      work_start_time: "09:00",
      work_end_time: "17:00",
      work_days: [1, 2, 3, 4, 5],
      lunch_start_time: "12:00",
      lunch_duration_minutes: 60,
      short_break_duration_minutes: 15,
      short_break_frequency_hours: 2,
      peak_energy_time: "morning",
      low_energy_time: "afternoon",
      focus_block_duration_minutes: 90,
      prefer_focus_time_morning: true,
      max_meetings_per_day: 5,
      min_buffer_between_meetings_minutes: 15,
      preferred_task_order: "priority",
      batch_similar_tasks: true,
    };

    // Check if target date is a work day
    const targetDateObj = new Date(targetDate);
    const dayOfWeek = targetDateObj.getDay();
    if (!prefs.work_days.includes(dayOfWeek)) {
      return new Response(
        JSON.stringify({
          schedule: {
            date: targetDate,
            blocks: [],
            summary: "This is not a scheduled work day.",
            tips: ["Enjoy your day off!", "Use this time to recharge."],
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch tasks (incomplete, with or without due dates)
    const { data: tasks } = await supabase
      .from("crm_activities")
      .select("*")
      .eq("user_id", user.id)
      .neq("status", "completed")
      .order("priority", { ascending: false });

    // Fetch calendar events for the target date
    const startOfDay = `${targetDate}T00:00:00`;
    const endOfDay = `${targetDate}T23:59:59`;
    const { data: events } = await supabase
      .from("crm_activities")
      .select("*")
      .eq("user_id", user.id)
      .gte("start_time", startOfDay)
      .lte("start_time", endOfDay);

    console.log(`Found ${tasks?.length || 0} tasks and ${events?.length || 0} events`);

    // Build context for AI
    const taskList = (tasks || [])
      .slice(0, 20) // Limit to top 20 tasks
      .map((t) => ({
        id: t.id,
        title: t.subject,
        description: t.description,
        priority: t.priority,
        type: t.activity_type,
        due_date: t.due_date,
        estimated_minutes: 30, // Default estimate
      }));

    const eventList = (events || []).map((e) => ({
      id: e.id,
      title: e.subject,
      start_time: e.start_time,
      end_time: e.end_time,
      location: e.location,
      type: e.activity_type,
    }));

    // Call Lovable AI to generate schedule
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `You are an intelligent scheduling assistant. Your job is to create an optimized daily schedule based on the user's preferences, tasks, and existing calendar events.

USER PREFERENCES:
- Work hours: ${prefs.work_start_time} to ${prefs.work_end_time}
- Lunch: ${prefs.lunch_start_time} for ${prefs.lunch_duration_minutes} minutes
- Short breaks: ${prefs.short_break_duration_minutes} minutes every ${prefs.short_break_frequency_hours} hours
- Peak energy: ${prefs.peak_energy_time} (schedule demanding tasks here)
- Low energy: ${prefs.low_energy_time} (schedule easier tasks here)
- Focus blocks: ${prefs.focus_block_duration_minutes} minutes, prefer morning: ${prefs.prefer_focus_time_morning}
- Max meetings per day: ${prefs.max_meetings_per_day}
- Buffer between meetings: ${prefs.min_buffer_between_meetings_minutes} minutes
- Task order preference: ${prefs.preferred_task_order}
- Batch similar tasks: ${prefs.batch_similar_tasks}

SCHEDULING BEST PRACTICES:
1. Schedule high-priority and cognitively demanding tasks during peak energy time
2. Group similar tasks together for efficiency (context switching is costly)
3. Add buffer time before and after meetings
4. Include short breaks every 2 hours to maintain productivity
5. Protect focus time blocks - no meetings during these
6. Schedule admin/email tasks during low energy periods
7. Leave some flexibility for unexpected items
8. Don't overschedule - aim for 70% utilization

EXISTING CALENDAR EVENTS (fixed, cannot move):
${JSON.stringify(eventList, null, 2)}

TASKS TO SCHEDULE:
${JSON.stringify(taskList, null, 2)}

Generate a realistic, optimized schedule for ${targetDate}.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Create an optimized schedule for ${targetDate}. Return a JSON object with the schedule.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_schedule",
              description: "Create an optimized daily schedule with time blocks",
              parameters: {
                type: "object",
                properties: {
                  blocks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", description: "Unique block ID" },
                        start_time: { type: "string", description: "Start time in HH:MM format" },
                        end_time: { type: "string", description: "End time in HH:MM format" },
                        title: { type: "string", description: "Block title/name" },
                        type: {
                          type: "string",
                          enum: ["task", "meeting", "focus", "break", "lunch", "buffer"],
                        },
                        priority: { type: "string", enum: ["high", "medium", "low"] },
                        task_id: { type: "string", description: "Associated task ID if applicable" },
                        description: { type: "string" },
                      },
                      required: ["id", "start_time", "end_time", "title", "type"],
                    },
                  },
                  summary: { type: "string", description: "Brief summary of the day's schedule" },
                  tips: {
                    type: "array",
                    items: { type: "string" },
                    description: "Productivity tips for the day",
                  },
                },
                required: ["blocks", "summary", "tips"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_schedule" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("AI response received");

    // Extract schedule from tool call
    let schedule: GeneratedSchedule = {
      date: targetDate,
      blocks: [],
      summary: "Schedule generated",
      tips: [],
    };

    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        schedule = {
          date: targetDate,
          blocks: args.blocks || [],
          summary: args.summary || "Your optimized schedule for the day",
          tips: args.tips || [],
        };
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
      }
    }

    // Store generated schedule
    await supabase.from("generated_schedules").upsert({
      user_id: user.id,
      date: targetDate,
      schedule_data: schedule,
      created_at: new Date().toISOString(),
    }, { onConflict: "user_id,date" }).select();

    console.log(`Schedule generated with ${schedule.blocks.length} blocks`);

    return new Response(
      JSON.stringify({ schedule }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating schedule:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate schedule";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

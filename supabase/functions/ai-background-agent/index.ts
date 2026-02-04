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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date();
    console.log('Running AI background agent tasks at:', now.toISOString());

    // 1. Process scheduled agent tasks
    const { data: pendingTasks, error: tasksError } = await supabaseClient
      .from('ai_agent_tasks')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', now.toISOString())
      .limit(20);

    if (tasksError) {
      console.error('Error fetching pending tasks:', tasksError);
    } else {
      console.log(`Found ${pendingTasks?.length || 0} pending agent tasks`);
      
      for (const task of pendingTasks || []) {
        try {
          // Mark as running
          await supabaseClient
            .from('ai_agent_tasks')
            .update({ status: 'running' })
            .eq('id', task.id);

          // Execute task based on type
          let result: any = null;
          
          switch (task.task_type) {
            case 'deal_follow_up':
              result = await processFollowUp(supabaseClient, task);
              break;
            case 'stale_deal_check':
              result = await checkStaleDealsl(supabaseClient, task);
              break;
            case 'pipeline_analysis':
              result = await analyzePipeline(supabaseClient, task);
              break;
            case 'activity_reminder':
              result = await sendActivityReminder(supabaseClient, task);
              break;
            default:
              result = { message: 'Unknown task type' };
          }

          // Mark as completed
          await supabaseClient
            .from('ai_agent_tasks')
            .update({ 
              status: 'completed', 
              executed_at: new Date().toISOString(),
              result 
            })
            .eq('id', task.id);

        } catch (taskError: unknown) {
          const errorMessage = taskError instanceof Error ? taskError.message : 'Unknown error';
          console.error(`Error executing task ${task.id}:`, taskError);
          await supabaseClient
            .from('ai_agent_tasks')
            .update({ 
              status: 'failed', 
              error_message: errorMessage 
            })
            .eq('id', task.id);
        }
      }
    }

    // 2. Proactive insights generation - check for stale deals
    const staleThreshold = new Date();
    staleThreshold.setDate(staleThreshold.getDate() - 7); // Deals not updated in 7 days

    const { data: staleDeals } = await supabaseClient
      .from('crm_deals')
      .select('id, title, value, stage, user_id, updated_at')
      .lt('updated_at', staleThreshold.toISOString())
      .not('stage', 'in', '("closed_won","closed_lost")')
      .limit(50);

    if (staleDeals && staleDeals.length > 0) {
      // Group by user
      const dealsByUser: Record<string, typeof staleDeals> = {};
      for (const deal of staleDeals) {
        if (!dealsByUser[deal.user_id]) {
          dealsByUser[deal.user_id] = [];
        }
        dealsByUser[deal.user_id].push(deal);
      }

      // Create proactive notifications
      for (const [userId, userDeals] of Object.entries(dealsByUser)) {
        // Check if we already notified recently
        const { data: recentNotif } = await supabaseClient
          .from('ai_proactive_notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('notification_type', 'stale_deals')
          .gte('created_at', staleThreshold.toISOString())
          .limit(1);

        if (!recentNotif?.length) {
          const totalValue = userDeals.reduce((sum, d) => sum + (d.value || 0), 0);
          
          await supabaseClient
            .from('ai_proactive_notifications')
            .insert({
              user_id: userId,
              notification_type: 'stale_deals',
              title: `${userDeals.length} deals need attention`,
              message: `You have ${userDeals.length} deal(s) worth $${totalValue.toLocaleString()} that haven't been updated in over a week. Would you like me to draft follow-ups?`,
              priority: totalValue > 100000 ? 'high' : 'normal',
              action_type: 'open_chat',
              action_payload: { 
                prefill: `Help me follow up on my stale deals: ${userDeals.map(d => d.title).join(', ')}` 
              }
            });
        }
      }
    }

    // 3. Task completion reminders
    const overdueTasks = new Date();
    overdueTasks.setHours(overdueTasks.getHours() - 24);

    const { data: overdue } = await supabaseClient
      .from('crm_activities')
      .select('id, subject, due_date, user_id, activity_type')
      .eq('status', 'pending')
      .lt('due_date', now.toISOString())
      .gt('due_date', overdueTasks.toISOString())
      .limit(50);

    if (overdue && overdue.length > 0) {
      const tasksByUser: Record<string, typeof overdue> = {};
      for (const task of overdue) {
        if (!tasksByUser[task.user_id]) {
          tasksByUser[task.user_id] = [];
        }
        tasksByUser[task.user_id].push(task);
      }

      for (const [userId, userTasks] of Object.entries(tasksByUser)) {
        const { data: recentNotif } = await supabaseClient
          .from('ai_proactive_notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('notification_type', 'overdue_tasks')
          .gte('created_at', overdueTasks.toISOString())
          .limit(1);

        if (!recentNotif?.length) {
          await supabaseClient
            .from('ai_proactive_notifications')
            .insert({
              user_id: userId,
              notification_type: 'overdue_tasks',
              title: `${userTasks.length} overdue task(s)`,
              message: `You have ${userTasks.length} task(s) past their due date. Top priority: "${userTasks[0].subject}"`,
              priority: userTasks.length > 3 ? 'high' : 'normal',
              action_type: 'navigate',
              action_payload: { path: '/tasks' }
            });
        }
      }
    }

    // 4. Cross-module intelligence - find related entities
    await discoverCrossModuleLinks(supabaseClient);

    // 5. Mine success patterns
    await mineSuccessPatterns(supabaseClient);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed_tasks: pendingTasks?.length || 0,
        stale_deals_flagged: staleDeals?.length || 0,
        overdue_tasks_flagged: overdue?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in AI background agent:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processFollowUp(supabase: any, task: any) {
  const { data: deal } = await supabase
    .from('crm_deals')
    .select('*')
    .eq('id', task.context?.deal_id)
    .single();

  if (deal) {
    await supabase
      .from('ai_proactive_notifications')
      .insert({
        user_id: task.user_id,
        notification_type: 'follow_up_reminder',
        title: `Follow up on: ${deal.title}`,
        message: `Scheduled reminder to follow up on this deal. Current stage: ${deal.stage}`,
        priority: deal.value > 50000 ? 'high' : 'normal',
        action_type: 'navigate',
        action_payload: { path: `/crm/deals/${deal.id}` }
      });
  }

  return { dealt_with: deal?.id };
}

async function checkStaleDealsl(supabase: any, task: any) {
  // Already handled in main function
  return { checked: true };
}

async function analyzePipeline(supabase: any, task: any) {
  const { data: deals } = await supabase
    .from('crm_deals')
    .select('stage, value')
    .eq('user_id', task.user_id)
    .not('stage', 'in', '("closed_won","closed_lost")');

  if (deals && deals.length > 0) {
    const byStage: Record<string, { count: number; value: number }> = {};
    for (const deal of deals) {
      if (!byStage[deal.stage]) {
        byStage[deal.stage] = { count: 0, value: 0 };
      }
      byStage[deal.stage].count++;
      byStage[deal.stage].value += deal.value || 0;
    }

    const totalValue = deals.reduce((s: number, d: any) => s + (d.value || 0), 0);
    const topStage = Object.entries(byStage).sort((a, b) => b[1].value - a[1].value)[0];

    await supabase
      .from('ai_proactive_notifications')
      .insert({
        user_id: task.user_id,
        notification_type: 'pipeline_insight',
        title: 'Pipeline Analysis Complete',
        message: `Your pipeline has $${totalValue.toLocaleString()} across ${deals.length} deals. Most value is in ${topStage[0]} stage.`,
        priority: 'normal'
      });

    return { stages: byStage, total_value: totalValue };
  }

  return { deals: 0 };
}

async function sendActivityReminder(supabase: any, task: any) {
  await supabase
    .from('ai_proactive_notifications')
    .insert({
      user_id: task.user_id,
      notification_type: 'activity_reminder',
      title: task.context?.title || 'Reminder',
      message: task.context?.message || task.task_description,
      priority: 'normal'
    });

  return { sent: true };
}

async function discoverCrossModuleLinks(supabase: any) {
  // Find companies mentioned in deal rooms that aren't linked
  const { data: dealRooms } = await supabase
    .from('deal_rooms')
    .select('id, name, description, user_id')
    .limit(100);

  for (const room of dealRooms || []) {
    const searchTerms = room.name?.toLowerCase().split(' ').filter((w: string) => w.length > 3) || [];
    
    for (const term of searchTerms) {
      const { data: companies } = await supabase
        .from('crm_companies')
        .select('id, name')
        .eq('user_id', room.user_id)
        .ilike('name', `%${term}%`)
        .limit(3);

      for (const company of companies || []) {
        // Check if link already exists
        const { data: existingLink } = await supabase
          .from('ai_cross_module_links')
          .select('id')
          .eq('source_module', 'deal_rooms')
          .eq('source_entity_id', room.id)
          .eq('target_module', 'crm_companies')
          .eq('target_entity_id', company.id)
          .limit(1);

        if (!existingLink?.length) {
          await supabase
            .from('ai_cross_module_links')
            .insert({
              source_module: 'deal_rooms',
              source_entity_id: room.id,
              target_module: 'crm_companies',
              target_entity_id: company.id,
              link_type: 'name_match',
              confidence_score: 0.6,
              metadata: { matched_term: term }
            });
        }
      }
    }
  }
}

async function mineSuccessPatterns(supabase: any) {
  // Find users with high deal close rates
  const { data: dealStats } = await supabase.rpc('get_user_deal_stats');
  
  if (!dealStats) return;

  // For now, create patterns based on high performers
  const highPerformers = dealStats.filter((u: any) => u.close_rate > 0.5 && u.total_deals > 5);

  for (const performer of highPerformers) {
    // Analyze their activity patterns
    const { data: activities } = await supabase
      .from('crm_activities')
      .select('activity_type, status, created_at')
      .eq('user_id', performer.user_id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(100);

    if (activities && activities.length > 0) {
      const typeCounts: Record<string, number> = {};
      for (const act of activities) {
        typeCounts[act.activity_type] = (typeCounts[act.activity_type] || 0) + 1;
      }

      const topActivity = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
      
      if (topActivity) {
        // Check if pattern already exists
        const { data: existing } = await supabase
          .from('ai_success_patterns')
          .select('id')
          .eq('pattern_type', 'activity_focus')
          .eq('pattern_name', `High ${topActivity[0]} performers`)
          .limit(1);

        if (!existing?.length) {
          await supabase
            .from('ai_success_patterns')
            .insert({
              pattern_type: 'activity_focus',
              pattern_name: `High ${topActivity[0]} performers`,
              pattern_description: `Users who focus on ${topActivity[0]} activities tend to have higher close rates`,
              pattern_rules: { primary_activity: topActivity[0], min_frequency: topActivity[1] / 4 },
              source_user_count: 1,
              success_rate: performer.close_rate * 100,
              applicable_contexts: ['deal_management', 'activity_planning']
            });
        }
      }
    }
  }
}

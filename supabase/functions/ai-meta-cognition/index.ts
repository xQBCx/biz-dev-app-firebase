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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Running AI meta-cognition analysis...');

    // 1. Analyze conversation feedback to find improvement areas
    const { data: negativeFeedback } = await supabaseClient
      .from('ai_message_feedback')
      .select(`
        id,
        feedback_type,
        feedback_reason,
        message_id,
        created_at,
        ai_messages!inner (
          content,
          role,
          conversation_id
        )
      `)
      .eq('feedback_type', 'negative')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(50);

    // Group negative feedback by patterns
    const feedbackPatterns: Record<string, string[]> = {};
    
    for (const fb of negativeFeedback || []) {
      const content = (fb as any).ai_messages?.content?.toLowerCase() || '';
      
      // Categorize based on content analysis
      if (content.includes('search') || content.includes('found')) {
        feedbackPatterns['search_accuracy'] = feedbackPatterns['search_accuracy'] || [];
        feedbackPatterns['search_accuracy'].push(content.slice(0, 200));
      } else if (content.includes('navigate') || content.includes('go to')) {
        feedbackPatterns['navigation'] = feedbackPatterns['navigation'] || [];
        feedbackPatterns['navigation'].push(content.slice(0, 200));
      } else if (content.includes('create') || content.includes('add')) {
        feedbackPatterns['entity_creation'] = feedbackPatterns['entity_creation'] || [];
        feedbackPatterns['entity_creation'].push(content.slice(0, 200));
      } else {
        feedbackPatterns['general'] = feedbackPatterns['general'] || [];
        feedbackPatterns['general'].push(content.slice(0, 200));
      }
    }

    // 2. Generate improvement insights using AI
    if (LOVABLE_API_KEY && Object.keys(feedbackPatterns).length > 0) {
      const analysisPrompt = `Analyze this AI assistant feedback and suggest improvements:

${Object.entries(feedbackPatterns).map(([category, examples]) => 
  `## ${category} (${examples.length} negative feedback instances)
${examples.slice(0, 3).map(e => `- "${e}"`).join('\n')}`
).join('\n\n')}

For each category, provide:
1. What the AI is doing wrong
2. Specific improvement suggestion
3. Confidence level (0-1)

Respond in JSON format:
{
  "improvements": [
    {
      "category": "string",
      "issue": "string",
      "suggestion": "string",
      "confidence": number
    }
  ]
}`;

      try {
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'You are an AI improvement analyst. Analyze feedback and suggest improvements. Always respond with valid JSON.' },
              { role: 'user', content: analysisPrompt }
            ],
            response_format: { type: 'json_object' }
          }),
        });

        if (aiResponse.ok) {
          const result = await aiResponse.json();
          const content = result.choices?.[0]?.message?.content;
          
          if (content) {
            try {
              const improvements = JSON.parse(content);
              
              for (const imp of improvements.improvements || []) {
                await supabaseClient
                  .from('ai_system_improvements')
                  .insert({
                    improvement_type: 'feedback_analysis',
                    category: imp.category,
                    insight: `${imp.issue}\n\nSuggested fix: ${imp.suggestion}`,
                    confidence_score: Math.min(1, Math.max(0, imp.confidence)),
                    metadata: { 
                      source: 'meta_cognition',
                      feedback_count: feedbackPatterns[imp.category]?.length || 0
                    }
                  });
              }
            } catch (parseError) {
              console.error('Error parsing AI response:', parseError);
            }
          }
        }
      } catch (aiError) {
        console.error('AI analysis error:', aiError);
      }
    }

    // 3. Analyze tool usage patterns
    const { data: messages } = await supabaseClient
      .from('ai_messages')
      .select('tool_calls, tool_results, created_at')
      .not('tool_calls', 'is', null)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(500);

    const toolUsage: Record<string, { calls: number; errors: number }> = {};
    
    for (const msg of messages || []) {
      const toolCalls = msg.tool_calls as any[];
      const toolResults = msg.tool_results as any[];
      
      for (let i = 0; i < (toolCalls?.length || 0); i++) {
        const toolName = toolCalls[i]?.function?.name || 'unknown';
        if (!toolUsage[toolName]) {
          toolUsage[toolName] = { calls: 0, errors: 0 };
        }
        toolUsage[toolName].calls++;
        
        // Check if this tool had an error
        const result = toolResults?.[i];
        if (result && (result.error || result.status === 'error')) {
          toolUsage[toolName].errors++;
        }
      }
    }

    // Find tools with high error rates
    for (const [tool, stats] of Object.entries(toolUsage)) {
      const errorRate = stats.calls > 0 ? stats.errors / stats.calls : 0;
      
      if (errorRate > 0.2 && stats.calls > 5) {
        await supabaseClient
          .from('ai_system_improvements')
          .insert({
            improvement_type: 'tool_reliability',
            category: tool,
            insight: `Tool "${tool}" has a ${(errorRate * 100).toFixed(1)}% error rate (${stats.errors}/${stats.calls} calls). Consider reviewing error handling or parameters.`,
            confidence_score: Math.min(0.9, errorRate),
            metadata: { tool, calls: stats.calls, errors: stats.errors, error_rate: errorRate }
          });
      }
    }

    // 4. Track learning effectiveness
    const { data: learnings } = await supabaseClient
      .from('ai_learnings')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(20);

    // Record insights about highly-used learnings
    for (const learning of learnings || []) {
      if (learning.usage_count > 10 && learning.confidence > 0.7) {
        // This learning is working well, mark it as a success pattern
        const { data: existing } = await supabaseClient
          .from('ai_success_patterns')
          .select('id')
          .eq('pattern_name', `Learning: ${learning.pattern?.slice(0, 50)}`)
          .limit(1);

        if (!existing?.length) {
          await supabaseClient
            .from('ai_success_patterns')
            .insert({
              pattern_type: 'learned_behavior',
              pattern_name: `Learning: ${learning.pattern?.slice(0, 50)}`,
              pattern_description: `Successfully learned: When user says "${learning.pattern}", respond with: ${learning.resolution}`,
              pattern_rules: { pattern: learning.pattern, resolution: learning.resolution },
              success_rate: learning.confidence * 100,
              applicable_contexts: [learning.category || 'general']
            });
        }
      }
    }

    // 5. Outcome tracking analysis
    const { data: outcomes } = await supabaseClient
      .from('ai_outcome_tracking')
      .select('*')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const outcomeStats: Record<string, { suggested: number; executed: number; successful: number }> = {};
    
    for (const outcome of outcomes || []) {
      const actionType = outcome.action_type;
      if (!outcomeStats[actionType]) {
        outcomeStats[actionType] = { suggested: 0, executed: 0, successful: 0 };
      }
      outcomeStats[actionType].suggested++;
      if (outcome.was_executed) {
        outcomeStats[actionType].executed++;
        if (outcome.outcome_success) {
          outcomeStats[actionType].successful++;
        }
      }
    }

    // Find actions with low adoption or success
    for (const [action, stats] of Object.entries(outcomeStats)) {
      const adoptionRate = stats.suggested > 0 ? stats.executed / stats.suggested : 0;
      const successRate = stats.executed > 0 ? stats.successful / stats.executed : 0;
      
      if (stats.suggested > 5 && adoptionRate < 0.3) {
        await supabaseClient
          .from('ai_system_improvements')
          .insert({
            improvement_type: 'action_adoption',
            category: action,
            insight: `Action "${action}" has only ${(adoptionRate * 100).toFixed(1)}% adoption rate. Users may not find these suggestions useful or actionable.`,
            confidence_score: 0.7,
            metadata: { action, stats }
          });
      }
      
      if (stats.executed > 5 && successRate < 0.5) {
        await supabaseClient
          .from('ai_system_improvements')
          .insert({
            improvement_type: 'action_effectiveness',
            category: action,
            insight: `Action "${action}" has only ${(successRate * 100).toFixed(1)}% success rate when executed. The suggested approach may need refinement.`,
            confidence_score: 0.8,
            metadata: { action, stats }
          });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        feedback_patterns: Object.keys(feedbackPatterns).length,
        tool_usage_analyzed: Object.keys(toolUsage).length,
        learnings_reviewed: learnings?.length || 0,
        outcomes_analyzed: outcomes?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in AI meta-cognition:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

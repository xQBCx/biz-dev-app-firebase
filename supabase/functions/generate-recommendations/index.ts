import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserEmbedding {
  behavior_vector: number[];
  module_vectors: Record<string, number[]>;
  behavioral_traits: Record<string, number>;
  action_sequence_signature: number[];
}

interface UserStats {
  navigation_count: number;
  interaction_count: number;
  transaction_count: number;
  communication_count: number;
  content_count: number;
  workflow_count: number;
  search_count: number;
  total_transaction_value: number;
}

interface RecentEvent {
  category: string;
  module: string;
  action: string;
  entity_type: string | null;
  created_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { user_id } = await req.json();
    
    if (!user_id) {
      throw new Error('user_id is required');
    }

    console.log(`[generate-recommendations] Starting for user ${user_id}`);

    // Fetch user embedding
    const { data: embedding } = await supabase
      .from('instincts_user_embedding')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    // Fetch user stats
    const { data: stats } = await supabase
      .from('instincts_user_stats')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    // Fetch recent events (last 50)
    const { data: recentEvents } = await supabase
      .from('instincts_events')
      .select('category, module, action, entity_type, created_at')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(50);

    // Fetch graph edges (user's relationships)
    const { data: graphEdges } = await supabase
      .from('instincts_graph_edges')
      .select('target_type, target_id, edge_type, weight, interaction_count')
      .eq('source_type', 'user')
      .eq('source_id', user_id)
      .order('weight', { ascending: false })
      .limit(20);

    // Build context for AI
    const context = buildContext(embedding, stats, recentEvents || [], graphEdges || []);

    // Generate recommendations using AI
    const recommendations = await generateWithAI(context, lovableApiKey);

    // Clear old recommendations for this user
    await supabase
      .from('instincts_recommendations')
      .delete()
      .eq('user_id', user_id)
      .eq('is_dismissed', false)
      .eq('is_completed', false);

    // Insert new recommendations
    if (recommendations.length > 0) {
      const toInsert = recommendations.map((rec: any, index: number) => ({
        user_id,
        recommendation_type: rec.type,
        title: rec.title,
        description: rec.description,
        reason: rec.reason,
        priority_score: rec.priority || (recommendations.length - index),
        action_path: rec.action_path,
        entity_type: rec.entity_type || null,
        metadata: rec.metadata || {},
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      }));

      await supabase.from('instincts_recommendations').insert(toInsert);
    }

    console.log(`[generate-recommendations] Generated ${recommendations.length} recommendations`);

    return new Response(
      JSON.stringify({ success: true, count: recommendations.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[generate-recommendations] Error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildContext(
  embedding: any,
  stats: UserStats | null,
  recentEvents: RecentEvent[],
  graphEdges: any[]
): string {
  const parts: string[] = [];

  // Behavioral traits
  if (embedding?.behavioral_traits) {
    const traits = embedding.behavioral_traits as Record<string, number>;
    const topTraits = Object.entries(traits)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k, v]) => `${k}: ${(v * 100).toFixed(0)}%`);
    parts.push(`User behavioral traits: ${topTraits.join(', ')}`);
  }

  // Module preferences
  if (embedding?.module_vectors) {
    const modules = Object.keys(embedding.module_vectors);
    parts.push(`Active modules: ${modules.join(', ')}`);
  }

  // Activity stats
  if (stats) {
    parts.push(`Activity summary: ${stats.navigation_count} navigations, ${stats.interaction_count} interactions, ${stats.transaction_count} transactions, ${stats.communication_count} communications`);
    if (stats.total_transaction_value > 0) {
      parts.push(`Total transaction value: $${stats.total_transaction_value.toFixed(2)}`);
    }
  }

  // Recent activity patterns
  if (recentEvents.length > 0) {
    const moduleCounts: Record<string, number> = {};
    const actionCounts: Record<string, number> = {};
    
    for (const event of recentEvents) {
      moduleCounts[event.module] = (moduleCounts[event.module] || 0) + 1;
      actionCounts[event.action] = (actionCounts[event.action] || 0) + 1;
    }

    const topModules = Object.entries(moduleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([m]) => m);
    
    const topActions = Object.entries(actionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([a]) => a);

    parts.push(`Recent focus modules: ${topModules.join(', ')}`);
    parts.push(`Common actions: ${topActions.join(', ')}`);
  }

  // Relationship graph
  if (graphEdges.length > 0) {
    const entityTypes = [...new Set(graphEdges.map(e => e.target_type))];
    parts.push(`Connected entity types: ${entityTypes.join(', ')}`);
    parts.push(`Total connections: ${graphEdges.length}`);
  }

  return parts.join('\n');
}

async function generateWithAI(context: string, apiKey: string | undefined): Promise<any[]> {
  if (!apiKey) {
    console.log('[generate-recommendations] No API key, using fallback recommendations');
    return getFallbackRecommendations(context);
  }

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a business intelligence assistant analyzing user behavior to generate personalized recommendations.
Based on the user's activity patterns, suggest 3-5 actionable recommendations.

Available recommendation types:
- workflow: Suggest a workflow or automation to improve efficiency
- agent: Suggest using an AI agent or tool
- action: Suggest a specific action to take
- module: Suggest exploring a feature or module they haven't used
- entity: Suggest following up with a specific type of entity (company, deal, contact)

Available modules/routes:
- /dashboard - Main dashboard
- /crm - Customer relationship management
- /tasks - Task management
- /calendar - Calendar and scheduling
- /messages - Communications
- /clients - Client management
- /social - Social media management
- /marketplace - Marketplace
- /tools - Business tools
- /portfolio - Portfolio management
- /franchises - Franchise opportunities
- /integrations - Integrations

Respond with a JSON array of recommendations.`
          },
          {
            role: 'user',
            content: `Based on this user's behavior profile, generate personalized recommendations:\n\n${context}`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_recommendations',
              description: 'Generate personalized recommendations based on user behavior',
              parameters: {
                type: 'object',
                properties: {
                  recommendations: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        type: { type: 'string', enum: ['workflow', 'agent', 'action', 'module', 'entity'] },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        reason: { type: 'string' },
                        action_path: { type: 'string' },
                        priority: { type: 'number' }
                      },
                      required: ['type', 'title', 'description', 'reason']
                    }
                  }
                },
                required: ['recommendations']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_recommendations' } }
      }),
    });

    if (!response.ok) {
      console.error('[generate-recommendations] AI gateway error:', response.status);
      return getFallbackRecommendations(context);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return parsed.recommendations || [];
    }

    return getFallbackRecommendations(context);
  } catch (error) {
    console.error('[generate-recommendations] AI error:', error);
    return getFallbackRecommendations(context);
  }
}

function getFallbackRecommendations(context: string): any[] {
  // Parse context to determine useful fallbacks
  const hasLowActivity = context.includes('0 interactions');
  const hasCRM = context.includes('crm');
  const hasTasks = context.includes('tasks');
  
  const recommendations = [];

  if (hasLowActivity) {
    recommendations.push({
      type: 'module',
      title: 'Explore the Dashboard',
      description: 'Get an overview of your business metrics and activity',
      reason: 'You haven\'t explored much yet - start with the dashboard',
      action_path: '/dashboard',
      priority: 10
    });
  }

  if (!hasCRM) {
    recommendations.push({
      type: 'module',
      title: 'Set up your CRM',
      description: 'Track your contacts, companies, and deals in one place',
      reason: 'CRM helps you manage relationships and close more deals',
      action_path: '/crm',
      priority: 9
    });
  }

  if (!hasTasks) {
    recommendations.push({
      type: 'module',
      title: 'Organize your Tasks',
      description: 'Keep track of your to-dos and stay productive',
      reason: 'Task management helps you stay focused and meet deadlines',
      action_path: '/tasks',
      priority: 8
    });
  }

  recommendations.push({
    type: 'workflow',
    title: 'Connect your Calendar',
    description: 'Sync your calendar to manage meetings and deadlines',
    reason: 'Calendar integration helps you stay on schedule',
    action_path: '/calendar',
    priority: 7
  });

  return recommendations.slice(0, 5);
}

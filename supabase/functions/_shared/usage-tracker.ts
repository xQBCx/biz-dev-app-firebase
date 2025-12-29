/**
 * AI Usage Tracker - Centralized tracking for all AI operations
 */

export interface UsageData {
  userId: string;
  businessId?: string;
  model: string;
  tier: string;
  tokensInput: number;
  tokensOutput: number;
  estimatedCost: number;
  feature: string;
  metadata?: Record<string, any>;
}

/**
 * Track AI usage in both platform_usage_logs and ai_model_usage tables
 */
export async function trackAIUsage(
  supabase: any,
  data: UsageData
) {
  const totalTokens = data.tokensInput + data.tokensOutput;
  const today = new Date().toISOString().split('T')[0];

  try {
    // Log to platform_usage_logs
    if (data.businessId) {
      await supabase.rpc('log_platform_usage', {
        p_user_id: data.userId,
        p_business_id: data.businessId,
        p_resource_type: 'ai_tokens',
        p_resource_subtype: data.model,
        p_quantity: totalTokens,
        p_unit: 'tokens',
        p_cost_usd: data.estimatedCost,
        p_metadata: {
          feature: data.feature,
          tier: data.tier,
          tokens_input: data.tokensInput,
          tokens_output: data.tokensOutput,
          ...data.metadata
        }
      });
    }

    // Upsert to ai_model_usage for aggregation
    const { data: existing } = await supabase
      .from('ai_model_usage')
      .select('id, tokens_input, tokens_output, requests_count, total_cost')
      .eq('model_name', data.model)
      .eq('usage_date', today)
      .single();

    if (existing) {
      await supabase
        .from('ai_model_usage')
        .update({
          tokens_input: (existing.tokens_input || 0) + data.tokensInput,
          tokens_output: (existing.tokens_output || 0) + data.tokensOutput,
          requests_count: (existing.requests_count || 0) + 1,
          total_cost: (existing.total_cost || 0) + data.estimatedCost
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('ai_model_usage')
        .insert({
          model_name: data.model,
          model_provider: data.model.split('/')[0] || 'unknown',
          tokens_input: data.tokensInput,
          tokens_output: data.tokensOutput,
          requests_count: 1,
          total_cost: data.estimatedCost,
          usage_date: today,
          metadata: {
            feature: data.feature,
            tier: data.tier
          }
        });
    }

    return { success: true };
  } catch (error) {
    console.error('Error tracking AI usage:', error);
    return { success: false, error };
  }
}

/**
 * Get user's daily usage for rate limiting / budget checks
 */
export async function getUserDailyUsage(
  supabase: any,
  userId: string
) {
  const today = new Date().toISOString().split('T')[0];
  const startOfDay = `${today}T00:00:00.000Z`;

  try {
    const { data, error } = await supabase
      .from('platform_usage_logs')
      .select('quantity, estimated_cost_usd')
      .eq('user_id', userId)
      .eq('resource_type', 'ai_tokens')
      .gte('created_at', startOfDay);

    if (error) throw error;

    const rows = data || [];
    const totalTokens = rows.reduce((sum: number, row: any) => sum + (row.quantity || 0), 0);
    const totalCost = rows.reduce((sum: number, row: any) => sum + (row.estimated_cost_usd || 0), 0);

    return { totalTokens, totalCost, requestCount: rows.length };
  } catch (error) {
    console.error('Error getting user daily usage:', error);
    return { totalTokens: 0, totalCost: 0, requestCount: 0 };
  }
}

/**
 * Check if user is within budget limits
 */
export async function checkBudgetLimits(
  supabase: any,
  userId: string,
  limits: { dailyCostLimit?: number; dailyRequestLimit?: number } = {}
) {
  const { dailyCostLimit = 1.0, dailyRequestLimit = 100 } = limits;
  const usage = await getUserDailyUsage(supabase, userId);

  return {
    withinBudget: usage.totalCost < dailyCostLimit && usage.requestCount < dailyRequestLimit,
    usage,
    limits: { dailyCostLimit, dailyRequestLimit },
    percentUsed: {
      cost: (usage.totalCost / dailyCostLimit) * 100,
      requests: (usage.requestCount / dailyRequestLimit) * 100
    }
  };
}

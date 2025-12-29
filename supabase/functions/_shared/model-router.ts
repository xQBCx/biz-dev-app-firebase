/**
 * AI Model Router - Smart model selection for cost optimization
 * 
 * Model Tiers:
 * - Nano: Flash-lite - Classification, simple extraction, routing ($0.0001/1K)
 * - Fast: Flash - General Q&A, summaries, translations ($0.0003/1K)
 * - Pro: Pro - Complex reasoning, tool calling, research ($0.003/1K)
 * - Premium: Gemini 3 Pro - Critical decisions, business generation ($0.006/1K)
 */

export type ModelTier = 'nano' | 'fast' | 'pro' | 'premium';

export type TaskType = 
  | 'classification' 
  | 'extraction' 
  | 'routing' 
  | 'summary' 
  | 'translation' 
  | 'general_qa' 
  | 'content_generation'
  | 'complex_reasoning' 
  | 'tool_calling' 
  | 'research'
  | 'erp_generation'
  | 'website_generation'
  | 'business_analysis'
  | 'critical_decision';

export type ComplexityLevel = 'low' | 'medium' | 'high' | 'critical';

// Model definitions with cost per 1K tokens
export const MODELS = {
  nano: {
    name: 'google/gemini-2.5-flash-lite',
    costPer1K: 0.0001,
    maxTokens: 2000,
    description: 'Fastest, cheapest - classification, simple tasks'
  },
  fast: {
    name: 'google/gemini-2.5-flash',
    costPer1K: 0.0003,
    maxTokens: 4000,
    description: 'Balanced - general Q&A, summaries, translations'
  },
  pro: {
    name: 'google/gemini-2.5-pro',
    costPer1K: 0.003,
    maxTokens: 8000,
    description: 'Complex reasoning, tool calling, research'
  },
  premium: {
    name: 'google/gemini-3-pro-preview',
    costPer1K: 0.006,
    maxTokens: 8000,
    description: 'Critical decisions, business generation'
  }
} as const;

// Task to tier mapping
const TASK_TIER_MAP: Record<TaskType, ModelTier> = {
  classification: 'nano',
  extraction: 'nano',
  routing: 'nano',
  summary: 'fast',
  translation: 'fast',
  general_qa: 'fast',
  content_generation: 'fast',
  complex_reasoning: 'pro',
  tool_calling: 'pro',
  research: 'pro',
  erp_generation: 'pro',
  website_generation: 'pro',
  business_analysis: 'pro',
  critical_decision: 'premium'
};

// Complexity can bump up the tier
const COMPLEXITY_BOOST: Record<ComplexityLevel, number> = {
  low: 0,
  medium: 0,
  high: 1,
  critical: 2
};

const TIER_ORDER: ModelTier[] = ['nano', 'fast', 'pro', 'premium'];

/**
 * Select the appropriate model based on task type and complexity
 */
export function selectModel(
  taskType: TaskType, 
  complexity: ComplexityLevel = 'medium',
  forceTier?: ModelTier
): typeof MODELS[ModelTier] & { tier: ModelTier } {
  // If a specific tier is forced, use it
  if (forceTier) {
    return { ...MODELS[forceTier], tier: forceTier };
  }

  // Get base tier from task type
  const baseTier = TASK_TIER_MAP[taskType] || 'fast';
  const baseTierIndex = TIER_ORDER.indexOf(baseTier);
  
  // Apply complexity boost
  const boost = COMPLEXITY_BOOST[complexity];
  const finalTierIndex = Math.min(baseTierIndex + boost, TIER_ORDER.length - 1);
  const finalTier = TIER_ORDER[finalTierIndex];

  return { ...MODELS[finalTier], tier: finalTier };
}

/**
 * Estimate cost for a given number of tokens
 */
export function estimateCost(tier: ModelTier, tokens: number): number {
  return (tokens / 1000) * MODELS[tier].costPer1K;
}

/**
 * Get model config for the AI gateway call
 */
export function getModelConfig(
  taskType: TaskType,
  complexity: ComplexityLevel = 'medium',
  options?: {
    forceTier?: ModelTier;
    maxTokens?: number;
  }
) {
  const model = selectModel(taskType, complexity, options?.forceTier);
  
  return {
    model: model.name,
    tier: model.tier,
    max_tokens: options?.maxTokens || model.maxTokens,
    costPer1K: model.costPer1K
  };
}

/**
 * Detect task type from message content (simple heuristics)
 */
export function detectTaskType(message: string): TaskType {
  const lowerMsg = message.toLowerCase();
  
  // Check for specific patterns
  if (/\b(classify|categorize|tag|label)\b/.test(lowerMsg)) return 'classification';
  if (/\b(extract|parse|get from|pull from)\b/.test(lowerMsg)) return 'extraction';
  if (/\b(route|direct|send to|which module)\b/.test(lowerMsg)) return 'routing';
  if (/\b(summarize|summary|brief|tldr)\b/.test(lowerMsg)) return 'summary';
  if (/\b(translate|translation|in spanish|in french|en español)\b/.test(lowerMsg)) return 'translation';
  if (/\b(write|draft|compose|create content|blog|article|email)\b/.test(lowerMsg)) return 'content_generation';
  if (/\b(research|analyze market|competitive analysis|industry)\b/.test(lowerMsg)) return 'research';
  if (/\b(erp|organization|folder structure|departments)\b/.test(lowerMsg)) return 'erp_generation';
  if (/\b(website|landing page|web presence|homepage)\b/.test(lowerMsg)) return 'website_generation';
  if (/\b(business plan|business model|spawn|start a company)\b/.test(lowerMsg)) return 'business_analysis';
  if (/\b(critical|important decision|high stakes|investment)\b/.test(lowerMsg)) return 'critical_decision';
  if (/\b(explain|analyze|think through|reason|complex)\b/.test(lowerMsg)) return 'complex_reasoning';
  
  // Default to general Q&A for most conversational queries
  return 'general_qa';
}

/**
 * Detect complexity from context
 */
export function detectComplexity(context: {
  messageLength?: number;
  hasToolCalls?: boolean;
  historyLength?: number;
  hasFiles?: boolean;
}): ComplexityLevel {
  let score = 0;
  
  if (context.messageLength && context.messageLength > 500) score += 1;
  if (context.messageLength && context.messageLength > 1500) score += 1;
  if (context.hasToolCalls) score += 1;
  if (context.historyLength && context.historyLength > 10) score += 1;
  if (context.hasFiles) score += 1;
  
  if (score >= 4) return 'critical';
  if (score >= 2) return 'high';
  if (score >= 1) return 'medium';
  return 'low';
}

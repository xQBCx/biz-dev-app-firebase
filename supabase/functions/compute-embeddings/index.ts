import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Computes user behavior embeddings from their event history.
 * This implements the "action-based encoding" principle where
 * actions speak louder than words.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, fullRecompute = false } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get recent events for this user
    const { data: events, error: eventsError } = await supabase
      .from('instincts_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (eventsError) throw eventsError;

    if (!events || events.length === 0) {
      console.log(`No events found for user ${userId}`);
      return new Response(
        JSON.stringify({ success: true, message: 'No events to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // COMPUTE BEHAVIORAL EMBEDDING
    // ============================================

    // Module engagement (position in 128-dim vector)
    const moduleMap: Record<string, number> = {
      'dashboard': 0, 'crm': 4, 'tasks': 8, 'calendar': 12,
      'messages': 16, 'marketplace': 20, 'ai_gift_cards': 24,
      'iplaunch': 28, 'portfolio': 32, 'xbuilderx': 36,
      'xodiak': 40, 'grid_os': 44, 'true_odds': 48, 'erp': 52,
      'social': 56, 'website_builder': 60, 'driveby': 64,
      'directory': 68, 'business_cards': 72, 'franchises': 76,
    };

    // Category weights (intensity signal)
    const categoryWeights: Record<string, number> = {
      'navigation': 0.3, 'interaction': 0.5, 'transaction': 1.0,
      'communication': 0.7, 'content': 0.6, 'workflow': 0.8,
      'search': 0.4, 'integration': 0.5, 'system': 0.1,
    };

    // Initialize 128-dim behavior vector
    const behaviorVector = new Array(128).fill(0);
    
    // Module-specific sub-vectors (for transfer learning)
    const moduleVectors: Record<string, number[]> = {};
    
    // Compute traits
    const traits: Record<string, number> = {
      explorer: 0,    // How much they navigate/search
      executor: 0,    // How much they complete workflows
      communicator: 0, // How much they message/call
      transactor: 0,  // How much monetary value they generate
      creator: 0,     // How much content they create
    };

    let totalValue = 0;
    const moduleEngagement: Record<string, number> = {};
    const actionSequence: string[] = [];

    // Process each event
    for (const event of events) {
      const module = event.module as string;
      const category = event.category as string;
      const weight = categoryWeights[category] || 0.3;
      
      // Update module engagement
      moduleEngagement[module] = (moduleEngagement[module] || 0) + weight;
      
      // Update behavior vector at module position
      const baseIdx = moduleMap[module] ?? 80; // Default position for unknown modules
      if (baseIdx < 124) {
        behaviorVector[baseIdx] += weight;
        behaviorVector[baseIdx + 1] += event.duration_ms ? Math.min(event.duration_ms / 60000, 1) : 0;
        behaviorVector[baseIdx + 2] += event.value_amount || 0;
        behaviorVector[baseIdx + 3] += 1; // Event count
      }

      // Build module-specific vectors
      if (!moduleVectors[module]) {
        moduleVectors[module] = new Array(16).fill(0);
      }
      const mv = moduleVectors[module];
      mv[0] += weight; // Intensity
      mv[1] += event.duration_ms ? event.duration_ms / 60000 : 0; // Time spent
      mv[2] += event.value_amount || 0; // Value
      mv[3] += 1; // Event count
      
      // Update traits
      if (category === 'navigation' || category === 'search') {
        traits.explorer += weight;
      }
      if (category === 'workflow') {
        traits.executor += weight;
      }
      if (category === 'communication') {
        traits.communicator += weight;
      }
      if (category === 'transaction') {
        traits.transactor += weight;
        totalValue += event.value_amount || 0;
      }
      if (category === 'content') {
        traits.creator += weight;
      }

      // Build action sequence signature (last 20 actions)
      if (actionSequence.length < 20) {
        actionSequence.push(`${module}:${event.action}`);
      }
    }

    // Normalize traits to 0-1 range
    const maxTrait = Math.max(...Object.values(traits), 1);
    for (const key of Object.keys(traits)) {
      traits[key] = Math.round((traits[key] / maxTrait) * 100) / 100;
    }

    // Normalize behavior vector
    const maxBehavior = Math.max(...behaviorVector, 1);
    for (let i = 0; i < behaviorVector.length; i++) {
      behaviorVector[i] = Math.round((behaviorVector[i] / maxBehavior) * 1000) / 1000;
    }

    // Compute action diversity score
    const uniqueModules = Object.keys(moduleEngagement).length;
    const diversityScore = Math.min(uniqueModules / 10, 1);

    // Compute action intensity (events per day)
    const oldestEvent = events[events.length - 1];
    const daysSinceFirst = Math.max(1, (Date.now() - new Date(oldestEvent.created_at).getTime()) / (1000 * 60 * 60 * 24));
    const actionIntensity = Math.min(events.length / daysSinceFirst / 10, 1);

    // Create compact 32-dim embedding for user_stats (most important signals)
    const compactEmbedding = [
      traits.explorer, traits.executor, traits.communicator, 
      traits.transactor, traits.creator, diversityScore, actionIntensity,
      ...behaviorVector.slice(0, 25).map(v => Math.round(v * 1000) / 1000)
    ];

    // ============================================
    // UPSERT EMBEDDINGS
    // ============================================

    // Upsert full embedding
    const { error: embedError } = await supabase
      .from('instincts_user_embedding')
      .upsert({
        user_id: userId,
        behavior_vector: behaviorVector,
        module_vectors: moduleVectors,
        action_intensity: actionIntensity,
        diversity_score: diversityScore,
        value_generation: totalValue,
        traits,
        last_computed_at: new Date().toISOString(),
        event_count_at_computation: events.length,
        embedding_version: 1,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (embedError) {
      console.error('Failed to upsert user embedding:', embedError);
    }

    // Update user stats with compact embedding
    const { error: statsError } = await supabase
      .from('instincts_user_stats')
      .update({
        behavior_embedding: compactEmbedding,
        traits,
        action_sequence_signature: actionSequence.join('→'),
      })
      .eq('user_id', userId);

    if (statsError) {
      console.log('User stats update skipped (may not exist yet):', statsError.message);
    }

    // Mark events as processed
    const eventIds = events.map(e => e.id);
    await supabase
      .from('instincts_events')
      .update({ embedding_processed: true, embedding_version: 1 })
      .in('id', eventIds);

    console.log(`Computed embedding for user ${userId}: ${events.length} events, diversity=${diversityScore}, intensity=${actionIntensity}`);

    return new Response(
      JSON.stringify({
        success: true,
        userId,
        eventsProcessed: events.length,
        traits,
        diversityScore,
        actionIntensity,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Compute embeddings error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
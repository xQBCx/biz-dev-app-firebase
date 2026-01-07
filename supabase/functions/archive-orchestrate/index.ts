import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrchestrationRequest {
  import_id: string;
}

const PIPELINE_STAGES = [
  { name: 'extracting', function: 'archive-extract' },
  { name: 'parsing', function: 'archive-parse' },
  { name: 'chunking', function: 'archive-chunk' },
  { name: 'extracting_entities', function: 'archive-extract-entities' },
  { name: 'building_graph', function: 'archive-build-graph' },
  { name: 'review_pending', function: 'archive-commit' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: authData, error: authError } = await userClient.auth.getClaims(token);
    if (authError || !authData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const userId = authData.claims.sub;
    const { import_id }: OrchestrationRequest = await req.json();

    console.log(`[Orchestrator] Starting pipeline for import: ${import_id}`);

    // Verify ownership
    const { data: importData, error: importError } = await supabase
      .from('archive_imports')
      .select('*')
      .eq('id', import_id)
      .single();

    if (importError || !importData) {
      return new Response(JSON.stringify({ error: 'Import not found' }), { 
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    if (importData.owner_user_id !== userId) {
      return new Response(JSON.stringify({ error: 'Access denied' }), { 
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Get current stage index
    const currentStageIndex = PIPELINE_STAGES.findIndex(s => s.name === importData.status);
    let nextStageIndex = currentStageIndex === -1 ? 0 : currentStageIndex;

    // If already committed, check if it was an empty commit (allow retry)
    if (importData.status === 'committed') {
      const stats = importData.stats_json as Record<string, unknown> || {};
      const extractStats = stats.extracting as Record<string, unknown>;
      const filesFound = extractStats?.files_found as number || 0;
      
      if (filesFound === 0) {
        console.log(`[Orchestrator] Empty committed import detected, allowing retry from start`);
        nextStageIndex = 0;
        // Reset status to allow processing
        await supabase
          .from('archive_imports')
          .update({ status: 'uploaded', error: null, updated_at: new Date().toISOString() })
          .eq('id', import_id);
      } else {
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Import already committed',
          status: importData.status 
        }), { 
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }
    }

    if (importData.status === 'failed') {
      // Allow retry from current stage
      console.log(`[Orchestrator] Retrying failed import from stage: ${PIPELINE_STAGES[nextStageIndex]?.name || 'uploaded'}`);
    }

    // Track accumulated stats across stages
    let accumulatedStats = (importData.stats_json as Record<string, unknown>) || {};

    // Process stages sequentially
    for (let i = nextStageIndex; i < PIPELINE_STAGES.length; i++) {
      const stage = PIPELINE_STAGES[i];
      console.log(`[Orchestrator] Running stage: ${stage.name}`);

      // Update status to current stage
      await supabase
        .from('archive_imports')
        .update({ status: stage.name, updated_at: new Date().toISOString() })
        .eq('id', import_id);

      try {
        // Call the stage function
        const response = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/${stage.function}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            },
            body: JSON.stringify({ import_id, user_id: userId }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Stage ${stage.name} failed: ${errorText}`);
        }

        const result = await response.json();
        console.log(`[Orchestrator] Stage ${stage.name} completed:`, result);

        // PIPELINE GUARDS: Validate stage outputs
        if (stage.name === 'extracting') {
          const filesFound = result.files_found as number || 0;
          if (filesFound === 0) {
            throw new Error(
              `Extraction produced 0 files. The archive may be empty, encrypted, or corrupted. ` +
              `Check the archive-extract logs for diagnostic details.`
            );
          }
        }

        if (stage.name === 'parsing') {
          const conversationsCreated = result.conversations_created as number || 0;
          if (conversationsCreated === 0) {
            throw new Error(
              `Parsing produced 0 conversations. The archive may not contain valid conversation data. ` +
              `Expected conversations.json or similar structure.`
            );
          }
        }

        // Accumulate stats properly
        accumulatedStats = { ...accumulatedStats, [stage.name]: result };
        
        await supabase
          .from('archive_imports')
          .update({ 
            stats_json: accumulatedStats,
            updated_at: new Date().toISOString()
          })
          .eq('id', import_id);

      } catch (stageError: unknown) {
        const errorMessage = stageError instanceof Error ? stageError.message : String(stageError);
        console.error(`[Orchestrator] Stage ${stage.name} error:`, stageError);
        
        await supabase
          .from('archive_imports')
          .update({ 
            status: 'failed', 
            error: `Stage ${stage.name} failed: ${errorMessage}`,
            stats_json: accumulatedStats,
            updated_at: new Date().toISOString()
          })
          .eq('id', import_id);

        return new Response(JSON.stringify({ 
          success: false, 
          error: `Pipeline failed at stage: ${stage.name}`,
          details: errorMessage 
        }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }
    }

    // Mark as review_pending if there are items to review, otherwise committed
    const { count: pendingCount } = await supabase
      .from('archive_review_queue')
      .select('*', { count: 'exact', head: true })
      .eq('import_id', import_id)
      .eq('status', 'pending');

    const finalStatus = (pendingCount || 0) > 0 ? 'review_pending' : 'committed';

    await supabase
      .from('archive_imports')
      .update({ 
        status: finalStatus, 
        stats_json: { ...accumulatedStats, pending_review_items: pendingCount || 0 },
        updated_at: new Date().toISOString() 
      })
      .eq('id', import_id);

    // Log audit event
    await supabase.from('archive_audit_events').insert({
      actor_user_id: userId,
      action: 'pipeline_completed',
      object_type: 'import',
      object_id: import_id,
      import_id,
      metadata_json: { final_status: finalStatus, pending_review_items: pendingCount || 0 }
    });

    console.log(`[Orchestrator] Pipeline completed for import: ${import_id}, status: ${finalStatus}`);

    return new Response(JSON.stringify({ 
      success: true, 
      status: finalStatus,
      pending_review_items: pendingCount || 0
    }), { 
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Orchestrator] Error:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QueueJob {
  id: string;
  user_id: string;
  queued_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('[process-embedding-queue] Starting batch processing...');

  try {
    // Claim pending jobs (up to 10 at a time)
    const { data: jobs, error: claimError } = await supabase
      .rpc('claim_embedding_jobs', { batch_size: 10 });

    if (claimError) {
      console.error('[process-embedding-queue] Error claiming jobs:', claimError);
      throw claimError;
    }

    if (!jobs || jobs.length === 0) {
      console.log('[process-embedding-queue] No pending jobs');
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[process-embedding-queue] Processing ${jobs.length} jobs`);

    let successCount = 0;
    let failCount = 0;

    // Process each job
    for (const job of jobs as QueueJob[]) {
      try {
        console.log(`[process-embedding-queue] Computing embedding for user ${job.user_id}`);
        
        // Call the compute-embeddings function for this user
        const { data, error } = await supabase.functions.invoke('compute-embeddings', {
          body: { user_id: job.user_id },
        });

        if (error) {
          throw error;
        }

        // Mark job as completed
        await supabase.rpc('complete_embedding_job', {
          job_id: job.id,
          success: true,
        });

        successCount++;
        console.log(`[process-embedding-queue] Successfully processed job ${job.id}`);
      } catch (jobError: unknown) {
        const errorMessage = jobError instanceof Error ? jobError.message : 'Unknown error';
        console.error(`[process-embedding-queue] Error processing job ${job.id}:`, jobError);
        
        // Mark job as failed
        await supabase.rpc('complete_embedding_job', {
          job_id: job.id,
          success: false,
          error: errorMessage,
        });
        
        failCount++;
      }
    }

    // Clean up old completed/failed jobs (older than 24 hours)
    await supabase
      .from('instincts_embedding_queue')
      .delete()
      .in('status', ['completed', 'failed'])
      .lt('processed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    console.log(`[process-embedding-queue] Batch complete: ${successCount} success, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        processed: jobs.length,
        success: successCount,
        failed: failCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[process-embedding-queue] Fatal error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

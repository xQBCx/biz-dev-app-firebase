import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CommitRequest {
  import_id: string;
  user_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { import_id, user_id }: CommitRequest = await req.json();
    console.log(`[Commit] Finalizing import: ${import_id}`);

    // Get pending review items
    const { data: pendingItems, count } = await supabase
      .from('archive_review_queue')
      .select('*', { count: 'exact' })
      .eq('import_id', import_id)
      .eq('status', 'pending');

    // Get stats
    const { data: businesses, count: bizCount } = await supabase
      .from('archive_businesses')
      .select('*', { count: 'exact' })
      .eq('created_from_import_id', import_id);

    const { count: contactCount } = await supabase
      .from('archive_contacts')
      .select('*', { count: 'exact', head: true })
      .eq('created_from_import_id', import_id);

    const { count: companyCount } = await supabase
      .from('archive_companies')
      .select('*', { count: 'exact', head: true })
      .eq('created_from_import_id', import_id);

    const { count: strategyCount } = await supabase
      .from('archive_strategies')
      .select('*', { count: 'exact', head: true })
      .eq('created_from_import_id', import_id);

    const { count: chunkCount } = await supabase
      .from('archive_chunks')
      .select('*', { count: 'exact', head: true })
      .eq('import_id', import_id);

    // Update import stats
    await supabase
      .from('archive_imports')
      .update({
        stats_json: {
          businesses_created: bizCount || 0,
          contacts_created: contactCount || 0,
          companies_created: companyCount || 0,
          strategies_created: strategyCount || 0,
          chunks_created: chunkCount || 0,
          pending_review_items: count || 0
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', import_id);

    // Log audit
    await supabase.from('archive_audit_events').insert({
      actor_user_id: user_id,
      action: 'commit_completed',
      object_type: 'import',
      object_id: import_id,
      import_id,
      metadata_json: {
        businesses: bizCount,
        contacts: contactCount,
        companies: companyCount,
        strategies: strategyCount,
        chunks: chunkCount,
        pending_items: count
      }
    });

    console.log(`[Commit] Completed: ${bizCount} businesses, ${contactCount} contacts, ${strategyCount} strategies`);

    return new Response(JSON.stringify({ 
      success: true,
      stats: {
        businesses: bizCount || 0,
        contacts: contactCount || 0,
        companies: companyCount || 0,
        strategies: strategyCount || 0,
        chunks: chunkCount || 0,
        pending_review_items: count || 0
      }
    }), { 
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Commit] Error:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});

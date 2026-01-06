import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReviewAction {
  review_item_id: string;
  action: 'approve' | 'reject' | 'merge';
  merge_target_id?: string;
  notes?: string;
}

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
    const { review_item_id, action, merge_target_id, notes }: ReviewAction = await req.json();

    console.log(`[Review] Processing ${action} for item: ${review_item_id}`);

    // Get review item
    const { data: reviewItem, error: itemError } = await supabase
      .from('archive_review_queue')
      .select('*, archive_imports!inner(owner_user_id, organization_id)')
      .eq('id', review_item_id)
      .single();

    if (itemError || !reviewItem) {
      return new Response(JSON.stringify({ error: 'Review item not found' }), { 
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Check permission (owner, assigned reviewer, or has review permission)
    const isOwner = reviewItem.archive_imports.owner_user_id === userId;
    const isAssigned = reviewItem.assigned_to_user_id === userId;
    
    if (!isOwner && !isAssigned) {
      // Check for review permission
      const { data: permission } = await supabase
        .from('archive_workspace_permissions')
        .select('id')
        .eq('user_id', userId)
        .eq('permission', 'review')
        .single();
      
      if (!permission) {
        return new Response(JSON.stringify({ error: 'Access denied' }), { 
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }
    }

    const org_id = reviewItem.archive_imports.organization_id;
    let createdEntityId: string | null = null;

    if (action === 'approve') {
      // Create the entity based on type
      const payload = reviewItem.payload_json;

      switch (reviewItem.item_type) {
        case 'business_create':
          const { data: newBiz } = await supabase
            .from('archive_businesses')
            .insert({
              owner_user_id: userId,
              organization_id: org_id,
              name: payload.name,
              normalized_name: payload.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
              status: payload.status || 'concept',
              description: payload.description,
              primary_domain: payload.domain,
              created_from_import_id: reviewItem.import_id,
              confidence: reviewItem.confidence,
              provenance_json: {
                evidence_chunk_ids: reviewItem.evidence_chunk_ids,
                confidence: reviewItem.confidence,
                approved_by: userId,
                approved_at: new Date().toISOString()
              }
            })
            .select()
            .single();
          createdEntityId = newBiz?.id;
          break;

        case 'contact_create':
          // Find or create company if specified
          let companyId = null;
          if (payload.company) {
            const { data: existingCompany } = await supabase
              .from('archive_companies')
              .select('id')
              .eq('owner_user_id', userId)
              .ilike('name', payload.company)
              .single();

            if (existingCompany) {
              companyId = existingCompany.id;
            } else {
              const { data: newCompany } = await supabase
                .from('archive_companies')
                .insert({
                  owner_user_id: userId,
                  organization_id: org_id,
                  name: payload.company,
                  normalized_name: payload.company.toLowerCase().replace(/[^a-z0-9]/g, ''),
                  created_from_import_id: reviewItem.import_id,
                  confidence: reviewItem.confidence,
                  provenance_json: { evidence_chunk_ids: reviewItem.evidence_chunk_ids }
                })
                .select()
                .single();
              companyId = newCompany?.id;
            }
          }

          const { data: newContact } = await supabase
            .from('archive_contacts')
            .insert({
              owner_user_id: userId,
              organization_id: org_id,
              full_name: payload.full_name,
              email: payload.email,
              phone: payload.phone,
              company_id: companyId,
              role_title: payload.role_title,
              relationship_type: payload.relationship_type || 'unknown',
              created_from_import_id: reviewItem.import_id,
              confidence: reviewItem.confidence,
              provenance_json: {
                evidence_chunk_ids: reviewItem.evidence_chunk_ids,
                approved_by: userId
              }
            })
            .select()
            .single();
          createdEntityId = newContact?.id;
          break;

        case 'company_create':
          const { data: newCompany } = await supabase
            .from('archive_companies')
            .insert({
              owner_user_id: userId,
              organization_id: org_id,
              name: payload.name,
              normalized_name: payload.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
              domain: payload.domain,
              industry: payload.industry,
              created_from_import_id: reviewItem.import_id,
              confidence: reviewItem.confidence,
              provenance_json: {
                evidence_chunk_ids: reviewItem.evidence_chunk_ids,
                approved_by: userId
              }
            })
            .select()
            .single();
          createdEntityId = newCompany?.id;
          break;

        case 'strategy_create':
          const { data: newStrategy } = await supabase
            .from('archive_strategies')
            .insert({
              owner_user_id: userId,
              organization_id: org_id,
              title: payload.title,
              strategy_type: payload.strategy_type,
              summary: payload.summary,
              playbook_steps: payload.playbook_steps,
              templates: payload.templates,
              stage: 'idea',
              created_from_import_id: reviewItem.import_id,
              confidence: reviewItem.confidence,
              provenance_json: {
                evidence_chunk_ids: reviewItem.evidence_chunk_ids,
                approved_by: userId
              }
            })
            .select()
            .single();
          createdEntityId = newStrategy?.id;
          break;

        case 'business_update':
          if (payload.existing_id) {
            await supabase
              .from('archive_businesses')
              .update({
                description: payload.description || undefined,
                status: payload.status || undefined,
                updated_at: new Date().toISOString()
              })
              .eq('id', payload.existing_id);
            createdEntityId = payload.existing_id;
          }
          break;
      }
    } else if (action === 'merge' && merge_target_id) {
      // Handle merge logic
      // For now, just mark as merged - actual merge logic depends on entity type
      createdEntityId = merge_target_id;
    }

    // Update review item status
    await supabase
      .from('archive_review_queue')
      .update({
        status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'merged',
        decision_notes: notes,
        decided_at: new Date().toISOString()
      })
      .eq('id', review_item_id);

    // Log audit
    await supabase.from('archive_audit_events').insert({
      actor_user_id: userId,
      action: `review_${action}`,
      object_type: 'review_queue',
      object_id: review_item_id,
      import_id: reviewItem.import_id,
      organization_id: org_id,
      metadata_json: {
        item_type: reviewItem.item_type,
        created_entity_id: createdEntityId,
        notes
      }
    });

    console.log(`[Review] Completed ${action} for item: ${review_item_id}`);

    return new Response(JSON.stringify({ 
      success: true,
      action,
      created_entity_id: createdEntityId
    }), { 
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Review] Error:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});

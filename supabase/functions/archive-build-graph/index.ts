import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BuildGraphRequest {
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

    const { import_id, user_id }: BuildGraphRequest = await req.json();
    console.log(`[BuildGraph] Starting for import: ${import_id}`);

    const { data: importData } = await supabase
      .from('archive_imports')
      .select('organization_id')
      .eq('id', import_id)
      .single();

    const org_id = importData?.organization_id;

    // Get all contacts from this import
    const { data: contacts } = await supabase
      .from('archive_contacts')
      .select('*')
      .eq('created_from_import_id', import_id);

    // Get all companies
    const { data: companies } = await supabase
      .from('archive_companies')
      .select('*')
      .eq('created_from_import_id', import_id);

    // Get all businesses
    const { data: businesses } = await supabase
      .from('archive_businesses')
      .select('*')
      .eq('created_from_import_id', import_id);

    // Get interaction events
    const { data: interactions } = await supabase
      .from('archive_interaction_events')
      .select('*')
      .eq('import_id', import_id);

    let edgesCreated = 0;
    let scoresComputed = 0;

    // Create relationship edges for contacts with companies
    for (const contact of contacts || []) {
      if (contact.company_id) {
        // Check if edge exists
        const { data: existingEdge } = await supabase
          .from('archive_relationship_edges')
          .select('id')
          .eq('from_contact_id', contact.id)
          .eq('to_company_id', contact.company_id)
          .eq('edge_type', 'employed_by')
          .single();

        if (!existingEdge) {
          await supabase.from('archive_relationship_edges').insert({
            owner_user_id: user_id,
            organization_id: org_id,
            from_contact_id: contact.id,
            to_company_id: contact.company_id,
            edge_type: 'employed_by',
            strength: 0.9,
            first_seen_at: contact.created_at,
            last_seen_at: contact.created_at,
            created_from_import_id: import_id,
            provenance_json: contact.provenance_json
          });
          edgesCreated++;
        }
      }
    }

    // Create strategy-business links
    const { data: strategies } = await supabase
      .from('archive_strategies')
      .select('*, archive_strategy_links(*)')
      .eq('created_from_import_id', import_id);

    for (const strategy of strategies || []) {
      // Try to link strategies to mentioned businesses based on chunk overlap
      const evidenceChunks = strategy.provenance_json?.evidence_chunk_ids || [];
      
      for (const chunkId of evidenceChunks) {
        const { data: mentions } = await supabase
          .from('archive_business_mentions')
          .select('resolved_business_id')
          .eq('chunk_id', chunkId)
          .not('resolved_business_id', 'is', null);

        for (const mention of mentions || []) {
          // Check if link exists
          const existingLink = strategy.archive_strategy_links?.find(
            (l: any) => l.linked_object_type === 'business' && l.linked_object_id === mention.resolved_business_id
          );

          if (!existingLink) {
            await supabase.from('archive_strategy_links').insert({
              strategy_id: strategy.id,
              linked_object_type: 'business',
              linked_object_id: mention.resolved_business_id,
              strength: 0.7,
              created_from_import_id: import_id
            });
          }
        }
      }
    }

    // Compute relationship scores for contacts
    for (const contact of contacts || []) {
      // Get interaction count
      const contactInteractions = (interactions || []).filter(i => i.contact_id === contact.id);
      
      // Calculate components
      const now = new Date();
      const lastInteraction = contactInteractions.length > 0 
        ? new Date(contactInteractions[contactInteractions.length - 1].occurred_at)
        : new Date(contact.created_at);
      
      const daysSinceLastInteraction = (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24);
      
      // Recency: 1.0 if today, decays to 0 after 365 days
      const recency = Math.max(0, 1 - (daysSinceLastInteraction / 365));
      
      // Frequency: normalized by total interactions (up to 50)
      const frequency = Math.min(1, contactInteractions.length / 50);
      
      // Responsiveness: based on relationship type
      const responsivenessMap: Record<string, number> = {
        'client': 0.9, 'partner': 0.8, 'investor': 0.7, 
        'advisor': 0.7, 'lead': 0.5, 'friend': 0.6, 'vendor': 0.4, 'unknown': 0.3
      };
      const responsiveness = responsivenessMap[contact.relationship_type] || 0.3;
      
      // Sentiment: average from interactions
      const sentiments = contactInteractions
        .filter(i => i.sentiment !== null)
        .map(i => i.sentiment);
      const avgSentiment = sentiments.length > 0 
        ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length 
        : 0.5;
      const sentiment = (avgSentiment + 1) / 2; // Normalize from -1..1 to 0..1
      
      // Deal signal: based on relationship type
      const dealSignalMap: Record<string, number> = {
        'client': 0.95, 'partner': 0.7, 'investor': 0.6,
        'lead': 0.8, 'vendor': 0.3, 'unknown': 0.1
      };
      const dealSignal = dealSignalMap[contact.relationship_type] || 0.1;
      
      // Compute total score
      const score = 100 * (
        0.30 * recency +
        0.25 * frequency +
        0.15 * responsiveness +
        0.15 * sentiment +
        0.15 * dealSignal
      );
      
      const components = {
        recency: { value: recency, weight: 0.30 },
        frequency: { value: frequency, weight: 0.25 },
        responsiveness: { value: responsiveness, weight: 0.15 },
        sentiment: { value: sentiment, weight: 0.15 },
        deal_signal: { value: dealSignal, weight: 0.15 },
        total_score: score
      };

      await supabase.from('archive_relationship_scores').insert({
        owner_user_id: user_id,
        organization_id: org_id,
        contact_id: contact.id,
        score,
        components_json: components,
        computed_at: new Date().toISOString()
      });
      scoresComputed++;
    }

    // Create embeddings for businesses and strategies
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    let embeddingsCreated = 0;

    if (openaiKey) {
      // Embed businesses
      for (const biz of businesses || []) {
        const text = `Business: ${biz.name}. ${biz.description || ''} Status: ${biz.status}. Domain: ${biz.primary_domain || 'unknown'}`;
        
        try {
          const response = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'text-embedding-3-small',
              input: text.slice(0, 8000)
            })
          });

          if (response.ok) {
            const data = await response.json();
            await supabase.from('archive_embeddings').insert({
              owner_user_id: user_id,
              organization_id: org_id,
              object_type: 'business',
              object_id: biz.id,
              model: 'text-embedding-3-small',
              vector: data.data[0].embedding
            });
            embeddingsCreated++;
          }
        } catch (e) {
          console.error(`[BuildGraph] Failed to embed business ${biz.id}`);
        }
      }

      // Embed strategies
      for (const strategy of strategies || []) {
        const text = `Strategy: ${strategy.title}. Type: ${strategy.strategy_type}. ${strategy.summary}`;
        
        try {
          const response = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'text-embedding-3-small',
              input: text.slice(0, 8000)
            })
          });

          if (response.ok) {
            const data = await response.json();
            const { data: embedding } = await supabase.from('archive_embeddings').insert({
              owner_user_id: user_id,
              organization_id: org_id,
              object_type: 'strategy',
              object_id: strategy.id,
              model: 'text-embedding-3-small',
              vector: data.data[0].embedding
            }).select().single();

            if (embedding) {
              await supabase
                .from('archive_strategies')
                .update({ embedding_id: embedding.id })
                .eq('id', strategy.id);
            }
            embeddingsCreated++;
          }
        } catch (e) {
          console.error(`[BuildGraph] Failed to embed strategy ${strategy.id}`);
        }
      }
    }

    // Log audit
    await supabase.from('archive_audit_events').insert({
      actor_user_id: user_id,
      action: 'build_graph_completed',
      object_type: 'import',
      object_id: import_id,
      import_id,
      metadata_json: {
        edges_created: edgesCreated,
        scores_computed: scoresComputed,
        embeddings_created: embeddingsCreated
      }
    });

    console.log(`[BuildGraph] Completed: ${edgesCreated} edges, ${scoresComputed} scores, ${embeddingsCreated} embeddings`);

    return new Response(JSON.stringify({ 
      success: true,
      edges_created: edgesCreated,
      scores_computed: scoresComputed,
      embeddings_created: embeddingsCreated
    }), { 
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[BuildGraph] Error:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});

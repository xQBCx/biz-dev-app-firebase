import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExtractEntitiesRequest {
  import_id: string;
  user_id: string;
}

// Confidence thresholds
const BUSINESS_AUTO_THRESHOLD = 0.85;
const BUSINESS_REVIEW_THRESHOLD = 0.65;
const CRM_AUTO_THRESHOLD = 0.80;
const CRM_REVIEW_THRESHOLD = 0.60;
const STRATEGY_AUTO_THRESHOLD = 0.75;
const STRATEGY_REVIEW_THRESHOLD = 0.55;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { import_id, user_id }: ExtractEntitiesRequest = await req.json();
    console.log(`[ExtractEntities] Starting for import: ${import_id}`);

    // Get chunks for processing
    const { data: chunks, error: chunksError } = await supabase
      .from('archive_chunks')
      .select('*')
      .eq('import_id', import_id);

    if (chunksError) throw new Error(`Failed to fetch chunks: ${chunksError.message}`);
    console.log(`[ExtractEntities] Processing ${chunks?.length || 0} chunks`);

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) throw new Error('OpenAI API key not configured');

    let businessMentions = 0;
    let contactsExtracted = 0;
    let companiesExtracted = 0;
    let strategiesExtracted = 0;
    let reviewQueueItems = 0;

    // Get import data for organization context
    const { data: importData } = await supabase
      .from('archive_imports')
      .select('organization_id')
      .eq('id', import_id)
      .single();

    const org_id = importData?.organization_id;

    for (const chunk of chunks || []) {
      console.log(`[ExtractEntities] Processing chunk: ${chunk.id}`);

      // Call OpenAI for entity extraction
      const extractionPrompt = `Analyze the following conversation excerpt and extract entities:

CONVERSATION:
${chunk.chunk_text}

Extract and return JSON with these categories:

1. BUSINESSES: Companies, startups, or business ventures mentioned
   - name: string
   - status: "concept" | "active" | "client" | "partner" | "target" | "vendor"
   - domain: string (if mentioned)
   - description: string (brief)
   - confidence: number (0-1)

2. CONTACTS: People mentioned with contact details
   - full_name: string
   - email: string (if mentioned)
   - phone: string (if mentioned)
   - company: string (if mentioned)
   - role_title: string (if mentioned)
   - relationship_type: "client" | "partner" | "investor" | "advisor" | "vendor" | "lead" | "friend" | "unknown"
   - confidence: number (0-1)

3. COMPANIES: Organizations mentioned (separate from business ventures)
   - name: string
   - domain: string (if mentioned)
   - industry: string (if identifiable)
   - confidence: number (0-1)

4. STRATEGIES: Actionable business strategies, playbooks, or frameworks discussed
   - title: string
   - strategy_type: "gtm" | "pricing" | "positioning" | "operations" | "product" | "legal" | "compliance" | "fundraising" | "deal_structure" | "marketing" | "sales" | "automation" | "technical_architecture"
   - summary: string
   - playbook_steps: string[] (if applicable)
   - templates: string[] (if applicable - email scripts, prompts, checklists)
   - confidence: number (0-1)

Return ONLY valid JSON with this structure:
{
  "businesses": [...],
  "contacts": [...],
  "companies": [...],
  "strategies": [...]
}`;

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are an entity extraction expert. Extract business entities, contacts, companies, and strategies from conversations. Return valid JSON only.' },
              { role: 'user', content: extractionPrompt }
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' }
          })
        });

        if (!response.ok) {
          console.error(`[ExtractEntities] OpenAI error for chunk ${chunk.id}`);
          continue;
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        
        if (!content) continue;

        let extracted;
        try {
          extracted = JSON.parse(content);
        } catch (e) {
          console.error(`[ExtractEntities] Failed to parse extraction result`);
          continue;
        }

        // Process businesses
        for (const biz of extracted.businesses || []) {
          businessMentions++;
          const normalizedName = biz.name.toLowerCase().replace(/[^a-z0-9]/g, '');

          // Record mention
          await supabase.from('archive_business_mentions').insert({
            import_id,
            chunk_id: chunk.id,
            detected_name: biz.name,
            detected_domain: biz.domain,
            confidence: biz.confidence,
            resolution_method: 'unresolved'
          });

          // Check for existing business
          const { data: existingBiz } = await supabase
            .from('archive_businesses')
            .select('id, normalized_name')
            .eq('owner_user_id', user_id)
            .eq('normalized_name', normalizedName)
            .single();

          if (biz.confidence >= BUSINESS_AUTO_THRESHOLD) {
            if (existingBiz) {
              // Update mention with resolved business
              await supabase
                .from('archive_business_mentions')
                .update({ 
                  resolved_business_id: existingBiz.id, 
                  resolution_method: 'exact' 
                })
                .eq('import_id', import_id)
                .eq('chunk_id', chunk.id)
                .eq('detected_name', biz.name);
            } else {
              // Auto-create business
              const { data: newBiz } = await supabase
                .from('archive_businesses')
                .insert({
                  owner_user_id: user_id,
                  organization_id: org_id,
                  name: biz.name,
                  normalized_name: normalizedName,
                  status: biz.status || 'concept',
                  description: biz.description,
                  primary_domain: biz.domain,
                  first_seen_at: chunk.occurred_start_at,
                  created_from_import_id: import_id,
                  confidence: biz.confidence,
                  provenance_json: {
                    evidence_chunk_ids: [chunk.id],
                    first_seen_at: chunk.occurred_start_at,
                    confidence: biz.confidence
                  }
                })
                .select()
                .single();

              if (newBiz) {
                await supabase
                  .from('archive_business_mentions')
                  .update({ 
                    resolved_business_id: newBiz.id, 
                    resolution_method: 'exact' 
                  })
                  .eq('import_id', import_id)
                  .eq('chunk_id', chunk.id)
                  .eq('detected_name', biz.name);
              }
            }
          } else if (biz.confidence >= BUSINESS_REVIEW_THRESHOLD) {
            // Add to review queue
            await supabase.from('archive_review_queue').insert({
              import_id,
              item_type: existingBiz ? 'business_update' : 'business_create',
              payload_json: { ...biz, existing_id: existingBiz?.id },
              confidence: biz.confidence,
              evidence_chunk_ids: [chunk.id],
              status: 'pending'
            });
            reviewQueueItems++;
          }
        }

        // Process contacts
        for (const contact of extracted.contacts || []) {
          if (contact.confidence >= CRM_AUTO_THRESHOLD) {
            // Check for existing contact
            const { data: existingContact } = await supabase
              .from('archive_contacts')
              .select('id')
              .eq('owner_user_id', user_id)
              .eq('full_name', contact.full_name)
              .single();

            if (!existingContact) {
              // Find or create company
              let companyId = null;
              if (contact.company) {
                const { data: existingCompany } = await supabase
                  .from('archive_companies')
                  .select('id')
                  .eq('owner_user_id', user_id)
                  .ilike('name', contact.company)
                  .single();

                if (existingCompany) {
                  companyId = existingCompany.id;
                } else {
                  const { data: newCompany } = await supabase
                    .from('archive_companies')
                    .insert({
                      owner_user_id: user_id,
                      organization_id: org_id,
                      name: contact.company,
                      normalized_name: contact.company.toLowerCase().replace(/[^a-z0-9]/g, ''),
                      created_from_import_id: import_id,
                      confidence: contact.confidence,
                      provenance_json: { evidence_chunk_ids: [chunk.id] }
                    })
                    .select()
                    .single();
                  companyId = newCompany?.id;
                  companiesExtracted++;
                }
              }

              await supabase.from('archive_contacts').insert({
                owner_user_id: user_id,
                organization_id: org_id,
                full_name: contact.full_name,
                email: contact.email,
                phone: contact.phone,
                company_id: companyId,
                role_title: contact.role_title,
                relationship_type: contact.relationship_type || 'unknown',
                created_from_import_id: import_id,
                confidence: contact.confidence,
                provenance_json: { evidence_chunk_ids: [chunk.id] }
              });
              contactsExtracted++;
            }
          } else if (contact.confidence >= CRM_REVIEW_THRESHOLD) {
            await supabase.from('archive_review_queue').insert({
              import_id,
              item_type: 'contact_create',
              payload_json: contact,
              confidence: contact.confidence,
              evidence_chunk_ids: [chunk.id],
              status: 'pending'
            });
            reviewQueueItems++;
          }
        }

        // Process strategies
        for (const strategy of extracted.strategies || []) {
          const hasArtifact = (strategy.playbook_steps?.length > 0) || 
                             (strategy.templates?.length > 0);

          if (strategy.confidence >= STRATEGY_AUTO_THRESHOLD && hasArtifact) {
            await supabase.from('archive_strategies').insert({
              owner_user_id: user_id,
              organization_id: org_id,
              title: strategy.title,
              strategy_type: strategy.strategy_type,
              summary: strategy.summary,
              playbook_steps: strategy.playbook_steps,
              templates: strategy.templates,
              stage: 'idea',
              created_from_import_id: import_id,
              confidence: strategy.confidence,
              provenance_json: { evidence_chunk_ids: [chunk.id] }
            });
            strategiesExtracted++;
          } else if (strategy.confidence >= STRATEGY_REVIEW_THRESHOLD) {
            await supabase.from('archive_review_queue').insert({
              import_id,
              item_type: 'strategy_create',
              payload_json: strategy,
              confidence: strategy.confidence,
              evidence_chunk_ids: [chunk.id],
              status: 'pending'
            });
            reviewQueueItems++;
          }
        }

      } catch (chunkError) {
        console.error(`[ExtractEntities] Error processing chunk ${chunk.id}:`, chunkError);
      }
    }

    // Log audit
    await supabase.from('archive_audit_events').insert({
      actor_user_id: user_id,
      action: 'extract_entities_completed',
      object_type: 'import',
      object_id: import_id,
      import_id,
      metadata_json: {
        business_mentions: businessMentions,
        contacts_extracted: contactsExtracted,
        companies_extracted: companiesExtracted,
        strategies_extracted: strategiesExtracted,
        review_queue_items: reviewQueueItems
      }
    });

    console.log(`[ExtractEntities] Completed: ${businessMentions} biz mentions, ${contactsExtracted} contacts, ${strategiesExtracted} strategies`);

    return new Response(JSON.stringify({ 
      success: true,
      business_mentions: businessMentions,
      contacts_extracted: contactsExtracted,
      companies_extracted: companiesExtracted,
      strategies_extracted: strategiesExtracted,
      review_queue_items: reviewQueueItems
    }), { 
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[ExtractEntities] Error:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});

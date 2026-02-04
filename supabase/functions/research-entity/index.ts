import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type EntityType = 'contact' | 'company' | 'government' | 'region';

interface ResearchResult {
  summary: string;
  industry?: string;
  services?: string[];
  tags?: string[];
  sources?: string[];
  abundant_resources?: string[];
  resource_deficits?: string[];
  strategic_opportunities?: Array<{ type: string; description: string }>;
  key_initiatives?: Array<{ name: string; description: string }>;
  sustainability_challenges?: string[];
  major_industries?: string[];
}

const RESEARCH_PROMPTS: Record<EntityType, { system: string; userTemplate: string }> = {
  contact: {
    system: `You are a business intelligence researcher. Research professionals and provide structured information for CRM enrichment and business development.
Return a JSON object with:
- summary: 2-3 sentence professional bio
- tags: Array of 3-5 professional tags
Be factual. Focus on business development relevance.`,
    userTemplate: 'Research this professional: {name}\nContext: {context}\nReturn ONLY valid JSON.'
  },
  company: {
    system: `You are a business intelligence researcher. Research companies and provide structured, factual information with sustainability intelligence.
Return a JSON object with:
- summary: 2-4 sentence description of what the company does
- industry: Primary industry category
- services: Array of 3-5 key services or products
- tags: Array of 3-7 relevant business tags
- abundant_resources: Array of resources/capabilities the company excels at
- resource_deficits: Array of resources/capabilities the company may lack or need
- strategic_opportunities: Array of objects {type, description} for potential partnerships/growth
Be factual and professional.`,
    userTemplate: 'Research the company: {name}\nWebsite/Domain: {domain}\nReturn ONLY valid JSON.'
  },
  government: {
    system: `You are a government affairs and economic development researcher. Research government entities and provide structured intelligence.
Return a JSON object with:
- summary: 2-4 sentence description of the government entity's role and priorities
- industry_focus: Array of industries they regulate, support, or prioritize
- key_initiatives: Array of objects {name, description} for major programs/initiatives
- abundant_resources: Array of resources available (budget programs, expertise, infrastructure)
- resource_deficits: Array of challenges or gaps they face
- strategic_opportunities: Array of objects {type, description} for potential engagement (procurement, grants, partnerships)
- tags: Array of relevant tags
Focus on economic development, procurement, and partnership opportunities.`,
    userTemplate: 'Research this government entity: {name}\nJurisdiction: {jurisdiction}\nLocation: {location}\nReturn ONLY valid JSON.'
  },
  region: {
    system: `You are an economic geography and sustainability researcher. Research geographic regions and provide intelligence for business development and sustainability optimization.
Return a JSON object with:
- summary: 3-5 sentence overview of the region's economic profile and strategic position
- major_industries: Array of 5-10 key industries in the region
- abundant_resources: Array of natural, human, infrastructure, and capital resources the region excels at
- resource_deficits: Array of resources the region lacks or needs
- sustainability_challenges: Array of environmental/social/economic sustainability challenges
- strategic_opportunities: Array of objects {type, description} for investment, trade, or partnership opportunities
- tags: Array of relevant tags for matching
Focus on actionable intelligence for business development and sustainable resource optimization.`,
    userTemplate: 'Research this region: {name}\nType: {regionType}\nLocation: {location}\nReturn ONLY valid JSON.'
  }
};

async function researchEntity(
  entityType: EntityType,
  entityData: Record<string, unknown>,
  perplexityApiKey: string
): Promise<ResearchResult | null> {
  const prompt = RESEARCH_PROMPTS[entityType];
  
  // Build context based on entity type
  let userPrompt = prompt.userTemplate;
  userPrompt = userPrompt.replace('{name}', String(entityData.name || ''));
  userPrompt = userPrompt.replace('{domain}', String(entityData.domain || entityData.website || ''));
  userPrompt = userPrompt.replace('{context}', String(entityData.context || ''));
  userPrompt = userPrompt.replace('{jurisdiction}', String(entityData.jurisdiction_level || ''));
  userPrompt = userPrompt.replace('{regionType}', String(entityData.region_type || ''));
  userPrompt = userPrompt.replace('{location}', [
    entityData.locality,
    entityData.state_province,
    entityData.country
  ].filter(Boolean).join(', ') || 'Unknown');

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1200,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      console.error('Perplexity API error:', await response.text());
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) return null;

    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      return {
        ...parsed,
        sources: data.citations || []
      };
    } catch {
      return {
        summary: content,
        sources: data.citations || []
      };
    }
  } catch (error) {
    console.error('Error researching entity:', error);
    return null;
  }
}

function calculateMatchScore(
  entityType: EntityType,
  entityData: Record<string, unknown>,
  research: ResearchResult | null
): number {
  let score = 10;

  // Data completeness
  if (entityData.website || entityData.email) score += 10;
  if (entityData.description) score += 5;
  
  // Research quality
  if (research) {
    score += 20;
    if (research.summary && research.summary.length > 100) score += 10;
    if (research.tags && research.tags.length > 2) score += 5;
    if (research.abundant_resources && research.abundant_resources.length > 0) score += 10;
    if (research.resource_deficits && research.resource_deficits.length > 0) score += 10;
    if (research.strategic_opportunities && research.strategic_opportunities.length > 0) score += 15;
    if (entityType === 'region' && research.major_industries && research.major_industries.length > 0) score += 10;
    if (entityType === 'government' && research.key_initiatives && research.key_initiatives.length > 0) score += 10;
  }

  return Math.min(score, 100);
}

async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { entityType, entityId, entityData } = await req.json();

    if (!entityType || (!entityId && !entityData)) {
      return new Response(
        JSON.stringify({ error: 'entityType and either entityId or entityData required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validTypes: EntityType[] = ['contact', 'company', 'government', 'region'];
    if (!validTypes.includes(entityType)) {
      return new Response(
        JSON.stringify({ error: `Invalid entityType. Must be one of: ${validTypes.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

    if (!perplexityApiKey) {
      console.error('PERPLEXITY_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Research API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Determine table based on entity type
    const tableMap: Record<string, string> = {
      contact: 'crm_contacts',
      company: 'crm_companies',
      government: 'crm_governments',
      region: 'crm_regions'
    };
    const tableName = tableMap[entityType as string];

    // Fetch entity if ID provided
    let entity = entityData;
    let targetId = entityId;

    if (entityId) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', entityId)
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: `${entityType} not found` }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      entity = data;
      targetId = data.id;
    }

    console.log(`Researching ${entityType}: ${entity.name || entity.first_name || 'Unknown'}`);

    // Perform research
    const research = await researchEntity(entityType, entity, perplexityApiKey);
    const matchScore = calculateMatchScore(entityType, entity, research);

    // Build update object based on entity type
    const updateData: Record<string, unknown> = {
      research_data: research ? {
        ...research,
        researched_at: new Date().toISOString()
      } : null,
      potential_match_score: matchScore,
      perplexity_last_researched: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add entity-type-specific fields
    if (research) {
      if (research.tags) {
        updateData.tags = [...new Set([...(entity.tags || []), ...research.tags, 'ai-researched'])];
      }
      if (research.abundant_resources) {
        updateData.abundant_resources = research.abundant_resources;
      }
      if (research.resource_deficits) {
        updateData.resource_deficits = research.resource_deficits;
      }
      if (research.strategic_opportunities) {
        updateData.strategic_opportunities = research.strategic_opportunities;
      }
      if (entityType === 'company' && research.industry) {
        updateData.industry = research.industry;
      }
      if (entityType === 'government' && research.key_initiatives) {
        updateData.key_initiatives = research.key_initiatives;
      }
      if (entityType === 'region') {
        if (research.major_industries) updateData.major_industries = research.major_industries;
        if (research.sustainability_challenges) updateData.sustainability_challenges = research.sustainability_challenges;
      }
    }

    // Update the entity
    if (targetId) {
      const { error: updateError } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', targetId);

      if (updateError) {
        console.error('Error updating entity:', updateError);
      }

      // Create entity embedding
      const embeddingContent = [
        entity.name || `${entity.first_name || ''} ${entity.last_name || ''}`.trim(),
        research?.summary || '',
        research?.industry || '',
        ...(research?.tags || []),
        ...(research?.abundant_resources || []),
        ...(research?.resource_deficits || []),
        ...(research?.major_industries || [])
      ].filter(Boolean).join(' ');

      if (embeddingContent.length > 20) {
        const { error: embedError } = await supabase
          .from('instincts_entity_embedding')
          .upsert({
            entity_type: entityType,
            entity_id: targetId,
            user_id: entity.user_id,
            content_hash: await hashContent(embeddingContent),
            metadata: {
              name: entity.name || `${entity.first_name || ''} ${entity.last_name || ''}`.trim(),
              type: entityType,
              industry: research?.industry,
              match_score: matchScore,
              tags: updateData.tags,
              abundant_resources: research?.abundant_resources,
              resource_deficits: research?.resource_deficits
            },
            updated_at: new Date().toISOString()
          }, { onConflict: 'entity_type,entity_id' });

        if (embedError) {
          console.error('Error creating embedding:', embedError);
        }
      }
    }

    console.log(`Research complete for ${entityType}. Match score: ${matchScore}`);

    return new Response(
      JSON.stringify({
        success: true,
        entityType,
        entityId: targetId,
        matchScore,
        research: research ? {
          summary: research.summary,
          abundant_resources: research.abundant_resources,
          resource_deficits: research.resource_deficits,
          strategic_opportunities: research.strategic_opportunities
        } : null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in research-entity:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

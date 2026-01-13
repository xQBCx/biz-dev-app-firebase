import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Personal email domains to skip company research
const PERSONAL_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
  'aol.com', 'live.com', 'msn.com', 'protonmail.com', 'mail.com',
  'ymail.com', 'googlemail.com', 'comcast.net', 'verizon.net', 'att.net',
  'me.com', 'mac.com'
];

interface ResearchResult {
  summary: string;
  industry?: string;
  services?: string[];
  tags?: string[];
  sources?: string[];
}

/**
 * Research a company domain using Perplexity AI
 */
async function researchCompanyDomain(domain: string, perplexityApiKey: string): Promise<ResearchResult | null> {
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
          {
            role: 'system',
            content: `You are a business intelligence researcher. Research companies and provide structured, factual information for CRM enrichment.

Return a JSON object with these fields:
- summary: 2-4 sentence description of what the company does, their value proposition, and target market
- industry: Primary industry category (e.g., "Real Estate Education", "Software", "Manufacturing")
- services: Array of 3-5 key services or products they offer
- tags: Array of 3-7 relevant business tags for categorization

Be factual and professional. Focus on business development relevance.`
          },
          {
            role: 'user',
            content: `Research the company at domain: ${domain}

What does this company do? Who are they? What industry are they in? What services or products do they offer?

Return ONLY valid JSON, no markdown.`
          }
        ],
        max_tokens: 800,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      console.error('Perplexity API error for company:', await response.text());
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) return null;

    // Try to parse JSON from response
    try {
      // Clean potential markdown code blocks
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      return {
        summary: parsed.summary || content,
        industry: parsed.industry,
        services: parsed.services || [],
        tags: parsed.tags || [],
        sources: data.citations || []
      };
    } catch {
      // If JSON parsing fails, use raw content as summary
      return {
        summary: content,
        sources: data.citations || []
      };
    }
  } catch (error) {
    console.error('Error researching company:', error);
    return null;
  }
}

/**
 * Research a person using Perplexity AI
 */
async function researchPerson(
  name: string, 
  domain: string | null, 
  linkedinUrl: string | null,
  perplexityApiKey: string
): Promise<ResearchResult | null> {
  try {
    const context = [];
    if (domain && !PERSONAL_EMAIL_DOMAINS.includes(domain)) {
      context.push(`Works at/associated with: ${domain}`);
    }
    if (linkedinUrl) {
      context.push(`LinkedIn: ${linkedinUrl}`);
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: `You are a business intelligence researcher. Research professionals and provide structured information for CRM enrichment and business development.

Return a JSON object with these fields:
- summary: 2-3 sentence professional bio - their role, expertise, and relevance for business development
- tags: Array of 3-5 relevant professional tags (skills, industries, roles)

Be factual. If limited information is found, say so. Focus on business development relevance.`
          },
          {
            role: 'user',
            content: `Research this professional: ${name}
${context.length > 0 ? '\nContext:\n' + context.join('\n') : ''}

Who is this person professionally? What is their role or expertise?

Return ONLY valid JSON, no markdown.`
          }
        ],
        max_tokens: 500,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      console.error('Perplexity API error for person:', await response.text());
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) return null;

    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      return {
        summary: parsed.summary || content,
        tags: parsed.tags || [],
        sources: data.citations || []
      };
    } catch {
      return {
        summary: content,
        sources: data.citations || []
      };
    }
  } catch (error) {
    console.error('Error researching person:', error);
    return null;
  }
}

/**
 * Calculate a potential match score based on research quality and data completeness
 */
function calculateMatchScore(
  contactData: Record<string, unknown>,
  personResearch: ResearchResult | null,
  companyResearch: ResearchResult | null
): number {
  let score = 10; // Base score for existing in CRM

  // Contact data completeness
  if (contactData.email) score += 10;
  if (contactData.phone) score += 5;
  if (contactData.linkedin_url) score += 10;
  if (contactData.title) score += 5;
  
  // Person research quality
  if (personResearch) {
    score += 15; // Research was successful
    if (personResearch.summary && personResearch.summary.length > 50) score += 10;
    if (personResearch.tags && personResearch.tags.length > 0) score += 5;
  }
  
  // Company research quality
  if (companyResearch) {
    score += 15; // Company research successful
    if (companyResearch.industry) score += 5;
    if (companyResearch.services && companyResearch.services.length > 0) score += 5;
  }

  // Cap at 100
  return Math.min(score, 100);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contactId } = await req.json();

    if (!contactId) {
      return new Response(
        JSON.stringify({ error: 'Contact ID is required' }),
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

    // Fetch the contact
    const { data: contact, error: contactError } = await supabase
      .from('crm_contacts')
      .select('*, crm_companies(*)')
      .eq('id', contactId)
      .single();

    if (contactError || !contact) {
      console.error('Contact not found:', contactError);
      return new Response(
        JSON.stringify({ error: 'Contact not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Researching contact: ${contact.first_name} ${contact.last_name} (${contact.email})`);

    // Extract domain from email
    const email = contact.email as string;
    const domain = email?.split('@')[1];
    const isPersonalEmail = domain ? PERSONAL_EMAIL_DOMAINS.includes(domain.toLowerCase()) : true;

    let companyResearch: ResearchResult | null = null;
    let personResearch: ResearchResult | null = null;
    let companyId = contact.company_id;
    let companyName = contact.crm_companies?.name || null;

    // Research company if not a personal email
    if (!isPersonalEmail && domain) {
      console.log(`Researching company domain: ${domain}`);
      companyResearch = await researchCompanyDomain(domain, perplexityApiKey);

      if (companyResearch) {
        // Check if company exists or create one
        if (!companyId) {
          // Try to find existing company by domain
          const { data: existingCompany } = await supabase
            .from('crm_companies')
            .select('id, name')
            .eq('user_id', contact.user_id)
            .or(`website.ilike.%${domain}%,name.ilike.%${domain.split('.')[0]}%`)
            .limit(1)
            .single();

          if (existingCompany) {
            companyId = existingCompany.id;
            companyName = existingCompany.name;
          } else {
            // Create new company
            const { data: newCompany, error: createError } = await supabase
              .from('crm_companies')
              .insert({
                user_id: contact.user_id,
                name: domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1),
                website: `https://${domain}`,
                industry: companyResearch.industry || null,
                description: companyResearch.summary,
                tags: companyResearch.tags || ['ai-researched']
              })
              .select()
              .single();

            if (!createError && newCompany) {
              companyId = newCompany.id;
              companyName = newCompany.name;
              console.log(`Created new company: ${newCompany.name}`);
            }
          }
        }

        // Update existing company with research
        if (companyId) {
          await supabase
            .from('crm_companies')
            .update({
              description: companyResearch.summary,
              industry: companyResearch.industry || undefined,
              website: `https://${domain}`,
              tags: companyResearch.tags || ['ai-researched'],
              updated_at: new Date().toISOString()
            })
            .eq('id', companyId);
        }
      }
    }

    // Research the person
    const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
    if (fullName) {
      console.log(`Researching person: ${fullName}`);
      personResearch = await researchPerson(
        fullName, 
        isPersonalEmail ? null : domain,
        contact.linkedin_url,
        perplexityApiKey
      );
    }

    // Calculate match score
    const matchScore = calculateMatchScore(contact, personResearch, companyResearch);

    // Build research data object
    const researchData = {
      person: personResearch ? {
        summary: personResearch.summary,
        tags: personResearch.tags,
        sources: personResearch.sources,
        researched_at: new Date().toISOString()
      } : null,
      company: companyResearch ? {
        domain,
        summary: companyResearch.summary,
        industry: companyResearch.industry,
        services: companyResearch.services,
        tags: companyResearch.tags,
        sources: companyResearch.sources,
        researched_at: new Date().toISOString()
      } : null
    };

    // Combine tags from both research results
    const combinedTags = [
      ...(contact.tags || []),
      ...(personResearch?.tags || []),
      'ai-researched'
    ].filter((tag, index, self) => self.indexOf(tag) === index); // Dedupe

    // Update contact with research data
    const { error: updateError } = await supabase
      .from('crm_contacts')
      .update({
        company_id: companyId || contact.company_id,
        research_data: researchData,
        potential_match_score: matchScore,
        perplexity_last_researched: new Date().toISOString(),
        tags: combinedTags,
        updated_at: new Date().toISOString()
      })
      .eq('id', contactId);

    if (updateError) {
      console.error('Error updating contact with research:', updateError);
    }

    // Create entity embedding for the contact
    const embeddingContent = [
      fullName,
      contact.email,
      contact.title || '',
      personResearch?.summary || '',
      companyName || '',
      companyResearch?.summary || '',
      companyResearch?.industry || '',
      ...(combinedTags || [])
    ].filter(Boolean).join(' ');

    if (embeddingContent.length > 20) {
      const { error: embedError } = await supabase
        .from('instincts_entity_embedding')
        .upsert({
          entity_type: 'contact',
          entity_id: contactId,
          user_id: contact.user_id,
          content_hash: await hashContent(embeddingContent),
          metadata: {
            name: fullName,
            email: contact.email,
            company: companyName,
            industry: companyResearch?.industry,
            match_score: matchScore,
            tags: combinedTags
          },
          updated_at: new Date().toISOString()
        }, { onConflict: 'entity_type,entity_id' });

      if (embedError) {
        console.error('Error creating contact embedding:', embedError);
      }
    }

    // Create entity embedding for the company if we have one
    if (companyId && companyResearch) {
      const companyEmbeddingContent = [
        companyName,
        companyResearch.summary,
        companyResearch.industry || '',
        ...(companyResearch.services || []),
        ...(companyResearch.tags || [])
      ].filter(Boolean).join(' ');

      const { error: companyEmbedError } = await supabase
        .from('instincts_entity_embedding')
        .upsert({
          entity_type: 'company',
          entity_id: companyId,
          user_id: contact.user_id,
          content_hash: await hashContent(companyEmbeddingContent),
          metadata: {
            name: companyName,
            domain,
            industry: companyResearch.industry,
            services: companyResearch.services,
            tags: companyResearch.tags
          },
          updated_at: new Date().toISOString()
        }, { onConflict: 'entity_type,entity_id' });

      if (companyEmbedError) {
        console.error('Error creating company embedding:', companyEmbedError);
      }
    }

    console.log(`Research complete for ${fullName}. Match score: ${matchScore}`);

    return new Response(
      JSON.stringify({
        success: true,
        contactId,
        matchScore,
        personResearched: !!personResearch,
        companyResearched: !!companyResearch,
        companyId,
        companyName
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in research-and-embed-contact:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Simple hash function for content deduplication
 */
async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

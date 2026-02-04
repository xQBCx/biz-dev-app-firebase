import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const audiencePrompts: Record<string, string> = {
  office_building: "office building managers and facility directors who need to keep employee vehicles clean",
  golf_course: "golf course managers looking to offer premium vehicle detailing services to members",
  high_income_neighborhood: "affluent homeowners in upscale neighborhoods who value convenience and quality",
  dealership_small: "small and medium car dealership owners who need lot preparation and customer vehicle detailing",
  dealership_luxury: "luxury car dealership managers who require premium detailing for high-end vehicles",
  fleet_company: "fleet managers and logistics companies who need to maintain large vehicle fleets"
};

const platformGuidelines: Record<string, string> = {
  facebook: "Write for Facebook: engaging, conversational tone, 100-200 words, include a call-to-action",
  instagram: "Write for Instagram: visual-focused, use emojis sparingly, include relevant hashtags, 100-150 words",
  linkedin: "Write for LinkedIn: professional B2B tone, focus on business value and ROI, 150-250 words",
  google_business: "Write for Google Business: local SEO focused, mention Houston/Harris County, include services and contact info"
};

const contentTypePrompts: Record<string, string> = {
  social_post: "Create a social media post",
  email_template: "Create a professional marketing email with subject line, greeting, body, and call-to-action",
  ad_copy: "Create compelling ad copy with headline, body text, and call-to-action",
  direct_mail: "Create a direct mail letter with attention-grabbing headline and professional body",
  sms_template: "Create a brief SMS message under 160 characters with a clear call-to-action"
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentType, targetAudience, platform, topic, businessName } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const audienceContext = audiencePrompts[targetAudience] || "potential customers";
    const platformGuide = platform ? platformGuidelines[platform] : "";
    const contentTypeGuide = contentTypePrompts[contentType] || "Create marketing content";

    const systemPrompt = `You are an expert marketing copywriter for ${businessName}, a premium mobile auto detailing service in Houston, Texas. 

CRITICAL FORMATTING RULES:
- DO NOT use markdown formatting (no **, ##, *, etc.)
- Write in plain text only
- Use line breaks for structure instead of markdown headers
- Use dashes (-) for bullet points if needed, not asterisks

Your content should:
- Highlight the convenience of mobile service (we come to you)
- Emphasize professional quality and attention to detail
- Include local Houston/Harris County references when appropriate
- Be persuasive but not pushy
- Focus on benefits over features`;

    const userPrompt = `${contentTypeGuide} targeting ${audienceContext}.
${platformGuide}

Topic/Focus: ${topic}

Business: ${businessName} - Premium Mobile Auto Detailing
Services: Full detail, interior cleaning, exterior wash, ceramic coating, fleet maintenance, dealership lot prep
Location: Houston & Harris County, Texas
Unique Value: We come to you - home, office, or anywhere`;

    console.log('Generating content with Lovable AI...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content || '';

    console.log('Content generated successfully');

    return new Response(
      JSON.stringify({ 
        content: generatedContent,
        title: `${contentType.replace('_', ' ')} - ${targetAudience.replace('_', ' ')}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating content:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

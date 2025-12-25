import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { brandConfigId, signalId } = await req.json();

    // Fetch brand config with franchise data
    const { data: brandConfig, error: configError } = await supabase
      .from('brand_marketing_config')
      .select(`
        *,
        franchises (
          name,
          brand_name,
          description,
          industry
        )
      `)
      .eq('id', brandConfigId)
      .eq('user_id', user.id)
      .single();

    if (configError || !brandConfig) {
      throw new Error('Brand config not found');
    }

    // Fetch recent market signals (from Sytuation)
    let marketDrivers: string[] = [];
    const { data: signals } = await supabase
      .from('situation_signals')
      .select('content, severity')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (signals && signals.length > 0) {
      marketDrivers = signals.map((s: any) => s.content);
    }

    // If specific signal provided, use it
    if (signalId) {
      const { data: signal } = await supabase
        .from('situation_signals')
        .select('content')
        .eq('id', signalId)
        .single();
      if (signal) {
        marketDrivers = [signal.content, ...marketDrivers];
      }
    }

    // Build context for AI
    const brandContext = {
      brandName: brandConfig.franchises?.brand_name || 'Unknown Brand',
      industry: brandConfig.franchises?.industry || 'general',
      description: brandConfig.franchises?.description || '',
      voice: brandConfig.brand_voice || 'professional',
      themes: brandConfig.content_themes || [],
      audiences: brandConfig.target_audiences || [],
      marketDrivers,
    };

    const contentTypes = brandConfig.content_types_enabled || ['blog', 'social_post', 'email'];
    const generatedContent: any[] = [];

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Generate content for each enabled type
    for (const contentType of contentTypes) {
      const prompt = buildPrompt(contentType, brandContext);
      
      console.log(`Generating ${contentType} for ${brandContext.brandName}`);

      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { 
              role: 'system', 
              content: `You are a marketing content strategist for ${brandContext.brandName}. 
              Create compelling, on-brand content that addresses current market trends and drivers.
              Brand voice: ${brandContext.voice}
              Target audiences: ${brandContext.audiences.join(', ')}
              Content themes: ${brandContext.themes.join(', ')}`
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8,
        }),
      });

      if (!aiResponse.ok) {
        console.error(`AI generation failed for ${contentType}:`, await aiResponse.text());
        continue;
      }

      const aiData = await aiResponse.json();
      const generatedText = aiData.choices?.[0]?.message?.content;

      if (!generatedText) {
        console.error(`No content generated for ${contentType}`);
        continue;
      }

      // Parse the generated content
      const parsed = parseGeneratedContent(contentType, generatedText);

      // Insert into content queue
      const { data: inserted, error: insertError } = await supabase
        .from('marketing_content_queue')
        .insert({
          brand_config_id: brandConfigId,
          user_id: user.id,
          content_type: contentType,
          title: parsed.title,
          content: parsed.content,
          market_driver: marketDrivers[0] || 'Scheduled generation',
          market_driver_signal_id: signalId || null,
          status: 'pending',
          priority: signalId ? 'high' : 'normal',
          ai_model_used: 'google/gemini-2.5-flash',
          generation_prompt: prompt,
        })
        .select()
        .single();

      if (insertError) {
        console.error(`Failed to insert ${contentType}:`, insertError);
        continue;
      }

      generatedContent.push(inserted);
    }

    // Update last generation timestamp
    await supabase
      .from('brand_marketing_config')
      .update({ last_content_generated_at: new Date().toISOString() })
      .eq('id', brandConfigId);

    // Send notification if configured
    if (brandConfig.notification_email && generatedContent.length > 0) {
      console.log(`Notification would be sent to ${brandConfig.notification_email}`);
      // TODO: Integrate with email sending
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        contentCount: generatedContent.length,
        content: generatedContent 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Brand content generation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Generation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildPrompt(contentType: string, context: any): string {
  const marketContext = context.marketDrivers.length > 0
    ? `Current market drivers and signals:\n${context.marketDrivers.slice(0, 3).map((d: string, i: number) => `${i + 1}. ${d}`).join('\n')}`
    : 'Focus on industry best practices and thought leadership.';

  switch (contentType) {
    case 'blog':
      return `Create a blog post for ${context.brandName} in the ${context.industry} industry.

${marketContext}

Requirements:
- Title should be SEO-optimized and engaging
- 400-600 words
- Include a clear call-to-action
- Address one of the market drivers above

Format your response as:
TITLE: [Your title here]
CONTENT:
[Your blog post content here]`;

    case 'social_post':
      return `Create a LinkedIn post for ${context.brandName}.

${marketContext}

Requirements:
- Maximum 300 characters
- Professional but engaging tone
- Include relevant emoji where appropriate
- End with a question or call-to-action

Format your response as:
TITLE: [Brief description]
CONTENT:
[Your social post here]`;

    case 'email':
      return `Create a marketing email for ${context.brandName}.

${marketContext}

Requirements:
- Subject line that drives opens
- 150-250 words body
- Clear value proposition
- One primary CTA

Format your response as:
TITLE: [Subject line]
CONTENT:
[Email body here]`;

    case 'image':
    case 'flyer':
      return `Create a description for a marketing image/flyer for ${context.brandName}.

${marketContext}

Requirements:
- Describe the visual elements
- Headline text (max 8 words)
- Subheadline/body text
- Call-to-action

Format your response as:
TITLE: [Headline]
CONTENT:
[Visual description and all text elements]`;

    case 'video':
      return `Create a 30-second video script for ${context.brandName}.

${marketContext}

Requirements:
- Hook in first 3 seconds
- Clear message
- Call-to-action at end
- Include visual directions

Format your response as:
TITLE: [Video title]
CONTENT:
[Full script with visual cues]`;

    case 'audio':
      return `Create a 60-second podcast intro or audio ad for ${context.brandName}.

${marketContext}

Requirements:
- Engaging hook
- Clear brand positioning
- Natural speaking style
- Call-to-action

Format your response as:
TITLE: [Audio piece title]
CONTENT:
[Full script]`;

    default:
      return `Create marketing content for ${context.brandName}. ${marketContext}`;
  }
}

function parseGeneratedContent(contentType: string, text: string): { title: string; content: string } {
  const titleMatch = text.match(/TITLE:\s*(.+?)(?:\n|CONTENT:)/s);
  const contentMatch = text.match(/CONTENT:\s*([\s\S]+)/);

  const title = titleMatch 
    ? titleMatch[1].trim() 
    : `${contentType.charAt(0).toUpperCase() + contentType.slice(1).replace('_', ' ')} - ${new Date().toLocaleDateString()}`;
  
  const content = contentMatch 
    ? contentMatch[1].trim() 
    : text;

  return { title, content };
}
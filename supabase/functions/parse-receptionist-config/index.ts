import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { configText } = await req.json();

    if (!configText) {
      throw new Error('Configuration text is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Use AI to parse natural language into structured rules
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: `You are an AI assistant that converts natural language call routing instructions into structured JSON rules. 
Extract the following information:
- Emergency handling: How to route emergency calls
- Business call handling: Rules for existing clients vs new prospects, payment verification, routing logic
- Personal call handling: How to handle family/friends calls, message taking

Return ONLY valid JSON with this structure:
{
  "emergency": { "description": "...", "action": "direct_connect", "priority": "high" },
  "business": { 
    "description": "...",
    "client_check": true,
    "payment_verification": true,
    "new_prospect_routing": "...",
    "billing_enabled": true
  },
  "personal": { "description": "...", "action": "take_message", "notify": true }
}`
          },
          {
            role: 'user',
            content: configText
          }
        ]
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI API error:', error);
      throw new Error('Failed to parse configuration');
    }

    const data = await response.json();
    const parsedRules = JSON.parse(data.choices[0].message.content);

    console.log('Parsed receptionist rules:', parsedRules);

    return new Response(
      JSON.stringify({ 
        success: true,
        rules: parsedRules
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error parsing receptionist config:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

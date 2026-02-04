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
    const { images } = await req.json();
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      throw new Error('No images provided');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build content array with all images
    const imageContent = images.map((imageBase64: string) => ({
      type: 'image_url',
      image_url: {
        url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
      }
    }));

    // Use Lovable AI's vision model to analyze the vehicle
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
            content: `You are an expert vehicle detailing assessor. Analyze ALL provided vehicle images comprehensively (exterior, interior, engine, trunk, etc.) and provide detailed assessments in JSON format.

Consider all images together to provide the most accurate recommendations. If multiple images show different areas, analyze each area.

Your response MUST be valid JSON with this exact structure:
{
  "vehicleType": "string (e.g., sedan, SUV, truck, van, coupe, sports car)",
  "vehicleCondition": "string (clean, moderately dirty, very dirty, or extremely dirty)",
  "cleanlinesScore": number (1-10, where 10 is pristine),
  "recommendedServices": [
    {
      "service": "string (basic-wash, standard-detail, premium-detail, or full-detail)",
      "reason": "string (why this service is recommended based on all images)",
      "priority": "string (high, medium, or low)"
    }
  ],
  "estimatedDuration": number (minutes),
  "specialProducts": [
    "string (any special products needed, e.g., pet hair remover, odor eliminator, leather conditioner)"
  ],
  "recommendedAddOns": [
    {
      "name": "string (e.g., Headlight Restoration, Leather Protection & Conditioning, Pet Hair Removal, Engine Bay Cleaning, Carpet Seat Extraction, Dashboard & Trim UV Protectant, Window Rain Repellant, Decon & Clay Bar, Odor Removal)",
      "price": number (in dollars),
      "reason": "string (why this add-on is specifically recommended based on the images)",
      "priority": "string (recommended or optional)"
    }
  ],
  "longTermBenefits": {
    "resaleValue": "string (how regular detailing preserves resale value - include specific percentage data like '14-20% higher resale value')",
    "maintenanceSavings": "string (how it reduces future maintenance costs)",
    "longevity": "string (how it extends vehicle lifespan and component protection)"
  },
  "detailedAssessment": {
    "exterior": "string (condition of paint, wheels, windows based on exterior images)",
    "interior": "string (if visible - seats, dashboard, carpets based on interior images)",
    "concerns": ["string (any specific problem areas seen across all images)"]
  }
}

Available Add-Ons Reference:
- Headlight Restoration: $65 (for cloudy/yellowed headlights)
- Leather Protection & Conditioning: $40 (for dry/cracked leather)
- Pet Hair Removal: $25+ (if pet hair visible)
- Engine Bay Cleaning: $35 (basic) or $50 (deep cleaning)
- Carpet Seat Extraction: $75+ (for stained fabric seats)
- Carpet Floor Shampoo: $35+ (for dirty carpets/mats)
- Car Seat Deep Clean: $15 per seat
- Decon & Clay Bar: $100 (removes bonded contaminants)
- Dashboard & Trim UV Protectant: $35 (prevents fading/cracking)
- Window Rain Repellant: $50+ (improves visibility)
- ACID Water-spot Removing: $75+ (for hard water stains)
- Mild Scratch Repair: $75+ (for light scratches)
- Odor Removal: $40 (for persistent odors)
- Leather Seat Ceramic Coating: $50 per seat (annual protection)

Industry Data to Reference:
- Regular detailing maintains 14-20% higher resale value
- Professional cleaning extends interior life by 30-40%
- UV protection prevents $500-1500 in dashboard/leather replacement costs
- Paint protection reduces oxidation and maintains clear coat for 5+ years
- Regular maintenance reduces long-term repair costs by up to 25%`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze these ${images.length} vehicle image(s) comprehensively and provide a detailed assessment for detailing services. Consider all areas shown across all images. Return ONLY valid JSON, no markdown formatting.`
              },
              ...imageContent
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    let analysis;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      analysis = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid AI response format');
    }

    return new Response(
      JSON.stringify({ analysis }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in analyze-vehicle:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

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
    const { images, description, assetType, category } = await req.json();
    
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

    // Context about the asset
    const assetContext = `
Asset Type: ${assetType || 'Unknown'}
Category: ${category || 'General'}
User Description: ${description || 'No description provided'}
`;

    // Use Lovable AI's vision model to analyze the asset
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
            content: `You are an expert industrial maintenance assessor and field service triage specialist. You analyze photos of buildings, equipment, railcars, HVAC systems, plumbing, electrical systems, and industrial assets to diagnose issues and recommend appropriate action.

Your job is to:
1. Identify the issue type and severity
2. Classify affected components
3. Determine if remote resolution is possible or if a field visit is needed
4. Suggest troubleshooting steps
5. Estimate repair complexity and urgency

Your response MUST be valid JSON with this exact structure:
{
  "issueClassification": {
    "primaryCategory": "string (hvac, plumbing, electrical, structural, mechanical, safety, cosmetic, other)",
    "subcategory": "string (more specific classification)",
    "issueType": "string (malfunction, damage, wear, leak, blockage, failure, etc.)"
  },
  "severity": {
    "level": "string (low, normal, high, emergency)",
    "safetyRisk": boolean,
    "operationalImpact": "string (none, minimal, moderate, severe, critical)",
    "reasoning": "string (why this severity level)"
  },
  "affectedComponents": [
    {
      "name": "string",
      "type": "string (mechanical, electrical, structural, plumbing, hvac, control_system, etc.)",
      "criticality": "string (non_critical, critical, safety_critical)",
      "condition": "string (good, fair, poor, failed)",
      "notes": "string"
    }
  ],
  "diagnosis": {
    "likelyRootCause": "string",
    "confidence": "string (high, medium, low)",
    "additionalInformationNeeded": ["string"],
    "differentialDiagnosis": ["string (other possible causes)"]
  },
  "remoteResolutionPossible": boolean,
  "remoteResolutionSteps": [
    {
      "step": number,
      "action": "string",
      "safetyNote": "string (optional)"
    }
  ],
  "fieldVisitRequired": boolean,
  "fieldVisitReason": "string (if field visit required)",
  "recommendedAction": {
    "immediate": "string (what to do right now)",
    "shortTerm": "string (within 24-48 hours)",
    "longTerm": "string (preventive measures)"
  },
  "estimatedRepair": {
    "complexity": "string (simple, moderate, complex, specialized)",
    "estimatedDuration": "string (e.g., 1-2 hours, half day, full day)",
    "skillsRequired": ["string"],
    "specialToolsRequired": ["string"],
    "partsLikelyNeeded": ["string"]
  },
  "knowledgeBaseRecommendations": ["string (topics or guides that might help)"],
  "visualAssessment": {
    "visibleDamage": "string",
    "contaminants": "string (rust, mold, debris, etc.)",
    "ageIndicators": "string",
    "maintenanceState": "string (well-maintained, neglected, unknown)"
  },
  "summary": "string (2-3 sentence summary of the issue and recommended next steps)"
}

Industry Categories Reference:
- HVAC: heating, cooling, ventilation, refrigeration, thermostats, ductwork, compressors
- Plumbing: pipes, fixtures, drains, water heaters, pumps, valves, sewage
- Electrical: wiring, panels, outlets, lighting, motors, controls, transformers
- Structural: walls, floors, roofs, foundations, doors, windows, insulation
- Mechanical: motors, bearings, belts, gears, actuators, conveyors, lifts
- Safety: fire systems, alarms, emergency equipment, guards, barriers
- Railcar: wheels, brakes, couplers, doors, HVAC, interior, exterior shell
- Equipment: industrial machinery, production equipment, tools, instrumentation`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze these ${images.length} image(s) of an asset that needs maintenance attention. Provide a comprehensive triage assessment.

${assetContext}

Return ONLY valid JSON, no markdown formatting.`
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
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service credits exhausted. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
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

    console.log('AI Asset Triage completed successfully');

    return new Response(
      JSON.stringify({ analysis }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in ai-asset-triage:', error);
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

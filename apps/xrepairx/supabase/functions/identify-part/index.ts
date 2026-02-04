import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PartIdentificationRequest {
  imageUrls: string[];
  description?: string;
  assetType?: string;
  componentType?: string;
  existingCadLibrary?: Array<{
    id: string;
    name: string;
    partType: string;
    oemPartNumbers: string[];
    category: string;
  }>;
}

interface IdentifiedPart {
  partName: string;
  partType: string;
  manufacturer: string | null;
  modelNumber: string | null;
  confidenceScore: number;
  description: string;
  dimensions: {
    estimatedWidth: string;
    estimatedHeight: string;
    estimatedDepth: string;
  };
  material: string;
  condition: string;
  failureMode: string;
  canPrintInField: boolean;
  printComplexity: 'low' | 'medium' | 'high';
  recommendedAction: 'print_now' | 'order_oem' | 'custom_design_needed' | 'repair_existing';
  actionRationale: string;
  matchedCadIds: string[];
  printSpecifications: {
    recommendedMaterial: string;
    infillPercent: number;
    layerHeight: number;
    supportsNeeded: boolean;
    estimatedPrintTimeMinutes: number;
    estimatedMaterialGrams: number;
  } | null;
  alternativeParts: Array<{
    name: string;
    source: string;
    estimatedCost: string;
    leadTime: string;
  }>;
  safetyConsiderations: string[];
  installationNotes: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrls, description, assetType, componentType, existingCadLibrary } = 
      await req.json() as PartIdentificationRequest;

    if (!imageUrls || imageUrls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one image URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build CAD library context for matching
    const cadLibraryContext = existingCadLibrary && existingCadLibrary.length > 0
      ? `\n\nEXISTING CAD LIBRARY FOR MATCHING:\n${existingCadLibrary.map(c => 
          `- ID: ${c.id}, Name: ${c.name}, Type: ${c.partType}, Category: ${c.category}, OEM#: ${c.oemPartNumbers.join(', ')}`
        ).join('\n')}`
      : '';

    const systemPrompt = `You are an expert industrial parts identification AI for xREPAIRx, a platform focused on buildings, railcars, equipment, and industrial assets. Your role is to:

1. IDENTIFY the damaged or failed part from images with high precision
2. DETERMINE if the part can be 3D printed in the field or needs to be ordered from OEM
3. MATCH against existing CAD library entries when available
4. PROVIDE detailed specifications for printing if applicable
5. ASSESS safety implications and installation requirements

You specialize in:
- HVAC components (brackets, covers, gaskets, fittings, handles)
- Plumbing fixtures and fittings
- Electrical enclosures and brackets
- Structural supports and brackets
- Railcar components (latches, handles, covers, brackets)
- Equipment housings, guards, and covers
- Building hardware (door handles, hinges, window parts)

For 3D PRINTABLE parts, consider:
- Mechanical load requirements
- Temperature resistance needs
- UV/weather exposure
- Chemical resistance requirements
- Dimensional tolerances needed
- Safety-critical vs non-critical application

CRITICAL: Be conservative about recommending printing for:
- Pressure-bearing components
- Safety-critical structural parts
- Parts requiring specific certifications
- High-temperature applications (>80°C continuous)
- Parts requiring electrical conductivity
${cadLibraryContext}

Respond with a JSON object following this exact structure:
{
  "partName": "Human-readable name of the identified part",
  "partType": "bracket|fitting|cover|gasket|handle|panel|hinge|latch|guard|housing|connector|other",
  "manufacturer": "Identified manufacturer or null",
  "modelNumber": "Identified model/part number or null",
  "confidenceScore": 85,
  "description": "Detailed description of the part and its function",
  "dimensions": {
    "estimatedWidth": "50mm",
    "estimatedHeight": "30mm", 
    "estimatedDepth": "15mm"
  },
  "material": "Original material (e.g., ABS plastic, steel, aluminum)",
  "condition": "Broken|Worn|Corroded|Missing|Cracked|Deformed",
  "failureMode": "Description of how/why the part failed",
  "canPrintInField": true,
  "printComplexity": "low|medium|high",
  "recommendedAction": "print_now|order_oem|custom_design_needed|repair_existing",
  "actionRationale": "Explanation of why this action is recommended",
  "matchedCadIds": ["uuid1", "uuid2"],
  "printSpecifications": {
    "recommendedMaterial": "PETG",
    "infillPercent": 40,
    "layerHeight": 0.2,
    "supportsNeeded": false,
    "estimatedPrintTimeMinutes": 45,
    "estimatedMaterialGrams": 25
  },
  "alternativeParts": [
    {
      "name": "OEM Replacement",
      "source": "Manufacturer",
      "estimatedCost": "$45",
      "leadTime": "3-5 days"
    }
  ],
  "safetyConsiderations": ["List of safety notes"],
  "installationNotes": "Brief installation guidance"
}`;

    const userContent: any[] = [
      {
        type: "text",
        text: `Analyze these images and identify the part that needs repair or replacement.

${assetType ? `Asset Type: ${assetType}` : ''}
${componentType ? `Component Type: ${componentType}` : ''}
${description ? `Problem Description: ${description}` : ''}

Please provide a complete part identification with fabrication recommendations.`
      }
    ];

    // Add images to the request
    for (const url of imageUrls.slice(0, 4)) { // Limit to 4 images
      userContent.push({
        type: "image_url",
        image_url: { url }
      });
    }

    console.log('Calling Lovable AI for part identification...');

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
          { role: 'user', content: userContent }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service quota exceeded. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse the JSON response
    let result: IdentifiedPart;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonString = jsonMatch[1].trim();
      result = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse part identification result');
    }

    console.log('Part identification complete:', result.partName, 'Confidence:', result.confidenceScore);

    return new Response(
      JSON.stringify({
        success: true,
        identification: result,
        analyzedImages: imageUrls.length,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Part identification error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Part identification failed',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

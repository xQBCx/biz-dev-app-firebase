import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requirement, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const authHeader = req.headers.get('Authorization');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Create Supabase client for auth and logging
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader! } } }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build system prompt for code generation
    const systemPrompt = `You are an expert full-stack developer specializing in React, TypeScript, Tailwind CSS, and Supabase.

Your task is to generate production-ready code based on user requirements. Follow these guidelines:
- Use modern React best practices (functional components, hooks)
- Use TypeScript with proper typing
- Use Tailwind CSS for styling with semantic tokens
- Follow component composition patterns
- Include error handling and loading states
- Use Supabase client for backend operations
- Generate clean, maintainable, and well-documented code

Context about the current project:
${context || 'No additional context provided'}

Generate ONLY the code requested. Format your response as JSON with this structure:
{
  "files": [
    {
      "path": "relative/path/to/file.tsx",
      "content": "// file content here",
      "description": "Brief description of what this file does"
    }
  ],
  "explanation": "Brief explanation of the implementation",
  "dependencies": ["package-name@version"] // if any new packages are needed
}`;

    console.log('Generating code for requirement:', requirement);

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
          { role: 'user', content: requirement }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('No code generated');
    }

    console.log('Code generated successfully');

    // Parse the JSON response
    let codeResponse;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = generatedContent.match(/```json\n([\s\S]*?)\n```/) || 
                        generatedContent.match(/```\n([\s\S]*?)\n```/);
      const jsonContent = jsonMatch ? jsonMatch[1] : generatedContent;
      codeResponse = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // If parsing fails, wrap the raw content
      codeResponse = {
        files: [{
          path: 'generated-code.tsx',
          content: generatedContent,
          description: 'Generated code'
        }],
        explanation: 'Code generation completed. Please review before applying.',
        dependencies: []
      };
    }

    // Create a code generation request record
    const { data: codeGenRecord, error: insertError } = await supabase
      .from('mcp_code_generations')
      .insert({
        user_id: user.id,
        requirement,
        generated_code: codeResponse,
        status: 'pending_review',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving code generation:', insertError);
      throw insertError;
    }

    // Log the action
    await supabase.from('ai_audit_logs').insert({
      user_id: user.id,
      action: 'code_generation',
      entity_type: 'mcp_code_generation',
      entity_id: codeGenRecord.id,
      new_values: {
        requirement,
        files_count: codeResponse.files?.length || 0,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        generation_id: codeGenRecord.id,
        code: codeResponse,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-code:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

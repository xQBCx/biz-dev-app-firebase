import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, contentType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating blog content for prompt:", prompt);

    const systemPrompt = `You are a fitness and wellness content creator for a personal training platform. 
Your content should be:
- Engaging, informative, and actionable
- Written in a motivating but professional tone
- Based on current fitness and nutrition science
- Practical for everyday people trying to improve their health

You have access to current fitness trends and research. Create content that is both educational and inspiring.`;

    const userPrompt = `Create a ${contentType || 'article'} about: "${prompt}"

Please provide:
1. A catchy, SEO-friendly title
2. Full article content (500-800 words for articles)
3. A brief excerpt (1-2 sentences)
4. 3-5 relevant tags

Format your response as JSON:
{
  "title": "...",
  "content": "...",
  "excerpt": "...",
  "tags": ["tag1", "tag2", ...]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_blog_post",
              description: "Create a structured blog post with title, content, excerpt, and tags",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "The blog post title" },
                  content: { type: "string", description: "The full blog post content" },
                  excerpt: { type: "string", description: "A brief 1-2 sentence summary" },
                  tags: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "3-5 relevant tags"
                  }
                },
                required: ["title", "content", "excerpt", "tags"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_blog_post" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data));

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const blogPost = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(blogPost), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: try to parse from content
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return new Response(JSON.stringify(parsed), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (e) {
        console.error("Failed to parse content as JSON:", e);
      }
    }

    throw new Error("Failed to generate structured content");
  } catch (error) {
    console.error("Error in generate-blog-content:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate content";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

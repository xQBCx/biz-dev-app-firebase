import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RegisterProviderRequest {
  name: string;
  description?: string;
  provider_type: "sensor" | "api" | "manual" | "attestation" | "price_feed" | "iot_device";
  endpoint_url?: string;
  auth_config?: Record<string, unknown>;
  data_schema?: Record<string, unknown>;
  trust_level?: "bronze" | "silver" | "gold" | "platinum";
  metadata?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: RegisterProviderRequest = await req.json();

    // Validate required fields
    if (!body.name || !body.provider_type) {
      return new Response(JSON.stringify({ error: "Name and provider_type are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create the oracle provider
    const { data: provider, error: providerError } = await supabase
      .from("oracle_data_providers")
      .insert({
        name: body.name,
        description: body.description,
        provider_type: body.provider_type,
        endpoint_url: body.endpoint_url,
        auth_config: body.auth_config,
        data_schema: body.data_schema,
        trust_level: body.trust_level || "bronze",
        owner_user_id: user.id,
        metadata: body.metadata || {},
      })
      .select()
      .single();

    if (providerError) {
      console.error("Error creating provider:", providerError);
      return new Response(JSON.stringify({ error: providerError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Oracle provider created: ${provider.id} by user ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        provider,
        message: `Oracle provider "${body.name}" registered successfully`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in oracle-register-provider:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

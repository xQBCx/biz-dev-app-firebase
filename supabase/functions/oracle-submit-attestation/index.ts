import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubmitAttestationRequest {
  provider_id?: string;
  attestation_type: "field_supervisor" | "quality_inspector" | "auditor" | "compliance_officer" | "executive" | "third_party";
  subject_entity_type: string; // e.g., "work_order", "delivery", "inspection", "milestone"
  subject_entity_id: string;
  deal_room_id?: string;
  settlement_contract_id?: string;
  attestation_data: Record<string, unknown>;
  geolocation?: { lat: number; lng: number };
  device_info?: Record<string, unknown>;
  photo_evidence_urls?: string[];
  expires_at?: string;
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

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: SubmitAttestationRequest = await req.json();

    // Validate required fields
    if (!body.attestation_type || !body.subject_entity_type || !body.subject_entity_id || !body.attestation_data) {
      return new Response(JSON.stringify({ 
        error: "attestation_type, subject_entity_type, subject_entity_id, and attestation_data are required" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate signature hash (simplified - in production use proper cryptographic signing)
    const signaturePayload = JSON.stringify({
      attester: user.id,
      type: body.attestation_type,
      subject: `${body.subject_entity_type}:${body.subject_entity_id}`,
      data: body.attestation_data,
      timestamp: new Date().toISOString(),
    });
    
    // Simple hash using Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(signaturePayload);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signatureHash = "0x" + hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    // Create the attestation
    const { data: attestation, error: attestationError } = await serviceClient
      .from("oracle_attestations")
      .insert({
        provider_id: body.provider_id || null,
        attester_id: user.id,
        attestation_type: body.attestation_type,
        subject_entity_type: body.subject_entity_type,
        subject_entity_id: body.subject_entity_id,
        deal_room_id: body.deal_room_id || null,
        settlement_contract_id: body.settlement_contract_id || null,
        attestation_data: body.attestation_data,
        signature_hash: signatureHash,
        geolocation: body.geolocation || null,
        device_info: body.device_info || null,
        photo_evidence_urls: body.photo_evidence_urls || [],
        expires_at: body.expires_at || null,
        is_verified: false,
      })
      .select()
      .single();

    if (attestationError) {
      console.error("Error creating attestation:", attestationError);
      return new Response(JSON.stringify({ error: attestationError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if any oracle conditions are now met
    if (body.deal_room_id || body.settlement_contract_id) {
      const conditionsQuery = serviceClient
        .from("oracle_conditions")
        .select("*")
        .eq("attestation_type", body.attestation_type)
        .eq("is_met", false);

      if (body.deal_room_id) {
        conditionsQuery.eq("deal_room_id", body.deal_room_id);
      }
      if (body.settlement_contract_id) {
        conditionsQuery.eq("settlement_contract_id", body.settlement_contract_id);
      }

      const { data: conditions } = await conditionsQuery;

      if (conditions && conditions.length > 0) {
        // Mark conditions as met
        for (const condition of conditions) {
          await serviceClient
            .from("oracle_conditions")
            .update({
              is_met: true,
              met_at: new Date().toISOString(),
              last_checked_at: new Date().toISOString(),
            })
            .eq("id", condition.id);

          console.log(`Condition ${condition.id} marked as met by attestation ${attestation.id}`);
        }
      }
    }

    console.log(`Attestation submitted: ${attestation.id} by ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        attestation,
        signature_hash: signatureHash,
        message: `Attestation for ${body.subject_entity_type}:${body.subject_entity_id} submitted successfully`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in oracle-submit-attestation:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

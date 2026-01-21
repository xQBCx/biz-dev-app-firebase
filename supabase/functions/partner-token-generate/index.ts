import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Partner Token Generation Function
 * 
 * Admin-only endpoint to generate secure API tokens for partners
 * like Optimo IT to integrate with the Biz Dev platform.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Verify admin authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Admin privileges required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, ...params } = await req.json();

    switch (action) {
      case "generate": {
        const {
          partner_name,
          partner_slug,
          contact_name,
          contact_email,
          scopes,
          rate_limit_per_minute,
          allowed_deal_room_ids,
          allowed_hubspot_accounts,
          metadata,
        } = params;

        if (!partner_name || !partner_slug) {
          return new Response(
            JSON.stringify({ error: "partner_name and partner_slug are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Generate secure API token: pit_ + two UUIDs
        const uuid1 = crypto.randomUUID();
        const uuid2 = crypto.randomUUID();
        const apiToken = `pit_${uuid1}_${uuid2}`;
        const apiKeyPrefix = apiToken.substring(0, 12); // "pit_xxxxxxxx"

        // Hash the token for storage using SHA-256
        const encoder = new TextEncoder();
        const data = encoder.encode(apiToken);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const apiKeyHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

        // Insert partner integration
        const { data: partner, error: insertError } = await supabase
          .from("partner_integrations")
          .insert({
            partner_name,
            partner_slug,
            contact_name,
            contact_email,
            api_key_hash: apiKeyHash,
            api_key_prefix: apiKeyPrefix,
            scopes: scopes || [],
            rate_limit_per_minute: rate_limit_per_minute || 100,
            allowed_deal_room_ids: allowed_deal_room_ids || [],
            allowed_hubspot_accounts: allowed_hubspot_accounts || [],
            created_by: user.id,
            metadata: metadata || {},
          })
          .select()
          .single();

        if (insertError) {
          console.error("[partner-token] Insert error:", insertError);
          return new Response(
            JSON.stringify({ error: insertError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Log the token generation
        await supabase.from("partner_api_logs").insert({
          partner_id: partner.id,
          action: "token_generated",
          response_status: 200,
          response_summary: "API token generated successfully",
        });

        console.log(`[partner-token] Generated token for partner: ${partner_name}`);

        // Return the token ONCE - it won't be retrievable again
        return new Response(
          JSON.stringify({
            success: true,
            partner_id: partner.id,
            partner_name: partner.partner_name,
            partner_slug: partner.partner_slug,
            api_token: apiToken,
            api_key_prefix: apiKeyPrefix,
            message: "Save this token securely - it will not be shown again!",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "regenerate": {
        const { partner_id } = params;

        if (!partner_id) {
          return new Response(
            JSON.stringify({ error: "partner_id is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Generate new token
        const uuid1 = crypto.randomUUID();
        const uuid2 = crypto.randomUUID();
        const apiToken = `pit_${uuid1}_${uuid2}`;
        const apiKeyPrefix = apiToken.substring(0, 12);

        // Hash the new token
        const encoder = new TextEncoder();
        const data = encoder.encode(apiToken);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const apiKeyHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

        // Update partner with new token
        const { data: partner, error: updateError } = await supabase
          .from("partner_integrations")
          .update({
            api_key_hash: apiKeyHash,
            api_key_prefix: apiKeyPrefix,
            updated_at: new Date().toISOString(),
          })
          .eq("id", partner_id)
          .select()
          .single();

        if (updateError) {
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Log the regeneration
        await supabase.from("partner_api_logs").insert({
          partner_id: partner.id,
          action: "token_regenerated",
          response_status: 200,
          response_summary: "API token regenerated - old token invalidated",
        });

        console.log(`[partner-token] Regenerated token for partner: ${partner.partner_name}`);

        return new Response(
          JSON.stringify({
            success: true,
            partner_id: partner.id,
            partner_name: partner.partner_name,
            api_token: apiToken,
            api_key_prefix: apiKeyPrefix,
            message: "New token generated - old token is now invalid!",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "list": {
        const { data: partners, error: listError } = await supabase
          .from("partner_integrations")
          .select("*")
          .order("created_at", { ascending: false });

        if (listError) {
          return new Response(
            JSON.stringify({ error: listError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, partners }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "update": {
        const { partner_id, ...updateData } = params;

        if (!partner_id) {
          return new Response(
            JSON.stringify({ error: "partner_id is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Remove sensitive fields from update
        delete updateData.api_key_hash;
        delete updateData.api_key_prefix;

        const { data: partner, error: updateError } = await supabase
          .from("partner_integrations")
          .update({
            ...updateData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", partner_id)
          .select()
          .single();

        if (updateError) {
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, partner }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "delete": {
        const { partner_id } = params;

        if (!partner_id) {
          return new Response(
            JSON.stringify({ error: "partner_id is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: deleteError } = await supabase
          .from("partner_integrations")
          .delete()
          .eq("id", partner_id);

        if (deleteError) {
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, message: "Partner integration deleted" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "logs": {
        const { partner_id, limit = 50 } = params;

        let query = supabase
          .from("partner_api_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limit);

        if (partner_id) {
          query = query.eq("partner_id", partner_id);
        }

        const { data: logs, error: logsError } = await query;

        if (logsError) {
          return new Response(
            JSON.stringify({ error: logsError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, logs }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "reveal_for_onboarding": {
        const { onboarding_token } = params;

        if (!onboarding_token) {
          return new Response(
            JSON.stringify({ error: "onboarding_token is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Find partner by onboarding token
        const { data: partner, error: fetchError } = await supabase
          .from("partner_integrations")
          .select("*")
          .eq("onboarding_token", onboarding_token)
          .single();

        if (fetchError || !partner) {
          return new Response(
            JSON.stringify({ error: "Invalid onboarding token" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Check if token is expired
        if (partner.onboarding_token_expires_at) {
          const expiresAt = new Date(partner.onboarding_token_expires_at);
          if (expiresAt < new Date()) {
            return new Response(
              JSON.stringify({ error: "Onboarding token has expired" }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }

        // Check if token was already revealed (onboarding_completed_at is set)
        // For security, we only allow revealing once per onboarding session
        // Generate a new token for them
        const uuid1 = crypto.randomUUID();
        const uuid2 = crypto.randomUUID();
        const apiToken = `pit_${uuid1}_${uuid2}`;
        const apiKeyPrefix = apiToken.substring(0, 12);

        // Hash the new token
        const encoder = new TextEncoder();
        const data = encoder.encode(apiToken);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const apiKeyHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

        // Update partner with new token and clear onboarding token (one-time use)
        await supabase
          .from("partner_integrations")
          .update({
            api_key_hash: apiKeyHash,
            api_key_prefix: apiKeyPrefix,
            onboarding_token: null,
            onboarding_token_expires_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", partner.id);

        // Log the token reveal
        await supabase.from("partner_api_logs").insert({
          partner_id: partner.id,
          action: "token_revealed_via_onboarding",
          response_status: 200,
          response_summary: "API token revealed during onboarding",
        });

        console.log(`[partner-token] Token revealed via onboarding for partner: ${partner.partner_name}`);

        return new Response(
          JSON.stringify({
            success: true,
            api_token: apiToken,
            api_key_prefix: apiKeyPrefix,
            message: "This is your API token - save it securely!",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "add_team_member": {
        const { partner_id, email, full_name, role, permissions } = params;

        if (!partner_id || !email) {
          return new Response(
            JSON.stringify({ error: "partner_id and email are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Generate invite token
        const inviteToken = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const { data: member, error: insertError } = await supabase
          .from("partner_team_members")
          .insert({
            partner_integration_id: partner_id,
            email,
            full_name,
            role: role || "engineer",
            permissions: permissions || {},
            invite_token: inviteToken,
            invite_expires_at: expiresAt.toISOString(),
            invited_by: user.id,
          })
          .select()
          .single();

        if (insertError) {
          return new Response(
            JSON.stringify({ error: insertError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            member,
            invite_token: inviteToken,
            invite_url: `https://biz-dev-app.lovable.app/partner-team-invite/${inviteToken}`,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "list_team_members": {
        const { partner_id } = params;

        if (!partner_id) {
          return new Response(
            JSON.stringify({ error: "partner_id is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: members, error: listError } = await supabase
          .from("partner_team_members")
          .select("*")
          .eq("partner_integration_id", partner_id)
          .order("created_at", { ascending: false });

        if (listError) {
          return new Response(
            JSON.stringify({ error: listError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, members }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "update_team_member": {
        const { member_id, ...memberData } = params;

        if (!member_id) {
          return new Response(
            JSON.stringify({ error: "member_id is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        delete memberData.id;
        delete memberData.partner_integration_id;
        delete memberData.invite_token;

        const { data: member, error: updateError } = await supabase
          .from("partner_team_members")
          .update({
            ...memberData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", member_id)
          .select()
          .single();

        if (updateError) {
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, member }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "remove_team_member": {
        const { member_id } = params;

        if (!member_id) {
          return new Response(
            JSON.stringify({ error: "member_id is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: deleteError } = await supabase
          .from("partner_team_members")
          .delete()
          .eq("id", member_id);

        if (deleteError) {
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, message: "Team member removed" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error: any) {
    console.error("[partner-token] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

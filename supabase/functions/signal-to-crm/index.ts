import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SignalToCRMPayload {
  activity_id: string;
  company_name?: string;
  contact_email?: string;
  contact_name?: string;
  source_url?: string;
  talking_point?: string;
  deal_room_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization required");
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (userError || !user) {
      throw new Error("Invalid authentication");
    }

    const payload: SignalToCRMPayload = await req.json();
    const { activity_id, company_name, contact_email, contact_name, source_url, talking_point, deal_room_id } = payload;

    console.log("[signal-to-crm] Processing signal:", { activity_id, company_name });

    if (!company_name) {
      throw new Error("Company name is required");
    }

    // Normalize company name for matching
    const normalizedName = company_name.toLowerCase().replace(/[^a-z0-9]/g, "");
    
    // Search for existing company by name (case-insensitive, fuzzy match)
    const { data: existingCompanies } = await supabase
      .from("crm_companies")
      .select("id, name, website")
      .eq("user_id", user.id)
      .or(`name.ilike.%${company_name}%`);

    let companyId: string;
    let isExisting = false;

    if (existingCompanies && existingCompanies.length > 0) {
      // Found existing company - use the first match
      const existingCompany = existingCompanies.find((c) => {
        const existingNormalized = c.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        return existingNormalized === normalizedName || 
               existingNormalized.includes(normalizedName) || 
               normalizedName.includes(existingNormalized);
      }) || existingCompanies[0];

      companyId = existingCompany.id;
      isExisting = true;
      console.log("[signal-to-crm] Found existing company:", existingCompany.name);

      // Add a note about the new signal
      await supabase.from("crm_interactions").insert({
        user_id: user.id,
        company_id: companyId,
        type: "note",
        subject: "Signal Detected by Agent",
        notes: `Agent detected activity: ${talking_point || "New signal"}\n\nSource: ${source_url || "N/A"}`,
        tags: ["agent-signal", "signal-scout"],
      });
    } else {
      // Create new company
      const { data: newCompany, error: companyError } = await supabase
        .from("crm_companies")
        .insert({
          user_id: user.id,
          name: company_name,
          lead_source: "agent_signal_scout",
          notes: `Discovered by Signal Scout agent.\n\nTalking Point: ${talking_point || "N/A"}\n\nSource: ${source_url || "N/A"}`,
          tags: ["agent-discovered", "signal-scout"],
        })
        .select()
        .single();

      if (companyError) {
        throw companyError;
      }

      companyId = newCompany.id;
      console.log("[signal-to-crm] Created new company:", companyId);
    }

    // If contact email provided, check/create contact
    let contactId: string | null = null;
    if (contact_email) {
      // Search for existing contact by email
      const { data: existingContacts } = await supabase
        .from("crm_contacts")
        .select("id, email")
        .eq("user_id", user.id)
        .eq("email", contact_email.toLowerCase())
        .limit(1);

      if (existingContacts && existingContacts.length > 0) {
        contactId = existingContacts[0].id;
        console.log("[signal-to-crm] Found existing contact:", contactId);
      } else {
        // Parse contact name
        const nameParts = (contact_name || "").split(" ");
        const firstName = nameParts[0] || contact_email.split("@")[0];
        const lastName = nameParts.slice(1).join(" ") || null;

        const { data: newContact, error: contactError } = await supabase
          .from("crm_contacts")
          .insert({
            user_id: user.id,
            company_id: companyId,
            first_name: firstName,
            last_name: lastName,
            email: contact_email.toLowerCase(),
            lead_source: "agent_signal_scout",
            tags: ["agent-discovered"],
          })
          .select()
          .single();

        if (!contactError && newContact) {
          contactId = newContact.id;
          console.log("[signal-to-crm] Created new contact:", contactId);
        }
      }
    }

    // Update the activity with the linked company/contact
    if (activity_id) {
      await supabase
        .from("external_agent_activities")
        .update({
          target_company_id: companyId,
          target_contact_id: contactId,
        })
        .eq("id", activity_id);
    }

    // Log to audit
    await supabase.from("ai_audit_logs").insert({
      user_id: user.id,
      action: "signal_to_crm",
      entity_type: "crm_company",
      entity_id: companyId,
      new_values: {
        company_name,
        existing: isExisting,
        contact_id: contactId,
        activity_id,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        company_id: companyId,
        company_name,
        contact_id: contactId,
        existing: isExisting,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[signal-to-crm] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExportRequest {
  userId: string;
  requestId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is admin
    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!adminRole) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { userId, requestId }: ExportRequest = await req.json();

    console.log(`Processing data export for user ${userId}, request ${requestId}`);

    // Collect all user data from various tables
    const exportData: Record<string, unknown> = {
      exportedAt: new Date().toISOString(),
      userId,
      requestId,
    };

    // Profile data
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    exportData.profile = profile;

    // Glyph claims
    const { data: glyphClaims } = await supabase
      .from("glyph_claims")
      .select("*")
      .eq("owner_user_id", userId);
    exportData.glyphClaims = glyphClaims || [];

    // Glyphs
    const { data: glyphs } = await supabase
      .from("glyphs")
      .select("*")
      .eq("owner_user_id", userId);
    exportData.glyphs = glyphs || [];

    // Glyph messages sent
    const { data: messagesSent } = await supabase
      .from("glyph_messages")
      .select("*")
      .eq("from_user_id", userId);
    exportData.messagesSent = messagesSent || [];

    // Glyph messages received
    const { data: messagesReceived } = await supabase
      .from("glyph_messages")
      .select("*")
      .eq("to_user_id", userId);
    exportData.messagesReceived = messagesReceived || [];

    // Glyph likes
    const { data: likes } = await supabase
      .from("glyph_likes")
      .select("*")
      .eq("user_id", userId);
    exportData.likes = likes || [];

    // Product mockups
    const { data: mockups } = await supabase
      .from("product_mockups")
      .select("*")
      .eq("user_id", userId);
    exportData.productMockups = mockups || [];

    // Custom product requests
    const { data: productRequests } = await supabase
      .from("custom_product_requests")
      .select("*")
      .eq("user_id", userId);
    exportData.customProductRequests = productRequests || [];

    // Organization memberships
    const { data: orgMemberships } = await supabase
      .from("organization_members")
      .select("*, organizations(*)")
      .eq("user_id", userId);
    exportData.organizationMemberships = orgMemberships || [];

    // Data requests
    const { data: dataRequests } = await supabase
      .from("data_requests")
      .select("*")
      .eq("user_id", userId);
    exportData.dataRequests = dataRequests || [];

    // NDA signatures
    const { data: ndaSignatures } = await supabase
      .from("nda_signatures")
      .select("*")
      .eq("user_id", userId);
    exportData.ndaSignatures = ndaSignatures || [];

    // Investor access
    const { data: investorAccess } = await supabase
      .from("investor_access")
      .select("*")
      .eq("user_id", userId);
    exportData.investorAccess = investorAccess || [];

    // Transfers (sent and received)
    const { data: transfersSent } = await supabase
      .from("transfers")
      .select("*")
      .eq("from_user_id", userId);
    exportData.transfersSent = transfersSent || [];

    const { data: transfersReceived } = await supabase
      .from("transfers")
      .select("*")
      .eq("to_user_id", userId);
    exportData.transfersReceived = transfersReceived || [];

    // Update request status to completed
    await supabase
      .from("data_requests")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        completed_by: user.id,
        metadata: { exportSize: JSON.stringify(exportData).length },
      })
      .eq("id", requestId);

    console.log(`Data export completed for user ${userId}`);

    return new Response(JSON.stringify(exportData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Data export error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

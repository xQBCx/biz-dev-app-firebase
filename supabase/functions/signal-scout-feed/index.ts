import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key",
};

const HUBSPOT_API = "https://api.hubapi.com";
const PROPERTIES = [
  "name",
  "domain",
  "industry",
  "city",
  "state",
  "signal_scout_last_scanned",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // --- Auth ---
  const apiKey = req.headers.get("x-api-key");
  const expected = Deno.env.get("SIGNAL_SCOUT_API_KEY");
  if (!apiKey || apiKey !== expected) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const hubspotToken = Deno.env.get("HUBSPOT_ACCESS_TOKEN");
  if (!hubspotToken) {
    return new Response(
      JSON.stringify({ error: "HUBSPOT_ACCESS_TOKEN not configured" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // --- Parse body ---
  let batchSize = 5;
  try {
    const body = await req.json();
    if (body.batch_size && Number.isInteger(body.batch_size) && body.batch_size > 0 && body.batch_size <= 100) {
      batchSize = body.batch_size;
    }
  } catch {
    // default batch_size = 5
  }

  const headers = {
    Authorization: `Bearer ${hubspotToken}`,
    "Content-Type": "application/json",
  };

  try {
    // Query 1: never-scanned companies
    const q1Body = {
      filterGroups: [
        {
          filters: [
            {
              propertyName: "signal_scout_last_scanned",
              operator: "NOT_HAS_PROPERTY",
            },
          ],
        },
      ],
      properties: PROPERTIES,
      limit: batchSize,
    };

    const q1Res = await fetch(`${HUBSPOT_API}/crm/v3/objects/companies/search`, {
      method: "POST",
      headers,
      body: JSON.stringify(q1Body),
    });

    if (!q1Res.ok) {
      const err = await q1Res.text();
      console.error("HubSpot query 1 failed:", q1Res.status, err);
      return new Response(
        JSON.stringify({ error: "HubSpot API error", details: err }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const q1Data = await q1Res.json();
    let results = (q1Data.results || []).map(formatCompany);
    const remaining = batchSize - results.length;

    // Query 2: oldest-scanned (only if batch not full)
    if (remaining > 0) {
      const q2Body = {
        filterGroups: [
          {
            filters: [
              {
                propertyName: "signal_scout_last_scanned",
                operator: "HAS_PROPERTY",
              },
            ],
          },
        ],
        sorts: [
          {
            propertyName: "signal_scout_last_scanned",
            direction: "ASCENDING",
          },
        ],
        properties: PROPERTIES,
        limit: remaining,
      };

      const q2Res = await fetch(
        `${HUBSPOT_API}/crm/v3/objects/companies/search`,
        { method: "POST", headers, body: JSON.stringify(q2Body) }
      );

      if (q2Res.ok) {
        const q2Data = await q2Res.json();
        results = results.concat((q2Data.results || []).map(formatCompany));
      } else {
        console.error("HubSpot query 2 failed:", q2Res.status);
      }
    }

    const hasMore =
      (q1Data.paging?.next?.after ? true : false) || results.length >= batchSize;

    return new Response(
      JSON.stringify({
        results,
        batch_size: batchSize,
        total_returned: results.length,
        has_more: hasMore,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("signal-scout-feed error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", message: String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function formatCompany(company: any) {
  return {
    id: company.id,
    properties: {
      name: company.properties?.name || null,
      domain: company.properties?.domain || null,
      industry: company.properties?.industry || null,
      city: company.properties?.city || null,
      state: company.properties?.state || null,
      signal_scout_last_scanned:
        company.properties?.signal_scout_last_scanned || null,
    },
  };
}

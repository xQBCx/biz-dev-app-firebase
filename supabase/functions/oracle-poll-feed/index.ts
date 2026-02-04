import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PollFeedRequest {
  feed_id?: string;
  provider_id?: string;
  poll_all_due?: boolean;
}

interface FeedResult {
  feed_id: string;
  feed_name: string;
  previous_value: unknown;
  new_value: unknown;
  is_anomaly: boolean;
  polled_at: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // This can be called by cron or authenticated users
    const authHeader = req.headers.get("Authorization");
    
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // If auth header provided, verify user (for manual polling)
    if (authHeader) {
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
    }

    const body: PollFeedRequest = await req.json().catch(() => ({}));
    const results: FeedResult[] = [];

    // Build query for feeds to poll
    let feedsQuery = serviceClient
      .from("oracle_data_feeds")
      .select(`
        *,
        provider:oracle_data_providers(*)
      `)
      .eq("is_active", true);

    if (body.feed_id) {
      feedsQuery = feedsQuery.eq("id", body.feed_id);
    } else if (body.provider_id) {
      feedsQuery = feedsQuery.eq("provider_id", body.provider_id);
    } else if (body.poll_all_due) {
      // Poll feeds that are due (last_updated + polling_frequency < now)
      // This is a simplified check - in production use proper interval comparison
    }

    const { data: feeds, error: feedsError } = await feedsQuery;

    if (feedsError) {
      return new Response(JSON.stringify({ error: feedsError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    for (const feed of feeds || []) {
      const provider = feed.provider;
      if (!provider || !provider.endpoint_url || !provider.polling_enabled) {
        continue;
      }

      try {
        // Build request to external API
        const fetchOptions: RequestInit = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        };

        // Add auth if configured
        if (provider.auth_config) {
          const authConfig = provider.auth_config as Record<string, string>;
          if (authConfig.api_key) {
            fetchOptions.headers = {
              ...fetchOptions.headers,
              "Authorization": `Bearer ${authConfig.api_key}`,
            };
          }
          if (authConfig.header_name && authConfig.header_value) {
            fetchOptions.headers = {
              ...fetchOptions.headers,
              [authConfig.header_name]: authConfig.header_value,
            };
          }
        }

        // Fetch from external endpoint
        const response = await fetch(provider.endpoint_url, fetchOptions);
        
        if (!response.ok) {
          console.error(`Failed to poll feed ${feed.id}: ${response.status}`);
          
          // Update usage stats with failure
          await serviceClient
            .from("oracle_data_providers")
            .update({
              usage_stats: {
                ...provider.usage_stats,
                total_calls: (provider.usage_stats?.total_calls || 0) + 1,
                failed_calls: (provider.usage_stats?.failed_calls || 0) + 1,
              },
              last_polled_at: new Date().toISOString(),
            })
            .eq("id", provider.id);
          
          continue;
        }

        const newValue = await response.json();
        const previousValue = feed.last_value;

        // Check for anomaly
        let isAnomaly = false;
        if (feed.anomaly_threshold && previousValue && newValue) {
          const prevNum = typeof previousValue === "object" 
            ? (previousValue as Record<string, unknown>).value 
            : previousValue;
          const newNum = typeof newValue === "object" 
            ? (newValue as Record<string, unknown>).value 
            : newValue;
          
          if (typeof prevNum === "number" && typeof newNum === "number" && prevNum !== 0) {
            const percentChange = Math.abs((newNum - prevNum) / prevNum) * 100;
            isAnomaly = percentChange > Number(feed.anomaly_threshold);
          }
        }

        // Update feed with new value
        await serviceClient
          .from("oracle_data_feeds")
          .update({
            last_value: newValue,
            last_updated: new Date().toISOString(),
          })
          .eq("id", feed.id);

        // Store in history
        await serviceClient
          .from("oracle_feed_history")
          .insert({
            feed_id: feed.id,
            value: newValue,
            source_timestamp: new Date().toISOString(),
            is_anomaly: isAnomaly,
            anomaly_notes: isAnomaly ? `Value changed significantly from ${JSON.stringify(previousValue)}` : null,
          });

        // Update provider usage stats
        await serviceClient
          .from("oracle_data_providers")
          .update({
            usage_stats: {
              ...provider.usage_stats,
              total_calls: (provider.usage_stats?.total_calls || 0) + 1,
              successful_calls: (provider.usage_stats?.successful_calls || 0) + 1,
            },
            last_polled_at: new Date().toISOString(),
          })
          .eq("id", provider.id);

        results.push({
          feed_id: feed.id,
          feed_name: feed.feed_name,
          previous_value: previousValue,
          new_value: newValue,
          is_anomaly: isAnomaly,
          polled_at: new Date().toISOString(),
        });

        console.log(`Polled feed ${feed.id}: ${feed.feed_name}`);

      } catch (pollError) {
        console.error(`Error polling feed ${feed.id}:`, pollError);
        
        // Update failure stats
        await serviceClient
          .from("oracle_data_providers")
          .update({
            usage_stats: {
              ...provider.usage_stats,
              total_calls: (provider.usage_stats?.total_calls || 0) + 1,
              failed_calls: (provider.usage_stats?.failed_calls || 0) + 1,
            },
            last_polled_at: new Date().toISOString(),
          })
          .eq("id", provider.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        feeds_polled: results.length,
        results,
        polled_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in oracle-poll-feed:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

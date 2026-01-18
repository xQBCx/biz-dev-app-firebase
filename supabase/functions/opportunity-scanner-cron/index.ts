import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting opportunity scanner cron job...');

    // Get users who have:
    // 1. Admin-granted access (user_feature_toggles.opportunity_scanner_access)
    // 2. Personal toggle enabled (user_scanner_preferences.is_active)
    // 3. Are due for a scan based on frequency
    
    // First, get all users with scanner access enabled
    const { data: usersWithAccess, error: accessError } = await supabase
      .from('user_feature_toggles')
      .select('user_id')
      .eq('feature_name', 'opportunity_scanner_access')
      .eq('is_enabled', true);

    if (accessError) {
      console.error('Error fetching users with access:', accessError);
      throw accessError;
    }

    if (!usersWithAccess || usersWithAccess.length === 0) {
      console.log('No users have scanner access enabled');
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: 'no_users_with_access' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userIds = usersWithAccess.map((u: { user_id: string }) => u.user_id);
    const now = new Date();

    // Get preferences for these users, filtering for active ones due for scan
    const { data: userPrefs, error: prefsError } = await supabase
      .from('user_scanner_preferences')
      .select('*')
      .in('user_id', userIds)
      .eq('is_active', true);

    if (prefsError) {
      console.error('Error fetching user preferences:', prefsError);
      throw prefsError;
    }

    interface UserPreference {
      user_id: string;
      is_active: boolean;
      scan_frequency: string;
      next_scan_at: string | null;
      opportunities_found: number;
    }

    // Filter users who are due for a scan based on their frequency
    const eligibleUsers = ((userPrefs || []) as UserPreference[]).filter((pref) => {
      if (!pref.next_scan_at) return true; // Never scanned
      return new Date(pref.next_scan_at) <= now;
    });

    // Also include users with access but no preferences record yet
    const usersWithPrefs = new Set(((userPrefs || []) as UserPreference[]).map(p => p.user_id));
    const usersNeedingPrefs = userIds.filter((id: string) => !usersWithPrefs.has(id));

    console.log(`Found ${eligibleUsers.length} users due for scan, ${usersNeedingPrefs.length} users without preferences`);

    const results = {
      processed: 0,
      skipped: 0,
      errors: 0,
      opportunitiesFound: 0
    };

    // Process eligible users with preferences
    for (const pref of eligibleUsers) {
      try {
        const scanResult = await scanForUser(pref.user_id, supabaseUrl, supabaseKey);
        results.processed++;
        results.opportunitiesFound += scanResult.opportunitiesFound;

        // Update preferences with last/next scan times
        const nextScan = calculateNextScan(pref.scan_frequency);
        await supabase
          .from('user_scanner_preferences')
          .update({
            last_scan_at: now.toISOString(),
            next_scan_at: nextScan.toISOString(),
            opportunities_found: (pref.opportunities_found || 0) + scanResult.opportunitiesFound
          })
          .eq('user_id', pref.user_id);

      } catch (error) {
        console.error(`Error scanning for user ${pref.user_id}:`, error);
        results.errors++;
      }
    }

    // Create default preferences and scan for users without preferences
    for (const userId of usersNeedingPrefs) {
      try {
        // Create default preferences
        const nextScan = calculateNextScan('daily');
        await supabase
          .from('user_scanner_preferences')
          .insert({
            user_id: userId,
            is_active: true,
            scan_frequency: 'daily',
            next_scan_at: nextScan.toISOString()
          });

        const scanResult = await scanForUser(userId, supabaseUrl, supabaseKey);
        results.processed++;
        results.opportunitiesFound += scanResult.opportunitiesFound;

        // Update with last scan
        await supabase
          .from('user_scanner_preferences')
          .update({
            last_scan_at: now.toISOString(),
            opportunities_found: scanResult.opportunitiesFound
          })
          .eq('user_id', userId);

      } catch (error) {
        console.error(`Error processing new user ${userId}:`, error);
        results.errors++;
      }
    }

    console.log(`Cron job complete: ${JSON.stringify(results)}`);

    return new Response(
      JSON.stringify({
        success: true,
        ...results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in opportunity-scanner-cron:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function scanForUser(
  userId: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<{ opportunitiesFound: number }> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Get active watchlist items for this user
  const { data: watchlists, error } = await supabase
    .from('opportunity_watchlist')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error) throw error;

  let totalOpportunities = 0;

  for (const watchlist of (watchlists || []) as { id: string }[]) {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/opportunity-scanner`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          watchlist_id: watchlist.id,
          user_id: userId
        })
      });

      if (response.ok) {
        const result = await response.json();
        totalOpportunities += result.opportunities_found || 0;
      }
    } catch (watchlistError) {
      console.error(`Error scanning watchlist ${watchlist.id}:`, watchlistError);
    }
  }

  return { opportunitiesFound: totalOpportunities };
}

function calculateNextScan(frequency: string): Date {
  const now = new Date();
  
  switch (frequency) {
    case 'hourly':
      return new Date(now.getTime() + 60 * 60 * 1000);
    case 'every_6_hours':
      return new Date(now.getTime() + 6 * 60 * 60 * 1000);
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
}

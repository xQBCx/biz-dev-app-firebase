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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, sourceAppId, targetAppId, contacts, direction } = await req.json();

    console.log(`Contact sync: ${action} from ${sourceAppId} to ${targetAppId}, direction: ${direction}`);

    // Verify the user owns both apps
    const { data: apps, error: appsError } = await supabase
      .from('ecosystem_apps')
      .select('id, name, webhook_url')
      .in('id', [sourceAppId, targetAppId].filter(Boolean))
      .eq('owner_user_id', user.id);

    if (appsError || !apps || apps.length === 0) {
      return new Response(JSON.stringify({ error: 'Apps not found or access denied' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let syncResults: any[] = [];

    switch (action) {
      case 'push':
        // Push contacts to a child app
        syncResults = await pushContactsToApp(supabase, user.id, sourceAppId, targetAppId, contacts);
        break;

      case 'pull':
        // Pull contacts from a child app (would be done via webhook in reality)
        syncResults = await recordIncomingContacts(supabase, user.id, sourceAppId, contacts);
        break;

      case 'sync':
        // Bidirectional sync
        const targetApp = apps.find(a => a.id === targetAppId);
        if (targetApp?.webhook_url) {
          await notifyAppOfSync(targetApp.webhook_url, contacts, 'bidirectional');
        }
        syncResults = await recordSyncActivity(supabase, user.id, sourceAppId, targetAppId, contacts, 'bidirectional');
        break;

      default:
        return new Response(JSON.stringify({ error: 'Invalid action. Use: push, pull, or sync' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify({
      success: true,
      action,
      syncedCount: syncResults.length,
      results: syncResults,
      message: `${syncResults.length} contacts processed successfully`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Ecosystem sync contacts error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function pushContactsToApp(supabase: any, userId: string, sourceAppId: string, targetAppId: string, contacts: any[]): Promise<any[]> {
  const results: any[] = [];

  for (const contact of contacts) {
    // Record the sync
    const { data, error } = await supabase
      .from('ecosystem_contact_sync')
      .insert({
        source_app_id: sourceAppId,
        target_app_id: targetAppId,
        contact_id: contact.id,
        external_contact_id: contact.external_id,
        direction: 'outbound',
        sync_status: 'synced',
        sync_data: contact,
        synced_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error) {
      results.push({ contactId: contact.id, status: 'synced', syncId: data.id });
    } else {
      results.push({ contactId: contact.id, status: 'failed', error: error.message });
    }
  }

  return results;
}

async function recordIncomingContacts(supabase: any, userId: string, sourceAppId: string, contacts: any[]): Promise<any[]> {
  const results: any[] = [];

  for (const contact of contacts) {
    // Check if contact already exists (by email)
    const { data: existing } = await supabase
      .from('crm_contacts')
      .select('id')
      .eq('email', contact.email)
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Update sync metadata
      await supabase
        .from('crm_contacts')
        .update({
          source_ecosystem_app_id: sourceAppId,
          external_source_id: contact.external_id,
          sync_metadata: {
            last_sync: new Date().toISOString(),
            source_app: sourceAppId,
          },
        })
        .eq('id', existing.id);

      results.push({ contactId: existing.id, status: 'updated', email: contact.email });
    } else {
      // Create new contact
      const { data: newContact, error } = await supabase
        .from('crm_contacts')
        .insert({
          user_id: userId,
          first_name: contact.first_name || contact.name?.split(' ')[0] || '',
          last_name: contact.last_name || contact.name?.split(' ').slice(1).join(' ') || '',
          email: contact.email,
          phone: contact.phone,
          company: contact.company,
          source_ecosystem_app_id: sourceAppId,
          external_source_id: contact.external_id,
          sync_metadata: {
            imported_at: new Date().toISOString(),
            source_app: sourceAppId,
          },
        })
        .select()
        .single();

      if (!error && newContact) {
        results.push({ contactId: newContact.id, status: 'created', email: contact.email });
      } else {
        results.push({ email: contact.email, status: 'failed', error: error?.message });
      }
    }
  }

  return results;
}

async function recordSyncActivity(supabase: any, userId: string, sourceAppId: string, targetAppId: string, contacts: any[], direction: string): Promise<any[]> {
  const results: any[] = [];

  for (const contact of contacts) {
    const { data, error } = await supabase
      .from('ecosystem_contact_sync')
      .insert({
        source_app_id: sourceAppId,
        target_app_id: targetAppId,
        contact_id: contact.id,
        external_contact_id: contact.external_id,
        direction,
        sync_status: 'synced',
        sync_data: contact,
        synced_at: new Date().toISOString(),
      })
      .select()
      .single();

    results.push({
      contactId: contact.id,
      status: error ? 'failed' : 'synced',
      syncId: data?.id,
    });
  }

  return results;
}

async function notifyAppOfSync(webhookUrl: string, contacts: any[], direction: string): Promise<void> {
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'contact_sync',
        direction,
        contacts,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('Webhook notification failed:', error);
  }
}

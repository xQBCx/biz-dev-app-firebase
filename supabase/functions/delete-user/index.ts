import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Verify the requesting user is an admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: requestingUser }, error: authError } = await userClient.auth.getUser();
    if (authError || !requestingUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if requesting user is admin
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: adminRole } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', requestingUser.id)
      .eq('role', 'admin')
      .single();

    if (!adminRole) {
      return new Response(JSON.stringify({ error: 'Only admins can delete users' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { userId, eraseData } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prevent self-deletion
    if (userId === requestingUser.id) {
      return new Response(JSON.stringify({ error: 'Cannot delete your own account' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Tables that reference user_id - order matters for foreign key constraints
    const userTables = [
      'user_permissions',
      'user_roles',
      'user_voice_features',
      'ai_conversations',
      'ai_messages',
      'ai_message_feedback',
      'ai_learnings',
      'ai_proactive_notifications',
      'ai_outcome_tracking',
      'ai_agent_tasks',
      'ai_user_preferences',
      'activity_logs',
      'notifications',
      'credit_balances',
      'credit_transactions',
      'credit_usage',
      'credit_contributions',
    ];

    if (eraseData) {
      console.log(`Erasing all data for user ${userId}`);
      
      // Delete from all user-related tables
      for (const table of userTables) {
        try {
          const { error } = await adminClient
            .from(table)
            .delete()
            .eq('user_id', userId);
          
          if (error) {
            console.log(`Note: Could not delete from ${table}: ${error.message}`);
          } else {
            console.log(`Deleted from ${table}`);
          }
        } catch (e) {
          console.log(`Table ${table} may not exist or has different structure`);
        }
      }
    } else {
      console.log(`Keeping data for user ${userId}, only removing auth and profile`);
      
      // Just remove roles and permissions (access control)
      await adminClient.from('user_roles').delete().eq('user_id', userId);
      await adminClient.from('user_permissions').delete().eq('user_id', userId);
    }

    // Delete from profiles table
    const { error: profileError } = await adminClient
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
    }

    // Delete the auth user using Admin API
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Error deleting auth user:', deleteError);
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: eraseData 
        ? 'User and all associated data have been permanently deleted' 
        : 'User has been deleted but their data has been preserved'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

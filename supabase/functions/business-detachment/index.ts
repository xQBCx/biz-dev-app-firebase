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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { action, businessId, transferDetails } = await req.json();

    if (!businessId) {
      return new Response(JSON.stringify({ error: 'Business ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify ownership
    const { data: business, error: businessError } = await supabase
      .from('spawned_businesses')
      .select('*')
      .eq('id', businessId)
      .eq('user_id', user.id)
      .single();

    if (businessError || !business) {
      return new Response(JSON.stringify({ error: 'Business not found or access denied' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!business.transferable) {
      return new Response(JSON.stringify({ error: 'This business is not transferable' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    switch (action) {
      case 'initiate-transfer': {
        const { toEmail, salePrice, currency, transferType } = transferDetails || {};

        if (!toEmail && transferType !== 'detachment') {
          return new Response(JSON.stringify({ error: 'Recipient email is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Create transfer record
        const { data: transfer, error: transferError } = await supabase
          .from('business_transfers')
          .insert({
            business_id: businessId,
            from_user_id: user.id,
            to_email: toEmail,
            transfer_type: transferType || 'transfer',
            sale_price: salePrice,
            currency: currency || 'USD',
            status: 'pending',
          })
          .select()
          .single();

        if (transferError) {
          return new Response(JSON.stringify({ error: 'Failed to initiate transfer' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // If it's a detachment, proceed immediately
        if (transferType === 'detachment') {
          return await processDetachment(supabase, businessId, transfer.id, user.id);
        }

        // For transfers/sales, send notification to recipient
        // In production, this would send an email

        return new Response(JSON.stringify({
          success: true,
          action: 'transfer-initiated',
          transferId: transfer.id,
          message: `Transfer request sent to ${toEmail}. They will receive an email to accept.`,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'accept-transfer': {
        const { transferId } = transferDetails || {};
        
        // Get transfer record
        const { data: transfer } = await supabase
          .from('business_transfers')
          .select('*')
          .eq('id', transferId)
          .single();

        if (!transfer || transfer.status !== 'pending') {
          return new Response(JSON.stringify({ error: 'Invalid or expired transfer' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Update transfer status
        await supabase
          .from('business_transfers')
          .update({
            to_user_id: user.id,
            status: 'accepted',
            accepted_at: new Date().toISOString(),
          })
          .eq('id', transferId);

        // If there's a sale price, initiate payment (in production, use Stripe)
        if (transfer.sale_price && transfer.sale_price > 0) {
          // Would create Stripe payment intent here
          return new Response(JSON.stringify({
            success: true,
            action: 'payment-required',
            transferId,
            amount: transfer.sale_price,
            currency: transfer.currency,
            message: 'Please complete payment to finalize the transfer.',
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // For free transfers, complete immediately
        return await completeTransfer(supabase, transfer.business_id, transferId, user.id);
      }

      case 'complete-transfer': {
        const { transferId } = transferDetails || {};

        const { data: transfer } = await supabase
          .from('business_transfers')
          .select('*')
          .eq('id', transferId)
          .eq('status', 'accepted')
          .single();

        if (!transfer) {
          return new Response(JSON.stringify({ error: 'Transfer not found or not accepted' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return await completeTransfer(supabase, transfer.business_id, transferId, transfer.to_user_id);
      }

      case 'generate-export': {
        // Generate export package for the business
        const exportPackage = {
          business: {
            name: business.business_name,
            industry: business.industry,
            description: business.description,
          },
          website: business.generated_website_data,
          erp: business.erp_structure,
          research: business.research_data,
          exportedAt: new Date().toISOString(),
          format: 'standalone-react',
        };

        // In production, this would create actual downloadable files
        // For now, return the package data

        return new Response(JSON.stringify({
          success: true,
          action: 'export-generated',
          package: exportPackage,
          message: 'Export package generated. This contains everything needed to run your business independently.',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'cancel-transfer': {
        const { transferId, reason } = transferDetails || {};

        await supabase
          .from('business_transfers')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            cancellation_reason: reason,
          })
          .eq('id', transferId)
          .eq('from_user_id', user.id);

        return new Response(JSON.stringify({
          success: true,
          action: 'transfer-cancelled',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

  } catch (error: any) {
    console.error('Detachment error:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function processDetachment(supabase: any, businessId: string, transferId: string, userId: string) {
  // Generate export package first
  const { data: business } = await supabase
    .from('spawned_businesses')
    .select('*')
    .eq('id', businessId)
    .single();

  const exportPackage = {
    business: {
      name: business.business_name,
      industry: business.industry,
    },
    website: business.generated_website_data,
    erp: business.erp_structure,
    research: business.research_data,
    exportedAt: new Date().toISOString(),
  };

  // In production, save to storage and get URL
  const packageUrl = `export-${businessId}-${Date.now()}.json`;

  // Update business as detached
  await supabase
    .from('spawned_businesses')
    .update({
      is_detached: true,
      detached_at: new Date().toISOString(),
      detachment_reason: 'User initiated detachment',
      ecosystem_member: false,
    })
    .eq('id', businessId);

  // Remove from network (mark edges as departed)
  await supabase
    .from('instincts_graph_edges')
    .update({ metadata: { status: 'departed' } })
    .or(`source_id.eq.${businessId},target_id.eq.${businessId}`);

  // Update transfer record
  await supabase
    .from('business_transfers')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      transfer_package_url: packageUrl,
      ecosystem_removal_completed: true,
      proprietary_features_removed: true,
    })
    .eq('id', transferId);

  return new Response(JSON.stringify({
    success: true,
    action: 'detached',
    exportPackageUrl: packageUrl,
    message: 'Business has been detached from the ecosystem. You can download your export package.',
    warnings: [
      'Proprietary Biz Dev features are no longer available',
      'Business network connections have been removed',
      'Platform analytics and insights are disabled',
    ],
  }), {
    headers: { 
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json' 
    }
  });
}

async function completeTransfer(supabase: any, businessId: string, transferId: string, newOwnerId: string) {
  // Transfer ownership
  await supabase
    .from('spawned_businesses')
    .update({ user_id: newOwnerId })
    .eq('id', businessId);

  // Transfer domains
  await supabase
    .from('business_domains')
    .update({ created_by: newOwnerId })
    .eq('business_id', businessId);

  // Update transfer record
  await supabase
    .from('business_transfers')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', transferId);

  return new Response(JSON.stringify({
    success: true,
    action: 'transfer-completed',
    message: 'Business ownership has been successfully transferred.',
  }), {
    headers: { 
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json' 
    }
  });
}

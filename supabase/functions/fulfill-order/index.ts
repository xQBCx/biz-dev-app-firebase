import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { order_id } = await req.json();

    if (!order_id) {
      throw new Error("Order ID is required");
    }

    console.log(`Fulfilling order: ${order_id}`);

    // Get order details with personalization
    const { data: order, error: orderError } = await supabase
      .from("ai_orders")
      .select(`
        *,
        ai_products (
          *,
          ai_providers (*)
        )
      `)
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      console.error('Order error:', orderError);
      throw new Error("Order not found");
    }

    if (order.status !== "paid") {
      throw new Error("Order must be paid before fulfillment");
    }

    console.log('Order details:', { 
      id: order.id, 
      quantity: order.quantity,
      delivery_method: order.delivery_method,
      has_personalization: !!order.metadata
    });

    // Generate gift cards for this order
    const cards = [];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + order.ai_products.valid_days);

    // Extract personalization from order metadata
    const metadata = order.metadata as any || {};

    for (let i = 0; i < order.quantity; i++) {
      // Generate unique card code and claim URL
      const cardCode = `AIG-${Math.random().toString(36).substring(2, 15).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
      const claimUrl = Math.random().toString(36).substring(2, 15);

      const { data: card, error: cardError } = await supabase
        .from("ai_gift_cards")
        .insert({
          order_id: order.id,
          product_id: order.product_id,
          provider_id: order.ai_products.provider_id,
          card_code: cardCode,
          face_value: order.ai_products.face_value,
          remaining_value: order.ai_products.face_value,
          card_type: order.delivery_method === 'physical' ? 'physical' : 'digital',
          status: 'active',
          expires_at: expiresAt.toISOString(),
          activated_at: new Date().toISOString(),
          redemption_url: order.ai_products.ai_providers.redemption_url,
          // Personalization fields
          occasion_title: metadata.occasion_title,
          occasion_message: metadata.occasion_message,
          occasion_theme: metadata.occasion_theme || 'custom',
          sender_name: metadata.sender_name || order.customer_name,
          recipient_name: metadata.recipient_name,
          recipient_email: metadata.recipient_email || order.delivery_email,
          recipient_phone: metadata.recipient_phone || order.delivery_phone,
          delivery_method_actual: order.delivery_method,
          claim_url: claimUrl,
          is_physical: order.delivery_method === 'physical'
        })
        .select()
        .single();

      if (cardError) {
        console.error("Error creating card:", cardError);
        continue;
      }

      cards.push(card);
      console.log(`Card ${i + 1}/${order.quantity} created:`, card.card_code);
    }

    // Update order status
    const { error: updateError } = await supabase
      .from("ai_orders")
      .update({
        fulfillment_status: "fulfilled",
        escrow_status: "held" // Keep in escrow until redemption
      })
      .eq("id", order_id);

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    // Log fulfillment
    await supabase.from("ai_audit_logs").insert({
      entity_type: "order",
      entity_id: order_id,
      action: "fulfilled",
      new_values: {
        cards_generated: cards.length,
        delivery_method: order.delivery_method
      },
    });

    console.log(`Order ${order_id} fulfilled with ${cards.length} cards`);

    // Send delivery based on method
    try {
      const deliveryEmail = metadata.recipient_email || order.delivery_email || order.customer_email;
      const deliveryPhone = metadata.recipient_phone || order.delivery_phone;

      if (order.delivery_method === 'sms' && deliveryPhone) {
        // Send SMS with claim link
        await sendSMSDelivery(supabase, cards, deliveryPhone, order, metadata);
      } else if (order.delivery_method === 'physical') {
        // Generate PDF for printing
        await generatePhysicalCard(supabase, cards, order, metadata);
      } else {
        // Send email (default)
        await sendEmailDelivery(supabase, cards, deliveryEmail, order, metadata);
      }
    } catch (deliveryError) {
      console.error('Delivery error (non-fatal):', deliveryError);
      // Don't fail fulfillment if delivery fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        cards_generated: cards.length,
        cards: cards,
        delivery_method: order.delivery_method
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Fulfillment error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

// Helper function to send SMS delivery
async function sendSMSDelivery(supabase: any, cards: any[], phone: string, order: any, metadata: any) {
  console.log('Sending SMS to:', phone);
  // TODO: Integrate with Twilio
  // For now, just log
  const claimUrls = cards.map(card => 
    `${Deno.env.get('SUPABASE_URL')}/claim/${card.claim_url}`
  ).join('\n');
  
  console.log('SMS would contain:', {
    from: metadata.sender_name || 'AI Gift Cards',
    message: metadata.occasion_message,
    claim_urls: claimUrls
  });

  // Update cards with SMS sent timestamp
  for (const card of cards) {
    await supabase
      .from('ai_gift_cards')
      .update({ sms_sent_at: new Date().toISOString() })
      .eq('id', card.id);
  }
}

// Helper function to send email delivery
async function sendEmailDelivery(supabase: any, cards: any[], email: string, order: any, metadata: any) {
  console.log('Sending email to:', email);
  
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured, skipping email');
    return;
  }

  const brandedName = order.brand_name || 'AI Gift Cards';
  const occasionTitle = metadata.occasion_title || 'Gift Card';
  const occasionMessage = metadata.occasion_message || 'Enjoy your gift!';
  const senderName = metadata.sender_name || brandedName;

  const cardsList = cards.map((card: any) => `
    <div style="background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border: 2px solid #4A90E2;">
      <h3 style="margin-top: 0; color: #2c3e50;">${order.ai_products.name}</h3>
      <p style="font-size: 14px; color: #666;"><strong>Card Code:</strong> <code style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-size: 16px;">${card.card_code}</code></p>
      <p style="font-size: 14px; color: #666;"><strong>Value:</strong> $${card.face_value}</p>
      <p style="font-size: 14px; color: #666;"><strong>Expires:</strong> ${new Date(card.expires_at).toLocaleDateString()}</p>
      <div style="margin-top: 15px;">
        <a href="${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/claim/${card.claim_url}" 
           style="display: inline-block; background: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Claim Your Gift →
        </a>
      </div>
    </div>
  `).join('');

  try {
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${brandedName} <onboarding@resend.dev>`,
        to: [email],
        subject: `${occasionTitle} - Your Gift from ${senderName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;">
            <div style="text-align: center; margin-bottom: 30px;">
              ${order.brand_logo_url ? `<img src="${order.brand_logo_url}" alt="${brandedName}" style="max-width: 200px; height: auto;">` : `<h1 style="color: #2c3e50;">${brandedName}</h1>`}
            </div>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
              <h2 style="margin: 0 0 10px 0; font-size: 28px;">${occasionTitle}</h2>
              <p style="margin: 0; font-size: 16px; opacity: 0.95;">${occasionMessage}</p>
              ${metadata.sender_name ? `<p style="margin: 15px 0 0 0; font-size: 14px; opacity: 0.9;">From: ${metadata.sender_name}</p>` : ''}
            </div>

            <div style="background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #2c3e50; margin-top: 0;">Your ${cards.length > 1 ? 'Gift Cards' : 'Gift Card'}</h2>
              <p style="color: #666; line-height: 1.6;">Click below to claim your gift and start using it immediately!</p>
              
              ${cardsList}
            </div>

            <div style="text-align: center; margin-top: 30px; padding: 20px; color: #999; font-size: 12px;">
              <p style="margin: 0;">Powered by AI Gift Cards™</p>
              <p style="margin: 5px 0 0 0;">Questions? Contact support or visit our help center.</p>
            </div>
          </div>
        `,
      }),
    });

    if (emailResponse.ok) {
      console.log('Gift card email sent successfully to', email);
      
      // Update cards with email sent timestamp
      for (const card of cards) {
        await supabase
          .from('ai_gift_cards')
          .update({ email_sent_at: new Date().toISOString() })
          .eq('id', card.id);
      }
    } else {
      const errorData = await emailResponse.text();
      console.error('Resend API error:', errorData);
    }
  } catch (emailError) {
    console.error('Failed to send email:', emailError);
  }
}

// Helper function to generate physical card PDF
async function generatePhysicalCard(supabase: any, cards: any[], order: any, metadata: any) {
  console.log('Generating physical card PDF for', cards.length, 'cards');
  // TODO: Implement PDF generation
  // For now, mark as ready for print
  for (const card of cards) {
    await supabase
      .from('ai_gift_cards')
      .update({ 
        pdf_url: 'pending_generation',
        // Will be updated when PDF is generated
      })
      .eq('id', card.id);
  }
}

import type { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-02-24.acacia',
    })
  : null;

const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  if (!stripe || !webhookSecret || !supabase) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook system is not configured' }),
    };
  }

  const signature = event.headers['stripe-signature'];

  if (!signature) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing Stripe signature' }),
    };
  }

  try {
    const stripeEvent = stripe.webhooks.constructEvent(event.body || '', signature, webhookSecret);

    switch (stripeEvent.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;

        if (orderId) {
          const paymentIntentId =
            typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null;

          await supabase
            .from('orders')
            .update({
              status: 'confirmed',
              payment_status: 'paid',
              stripe_session_id: session.id,
              stripe_payment_intent: paymentIntentId,
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);
        }
        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;

        if (orderId) {
          await supabase
            .from('orders')
            .update({
              status: 'cancelled',
              payment_status: 'failed',
              stripe_session_id: session.id,
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);
        }
        break;
      }

      default:
        break;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    const err = error as Error;
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Webhook error',
        details: err.message,
      }),
    };
  }
};

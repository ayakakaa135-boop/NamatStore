import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

// إنشاء Supabase client مع service role key للسماح بالتعديل
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export const handler: Handler = async (event) => {
  // السماح فقط بـ POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook secret is not configured' }),
    };
  }

  if (!sig) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No signature provided' }),
    };
  }

  try {
    // التحقق من صحة الـ webhook
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body || '',
      sig,
      webhookSecret
    );

    console.log('Webhook event type:', stripeEvent.type);

    // معالجة أحداث Stripe المختلفة
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        
        console.log('Checkout session completed:', session.id);
        console.log('Order ID from metadata:', session.metadata?.order_id);

        // تحديث حالة الطلب في قاعدة البيانات
        if (session.metadata?.order_id) {
          const { data, error } = await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              status: 'confirmed',
              stripe_session_id: session.id,
              stripe_payment_intent: session.payment_intent as string,
              updated_at: new Date().toISOString(),
            })
            .eq('id', session.metadata.order_id)
            .select();

          if (error) {
            console.error('Error updating order:', error);
            throw error;
          }

          console.log('Order updated successfully:', data);

          // إرسال إشعار بالبريد الإلكتروني (اختياري)
          // يمكن إضافة منطق إرسال البريد هنا
        }
        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        
        console.log('Async payment succeeded:', session.id);

        if (session.metadata?.order_id) {
          await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              status: 'confirmed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', session.metadata.order_id);
        }
        break;
      }

      case 'checkout.session.async_payment_failed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        
        console.log('Async payment failed:', session.id);

        if (session.metadata?.order_id) {
          await supabase
            .from('orders')
            .update({
              payment_status: 'failed',
              status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', session.metadata.order_id);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = stripeEvent.data.object as Stripe.PaymentIntent;
        console.log('Payment intent succeeded:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = stripeEvent.data.object as Stripe.PaymentIntent;
        console.log('Payment intent failed:', paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };

  } catch (error: any) {
    console.error('Webhook error:', error);

    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Webhook error',
        details: error.message,
      }),
    };
  }
};

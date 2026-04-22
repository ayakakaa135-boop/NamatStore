import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
    })
  : null;

type CheckoutItem = {
  product_id: string;
  name: string;
  name_en?: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image: string;
};

type RequestBody = {
  orderId: string;
  items: CheckoutItem[];
  customerEmail: string;
  shippingAddress: {
    country: string;
    city: string;
    address: string;
    postalCode: string;
  };
  shippingAmount: number;
  successUrl: string;
  cancelUrl: string;
};

export default async function (req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!stripe) {
    return res.status(500).json({ error: 'Payment system is not configured' });
  }

  try {
    const body = req.body as RequestBody;

    if (!body.orderId || !body.customerEmail || !Array.isArray(body.items) || body.items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields: orderId, customerEmail, or items' });
    }

    const origin = new URL(body.successUrl).origin;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = body.items.map((item) => {
      if (!item.name || !item.price || !item.quantity) {
        throw new Error(`Invalid item data for product ${item.product_id}`);
      }

      const descriptor = [item.name_en || item.name, item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`]
        .filter(Boolean)
        .join(' - ');

      // Stripe requires absolute URLs for images
      const imageUrl = item.image 
        ? (item.image.startsWith('http') ? item.image : `${origin}${item.image.startsWith('/') ? '' : '/'}${item.image}`)
        : undefined;

      return {
        price_data: {
          currency: 'sar',
          product_data: {
            name: item.name,
            description: descriptor,
            images: imageUrl ? [imageUrl] : [],
            metadata: {
              product_id: item.product_id,
              size: item.size || '',
              color: item.color || '',
            },
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const shippingAmount = Math.max(0, Math.round((body.shippingAmount || 0) * 100));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      automatic_payment_methods: { enabled: true },
      line_items: lineItems,
      success_url: body.successUrl,
      cancel_url: body.cancelUrl,
      customer_email: body.customerEmail,
      locale: 'auto',
      billing_address_collection: 'auto',
      phone_number_collection: { enabled: true },
      shipping_address_collection: {
        allowed_countries: ['SA', 'AE', 'KW', 'QA', 'BH', 'OM', 'JO', 'EG'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: shippingAmount,
              currency: 'sar',
            },
            display_name: shippingAmount > 0 ? 'Standard Shipping' : 'Free Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
      ],
      metadata: {
        order_id: body.orderId,
        shipping_city: body.shippingAddress.city,
        shipping_country: body.shippingAddress.country,
        shipping_address: body.shippingAddress.address,
        shipping_postal_code: body.shippingAddress.postalCode,
      },
      custom_text: {
        submit: {
          message: 'سيتم تأكيد طلبك خلال 24 ساعة',
        },
      },
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    const err = error as Stripe.errors.StripeError & Error;
    console.error('Stripe Session Error:', err);
    return res.status(500).json({
      error: 'Unable to create checkout session',
      details: err.message,
    });
  }
}

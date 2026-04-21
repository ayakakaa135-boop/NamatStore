import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const STRIPE_API_BASE = 'https://api.stripe.com/v1/checkout/sessions';
const STRIPE_API_VERSION = '2026-02-25.clover';

function encodeForm(data: Record<string, string>) {
  const body = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => body.append(key, value));
  return body;
}

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY' }),
    };
  }

  const body = event.body ? JSON.parse(event.body) : {};
  const { items = [], customerEmail, orderNumber, shippingAmount = 0, locale = 'ar' } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Cart items are required' }),
    };
  }

  const origin = event.headers.origin || process.env.APP_URL || 'https://namat-store.netlify.app';
  const payload: Record<string, string> = {
    mode: 'payment',
    success_url: `${origin}/orders?checkout=success&order=${encodeURIComponent(orderNumber || '')}`,
    cancel_url: `${origin}/checkout?checkout=cancelled`,
    'metadata[order_number]': orderNumber || '',
    locale: locale === 'en' ? 'en' : 'ar',
  };

  if (customerEmail) {
    payload.customer_email = customerEmail;
  }

  items.forEach((item: any, index: number) => {
    payload[`line_items[${index}][price_data][currency]`] = 'sar';
    payload[`line_items[${index}][price_data][unit_amount]`] = String(Math.round(Number(item.price) * 100));
    payload[`line_items[${index}][price_data][product_data][name]`] = item.name;
    payload[`line_items[${index}][quantity]`] = String(item.quantity);
  });

  if (shippingAmount > 0) {
    const shippingIndex = items.length;
    payload[`line_items[${shippingIndex}][price_data][currency]`] = 'sar';
    payload[`line_items[${shippingIndex}][price_data][unit_amount]`] = String(Math.round(Number(shippingAmount) * 100));
    payload[`line_items[${shippingIndex}][price_data][product_data][name]`] = locale === 'en' ? 'Shipping' : 'الشحن';
    payload[`line_items[${shippingIndex}][quantity]`] = '1';
  }

  try {
    const stripeResponse = await fetch(STRIPE_API_BASE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Stripe-Version': STRIPE_API_VERSION,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: encodeForm(payload),
    });

    const data = await stripeResponse.json();

    if (!stripeResponse.ok) {
      return {
        statusCode: stripeResponse.status,
        headers,
        body: JSON.stringify({ error: data?.error?.message || 'Stripe request failed' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: data.url }),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Internal server error' }),
    };
  }
};

export { handler };

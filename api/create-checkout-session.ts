const STRIPE_API_BASE = 'https://api.stripe.com/v1/checkout/sessions';
const STRIPE_API_VERSION = '2026-02-25.clover';

function encodeForm(data: Record<string, string>) {
  const body = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => body.append(key, value));
  return body;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { items = [], customerEmail, orderNumber, shippingAmount = 0, locale = 'ar' } = body ?? {};

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Cart items are required' });
    return;
  }

  const origin = req.headers.origin || process.env.APP_URL || 'http://localhost:3000';
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
    res.status(stripeResponse.status).json({ error: data?.error?.message || 'Stripe request failed' });
    return;
  }

  res.status(200).json({ url: data.url });
}

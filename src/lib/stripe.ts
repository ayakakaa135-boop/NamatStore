import type { StripeCheckoutRequest, StripeCheckoutResponse } from '@/types/order';

export async function createStripeCheckoutSession(payload: StripeCheckoutRequest) {
  const response = await fetch('/.netlify/functions/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error('Stripe Function Error:', data);
    throw new Error(data?.details || data?.error || 'Could not create Stripe checkout session');
  }

  return data as StripeCheckoutResponse;
}

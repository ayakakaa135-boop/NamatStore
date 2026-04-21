import { getSupabase } from './supabase';

export type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  locale: string;
};

export async function submitContactMessage(payload: ContactPayload): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) {
    return { ok: false, error: 'Supabase is not configured' };
  }
  const { error } = await sb.from('contact_messages').insert({
    name: payload.name,
    email: payload.email,
    phone: payload.phone || null,
    subject: payload.subject || null,
    message: payload.message,
    locale: payload.locale,
  });
  if (error) {
    console.error('[namat] contact insert', error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function submitNewsletterEmail(
  email: string,
  source: string,
  locale: string
): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) {
    return { ok: false, error: 'Supabase is not configured' };
  }
  const { error } = await sb.from('newsletter_signups').insert({
    email: email.trim().toLowerCase(),
    source,
    locale,
  });
  if (error) {
    if (error.code === '23505') {
      return { ok: true };
    }
    console.error('[namat] newsletter insert', error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

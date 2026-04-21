import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
// Support both new publishable key format (sb_publishable_) and legacy anon key (eyJ...)
const anonKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

let client: SupabaseClient | null = null;

if (url && anonKey) {
  client = createClient(url, anonKey);
}

export const supabase = client;

export function getSupabase(): SupabaseClient | null {
  return client;
}

export function isSupabaseReady(): boolean {
  return Boolean(client);
}

import { getSupabase } from './supabase';

export type ProfileRecord = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
  role?: 'customer' | 'admin';
  updated_at?: string | null;
};

export async function getMyProfile(userId: string): Promise<{ ok: boolean; profile?: ProfileRecord; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'Supabase is not configured' };

  const { data, error } = await sb
    .from('profiles')
    .select('id, full_name, avatar_url, website, role, updated_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  return { ok: true, profile: (data ?? { id: userId, full_name: null, avatar_url: null, website: null, role: 'customer' }) as ProfileRecord };
}

export async function upsertMyProfile(profile: ProfileRecord): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: 'Supabase is not configured' };

  const { error } = await sb.from('profiles').upsert({
    id: profile.id,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
    website: profile.website,
    updated_at: new Date().toISOString(),
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

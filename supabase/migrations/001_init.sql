-- تشغيل هذا الملف من لوحة Supabase → SQL Editor بعد إنشاء المشروع.
-- يسمح للزوار بإرسال رسائل والاشتراك في النشرة دون تسجيل دخول (مفتاح anon).

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  locale text not null default 'ar'
);

create table if not exists public.newsletter_signups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  source text not null default 'footer',
  locale text not null default 'ar',
  constraint newsletter_signups_email_unique unique (email)
);

alter table public.contact_messages enable row level security;
alter table public.newsletter_signups enable row level security;

create policy "Allow anonymous insert contact_messages"
  on public.contact_messages for insert
  to anon
  with check (true);

create policy "Allow anonymous insert newsletter_signups"
  on public.newsletter_signups for insert
  to anon
  with check (true);

-- لا تضف سياسات SELECT للعامة؛ راجع الرسائل من لوحة Supabase Table Editor.

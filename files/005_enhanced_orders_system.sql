-- Migration: Enhanced Orders Table with Stripe Integration
-- Date: 2026-04-20
-- Description: Complete orders system with payment tracking and status management

-- إنشاء جدول الطلبات
create table if not exists public.orders (
  -- Primary Keys
  id uuid default gen_random_uuid() primary key,
  order_number text unique default ('ORD-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  
  -- User Reference (nullable for guest checkout)
  user_id uuid references auth.users(id) on delete set null,
  
  -- Customer Information
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  
  -- Shipping Information
  shipping_address jsonb not null,
  notes text,
  
  -- Order Items (JSON array)
  items jsonb not null,
  
  -- Pricing
  total_amount decimal(10,2) not null check (total_amount >= 0),
  currency text default 'SAR',
  
  -- Status Management
  status text default 'pending' check (status in (
    'pending',
    'confirmed', 
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
  )),
  
  payment_status text default 'pending' check (payment_status in (
    'pending',
    'paid',
    'failed',
    'refunded',
    'partially_refunded'
  )),
  
  -- Stripe Integration
  stripe_session_id text,
  stripe_payment_intent text,
  stripe_charge_id text,
  
  -- Shipping Tracking
  tracking_number text,
  shipping_carrier text,
  estimated_delivery_date date,
  actual_delivery_date timestamp with time zone,
  
  -- Admin Notes
  admin_notes text,
  
  -- Timestamps
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- Constraints
  constraint valid_email check (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- إنشاء Indexes للأداء
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_payment_status_idx on public.orders(payment_status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_customer_email_idx on public.orders(customer_email);
create index if not exists orders_order_number_idx on public.orders(order_number);
create index if not exists orders_stripe_session_idx on public.orders(stripe_session_id);

-- Function لتحديث updated_at تلقائياً
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger لتحديث updated_at
drop trigger if exists update_orders_updated_at on public.orders;
create trigger update_orders_updated_at
  before update on public.orders
  for each row
  execute function public.update_updated_at_column();

-- Row Level Security (RLS) Policies
alter table public.orders enable row level security;

-- Policy: المستخدمون يمكنهم رؤية طلباتهم فقط
drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders"
  on public.orders
  for select
  using (
    auth.uid() = user_id 
    or auth.jwt() ->> 'role' = 'admin'
  );

-- Policy: أي شخص يمكنه إنشاء طلب (guest checkout)
drop policy if exists "Anyone can create orders" on public.orders;
create policy "Anyone can create orders"
  on public.orders
  for insert
  with check (true);

-- Policy: المستخدمون يمكنهم تحديث طلباتهم الخاصة (محدود)
drop policy if exists "Users can update own orders" on public.orders;
create policy "Users can update own orders"
  on public.orders
  for update
  using (
    (auth.uid() = user_id and status = 'pending')
    or auth.jwt() ->> 'role' = 'admin'
  );

-- Policy: الأدمن فقط يمكنهم حذف الطلبات
drop policy if exists "Admins can delete orders" on public.orders;
create policy "Admins can delete orders"
  on public.orders
  for delete
  using (auth.jwt() ->> 'role' = 'admin');

-- Function للبحث في الطلبات
create or replace function public.search_orders(
  search_query text,
  status_filter text default null,
  payment_filter text default null,
  limit_count int default 50
)
returns setof public.orders as $$
begin
  return query
  select *
  from public.orders
  where
    (search_query is null or
     order_number ilike '%' || search_query || '%' or
     customer_name ilike '%' || search_query || '%' or
     customer_email ilike '%' || search_query || '%' or
     customer_phone ilike '%' || search_query || '%')
    and (status_filter is null or status = status_filter)
    and (payment_filter is null or payment_status = payment_filter)
    and (auth.uid() = user_id or auth.jwt() ->> 'role' = 'admin')
  order by created_at desc
  limit limit_count;
end;
$$ language plpgsql security definer;

-- Function لإحصائيات الطلبات (للأدمن)
create or replace function public.get_order_statistics(
  date_from timestamp with time zone default null,
  date_to timestamp with time zone default null
)
returns table (
  total_orders bigint,
  pending_orders bigint,
  confirmed_orders bigint,
  shipped_orders bigint,
  delivered_orders bigint,
  cancelled_orders bigint,
  total_revenue numeric,
  average_order_value numeric
) as $$
begin
  return query
  select
    count(*) as total_orders,
    count(*) filter (where status = 'pending') as pending_orders,
    count(*) filter (where status = 'confirmed') as confirmed_orders,
    count(*) filter (where status = 'shipped') as shipped_orders,
    count(*) filter (where status = 'delivered') as delivered_orders,
    count(*) filter (where status = 'cancelled') as cancelled_orders,
    coalesce(sum(total_amount) filter (where payment_status = 'paid'), 0) as total_revenue,
    coalesce(avg(total_amount) filter (where payment_status = 'paid'), 0) as average_order_value
  from public.orders
  where
    (date_from is null or created_at >= date_from)
    and (date_to is null or created_at <= date_to)
    and (auth.jwt() ->> 'role' = 'admin');
end;
$$ language plpgsql security definer;

-- جدول Order History (تاريخ التغييرات)
create table if not exists public.order_history (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  changed_by uuid references auth.users(id) on delete set null,
  changed_field text not null,
  old_value text,
  new_value text,
  notes text,
  created_at timestamp with time zone default now()
);

create index if not exists order_history_order_id_idx on public.order_history(order_id);
create index if not exists order_history_created_at_idx on public.order_history(created_at desc);

-- Function لتسجيل التغييرات تلقائياً
create or replace function public.log_order_changes()
returns trigger as $$
begin
  -- تسجيل تغيير الحالة
  if old.status is distinct from new.status then
    insert into public.order_history (order_id, changed_by, changed_field, old_value, new_value)
    values (new.id, auth.uid(), 'status', old.status, new.status);
  end if;
  
  -- تسجيل تغيير حالة الدفع
  if old.payment_status is distinct from new.payment_status then
    insert into public.order_history (order_id, changed_by, changed_field, old_value, new_value)
    values (new.id, auth.uid(), 'payment_status', old.payment_status, new.payment_status);
  end if;
  
  -- تسجيل إضافة رقم التتبع
  if old.tracking_number is distinct from new.tracking_number and new.tracking_number is not null then
    insert into public.order_history (order_id, changed_by, changed_field, old_value, new_value)
    values (new.id, auth.uid(), 'tracking_number', old.tracking_number, new.tracking_number);
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists log_order_changes_trigger on public.orders;
create trigger log_order_changes_trigger
  after update on public.orders
  for each row
  execute function public.log_order_changes();

-- RLS for order_history
alter table public.order_history enable row level security;

drop policy if exists "Users can view order history" on public.order_history;
create policy "Users can view order history"
  on public.order_history
  for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_history.order_id
      and (orders.user_id = auth.uid() or auth.jwt() ->> 'role' = 'admin')
    )
  );

-- إدراج بيانات تجريبية (اختياري - للتطوير فقط)
-- يمكنك حذف هذا القسم في الإنتاج
/*
insert into public.orders (
  customer_name,
  customer_email,
  customer_phone,
  shipping_address,
  items,
  total_amount,
  status,
  payment_status
) values (
  'أحمد محمد',
  'ahmed@example.com',
  '+966501234567',
  '{"country": "Saudi Arabia", "city": "Riyadh", "address": "King Fahd Road, Building 123", "postalCode": "12345"}'::jsonb,
  '[{"product_id": "1", "name": "عباية فاخرة", "name_en": "Luxury Abaya", "price": 450, "quantity": 1, "size": "M", "color": "Black", "image": "/image/product1.jpg"}]'::jsonb,
  450,
  'delivered',
  'paid'
);
*/

-- Views للتقارير
create or replace view public.orders_summary as
select
  date_trunc('day', created_at) as order_date,
  count(*) as total_orders,
  count(*) filter (where payment_status = 'paid') as paid_orders,
  sum(total_amount) filter (where payment_status = 'paid') as daily_revenue
from public.orders
group by date_trunc('day', created_at)
order by order_date desc;

-- منح الصلاحيات
grant select on public.orders_summary to authenticated;
grant select on public.orders_summary to anon;

-- Comments للتوثيق
comment on table public.orders is 'جدول الطلبات - يحتوي على جميع طلبات العملاء';
comment on column public.orders.order_number is 'رقم الطلب الفريد المعروض للعميل';
comment on column public.orders.stripe_session_id is 'معرف جلسة الدفع من Stripe';
comment on column public.orders.tracking_number is 'رقم تتبع الشحنة';

-- نجاح Migration
do $$ 
begin
  raise notice 'Orders table migration completed successfully!';
end $$;

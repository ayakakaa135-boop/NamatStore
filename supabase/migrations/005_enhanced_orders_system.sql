-- Migration: Enhance existing orders schema with Stripe-compatible fields
-- Safe to run after 003_orders.sql and 004_admin_order_roles.sql

alter table public.orders
  alter column user_id drop not null;

alter table public.orders
  add column if not exists shipping_address jsonb,
  add column if not exists items jsonb not null default '[]'::jsonb,
  add column if not exists currency text not null default 'SAR',
  add column if not exists payment_status text not null default 'pending',
  add column if not exists stripe_session_id text,
  add column if not exists stripe_payment_intent text,
  add column if not exists stripe_charge_id text,
  add column if not exists tracking_number text,
  add column if not exists shipping_carrier text,
  add column if not exists estimated_delivery_date date,
  add column if not exists actual_delivery_date timestamptz,
  add column if not exists admin_notes text,
  add column if not exists updated_at timestamptz not null default now();

update public.orders
set shipping_address = jsonb_build_object(
  'country', 'Saudi Arabia',
  'city', city,
  'address', address,
  'postalCode', ''
)
where shipping_address is null;

update public.orders o
set items = coalesce((
  select jsonb_agg(
    jsonb_build_object(
      'product_id', oi.product_id,
      'name', oi.product_name,
      'price', oi.unit_price,
      'quantity', oi.quantity,
      'size', oi.selected_size,
      'image', oi.product_image
    )
  )
  from public.order_items oi
  where oi.order_id = o.id
), '[]'::jsonb)
where items = '[]'::jsonb;

create index if not exists orders_payment_status_idx on public.orders(payment_status);
create index if not exists orders_created_at_desc_idx on public.orders(created_at desc);
create index if not exists orders_customer_email_idx on public.orders(customer_email);
create index if not exists orders_stripe_session_id_idx on public.orders(stripe_session_id);

alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
  check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'));

alter table public.orders
  drop constraint if exists orders_payment_status_check;

alter table public.orders
  add constraint orders_payment_status_check
  check (payment_status in ('pending', 'paid', 'failed', 'refunded', 'partially_refunded'));

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_orders_updated_at on public.orders;
create trigger update_orders_updated_at
  before update on public.orders
  for each row
  execute function public.update_updated_at_column();

create table if not exists public.order_history (
  id uuid default gen_random_uuid() primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  changed_by uuid references auth.users(id) on delete set null,
  changed_field text not null,
  old_value text,
  new_value text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists order_history_order_id_idx on public.order_history(order_id);
create index if not exists order_history_created_at_idx on public.order_history(created_at desc);

create or replace function public.log_order_changes()
returns trigger as $$
begin
  if old.status is distinct from new.status then
    insert into public.order_history (order_id, changed_by, changed_field, old_value, new_value)
    values (new.id, auth.uid(), 'status', old.status, new.status);
  end if;

  if old.payment_status is distinct from new.payment_status then
    insert into public.order_history (order_id, changed_by, changed_field, old_value, new_value)
    values (new.id, auth.uid(), 'payment_status', old.payment_status, new.payment_status);
  end if;

  if old.tracking_number is distinct from new.tracking_number then
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

alter table public.order_history enable row level security;

drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders"
  on public.orders for select
  to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Users can insert own orders" on public.orders;
drop policy if exists "Anyone can create orders" on public.orders;
create policy "Anyone can create orders"
  on public.orders for insert
  to anon, authenticated
  with check (user_id is null or auth.uid() = user_id);

drop policy if exists "Users can update own orders" on public.orders;
create policy "Users can update own orders"
  on public.orders for update
  to authenticated
  using (
    (auth.uid() = user_id and status = 'pending')
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  )
  with check (
    (auth.uid() = user_id and status = 'pending')
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Admins can delete orders" on public.orders;
create policy "Admins can delete orders"
  on public.orders for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

drop policy if exists "Users can view order history" on public.order_history;
create policy "Users can view order history"
  on public.order_history for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders
      left join public.profiles on profiles.id = auth.uid()
      where orders.id = order_history.order_id
        and (orders.user_id = auth.uid() or profiles.role = 'admin')
    )
  );

create or replace function public.search_orders(
  search_query text default null,
  status_filter text default null,
  payment_filter text default null,
  limit_count integer default 50
)
returns setof public.orders as $$
begin
  return query
  select *
  from public.orders
  where
    (
      search_query is null
      or order_number ilike '%' || search_query || '%'
      or customer_name ilike '%' || search_query || '%'
      or customer_email ilike '%' || search_query || '%'
      or customer_phone ilike '%' || search_query || '%'
    )
    and (status_filter is null or status = status_filter)
    and (payment_filter is null or payment_status = payment_filter)
    and (
      user_id = auth.uid()
      or exists (
        select 1 from public.profiles
        where profiles.id = auth.uid() and profiles.role = 'admin'
      )
    )
  order by created_at desc
  limit limit_count;
end;
$$ language plpgsql security definer;

create or replace function public.get_order_statistics(
  date_from timestamptz default null,
  date_to timestamptz default null
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
  if not exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  ) then
    return;
  end if;

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
    and (date_to is null or created_at <= date_to);
end;
$$ language plpgsql security definer;

create or replace view public.orders_summary as
select
  date_trunc('day', created_at) as order_date,
  count(*) as total_orders,
  count(*) filter (where payment_status = 'paid') as paid_orders,
  coalesce(sum(total_amount) filter (where payment_status = 'paid'), 0) as daily_revenue
from public.orders
group by date_trunc('day', created_at)
order by order_date desc;

grant select on public.orders_summary to authenticated;
grant select on public.orders_summary to anon;

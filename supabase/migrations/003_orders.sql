create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_number text not null unique default ('NMT-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  city text not null,
  address text not null,
  notes text,
  payment_method text not null,
  subtotal numeric(10,2) not null default 0,
  shipping_amount numeric(10,2) not null default 0,
  total_amount numeric(10,2) not null default 0
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  product_image text not null,
  unit_price numeric(10,2) not null,
  quantity integer not null check (quantity > 0),
  selected_size text
);

create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists order_items_order_id_idx on public.order_items(order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Users can view own orders"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own orders"
  on public.orders for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can view own order items"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id and orders.user_id = auth.uid()
    )
  );

create policy "Users can insert own order items"
  on public.order_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id and orders.user_id = auth.uid()
    )
  );

-- Run in the Supabase SQL editor. Safe to run again.
-- These records are demonstrations only; they never confirm real bookings or money.
begin;

create table if not exists public.demo_orders (
  id text not null check (char_length(id) between 1 and 100),
  user_id uuid not null default auth.uid() references auth.users(id),
  order_data jsonb not null check (jsonb_typeof(order_data) = 'object' and octet_length(order_data::text) <= 20000),
  amount numeric not null check (amount >= 0 and amount < 1000000000000),
  payment_method text not null check (payment_method in ('qris', 'va')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'succeeded', 'failed')),
  is_simulation boolean not null default true check (is_simulation = true),
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists demo_orders_owner_created_idx on public.demo_orders(user_id, created_at desc);
alter table public.demo_orders enable row level security;
revoke all on public.demo_orders from public, anon, authenticated;
grant select, insert on public.demo_orders to authenticated;
-- Changing ownership, prices, snapshots or the simulation marker is forbidden.
grant update (payment_status) on public.demo_orders to authenticated;

drop policy if exists "Owners read demo orders" on public.demo_orders;
create policy "Owners read demo orders" on public.demo_orders
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Owners create pending simulations" on public.demo_orders;
create policy "Owners create pending simulations" on public.demo_orders
for insert to authenticated
with check ((select auth.uid()) = user_id and is_simulation = true and payment_status = 'pending');

drop policy if exists "Owners simulate unfinished payments" on public.demo_orders;
create policy "Owners simulate unfinished payments" on public.demo_orders
for update to authenticated
using ((select auth.uid()) = user_id and is_simulation = true and payment_status in ('pending', 'failed'))
with check ((select auth.uid()) = user_id and is_simulation = true and payment_status in ('pending', 'failed', 'succeeded'));

commit;

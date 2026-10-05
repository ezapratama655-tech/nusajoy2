-- Run AFTER guide-bookings.sql and demo-payments.sql. Safe to run again.
-- Public listings contain only information partners explicitly publish.
-- Incoming reservations and totals remain simulations, not real payments.
begin;

create table if not exists public.partner_listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id),
  kind text not null check (kind in ('guide', 'business')),
  title text not null check (char_length(title) between 3 and 150),
  description text not null default '' check (char_length(description) <= 3000),
  category text not null default 'Budaya' check (char_length(category) between 1 and 100),
  location text not null check (char_length(location) between 1 and 250),
  address text not null default '' check (char_length(address) <= 500),
  image_url text not null default '' check (image_url = '' or image_url ~* '^https://'),
  price numeric not null check (price > 0 and price < 10000000000),
  phone text not null default '' check (phone = '' or phone ~ '^\+?[0-9 ()-]{9,25}$'),
  opening_hours text not null default '' check (char_length(opening_hours) <= 250),
  languages text[] not null default '{Indonesia}',
  published boolean not null default false,
  archived boolean not null default false check (not archived or not published),
  created_at timestamptz not null default now()
);
create index if not exists partner_listings_owner_idx on public.partner_listings(owner_id, kind);
alter table public.partner_listings enable row level security;
revoke all on public.partner_listings from public, anon, authenticated;
grant select on public.partner_listings to anon, authenticated;
grant insert on public.partner_listings to authenticated;
grant update (title, description, category, location, address, image_url, price, phone, opening_hours, languages, published, archived) on public.partner_listings to authenticated;
drop policy if exists "Published partner catalog" on public.partner_listings;
create policy "Published partner catalog" on public.partner_listings for select to anon, authenticated using (published and not archived);
drop policy if exists "Owners read listings" on public.partner_listings;
create policy "Owners read listings" on public.partner_listings for select to authenticated using ((select auth.uid()) = owner_id);
drop policy if exists "Owners create listings" on public.partner_listings;
create policy "Owners create listings" on public.partner_listings for insert to authenticated with check ((select auth.uid()) = owner_id);
drop policy if exists "Owners update listings" on public.partner_listings;
create policy "Owners update listings" on public.partner_listings for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

create table if not exists public.partner_availability (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.partner_listings(id),
  available_date date not null,
  start_time time not null default '09:00',
  end_time time not null default '17:00' check (end_time > start_time),
  capacity integer not null default 1 check (capacity between 1 and 100),
  is_available boolean not null default true,
  unique (listing_id, available_date)
);
alter table public.partner_availability enable row level security;
revoke all on public.partner_availability from public, anon, authenticated;
grant select on public.partner_availability to anon, authenticated;
grant insert, update on public.partner_availability to authenticated;
drop policy if exists "Published service availability" on public.partner_availability;
create policy "Published service availability" on public.partner_availability for select to anon, authenticated
using (exists (select 1 from public.partner_listings l where l.id = listing_id and l.published and not l.archived));
drop policy if exists "Owners read availability" on public.partner_availability;
create policy "Owners read availability" on public.partner_availability for select to authenticated
using (exists (select 1 from public.partner_listings l where l.id = listing_id and l.owner_id = (select auth.uid())));
drop policy if exists "Owners create availability" on public.partner_availability;
create policy "Owners create availability" on public.partner_availability for insert to authenticated
with check (exists (select 1 from public.partner_listings l where l.id = listing_id and l.owner_id = (select auth.uid())));
drop policy if exists "Owners update availability" on public.partner_availability;
create policy "Owners update availability" on public.partner_availability for update to authenticated
using (exists (select 1 from public.partner_listings l where l.id = listing_id and l.owner_id = (select auth.uid())))
with check (exists (select 1 from public.partner_listings l where l.id = listing_id and l.owner_id = (select auth.uid())));

-- Migrate only guides whose owner exists in Auth; no name/email matching or claiming.
alter table public.tour_guides add column if not exists managed_in_dashboard boolean not null default false;
insert into public.partner_listings(id, owner_id, kind, title, description, category, location, image_url, price, languages, published)
select g.id, g.user_id, 'guide', left(g.full_name, 150), left(coalesce(g.bio, ''), 3000),
  left(coalesce(nullif(g.category, ''), 'Budaya'), 100), left(coalesce(nullif(g.location, ''), nullif(g.city, ''), 'Indonesia'), 250),
  case when g.profile_photo ~* '^https://' then g.profile_photo else '' end,
  g.price_per_trip,
  case when jsonb_typeof(to_jsonb(g.languages)) = 'array' then array(select jsonb_array_elements_text(to_jsonb(g.languages)))
    when jsonb_typeof(to_jsonb(g.languages)) = 'string' then regexp_split_to_array(g.languages::text, '\s*,\s*') else '{Indonesia}'::text[] end,
  coalesce(g.is_active, false)
from public.tour_guides g join auth.users u on u.id = g.user_id
where char_length(g.full_name) >= 3 and g.price_per_trip > 0 and g.price_per_trip < 10000000000
on conflict (id) do nothing;
update public.tour_guides g set managed_in_dashboard = true
where exists (select 1 from public.partner_listings l where l.id = g.id and l.kind = 'guide' and l.owner_id = g.user_id);

alter table public.demo_orders add column if not exists listing_id uuid references public.partner_listings(id);
alter table public.demo_orders add column if not exists provider_id uuid references auth.users(id);
alter table public.demo_orders add column if not exists fulfillment_status text not null default 'pending' check (fulfillment_status in ('pending', 'confirmed', 'cancelled', 'completed'));
create index if not exists demo_orders_provider_idx on public.demo_orders(provider_id, created_at desc);
grant update (fulfillment_status) on public.demo_orders to authenticated;

-- Restrictive policies also apply alongside the original traveler insert policy.
drop policy if exists "Linked simulations match the catalog" on public.demo_orders;
create policy "Linked simulations match the catalog" on public.demo_orders as restrictive for insert to authenticated
with check (
  fulfillment_status = 'pending' and (
    (listing_id is null and provider_id is null) or
    (listing_id is null and exists (
      select 1 from public.tour_guides g where g.id::text = order_data->>'guideId' and g.user_id = provider_id and g.is_active and not g.managed_in_dashboard and amount = g.price_per_trip
        and order_data->>'type' = 'guide' and (order_data->>'date')::date >= current_date
        and coalesce((order_data->>'guestsCount')::integer, 1) = 1 and coalesce((order_data->>'duration_days')::integer, 1) between 1 and 14
    )) or
    exists (
      select 1 from public.partner_listings l where l.id = listing_id and l.owner_id = provider_id and l.published and not l.archived
      and order_data->>'type' = l.kind
      and (order_data->>'date')::date >= current_date
      and coalesce((order_data->>'guestsCount')::integer, 1) between 1 and 100
      and coalesce((order_data->>'duration_days')::integer, 1) between 1 and 14
      and (l.kind <> 'guide' or coalesce((order_data->>'guestsCount')::integer, 1) = 1)
      and amount = case when l.kind = 'guide' then l.price else
        l.price * coalesce((order_data->>'guestsCount')::integer, 1) + round(l.price * coalesce((order_data->>'guestsCount')::integer, 1) * 0.025) end
      and (
        not exists (select 1 from public.partner_availability a where a.listing_id = l.id) or
        (select count(*) from public.partner_availability a where a.listing_id = l.id and a.is_available
          and a.capacity >= coalesce((order_data->>'guestsCount')::integer, 1)
          and a.available_date >= (order_data->>'date')::date
          and a.available_date < (order_data->>'date')::date + case when l.kind = 'guide' then coalesce((order_data->>'duration_days')::integer, 1) else 1 end)
        = case when l.kind = 'guide' then coalesce((order_data->>'duration_days')::integer, 1) else 1 end
      )
    )
  )
);
drop policy if exists "Providers read incoming simulations" on public.demo_orders;
create policy "Providers read incoming simulations" on public.demo_orders for select to authenticated using ((select auth.uid()) = provider_id);
drop policy if exists "Providers manage paid simulations" on public.demo_orders;
create policy "Providers manage paid simulations" on public.demo_orders for update to authenticated
using ((select auth.uid()) = provider_id and is_simulation and payment_status = 'succeeded' and fulfillment_status in ('pending', 'confirmed'))
with check ((select auth.uid()) = provider_id and is_simulation and payment_status = 'succeeded');

-- Column grants are shared by authenticated clients, so enforce each actor/state here.
-- This function uses caller permissions and RLS; it never bypasses them.
create or replace function public.validate_demo_order_changes() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare
  slot public.partner_availability%rowtype;
  day_to_check date;
  first_day date;
  day_count integer;
  guests integer;
  used_capacity integer;
begin
  if new.payment_status is distinct from old.payment_status then
    if auth.uid() is distinct from old.user_id or old.payment_status not in ('pending', 'failed') then
      raise exception 'Only the traveler can simulate an unfinished payment' using errcode = '42501';
    end if;
  end if;
  if new.fulfillment_status is distinct from old.fulfillment_status then
    if auth.uid() is distinct from old.provider_id or old.payment_status <> 'succeeded'
      or not ((old.fulfillment_status = 'pending' and new.fulfillment_status in ('confirmed', 'cancelled'))
        or (old.fulfillment_status = 'confirmed' and new.fulfillment_status in ('completed', 'cancelled'))) then
      raise exception 'Only the provider can make this reservation transition' using errcode = '42501';
    end if;
    if new.fulfillment_status = 'confirmed' and old.listing_id is not null
      and exists (select 1 from public.partner_availability a where a.listing_id = old.listing_id) then
      first_day := (old.order_data->>'date')::date;
      select case when l.kind = 'guide' then coalesce((old.order_data->>'duration_days')::integer, 1) else 1 end into day_count
        from public.partner_listings l where l.id = old.listing_id;
      guests := coalesce((old.order_data->>'guestsCount')::integer, 1);
      -- Lock each day in chronological order, so concurrent confirmations cannot oversell.
      for day_to_check in select first_day + n from generate_series(0, day_count - 1) n loop
        select * into slot from public.partner_availability a where a.listing_id = old.listing_id and a.available_date = day_to_check for update;
        if not found or not slot.is_available then
          raise exception 'Jadwal tidak tersedia. Perbarui jadwal atau batalkan reservasi.' using errcode = '23514';
        end if;
        select coalesce(sum(coalesce((o.order_data->>'guestsCount')::integer, 1)), 0) into used_capacity
        from public.demo_orders o where o.listing_id = old.listing_id and o.payment_status = 'succeeded'
          and o.fulfillment_status in ('confirmed', 'completed') and (o.user_id, o.id) <> (old.user_id, old.id)
          and (o.order_data->>'date')::date <= day_to_check
          and (o.order_data->>'date')::date + case when old.order_data->>'type' = 'guide' then coalesce((o.order_data->>'duration_days')::integer, 1) else 1 end > day_to_check;
        if used_capacity + guests > slot.capacity then
          raise exception 'Kapasitas jadwal sudah penuh.' using errcode = '23514';
        end if;
      end loop;
    end if;
  end if;
  return new;
end $$;
revoke all on function public.validate_demo_order_changes() from public, anon, authenticated;
drop trigger if exists demo_order_actor_transitions on public.demo_orders;
create trigger demo_order_actor_transitions before update on public.demo_orders for each row execute function public.validate_demo_order_changes();

commit;

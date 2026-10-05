-- Run once in the Supabase SQL editor. Existing tour_guides.id is UUID.
-- Creates booking requests only; this does not process payments.
begin;

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  guide_id uuid not null references public.tour_guides(id),
  booking_date date not null,
  duration_days integer not null check (duration_days between 1 and 14),
  total_price numeric not null check (total_price > 0),
  notes text not null default '' check (char_length(notes) <= 2000),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now()
);

create index bookings_user_created_idx on public.bookings(user_id, created_at desc);
create index bookings_guide_date_idx on public.bookings(guide_id, booking_date);

alter table public.bookings enable row level security;
revoke all on public.bookings from anon, authenticated;
grant select, insert on public.bookings to authenticated;

create policy "Travelers read their own booking requests"
on public.bookings for select to authenticated
using ((select auth.uid()) = user_id);

-- The public catalog currently prices guides per trip, not per day.
-- Check the catalog rate on the server rather than trusting the browser amount.
create policy "Travelers create pending requests at the catalog price"
on public.bookings for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and status = 'pending'
  and booking_date >= current_date
  and exists (
    select 1 from public.tour_guides g
    where g.id = guide_id and g.is_active = true and total_price = g.price_per_trip
  )
);

commit;

// Optional isolated PostgreSQL/RLS verification using PGlite 0.5.8.
// NUSAJOY_PGLITE_MODULE must point to its installed dist/index.js outside this repo.
// No hosted Supabase data is modified.
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
if (!process.env.NUSAJOY_PGLITE_MODULE) throw new Error('Set NUSAJOY_PGLITE_MODULE to the PGlite 0.5.8 dist/index.js path.');
const { PGlite } = await import(pathToFileURL(process.env.NUSAJOY_PGLITE_MODULE).href);
const db = new PGlite();
const provider = '00000000-0000-0000-0000-000000000001';
const traveler = '00000000-0000-0000-0000-000000000002';
const other = '00000000-0000-0000-0000-000000000003';
const business = '10000000-0000-0000-0000-000000000001';
const guide = '10000000-0000-0000-0000-000000000002';
let checks = 0;
function checked() { checks++; }
async function denied(sql) {
  await assert.rejects(db.exec(sql), (e) => ['42501', '23514'].includes(e.code)); checked();
}
async function actor(id, role = 'authenticated') {
  await db.exec(`reset role; set role ${role}; set request.jwt.claim.sub='${id || ''}'`);
}
async function zeroRows(sql) { assert.equal((await db.query(sql)).rows.length, 0); checked(); }
async function update(sql, value) { const r = await db.query(sql); assert.equal(r.rows[0].fulfillment_status, value); checked(); }

try {
  await db.exec(`create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as 'select nullif(current_setting(''request.jwt.claim.sub'', true), '''')::uuid';
    grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
    create table public.tour_guides(id uuid primary key,user_id uuid,full_name text,bio text,category text,location text,city text,profile_photo text,price_per_trip numeric,languages text[],is_active boolean);
    grant select on public.tour_guides to anon, authenticated;
    insert into auth.users values ('${provider}'), ('${traveler}'), ('${other}');
    insert into tour_guides values ('${guide}','${provider}','Pemandu QA','Tur QA','Budaya','Bantul','Bantul','',250000,'{Indonesia}',true);`);
  await db.exec(await readFile('database/demo-payments.sql', 'utf8'));
  const ddl = await readFile('database/partner-dashboard.sql', 'utf8');
  await db.exec(ddl); await db.exec(ddl); checked();
  assert.equal((await db.query(`select owner_id from partner_listings where id='${guide}'`)).rows[0].owner_id, provider); checked();
  assert.equal((await db.query(`select managed_in_dashboard from tour_guides where id='${guide}'`)).rows[0].managed_in_dashboard, true); checked();
  await actor(provider);
  await db.exec(`insert into partner_listings(id,kind,title,location,price) values ('${business}','business','Kuliner QA','Bantul',100000)`); checked();
  await actor(null, 'anon');
  await zeroRows(`select * from partner_listings where id='${business}'`);
  await denied('select * from demo_orders');
  await denied(`insert into partner_listings(kind,title,location,price) values ('business','Anon QA','Bantul',1)`);
  await actor(provider);
  await denied(`insert into partner_listings(owner_id,kind,title,location,price) values ('${other}','business','Spoof QA','Bantul',1)`);
  await db.exec(`update partner_listings set published=true where id='${business}'`);
  await db.exec(`insert into partner_availability(listing_id,available_date,capacity) values ('${business}',current_date+2,1)`); checked();
  await actor(null, 'anon');
  assert.equal((await db.query(`select * from partner_listings where id='${business}'`)).rows.length, 1); checked();
  assert.equal((await db.query(`select * from partner_availability where listing_id='${business}'`)).rows.length, 1); checked();
  await actor(other);
  await zeroRows(`update partner_listings set price=1 where id='${business}' returning id`);
  await denied(`insert into partner_availability(listing_id,available_date) values ('${business}',current_date+3)`);
  await actor(provider);
  await denied(`update partner_listings set owner_id='${other}' where id='${business}'`);
  await actor(traveler);
  const rowData = `jsonb_build_object('type','business','title','Kuliner QA','date',(current_date+2)::text,'guestsCount',1,'duration_days',1)`;
  const insert = (id, amount = 102500, owner = provider, listing = business, data = rowData) => `insert into demo_orders(id,user_id,order_data,amount,payment_method,listing_id,provider_id) values ('${id}','${traveler}',${data},${amount},'qris','${listing}','${owner}')`;
  await denied(insert('spoof-provider', 102500, other));
  await denied(insert('spoof-price', 1));
  await denied(insert('closed-day', 102500, provider, business, `jsonb_build_object('type','business','date',(current_date+3)::text,'guestsCount',1)`));
  await denied(insert('too-many', 205000, provider, business, `jsonb_build_object('type','business','date',(current_date+2)::text,'guestsCount',2)`));
  await denied(insert('spoof-kind', 102500, provider, business, `jsonb_build_object('type','guide','date',(current_date+2)::text,'guestsCount',1)`));
  await denied(insert('past-date', 102500, provider, business, `jsonb_build_object('type','business','date',(current_date-1)::text,'guestsCount',1)`));
  await denied(`insert into demo_orders(id,user_id,order_data,amount,payment_method,provider_id) values ('legacy-bypass','${traveler}',jsonb_build_object('type','guide','guideId','${guide}','date',(current_date+2)::text),250000,'qris','${provider}')`);
  await db.exec(insert('order-1')); await db.exec(insert('order-2')); checked();
  await denied(`update demo_orders set fulfillment_status='confirmed' where id='order-1'`);
  await actor(provider);
  await zeroRows(`update demo_orders set fulfillment_status='confirmed' where id='order-1' returning id`);
  await actor(traveler);
  await db.exec(`update demo_orders set payment_status='succeeded' where id in ('order-1','order-2')`); checked();
  await actor(other);
  await zeroRows('select * from demo_orders');
  await zeroRows(`update demo_orders set fulfillment_status='confirmed' where id='order-1' returning id`);
  await actor(provider);
  assert.equal((await db.query('select * from demo_orders')).rows.length, 2); checked();
  await denied(`update demo_orders set payment_status='failed' where id='order-1'`);
  await denied(`update demo_orders set amount=1 where id='order-1'`);
  await denied(`update demo_orders set user_id='${other}' where id='order-1'`);
  await update(`update demo_orders set fulfillment_status='confirmed' where id='order-1' returning fulfillment_status`, 'confirmed');
  await denied(`update demo_orders set fulfillment_status='confirmed' where id='order-2'`);
  await update(`update demo_orders set fulfillment_status='cancelled' where id='order-1' returning fulfillment_status`, 'cancelled');
  await update(`update demo_orders set fulfillment_status='confirmed' where id='order-2' returning fulfillment_status`, 'confirmed');
  await update(`update demo_orders set fulfillment_status='completed' where id='order-2' returning fulfillment_status`, 'completed');
  await zeroRows(`update demo_orders set fulfillment_status='cancelled' where id='order-2' returning id`);
  await actor(traveler);
  assert.equal((await db.query(`select fulfillment_status from demo_orders where id='order-2'`)).rows[0].fulfillment_status, 'completed'); checked();
  await zeroRows(`update demo_orders set fulfillment_status='confirmed' where id='order-2' returning id`);
  // Every day in a guide trip must be available, and overlapping trips consume capacity.
  await actor(provider);
  await db.exec(`insert into partner_availability(listing_id,available_date,capacity) values ('${guide}',current_date+4,1)`);
  await actor(traveler);
  const guideData = `jsonb_build_object('type','guide','title','Pemandu QA','date',(current_date+4)::text,'guestsCount',1,'duration_days',2)`;
  await denied(insert('missing-second-day', 250000, provider, guide, guideData));
  await actor(provider);
  await db.exec(`insert into partner_availability(listing_id,available_date,capacity) values ('${guide}',current_date+5,1)`);
  await actor(traveler);
  await db.exec(insert('guide-two-days', 250000, provider, guide, guideData)); checked();
  await db.exec(insert('guide-overlap', 250000, provider, guide, `jsonb_build_object('type','guide','date',(current_date+5)::text,'guestsCount',1,'duration_days',1)`));
  await db.exec(`update demo_orders set payment_status='succeeded' where id in ('guide-two-days','guide-overlap')`);
  await actor(provider);
  await update(`update demo_orders set fulfillment_status='confirmed' where id='guide-two-days' returning fulfillment_status`, 'confirmed');
  await denied(`update demo_orders set fulfillment_status='confirmed' where id='guide-overlap'`);
  await update(`update demo_orders set fulfillment_status='cancelled' where id='guide-two-days' returning fulfillment_status`, 'cancelled');
  await update(`update demo_orders set fulfillment_status='confirmed' where id='guide-overlap' returning fulfillment_status`, 'confirmed');
  await actor(provider);
  await db.exec(`update partner_listings set archived=true,published=false where id='${business}'`);
  await actor(null,'anon');
  await zeroRows(`select * from partner_listings where id='${business}'`);
  await zeroRows(`select * from partner_availability where listing_id='${business}'`);
  console.log(`Partner PostgreSQL/RLS: ${checks} checks passed.`);
} finally { await db.close(); }

import test from 'node:test';
import assert from 'node:assert/strict';
import { getAccountRole, getPartnerStats, validateListing, validateFulfillment, listingToCatalog } from '../src/utils/partner.js';
import { createPartnerService } from '../src/service/createPartnerService.js';
import { normalizeDemoOrder } from '../src/utils/demoPayment.js';
import { calculateBookingCosts } from '../src/utils/pricing.js';

test('partner registration roles resolve to the correct dashboard', () => {
  assert.equal(getAccountRole({ user_metadata: { role: 'pemilik_bisnis' } }), 'local_business');
  assert.equal(getAccountRole({ user_metadata: { role: 'pemandu' } }), 'local_guide');
  assert.equal(getAccountRole({ app_metadata: { role: 'wisatawan' }, user_metadata: { role: 'pemandu' } }), 'wisatawan');
});

test('a listing cannot sneak ownership or verification into editable fields', () => {
  const fields = validateListing({ title: 'Layanan baru', location: 'Bantul', price: 100000, owner_id: 'victim', verified: true, languages: 'Indonesia, Inggris' });
  assert.equal(fields.owner_id, undefined);
  assert.equal(fields.verified, undefined);
  assert.deepEqual(fields.languages, ['Indonesia', 'Inggris']);
  assert.throws(() => validateListing({ title: 'OK', location: '', price: '' }));
  assert.throws(() => validateListing({ title: 'Layanan', location: 'Bantul', price: 0 }));
  assert.throws(() => validateListing({ title: 'Layanan', location: 'Bantul', price: 100, image_url: 'javascript:alert(1)' }));
});

test('dashboard totals count only completed successful simulations', () => {
  const orders = [
    { payment_status: 'succeeded', fulfillment_status: 'pending', amount: 10 },
    { payment_status: 'succeeded', fulfillment_status: 'confirmed', amount: 20 },
    { payment_status: 'succeeded', fulfillment_status: 'completed', amount: 30 },
    { payment_status: 'failed', fulfillment_status: 'completed', amount: 400 },
    { payment_status: 'succeeded', fulfillment_status: 'cancelled', amount: 500 },
  ];
  assert.deepEqual(getPartnerStats([{ published: true, archived: false }, { published: false }], orders), { published: 1, waiting: 1, confirmed: 1, completed: 1, simulationTotal: 30 });
});

test('unpaid or terminal reservations cannot be confirmed by the service', () => {
  assert.throws(() => validateFulfillment({ payment_status: 'pending', fulfillment_status: 'pending' }, 'confirmed'), /belum berhasil/);
  assert.throws(() => validateFulfillment({ payment_status: 'succeeded', fulfillment_status: 'completed' }, 'confirmed'), /tidak valid/);
  assert.doesNotThrow(() => validateFulfillment({ payment_status: 'succeeded', fulfillment_status: 'pending' }, 'confirmed'));
});

test('catalog conversion preserves provider identity, per-trip price and no invented verification', () => {
  const catalog = listingToCatalog({ id: 'listing', owner_id: 'provider', kind: 'guide', title: 'Tur Budaya', price: 250000, published: true, category: 'Budaya' });
  assert.equal(catalog.listingId, 'listing');
  assert.equal(catalog.providerId, 'provider');
  assert.equal(catalog.is_verified, false);
  assert.equal(catalog.price_per_trip, 250000);
  assert.equal(calculateBookingCosts({ type: 'guide', price: 250000 }).totalAmount, 250000);
});

test('traveler history reflects provider confirmation, completion and cancellation after reload', () => {
  const row = { id: 'order', user_id: 'traveler', provider_id: 'provider', order_data: { type: 'business', title: 'Kuliner' }, payment_method: 'qris', payment_status: 'succeeded', amount: 100 };
  assert.equal(normalizeDemoOrder(row).status, 'Menunggu konfirmasi bisnis');
  assert.equal(normalizeDemoOrder({ ...row, fulfillment_status: 'confirmed' }).status, 'Dikonfirmasi');
  assert.equal(normalizeDemoOrder({ ...row, fulfillment_status: 'completed' }).status, 'Selesai');
  assert.equal(normalizeDemoOrder({ ...row, fulfillment_status: 'cancelled' }).status, 'Dibatalkan');
});

test('account switches are rejected before any partner mutation', async () => {
  let writes = 0;
  const service = createPartnerService({
    auth: { getUser: async () => ({ data: { user: { id: 'user-b' } } }) },
    from: () => { writes++; throw new Error('Should not write'); },
  });
  await assert.rejects(service.saveListing('user-a', 'guide', {}), /Akun berubah/);
  await assert.rejects(service.updateReservation('user-a', {}, 'confirmed'), /Akun berubah/);
  assert.equal(writes, 0);
});

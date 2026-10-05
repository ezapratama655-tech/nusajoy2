import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoPaymentService } from '../src/service/createDemoPaymentService.js';
import { mergeRemoteOrders } from '../src/utils/demoPayment.js';

// Emulate response loss and simultaneous browser requests; policy checks are tested in SQL separately.
function fakeClient(owner = 'user-a') {
  const records = new Map();
  const client = {
    owner, records, nextInsertError: null, loseResponse: false,
    auth: {
      getSession: async () => ({ data: { session: client.owner === 'guest' ? null : {} }, error: null }),
      getUser: async () => ({ data: { user: { id: client.owner } }, error: null }),
    },
    from: () => {
      let operation = 'select';
      let payload;
      const filters = [];
      const query = {
        insert(row) { operation = 'insert'; payload = row; return query; },
        update(row) { operation = 'update'; payload = row; return query; },
        select() { return query; },
        eq(key, value) { filters.push([key, value]); return query; },
        order() { return query; },
        async single() {
          if (operation === 'insert') {
            if (client.nextInsertError) return { error: client.nextInsertError };
            if (records.has(payload.id)) return { error: { code: '23505' } };
            records.set(payload.id, { ...payload });
            if (client.loseResponse) { client.loseResponse = false; throw new Error('Network response lost'); }
            return { data: { ...payload } };
          }
          const row = [...records.values()].find((item) => filters.every(([key, value]) => item[key] === value));
          if (!row) return { error: { code: 'PGRST116' } };
          if (operation === 'update') Object.assign(row, payload);
          return { data: { ...row } };
        },
      };
      return query;
    },
  };
  return client;
}

const input = { id: 'demo-1', type: 'guide', title: 'Pemandu', totalAmount: 250000, paymentMethodKey: 'va', bookingData: { unnecessary: true } };

test('guest simulation supports failure, retry and success without a database write', async () => {
  const client = fakeClient('guest');
  const service = createDemoPaymentService(client);
  let order = await service.createOrder(input);
  assert.equal(order.status, 'Menunggu pembayaran');
  assert.equal(order.paymentMethodKey, 'va');
  assert.equal(order.isDemo, true);
  assert.equal(order.owner, 'guest');
  order = await service.updatePayment(order, 'failed');
  assert.equal(order.status, 'Pembayaran gagal');
  order = await service.updatePayment(order, 'pending');
  order = await service.updatePayment(order, 'succeeded');
  assert.equal(order.status, 'Menunggu konfirmasi pemandu');
  assert.equal(client.records.size, 0);
  await assert.rejects(service.updatePayment(order, 'failed'), /sudah berhasil/);
});

test('signed-in simulation persists the snapshot and returns database status', async () => {
  const client = fakeClient();
  const service = createDemoPaymentService(client);
  const pending = await service.createOrder(input);
  assert.equal(client.records.get(input.id).is_simulation, true);
  assert.equal(pending.bookingData, undefined);
  const paid = await service.updatePayment(pending, 'succeeded');
  assert.equal(client.records.get(input.id).payment_status, 'succeeded');
  assert.equal(paid.totalPrice, 250000);
});

test('retry after a lost insert response does not create a second order', async () => {
  const client = fakeClient();
  const service = createDemoPaymentService(client);
  client.loseResponse = true;
  await assert.rejects(service.createOrder(input), /Network/);
  const retried = await service.createOrder({ ...input, totalAmount: 1 });
  assert.equal(client.records.size, 1);
  assert.equal(retried.totalAmount, input.totalAmount);
});

test('concurrent payment results cannot overwrite the first saved result', async () => {
  const client = fakeClient();
  const service = createDemoPaymentService(client);
  const pending = await service.createOrder(input);
  const results = await Promise.allSettled([
    service.updatePayment(pending, 'succeeded'), service.updatePayment(pending, 'failed'),
  ]);
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
  assert.equal(client.records.get(input.id).payment_status, 'succeeded');
});

test('account changes, non-demo orders and invalid statuses are rejected', async () => {
  const client = fakeClient();
  const service = createDemoPaymentService(client);
  const order = await service.createOrder(input);
  client.owner = 'user-b';
  await assert.rejects(service.updatePayment(order, 'succeeded'), /Akun berubah/);
  await assert.rejects(service.updatePayment({ ...order, isDemo: false }, 'succeeded'), /bukan simulasi/);
  await assert.rejects(service.updatePayment(order, 'paid'), /tidak valid/);
  assert.equal(client.records.get(input.id).payment_status, 'pending');
});

test('missing SQL never silently reports that an authenticated order was saved', async () => {
  const client = fakeClient();
  client.nextInsertError = { code: 'PGRST205' };
  await assert.rejects(createDemoPaymentService(client).createOrder(input), /demo-payments.sql/);
  assert.equal(client.records.size, 0);
});

test('reload replaces a stale local payment with the persisted result without duplicates', () => {
  const local = [{ id: 'same', paymentStatus: 'pending', isDemo: true }, { id: 'legacy' }];
  const remote = [{ id: 'same', paymentStatus: 'succeeded', isDemo: true }];
  assert.deepEqual(mergeRemoteOrders(local, remote), [remote[0], local[1]]);
});

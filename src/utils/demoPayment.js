export const DEMO_PAYMENT_STATUSES = ['pending', 'succeeded', 'failed'];

export function getDemoOrderStatus(paymentStatus, fulfillmentStatus = 'pending', type = 'guide') {
  if (fulfillmentStatus === 'cancelled') return 'Dibatalkan';
  if (fulfillmentStatus === 'completed') return 'Selesai';
  if (fulfillmentStatus === 'confirmed') return 'Dikonfirmasi';
  if (paymentStatus === 'succeeded') return type === 'business' ? 'Menunggu konfirmasi bisnis' : 'Menunggu konfirmasi pemandu';
  if (paymentStatus === 'failed') return 'Pembayaran gagal';
  return 'Menunggu pembayaran';
}

export function normalizeDemoOrder(row) {
  return {
    ...row.order_data,
    id: row.id,
    owner: row.user_id,
    isDemo: true,
    demoPayment: true,
    paymentStatus: row.payment_status,
    fulfillmentStatus: row.fulfillment_status || 'pending',
    providerId: row.provider_id,
    listingId: row.listing_id,
    paymentMethodKey: row.payment_method,
    paymentMethod: row.payment_method === 'va' ? 'Virtual Account (simulasi)' : 'QRIS (simulasi)',
    totalAmount: Number(row.amount),
    totalPrice: Number(row.amount),
    status: getDemoOrderStatus(row.payment_status, row.fulfillment_status, row.order_data?.type),
    createdAt: row.created_at,
  };
}

export function assertDemoPaymentTransition(order, nextStatus) {
  if (!order?.demoPayment || !order.isDemo) throw new Error('Pesanan ini bukan simulasi pembayaran.');
  if (!DEMO_PAYMENT_STATUSES.includes(nextStatus)) throw new Error('Status pembayaran tidak valid.');
  if (order.paymentStatus === 'succeeded') throw new Error('Simulasi pembayaran sudah berhasil.');
  if (nextStatus === order.paymentStatus) throw new Error('Status pembayaran tidak berubah.');
}

export function mergeRemoteOrders(local, remote) {
  const ids = new Set(remote.map((order) => order.id));
  return [...remote, ...local.filter((order) => !ids.has(order.id))];
}

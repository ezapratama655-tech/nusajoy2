import { assertDemoPaymentTransition, getDemoOrderStatus, normalizeDemoOrder } from '../utils/demoPayment.js';

function paymentError(error) {
  if (error?.code === '42501') return new Error('Pesanan belum dapat disimpan. Pastikan login, tarif, dan jadwal layanan masih berlaku; lalu muat ulang halaman.');
  if (['PGRST204', '42703'].includes(error?.code)) return new Error('Pemesanan mitra belum aktif. Jalankan database/partner-dashboard.sql di Supabase.');
  if (error?.code === 'PGRST205') {
    return new Error('Penyimpanan simulasi belum aktif. Jalankan database/demo-payments.sql di Supabase terlebih dahulu.');
  }
  return error;
}

// The injectable client also lets us test failures and retries without a merchant account.
export function createDemoPaymentService(client) {
  async function getOwner() {
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    if (!data.session) return 'guest';
    const result = await client.auth.getUser();
    if (result.error || !result.data.user) throw result.error || new Error('Silakan masuk kembali.');
    return result.data.user.id;
  }

  async function createOrder(order) {
    const owner = await getOwner();
    const amount = Number(order.totalAmount ?? order.totalPrice);
    if (!order.id || !Number.isFinite(amount) || amount < 0) throw new Error('Data pesanan tidak valid.');
    if (order.listingId && owner === 'guest') throw new Error('Login terlebih dahulu agar pesanan diterima oleh pemilik layanan.');
    const row = {
      id: String(order.id), user_id: owner, amount,
      payment_status: 'pending',
      payment_method: order.paymentMethodKey === 'va' ? 'va' : 'qris',
      is_simulation: true, created_at: new Date().toISOString(),
      // Store only order fields, without the full source catalog/trip object.
      order_data: Object.fromEntries([
        'type', 'title', 'location', 'image', 'date', 'guests', 'guestsCount',
        'unitPrice', 'baseCost', 'conservationFund', 'serviceFee', 'guideName',
        'guidePhone', 'meetingPoint', 'meetingTime', 'customerName', 'customerPhone',
        'customerNotes', 'duration_days', 'guideId',
      ].filter((key) => order[key] !== undefined).map((key) => [key, order[key]])),
    };
    if (order.listingId || order.providerId) {
      row.listing_id = order.listingId || null;
      row.provider_id = order.providerId || null;
    }
    if (owner === 'guest') return normalizeDemoOrder(row);
    const { data, error } = await client.from('demo_orders').insert(row).select().single();
    if (error?.code === '23505') {
      // A retry after a lost response must return the original order, not create another.
      const existing = await client.from('demo_orders').select('*').eq('user_id', owner).eq('id', row.id).single();
      if (existing.error) throw paymentError(existing.error);
      return normalizeDemoOrder(existing.data);
    }
    if (error) throw paymentError(error);
    return normalizeDemoOrder(data);
  }

  async function updatePayment(order, nextStatus) {
    assertDemoPaymentTransition(order, nextStatus);
    const owner = await getOwner();
    if (order.owner !== owner) throw new Error('Akun berubah. Buka ulang pesanan dari akun pemiliknya.');
    if (owner === 'guest') return { ...order, paymentStatus: nextStatus, status: getDemoOrderStatus(nextStatus, order.fulfillmentStatus, order.type) };
    const { data, error } = await client.from('demo_orders')
      .update({ payment_status: nextStatus })
      .eq('user_id', owner).eq('id', order.id).eq('payment_status', order.paymentStatus)
      .select().single();
    if (error?.code === 'PGRST116') throw new Error('Status pesanan telah berubah. Muat ulang halaman.');
    if (error) throw paymentError(error);
    return normalizeDemoOrder(data);
  }

  async function getOrders(owner) {
    const { data, error } = await client.from('demo_orders').select('*')
      .eq('user_id', owner).order('created_at', { ascending: false });
    if (error?.code === 'PGRST205') return [];
    if (error) throw paymentError(error);
    return (data || []).map(normalizeDemoOrder);
  }

  return { createOrder, updatePayment, getOrders };
}

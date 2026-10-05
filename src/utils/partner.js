export function getAccountRole(user) {
  const raw = user?.app_metadata?.role || user?.user_metadata?.role || user?.user_metadata?.user_role || user?.user_metadata?.account_type;
  const role = String(raw || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (['local_guide', 'guide', 'pemandu', 'pemandu_lokal', 'tour_guide'].includes(role)) return 'local_guide';
  if (['local_business', 'business', 'bisnis', 'bisnis_lokal', 'umkm', 'pemilik_bisnis'].includes(role)) return 'local_business';
  return 'wisatawan';
}

export const FULFILLMENT_LABELS = { pending: 'Menunggu konfirmasi', confirmed: 'Dikonfirmasi', cancelled: 'Dibatalkan', completed: 'Selesai' };
export const EMPTY_LISTING = { title: '', description: '', category: 'Budaya', location: '', address: '', image_url: '', price: '', phone: '', opening_hours: '', languages: 'Indonesia', published: false };

export function validateListing(input) {
  const row = {
    title: String(input.title || '').trim(), description: String(input.description || '').trim(),
    category: String(input.category || '').trim(), location: String(input.location || '').trim(),
    address: String(input.address || '').trim(), image_url: String(input.image_url || '').trim(),
    price: Number(input.price), phone: String(input.phone || '').trim(), opening_hours: String(input.opening_hours || '').trim(),
    languages: Array.isArray(input.languages) ? input.languages : String(input.languages || '').split(',').map((s) => s.trim()).filter(Boolean),
    published: Boolean(input.published),
  };
  if (row.title.length < 3 || row.title.length > 150) throw new Error('Nama layanan harus 3–150 karakter.');
  if (!row.location || row.location.length > 250) throw new Error('Isi lokasi layanan, maksimal 250 karakter.');
  if (input.price === '' || !Number.isFinite(row.price) || row.price <= 0 || row.price >= 1e10) throw new Error('Tarif harus lebih dari nol dan kurang dari Rp10 miliar.');
  if (row.description.length > 3000) throw new Error('Deskripsi maksimal 3.000 karakter.');
  if (row.image_url && !/^https:\/\//i.test(row.image_url)) throw new Error('URL foto harus menggunakan HTTPS.');
  if (row.phone && !/^\+?[\d\s()-]{9,25}$/.test(row.phone)) throw new Error('Nomor kontak belum valid.');
  return row;
}

export function getPartnerStats(listings, orders) {
  const paid = orders.filter((o) => o.payment_status === 'succeeded');
  return {
    published: listings.filter((s) => s.published && !s.archived).length,
    waiting: paid.filter((o) => o.fulfillment_status === 'pending').length,
    confirmed: paid.filter((o) => o.fulfillment_status === 'confirmed').length,
    completed: paid.filter((o) => o.fulfillment_status === 'completed').length,
    simulationTotal: paid.filter((o) => o.fulfillment_status === 'completed').reduce((sum, o) => sum + Number(o.amount || 0), 0),
  };
}

export function validateFulfillment(order, next) {
  if (order.payment_status !== 'succeeded') throw new Error('Pembayaran simulasi belum berhasil.');
  const allowed = { pending: ['confirmed', 'cancelled'], confirmed: ['completed', 'cancelled'] };
  if (!allowed[order.fulfillment_status]?.includes(next)) throw new Error('Perubahan status reservasi tidak valid.');
}

export function listingToCatalog(row) {
  return {
    ...row, listingId: row.id, providerId: row.owner_id, type: row.kind === 'guide' ? 'guide' : 'business',
    full_name: row.title, name: row.title, bio: row.description, city: row.location,
    profile_photo: row.image_url, price_per_trip: row.kind === 'guide' ? Number(row.price) : undefined,
    price_range: `Rp${Number(row.price).toLocaleString('id-ID')} / peserta`,
    status: 'online', is_active: row.published, specialties: [row.category], verified: false, is_verified: false,
    priceUnit: row.kind === 'guide' ? 'trip' : 'person',
  };
}

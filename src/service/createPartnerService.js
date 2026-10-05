import { validateListing, validateFulfillment } from '../utils/partner.js';

export function partnerError(error) {
  if (['PGRST205', 'PGRST204', '42703'].includes(error?.code)) return new Error('Dashboard belum diaktifkan. Jalankan database/partner-dashboard.sql di Supabase.');
  if (error?.code === 'PGRST116') return new Error('Data berubah atau tidak dapat diakses. Muat ulang dashboard.');
  return error;
}

export function createPartnerService(client) {
  async function currentOwner(expected) {
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) throw new Error('Silakan login untuk mengelola dashboard.');
    if (expected && expected !== data.user.id) throw new Error('Akun berubah. Muat ulang dashboard.');
    return data.user.id;
  }
  async function result(query) {
    const { data, error } = await query;
    if (error) throw partnerError(error);
    return data;
  }
  async function load(owner, kind) {
    await currentOwner(owner);
    const [listings, reservations] = await Promise.all([
      result(client.from('partner_listings').select('*').eq('owner_id', owner).eq('kind', kind).order('created_at', { ascending: false })),
      result(client.from('demo_orders').select('*').eq('provider_id', owner).order('created_at', { ascending: false })),
    ]);
    const ids = listings.map((s) => s.id);
    const availability = ids.length ? await result(client.from('partner_availability').select('*').in('listing_id', ids).order('available_date')) : [];
    return { listings, reservations: reservations.filter((order) => order.order_data?.type === kind), availability };
  }
  async function saveListing(owner, kind, input, id) {
    await currentOwner(owner);
    if (!['guide', 'business'].includes(kind)) throw new Error('Jenis layanan tidak valid.');
    const fields = validateListing(input);
    const query = id ? client.from('partner_listings').update(fields).eq('owner_id', owner).eq('id', id).eq('kind', kind)
      : client.from('partner_listings').insert({ ...fields, id: input.id || crypto.randomUUID(), owner_id: owner, kind });
    return result(query.select().single());
  }
  async function archiveListing(owner, listing, archived) {
    await currentOwner(owner);
    return result(client.from('partner_listings').update({ archived, published: false }).eq('owner_id', owner).eq('id', listing.id).select().single());
  }
  async function saveAvailability(owner, input) {
    await currentOwner(owner);
    const listing = await result(client.from('partner_listings').select('owner_id').eq('id', input.listing_id).eq('owner_id', owner).single());
    if (!listing) throw new Error('Layanan tidak ditemukan.');
    const capacity = Number(input.capacity);
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 100) throw new Error('Kapasitas harus 1–100 peserta/pemesanan.');
    if (!input.available_date || !input.start_time || !input.end_time || input.start_time >= input.end_time) throw new Error('Tanggal dan rentang jam belum valid.');
    const row = { listing_id: input.listing_id, available_date: input.available_date, start_time: input.start_time, end_time: input.end_time, capacity, is_available: Boolean(input.is_available) };
    return result(client.from('partner_availability').upsert(row, { onConflict: 'listing_id,available_date' }).select().single());
  }
  async function updateReservation(owner, order, next) {
    await currentOwner(owner);
    if (order.provider_id !== owner) throw new Error('Reservasi bukan milik layanan kamu.');
    validateFulfillment(order, next);
    return result(client.from('demo_orders').update({ fulfillment_status: next }).eq('provider_id', owner)
      .eq('id', order.id).eq('user_id', order.user_id).eq('fulfillment_status', order.fulfillment_status).select().single());
  }
  return { load, saveListing, archiveListing, saveAvailability, updateReservation };
}

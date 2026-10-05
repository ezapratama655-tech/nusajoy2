import { supabase } from '../utils/supabaseClient.js';

export function normalizeBooking(row) {
  return {
    ...row,
    type: 'guide',
    title: row.tour_guides?.full_name || 'Pemandu wisata',
    guideName: row.tour_guides?.full_name || '',
    location: row.tour_guides?.location || '',
    image: row.tour_guides?.profile_photo || '',
    date: row.booking_date,
    totalAmount: row.total_price,
    totalPrice: row.total_price,
    status: row.status === 'pending' ? 'Menunggu konfirmasi' : row.status,
  };
}

export async function getUserBookings(userId) {
  const { data, error } = await supabase.from('bookings')
    .select('*,tour_guides(full_name,location,profile_photo)')
    .eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(normalizeBooking);
}

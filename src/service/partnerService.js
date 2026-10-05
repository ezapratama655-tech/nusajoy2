import { supabase } from '../utils/supabaseClient.js';
import { createPartnerService } from './createPartnerService.js';
import { listingToCatalog } from '../utils/partner.js';

export const partnerService = createPartnerService(supabase);

export async function getPublishedListings(kind) {
  const { data, error } = await supabase.from('partner_listings').select('*').eq('kind', kind).eq('published', true).eq('archived', false);
  if (error?.code === 'PGRST205') return [];
  if (error) throw error;
  return (data || []).map(listingToCatalog);
}

export async function getPublishedListing(id) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id))) return null;
  const { data, error } = await supabase.from('partner_listings').select('*').eq('id', id).eq('published', true).eq('archived', false).maybeSingle();
  if (error?.code === 'PGRST205') return null;
  if (error) throw error;
  return data ? listingToCatalog(data) : null;
}

export async function getListingAvailability(id) {
  const { data, error } = await supabase.from('partner_availability').select('*').eq('listing_id', id).order('available_date');
  if (error?.code === 'PGRST205') return [];
  if (error) throw error;
  return data || [];
}

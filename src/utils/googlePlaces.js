import { supabase } from './supabaseClient'

export async function fetchPlaceData(destination) {
  try {
    const { data, error } = await supabase.functions.invoke('google-place-photo', {
      body: {
        destinationId: destination.id,
        placeName: destination.name,
        location: destination.location,
      },
    })

    if (error) {
      console.error('Edge Function Error:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Gagal mengambil data tempat dari Google:', err)
    return null
  }
}
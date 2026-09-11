import { supabase } from '../utils/supabaseClient'

/* =========================================================
   NUSAJOY DESTINATION SERVICE
========================================================= */

const BASE_QUERY = `
  id,
  slug,
  name,
  location,
  region,
  province,
  city_regency,
  category,
  is_hidden_gem,
  description,
  short_description,
  activities,
  tags,
  price,
  duration,
  rating,
  review_count,
  hidden_gem_score,
  eco_score,
  difficulty,
  crowd_level,
  best_time,
  travel_tips,
  safety_notes,
  access_info,
  facilities,
  opening_hours,
  ticket_info,
  local_experience,
  local_business_hint,
  latitude,
  longitude,
  image_url,
  gallery,
  source_url,
  last_verified,
  status
`

/* =========================================================
   GET DESTINATIONS
========================================================= */

export async function getDestinations(filters = {}) {
  const {
    search = '',
    region = 'Semua Wilayah',
    category = 'Semua',
    hiddenOnly = false,
    maxPrice = null,
    maxDuration = null,
    limit = 100,
  } = filters

  let query = supabase
    .from('destinations')
    .select(BASE_QUERY)
    .eq('status', 'published')

  /*
    SERVER SEARCH

    Search database berdasarkan field utama.
    Filtering tambahan akan dilakukan di Explore.jsx
    agar activities, tags, region, dan field lain
    tetap bisa dicari secara fleksibel.
  */

  if (search.trim()) {
    const keyword = search
      .trim()
      .replace(/[%_,]/g, '')

    query = query.or(
      `
        name.ilike.%${keyword}%,
        location.ilike.%${keyword}%,
        province.ilike.%${keyword}%,
        city_regency.ilike.%${keyword}%,
        region.ilike.%${keyword}%,
        category.ilike.%${keyword}%
      `
    )
  }

  /*
    REGION
  */

  if (
    region &&
    region !== 'Semua Wilayah'
  ) {
    query = query.eq(
      'region',
      region
    )
  }

  /*
    CATEGORY
  */

  if (
    category &&
    category !== 'Semua' &&
    category !== 'Semua Kategori'
  ) {
    query = query.eq(
      'category',
      category
    )
  }

  /*
    HIDDEN GEM
  */

  if (hiddenOnly) {
    query = query.eq(
      'is_hidden_gem',
      true
    )
  }

  /*
    PRICE
  */

  if (
    maxPrice !== null &&
    maxPrice !== undefined &&
    Number.isFinite(
      Number(maxPrice)
    )
  ) {
    query = query.lte(
      'price',
      Number(maxPrice)
    )
  }

  /*
    DURATION
  */

  if (
    maxDuration !== null &&
    maxDuration !== undefined &&
    Number.isFinite(
      Number(maxDuration)
    )
  ) {
    query = query.lte(
      'duration',
      Number(maxDuration)
    )
  }

  const { data, error } =
    await query
      .order(
        'hidden_gem_score',
        {
          ascending: false,
          nullsFirst: false,
        }
      )
      .order(
        'rating',
        {
          ascending: false,
          nullsFirst: false,
        }
      )
      .limit(limit)

  if (error) {
    throw error
  }

  return Array.isArray(data)
    ? data
    : []
}

/* =========================================================
   GET DESTINATION BY SLUG
========================================================= */

export async function getDestinationBySlug(
  slug
) {
  const {
    data,
    error,
  } = await supabase
    .from('destinations')
    .select(BASE_QUERY)
    .eq(
      'slug',
      slug
    )
    .eq(
      'status',
      'published'
    )
    .single()

  if (error) {
    throw error
  }

  return data
}

/* =========================================================
   FORMAT RUPIAH
========================================================= */

export function formatRupiah(value) {
  const amount =
    Number(value) || 0

  return `Rp${amount.toLocaleString(
    'id-ID'
  )}`
}

/* =========================================================
   FORMAT DURATION
========================================================= */

export function formatDuration(value) {
  const hours =
    Number(value)

  if (
    !Number.isFinite(hours) ||
    hours <= 0
  ) {
    return 'Fleksibel'
  }

  if (hours < 1) {
    const minutes =
      Math.round(
        hours * 60
      )

    return `${minutes} menit`
  }

  if (hours === 24) {
    return '1 hari'
  }

  if (hours > 24) {
    const days =
      Math.round(
        hours / 24
      )

    return `${days} hari`
  }

  return `${hours} jam`
}

/* =========================================================
   GET DESTINATION IMAGE

   Priority:

   1. image_url
   2. gallery[0]
   3. null
========================================================= */

export function getDestinationImage(
  destination
) {
  if (
    destination?.image_url
  ) {
    return destination.image_url
  }

  if (
    Array.isArray(
      destination?.gallery
    ) &&
    destination.gallery.length > 0
  ) {
    return destination.gallery[0]
  }

  return null
}

/* =========================================================
   CATEGORY GRADIENT FALLBACK
========================================================= */

export function destinationImageStyle(
  destination
) {
  const category =
    String(
      destination?.category ||
        ''
    ).toLowerCase()

  if (
    category.includes(
      'air terjun'
    )
  ) {
    return `
      linear-gradient(
        135deg,
        #39c7c1,
        #17636a
      )
    `
  }

  if (
    category.includes(
      'pantai'
    ) ||
    category.includes(
      'bahari'
    ) ||
    category.includes(
      'pulau'
    )
  ) {
    return `
      linear-gradient(
        135deg,
        #42bfe6,
        #087c9c
      )
    `
  }

  if (
    category.includes(
      'gunung'
    ) ||
    category.includes(
      'bukit'
    ) ||
    category.includes(
      'hiking'
    )
  ) {
    return `
      linear-gradient(
        135deg,
        #91b957,
        #286447
      )
    `
  }

  if (
    category.includes(
      'danau'
    )
  ) {
    return `
      linear-gradient(
        135deg,
        #5fa4dc,
        #445a9e
      )
    `
  }

  if (
    category.includes(
      'budaya'
    )
  ) {
    return `
      linear-gradient(
        135deg,
        #dc8a52,
        #9d4537
      )
    `
  }

  return `
    linear-gradient(
      135deg,
      #e9ad54,
      #cf6b50
    )
  `
}
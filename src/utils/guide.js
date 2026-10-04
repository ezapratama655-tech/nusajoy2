/**
 * @file src/utils/guide.js
 * NuSaJoy — Tour Guide Utilities
 *
 * Fungsi:
 * - normalisasi data guide
 * - format harga
 * - mengambil avatar
 * - mengambil lokasi
 * - mengambil rating
 * - mengambil jumlah perjalanan
 * - menentukan status availability
 * - membuat item guide untuk My Trip
 */

export const FALLBACK_GUIDE_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80'

export const formatGuidePrice = (value = 0) => {
  const price = Number(value) || 0

  return `Rp${price.toLocaleString('id-ID')}`
}

export const getGuidePrice = (guide) => {
  return Number(
    guide?.price_per_day ??
      guide?.price ??
      guide?.daily_price ??
      guide?.pricePerDay ??
      0
  ) || 0
}

export const getGuideName = (guide) => {
  return (
    guide?.name ||
    guide?.full_name ||
    guide?.nama ||
    'Pemandu Wisata'
  )
}

export const getGuideAvatar = (guide) => {
  return (
    guide?.avatar ||
    guide?.photo ||
    guide?.image ||
    guide?.profile_photo ||
    FALLBACK_GUIDE_AVATAR
  )
}

export const getGuideCity = (guide) => {
  return (
    guide?.city ||
    guide?.location ||
    guide?.kota ||
    'Indonesia'
  )
}

export const getGuideRating = (guide) => {
  const value = Number(
    guide?.rating ??
      guide?.average_rating ??
      0
  )

  return Number.isFinite(value)
    ? value
    : 0
}

export const getGuideTrips = (guide) => {
  const value = Number(
    guide?.trips ??
      guide?.total_trips ??
      guide?.completed_trips ??
      guide?.tripsCount ??
      0
  )

  return Number.isFinite(value)
    ? value
    : 0
}

export const getGuideExperience = (guide) => {
  const value =
    guide?.experience ??
    guide?.experience_years ??
    guide?.years_experience ??
    null

  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null
  }

  const number = Number(value)

  return Number.isFinite(number)
    ? number
    : null
}

export const getGuideSpecialties = (guide) => {
  if (Array.isArray(guide?.specialties)) {
    return guide.specialties.filter(Boolean)
  }

  if (Array.isArray(guide?.categories)) {
    return guide.categories.filter(Boolean)
  }

  if (guide?.category) {
    return [guide.category]
  }

  return []
}

export const getGuideLanguages = (guide) => {
  if (Array.isArray(guide?.languages)) {
    return guide.languages.filter(Boolean)
  }

  if (typeof guide?.languages === 'string') {
    return guide.languages
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return ['Indonesia', 'English']
}

export const isGuideAvailable = (guide) => {
  const status = String(
    guide?.status || ''
  ).toLowerCase()

  return status !== 'offline'
}

export const normalizeGuide = (guide) => {
  if (!guide) {
    return null
  }

  return {
    ...guide,

    id: guide.id,

    name: getGuideName(guide),

    avatar: getGuideAvatar(guide),

    city: getGuideCity(guide),

    location:
      guide.location ||
      guide.city ||
      'Indonesia',

    rating: getGuideRating(guide),

    price_per_day: getGuidePrice(guide),

    trips: getGuideTrips(guide),

    experience:
      getGuideExperience(guide),

    specialties:
      getGuideSpecialties(guide),

    languages:
      getGuideLanguages(guide),

    category:
      guide.category ||
      guide.type ||
      'Budaya',

    status:
      guide.status ||
      'offline',

    verified: Boolean(
      guide.verified ??
        guide.is_verified ??
        false
    ),

    bio:
      guide.bio ||
      guide.description ||
      'Pemandu wisata lokal yang siap membantu kamu mengenal destinasi secara lebih autentik.',
  }
}

export const guideToTripItem = (guide) => {
  if (!guide) {
    return null
  }

  const normalized =
    normalizeGuide(guide)

  if (!normalized) {
    return null
  }

  return {
    id: `guide-${normalized.id}`,
    guideId: normalized.id,

    type: 'guide',
    entityType: 'guide',
    kind: 'guide',

    title:
      `Pendampingan bersama ${normalized.name}`,

    name: normalized.name,

    category:
      normalized.category ||
      'Pemandu Lokal',

    location:
      normalized.location ||
      normalized.city ||
      'Indonesia',

    price:
      normalized.price_per_day,

    pricePerDay:
      normalized.price_per_day,

    guideName:
      normalized.name,

    guide:
      normalized,

    image:
      normalized.avatar,

    avatar:
      normalized.avatar,

    rating:
      normalized.rating,

    verified:
      normalized.verified,

    status:
      normalized.status,

    description:
      normalized.bio,

    durationText:
      'Sesuai kebutuhan perjalanan',

    source:
      'tour-guide',

    isNew:
      true,
  }
}

export const isSameGuide = (
  first,
  second
) => {
  if (!first || !second) {
    return false
  }

  const firstId = String(
    first.guideId ??
      first.id ??
      ''
  )

  const secondId = String(
    second.guideId ??
      second.id ??
      ''
  )

  return (
    firstId !== '' &&
    firstId === secondId
  )
}

export const getGuideInitials = (
  guide
) => {
  const name = getGuideName(guide)
    .trim()
    .replace(/\s+/g, ' ')

  if (!name) {
    return 'PG'
  }

  const parts = name.split(' ')

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase()
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase()
}
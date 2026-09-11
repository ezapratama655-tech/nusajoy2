import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react'

import { supabase } from '../utils/supabaseClient'

// =====================================================
// CONSTANT
// =====================================================

const DEFAULT_LIMIT = 50

// =====================================================
// HELPERS
// =====================================================

const toNumber = (value, fallback = 0) => {
  const number = Number(value)

  return Number.isFinite(number)
    ? number
    : fallback
}

// -----------------------------------------------------
// Parse array dari Supabase
// Bisa menerima:
// - array
// - JSON string
// - comma separated string
// -----------------------------------------------------

const parseArray = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean)
  }

  if (typeof value !== 'string') {
    return []
  }

  const text = value.trim()

  if (!text) {
    return []
  }

  // Coba JSON
  try {
    const parsed = JSON.parse(text)

    if (Array.isArray(parsed)) {
      return parsed.filter(Boolean)
    }
  } catch {
    // Bukan JSON, lanjut comma separated
  }

  return text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

// -----------------------------------------------------
// Safe search
// -----------------------------------------------------

const sanitizeSearch = (value) => {
  return String(value || '')
    .replace(/[%_]/g, '')
    .replace(/[(),]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// -----------------------------------------------------
// Missing column helper
// -----------------------------------------------------

const isMissingColumnError = (error) => {
  if (!error) return false

  const code = error.code || ''

  const message = String(
    error.message || ''
  ).toLowerCase()

  return (
    code === '42703' ||
    (
      message.includes('column') &&
      message.includes('does not exist')
    )
  )
}

// -----------------------------------------------------
// Missing table helper
// -----------------------------------------------------

const isMissingTableError = (error) => {
  if (!error) return false

  const code = error.code || ''

  const message = String(
    error.message || ''
  ).toLowerCase()

  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    message.includes(
      'could not find the table'
    ) ||
    (
      message.includes('relation') &&
      message.includes('does not exist')
    )
  )
}

// =====================================================
// NORMALIZE GUIDE
// =====================================================

const normalizeGuide = (guide) => {
  if (!guide) return null

  const price = toNumber(
    guide.price_per_day ??
      guide.price ??
      guide.daily_price,
    0
  )

  const rating = toNumber(
    guide.rating ??
      guide.average_rating ??
      guide.avg_rating,
    0
  )

  const trips = toNumber(
    guide.trips ??
      guide.total_trips ??
      guide.completed_trips,
    0
  )

  const experience = toNumber(
    guide.experience_years ??
      guide.experience ??
      guide.years_experience,
    0
  )

  const status = String(
    guide.status || 'offline'
  ).toLowerCase()

  const avatar =
    guide.avatar ||
    guide.photo ||
    guide.image ||
    guide.profile_photo ||
    null

  const city =
    guide.city ||
    guide.location ||
    guide.region ||
    'Indonesia'

  const languages = parseArray(
    guide.languages
  )

  const specialties = parseArray(
    guide.specialties
  )

  const verified = Boolean(
    guide.verified ??
      guide.is_verified ??
      false
  )

  return {
    ...guide,

    // =================================================
    // BASIC
    // =================================================

    id: guide.id,

    name:
      guide.name ||
      guide.full_name ||
      'Pemandu Wisata',

    // =================================================
    // IMAGE
    // =================================================

    avatar,

    photo:
      guide.photo ||
      avatar,

    image:
      guide.image ||
      avatar,

    // =================================================
    // LOCATION
    // =================================================

    city,

    location:
      guide.location ||
      city,

    distance:
      guide.distance ??
      guide.distance_from_user ??
      null,

    // =================================================
    // RATING
    // =================================================

    rating,

    ratingText:
      rating > 0
        ? rating.toFixed(1)
        : 'Baru',

    // =================================================
    // PRICE
    // =================================================

    price_per_day: price,

    price,

    // =================================================
    // TRIPS
    // =================================================

    trips,

    total_trips: trips,

    // =================================================
    // EXPERIENCE
    // =================================================

    experience,

    experience_years: experience,

    // =================================================
    // LANGUAGE
    // =================================================

    languages,

    // =================================================
    // SPECIALTIES
    // =================================================

    specialties,

    // =================================================
    // STATUS
    // =================================================

    status,

    isOnline:
      status === 'online',

    isAvailable:
      status === 'online' ||
      status === 'available' ||
      status === 'active',

    // =================================================
    // VERIFIED
    // =================================================

    verified,

    verifiedLabel:
      verified
        ? 'Terverifikasi'
        : null,

    // =================================================
    // CATEGORY
    // =================================================

    category:
      guide.category ||
      guide.guide_category ||
      'Lainnya',

    // =================================================
    // BIO
    // =================================================

    bio:
      guide.bio ||
      guide.description ||
      'Pemandu lokal yang siap membantu perjalananmu.',
  }
}

// =====================================================
// HOOK
// =====================================================

export const useTourGuides = (
  filters = {}
) => {
  const [guides, setGuides] = useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState(null)

  const [refreshing, setRefreshing] =
    useState(false)

  const [count, setCount] =
    useState(0)

  // Mencegah request lama menimpa
  // request terbaru.
  const requestIdRef = useRef(0)

  // ===================================================
  // FILTER NORMALIZATION
  // ===================================================

  const category = useMemo(() => {
    const value =
      filters?.category

    return value &&
      String(value).trim()
      ? String(value).trim()
      : 'Semua'
  }, [filters?.category])

  const search = useMemo(() => {
    return sanitizeSearch(
      filters?.search
    )
  }, [filters?.search])

  const maxPrice = useMemo(() => {
    const value = Number(
      filters?.maxPrice
    )

    return Number.isFinite(value) &&
      value > 0
      ? value
      : null
  }, [filters?.maxPrice])

  const minPrice = useMemo(() => {
    const value = Number(
      filters?.minPrice
    )

    return Number.isFinite(value) &&
      value >= 0
      ? value
      : null
  }, [filters?.minPrice])

  const minRating = useMemo(() => {
    const value = Number(
      filters?.minRating
    )

    return Number.isFinite(value) &&
      value > 0
      ? value
      : null
  }, [filters?.minRating])

  const status = useMemo(() => {
    const value =
      filters?.status

    return value &&
      value !== 'Semua'
      ? String(value)
          .trim()
          .toLowerCase()
      : null
  }, [filters?.status])

  const verifiedOnly = useMemo(() => {
    return Boolean(
      filters?.verifiedOnly ??
      filters?.verified ??
      false
    )
  }, [
    filters?.verifiedOnly,
    filters?.verified,
  ])

  const sortBy = useMemo(() => {
    const allowed = [
      'rating',
      'price',
      'trips',
      'experience',
      'name',
      'created_at',
    ]

    return allowed.includes(
      filters?.sortBy
    )
      ? filters.sortBy
      : 'rating'
  }, [filters?.sortBy])

  const sortOrder = useMemo(() => {
    return filters?.sortOrder === 'asc'
      ? 'asc'
      : 'desc'
  }, [filters?.sortOrder])

  const limit = useMemo(() => {
    const value = Number(
      filters?.limit
    )

    if (
      Number.isFinite(value) &&
      value > 0 &&
      value <= 100
    ) {
      return Math.floor(value)
    }

    return DEFAULT_LIMIT
  }, [filters?.limit])

  // ===================================================
  // FETCH GUIDES
  // ===================================================

  const fetchTourGuides = useCallback(
    async ({
      isRefresh = false,
    } = {}) => {
      const currentRequestId =
        ++requestIdRef.current

      try {
        if (isRefresh) {
          setRefreshing(true)
        } else {
          setLoading(true)
        }

        setError(null)

        // =================================================
        // BASE QUERY
        // =================================================

        let query = supabase
          .from('tour_guides')
          .select('*', {
            count: 'exact',
          })

        // =================================================
        // CATEGORY
        // =================================================
        //
        // Tidak membuat query terpisah.
        // Semua filter diterapkan ke query yang sama.
        //
        // Jika kolom category belum tersedia,
        // kita fallback tanpa filter category.
        // =================================================

        if (
          category &&
          category !== 'Semua'
        ) {
          query = query.eq(
            'category',
            category
          )
        }

        // =================================================
        // SEARCH
        // =================================================

        if (search) {
          /*
           * Kita hanya mencari pada kolom yang
           * umum tersedia di tabel.
           *
           * name + city
           *
           * Jangan langsung memasukkan banyak
           * kolom yang belum tentu ada karena
           * satu kolom yang hilang bisa membuat
           * seluruh query gagal.
           */

          query = query.or(
            `name.ilike.%${search}%,city.ilike.%${search}%`
          )
        }

        // =================================================
        // MAX PRICE
        // =================================================

        if (maxPrice !== null) {
          query = query.lte(
            'price_per_day',
            maxPrice
          )
        }

        // =================================================
        // MIN PRICE
        // =================================================

        if (minPrice !== null) {
          query = query.gte(
            'price_per_day',
            minPrice
          )
        }

        // =================================================
        // MIN RATING
        // =================================================

        if (minRating !== null) {
          query = query.gte(
            'rating',
            minRating
          )
        }

        // =================================================
        // STATUS
        // =================================================

        if (status) {
          query = query.eq(
            'status',
            status
          )
        }

        // =================================================
        // VERIFIED
        // =================================================

        if (verifiedOnly) {
          query = query.eq(
            'verified',
            true
          )
        }

        // =================================================
        // SORT
        // =================================================

        let orderColumn =
          'rating'

        if (sortBy === 'price') {
          orderColumn =
            'price_per_day'
        }

        if (sortBy === 'trips') {
          orderColumn =
            'trips'
        }

        if (
          sortBy ===
          'experience'
        ) {
          orderColumn =
            'experience_years'
        }

        if (sortBy === 'name') {
          orderColumn =
            'name'
        }

        if (
          sortBy ===
          'created_at'
        ) {
          orderColumn =
            'created_at'
        }

        query = query.order(
          orderColumn,
          {
            ascending:
              sortOrder === 'asc',
            nullsFirst: false,
          }
        )

        // =================================================
        // LIMIT
        // =================================================

        query = query.limit(limit)

        // =================================================
        // EXECUTE
        // =================================================

        let {
          data,
          error: supabaseError,
          count: totalCount,
        } = await query

        // =================================================
        // CATEGORY FALLBACK
        // =================================================

        /*
         * Kalau category belum ada di database,
         * query pertama akan gagal.
         *
         * Kita ulangi query tanpa category.
         */

        if (
          supabaseError &&
          category !== 'Semua' &&
          isMissingColumnError(
            supabaseError
          )
        ) {
          console.warn(
            'Kolom category belum tersedia. Filter kategori dilewati.'
          )

          let fallbackQuery =
            supabase
              .from('tour_guides')
              .select('*', {
                count: 'exact',
              })

          // SEARCH
          if (search) {
            fallbackQuery =
              fallbackQuery.or(
                `name.ilike.%${search}%,city.ilike.%${search}%`
              )
          }

          // PRICE
          if (
            maxPrice !== null
          ) {
            fallbackQuery =
              fallbackQuery.lte(
                'price_per_day',
                maxPrice
              )
          }

          if (
            minPrice !== null
          ) {
            fallbackQuery =
              fallbackQuery.gte(
                'price_per_day',
                minPrice
              )
          }

          // RATING
          if (
            minRating !== null
          ) {
            fallbackQuery =
              fallbackQuery.gte(
                'rating',
                minRating
              )
          }

          // STATUS
          if (status) {
            fallbackQuery =
              fallbackQuery.eq(
                'status',
                status
              )
          }

          // VERIFIED
          if (verifiedOnly) {
            fallbackQuery =
              fallbackQuery.eq(
                'verified',
                true
              )
          }

          // SORT
          fallbackQuery =
            fallbackQuery.order(
              orderColumn,
              {
                ascending:
                  sortOrder === 'asc',
                nullsFirst: false,
              }
            )

          fallbackQuery =
            fallbackQuery.limit(
              limit
            )

          const fallbackResult =
            await fallbackQuery

          data =
            fallbackResult.data

          supabaseError =
            fallbackResult.error

          totalCount =
            fallbackResult.count
        }

        // =================================================
        // ERROR
        // =================================================

        if (supabaseError) {
          throw supabaseError
        }

        // =================================================
        // REQUEST GUARD
        // =================================================

        if (
          currentRequestId !==
          requestIdRef.current
        ) {
          return
        }

        // =================================================
        // NORMALIZE
        // =================================================

        let normalizedGuides =
          (data || [])
            .map(normalizeGuide)
            .filter(Boolean)

        // =================================================
        // CLIENT-SIDE CATEGORY FALLBACK
        // =================================================

        /*
         * Jika database tidak punya kolom category,
         * normalizeGuide akan memberikan "Lainnya".
         *
         * Kita hanya melakukan filtering jika
         * data memang memiliki category.
         */

        if (
          category &&
          category !== 'Semua'
        ) {
          const hasRealCategory =
            normalizedGuides.some(
              (guide) =>
                guide.category &&
                guide.category !==
                  'Lainnya'
            )

          if (hasRealCategory) {
            normalizedGuides =
              normalizedGuides.filter(
                (guide) =>
                  String(
                    guide.category
                  ).toLowerCase() ===
                  category.toLowerCase()
              )
          }
        }

        // =================================================
        // CLIENT-SIDE PRICE FALLBACK
        // =================================================

        if (maxPrice !== null) {
          normalizedGuides =
            normalizedGuides.filter(
              (guide) =>
                guide.price_per_day <=
                maxPrice
            )
        }

        if (minPrice !== null) {
          normalizedGuides =
            normalizedGuides.filter(
              (guide) =>
                guide.price_per_day >=
                minPrice
            )
        }

        // =================================================
        // CLIENT-SIDE RATING FALLBACK
        // =================================================

        if (minRating !== null) {
          normalizedGuides =
            normalizedGuides.filter(
              (guide) =>
                guide.rating >=
                minRating
            )
        }

        // =================================================
        // CLIENT-SIDE VERIFIED FALLBACK
        // =================================================

        if (verifiedOnly) {
          normalizedGuides =
            normalizedGuides.filter(
              (guide) =>
                guide.verified === true
            )
        }

        // =================================================
        // SET DATA
        // =================================================

        setGuides(
          normalizedGuides
        )

        setCount(
          Number(totalCount) ||
          normalizedGuides.length
        )
      } catch (err) {
        if (
          currentRequestId !==
          requestIdRef.current
        ) {
          return
        }

        console.error(
          'Error fetching tour guides:',
          err
        )

        // Missing table
        if (
          isMissingTableError(err)
        ) {
          setError(
            'Tabel tour_guides belum tersedia di Supabase.'
          )
        } else {
          setError(
            err?.message ||
              'Gagal mengambil data pemandu wisata.'
          )
        }

        setGuides([])
        setCount(0)
      } finally {
        if (
          currentRequestId ===
          requestIdRef.current
        ) {
          setLoading(false)
          setRefreshing(false)
        }
      }
    },
    [
      category,
      search,
      maxPrice,
      minPrice,
      minRating,
      status,
      verifiedOnly,
      sortBy,
      sortOrder,
      limit,
    ]
  )

  // ===================================================
  // AUTO FETCH
  // ===================================================

  useEffect(() => {
    fetchTourGuides()

    return () => {
      requestIdRef.current += 1
    }
  }, [fetchTourGuides])

  // ===================================================
  // REFETCH
  // ===================================================

  const refetch = useCallback(() => {
    return fetchTourGuides({
      isRefresh: true,
    })
  }, [fetchTourGuides])

  // ===================================================
  // DERIVED DATA
  // ===================================================

  const availableGuides = useMemo(() => {
    return guides.filter(
      (guide) =>
        guide.isAvailable
    )
  }, [guides])

  const onlineGuides = useMemo(() => {
    return guides.filter(
      (guide) =>
        guide.isOnline
    )
  }, [guides])

  const verifiedGuides = useMemo(() => {
    return guides.filter(
      (guide) =>
        guide.verified
    )
  }, [guides])

  const averageRating = useMemo(() => {
    if (!guides.length) {
      return 0
    }

    const total =
      guides.reduce(
        (sum, guide) =>
          sum +
          toNumber(
            guide.rating,
            0
          ),
        0
      )

    return total / guides.length
  }, [guides])

  const priceRange = useMemo(() => {
    if (!guides.length) {
      return {
        min: 0,
        max: 0,
      }
    }

    const prices =
      guides
        .map(
          (guide) =>
            toNumber(
              guide.price_per_day,
              0
            )
        )
        .filter(
          (price) =>
            price > 0
        )

    if (!prices.length) {
      return {
        min: 0,
        max: 0,
      }
    }

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    }
  }, [guides])

  // ===================================================
  // RETURN
  // ===================================================

  return {
    // -----------------------------------------------
    // DATA
    // -----------------------------------------------

    guides,

    availableGuides,

    onlineGuides,

    verifiedGuides,

    // -----------------------------------------------
    // STATE
    // -----------------------------------------------

    loading,

    refreshing,

    error,

    // -----------------------------------------------
    // META
    // -----------------------------------------------

    count,

    totalCount: count,

    hasGuides:
      guides.length > 0,

    isEmpty:
      !loading &&
      guides.length === 0,

    averageRating,

    priceRange,

    // -----------------------------------------------
    // FILTER INFO
    // -----------------------------------------------

    activeFilters: {
      category,
      search,
      maxPrice,
      minPrice,
      minRating,
      status,
      verifiedOnly,
      sortBy,
      sortOrder,
    },

    // -----------------------------------------------
    // ACTION
    // -----------------------------------------------

    refetch,
  }
}

export default useTourGuides
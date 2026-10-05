/**
 * @file src/hooks/useTourGuide.js
 * NuSaJoy — Tour Guide Listing Hook
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { supabase } from '../utils/supabaseClient'
import { normalizeGuide } from '../utils/guide'
import { getPublishedListings } from '../service/partnerService.js'

/* =====================================================
   CONSTANTS
===================================================== */

const EMPTY_GUIDES = []

/* =====================================================
   HELPERS
===================================================== */

function normalizeSearchValue(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
}

/* =====================================================
   HOOK
===================================================== */

export default function useTourGuides({
  search = '',
  category = 'Semua',
  fallbackGuides = EMPTY_GUIDES,
} = {}) {
  /* ===================================================
     STATE
  =================================================== */

  const [guides, setGuides] = useState([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState(null)

  /* ===================================================
     FALLBACK REF
  =================================================== */

  const fallbackRef = useRef(EMPTY_GUIDES)

  useEffect(() => {
    fallbackRef.current =
      Array.isArray(fallbackGuides)
        ? fallbackGuides
        : EMPTY_GUIDES
  }, [fallbackGuides])

  /* ===================================================
     REQUEST ID
  =================================================== */

  const requestIdRef = useRef(0)

  /* ===================================================
     SEARCH
  =================================================== */

  const normalizedSearch = useMemo(() => {
    return normalizeSearchValue(search)
  }, [search])

  /* ===================================================
     FALLBACK
  =================================================== */

  const getFallbackGuides = useCallback(() => {
    const fallback = fallbackRef.current

    if (
      !Array.isArray(fallback) ||
      fallback.length === 0
    ) {
      return []
    }

    return fallback
      .map(normalizeGuide)
      .filter(Boolean)
  }, [])

  /* ===================================================
     LOAD GUIDES
  =================================================== */

  const loadGuides = useCallback(async () => {
    const requestId =
      ++requestIdRef.current

    try {
      setLoading(true)
      setError(null)

      /* ===============================================
         SUPABASE QUERY
      =============================================== */

      let query = supabase
        .from('tour_guides')
        .select('*')
        .eq('is_active', true)
        .order('rating', {
          ascending: false,
        })

      /* ===============================================
         CATEGORY FILTER
      =============================================== */

      if (
        category &&
        category !== 'Semua'
      ) {
        query = query.eq(
          'category',
          category
        )
      }

      /* ===============================================
         EXECUTE
      =============================================== */

      const [{ data, error: queryError }, partnerGuides] = await Promise.all([
        query,
        getPublishedListings('guide'),
      ])

      /*
       * Abaikan request lama.
       */
      if (
        requestId !==
        requestIdRef.current
      ) {
        return
      }

      /*
       * Supabase error.
       */
      if (queryError) {
        throw queryError
      }

      /* ===============================================
         NORMALIZE SUPABASE DATA
      =============================================== */

      const normalized =
        Array.isArray(data)
          ? [...data.filter((g) => !g.managed_in_dashboard), ...partnerGuides.filter((g) => !category || category === 'Semua' || g.category === category)]
              .map(normalizeGuide)
              .filter(Boolean)
          : []

      /* ===============================================
         USE SUPABASE DATA
      =============================================== */

      if (
        normalized.length > 0
      ) {
        setGuides(normalized)
        setError(null)

        return
      }

      /* ===============================================
         FALLBACK
      =============================================== */

      const fallback =
        getFallbackGuides()

      setGuides(fallback)
      setError(null)
    } catch (fetchError) {
      /*
       * Jangan proses request lama.
       */
      if (
        requestId !==
        requestIdRef.current
      ) {
        return
      }

      console.error(
        'NuSaJoy: gagal memuat tour guide:',
        fetchError
      )

      /* ===============================================
         FALLBACK SAAT SUPABASE ERROR
      =============================================== */

      const fallback =
        getFallbackGuides()

      if (
        fallback.length > 0
      ) {
        setGuides(fallback)
        setError(null)
      } else {
        setGuides([])

        setError(
          fetchError?.message ||
            'Gagal memuat data pemandu wisata.'
        )
      }
    } finally {
      if (
        requestId ===
        requestIdRef.current
      ) {
        setLoading(false)
      }
    }
  }, [
    category,
    getFallbackGuides,
  ])

  /* ===================================================
     AUTO FETCH
  =================================================== */

  useEffect(() => {
    let isMounted = true

    const runLoad = async () => {
      if (!isMounted) {
        return
      }

      await loadGuides()
    }

    void runLoad()

    return () => {
      isMounted = false
      requestIdRef.current += 1
    }
  }, [
    loadGuides,
  ])

  /* ===================================================
     LOCAL SEARCH
  =================================================== */

  const filteredGuides = useMemo(() => {
    if (!normalizedSearch) {
      return guides
    }

    return guides.filter((guide) => {
      const specialties =
        Array.isArray(
          guide?.specialties
        )
          ? guide.specialties
          : []

      const searchable = [
        guide?.name,
        guide?.city,
        guide?.location,
        guide?.category,
        guide?.bio,
        ...specialties,
      ]
        .filter(Boolean)
        .map(String)
        .join(' ')
        .toLowerCase()

      return searchable.includes(
        normalizedSearch
      )
    })
  }, [
    guides,
    normalizedSearch,
  ])

  /* ===================================================
     REFETCH
  =================================================== */

  const refetch = useCallback(() => {
    return loadGuides()
  }, [
    loadGuides,
  ])

  /* ===================================================
     RETURN
  =================================================== */

  return {
    guides: filteredGuides,
    allGuides: guides,
    loading,
    error,
    refetch,
  }
}

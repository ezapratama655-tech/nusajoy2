import { useState, useEffect } from 'react'

// =====================================================
// HITUNG JARAK DENGAN FORMULA HAVERSINE
// =====================================================

export const distanceKm = (
  lat1,
  lon1,
  lat2,
  lon2
) => {
  // Pastikan semua koordinat tersedia
  if (
    lat1 === null ||
    lat1 === undefined ||
    lon1 === null ||
    lon1 === undefined ||
    lat2 === null ||
    lat2 === undefined ||
    lon2 === null ||
    lon2 === undefined
  ) {
    return null
  }

  const R = 6371

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )

  return R * c
}

// =====================================================
// FORMAT JARAK
// =====================================================

export const formatDistance = (km) => {
  if (
    km === null ||
    km === undefined ||
    Number.isNaN(km)
  ) {
    return 'Jarak tidak diketahui'
  }

  if (km < 1) {
    return `${Math.round(km * 1000)} m`
  }

  return `${km.toFixed(1)} km`
}

// =====================================================
// GEOLOCATION HOOK
// =====================================================

export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState({
    lat: null,
    lng: null,
  })

  const [error, setError] = useState(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Browser tidak mendukung geolocation
    if (!navigator.geolocation) {
      if (mounted) {
        setError(
          'Geolokasi tidak didukung oleh browser Anda'
        )

        setLoading(false)
      }

      return
    }

    setLoading(true)
    setError(null)

    const handleSuccess = (position) => {
      if (!mounted) return

      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      })

      setLoading(false)
      setError(null)
    }

    const handleError = (err) => {
      if (!mounted) return

      let message =
        'Gagal mendapatkan lokasi'

      switch (err.code) {
        case 1:
          message =
            'Akses lokasi ditolak. Silakan izinkan lokasi di browser Anda.'
          break

        case 2:
          message =
            'Lokasi tidak tersedia saat ini.'
          break

        case 3:
          message =
            'Permintaan lokasi terlalu lama. Silakan coba lagi.'
          break

        default:
          message =
            err.message ||
            'Gagal mendapatkan lokasi'
      }

      setError(message)
      setLoading(false)
    }

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options,
      }
    )

    return () => {
      mounted = false
    }
  }, [])

  return {
    location,
    error,
    loading,
    distanceKm,
    formatDistance,
  }
}

export default useGeolocation
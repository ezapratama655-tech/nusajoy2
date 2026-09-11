// =====================================================
// NUSAJOY GUIDE RECOMMENDATION ENGINE
// =====================================================

/**
 * Menghitung skor rekomendasi sederhana untuk
 * pemandu wisata NuSaJoy.
 *
 * Faktor:
 * - Rating
 * - Jumlah perjalanan
 * - Kategori
 * - Lokasi pengguna jika tersedia
 */


function calculateDistance(
  lat1,
  lng1,
  lat2,
  lng2
) {
  if (
    lat1 == null ||
    lng1 == null ||
    lat2 == null ||
    lng2 == null
  ) {
    return null
  }

  const R = 6371

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180

  const dLng =
    ((lng2 - lng1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos(
      (lat1 * Math.PI) / 180
    ) *
      Math.cos(
        (lat2 * Math.PI) / 180
      ) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )

  return R * c
}


/**
 * Membuat daftar pemandu yang telah diberi
 * match score dan distance.
 */
export function getRecommendedGuides(
  guides = [],
  preferences = {},
  userLocation = null
) {

  if (!Array.isArray(guides)) {
    return []
  }


  return guides
    .map((guide) => {

      let score = 0


      // =================================================
      // RATING
      // =================================================

      const rating =
        Number(guide.rating) || 0

      score += rating * 12


      // =================================================
      // TRIPS
      // =================================================

      const trips =
        Number(
          guide.trips ??
          guide.total_trips ??
          0
        )

      score += Math.min(
        trips / 10,
        15
      )


      // =================================================
      // VERIFIED
      // =================================================

      if (guide.verified) {
        score += 10
      }


      // =================================================
      // AVAILABLE
      // =================================================

      if (
        guide.status !== 'offline'
      ) {
        score += 5
      }


      // =================================================
      // CATEGORY MATCH
      // =================================================

      const selectedCategory =
        preferences.category

      if (
        selectedCategory &&
        selectedCategory !== 'Semua'
      ) {

        const guideCategories = [
          ...(Array.isArray(
            guide.specialties
          )
            ? guide.specialties
            : []),

          ...(Array.isArray(
            guide.categories
          )
            ? guide.categories
            : []),

          ...(guide.category
            ? [guide.category]
            : []),
        ]
          .map((item) =>
            String(item).toLowerCase()
          )


        if (
          guideCategories.includes(
            String(
              selectedCategory
            ).toLowerCase()
          )
        ) {
          score += 20
        }
      }


      // =================================================
      // DISTANCE
      // =================================================

      let distanceKm = null


      const userLat =
        userLocation?.lat

      const userLng =
        userLocation?.lng


      const guideLat =
        guide.latitude ??
        guide.lat ??
        guide.location_lat

      const guideLng =
        guide.longitude ??
        guide.lng ??
        guide.location_lng


      if (
        userLat != null &&
        userLng != null &&
        guideLat != null &&
        guideLng != null
      ) {

        distanceKm =
          calculateDistance(
            Number(userLat),
            Number(userLng),
            Number(guideLat),
            Number(guideLng)
          )


        if (
          distanceKm != null
        ) {

          if (distanceKm < 10) {
            score += 20
          }

          else if (
            distanceKm < 50
          ) {
            score += 15
          }

          else if (
            distanceKm < 100
          ) {
            score += 10
          }

          else if (
            distanceKm < 300
          ) {
            score += 5
          }
        }
      }


      // =================================================
      // MATCH SCORE
      // =================================================

      const matchScore =
        Math.min(
          100,
          Math.max(
            0,
            Math.round(score)
          )
        )


      return {
        ...guide,
        matchScore,
        distanceKm,
      }

    })


    // =================================================
    // SORT RECOMMENDATION
    // =================================================

    .sort(
      (a, b) =>
        Number(
          b.matchScore || 0
        ) -
        Number(
          a.matchScore || 0
        )
    )
}
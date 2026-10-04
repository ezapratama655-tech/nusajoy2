/**
 * ============================================================
 * NUSAJOY RECOMMENDATION ENGINE
 * ============================================================
 *
 * File ini menangani perhitungan kecocokan dan pengurutan
 * rekomendasi guide berdasarkan:
 *
 * - minat / tag        : 50%
 * - budget             : 30%
 * - lokasi             : 20%
 *
 * Dibuat fleksibel agar dapat menerima berbagai bentuk
 * data mockData / API NuSaJoy.
 */


/* ============================================================
   HELPER
============================================================ */

/**
 * Mengubah nilai menjadi array yang aman.
 */
const toArray = (value) => {
  if (Array.isArray(value)) {
    return value
  }

  if (
    value !== null &&
    value !== undefined &&
    value !== ''
  ) {
    return [value]
  }

  return []
}


/**
 * Normalisasi teks agar pencocokan lebih konsisten.
 */
const normalizeText = (value) => {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}


/**
 * Mengambil seluruh tag / kategori yang mungkin dimiliki item.
 */
const getItemTags = (item) => {
  if (!item || typeof item !== 'object') {
    return []
  }

  return [
    ...toArray(item.tags),
    ...toArray(item.interestTags),
    ...toArray(item.interests),
    ...toArray(item.specialties),
    ...toArray(item.categories),
    ...toArray(item.category),
  ]
    .map(normalizeText)
    .filter(Boolean)
}


/**
 * Mengambil nama lokasi yang tersedia pada guide.
 */
const getItemLocation = (item) => {
  if (!item || typeof item !== 'object') {
    return ''
  }

  return normalizeText(
    item.location ??
    item.city ??
    item.address ??
    item.destination ??
    ''
  )
}


/**
 * Mengambil harga guide.
 */
const getItemPrice = (item) => {
  if (!item || typeof item !== 'object') {
    return 0
  }

  const price = Number(
    item.pricePerPerson ??
    item.price_per_day ??
    item.pricePerDay ??
    item.startingPrice ??
    item.price ??
    0
  )

  return Number.isFinite(price)
    ? price
    : 0
}


/**
 * Mengambil rating guide.
 */
const getItemRating = (item) => {
  const rating = Number(
    item?.rating ?? 0
  )

  return Number.isFinite(rating)
    ? rating
    : 0
}


/**
 * Mengambil jumlah pengalaman / trip.
 */
const getItemExperience = (item) => {
  const experience = Number(
    item?.experience ??
    item?.experience_years ??
    0
  )

  return Number.isFinite(experience)
    ? experience
    : 0
}


/* ============================================================
   MATCH SCORE
============================================================ */

/**
 * Menghitung skor kecocokan pengalaman
 * dengan preferensi pengguna.
 *
 * Bobot:
 * - minat/tag       : 50%
 * - budget          : 30%
 * - lokasi          : 20%
 *
 * Fungsi dibuat fleksibel agar bisa menerima
 * beberapa bentuk data yang berbeda dari
 * mockData NuSaJoy.
 */
export const calculateMatchScore = (
  item,
  preferences = {},
) => {
  if (
    !item ||
    typeof item !== 'object'
  ) {
    return 0
  }


  const {
    interests = [],
    selectedInterests = [],
    budget = 0,
    location = 'semua',
  } = preferences


  /* =====================================================
     INTEREST SCORE
  ===================================================== */

  const userInterests = [
    ...(Array.isArray(interests)
      ? interests
      : []),

    ...(Array.isArray(selectedInterests)
      ? selectedInterests
      : []),
  ]
    .map((value) =>
      String(value)
        .trim()
        .toLowerCase(),
    )
    .filter(Boolean)


  const itemTags = [
    ...(Array.isArray(item.tags)
      ? item.tags
      : []),

    ...(Array.isArray(item.interestTags)
      ? item.interestTags
      : []),

    ...(Array.isArray(item.interests)
      ? item.interests
      : []),
  ]
    .map((value) =>
      String(value)
        .trim()
        .toLowerCase(),
    )
    .filter(Boolean)


  let interestScore = 0


  if (
    userInterests.length > 0 &&
    itemTags.length > 0
  ) {
    const matched =
      userInterests.filter(
        (interest) =>
          itemTags.includes(
            interest,
          ),
      ).length


    interestScore =
      Math.min(
        1,
        matched /
          userInterests.length,
      )
  }


  /* =====================================================
     BUDGET SCORE
  ===================================================== */

  const itemPrice =
    Number(
      item.pricePerPerson ??
      item.price ??
      item.pricePerDay ??
      item.startingPrice ??
      0,
    )


  const userBudget =
    Number(budget)


  let budgetScore


  if (
    Number.isFinite(
      userBudget,
    ) &&
    userBudget > 0 &&
    itemPrice > 0
  ) {
    if (
      itemPrice <= userBudget
    ) {
      budgetScore = 1
    } else {
      /**
       * Semakin jauh dari budget,
       * skor semakin turun.
       */
      const difference =
        itemPrice -
        userBudget


      budgetScore =
        Math.max(
          0,
          1 -
            difference /
              userBudget,
        )
    }
  } else {
    /**
     * Bila budget belum dipilih,
     * jangan menghukum skor.
     */
    budgetScore = 1
  }


  /* =====================================================
     LOCATION SCORE
  ===================================================== */

  const requestedLocation =
    String(
      location || 'semua',
    )
      .trim()
      .toLowerCase()


  const itemLocation =
    String(
      item.location ??
      item.address ??
      item.city ??
      '',
    )
      .trim()
      .toLowerCase()


  let locationScore = 1


  if (
    requestedLocation !==
      'semua' &&
    requestedLocation
  ) {
    const normalizedLocation =
      requestedLocation
        .replace(
          /[^a-z0-9]+/g,
          ' ',
        )
        .trim()


    locationScore =
      itemLocation.includes(
        normalizedLocation,
      ) ||
      normalizedLocation.includes(
        itemLocation,
      )
        ? 1
        : 0
  }


  /* =====================================================
     FINAL SCORE
  ===================================================== */

  const score =
    interestScore * 0.5 +
    budgetScore * 0.3 +
    locationScore * 0.2


  /**
   * Kembalikan 0–100.
   */
  return Math.round(
    score * 100,
  )
}


/* ============================================================
   RECOMMENDED GUIDES
============================================================ */

/**
 * Menghasilkan daftar guide yang telah diberi skor rekomendasi.
 *
 * Dipakai oleh:
 *
 * src/pages/TourGuide.jsx
 *
 * Contoh penggunaan:
 *
 * getRecommendedGuides(
 *   guides,
 *   { category },
 *   location
 * )
 *
 * Fungsi ini:
 * - tidak mengubah array sumber
 * - memberi matchScore ke setiap guide
 * - mempertahankan semua properti guide lama
 * - memprioritaskan kategori yang dipilih
 * - menggunakan jarak bila tersedia
 * - mempertahankan urutan stabil bila skor sama
 */
export const getRecommendedGuides = (
  guides = [],
  preferences = {},
  currentLocation = null,
) => {
  if (!Array.isArray(guides)) {
    return []
  }


  const safePreferences =
    preferences &&
    typeof preferences === 'object'
      ? preferences
      : {}


  const selectedCategory =
    normalizeText(
      safePreferences.category ??
      'semua',
    )


  /**
   * Buat salinan agar array asli dari hook/API
   * tidak dimutasi oleh proses sorting.
   */
  const scoredGuides =
    guides.map(
      (guide, index) => {
        if (
          !guide ||
          typeof guide !== 'object'
        ) {
          return null
        }


        const tags =
          getItemTags(guide)


        const guideLocation =
          getItemLocation(guide)


        const price =
          getItemPrice(guide)


        const rating =
          getItemRating(guide)


        const experience =
          getItemExperience(guide)


        /* ==================================================
           CATEGORY SCORE
        ================================================== */

        let categoryScore = 1


        if (
          selectedCategory &&
          selectedCategory !== 'semua'
        ) {
          const categoryMatched =
            tags.some(
              (tag) =>
                tag === selectedCategory ||
                tag.includes(
                  selectedCategory,
                ) ||
                selectedCategory.includes(
                  tag,
                ),
            )


          categoryScore =
            categoryMatched
              ? 1
              : 0
        }


        /* ==================================================
           BASE MATCH SCORE
        ================================================== */

        /**
         * Jangan memaksa location object seperti:
         * { lat, lng }
         * masuk ke calculateMatchScore karena fungsi tersebut
         * memang dirancang untuk lokasi berbentuk teks.
         *
         * Untuk kategori kita masukkan sebagai selectedInterests.
         */
        const recommendationInterests =
          selectedCategory &&
          selectedCategory !== 'semua'
            ? [
                ...toArray(
                  safePreferences.interests,
                ),

                ...toArray(
                  safePreferences.selectedInterests,
                ),

                selectedCategory,
              ]
            : [
                ...toArray(
                  safePreferences.interests,
                ),

                ...toArray(
                  safePreferences.selectedInterests,
                ),
              ]


        const baseMatchScore =
          calculateMatchScore(
            guide,
            {
              ...safePreferences,

              interests:
                safePreferences.interests ??
                [],

              selectedInterests:
                recommendationInterests,

              /**
               * Geolocation browser bukan teks kota,
               * jadi tidak dikirim sebagai location string.
               */
              location:
                typeof safePreferences.location ===
                  'string'
                  ? safePreferences.location
                  : 'semua',
            },
          )


        /* ==================================================
           DISTANCE SCORE
        ================================================== */

        /**
         * useGeolocation biasanya dapat menghasilkan
         * distanceKm pada guide setelah data diproses.
         *
         * Semakin dekat guide, semakin tinggi skor.
         */
        const distance =
          Number(
            guide.distanceKm,
          )


        let distanceScore = 0.5


        if (
          Number.isFinite(distance) &&
          distance >= 0
        ) {
          if (distance <= 2) {
            distanceScore = 1
          } else if (distance <= 5) {
            distanceScore = 0.9
          } else if (distance <= 10) {
            distanceScore = 0.8
          } else if (distance <= 20) {
            distanceScore = 0.65
          } else if (distance <= 50) {
            distanceScore = 0.5
          } else if (distance <= 100) {
            distanceScore = 0.35
          } else {
            distanceScore = 0.2
          }
        } else if (
          currentLocation?.lat !==
            null &&
          currentLocation?.lat !==
            undefined &&
          currentLocation?.lng !==
            null &&
          currentLocation?.lng !==
            undefined
        ) {
          /**
           * Browser location aktif tetapi guide
           * belum mempunyai jarak.
           *
           * Jangan menghukum guide tersebut.
           */
          distanceScore = 0.5
        }


        /* ==================================================
           COMPOSITE SCORE
        ================================================== */

        /**
         * Komponen:
         *
         * base recommendation : 60%
         * category             : 20%
         * distance             : 10%
         * rating               : 5%
         * experience           : 5%
         */
        const ratingScore =
          Math.min(
            1,
            Math.max(
              0,
              rating / 5,
            ),
          )


        const experienceScore =
          Math.min(
            1,
            Math.max(
              0,
              experience / 10,
            ),
          )


        let finalScore =
          baseMatchScore * 0.6 +
          categoryScore * 100 * 0.2 +
          distanceScore * 100 * 0.1 +
          ratingScore * 100 * 0.05 +
          experienceScore * 100 * 0.05


        /**
         * Pastikan selalu 0–100.
         */
        finalScore = Math.round(
          Math.min(
            100,
            Math.max(
              0,
              finalScore,
            ),
          ),
        )


        return {
          ...guide,

          /**
           * Properti baru ditambahkan tanpa
           * menghapus properti yang sudah ada.
           */
          matchScore:
            finalScore,

          recommendationScore:
            finalScore,

          recommendationMeta: {
            categoryScore,
            distanceScore,
            ratingScore,
            experienceScore,
            price,
            guideLocation,
            sourceIndex: index,
          },
        }
      },
    )


  /* ==========================================================
     SORT
  ========================================================== */

  return scoredGuides
    .filter(Boolean)
    .sort(
      (a, b) => {
        const scoreDifference =
          Number(
            b.matchScore ?? 0,
          ) -
          Number(
            a.matchScore ?? 0,
          )


        if (
          scoreDifference !== 0
        ) {
          return scoreDifference
        }


        /**
         * Bila skor sama, rating lebih tinggi
         * berada di atas.
         */
        const ratingDifference =
          Number(
            b.rating ?? 0,
          ) -
          Number(
            a.rating ?? 0,
          )


        if (
          ratingDifference !== 0
        ) {
          return ratingDifference
        }


        /**
         * Bila masih sama, pengalaman lebih tinggi
         * diprioritaskan.
         */
        const experienceDifference =
          getItemExperience(b) -
          getItemExperience(a)


        if (
          experienceDifference !== 0
        ) {
          return experienceDifference
        }


        /**
         * Terakhir gunakan urutan awal.
         */
        return (
          Number(
            a.recommendationMeta
              ?.sourceIndex ?? 0,
          ) -
          Number(
            b.recommendationMeta
              ?.sourceIndex ?? 0,
          )
        )
      },
    )
}


/* ============================================================
   DEFAULT EXPORT
============================================================ */

/**
 * Default export tetap menyediakan fungsi utama
 * agar file ini fleksibel bila dipanggil menggunakan:
 *
 * import recommendation from '../utils/recommendation'
 */
export default {
  calculateMatchScore,
  getRecommendedGuides,
}
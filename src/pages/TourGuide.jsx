import {
  useMemo,
  useState,
} from 'react'

import {
  Link,
} from 'react-router-dom'

import {
  Search,
  MapPin,
  Star,
  Heart,
  Loader2,
  Sparkles,
  Compass,
  AlertCircle,
  X,
  ArrowUpRight,
  BadgeCheck,
  Users,
  Navigation,
  SlidersHorizontal,
  Clock,
} from 'lucide-react'

import useTourGuides from '../hooks/useTourGuide'

import useGeolocation, {
  formatDistance,
} from '../hooks/useGeolocation'

import {
  getRecommendedGuides,
} from '../utils/recommendation'

import useFavorites from '../hooks/useFavorites.js'

import '../styles/TourGuide.css'

/* =====================================================
   CONFIGURATION
===================================================== */

const FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80'

const CATEGORIES = [
  'Semua',
  'Budaya',
  'Alam',
  'Kuliner',
  'Petualangan',
]

/* =====================================================
   COMPONENT
===================================================== */

export default function TourGuide() {
  /* ===================================================
     STATE
  =================================================== */

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    category,
    setCategory,
  ] = useState('Semua')

  const [
    sortBy,
    setSortBy,
  ] = useState('recommended')

  const { isFavorite, toggleFavorite } = useFavorites()

  /* ===================================================
     LOCATION
  =================================================== */

  const {
    location,
  } = useGeolocation()

  /* ===================================================
     TOUR GUIDES
  =================================================== */

  const {
    guides,
    loading = false,
    error = null,
  } = useTourGuides({
    search,
    category,
  }) || {}

  /* ===================================================
     SAFE GUIDES
  =================================================== */

  const safeGuides = useMemo(
    () => {
      if (
        !Array.isArray(guides)
      ) {
        return []
      }

      return guides.filter(
        (guide) =>
          guide &&
          typeof guide ===
            'object'
      )
    },
    [guides]
  )

  /* ===================================================
     RECOMMENDATION
  =================================================== */

  const recommendedGuides =
    useMemo(() => {
      if (
        safeGuides.length === 0
      ) {
        return []
      }

      try {
        const result =
          getRecommendedGuides(
            safeGuides,
            {
              category,
            },
            location
          )

        if (
          Array.isArray(result)
        ) {
          return result.filter(
            (guide) =>
              guide &&
              typeof guide ===
                'object'
          )
        }

        return [
          ...safeGuides,
        ]
      } catch (
        recommendationError
      ) {
        console.error(
          'NuSaJoy: gagal membuat rekomendasi guide:',
          recommendationError
        )

        return [
          ...safeGuides,
        ]
      }
    }, [
      safeGuides,
      category,
      location,
    ])

  /* ===================================================
     SORT
  =================================================== */

  const displayedGuides =
    useMemo(() => {
      const result = [
        ...recommendedGuides,
      ]

      /*
       * Rating tertinggi.
       */
      if (
        sortBy === 'rating'
      ) {
        return result.sort(
          (a, b) =>
            Number(
              b?.rating ?? 0
            ) -
            Number(
              a?.rating ?? 0
            )
        )
      }

      /*
       * Harga terendah.
       */
      if (
        sortBy === 'price-low'
      ) {
        return result.sort(
          (a, b) =>
            Number(
              a?.price_per_day ??
                a?.price ??
                0
            ) -
            Number(
              b?.price_per_day ??
                b?.price ??
                0
            )
        )
      }

      /*
       * Pengalaman terbanyak.
       */
      if (
        sortBy === 'experience'
      ) {
        return result.sort(
          (a, b) =>
            Number(
              b?.experience ??
                b?.experience_years ??
                0
            ) -
            Number(
              a?.experience ??
                a?.experience_years ??
                0
            )
        )
      }

      /*
       * Recommended.
       */
      return result
    }, [
      recommendedGuides,
      sortBy,
    ])

  /* ===================================================
     FAVORITE
  =================================================== */

  const handleToggleFavorite = (
    event,
    guide
  ) => {
    const guideId = guide?.id
    event.preventDefault()
    event.stopPropagation()

    if (
      guideId === null ||
      guideId === undefined
    ) {
      return
    }

    try {
      toggleFavorite({ ...guide, type: 'guide' })
    } catch (
      favoriteError
    ) {
      console.error(
        'NuSaJoy: gagal mengubah favorit:',
        favoriteError
      )
    }
  }

  /* ===================================================
     RESET
  =================================================== */

  const handleReset = () => {
    setSearch('')
    setCategory('Semua')
    setSortBy('recommended')
  }

  /* ===================================================
     LOCATION STATUS
  =================================================== */

  const isLocationActive =
    location?.lat !== null &&
    location?.lat !== undefined &&
    location?.lng !== null &&
    location?.lng !== undefined

  /* ===================================================
     AVERAGE RATING
  =================================================== */

  const averageRating =
    useMemo(() => {
      if (
        safeGuides.length === 0
      ) {
        return '0.0'
      }

      const validRatings =
        safeGuides
          .map(
            (guide) => {
              const value =
                Number(
                  guide?.rating ??
                    0
                )

              return Number.isFinite(
                value
              )
                ? value
                : 0
            }
          )
          .filter(
            (rating) =>
              rating > 0
          )

      if (
        validRatings.length ===
        0
      ) {
        return '0.0'
      }

      const total =
        validRatings.reduce(
          (
            sum,
            rating
          ) =>
            sum + rating,
          0
        )

      return (
        total /
        validRatings.length
      ).toFixed(1)
    }, [
      safeGuides,
    ])

  /* ===================================================
     AVAILABLE GUIDES
  =================================================== */

  const availableGuides =
    useMemo(
      () =>
        safeGuides.filter(
          (guide) =>
            guide?.status !==
            'offline'
        ).length,
      [safeGuides]
    )

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div className="guides-page">
      {/* =================================================
          HERO
      ================================================= */}

      <header className="guides-hero">
        <div className="hero-decoration hero-decoration-one" />

        <div className="hero-decoration hero-decoration-two" />

        <div className="hero-grid-pattern" />

        <div className="guides-hero-container">
          <div className="guides-hero-content">
            <div className="hero-badge">
              <Sparkles size={15} />

              <span>
                Pengalaman Lokal Pilihan
              </span>
            </div>

            <h1>
              Jelajahi Indonesia
              <span>
                {' '}bersama Ahlinya.
              </span>
            </h1>

            <p>
              Temukan pemandu lokal
              terpercaya yang memahami
              budaya, alam, cerita, dan
              pengalaman terbaik di setiap
              destinasi Nusantara.
            </p>

            <div className="hero-feature-list">
              <div>
                <BadgeCheck
                  size={17}
                />

                <span>
                  Pemandu Terverifikasi
                </span>
              </div>

              <div>
                <MapPin size={17} />

                <span>
                  Berbasis Lokal
                </span>
              </div>
            </div>
          </div>

          {/* HERO STATS */}

          <div className="guide-hero-stats">
            <div className="hero-stat-card">
              <Users size={20} />

              <div>
                <strong>
                  {safeGuides.length}+
                </strong>

                <span>
                  Pemandu Lokal
                </span>
              </div>
            </div>

            <div className="hero-stat-card">
              <Star size={20} />

              <div>
                <strong>
                  {averageRating}
                </strong>

                <span>
                  Rating Rata-rata
                </span>
              </div>
            </div>

            <div className="hero-stat-card">
              <Navigation
                size={20}
              />

              <div>
                <strong>
                  {availableGuides}
                </strong>

                <span>
                  Sedang Tersedia
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =================================================
          SEARCH & FILTER
      ================================================= */}

      <section
        className="guide-filter-section"
        aria-label="Pencarian pemandu wisata"
      >
        <div className="guide-filter-card">
          {/* SEARCH */}

          <div className="guide-search-box">
            <Search
              size={20}
              className="guide-search-icon"
            />

            <input
              type="text"
              placeholder="Cari nama, kota, atau pengalaman..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              aria-label="Cari pemandu wisata"
            />

            {search && (
              <button
                type="button"
                className="guide-clear-search"
                onClick={() =>
                  setSearch('')
                }
                aria-label="Hapus pencarian"
              >
                <X size={17} />
              </button>
            )}
          </div>

          {/* FILTER BOTTOM */}

          <div className="guide-filter-bottom">
            {/* CATEGORY */}

            <div className="guide-category-scroll">
              {CATEGORIES.map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    className={`guide-category-chip ${
                      category === item
                        ? 'active'
                        : ''
                    }`}
                    onClick={() =>
                      setCategory(item)
                    }
                    aria-pressed={
                      category === item
                    }
                  >
                    {item}
                  </button>
                )
              )}
            </div>

            {/* SORT */}

            <div className="guide-sort-wrapper">
              <SlidersHorizontal
                size={16}
              />

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target.value
                  )
                }
                aria-label="Urutkan pemandu"
              >
                <option value="recommended">
                  Rekomendasi
                </option>

                <option value="rating">
                  Rating tertinggi
                </option>

                <option value="price-low">
                  Harga terendah
                </option>

                <option value="experience">
                  Pengalaman
                </option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (
        <div className="guide-loading-container">
          <div className="guide-state guide-loading">
            <div className="guide-loading-icon">
              <Loader2
                size={32}
                className="spin"
              />
            </div>

            <h3>
              Menyiapkan pemandu terbaik...
            </h3>

            <p>
              Kami sedang mencari
              pengalaman lokal terbaik
              untuk perjalananmu.
            </p>
          </div>

          <div className="guide-skeleton-grid">
            {[1, 2, 3].map(
              (item) => (
                <div
                  className="guide-skeleton-card"
                  key={item}
                >
                  <div className="skeleton-image" />

                  <div className="skeleton-content">
                    <div className="skeleton-line large" />

                    <div className="skeleton-line medium" />

                    <div className="skeleton-line small" />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {error && !loading && (
        <div className="guide-state guide-error">
          <div className="guide-state-icon">
            <AlertCircle size={32} />
          </div>

          <h3>
            Gagal memuat pemandu
          </h3>

          <p>
            {typeof error ===
            'string'
              ? error
              : error?.message ||
                'Terjadi masalah saat memuat data pemandu.'}
          </p>

          <button
            type="button"
            className="guide-reset-button"
            onClick={handleReset}
          >
            Muat Ulang
          </button>
        </div>
      )}

      {/* =================================================
          EMPTY
      ================================================= */}

      {!loading &&
        !error &&
        displayedGuides.length ===
          0 && (
          <div className="guide-state guide-empty">
            <div className="guide-state-icon">
              <Compass size={36} />
            </div>

            <h2>
              Pemandu belum ditemukan
            </h2>

            <p>
              Coba gunakan kata kunci
              atau kategori lain untuk
              menemukan pemandu yang
              sesuai.
            </p>

            <button
              type="button"
              className="guide-reset-button"
              onClick={handleReset}
            >
              Reset Pencarian
            </button>
          </div>
        )}

      {/* =================================================
          CONTENT
      ================================================= */}

      {!loading &&
        !error &&
        displayedGuides.length >
          0 && (
          <main className="guides-container">
            {/* RESULT HEADER */}

            <div className="guides-result-header">
              <div>
                <span className="result-label">
                  NUSAJOY LOCAL GUIDE
                </span>

                <h2>
                  Temukan pemandu untuk
                  perjalananmu
                </h2>

                <p>
                  {displayedGuides.length}{' '}
                  pemandu tersedia untuk
                  kamu jelajahi.
                </p>
              </div>

              {isLocationActive && (
                <div className="location-status">
                  <MapPin size={15} />

                  <span>
                    Lokasi aktif
                  </span>
                </div>
              )}
            </div>

            {/* GRID */}

            <div className="guides-grid">
              {displayedGuides.map(
                (
                  guide,
                  index
                ) => {
                  const guideId =
                    guide?.id

                  /* ===============================
                     FAVORITE
                  =============================== */

                  const favorite =
                    guideId !== null &&
                    guideId !==
                      undefined
                      ? isFavorite(
                          guideId
                        )
                      : false

                  /* ===============================
                     IMAGE
                  =============================== */

                  const avatar =
                    guide?.avatar ||
                    guide?.photo ||
                    guide?.image ||
                    FALLBACK_AVATAR

                  /* ===============================
                     CITY
                  =============================== */

                  const city =
                    guide?.city ||
                    guide?.location ||
                    'Indonesia'

                  /* ===============================
                     PRICE
                  =============================== */

                  const rawPrice =
                    Number(
                      guide?.price_per_day ??
                        guide?.price ??
                        0
                    )

                  const price =
                    Number.isFinite(
                      rawPrice
                    )
                      ? rawPrice
                      : 0

                  /* ===============================
                     RATING
                  =============================== */

                  const rawRating =
                    Number(
                      guide?.rating ??
                        0
                    )

                  const rating =
                    Number.isFinite(
                      rawRating
                    )
                      ? rawRating
                      : 0

                  /* ===============================
                     TRIPS
                  =============================== */

                  const rawTrips =
                    Number(
                      guide?.trips ??
                        guide?.total_trips ??
                        0
                    )

                  const trips =
                    Number.isFinite(
                      rawTrips
                    )
                      ? rawTrips
                      : 0

                  /* ===============================
                     EXPERIENCE
                  =============================== */

                  const experience =
                    guide?.experience ??
                    guide?.experience_years ??
                    null

                  /* ===============================
                     STATUS
                  =============================== */

                  const isOffline =
                    guide?.status ===
                    'offline'

                  /* ===============================
                     SPECIALTIES
                  =============================== */

                  const specialties =
                    Array.isArray(
                      guide?.specialties
                    )
                      ? guide.specialties
                      : Array.isArray(
                          guide?.categories
                        )
                        ? guide.categories
                        : guide?.category
                          ? [
                              guide.category,
                            ]
                          : []

                  return (
                    <article
                      key={
                        guideId ??
                        `guide-${index}`
                      }
                      className="guide-card"
                      style={{
                        animationDelay: `${Math.min(
                          index * 70,
                          500
                        )}ms`,
                      }}
                    >
                      {/* ==============================
                          IMAGE
                      ============================== */}

                      <div className="guide-card-image">
                        <Link
                          to={
                            guideId !==
                              null &&
                            guideId !==
                              undefined
                              ? `/guide/${guideId}`
                              : '#'
                          }
                          aria-label={`Lihat detail ${
                            guide?.name ||
                            'pemandu wisata'
                          }`}
                          onClick={(
                            event
                          ) => {
                            if (
                              guideId ===
                                null ||
                              guideId ===
                                undefined
                            ) {
                              event.preventDefault()
                            }
                          }}
                        >
                          <img
                            src={
                              avatar
                            }
                            alt={
                              guide?.name ||
                              'Pemandu wisata'
                            }
                            loading="lazy"
                            onError={(
                              event
                            ) => {
                              if (
                                event
                                  .currentTarget
                                  .src !==
                                FALLBACK_AVATAR
                              ) {
                                event
                                  .currentTarget
                                  .src =
                                  FALLBACK_AVATAR
                              }
                            }}
                          />

                          <div className="guide-image-overlay" />
                        </Link>

                        {/* MATCH SCORE */}

                        {Number(
                          guide?.matchScore
                        ) > 0 && (
                          <div className="guide-match-badge">
                            <Sparkles
                              size={12}
                            />

                            <span>
                              {
                                guide.matchScore
                              }%{' '}
                              cocok untukmu
                            </span>
                          </div>
                        )}

                        {/* FAVORITE */}

                        <button
                          type="button"
                          className={`guide-favorite ${
                            favorite
                              ? 'active'
                              : ''
                          }`}
                          onClick={(
                            event
                          ) =>
                            handleToggleFavorite(
                              event,
                              guide
                            )
                          }
                          aria-label={
                            favorite
                              ? 'Hapus dari favorit'
                              : 'Tambah ke favorit'
                          }
                          aria-pressed={
                            favorite
                          }
                        >
                          <Heart
                            size={19}
                            fill={
                              favorite
                                ? 'currentColor'
                                : 'none'
                            }
                          />
                        </button>

                        {/* STATUS */}

                        <div
                          className={`guide-status ${
                            isOffline
                              ? 'offline'
                              : ''
                          }`}
                        >
                          <span />

                          {isOffline
                            ? 'Sedang Offline'
                            : 'Tersedia'}
                        </div>
                      </div>

                      {/* ==============================
                          BODY
                      ============================== */}

                      <div className="guide-card-body">
                        {/* NAME */}

                        <div className="guide-card-title-row">
                          <div className="guide-name-wrapper">
                            <h3>
                              {guide?.name ||
                                'Pemandu Wisata'}
                            </h3>

                            {guide?.verified && (
                              <BadgeCheck
                                size={18}
                                className="guide-verified-icon"
                              />
                            )}
                          </div>

                          {/* RATING */}

                          <div className="guide-rating">
                            <Star
                              size={15}
                              fill="currentColor"
                            />

                            <span>
                              {rating >
                              0
                                ? rating.toFixed(
                                    1
                                  )
                                : '5.0'}
                            </span>
                          </div>
                        </div>

                        {/* LOCATION */}

                        <div className="guide-location">
                          <MapPin
                            size={15}
                          />

                          <span>
                            {city}
                          </span>

                          {guide?.distanceKm !==
                            null &&
                            guide?.distanceKm !==
                              undefined && (
                              <>
                                <span className="location-dot">
                                  •
                                </span>

                                <small>
                                  {formatDistance(
                                    guide.distanceKm
                                  )}
                                </small>
                              </>
                            )}
                        </div>

                        {/* SPECIALTIES */}

                        {specialties.length >
                          0 && (
                          <div className="guide-specialties">
                            {specialties
                              .slice(
                                0,
                                3
                              )
                              .map(
                                (
                                  item,
                                  specialtyIndex
                                ) => (
                                  <span
                                    key={`${String(
                                      item
                                    )}-${specialtyIndex}`}
                                  >
                                    {String(
                                      item
                                    )}
                                  </span>
                                )
                              )}
                          </div>
                        )}

                        {/* INFO */}

                        <div className="guide-info-row">
                          {/* EXPERIENCE */}

                          <div>
                            <Clock
                              size={15}
                            />

                            <div>
                              <span>
                                Pengalaman
                              </span>

                              <strong>
                                {experience !==
                                  null &&
                                experience !==
                                  undefined &&
                                experience !==
                                  ''
                                  ? `${experience} tahun`
                                  : 'Berpengalaman'}
                              </strong>
                            </div>
                          </div>

                          {/* TRIPS */}

                          <div>
                            <Navigation
                              size={15}
                            />

                            <div>
                              <span>
                                Perjalanan
                              </span>

                              <strong>
                                {trips}+
                              </strong>
                            </div>
                          </div>
                        </div>

                        {/* FOOTER */}

                        <div className="guide-card-footer">
                          <div className="guide-price">
                            <span>
                              Mulai dari
                            </span>

                            <strong>
                              Rp{' '}
                              {price.toLocaleString(
                                'id-ID'
                              )}

                              <small>
                                /{guide.priceUnit === 'trip' ? 'trip' : 'hari'}
                              </small>
                            </strong>
                          </div>

                          <Link
                            to={
                              guideId !==
                                null &&
                              guideId !==
                                undefined
                                ? `/guide/${guideId}`
                                : '#'
                            }
                            className="guide-detail-button"
                            onClick={(
                              event
                            ) => {
                              if (
                                guideId ===
                                  null ||
                                guideId ===
                                  undefined
                              ) {
                                event.preventDefault()
                              }
                            }}
                          >
                            Detail

                            <ArrowUpRight
                              size={15}
                            />
                          </Link>
                        </div>
                      </div>
                    </article>
                  )
                }
              )}
            </div>
          </main>
        )}
    </div>
  )
}
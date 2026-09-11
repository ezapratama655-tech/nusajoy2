import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  Heart,
  Search,
  MapPin,
  Star,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  X,
  Gem,
  Wallet,
  Compass,
} from 'lucide-react'

import { supabase } from '../utils/supabaseClient'
import { getFavorites } from '../utils/favorites'

import '../styles/Favorite.css'

function Favorite() {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Semua')
  const [sortBy, setSortBy] = useState('recommended')

  /* =========================================
     FETCH FAVORITES
  ========================================= */

  useEffect(() => {
    let isMounted = true

    async function fetchFavorites() {
      try {
        if (isMounted) {
          setLoading(true)
          setError(null)
        }

        const favIds = getFavorites()

        /*
         * Tidak ada favorit
         */
        if (
          !Array.isArray(favIds) ||
          favIds.length === 0
        ) {
          if (isMounted) {
            setDestinations([])
            setLoading(false)
          }

          return
        }

        /*
         * Ambil destinasi berdasarkan ID favorit
         */
        const { data, error: supabaseError } =
          await supabase
            .from('destinations')
            .select('*')
            .in('id', favIds)

        if (supabaseError) {
          throw supabaseError
        }

        if (isMounted) {
          setDestinations(
            Array.isArray(data) ? data : []
          )
        }
      } catch (err) {
        console.error(
          'Failed to fetch favorites:',
          err
        )

        if (isMounted) {
          setError(
            'Destinasi favorit gagal dimuat.'
          )

          setDestinations([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchFavorites()

    return () => {
      isMounted = false
    }
  }, [])

  /* =========================================
     CATEGORIES
  ========================================= */

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        destinations
          .map((destination) => destination.category)
          .filter(Boolean)
      ),
    ]

    return ['Semua', ...uniqueCategories]
  }, [destinations])

  /* =========================================
     FILTER + SORT
  ========================================= */

  const filteredDestinations = useMemo(() => {
    let result = [...destinations]

    /*
     * SEARCH
     */
    if (search.trim()) {
      const keyword = search
        .trim()
        .toLowerCase()

      result = result.filter((destination) => {
        const searchableText = `
          ${destination.name || ''}
          ${destination.location || ''}
          ${destination.category || ''}
        `.toLowerCase()

        return searchableText.includes(keyword)
      })
    }

    /*
     * CATEGORY
     */
    if (category !== 'Semua') {
      result = result.filter(
        (destination) =>
          destination.category === category
      )
    }

    /*
     * SORT
     */
    if (sortBy === 'rating') {
      result.sort(
        (a, b) =>
          Number(b.rating || 0) -
          Number(a.rating || 0)
      )
    }

    if (sortBy === 'price-low') {
      result.sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      )
    }

    if (sortBy === 'price-high') {
      result.sort(
        (a, b) =>
          Number(b.price || 0) -
          Number(a.price || 0)
      )
    }

    return result
  }, [
    destinations,
    search,
    category,
    sortBy,
  ])

  /* =========================================
     STATISTICS
  ========================================= */

  const hiddenGemCount = destinations.filter(
    (destination) =>
      destination.is_hidden_gem === true
  ).length

  const averageRating =
    destinations.length > 0
      ? (
          destinations.reduce(
            (sum, destination) =>
              sum +
              Number(destination.rating || 0),
            0
          ) / destinations.length
        ).toFixed(1)
      : '0.0'

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return <FavoriteSkeleton />
  }

  /* =========================================
     RENDER
  ========================================= */

  return (
    <main className="favorite-page">

      {/* =========================
          HERO
      ========================= */}

      <section className="favorite-hero">

        <div className="favorite-hero-glow" />

        <div className="favorite-container">

          <div className="favorite-eyebrow">
            <Heart
              size={14}
              fill="currentColor"
            />

            YOUR TRAVEL COLLECTION
          </div>

          <div className="favorite-hero-grid">

            <div className="favorite-hero-copy">

              <h1>
                Tempat yang
                <br />
                <span>
                  ingin kamu kunjungi.
                </span>
              </h1>

              <p>
                Semua destinasi yang menarik
                perhatianmu, tersimpan di satu
                tempat. Pilih kembali, bandingkan,
                lalu mulai perjalananmu.
              </p>

              <div className="favorite-hero-actions">

                <Link
                  to="/explore"
                  className="favorite-primary-button"
                >
                  <Compass size={18} />

                  Cari destinasi lain

                  <ArrowRight size={17} />
                </Link>

              </div>

            </div>

            {/* VISUAL */}

            <div className="favorite-hero-visual">

              <div className="floating-card floating-card-one">

                <Heart
                  size={15}
                  fill="currentColor"
                />

                <span>
                  {destinations.length} tersimpan
                </span>

              </div>

              <div className="hero-orbit">

                <Heart size={58} />

              </div>

              <div className="floating-card floating-card-two">

                <Sparkles size={15} />

                <span>
                  My travel picks
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>

      <div className="favorite-container">

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="favorite-error">

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="retry-button"
            >
              Coba lagi
            </button>

          </div>
        )}

        {/* =========================
            STATS
        ========================= */}

        {destinations.length > 0 && (
          <section className="favorite-stats">

            <div className="stat-card">

              <div className="stat-icon">
                <Heart
                  size={18}
                  fill="currentColor"
                />
              </div>

              <div>
                <strong>
                  {destinations.length}
                </strong>

                <span>
                  Destinasi tersimpan
                </span>
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon">
                <Gem size={18} />
              </div>

              <div>
                <strong>
                  {hiddenGemCount}
                </strong>

                <span>
                  Hidden gems
                </span>
              </div>

            </div>

            <div className="stat-card">

              <div className="stat-icon">
                <Star
                  size={18}
                  fill="currentColor"
                />
              </div>

              <div>
                <strong>
                  {averageRating}
                </strong>

                <span>
                  Rata-rata rating
                </span>
              </div>

            </div>

          </section>
        )}

        {/* =========================
            TITLE
        ========================= */}

        <section className="favorite-heading">

          <div>

            <span className="section-label">
              SAVED FOR LATER
            </span>

            <h2>
              Koleksi favoritmu
              <span>.</span>
            </h2>

            <p>
              Tempat-tempat yang membuatmu
              berkata, "Suatu hari aku harus
              ke sini."
            </p>

          </div>

        </section>

        {/* =========================
            SEARCH + FILTER
        ========================= */}

        {destinations.length > 0 && (
          <section className="favorite-toolbar">

            <div className="favorite-search">

              <Search size={18} />

              <input
                type="text"
                placeholder="Cari destinasi favorit..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch('')
                  }
                  className="clear-search"
                  aria-label="Hapus pencarian"
                >
                  <X size={16} />
                </button>
              )}

            </div>

            <div className="favorite-sort">

              <SlidersHorizontal size={17} />

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
                aria-label="Urutkan destinasi"
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

                <option value="price-high">
                  Harga tertinggi
                </option>

              </select>

            </div>

          </section>
        )}

        {/* =========================
            CATEGORY
        ========================= */}

        {destinations.length > 0 && (
          <div className="category-scroll">

            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={`category-chip ${
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
            ))}

          </div>
        )}

        {/* =========================
            CONTENT
        ========================= */}

        {destinations.length === 0 ? (

          <EmptyFavorites />

        ) : filteredDestinations.length === 0 ? (

          <NoSearchResult
            onReset={() => {
              setSearch('')
              setCategory('Semua')
            }}
          />

        ) : (

          <section className="favorite-grid">

            {filteredDestinations.map(
              (destination, index) => (
                <FavoriteCard
                  key={destination.id}
                  destination={destination}
                  index={index}
                />
              )
            )}

          </section>

        )}

        {/* =========================
            BOTTOM CTA
        ========================= */}

        {destinations.length > 0 && (
          <section className="favorite-bottom-cta">

            <div className="cta-decoration">
              <Sparkles size={22} />
            </div>

            <div>

              <span className="section-label">
                KEEP EXPLORING
              </span>

              <h2>
                Favoritmu baru permulaan.
              </h2>

              <p>
                Masih banyak pengalaman lokal
                yang mungkin belum kamu temukan.
              </p>

            </div>

            <Link
              to="/explore"
              className="cta-button"
            >
              Jelajahi destinasi
              <ArrowRight size={17} />
            </Link>

          </section>
        )}

      </div>

    </main>
  )
}


/* ==========================================
   FAVORITE CARD
========================================== */

function FavoriteCard({
  destination,
  index,
}) {
  const rating = Number(
    destination.rating || 0
  )

  const price =
    destination.price !== null &&
    destination.price !== undefined
      ? `Rp${Number(
          destination.price
        ).toLocaleString('id-ID')}`
      : 'Harga tersedia di detail'

  const image =
    destination.image_url ||
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900&auto=format&fit=crop&q=80'

  return (
    <Link
      to={`/destination/${destination.id}`}
      className="favorite-card"
      style={{
        '--delay': `${index * 70}ms`,
      }}
    >

      {/* IMAGE */}

      <div className="favorite-image-wrapper">

        <img
          src={image}
          alt={
            destination.name ||
            'Destinasi wisata'
          }
          className="favorite-image"
          loading="lazy"
        />

        <div className="image-overlay" />

        {/* HIDDEN GEM */}

        {destination.is_hidden_gem && (
          <span className="gem-badge">

            <Gem size={13} />

            Hidden Gem

          </span>
        )}

        {/* FAVORITE */}

        <span className="favorite-heart">

          <Heart
            size={17}
            fill="currentColor"
          />

        </span>

        {/* RATING */}

        {rating > 0 && (
          <span className="rating-badge">

            <Star
              size={13}
              fill="currentColor"
            />

            {rating.toFixed(1)}

          </span>
        )}

      </div>

      {/* CONTENT */}

      <div className="favorite-card-content">

        <div className="favorite-location">

          <MapPin size={14} />

          <span>
            {destination.location ||
              'Indonesia'}
          </span>

        </div>

        <h3>
          {destination.name ||
            'Destinasi wisata'}
        </h3>

        {destination.description && (
          <p className="favorite-description">
            {destination.description}
          </p>
        )}

        <div className="favorite-meta">

          {destination.category && (
            <span className="category-label">
              {destination.category}
            </span>
          )}

          <span className="price-label">

            <Wallet size={13} />

            {price}

          </span>

        </div>

        <div className="favorite-detail-button">

          <span>
            Lihat perjalanan
          </span>

          <span className="detail-arrow">

            <ArrowRight size={16} />

          </span>

        </div>

      </div>

    </Link>
  )
}


/* ==========================================
   EMPTY FAVORITES
========================================== */

function EmptyFavorites() {
  return (
    <section className="empty-favorites">

      <div className="empty-visual">

        <div className="empty-ring ring-one" />
        <div className="empty-ring ring-two" />

        <div className="empty-heart">
          <Heart size={42} />
        </div>

      </div>

      <span className="section-label">
        YOUR COLLECTION IS WAITING
      </span>

      <h2>
        Belum ada tempat
        <br />
        yang kamu simpan.
      </h2>

      <p>
        Temukan destinasi yang menarik
        perhatianmu dan simpan untuk
        perjalanan berikutnya.
      </p>

      <Link
        to="/explore"
        className="favorite-primary-button"
      >

        <Compass size={18} />

        Mulai eksplorasi

        <ArrowRight size={17} />

      </Link>

    </section>
  )
}


/* ==========================================
   NO SEARCH RESULT
========================================== */

function NoSearchResult({ onReset }) {
  return (
    <div className="no-result">

      <Search size={32} />

      <h3>
        Destinasi tidak ditemukan
      </h3>

      <p>
        Coba gunakan kata kunci atau
        kategori lain.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="reset-filter-button"
      >
        Reset filter
      </button>

    </div>
  )
}


/* ==========================================
   SKELETON
========================================== */

function FavoriteSkeleton() {
  return (
    <main className="favorite-page">

      <section className="favorite-hero skeleton-hero">

        <div className="favorite-container">

          <div className="skeleton skeleton-small" />

          <div className="skeleton skeleton-title" />

          <div className="skeleton skeleton-text" />

        </div>

      </section>

      <div className="favorite-container">

        <div className="skeleton-stats">

          <div className="skeleton skeleton-stat" />
          <div className="skeleton skeleton-stat" />
          <div className="skeleton skeleton-stat" />

        </div>

        <div className="favorite-grid">

          {[1, 2, 3, 4].map((item) => (

            <div
              key={item}
              className="skeleton-card"
            >

              <div className="skeleton skeleton-image" />

              <div className="skeleton-content">

                <div className="skeleton skeleton-line" />

                <div className="skeleton skeleton-line large" />

                <div className="skeleton skeleton-line" />

              </div>

            </div>

          ))}

        </div>

      </div>

    </main>
  )
}

export default Favorite
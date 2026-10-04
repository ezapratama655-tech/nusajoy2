import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Heart,
  Star,
  MapPin,
  Clock3,
  Sparkles,
  ArrowRight,
  Grid2X2,
  List,
  X,
  Flame,
  Compass,
  MapPinned,
  Utensils,
  Trees,
  Landmark,
  GraduationCap,
  ChevronDown,
  Share2,
  Navigation,
  Eye,
  SlidersHorizontal,
  RefreshCw,
  Check,
  Gem,
  Users,
} from 'lucide-react'

import { supabase } from '../utils/supabaseClient'
import '../styles/Explore.css'

const FAVORITES_KEY = 'nusaJoyFavorites'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80'

const CITY_OPTIONS = [
  'Semua',
  'Yogyakarta',
  'Bali',
  'Bandung',
  'Lombok',
  'Semarang',
]

const CATEGORY_PRESETS = [
  {
    id: 'all',
    label: 'Semua',
    icon: Compass,
    matches: () => true,
  },
  {
    id: 'kuliner',
    label: 'Kuliner Tradisi',
    icon: Utensils,
    matches: (value) =>
      /kuliner|makanan|kopi|dapur|tradisi/i.test(value),
  },
  {
    id: 'teduh',
    label: 'Wisata Teduh',
    icon: Trees,
    matches: (value) =>
      /alam|teduh|perkebunan|kebun|danau|air terjun|pantai|bahari|pulau|hiking|bukit/i.test(
        value
      ),
  },
  {
    id: 'kriya',
    label: 'Lokakarya Kriya',
    icon: Landmark,
    matches: (value) =>
      /kriya|keramik|gerabah|tenun|batik|kerajinan|workshop/i.test(value),
  },
  {
    id: 'walking',
    label: 'Walking Tour',
    icon: GraduationCap,
    matches: (value) =>
      /walking|sejarah|heritage|gang|keraton|tour|narasi|budaya/i.test(value),
  },
]

const SORT_OPTIONS = [
  { value: 'match', label: 'Paling Cocok (Rekomendasi)' },
  { value: 'rating', label: 'Rating tertinggi' },
  { value: 'popular', label: 'Paling populer' },
  { value: 'price-low', label: 'Harga terendah' },
  { value: 'price-high', label: 'Harga tertinggi' },
  { value: 'duration', label: 'Durasi terpendek' },
]

function normalize(value) {
  return String(value || '').trim().toLowerCase()
}

function buildSearchableText(dest) {
  return [
    dest?.name,
    dest?.title,
    dest?.location,
    dest?.city,
    dest?.province,
    dest?.category,
    dest?.description,
    dest?.short_description,
    dest?.address,
    ...(Array.isArray(dest?.activities) ? dest.activities : []),
    ...(Array.isArray(dest?.tags) ? dest.tags : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function getDestinationCity(dest) {
  if (dest?.city) return String(dest.city)

  const location = String(dest?.location || '')
  const cityHit = CITY_OPTIONS.find(
    (city) => city !== 'Semua' && normalize(location).includes(normalize(city))
  )

  if (cityHit) return cityHit

  return location.split(',')[0]?.trim() || 'Indonesia'
}

function getCategoryLabel(categoryName) {
  const raw = String(categoryName || '').trim()

  if (!raw) return 'Pengalaman Lokal'

  const exact = CATEGORY_PRESETS.find(
    (item) => item.id !== 'all' && item.label.toLowerCase() === raw.toLowerCase()
  )

  if (exact) return exact.label

  if (/kuliner|makanan|kopi|dapur/i.test(raw)) return 'Kuliner Tradisi'
  if (/kriya|keramik|gerabah|tenun|batik|kerajinan/i.test(raw)) {
    return 'Lokakarya Kriya'
  }
  if (/walking|sejarah|heritage|budaya|tour/i.test(raw)) return 'Walking Tour'
  if (/alam|teduh|danau|pantai|air terjun|bahari|pulau|bukit|hiking/i.test(raw)) {
    return 'Wisata Teduh'
  }

  return raw
}

function getCategoryIcon(categoryName) {
  const label = getCategoryLabel(categoryName)

  if (label === 'Kuliner Tradisi') return Utensils
  if (label === 'Wisata Teduh') return Trees
  if (label === 'Lokakarya Kriya') return Landmark
  if (label === 'Walking Tour') return GraduationCap

  return Compass
}

function matchesCategory(dest, categoryId) {
  if (categoryId === 'all') return true

  const text = [
    dest?.category,
    dest?.name,
    dest?.description,
    ...(Array.isArray(dest?.activities) ? dest.activities : []),
    ...(Array.isArray(dest?.tags) ? dest.tags : []),
  ]
    .filter(Boolean)
    .join(' ')

  const preset = CATEGORY_PRESETS.find((item) => item.id === categoryId)

  return preset ? preset.matches(text) : true
}

function getExploreMatchScore(dest, search = '', categoryId = 'all', city = 'Semua') {
  const rating = Number(dest?.rating || 0)
  const reviewCount = Number(dest?.review_count || dest?.reviews || 0)
  const hiddenGemScore = Number(dest?.hidden_gem_score || 0)

  let score =
    rating * 18 +
    Math.min(reviewCount / 20, 10) +
    Math.min(hiddenGemScore / 10, 10)

  if (dest?.matchScore != null) {
    score = Number(dest.matchScore)
  }

  if (dest?.recommendationScore != null) {
    score = Number(dest.recommendationScore)
  }

  if (search.trim() && buildSearchableText(dest).includes(normalize(search))) {
    score += 8
  }

  if (categoryId !== 'all' && matchesCategory(dest, categoryId)) {
    score += 9
  }

  if (
    city !== 'Semua' &&
    normalize(buildSearchableText(dest)).includes(normalize(city))
  ) {
    score += 8
  }

  return Math.max(0, Math.min(Math.round(score), 99))
}

function Explore({ uiState = 'normal', onRetry }) {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [city, setCity] = useState('Semua')
  const [sortBy, setSortBy] = useState('match')
  const [viewMode, setViewMode] = useState('grid')
  const [showHiddenGem, setShowHiddenGem] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [showMobileTools, setShowMobileTools] = useState(false)
  const [selectedDestination, setSelectedDestination] = useState(null)

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_KEY)
      const parsed = saved ? JSON.parse(saved) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  const [visibleCount, setVisibleCount] = useState(12)
  const [shareMessage, setShareMessage] = useState('')
  const [savedFeedbackMap, setSavedFeedbackMap] = useState({})

  useEffect(() => {
    let active = true

    async function fetchDestinations() {
      setLoading(true)
      setErrorMsg('')

      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('rating', { ascending: false })

      if (!active) return

      if (error) {
        setErrorMsg(error.message)
        setDestinations([])
      } else {
        setDestinations(Array.isArray(data) ? data : [])
      }

      setLoading(false)
    }

    fetchDestinations()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    } catch {
      // Ignore storage failures so Explore remains usable.
    }
  }, [favorites])

  useEffect(() => {
    function handleEscape(event) {
      if (event.key !== 'Escape') return

      setSelectedDestination(null)
      setShowSort(false)
      setShowMobileTools(false)
    }

    window.addEventListener('keydown', handleEscape)

    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  useEffect(() => {
    if (!selectedDestination) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [selectedDestination])

  const filteredDestinations = useMemo(() => {
    const keyword = normalize(search)

    let result = destinations.filter((dest) => {
      const searchableText = buildSearchableText(dest)

      const matchesSearch =
        !keyword || searchableText.includes(keyword)

      const matchesCity =
        city === 'Semua' ||
        normalize(searchableText).includes(normalize(city))

      const matchesCategory =
        category === 'all' || matchesCategoryAlias(dest, category)

      const matchesHiddenGem =
        !showHiddenGem || dest?.is_hidden_gem === true

      return (
        matchesSearch &&
        matchesCity &&
        matchesCategory &&
        matchesHiddenGem
      )
    })

    result = result.map((dest) => ({
      ...dest,
      exploreMatchScore: getExploreMatchScore(
        dest,
        search,
        category,
        city
      ),
    }))

    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
        break

      case 'popular':
        result.sort(
          (a, b) =>
            Number(b.review_count || b.reviews || 0) -
            Number(a.review_count || a.reviews || 0)
        )
        break

      case 'price-low':
        result.sort(
          (a, b) => Number(a.price || 0) - Number(b.price || 0)
        )
        break

      case 'price-high':
        result.sort(
          (a, b) => Number(b.price || 0) - Number(a.price || 0)
        )
        break

      case 'duration':
        result.sort(
          (a, b) => Number(a.duration || 0) - Number(b.duration || 0)
        )
        break

      case 'match':
      default:
        result.sort((a, b) => {
          const scoreDiff =
            Number(b.exploreMatchScore || 0) -
            Number(a.exploreMatchScore || 0)

          if (scoreDiff !== 0) return scoreDiff

          return Number(b.rating || 0) - Number(a.rating || 0)
        })
        break
    }

    return result
  }, [destinations, search, category, city, showHiddenGem, sortBy])

  const visibleDestinations = filteredDestinations.slice(0, visibleCount)

  const popularDestinations = useMemo(
    () =>
      [...destinations]
        .sort((a, b) => {
          const ratingDiff = Number(b.rating || 0) - Number(a.rating || 0)

          if (ratingDiff !== 0) return ratingDiff

          return (
            Number(b.review_count || b.reviews || 0) -
            Number(a.review_count || a.reviews || 0)
          )
        })
        .slice(0, 6),
    [destinations]
  )

  const hiddenGemDestinations = useMemo(
    () =>
      destinations
        .filter((item) => item.is_hidden_gem === true)
        .sort(
          (a, b) =>
            Number(b.rating || 0) - Number(a.rating || 0)
        )
        .slice(0, 6),
    [destinations]
  )

  const stats = useMemo(() => {
    const hidden = destinations.filter(
      (item) => item.is_hidden_gem === true
    ).length

    const rating =
      destinations.length > 0
        ? (
            destinations.reduce(
              (sum, item) => sum + Number(item.rating || 0),
              0
            ) / destinations.length
          ).toFixed(1)
        : '0.0'

    const categoryLabels = new Set(
      destinations
        .map((item) => getCategoryLabel(item?.category))
        .filter(Boolean)
    )

    return {
      total: destinations.length,
      hidden,
      rating,
      categories: categoryLabels.size,
    }
  }, [destinations])

  const activeFilterCount =
    (category !== 'all' ? 1 : 0) +
    (city !== 'Semua' ? 1 : 0) +
    (showHiddenGem ? 1 : 0) +
    (search.trim() ? 1 : 0)

  const activeCategoryLabel =
    category === 'all'
      ? 'Semua'
      : CATEGORY_PRESETS.find((item) => item.id === category)?.label ||
        'Semua'

  const activeSortLabel =
    SORT_OPTIONS.find((item) => item.value === sortBy)?.label ||
    SORT_OPTIONS[0].label

  const effectiveUiState =
    uiState !== 'normal'
      ? uiState
      : loading
        ? 'loading'
        : errorMsg
          ? 'error'
          : 'normal'

  function matchesCategoryAlias(dest, categoryId) {
    return matchesCategory(dest, categoryId)
  }

  function toggleFavorite(id) {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    )
  }

  function isFavorite(id) {
    return favorites.includes(id)
  }

  function handleSave(dest) {
    toggleFavorite(dest.id)

    setSavedFeedbackMap((current) => ({
      ...current,
      [dest.id]: true,
    }))

    window.setTimeout(() => {
      setSavedFeedbackMap((current) => ({
        ...current,
        [dest.id]: false,
      }))
    }, 1800)
  }

  function resetExplore() {
    setSearch('')
    setCategory('all')
    setCity('Semua')
    setShowHiddenGem(false)
    setSortBy('match')
    setViewMode('grid')
    setShowSort(false)
    setShowMobileTools(false)
  }

  function handleImageError(event) {
    if (event.currentTarget.src !== FALLBACK_IMAGE) {
      event.currentTarget.src = FALLBACK_IMAGE
    }
  }

  async function handleShare(dest) {
    const url = `${window.location.origin}/destination/${dest.id}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: dest.name,
          text: `Lihat ${dest.name} di NuSaJoy`,
          url,
        })
        return
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        setShareMessage('Link destinasi berhasil disalin!')
        window.setTimeout(() => setShareMessage(''), 2200)
      }
    } catch {
      // User may cancel native sharing.
    }
  }

  function openMap(dest) {
    const query = encodeURIComponent(
      [dest?.name, dest?.location, dest?.city]
        .filter(Boolean)
        .join(', ')
    )

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  function getDestinationTitle(dest) {
    return dest?.name || dest?.title || 'Destinasi tanpa nama'
  }

  function getDestinationImage(dest) {
    return dest?.image_url || dest?.image || FALLBACK_IMAGE
  }

  function getDurationText(dest) {
    if (dest?.durationText) return dest.durationText
    if (dest?.duration) return `${dest.duration} jam`
    return 'Fleksibel'
  }

  function getPriceText(dest) {
    const numericPrice = Number(dest?.price || 0)

    return numericPrice === 0
      ? 'Gratis'
      : `Rp${numericPrice.toLocaleString('id-ID')}`
  }

  function getGuestsText(dest) {
    if (dest?.maxGuests) return `Maks. ${dest.maxGuests} tamu`
    if (dest?.review_count || dest?.reviews) {
      return `${dest.review_count || dest.reviews} ulasan`
    }
    return 'Pengalaman lokal'
  }

  function renderDestinationCard(dest, index) {
    const favorite = isFavorite(dest.id)
    const title = getDestinationTitle(dest)
    const cityLabel = getDestinationCity(dest)
    const categoryLabel = getCategoryLabel(dest.category)
    const Icon = getCategoryIcon(dest.category)
    const score = Number(dest.exploreMatchScore || 0)

    return (
      <article
        className={`destination-card ${
          viewMode === 'list' ? 'list-card' : ''
        } ${index === 0 && sortBy === 'match' ? 'is-top-match' : ''}`}
        key={dest.id}
        style={{ '--card-index': index }}
      >
        <div className="destination-media">
          <Link
            to={`/destination/${dest.id}`}
            className="destination-image-link"
            aria-label={`Lihat ${title}`}
          >
            <img
              src={getDestinationImage(dest)}
              alt={title}
              onError={handleImageError}
              loading="lazy"
            />
            <div className="image-gradient" />
          </Link>

          <div className="media-top">
            <div className="media-top-left">
              {dest.is_hidden_gem && (
                <span className="gem-badge">
                  <Sparkles size={12} />
                  Hidden Gem
                </span>
              )}

              {index === 0 && sortBy === 'match' && (
                <span className="top-match-badge">
                  <Sparkles size={12} />
                  Pilihan teratas
                </span>
              )}
            </div>

            <button
              type="button"
              className={`icon-button favorite-button ${
                favorite ? 'liked' : ''
              }`}
              onClick={() => handleSave(dest)}
              aria-label={
                favorite
                  ? 'Hapus dari favorit'
                  : 'Tambah ke favorit'
              }
              title={
                favorite
                  ? 'Hapus dari favorit'
                  : 'Simpan favorit'
              }
            >
              <Heart
                size={17}
                fill={favorite ? 'currentColor' : 'none'}
              />
            </button>
          </div>

          <div className="media-bottom">
            <span className="rating-pill">
              <Star size={12} fill="currentColor" />
              {Number(dest.rating || 0).toFixed(1)}
              <span>·</span>
              {cityLabel}
            </span>

            <div className="media-bottom-actions">
              <span className="match-badge">
                <Sparkles size={12} />
                {score || Number(dest.matchScore || 0) || 95}% Cocok
              </span>

              <button
                type="button"
                className="quick-view-button"
                onClick={() => setSelectedDestination(dest)}
              >
                <Eye size={13} />
                Quick view
              </button>
            </div>
          </div>
        </div>

        <div className="destination-content">
          <div className="destination-heading-row">
            <span className="destination-category">
              <Icon size={13} />
              {categoryLabel}
            </span>

            {Number(dest.rating || 0) >= 4.8 && (
              <span className="top-rated">
                <Flame size={11} />
                Top rated
              </span>
            )}
          </div>

          <Link
            to={`/destination/${dest.id}`}
            className="destination-title"
          >
            {title}
          </Link>

          <div className="destination-location">
            <MapPin size={13} />
            <span>{dest.location || cityLabel || 'Indonesia'}</span>
          </div>

          {dest.description && (
            <p className="destination-description">
              {dest.description}
            </p>
          )}

          <div className="destination-meta">
            <span>
              <Clock3 size={13} />
              {getDurationText(dest)}
            </span>

            {dest.travel_time_from_city && (
              <span>
                <MapPinned size={13} />
                {dest.travel_time_from_city}
              </span>
            )}

            <span>
              <Users size={13} />
              {getGuestsText(dest)}
            </span>
          </div>

          <div className="destination-footer">
            <div className="destination-price">
              <small>Mulai dari</small>
              <strong>{getPriceText(dest)}</strong>
            </div>

            <div className="card-actions">
              <button
                type="button"
                className="mini-action"
                onClick={() => handleShare(dest)}
                aria-label={`Bagikan ${title}`}
                title="Bagikan"
              >
                <Share2 size={14} />
              </button>

              <button
                type="button"
                className="mini-action"
                onClick={() => openMap(dest)}
                aria-label={`Buka lokasi ${title}`}
                title="Lihat di peta"
              >
                <Navigation size={14} />
              </button>

              <Link
                to={`/destination/${dest.id}`}
                className="detail-button"
              >
                Jelajahi
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {savedFeedbackMap[dest.id] && (
            <div className="saved-feedback">
              <Check size={12} />
              {favorite ? 'Disimpan ke favorit' : 'Dihapus dari favorit'}
            </div>
          )}
        </div>
      </article>
    )
  }

  function renderLoadingState() {
    return (
      <main className="explore-page">
        <div className="explore-container">
          <div className="loading-header">
            <div className="skeleton skeleton-eyebrow" />
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-subtitle" />
          </div>

          <div className="skeleton skeleton-search" />

          <div className="skeleton-category-row">
            {[1, 2, 3, 4, 5].map((item) => (
              <div className="skeleton skeleton-chip" key={item} />
            ))}
          </div>

          <div className="skeleton-grid">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div className="skeleton-card" key={item}>
                <div className="skeleton skeleton-image" />
                <div className="skeleton-content">
                  <div className="skeleton skeleton-line large" />
                  <div className="skeleton skeleton-line" />
                  <div className="skeleton skeleton-line small" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  function renderErrorState() {
    return (
      <main className="explore-page">
        <div className="explore-container">
          <div className="explore-error">
            <div className="error-icon">
              <RefreshCw size={24} />
            </div>

            <span className="section-kicker">SYNC ERROR</span>
            <h2>Gagal Memuat Katalog Jelajah</h2>
            <p>
              Terjadi kendala saat menyinkronkan daftar pengalaman lokal
              terkini.
            </p>

            {errorMsg && (
              <details className="error-details">
                <summary>Detail teknis</summary>
                <span>{errorMsg}</span>
              </details>
            )}

            <button
              type="button"
              className="primary-button"
              onClick={() => {
                if (typeof onRetry === 'function') {
                  onRetry()
                } else {
                  window.location.reload()
                }
              }}
            >
              <RefreshCw size={15} />
              Coba Muat Ulang
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (effectiveUiState === 'loading') {
    return renderLoadingState()
  }

  if (effectiveUiState === 'error') {
    return renderErrorState()
  }

  return (
    <main className="explore-page">
      <div className="explore-container">
        <section className="explore-intro">
          <div className="intro-main">
            <span className="hero-eyebrow">
              <Sparkles size={13} />
              Eksplorasi Kurasi
            </span>

            <h1>Jelajah Pengalaman Lokal</h1>

            <p>
              Menampilkan {filteredDestinations.length} aktivitas autentik
              bersama warga dan pemandu lokal.
            </p>
          </div>

          <div className="intro-side">
            <span className="intro-side-icon">
              <Compass size={19} />
            </span>

            <div>
              <strong>Explore your way</strong>
              <span>
                Pilih mood, kota, atau langsung cari pengalaman yang kamu mau.
              </span>
            </div>
          </div>
        </section>

        <section className="search-section">
          <div className="search-box">
            <Search size={19} className="search-icon" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama desa, pemandu, aktivitas kriya, atau kuliner..."
              aria-label="Cari destinasi, kota, atau kategori"
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearch('')}
                aria-label="Hapus pencarian"
              >
                <X size={15} />
              </button>
            )}

            <div className="search-count">
              {stats.total} tersedia
            </div>
          </div>

          <div className="search-helper">
            <span>
              <MapPinned size={13} />
              Kurasi lokal Indonesia
            </span>

            <Link to="/rekomendasi" className="recommend-link">
              Bingung memilih?
              <ArrowRight size={13} />
            </Link>
          </div>
        </section>

        <section className="explore-stats" aria-label="Ringkasan Explore">
          <div className="stat-card">
            <span className="stat-icon">
              <Compass size={16} />
            </span>
            <div>
              <strong>{stats.total}</strong>
              <small>Destinasi</small>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">
              <Gem size={16} />
            </span>
            <div>
              <strong>{stats.hidden}</strong>
              <small>Hidden gems</small>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">
              <Star size={16} fill="currentColor" />
            </span>
            <div>
              <strong>{stats.rating}</strong>
              <small>Rating rata-rata</small>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">
              <Grid2X2 size={16} />
            </span>
            <div>
              <strong>{stats.categories}</strong>
              <small>Kategori</small>
            </div>
          </div>
        </section>

        <section className="filter-rail">
          <div className="section-heading compact">
            <div>
              <span className="section-kicker">DISCOVER BY MOOD</span>
              <h2>Eksplor sesuai mood</h2>
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                className="reset-inline"
                onClick={resetExplore}
              >
                <RefreshCw size={13} />
                Reset
              </button>
            )}
          </div>

          <div className="category-city-layout">
            <div className="category-scroll">
              {CATEGORY_PRESETS.map((item) => {
                const active = category === item.id && !showHiddenGem
                const Icon = item.icon

                return (
                  <button
                    type="button"
                    key={item.id}
                    className={`category-chip ${
                      active ? 'active' : ''
                    }`}
                    onClick={() => {
                      setCategory(item.id)
                      setShowHiddenGem(false)
                    }}
                  >
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </button>
                )
              })}

              <button
                type="button"
                className={`category-chip hidden-gem-chip ${
                  showHiddenGem ? 'active' : ''
                }`}
                onClick={() => {
                  setShowHiddenGem(true)
                  setCategory('all')
                }}
              >
                <Sparkles size={15} />
                <span>Hidden Gems</span>
              </button>
            </div>

            <div className="city-filter">
              <span className="city-label">Kota:</span>

              <div className="city-scroll">
                {CITY_OPTIONS.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={city === item ? 'active' : ''}
                    onClick={() => setCity(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {!search &&
          category === 'all' &&
          city === 'Semua' &&
          !showHiddenGem &&
          popularDestinations.length > 0 && (
            <section className="popular-section">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">TRENDING NOW</span>
                  <h2>Yang sedang dicari traveler</h2>
                  <p>
                    Inspirasi cepat sebelum kamu menentukan tujuan.
                  </p>
                </div>

                <div className="heading-icon">
                  <Flame size={18} />
                </div>
              </div>

              <div className="popular-scroll">
                {popularDestinations.map((dest, index) => (
                  <Link
                    to={`/destination/${dest.id}`}
                    className="popular-card"
                    key={dest.id}
                  >
                    <img
                      src={getDestinationImage(dest)}
                      alt={getDestinationTitle(dest)}
                      onError={handleImageError}
                      loading="lazy"
                    />

                    <div className="popular-overlay">
                      <span className="popular-number">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <div className="popular-content">
                        <span className="popular-category">
                          {getCategoryLabel(dest.category)}
                        </span>

                        <h3>{getDestinationTitle(dest)}</h3>

                        <span className="popular-location">
                          <MapPin size={11} />
                          {dest.location || 'Indonesia'}
                        </span>
                      </div>

                      <span className="popular-rating">
                        <Star size={11} fill="currentColor" />
                        {Number(dest.rating || 0).toFixed(1)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

        {!search &&
          category === 'all' &&
          city === 'Semua' &&
          !showHiddenGem &&
          hiddenGemDestinations.length > 0 && (
            <section className="hidden-section">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">HIDDEN GEM</span>
                  <h2>Tempat yang belum ramai</h2>
                  <p>
                    Lebih cocok untuk kamu yang suka menemukan sesuatu yang
                    berbeda.
                  </p>
                </div>

                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    setShowHiddenGem(true)
                    setCategory('all')
                    window.scrollTo({
                      top: 0,
                      behavior: 'smooth',
                    })
                  }}
                >
                  Lihat semua
                  <ArrowRight size={13} />
                </button>
              </div>

              <div className="mini-destination-scroll">
                {hiddenGemDestinations.map((dest) => (
                  <Link
                    to={`/destination/${dest.id}`}
                    className="mini-destination"
                    key={dest.id}
                  >
                    <img
                      src={getDestinationImage(dest)}
                      alt={getDestinationTitle(dest)}
                      onError={handleImageError}
                      loading="lazy"
                    />

                    <div>
                      <span>
                        <Sparkles size={10} />
                        Hidden Gem
                      </span>

                      <h3>{getDestinationTitle(dest)}</h3>

                      <small>
                        <MapPin size={10} />
                        {dest.location || 'Indonesia'}
                      </small>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

        <section className="results-section">
          <div className="results-toolbar">
            <div className="results-info">
              <span className="section-kicker">ALL DISCOVERIES</span>

              <h2>
                {showHiddenGem
                  ? 'Hidden Gems'
                  : category === 'all'
                    ? 'Semua Destinasi'
                    : activeCategoryLabel}
              </h2>

              <p>
                <strong>{filteredDestinations.length}</strong> tempat
                {search
                  ? ` ditemukan untuk "${search}"`
                  : ` · ${city === 'Semua' ? 'Semua kota' : city}`}
              </p>
            </div>

            <div className="toolbar-actions">
              <button
                type="button"
                className={`mobile-tools-button ${
                  activeFilterCount ? 'has-filter' : ''
                }`}
                onClick={() =>
                  setShowMobileTools((value) => !value)
                }
              >
                <SlidersHorizontal size={15} />
                Filter
                {activeFilterCount > 0 && <b>{activeFilterCount}</b>}
              </button>

              <div className="sort-wrapper">
                <button
                  type="button"
                  className="sort-button"
                  onClick={() => setShowSort((value) => !value)}
                  aria-expanded={showSort}
                >
                  <SlidersHorizontal size={14} />
                  <span>{activeSortLabel}</span>
                  <ChevronDown size={13} />
                </button>

                {showSort && (
                  <div className="sort-menu">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        className={
                          sortBy === option.value ? 'selected' : ''
                        }
                        onClick={() => {
                          setSortBy(option.value)
                          setShowSort(false)
                        }}
                      >
                        <span>{option.label}</span>
                        {sortBy === option.value && (
                          <Check size={14} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="view-toggle" aria-label="Mode tampilan">
                <button
                  type="button"
                  className={viewMode === 'grid' ? 'active' : ''}
                  onClick={() => setViewMode('grid')}
                  aria-label="Tampilan grid"
                >
                  <Grid2X2 size={15} />
                </button>

                <button
                  type="button"
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                  aria-label="Tampilan list"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {showMobileTools && (
            <div className="mobile-tools-panel">
              <div className="mobile-tools-title">
                <span>Filter Explore</span>

                <button
                  type="button"
                  onClick={() => setShowMobileTools(false)}
                  aria-label="Tutup filter"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="mobile-tool-group">
                <span>Kategori</span>

                <div className="mobile-tool-chips">
                  {CATEGORY_PRESETS.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      className={
                        category === item.id && !showHiddenGem
                          ? 'active'
                          : ''
                      }
                      onClick={() => {
                        setCategory(item.id)
                        setShowHiddenGem(false)
                      }}
                    >
                      {item.label}
                    </button>
                  ))}

                  <button
                    type="button"
                    className={showHiddenGem ? 'active' : ''}
                    onClick={() => {
                      setShowHiddenGem(true)
                      setCategory('all')
                    }}
                  >
                    ✨ Hidden Gem
                  </button>
                </div>
              </div>

              <div className="mobile-tool-group">
                <span>Kota</span>

                <div className="mobile-tool-chips">
                  {CITY_OPTIONS.map((item) => (
                    <button
                      type="button"
                      key={item}
                      className={city === item ? 'active' : ''}
                      onClick={() => setCity(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="mobile-reset"
                onClick={resetExplore}
              >
                <RefreshCw size={13} />
                Reset Explore
              </button>
            </div>
          )}

          {(search ||
            category !== 'all' ||
            city !== 'Semua' ||
            showHiddenGem) && (
            <div className="active-filters">
              {search && (
                <button type="button" onClick={() => setSearch('')}>
                  Search: {search}
                  <X size={12} />
                </button>
              )}

              {category !== 'all' && (
                <button
                  type="button"
                  onClick={() => setCategory('all')}
                >
                  {activeCategoryLabel}
                  <X size={12} />
                </button>
              )}

              {city !== 'Semua' && (
                <button
                  type="button"
                  onClick={() => setCity('Semua')}
                >
                  {city}
                  <X size={12} />
                </button>
              )}

              {showHiddenGem && (
                <button
                  type="button"
                  onClick={() => setShowHiddenGem(false)}
                >
                  ✨ Hidden Gem
                  <X size={12} />
                </button>
              )}

              <button
                type="button"
                className="reset-explore"
                onClick={resetExplore}
              >
                Reset
              </button>
            </div>
          )}

          {visibleDestinations.length === 0 ? (
            <div className="explore-empty">
              <div className="empty-illustration">
                <Search size={30} />
              </div>

              <span className="section-kicker">NO RESULT</span>

              <h3>Belum menemukan destinasi</h3>

              <p>
                Coba kata kunci lain, pilih kota berbeda, atau kembali ke
                semua destinasi untuk melihat lebih banyak pilihan.
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={resetExplore}
              >
                <Compass size={15} />
                Lihat Semua
              </button>
            </div>
          ) : (
            <>
              <div
                className={
                  viewMode === 'grid'
                    ? 'destination-grid'
                    : 'destination-list'
                }
              >
                {visibleDestinations.map((dest, index) =>
                  renderDestinationCard(dest, index)
                )}
              </div>

              {visibleCount < filteredDestinations.length && (
                <div className="load-more-wrap">
                  <button
                    type="button"
                    className="load-more-button"
                    onClick={() =>
                      setVisibleCount((count) => count + 8)
                    }
                  >
                    Muat lebih banyak
                    <ArrowRight size={14} />
                  </button>

                  <span>
                    Menampilkan {visibleDestinations.length} dari{' '}
                    {filteredDestinations.length}
                  </span>
                </div>
              )}
            </>
          )}
        </section>

        <section className="explore-cta">
          <div className="cta-icon">
            <Sparkles size={19} />
          </div>

          <div>
            <span className="section-kicker">PERSONAL TRIP</span>
            <h2>Belum tahu harus mulai dari mana?</h2>
            <p>
              Biarkan NuSaJoy membantu memilih destinasi berdasarkan
              preferensi dan ritme perjalananmu.
            </p>
          </div>

          <Link to="/rekomendasi" className="cta-button">
            Cari rekomendasi
            <ArrowRight size={14} />
          </Link>
        </section>
      </div>

      <div className="mobile-bottom-nav">
        <Link to="/explore" className="bottom-nav-item active">
          <Compass size={17} />
          <span>Jelajah</span>
        </Link>

        <Link to="/rekomendasi" className="bottom-nav-item">
          <Sparkles size={17} />
          <span>Rekomendasi</span>
        </Link>

        <Link to="/favorit" className="bottom-nav-item">
          <Heart size={17} />
          <span>Favorit</span>
        </Link>
      </div>

      {shareMessage && (
        <div className="toast-message" role="status">
          <Check size={14} />
          {shareMessage}
        </div>
      )}

      {selectedDestination && (
        <div
          className="quick-view-backdrop"
          onClick={() => setSelectedDestination(null)}
          role="presentation"
        >
          <div
            className="quick-view-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Detail ${getDestinationTitle(
              selectedDestination
            )}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setSelectedDestination(null)}
              aria-label="Tutup"
            >
              <X size={17} />
            </button>

            <div className="modal-image">
              <img
                src={getDestinationImage(selectedDestination)}
                alt={getDestinationTitle(selectedDestination)}
                onError={handleImageError}
              />

              <div className="modal-overlay" />

              <div className="modal-image-info">
                {selectedDestination.is_hidden_gem && (
                  <span className="modal-badge">
                    <Sparkles size={11} />
                    Hidden Gem
                  </span>
                )}

                <span className="modal-score">
                  <Sparkles size={11} />
                  {getExploreMatchScore(
                    selectedDestination,
                    search,
                    category,
                    city
                  )}
                  % Cocok
                </span>
              </div>
            </div>

            <div className="modal-content">
              <span className="destination-category">
                {getCategoryLabel(selectedDestination.category)}
              </span>

              <h2>{getDestinationTitle(selectedDestination)}</h2>

              <div className="modal-location">
                <MapPin size={13} />
                {selectedDestination.location || 'Indonesia'}
              </div>

              <div className="modal-stats">
                <span>
                  <Star size={13} fill="currentColor" />
                  {Number(
                    selectedDestination.rating || 0
                  ).toFixed(1)}
                </span>

                <span>
                  <Clock3 size={13} />
                  {getDurationText(selectedDestination)}
                </span>

                <span>{getPriceText(selectedDestination)}</span>
              </div>

              {selectedDestination.description && (
                <p className="modal-description">
                  {selectedDestination.description}
                </p>
              )}

              <div className="modal-actions">
                <Link
                  to={`/destination/${selectedDestination.id}`}
                  className="primary-button"
                  onClick={() => setSelectedDestination(null)}
                >
                  Lihat detail
                  <ArrowRight size={14} />
                </Link>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => openMap(selectedDestination)}
                >
                  <Navigation size={14} />
                  Peta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Explore

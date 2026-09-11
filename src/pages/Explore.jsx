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
} from 'lucide-react'

import { supabase } from '../utils/supabaseClient'
import '../styles/Explore.css'

const FAVORITES_KEY = 'nusaJoyFavorites'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80'

const categoryMeta = {
  alam: { icon: Trees, label: 'Alam' },
  kuliner: { icon: Utensils, label: 'Kuliner' },
  budaya: { icon: Landmark, label: 'Budaya' },
  edukasi: { icon: GraduationCap, label: 'Edukasi' },
}

const sortOptions = [
  { value: 'rating', label: 'Rating tertinggi' },
  { value: 'popular', label: 'Paling populer' },
  { value: 'price-low', label: 'Harga terendah' },
  { value: 'price-high', label: 'Harga tertinggi' },
  { value: 'duration', label: 'Durasi terpendek' },
]

function Explore() {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Semua')
  const [sortBy, setSortBy] = useState('rating')
  const [viewMode, setViewMode] = useState('grid')
  const [showHiddenGem, setShowHiddenGem] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [showMobileTools, setShowMobileTools] = useState(false)
  const [selectedDestination, setSelectedDestination] = useState(null)
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []
    } catch {
      return []
    }
  })

  const [visibleCount, setVisibleCount] = useState(12)
  const [shareMessage, setShareMessage] = useState('')

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
        setDestinations(data || [])
      }

      setLoading(false)
    }

    fetchDestinations()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    setVisibleCount(12)
  }, [search, category, showHiddenGem, sortBy])

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setSelectedDestination(null)
        setShowSort(false)
        setShowMobileTools(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  const categories = useMemo(() => {
    const unique = [...new Set(
      destinations.map((item) => item.category).filter(Boolean)
    )]

    return ['Semua', ...unique]
  }, [destinations])

  const popularDestinations = useMemo(() => {
    return [...destinations]
      .sort((a, b) => {
        const ratingDiff = Number(b.rating || 0) - Number(a.rating || 0)
        if (ratingDiff !== 0) return ratingDiff
        return Number(b.review_count || b.reviews || 0) - Number(a.review_count || a.reviews || 0)
      })
      .slice(0, 6)
  }, [destinations])

  const hiddenGemDestinations = useMemo(() => {
    return destinations
      .filter((item) => item.is_hidden_gem === true)
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
      .slice(0, 6)
  }, [destinations])

  const filteredDestinations = useMemo(() => {
    let result = [...destinations]
    const keyword = search.trim().toLowerCase()

    if (keyword) {
      result = result.filter((dest) => {
        const searchableText = [
          dest.name,
          dest.location,
          dest.category,
          dest.description,
          dest.address,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return searchableText.includes(keyword)
      })
    }

    if (category !== 'Semua') {
      result = result.filter(
        (dest) => String(dest.category || '').toLowerCase() === category.toLowerCase()
      )
    }

    if (showHiddenGem) {
      result = result.filter((dest) => dest.is_hidden_gem === true)
    }

    switch (sortBy) {
      case 'popular':
        result.sort(
          (a, b) =>
            Number(b.review_count || b.reviews || 0) -
            Number(a.review_count || a.reviews || 0)
        )
        break

      case 'price-low':
        result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
        break

      case 'price-high':
        result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0))
        break

      case 'duration':
        result.sort((a, b) => Number(a.duration || 0) - Number(b.duration || 0))
        break

      case 'rating':
      default:
        result.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
        break
    }

    return result
  }, [destinations, search, category, showHiddenGem, sortBy])

  const visibleDestinations = filteredDestinations.slice(0, visibleCount)

  const stats = useMemo(() => {
    const hidden = destinations.filter((item) => item.is_hidden_gem === true).length
    const rating =
      destinations.length > 0
        ? (
            destinations.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
            destinations.length
          ).toFixed(1)
        : '0.0'

    return {
      total: destinations.length,
      hidden,
      rating,
      categories: Math.max(categories.length - 1, 0),
    }
  }, [destinations, categories])

  const activeFilterCount =
    (category !== 'Semua' ? 1 : 0) + (showHiddenGem ? 1 : 0)

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

  function resetExplore() {
    setSearch('')
    setCategory('Semua')
    setShowHiddenGem(false)
    setSortBy('rating')
    setShowSort(false)
    setShowMobileTools(false)
  }

  function getCategoryIcon(categoryName) {
    const meta = categoryMeta[String(categoryName || '').toLowerCase()]
    return meta?.icon || Compass
  }

  function getCategoryLabel(categoryName) {
    const meta = categoryMeta[String(categoryName || '').toLowerCase()]
    return meta?.label || categoryName || 'Destinasi'
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

      await navigator.clipboard.writeText(url)
      setShareMessage('Link destinasi berhasil disalin!')
      window.setTimeout(() => setShareMessage(''), 2200)
    } catch {
      // User cancelled native share or clipboard is unavailable.
    }
  }

  function openMap(dest) {
    const query = encodeURIComponent(
      [dest.name, dest.location].filter(Boolean).join(', ')
    )
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  function renderDestinationCard(dest, index) {
    const favorite = isFavorite(dest.id)

    return (
      <article
        className={`destination-card ${viewMode === 'list' ? 'list-card' : ''}`}
        key={dest.id}
        style={{ '--card-index': index }}
      >
        <div className="destination-media">
          <Link
            to={`/destination/${dest.id}`}
            className="destination-image-link"
            aria-label={`Lihat ${dest.name}`}
          >
            <img
              src={dest.image_url || FALLBACK_IMAGE}
              alt={dest.name || 'Destinasi wisata'}
              onError={handleImageError}
              loading="lazy"
            />
            <div className="image-gradient" />
          </Link>

          <div className="media-top">
            {dest.is_hidden_gem && (
              <span className="gem-badge">
                <Sparkles size={13} />
                Hidden Gem
              </span>
            )}

            <button
              type="button"
              className={`icon-button favorite-button ${favorite ? 'liked' : ''}`}
              onClick={() => toggleFavorite(dest.id)}
              aria-label={favorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
              title={favorite ? 'Hapus dari favorit' : 'Simpan favorit'}
            >
              <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="media-bottom">
            <span className="rating-pill">
              <Star size={13} fill="currentColor" />
              {Number(dest.rating || 0).toFixed(1)}
            </span>

            <button
              type="button"
              className="quick-view-button"
              onClick={() => setSelectedDestination(dest)}
            >
              <Eye size={14} />
              Quick view
            </button>
          </div>
        </div>

        <div className="destination-content">
          <div className="destination-heading-row">
            <span className="destination-category">
              {getCategoryLabel(dest.category)}
            </span>

            {Number(dest.rating || 0) >= 4.8 && (
              <span className="top-rated">
                <Flame size={12} />
                Top rated
              </span>
            )}
          </div>

          <Link to={`/destination/${dest.id}`} className="destination-title">
            {dest.name || 'Destinasi tanpa nama'}
          </Link>

          <div className="destination-location">
            <MapPin size={14} />
            <span>{dest.location || 'Indonesia'}</span>
          </div>

          {dest.description && (
            <p className="destination-description">{dest.description}</p>
          )}

          <div className="destination-meta">
            <span>
              <Clock3 size={14} />
              {dest.duration ? `${dest.duration} jam` : 'Fleksibel'}
            </span>

            {dest.travel_time_from_city && (
              <span>
                <MapPinned size={14} />
                {dest.travel_time_from_city}
              </span>
            )}

            {(dest.review_count || dest.reviews) && (
              <span>
                <Star size={14} />
                {dest.review_count || dest.reviews} ulasan
              </span>
            )}
          </div>

          <div className="destination-footer">
            <div className="destination-price">
              <small>Mulai dari</small>
              <strong>
                {Number(dest.price || 0) === 0
                  ? 'Gratis'
                  : `Rp${Number(dest.price).toLocaleString('id-ID')}`}
              </strong>
            </div>

            <div className="card-actions">
              <button
                type="button"
                className="mini-action"
                onClick={() => handleShare(dest)}
                aria-label={`Bagikan ${dest.name}`}
                title="Bagikan"
              >
                <Share2 size={15} />
              </button>

              <button
                type="button"
                className="mini-action"
                onClick={() => openMap(dest)}
                aria-label={`Buka lokasi ${dest.name}`}
                title="Lihat di peta"
              >
                <Navigation size={15} />
              </button>

              <Link to={`/destination/${dest.id}`} className="detail-button">
                Jelajahi
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </article>
    )
  }

  if (loading) {
    return (
      <main className="explore-page">
        <div className="explore-container">
          <div className="loading-hero">
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

  if (errorMsg) {
    return (
      <main className="explore-page">
        <div className="explore-container">
          <div className="explore-error">
            <div className="error-icon">!</div>
            <h2>Gagal memuat destinasi</h2>
            <p>{errorMsg}</p>
            <button
              type="button"
              className="primary-button"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={16} />
              Coba Lagi
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="explore-page">
      <div className="explore-container">
        <section className="explore-hero">
          <div className="hero-copy">
            <span className="hero-eyebrow">
              <Sparkles size={14} />
              Explore Indonesia
            </span>

            <h1>
              Temukan tempat
              <span> yang layak dijelajahi.</span>
            </h1>

            <p>
              Jelajahi destinasi, kuliner, budaya, edukasi, dan hidden gems
              dalam satu tempat.
            </p>
          </div>

          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-compass">
            <Compass size={34} />
          </div>
        </section>

        <section className="search-section">
          <div className="search-box">
            <Search size={21} className="search-icon" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari destinasi, kota, kuliner, atau kategori..."
              aria-label="Cari destinasi"
            />
            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearch('')}
                aria-label="Hapus pencarian"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <div className="search-helper">
            <span>
              <MapPinned size={14} />
              {stats.total} destinasi tersedia
            </span>

            <Link to="/rekomendasi" className="recommend-link">
              Bingung memilih?
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        <section className="explore-stats" aria-label="Ringkasan Explore">
          <div className="stat-card">
            <span className="stat-icon"><Compass size={17} /></span>
            <div>
              <strong>{stats.total}</strong>
              <small>Destinasi</small>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon"><Gem size={17} /></span>
            <div>
              <strong>{stats.hidden}</strong>
              <small>Hidden gems</small>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon"><Star size={17} fill="currentColor" /></span>
            <div>
              <strong>{stats.rating}</strong>
              <small>Rating rata-rata</small>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon"><Grid2X2 size={17} /></span>
            <div>
              <strong>{stats.categories}</strong>
              <small>Kategori</small>
            </div>
          </div>
        </section>

        <section className="category-section">
          <div className="section-heading compact">
            <div>
              <span className="section-kicker">DISCOVER BY TYPE</span>
              <h2>Eksplor sesuai mood</h2>
            </div>
          </div>

          <div className="category-scroll">
            {categories.map((item) => {
              const Icon = item === 'Semua' ? Compass : getCategoryIcon(item)
              const active = category === item && !showHiddenGem

              return (
                <button
                  type="button"
                  key={item}
                  className={`category-chip ${active ? 'active' : ''}`}
                  onClick={() => {
                    setCategory(item)
                    setShowHiddenGem(false)
                  }}
                >
                  <Icon size={17} />
                  <span>{item === 'Semua' ? 'Semua' : getCategoryLabel(item)}</span>
                </button>
              )
            })}

            <button
              type="button"
              className={`category-chip hidden-gem-chip ${showHiddenGem ? 'active' : ''}`}
              onClick={() => {
                setShowHiddenGem(true)
                setCategory('Semua')
              }}
            >
              <Sparkles size={17} />
              <span>Hidden Gems</span>
            </button>
          </div>
        </section>

        {!search && category === 'Semua' && !showHiddenGem && popularDestinations.length > 0 && (
          <section className="popular-section">
            <div className="section-heading">
              <div>
                <span className="section-kicker">TRENDING NOW</span>
                <h2>Yang sedang dicari traveler</h2>
                <p>Inspirasi cepat sebelum kamu menentukan tujuan.</p>
              </div>
              <div className="heading-icon">
                <Flame size={20} />
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
                    src={dest.image_url || FALLBACK_IMAGE}
                    alt={dest.name || 'Destinasi'}
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
                      <h3>{dest.name}</h3>
                      <span className="popular-location">
                        <MapPin size={13} />
                        {dest.location || 'Indonesia'}
                      </span>
                    </div>

                    <span className="popular-rating">
                      <Star size={12} fill="currentColor" />
                      {Number(dest.rating || 0).toFixed(1)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {!search && category === 'Semua' && !showHiddenGem && hiddenGemDestinations.length > 0 && (
          <section className="hidden-section">
            <div className="section-heading">
              <div>
                <span className="section-kicker">HIDDEN GEM</span>
                <h2>Tempat yang belum ramai</h2>
                <p>Lebih cocok untuk kamu yang suka menemukan sesuatu yang berbeda.</p>
              </div>
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setShowHiddenGem(true)
                  setCategory('Semua')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                Lihat semua
                <ArrowRight size={14} />
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
                    src={dest.image_url || FALLBACK_IMAGE}
                    alt={dest.name || 'Hidden gem'}
                    onError={handleImageError}
                    loading="lazy"
                  />
                  <div>
                    <span><Sparkles size={11} /> Hidden Gem</span>
                    <h3>{dest.name}</h3>
                    <small>
                      <MapPin size={11} />
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
                  : category === 'Semua'
                    ? 'Semua Destinasi'
                    : getCategoryLabel(category)}
              </h2>
              <p>
                <strong>{filteredDestinations.length}</strong> tempat
                {search ? ` ditemukan untuk "${search}"` : ' siap dijelajahi'}
              </p>
            </div>

            <div className="toolbar-actions">
              <button
                type="button"
                className={`mobile-tools-button ${activeFilterCount ? 'has-filter' : ''}`}
                onClick={() => setShowMobileTools((value) => !value)}
              >
                <SlidersHorizontal size={16} />
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
                  <SlidersHorizontal size={16} />
                  <span>{sortOptions.find((item) => item.value === sortBy)?.label}</span>
                  <ChevronDown size={14} />
                </button>

                {showSort && (
                  <div className="sort-menu">
                    {sortOptions.map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        className={sortBy === option.value ? 'selected' : ''}
                        onClick={() => {
                          setSortBy(option.value)
                          setShowSort(false)
                        }}
                      >
                        <span>{option.label}</span>
                        {sortBy === option.value && <Check size={15} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="view-toggle">
                <button
                  type="button"
                  className={viewMode === 'grid' ? 'active' : ''}
                  onClick={() => setViewMode('grid')}
                  aria-label="Tampilan grid"
                >
                  <Grid2X2 size={16} />
                </button>
                <button
                  type="button"
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                  aria-label="Tampilan list"
                >
                  <List size={17} />
                </button>
              </div>
            </div>
          </div>

          {showMobileTools && (
            <div className="mobile-tools-panel">
              <div className="mobile-tools-title">
                <span>Filter Explore</span>
                <button type="button" onClick={() => setShowMobileTools(false)}>
                  <X size={17} />
                </button>
              </div>

              <div className="mobile-tool-group">
                <span>Kategori</span>
                <div className="mobile-tool-chips">
                  {categories.map((item) => (
                    <button
                      type="button"
                      key={item}
                      className={category === item && !showHiddenGem ? 'active' : ''}
                      onClick={() => {
                        setCategory(item)
                        setShowHiddenGem(false)
                      }}
                    >
                      {item === 'Semua' ? 'Semua' : getCategoryLabel(item)}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={showHiddenGem ? 'active' : ''}
                    onClick={() => {
                      setShowHiddenGem(true)
                      setCategory('Semua')
                    }}
                  >
                    ✨ Hidden Gem
                  </button>
                </div>
              </div>

              <button type="button" className="mobile-reset" onClick={resetExplore}>
                <RefreshCw size={14} />
                Reset Explore
              </button>
            </div>
          )}

          {(search || category !== 'Semua' || showHiddenGem) && (
            <div className="active-filters">
              {search && (
                <button type="button" onClick={() => setSearch('')}>
                  Search: {search}
                  <X size={13} />
                </button>
              )}

              {category !== 'Semua' && (
                <button type="button" onClick={() => setCategory('Semua')}>
                  {getCategoryLabel(category)}
                  <X size={13} />
                </button>
              )}

              {showHiddenGem && (
                <button type="button" onClick={() => setShowHiddenGem(false)}>
                  ✨ Hidden Gem
                  <X size={13} />
                </button>
              )}

              <button type="button" className="reset-explore" onClick={resetExplore}>
                Reset
              </button>
            </div>
          )}

          {visibleDestinations.length === 0 ? (
            <div className="explore-empty">
              <div className="empty-illustration">
                <Search size={34} />
              </div>
              <h3>Belum menemukan destinasi</h3>
              <p>
                Coba kata kunci lain atau kembali ke semua destinasi untuk
                melihat lebih banyak pilihan.
              </p>
              <button type="button" className="primary-button" onClick={resetExplore}>
                <Compass size={16} />
                Lihat Semua
              </button>
            </div>
          ) : (
            <>
              <div className={viewMode === 'grid' ? 'destination-grid' : 'destination-list'}>
                {visibleDestinations.map((dest, index) => renderDestinationCard(dest, index))}
              </div>

              {visibleCount < filteredDestinations.length && (
                <div className="load-more-wrap">
                  <button
                    type="button"
                    className="load-more-button"
                    onClick={() => setVisibleCount((count) => count + 8)}
                  >
                    Muat lebih banyak
                    <ArrowRight size={15} />
                  </button>
                  <span>
                    Menampilkan {visibleDestinations.length} dari {filteredDestinations.length}
                  </span>
                </div>
              )}
            </>
          )}
        </section>

        <section className="explore-cta">
          <div className="cta-icon">
            <Sparkles size={22} />
          </div>
          <div>
            <span className="section-kicker">PERSONAL TRIP</span>
            <h2>Belum tahu harus mulai dari mana?</h2>
            <p>Biarkan NuSaJoy membantu memilih destinasi berdasarkan budget, durasi, minat, dan lokasi.</p>
          </div>
          <Link to="/rekomendasi" className="cta-button">
            Cari rekomendasi
            <ArrowRight size={16} />
          </Link>
        </section>
      </div>

      <div className="mobile-bottom-nav">
        <Link to="/explore" className="bottom-nav-item active">
          <Compass size={19} />
          <span>Explore</span>
        </Link>
        <Link to="/rekomendasi" className="bottom-nav-item">
          <Sparkles size={19} />
          <span>Rekomendasi</span>
        </Link>
        <Link to="/favorit" className="bottom-nav-item">
          <Heart size={19} />
          <span>Favorit</span>
        </Link>
      </div>

      {shareMessage && (
        <div className="toast-message">
          <Check size={16} />
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
            aria-label={`Detail ${selectedDestination.name}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setSelectedDestination(null)}
              aria-label="Tutup"
            >
              <X size={19} />
            </button>

            <div className="modal-image">
              <img
                src={selectedDestination.image_url || FALLBACK_IMAGE}
                alt={selectedDestination.name || 'Destinasi'}
                onError={handleImageError}
              />
              {selectedDestination.is_hidden_gem && (
                <span className="modal-badge">
                  <Sparkles size={13} />
                  Hidden Gem
                </span>
              )}
            </div>

            <div className="modal-content">
              <span className="destination-category">
                {getCategoryLabel(selectedDestination.category)}
              </span>
              <h2>{selectedDestination.name}</h2>

              <div className="modal-location">
                <MapPin size={15} />
                {selectedDestination.location || 'Indonesia'}
              </div>

              <div className="modal-stats">
                <span>
                  <Star size={14} fill="currentColor" />
                  {Number(selectedDestination.rating || 0).toFixed(1)}
                </span>
                <span>
                  <Clock3 size={14} />
                  {selectedDestination.duration
                    ? `${selectedDestination.duration} jam`
                    : 'Fleksibel'}
                </span>
                <span>
                  {Number(selectedDestination.price || 0) === 0
                    ? 'Gratis'
                    : `Rp${Number(selectedDestination.price).toLocaleString('id-ID')}`}
                </span>
              </div>

              {selectedDestination.description && (
                <p className="modal-description">{selectedDestination.description}</p>
              )}

              <div className="modal-actions">
                <Link
                  to={`/destination/${selectedDestination.id}`}
                  className="primary-button"
                  onClick={() => setSelectedDestination(null)}
                >
                  Lihat detail
                  <ArrowRight size={16} />
                </Link>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => openMap(selectedDestination)}
                >
                  <Navigation size={15} />
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

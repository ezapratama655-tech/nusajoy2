import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { supabase } from '../utils/supabaseClient'
import { isFavorite, toggleFavorite, subscribeToFavorites } from '../utils/favorites'
import '../styles/DestinationDetail.css'

// =====================================
// DATA PENGALAMAN WISATAWAN
// =====================================

const touristExperiences = [
  {
    id: 1,
    name: 'Rina Aulia',
    avatar: 'https://i.pravatar.cc/100?img=47',
    date: '2 minggu lalu',
    rating: 5,
    text: 'Tempatnya nyaman dan cocok untuk liburan bersama keluarga. Banyak pengalaman baru yang bisa dicoba.',
    tags: ['Keluarga', 'Edukatif'],
  },
  {
    id: 2,
    name: 'Fajar Pratama',
    avatar: 'https://i.pravatar.cc/100?img=12',
    date: '1 bulan lalu',
    rating: 4,
    text: 'Lokasinya cukup mudah ditemukan dan suasananya berbeda dari tempat wisata biasa.',
    tags: ['Seru', 'Lokal'],
  },
  {
    id: 3,
    name: 'Nadia Putri',
    avatar: 'https://i.pravatar.cc/100?img=32',
    date: '1 bulan lalu',
    rating: 5,
    text: 'Pengalaman yang menyenangkan. Sangat cocok untuk menghabiskan waktu sambil mengenal wisata lokal.',
    tags: ['Recommended', 'Experience'],
  },
  {
    id: 4,
    name: 'Dimas Akbar',
    avatar: 'https://i.pravatar.cc/100?img=11',
    date: '2 bulan lalu',
    rating: 5,
    text: 'Suasananya tenang dan detail lokalnya terasa. Cocok untuk perjalanan santai tanpa terburu-buru.',
    tags: ['Santai', 'Autentik'],
  },
  {
    id: 5,
    name: 'Salsa Kirana',
    avatar: 'https://i.pravatar.cc/100?img=25',
    date: '2 bulan lalu',
    rating: 4,
    text: 'Banyak sudut menarik untuk foto dan ceritanya membuat kunjungan terasa lebih bermakna.',
    tags: ['Fotografi', 'Budaya'],
  },
  {
    id: 6,
    name: 'Arga Wijaya',
    avatar: 'https://i.pravatar.cc/100?img=68',
    date: '3 bulan lalu',
    rating: 5,
    text: 'Pilihan yang menyenangkan untuk mengenal sisi lokal daerah. Pelayanannya juga terasa hangat.',
    tags: ['Lokal', 'Recommended'],
  },
]

// =====================================
// INLINE ICON
// Menjaga halaman tetap ringan tanpa
// dependency icon tambahan.
// =====================================

const Icon = ({ name, size = 20, strokeWidth = 1.8 }) => {
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
    focusable: 'false',
  }

  const paths = {
    arrowLeft: <path d="m15 18-6-6 6-6" />,
    arrowRight: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    heart: (
      <path d="M20.8 8.7c0 5.2-8.8 10.3-8.8 10.3S3.2 13.9 3.2 8.7A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.3Z" />
    ),
    share: (
      <>
        <circle cx="18" cy="5" r="2.5" />
        <circle cx="6" cy="12" r="2.5" />
        <circle cx="18" cy="19" r="2.5" />
        <path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" />
      </>
    ),
    expand: (
      <>
        <path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5" />
        <path d="M9 9 3 3M15 9l6-6M15 15l6 6M9 15l-6 6" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    location: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    tag: <path d="m20.5 13.5-7 7-10-10v-7h7l10 10Z" />,
    compass: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m15.7 8.3-2.1 5.3-5.3 2.1 2.1-5.3 5.3-2.1Z" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="m18 6-12 12" />
      </>
    ),
  }

  return <svg {...commonProps}>{paths[name]}</svg>
}

function DestinationDetail() {
  const { id } = useParams()

  const [dest, setDest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)
  const [fav, setFav] = useState(false)
  const [shared, setShared] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)

  // Tambahan UX state
  const [favoriteNotice, setFavoriteNotice] = useState('')
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showImageViewer, setShowImageViewer] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  const heroRef = useRef(null)
  const imageRef = useRef(null)

  // =====================================
  // FETCH DESTINATION
  // =====================================

  useEffect(() => {
    let mounted = true

    async function fetchDetail() {
      setLoading(true)
      setErrorMsg(null)
      setImageLoaded(false)
      setImageError(false)

      try {
        const { data, error } = await supabase
          .from('destinations')
          .select('*')
          .eq('id', id)
          .single()

        if (!mounted) return

        if (error) {
          setErrorMsg(error.message)
          return
        }

        setDest(data)
        setFav(Boolean(data?.id && isFavorite(data.id)))
      } catch (error) {
        console.error('Destination detail error:', error)

        if (mounted) {
          setErrorMsg(
            error?.message || 'Gagal mengambil detail destinasi.'
          )
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchDetail()

    return () => {
      mounted = false
    }
  }, [id])

  // =====================================
  // SCROLL PROGRESS
  // =====================================

  useEffect(() => {
    function updateProgress() {
      const scrollTop = window.scrollY || 0
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight

      const progress =
        maxScroll > 0
          ? Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100))
          : 0

      setScrollProgress(progress)
    }

    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })

    return () => {
      window.removeEventListener('scroll', updateProgress)
    }
  }, [dest])

  // =====================================
  // PARALLAX EFFECT
  // =====================================

  useEffect(() => {
    const hero = heroRef.current
    const image = imageRef.current

    if (!hero || !image) return undefined

    function handleMouseMove(e) {
      if (window.innerWidth <= 768) return

      const rect = hero.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const moveX = (x / rect.width - 0.5) * 14
      const moveY = (y / rect.height - 0.5) * 14

      image.style.setProperty('--parallax-x', `${moveX}px`)
      image.style.setProperty('--parallax-y', `${moveY}px`)
    }

    function resetPosition() {
      image.style.setProperty('--parallax-x', '0px')
      image.style.setProperty('--parallax-y', '0px')
    }

    hero.addEventListener('mousemove', handleMouseMove)
    hero.addEventListener('mouseleave', resetPosition)

    return () => {
      hero.removeEventListener('mousemove', handleMouseMove)
      hero.removeEventListener('mouseleave', resetPosition)
    }
  }, [dest])

  // =====================================
  // ESCAPE + BODY LOCK UNTUK IMAGE VIEWER
  // =====================================

  useEffect(() => {
    if (!showImageViewer) return undefined

    document.body.classList.add('destination-viewer-open')

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setShowImageViewer(false)
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.body.classList.remove('destination-viewer-open')
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showImageViewer])

  // =====================================
  // FAVORITE
  // =====================================

  useEffect(() => subscribeToFavorites(() => setFav(isFavorite(id))), [id])

  function handleToggleFavorite() {
    if (!dest) return

    toggleFavorite({ ...dest, type: 'destination' })

    const nextFavorite = isFavorite(dest.id)
    setFav(nextFavorite)

    setFavoriteNotice(
      nextFavorite
        ? 'Destinasi disimpan ke favorit'
        : 'Destinasi dihapus dari favorit'
    )

    window.setTimeout(() => {
      setFavoriteNotice('')
    }, 2200)
  }

  // =====================================
  // SHARE
  // =====================================

  async function handleShare() {
    if (!dest) return

    const shareData = {
      title: `${dest.name} — NuSaJoy`,
      text: `Yuk lihat destinasi ${dest.name} di NuSaJoy.`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)

        setShared(true)

        window.setTimeout(() => {
          setShared(false)
        }, 2200)

        return
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href)

        setShared(true)

        window.setTimeout(() => {
          setShared(false)
        }, 2200)

        return
      }

      const textarea = document.createElement('textarea')
      textarea.value = window.location.href
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      textarea.style.pointerEvents = 'none'

      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      document.execCommand('copy')
      textarea.remove()

      setShared(true)

      window.setTimeout(() => {
        setShared(false)
      }, 2200)
    } catch (error) {
      if (error?.name !== 'AbortError') {
        console.error('Share error:', error)
      }
    }
  }

  // =====================================
  // GOOGLE MAPS
  // =====================================

  function handleOpenMaps() {
    if (
      dest?.latitude === null ||
      dest?.latitude === undefined ||
      dest?.longitude === null ||
      dest?.longitude === undefined
    ) {
      return
    }

    const mapsUrl =
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        `${dest.latitude},${dest.longitude}`
      )}`

    window.open(
      mapsUrl,
      '_blank',
      'noopener,noreferrer'
    )
  }

  // =====================================
  // IMAGE
  // =====================================

  function handleImageLoad() {
    setImageLoaded(true)
    setImageError(false)
  }

  function handleImageError() {
    setImageLoaded(false)
    setImageError(true)
  }

  // =====================================
  // DERIVED DATA
  // =====================================

  const visibleReviews = showAllReviews
    ? touristExperiences
    : touristExperiences.slice(0, 3)

  const priceText = useMemo(() => {
    const price = Number(dest?.price || 0)
    return price === 0
      ? 'Gratis'
      : `Rp${price.toLocaleString('id-ID')}`
  }, [dest])

  const durationText = useMemo(() => {
    return dest?.duration ? `${dest.duration} jam` : '-'
  }, [dest])

  const ratingText = useMemo(() => {
    return dest?.rating || '4.8'
  }, [dest])

  const hasCoordinates =
    dest?.latitude !== null &&
    dest?.latitude !== undefined &&
    dest?.longitude !== null &&
    dest?.longitude !== undefined

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="detail-loading-orbit" aria-hidden="true">
          <span />
        </div>

        <div className="detail-loading-copy">
          <strong>Menyiapkan pengalaman wisata</strong>
          <p>Memuat destinasi lokal untukmu...</p>
        </div>

        <div className="detail-loading-progress" aria-hidden="true">
          <span />
        </div>
      </div>
    )
  }

  // =====================================
  // ERROR
  // =====================================

  if (errorMsg) {
    return (
      <div className="detail-error">
        <div className="error-decoration" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className="error-icon">!</div>

        <span className="section-label">NUSAJOY JOURNEY</span>

        <h2>Oops, perjalanan belum ditemukan</h2>

        <p>{errorMsg}</p>

        <Link to="/explore" className="error-back-button">
          <Icon name="arrowLeft" size={17} />
          <span>Kembali ke Explore</span>
        </Link>
      </div>
    )
  }

  if (!dest) {
    return (
      <div className="detail-error">
        <div className="error-decoration" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className="error-icon">?</div>

        <span className="section-label">DESTINASI LOKAL</span>

        <h2>Destinasi tidak ditemukan</h2>

        <p>
          Destinasi yang kamu cari mungkin sudah tidak tersedia
          atau belum ditambahkan ke NuSaJoy.
        </p>

        <Link to="/explore" className="error-back-button">
          <Icon name="arrowLeft" size={17} />
          <span>Kembali ke Explore</span>
        </Link>
      </div>
    )
  }

  return (
    <main className="destination-detail">
      {/* =====================================
          SCROLL PROGRESS
      ===================================== */}

      <div className="destination-scroll-progress" aria-hidden="true">
        <span style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* =====================================
          HERO
      ===================================== */}

      <section className="destination-hero" ref={heroRef}>
        {!imageLoaded && !imageError && (
          <div className="hero-image-skeleton" aria-hidden="true">
            <span />
          </div>
        )}

        {imageError ? (
          <div className="hero-image-fallback">
            <div className="hero-fallback-pattern" />
            <div className="hero-fallback-copy">
              <span>NuSaJoy</span>
              <strong>{dest.name}</strong>
              <small>Foto destinasi belum tersedia</small>
            </div>
          </div>
        ) : (
          <img
            ref={imageRef}
            src={dest.image_url}
            alt={dest.name}
            className={`destination-hero-image ${
              imageLoaded ? 'is-loaded' : ''
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        <div className="hero-overlay" />
        <div className="hero-glow" />
        <div className="hero-grain" />

        {/* TOP ACTIONS */}

        <div className="hero-topbar">
          <Link to="/explore" className="back-button">
            <Icon name="arrowLeft" size={17} />
            <span>Kembali ke Explore</span>
          </Link>

          <div className="hero-actions">
            <button
              type="button"
              className={`hero-action ${fav ? 'active' : ''}`}
              onClick={handleToggleFavorite}
              aria-label={
                fav ? 'Hapus dari favorit' : 'Tambah ke favorit'
              }
              aria-pressed={fav}
            >
              <Icon name="heart" size={20} />
            </button>

            <button
              type="button"
              className="hero-action"
              onClick={handleShare}
              aria-label="Bagikan destinasi"
            >
              <Icon name="share" size={20} />
            </button>

            <button
              type="button"
              className="hero-action hero-action-expand"
              onClick={() => {
                if (!imageError) setShowImageViewer(true)
              }}
              disabled={imageError}
              aria-label="Perbesar foto destinasi"
            >
              <Icon name="expand" size={19} />
            </button>
          </div>
        </div>

        {/* HERO CONTENT */}

        <div className="hero-content">
          <div className="hero-content-inner">
            <div className="hero-kicker-row">
              {dest.is_hidden_gem && (
                <span className="hero-badge">
                  <span>✦</span>
                  Hidden Gem
                </span>
              )}

              {dest.category && (
                <span className="hero-category">
                  <Icon name="tag" size={13} />
                  {dest.category}
                </span>
              )}
            </div>

            <p className="hero-location">
              <Icon name="location" size={16} />
              {dest.location}
            </p>

            <h1>{dest.name}</h1>

            <p className="hero-intro">
              {dest.short_description ||
                'Temukan sisi lokal, cerita, dan pengalaman khas dari destinasi ini.'}
            </p>

            <div className="hero-meta">
              <div className="hero-rating">
                <span className="hero-rating-star" aria-hidden="true">
                  <Star fill="currentColor" strokeWidth={0} />
                </span>

                <div>
                  <strong>{ratingText}</strong>
                  <small>Rating wisatawan</small>
                </div>
              </div>

              {dest.distance_from_city && (
                <div className="hero-distance">
                  <Icon name="location" size={16} />

                  <div>
                    <strong>
                      {dest.distance_from_city} km
                    </strong>

                    <small>dari pusat kota</small>
                  </div>
                </div>
              )}

              {dest.travel_time_from_city && (
                <div className="hero-distance">
                  <Icon name="clock" size={16} />

                  <div>
                    <strong>
                      {dest.travel_time_from_city} menit
                    </strong>

                    <small>perkiraan perjalanan</small>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* HERO BOTTOM */}

        <div className="hero-bottom-hint">
          <span className="hero-route-line" />
          <span>Scroll untuk menjelajah</span>
          <span className="hero-scroll-arrow">↓</span>
        </div>

        <button
          type="button"
          className="hero-view-photo"
          onClick={() => {
            if (!imageError) setShowImageViewer(true)
          }}
          disabled={imageError}
        >
          <Icon name="expand" size={14} />
          <span>Lihat foto</span>
        </button>
      </section>

      {/* =====================================
          SHARE / FAVORITE TOAST
      ===================================== */}

      {shared && (
        <div className="detail-toast share-toast" role="status">
          <span className="detail-toast-icon">✓</span>
          <span>Link destinasi berhasil dibagikan</span>
        </div>
      )}

      {favoriteNotice && (
        <div className="detail-toast favorite-toast" role="status">
          <span className="detail-toast-icon">
            <Icon name="heart" size={14} />
          </span>
          <span>{favoriteNotice}</span>
        </div>
      )}

      {/* =====================================
          FULLSCREEN IMAGE VIEWER
      ===================================== */}

      {showImageViewer && !imageError && (
        <div
          className="destination-image-viewer"
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ${dest.name}`}
          onMouseDown={() => setShowImageViewer(false)}
        >
          <div className="viewer-topbar">
            <span>{dest.name}</span>

            <button
              type="button"
              onClick={() => setShowImageViewer(false)}
              aria-label="Tutup foto"
            >
              <Icon name="close" size={21} />
            </button>
          </div>

          <div
            className="viewer-image-stage"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <img
              src={dest.image_url}
              alt={`${dest.name} — tampilan penuh`}
            />
          </div>
        </div>
      )}

      {/* =====================================
          QUICK INFORMATION
      ===================================== */}

      <section className="quick-info" aria-label="Informasi cepat destinasi">
        <div className="info-card">
          <span className="info-icon">💰</span>
          <div>
            <small>Harga Tiket</small>
            <strong>{priceText}</strong>
          </div>
        </div>

        <div className="info-card">
          <span className="info-icon">⏱️</span>
          <div>
            <small>Durasi</small>
            <strong>{durationText}</strong>
          </div>
        </div>

        <div className="info-card">
          <span className="info-icon">⭐</span>
          <div>
            <small>Rating</small>
            <strong>{ratingText}</strong>
          </div>
        </div>

        <div className="info-card">
          <span className="info-icon">🚗</span>
          <div>
            <small>Jarak</small>
            <strong>
              {dest.distance_from_city
                ? `${dest.distance_from_city} km`
                : '-'}
            </strong>
          </div>
        </div>

        <div className="info-card">
          <span className="info-icon">🧭</span>
          <div>
            <small>Perjalanan</small>
            <strong>
              {dest.travel_time_from_city
                ? `${dest.travel_time_from_city} menit`
                : '-'}
            </strong>
          </div>
        </div>
      </section>

      {/* =====================================
          DESKTOP ACTION STRIP
      ===================================== */}

      <section className="desktop-action-strip">
        <div className="desktop-action-copy">
          <span className="section-label">SIMPAN PERJALANAN</span>

          <strong>
            Mau datang ke {dest.name}?
          </strong>

          <small>
            Simpan destinasi, bagikan ke teman, atau
            langsung cek rutenya.
          </small>
        </div>

        <div className="desktop-action-buttons">
          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`desktop-action-button ${fav ? 'active' : ''}`}
          >
            <Icon name="heart" size={16} />
            <span>{fav ? 'Tersimpan' : 'Simpan'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="desktop-action-button"
          >
            <Icon name="share" size={16} />
            <span>Bagikan</span>
          </button>

          <button
            type="button"
            onClick={handleOpenMaps}
            disabled={!hasCoordinates}
            className="desktop-action-button desktop-action-primary"
          >
            <Icon name="compass" size={16} />
            <span>Mulai Rute</span>
          </button>
        </div>
      </section>

      {/* =====================================
          MOBILE ACTION BAR
      ===================================== */}

      <div className="mobile-action-bar">
        <button
          type="button"
          onClick={handleToggleFavorite}
          className={fav ? 'mobile-action active' : 'mobile-action'}
        >
          <Icon name="heart" size={19} />
          <small>{fav ? 'Tersimpan' : 'Simpan'}</small>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="mobile-action"
        >
          <Icon name="share" size={19} />
          <small>Bagikan</small>
        </button>

        <button
          type="button"
          onClick={handleOpenMaps}
          disabled={!hasCoordinates}
          className="mobile-action mobile-action-primary"
        >
          <Icon name="compass" size={19} />
          <small>Mulai Rute</small>
        </button>
      </div>

      {/* =====================================
          CONTENT
      ===================================== */}

      <section className="destination-content">
        <div className="content-main">
          {/* =====================================
              ABOUT
          ===================================== */}

          <section className="content-section reveal-section">
            <div className="section-heading-with-mark">
              <span className="section-marker">01</span>

              <div>
                <span className="section-label">
                  TENTANG DESTINASI
                </span>

                <h2>Rasakan pengalaman lokalnya</h2>
              </div>
            </div>

            <p className="description">
              {dest.description ||
                'Belum ada deskripsi destinasi. Nikmati perjalanan dan temukan cerita lokalnya secara langsung.'}
            </p>

            <div className="about-note">
              <span className="about-note-icon">✦</span>

              <div>
                <strong>
                  Bukan sekadar tempat untuk dikunjungi.
                </strong>

                <p>
                  NuSaJoy membantu kamu mengenal karakter lokal
                  melalui tempat, cerita, budaya, dan pengalaman
                  yang terasa lebih dekat.
                </p>
              </div>
            </div>
          </section>

          {/* =====================================
              HIGHLIGHTS
          ===================================== */}

          <section className="destination-highlights">
            <div className="highlight-heading">
              <div className="section-heading-with-mark">
                <span className="section-marker">02</span>

                <div>
                  <span className="section-label">
                    YANG BISA KAMU RASAKAN
                  </span>

                  <h2>Lebih dari sekadar tempat</h2>
                </div>
              </div>
            </div>

            <div className="highlight-grid">
              <article className="highlight-card">
                <div className="highlight-number">01</div>

                <div className="highlight-icon">🌿</div>

                <h3>Suasana Lokal</h3>

                <p>
                  Nikmati karakter lokal dan suasana yang
                  berbeda dari destinasi mainstream.
                </p>
              </article>

              <article className="highlight-card">
                <div className="highlight-number">02</div>

                <div className="highlight-icon">📸</div>

                <h3>Momen Berkesan</h3>

                <p>
                  Temukan spot dan pengalaman yang cocok
                  untuk mengisi perjalananmu.
                </p>
              </article>

              <article className="highlight-card">
                <div className="highlight-number">03</div>

                <div className="highlight-icon">🧭</div>

                <h3>Eksplorasi Lokal</h3>

                <p>
                  Jelajahi tempat baru dan kenali sisi lokal
                  dari daerah tersebut.
                </p>
              </article>
            </div>
          </section>

          {/* =====================================
              WHY DESTINATION
          ===================================== */}

          <section className="experience-card">
            <div className="experience-icon">✨</div>

            <div>
              <span className="experience-mini-label">
                NUSAJOY EXPERIENCE
              </span>

              <h3>Kenapa tempat ini menarik?</h3>

              <p>
                Temukan suasana lokal, pemandangan, dan
                pengalaman yang membuat perjalananmu berbeda
                dari wisata biasa.
              </p>

              <div className="experience-pill-row">
                <span>Autentik</span>
                <span>Lokal</span>
                <span>Lebih personal</span>
              </div>
            </div>
          </section>

          {/* =====================================
              TRAVEL TIPS
          ===================================== */}

          <section className="travel-tips">
            <div className="travel-tips-header">
              <div className="section-heading-with-mark">
                <span className="section-marker">03</span>

                <div>
                  <span className="section-label">
                    SEBELUM BERANGKAT
                  </span>

                  <h2>Tips kecil untuk perjalananmu</h2>
                </div>
              </div>
            </div>

            <div className="tips-grid">
              <div className="tip-item">
                <span>🕐</span>

                <div>
                  <strong>Atur waktu</strong>

                  <p>
                    Sisihkan waktu perjalanan agar
                    pengalamanmu lebih santai.
                  </p>
                </div>
              </div>

              <div className="tip-item">
                <span>🎒</span>

                <div>
                  <strong>Siapkan kebutuhan</strong>

                  <p>
                    Bawa perlengkapan sesuai aktivitas
                    yang ingin kamu lakukan.
                  </p>
                </div>
              </div>

              <div className="tip-item">
                <span>📍</span>

                <div>
                  <strong>Cek rute</strong>

                  <p>
                    Periksa lokasi dan perjalanan
                    sebelum berangkat.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* =====================================
              TOURIST EXPERIENCE
          ===================================== */}

          <section className="tourist-experience">
            <div className="experience-heading">
              <div className="section-heading-with-mark">
                <span className="section-marker">04</span>

                <div>
                  <span className="section-label">
                    PENGALAMAN WISATAWAN
                  </span>

                  <h2>
                    Cerita dari mereka yang sudah datang
                  </h2>

                  <p>
                    Lihat pengalaman wisatawan lain sebelum
                    kamu memulai perjalananmu.
                  </p>
                </div>
              </div>

              <div className="experience-summary">
                <strong>⭐ {ratingText}</strong>
                <span>Rating wisatawan</span>
                <small>
                  {touristExperiences.length} cerita
                </small>
              </div>
            </div>

            <div className="experience-list">
              {visibleReviews.map((experience) => (
                <article
                  className="tourist-review"
                  key={experience.id}
                >
                  <div className="review-top">
                    <div className="review-user">
                      <img
                        src={experience.avatar}
                        alt={experience.name}
                        loading="lazy"
                      />

                      <div>
                        <strong>{experience.name}</strong>
                        <span>{experience.date}</span>
                      </div>
                    </div>

                    <div
                      className="review-rating"
                      aria-label={`${experience.rating} dari 5 bintang`}
                    >
                      {'★'.repeat(experience.rating)}
                    </div>
                  </div>

                  <p className="review-text">
                    “{experience.text}”
                  </p>

                  <div className="review-tags">
                    {experience.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <button
              type="button"
              className="experience-more"
              onClick={() =>
                setShowAllReviews((previous) => !previous)
              }
            >
              {showAllReviews
                ? 'Tampilkan lebih sedikit'
                : `Lihat semua ${touristExperiences.length} pengalaman`}

              <span>
                {showAllReviews ? '↑' : '→'}
              </span>
            </button>
          </section>

          {/* =====================================
              LOCATION
          ===================================== */}

          <section className="content-section location-section">
            <div className="section-heading-with-mark">
              <span className="section-marker">05</span>

              <div>
                <span className="section-label">LOKASI</span>

                <div className="location-heading">
                  <div>
                    <h2>Temukan jalannya</h2>

                    <p>
                      Gunakan peta untuk melihat lokasi dan
                      merencanakan perjalananmu.
                    </p>
                  </div>

                  {hasCoordinates && (
                    <button
                      type="button"
                      className="map-route-button"
                      onClick={handleOpenMaps}
                    >
                      <Icon name="compass" size={17} />
                      <span>Buka Rute</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="map-wrapper">
              {hasCoordinates ? (
                <>
                  <iframe
                    title={`Lokasi ${dest.name}`}
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      `${dest.latitude},${dest.longitude}`
                    )}&hl=id&z=14&output=embed`}
                    width="100%"
                    height="400"
                    loading="lazy"
                    style={{ border: 0 }}
                    allowFullScreen
                  />

                  <div className="map-overlay-card">
                    <span className="map-overlay-icon">
                      <Icon name="location" size={16} />
                    </span>

                    <div>
                      <strong>{dest.name}</strong>
                      <small>{dest.location}</small>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenMaps}
                      aria-label={`Buka rute menuju ${dest.name}`}
                    >
                      <Icon name="arrowRight" size={15} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="map-empty">
                  <span>📍</span>

                  <strong>
                    Lokasi peta belum tersedia
                  </strong>

                  <small>
                    Koordinat destinasi belum ditambahkan.
                  </small>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>

      {/* =====================================
          CTA
      ===================================== */}

      <section className="destination-cta">
        <div className="cta-decoration cta-decoration-one" />
        <div className="cta-decoration cta-decoration-two" />

        <div className="cta-content">
          <span>
            PERSONALIZED LOCAL TOURISM DISCOVERY
          </span>

          <h2>Perjalananmu belum selesai.</h2>

          <p>
            Temukan destinasi lain yang sesuai dengan
            budget, waktu, lokasi, dan minatmu bersama
            NuSaJoy.
          </p>

          <div className="cta-mini-points">
            <span>✦ Lokal</span>
            <span>✦ Personal</span>
            <span>✦ Lebih bermakna</span>
          </div>
        </div>

        <Link to="/recommendation" className="cta-button">
          <span>Cari Rekomendasi</span>
          <Icon name="arrowRight" size={18} />
        </Link>
      </section>
    </main>
  )
}

export default DestinationDetail

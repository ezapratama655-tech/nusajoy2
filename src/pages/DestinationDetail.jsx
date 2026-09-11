import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import { isFavorite, toggleFavorite } from '../utils/favorites'
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
    tags: ['Keluarga', 'Edukatif']
  },
  {
    id: 2,
    name: 'Fajar Pratama',
    avatar: 'https://i.pravatar.cc/100?img=12',
    date: '1 bulan lalu',
    rating: 4,
    text: 'Lokasinya cukup mudah ditemukan dan suasananya berbeda dari tempat wisata biasa.',
    tags: ['Seru', 'Lokal']
  },
  {
    id: 3,
    name: 'Nadia Putri',
    avatar: 'https://i.pravatar.cc/100?img=32',
    date: '1 bulan lalu',
    rating: 5,
    text: 'Pengalaman yang menyenangkan. Sangat cocok untuk menghabiskan waktu sambil mengenal wisata lokal.',
    tags: ['Recommended', 'Experience']
  }
]


function DestinationDetail() {

  const { id } = useParams()

  const [dest, setDest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)
  const [fav, setFav] = useState(false)
  const [shared, setShared] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)

  const heroRef = useRef(null)
  const imageRef = useRef(null)


  // =====================================
  // FETCH DESTINATION
  // =====================================

  useEffect(() => {

    async function fetchDetail() {

      setLoading(true)
      setErrorMsg(null)

      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {

        setErrorMsg(error.message)

      } else {

        setDest(data)
        setFav(isFavorite(data.id))

      }

      setLoading(false)
    }

    fetchDetail()

  }, [id])


  // =====================================
  // PARALLAX EFFECT
  // =====================================

  useEffect(() => {

    const hero = heroRef.current
    const image = imageRef.current

    if (!hero || !image) return

    function handleMouseMove(e) {

      if (window.innerWidth <= 768) return

      const rect = hero.getBoundingClientRect()

      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const moveX = (x / rect.width - 0.5) * 14
      const moveY = (y / rect.height - 0.5) * 14

      image.style.setProperty(
        '--parallax-x',
        `${moveX}px`
      )

      image.style.setProperty(
        '--parallax-y',
        `${moveY}px`
      )
    }

    function resetPosition() {

      image.style.setProperty(
        '--parallax-x',
        '0px'
      )

      image.style.setProperty(
        '--parallax-y',
        '0px'
      )
    }

    hero.addEventListener(
      'mousemove',
      handleMouseMove
    )

    hero.addEventListener(
      'mouseleave',
      resetPosition
    )

    return () => {

      hero.removeEventListener(
        'mousemove',
        handleMouseMove
      )

      hero.removeEventListener(
        'mouseleave',
        resetPosition
      )

    }

  }, [dest])


  // =====================================
  // FAVORITE
  // =====================================

  function handleToggleFavorite() {

    if (!dest) return

    toggleFavorite(dest.id)

    setFav(isFavorite(dest.id))
  }


  // =====================================
  // SHARE
  // =====================================

  async function handleShare() {

    if (!dest) return

    const shareData = {
      title: `${dest.name} — NuSaJoy`,
      text: `Yuk lihat destinasi ${dest.name} di NuSaJoy.`,
      url: window.location.href
    }

    try {

      if (
        navigator.share &&
        /Android|iPhone|iPad|iPod/i.test(
          navigator.userAgent
        )
      ) {

        await navigator.share(shareData)

      } else if (navigator.clipboard) {

        await navigator.clipboard.writeText(
          window.location.href
        )

        setShared(true)

        setTimeout(() => {
          setShared(false)
        }, 2200)

      }

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

    if (!dest?.latitude || !dest?.longitude) return

    const mapsUrl =
      `https://www.google.com/maps/dir/?api=1&destination=${dest.latitude},${dest.longitude}`

    window.open(
      mapsUrl,
      '_blank',
      'noopener,noreferrer'
    )
  }


  // =====================================
  // LOADING
  // =====================================

  if (loading) {

    return (

      <div className="detail-loading">

        <div className="loading-spinner"></div>

        <p>
          Menyiapkan pengalaman wisata...
        </p>

      </div>

    )
  }


  // =====================================
  // ERROR
  // =====================================

  if (errorMsg) {

    return (

      <div className="detail-error">

        <div className="error-icon">
          !
        </div>

        <h2>
          Oops!
        </h2>

        <p>
          {errorMsg}
        </p>

        <Link to="/explore">
          ← Kembali ke Explore
        </Link>

      </div>

    )
  }


  if (!dest) {

    return (

      <div className="detail-error">

        <div className="error-icon">
          ?
        </div>

        <h2>
          Destinasi tidak ditemukan
        </h2>

        <p>
          Destinasi yang kamu cari mungkin sudah tidak tersedia.
        </p>

        <Link to="/explore">
          ← Kembali ke Explore
        </Link>

      </div>

    )
  }


  const visibleReviews = showAllReviews
    ? touristExperiences
    : touristExperiences.slice(0, 3)


  return (

    <main className="destination-detail">


      {/* =====================================
          HERO
      ===================================== */}

      <section
        className="destination-hero"
        ref={heroRef}
      >

        <img
          ref={imageRef}
          src={dest.image_url}
          alt={dest.name}
          className="destination-hero-image"
        />

        <div className="hero-overlay"></div>

        <div className="hero-glow"></div>

        <div className="hero-grain"></div>


        {/* BACK */}

        <Link
          to="/explore"
          className="back-button"
        >
          <span>←</span>
          <span>Kembali ke Explore</span>
        </Link>


        {/* HERO ACTIONS */}

        <div className="hero-actions">

          <button
            className={`hero-action ${
              fav ? 'active' : ''
            }`}
            onClick={handleToggleFavorite}
            aria-label={
              fav
                ? 'Hapus dari favorit'
                : 'Tambah ke favorit'
            }
          >
            {fav ? '♥' : '♡'}
          </button>


          <button
            className="hero-action"
            onClick={handleShare}
            aria-label="Bagikan destinasi"
          >
            ↗
          </button>

        </div>


        {/* HERO CONTENT */}

        <div className="hero-content">

          {dest.is_hidden_gem && (

            <span className="hero-badge">
              ✨ Hidden Gem
            </span>

          )}


          <p className="hero-location">
            📍 {dest.location}
          </p>


          <h1>
            {dest.name}
          </h1>


          <p className="hero-category">
            {dest.category}
          </p>


          <div className="hero-meta">

            <div className="hero-rating">
              <span>★</span>
              <strong>
                {dest.rating || '4.8'}
              </strong>
              <small>
                Rating wisatawan
              </small>
            </div>


            {dest.distance_from_city && (

              <div className="hero-distance">

                <span>
                  📍
                </span>

                <div>

                  <strong>
                    {dest.distance_from_city} km
                  </strong>

                  <small>
                    dari pusat kota
                  </small>

                </div>

              </div>

            )}

          </div>

        </div>


        {/* SCROLL */}

        <div className="scroll-indicator">

          <span>
            Jelajahi destinasi
          </span>

          <div>
            ↓
          </div>

        </div>

      </section>



      {/* =====================================
          SHARE TOAST
      ===================================== */}

      {shared && (

        <div className="share-toast">
          ✓ Link destinasi berhasil disalin
        </div>

      )}



      {/* =====================================
          QUICK INFORMATION
      ===================================== */}

      <section className="quick-info">

        <div className="info-card">

          <span className="info-icon">
            💰
          </span>

          <div>

            <small>
              Harga Tiket
            </small>

            <strong>
              {Number(dest.price || 0) === 0
                ? 'Gratis'
                : `Rp${Number(
                    dest.price
                  ).toLocaleString('id-ID')}`}
            </strong>

          </div>

        </div>


        <div className="info-card">

          <span className="info-icon">
            ⏱️
          </span>

          <div>

            <small>
              Durasi
            </small>

            <strong>
              {dest.duration
                ? `${dest.duration} jam`
                : '-'}
            </strong>

          </div>

        </div>


        <div className="info-card">

          <span className="info-icon">
            ⭐
          </span>

          <div>

            <small>
              Rating
            </small>

            <strong>
              {dest.rating || '-'}
            </strong>

          </div>

        </div>


        <div className="info-card">

          <span className="info-icon">
            🚗
          </span>

          <div>

            <small>
              Jarak
            </small>

            <strong>
              {dest.distance_from_city
                ? `${dest.distance_from_city} km`
                : '-'}
            </strong>

          </div>

        </div>


        <div className="info-card">

          <span className="info-icon">
            🧭
          </span>

          <div>

            <small>
              Perjalanan
            </small>

            <strong>
              {dest.travel_time_from_city
                ? `${dest.travel_time_from_city} menit`
                : '-'}
            </strong>

          </div>

        </div>

      </section>



      {/* =====================================
          MOBILE ACTION BAR
      ===================================== */}

      <div className="mobile-action-bar">

        <button
          onClick={handleToggleFavorite}
          className={
            fav ? 'mobile-action active' : 'mobile-action'
          }
        >
          <span>
            {fav ? '♥' : '♡'}
          </span>

          <small>
            {fav ? 'Tersimpan' : 'Simpan'}
          </small>

        </button>


        <button
          onClick={handleShare}
          className="mobile-action"
        >

          <span>
            ↗
          </span>

          <small>
            Bagikan
          </small>

        </button>


        <button
          onClick={handleOpenMaps}
          disabled={!dest.latitude || !dest.longitude}
          className="mobile-action mobile-action-primary"
        >

          <span>
            🧭
          </span>

          <small>
            Mulai Rute
          </small>

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

            <span className="section-label">
              TENTANG DESTINASI
            </span>

            <h2>
              Rasakan pengalaman lokalnya
            </h2>

            <p className="description">
              {dest.description}
            </p>

          </section>



          {/* =====================================
              HIGHLIGHTS
          ===================================== */}

          <section className="destination-highlights">

            <div className="highlight-heading">

              <div>

                <span className="section-label">
                  YANG BISA KAMU RASAKAN
                </span>

                <h2>
                  Lebih dari sekadar tempat
                </h2>

              </div>

            </div>


            <div className="highlight-grid">

              <article className="highlight-card">

                <div className="highlight-number">
                  01
                </div>

                <div className="highlight-icon">
                  🌿
                </div>

                <h3>
                  Suasana Lokal
                </h3>

                <p>
                  Nikmati karakter lokal dan suasana
                  yang berbeda dari destinasi mainstream.
                </p>

              </article>


              <article className="highlight-card">

                <div className="highlight-number">
                  02
                </div>

                <div className="highlight-icon">
                  📸
                </div>

                <h3>
                  Momen Berkesan
                </h3>

                <p>
                  Temukan spot dan pengalaman yang
                  cocok untuk mengisi perjalananmu.
                </p>

              </article>


              <article className="highlight-card">

                <div className="highlight-number">
                  03
                </div>

                <div className="highlight-icon">
                  🧭
                </div>

                <h3>
                  Eksplorasi Lokal
                </h3>

                <p>
                  Jelajahi tempat baru dan kenali
                  sisi lokal dari daerah tersebut.
                </p>

              </article>

            </div>

          </section>



          {/* =====================================
              WHY DESTINATION
          ===================================== */}

          <section className="experience-card">

            <div className="experience-icon">
              ✨
            </div>

            <div>

              <span className="experience-mini-label">
                NUS AJOY EXPERIENCE
              </span>

              <h3>
                Kenapa tempat ini menarik?
              </h3>

              <p>
                Temukan suasana lokal, pemandangan,
                dan pengalaman yang membuat perjalananmu
                berbeda dari wisata biasa.
              </p>

            </div>

          </section>



          {/* =====================================
              TRAVEL TIPS
          ===================================== */}

          <section className="travel-tips">

            <div className="travel-tips-header">

              <span className="section-label">
                SEBELUM BERANGKAT
              </span>

              <h2>
                Tips kecil untuk perjalananmu
              </h2>

            </div>


            <div className="tips-grid">

              <div className="tip-item">

                <span>
                  🕐
                </span>

                <div>

                  <strong>
                    Atur waktu
                  </strong>

                  <p>
                    Sisihkan waktu perjalanan agar
                    pengalamanmu lebih santai.
                  </p>

                </div>

              </div>


              <div className="tip-item">

                <span>
                  🎒
                </span>

                <div>

                  <strong>
                    Siapkan kebutuhan
                  </strong>

                  <p>
                    Bawa perlengkapan sesuai aktivitas
                    yang ingin kamu lakukan.
                  </p>

                </div>

              </div>


              <div className="tip-item">

                <span>
                  📍
                </span>

                <div>

                  <strong>
                    Cek rute
                  </strong>

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

              <div>

                <span className="section-label">
                  PENGALAMAN WISATAWAN
                </span>

                <h2>
                  Cerita dari mereka yang sudah datang
                </h2>

                <p>
                  Lihat pengalaman wisatawan lain
                  sebelum kamu memulai perjalananmu.
                </p>

              </div>


              <div className="experience-summary">

                <strong>
                  ⭐ {dest.rating || '4.8'}
                </strong>

                <span>
                  Rating wisatawan
                </span>

              </div>

            </div>



            <div className="experience-list">

              {visibleReviews.map(
                (experience) => (

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

                          <strong>
                            {experience.name}
                          </strong>

                          <span>
                            {experience.date}
                          </span>

                        </div>

                      </div>


                      <div className="review-rating">

                        {'★'.repeat(
                          experience.rating
                        )}

                      </div>

                    </div>


                    <p className="review-text">
                      “{experience.text}”
                    </p>


                    <div className="review-tags">

                      {experience.tags.map(
                        (tag) => (

                          <span key={tag}>
                            {tag}
                          </span>

                        )
                      )}

                    </div>

                  </article>

                )
              )}

            </div>


            <button
              className="experience-more"
              onClick={() =>
                setShowAllReviews(
                  !showAllReviews
                )
              }
            >

              {showAllReviews
                ? 'Tampilkan lebih sedikit'
                : 'Lihat semua pengalaman'}

              <span>
                {showAllReviews ? '↑' : '→'}
              </span>

            </button>

          </section>



          {/* =====================================
              LOCATION
          ===================================== */}

          <section className="content-section location-section">

            <span className="section-label">
              LOKASI
            </span>

            <div className="location-heading">

              <div>

                <h2>
                  Temukan jalannya
                </h2>

                <p>
                  Gunakan peta untuk melihat lokasi
                  dan merencanakan perjalananmu.
                </p>

              </div>


              {dest.latitude &&
                dest.longitude && (

                <button
                  className="map-route-button"
                  onClick={handleOpenMaps}
                >
                  🧭 Buka Rute
                </button>

              )}

            </div>


            <div className="map-wrapper">

              {dest.latitude &&
              dest.longitude ? (

                <iframe
                  title={`Lokasi ${dest.name}`}
                  src={`https://www.google.com/maps?q=${dest.latitude},${dest.longitude}&hl=id&z=14&output=embed`}
                  width="100%"
                  height="400"
                  loading="lazy"
                  style={{
                    border: 0
                  }}
                  allowFullScreen
                />

              ) : (

                <div className="map-empty">

                  <span>
                    📍
                  </span>

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

        <div className="cta-content">

          <span>
            PERSONALIZED LOCAL TOURISM DISCOVERY
          </span>

          <h2>
            Perjalananmu belum selesai.
          </h2>

          <p>
            Temukan destinasi lain yang sesuai
            dengan budget, waktu, lokasi, dan
            minatmu bersama NuSaJoy.
          </p>

        </div>


        <Link
          to="/recommendation"
          className="cta-button"
        >
          <span>
            Cari Rekomendasi
          </span>

          <span>
            →
          </span>
        </Link>

      </section>

    </main>
  )
}


export default DestinationDetail
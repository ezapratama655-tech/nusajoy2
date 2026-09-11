import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Star,
  MapPin,
  ShieldCheck,
  Languages,
  Clock3,
  MessageCircle,
  CalendarDays,
  Heart,
  CheckCircle2,
  BriefcaseBusiness,
  Navigation,
} from 'lucide-react'

import useTourGuideDetail from '../hooks/useTourGuideDetail'

import {
  isFavorite,
  toggleFavorite,
} from '../utils/favorites'

import '../styles/TourGuideDetail.css'

export default function TourGuideDetail() {
  const { id } = useParams()

  const {
    guide,
    loading,
    error,
  } = useTourGuideDetail(id)

  const [favorite, setFavorite] = useState(false)

  /* =========================================
     FAVORITE
  ========================================= */

  useEffect(() => {
    if (!guide?.id) return

    setFavorite(isFavorite(guide.id))
  }, [guide?.id])

  const handleFavorite = () => {
    if (!guide?.id) return

    const updatedFavorites = toggleFavorite(
      guide.id
    )

    setFavorite(
      updatedFavorites.some(
        (favoriteId) =>
          String(favoriteId) ===
          String(guide.id)
      )
    )
  }

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <div className="guide-detail-state">

        <div className="detail-loader" />

        <h3>
          Memuat profil pemandu...
        </h3>

        <p>
          Sebentar, kami menyiapkan detail
          pemandu.
        </p>

      </div>
    )
  }

  /* =========================================
     ERROR
  ========================================= */

  if (error || !guide) {
    return (
      <div className="guide-detail-state">

        <div className="detail-error-icon">
          !
        </div>

        <h2>
          Pemandu tidak ditemukan
        </h2>

        <p>
          Data pemandu yang kamu cari
          tidak tersedia.
        </p>

        <Link
          to="/guides"
          className="detail-back-button"
        >
          <ArrowLeft size={17} />
          Kembali ke Pemandu
        </Link>

      </div>
    )
  }

  /* =========================================
     NORMALIZE DATA
  ========================================= */

  const avatar =
    guide.avatar ||
    guide.photo ||
    guide.image ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=700&auto=format&fit=crop&q=80'

  const city =
    guide.city ||
    guide.location ||
    'Indonesia'

  const price = Number(
    guide.price_per_day ??
    guide.price ??
    0
  )

  const rating = Number(
    guide.rating ?? 0
  )

  const experience =
    guide.experience ??
    guide.experience_years ??
    0

  const trips = Number(
    guide.trips ??
    guide.total_trips ??
    0
  )

  const languages = Array.isArray(
    guide.languages
  )
    ? guide.languages
    : [
        'Indonesia',
        'English',
      ]

  const specialties = Array.isArray(
    guide.specialties
  )
    ? guide.specialties
    : [
        'Local Experience',
        'City Tour',
      ]

  const isOffline =
    guide.status === 'offline'

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="tour-guide-detail-page">

      {/* =====================================
          TOP BAR
      ===================================== */}

      <header className="detail-topbar">

        <Link
          to="/guides"
          className="detail-back-link"
        >
          <ArrowLeft size={19} />
          <span>Kembali</span>
        </Link>

        <button
          type="button"
          className={`detail-favorite-button ${
            favorite ? 'active' : ''
          }`}
          onClick={handleFavorite}
          aria-label={
            favorite
              ? 'Hapus dari favorit'
              : 'Tambah ke favorit'
          }
          aria-pressed={favorite}
        >
          <Heart
            size={20}
            fill={
              favorite
                ? 'currentColor'
                : 'none'
            }
          />
        </button>

      </header>

      {/* =====================================
          HERO
      ===================================== */}

      <section className="detail-hero">

        <img
          src={avatar}
          alt={
            guide.name ||
            'Pemandu wisata'
          }
          className="detail-hero-image"
        />

        <div className="detail-hero-overlay" />

        <div className="detail-hero-content">

          <div
            className={`detail-status ${
              isOffline
                ? 'offline'
                : ''
            }`}
          >
            <span />

            {isOffline
              ? 'Offline'
              : 'Tersedia sekarang'}
          </div>

          <h1>
            {guide.name ||
              'Pemandu Wisata'}
          </h1>

          <div className="detail-location">

            <MapPin size={16} />

            <span>
              {city}
            </span>

          </div>

        </div>

      </section>

      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <main className="detail-content">

        {/* ===================================
            PROFILE CARD
        =================================== */}

        <section className="detail-profile-card">

          <div className="detail-profile-top">

            {/* RATING */}

            <div className="detail-rating-box">

              <Star
                size={18}
                fill="currentColor"
              />

              <strong>
                {rating > 0
                  ? rating.toFixed(1)
                  : '5.0'}
              </strong>

              <span>
                Rating
              </span>

            </div>

            {/* TRIPS */}

            <div className="detail-stat">

              <strong>
                {trips}+
              </strong>

              <span>
                Perjalanan
              </span>

            </div>

            {/* EXPERIENCE */}

            <div className="detail-stat">

              <strong>
                {experience || '3'}
              </strong>

              <span>
                Tahun pengalaman
              </span>

            </div>

          </div>

          {/* VERIFIED */}

          {guide.verified && (
            <div className="detail-verified-box">

              <ShieldCheck size={19} />

              <div>

                <strong>
                  Pemandu Terverifikasi
                </strong>

                <span>
                  Identitas dan profil telah
                  diverifikasi oleh NuSaJoy.
                </span>

              </div>

            </div>
          )}

        </section>

        {/* ===================================
            ABOUT
        =================================== */}

        <section className="detail-section">

          <div className="detail-section-heading">
            <h2>
              Tentang Pemandu
            </h2>
          </div>

          <p className="detail-bio">
            {guide.bio ||
              `Saya ${guide.name || 'pemandu lokal'}, pemandu lokal yang siap membantu kamu menikmati pengalaman wisata yang lebih autentik dan menyenangkan di ${city}.`}
          </p>

        </section>

        {/* ===================================
            SPECIALTIES
        =================================== */}

        <section className="detail-section">

          <div className="detail-section-heading">
            <h2>
              Keahlian
            </h2>
          </div>

          <div className="specialty-list">

            {specialties.map(
              (specialty, index) => (
                <span
                  key={`${specialty}-${index}`}
                  className="specialty-chip"
                >

                  <CheckCircle2
                    size={15}
                  />

                  {specialty}

                </span>
              )
            )}

          </div>

        </section>

        {/* ===================================
            LANGUAGES
        =================================== */}

        <section className="detail-section">

          <div className="detail-section-heading">
            <h2>
              Bahasa
            </h2>
          </div>

          <div className="language-list">

            {languages.map(
              (language, index) => (
                <div
                  key={`${language}-${index}`}
                  className="language-item"
                >

                  <Languages
                    size={17}
                  />

                  <span>
                    {language}
                  </span>

                </div>
              )
            )}

          </div>

        </section>

        {/* ===================================
            SERVICE INFO
        =================================== */}

        <section className="detail-section">

          <div className="detail-section-heading">
            <h2>
              Informasi Layanan
            </h2>
          </div>

          <div className="service-grid">

            {/* SERVICE */}

            <div className="service-item">

              <div className="service-icon">
                <BriefcaseBusiness
                  size={18}
                />
              </div>

              <div>

                <span>
                  Layanan
                </span>

                <strong>
                  Private Tour
                </strong>

              </div>

            </div>

            {/* DURATION */}

            <div className="service-item">

              <div className="service-icon">
                <Clock3
                  size={18}
                />
              </div>

              <div>

                <span>
                  Durasi
                </span>

                <strong>
                  Flexible
                </strong>

              </div>

            </div>

            {/* AREA */}

            <div className="service-item">

              <div className="service-icon">
                <Navigation
                  size={18}
                />
              </div>

              <div>

                <span>
                  Area
                </span>

                <strong>
                  {city}
                </strong>

              </div>

            </div>

            {/* STATUS */}

            <div className="service-item">

              <div className="service-icon">
                <ShieldCheck
                  size={18}
                />
              </div>

              <div>

                <span>
                  Status
                </span>

                <strong>
                  {isOffline
                    ? 'Offline'
                    : 'Tersedia'}
                </strong>

              </div>

            </div>

          </div>

        </section>

        {/* ===================================
            BOOKING CARD
        =================================== */}

        <section
          className="detail-booking-card"
          id="booking"
        >

          {/* PRICE */}

          <div className="booking-price">

            <span>
              Harga mulai dari
            </span>

            <strong>
              Rp{' '}
              {price.toLocaleString(
                'id-ID'
              )}
            </strong>

            <small>
              / hari
            </small>

          </div>

          {/* ACTIONS */}

          <div className="booking-actions">

            {/* CHAT */}

            <button
              type="button"
              className="contact-guide-button"
              onClick={() =>
                alert(
                  'Fitur chat dengan pemandu akan segera tersedia.'
                )
              }
            >
              <MessageCircle
                size={18}
              />

              Chat
            </button>

            {/* BOOK */}

            <Link
              to={`/book/${guide.id}`}
              className="booking-button"
            >
              <CalendarDays
                size={18}
              />

              Pesan Pemandu
            </Link>

          </div>

          {/* NOTE */}

          <p className="booking-note">

            <ShieldCheck
              size={14}
            />

            Booking aman melalui NuSaJoy

          </p>

        </section>

      </main>

    </div>
  )
}
import { useMemo, useState } from 'react'
import useModalBehavior, {
  getBackdropProps,
} from '../hooks/useModalBehavior.js'
import {
  formatGuidePrice,
  getGuidePrice,
} from '../utils/guide.js'
import '../styles/DetailPemanduModal.css'


// =====================================================
// CONSTANT
// =====================================================

const FALLBACK_GUIDE_IMAGE =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="200"
      height="200"
      viewBox="0 0 200 200"
    >
      <rect width="200" height="200" rx="100" fill="#CFEACB"/>
      <circle cx="100" cy="76" r="34" fill="#174D36"/>
      <path
        d="M40 170c8-37 30-55 60-55s52 18 60 55"
        fill="#174D36"
      />
    </svg>
  `)


// =====================================================
// HELPERS
// =====================================================

const toNumber = (value, fallback = 0) => {
  const number = Number(value)

  return Number.isFinite(number)
    ? number
    : fallback
}


const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}


const normalizeGuide = (rawGuide) => {
  if (!rawGuide) return null

  return {
    ...rawGuide,

    id:
      rawGuide.id ??
      rawGuide.guide_id ??
      rawGuide.slug ??
      `guide-${Date.now()}`,

    name:
      rawGuide.name ||
      rawGuide.full_name ||
      rawGuide.fullName ||
      'Pemandu Lokal',

    role:
      rawGuide.role ||
      rawGuide.position ||
      'Local Travel Guide',

    city:
      rawGuide.city ||
      rawGuide.location_city ||
      rawGuide.location ||
      'Indonesia',

    location:
      rawGuide.location ||
      rawGuide.city ||
      'Lokasi belum tersedia',

    avatar:
      rawGuide.avatar ||
      rawGuide.avatar_url ||
      rawGuide.profile_photo ||
      rawGuide.image_url ||
      FALLBACK_GUIDE_IMAGE,

    rating: toNumber(rawGuide.rating, 0),

    reviewCount: toNumber(
      rawGuide.reviewCount ??
        rawGuide.review_count ??
        rawGuide.reviews_count,
      0
    ),

    trips: toNumber(
      rawGuide.trips ??
        rawGuide.trip_count ??
        rawGuide.total_trips,
      0
    ),

    experience:
      rawGuide.experience ??
      rawGuide.experience_years ??
      rawGuide.years_of_experience ??
      '—',

    status:
      rawGuide.status ||
      rawGuide.availability ||
      'active',

    bio:
      rawGuide.bio ||
      rawGuide.description ||
      `Kenali ${rawGuide.name || 'pemandu lokal'} lebih dekat dan nikmati perjalanan dengan perspektif lokal.`,

    specialties: normalizeList(
      rawGuide.specialties ??
      rawGuide.specialization ??
      rawGuide.skills
    ),

    languages: normalizeList(
      rawGuide.languages ??
      rawGuide.language
    ),

    certified:
      rawGuide.certified ??
      rawGuide.is_certified ??
      rawGuide.isCertified ??
      true,

    featuredReview:
      rawGuide.featuredReview ??
      rawGuide.featured_review ??
      null,
  }
}


const fallbackReview = (guide) => ({
  text:
    `Menjelajah bersama ${guide.name} terasa seperti diajak berkeliling oleh sahabat lama di kampung halaman.`,
  author: 'Traveler NuSaJoy',
})


// =====================================================
// COMPONENT WRAPPER
// =====================================================

export default function DetailPemanduModal({
  isOpen,
  onClose,
  guide: rawGuide,
  onAddToTrip,
  onOpenBookingSummary,
  onGoToMyTrip,
  isFavorited = false,
  onToggleFavorite,
  isInTrip = false,
}) {
  const guide = useMemo(
    () => normalizeGuide(rawGuide),
    [rawGuide]
  )

  useModalBehavior(
    isOpen && Boolean(guide),
    onClose
  )


  // ===================================================
  // GUARD
  // ===================================================

  if (!isOpen || !guide) {
    return null
  }


  // ===================================================
  // KEYED CONTENT
  // ===================================================
  //
  // Ketika:
  // - modal ditutup -> component di-unmount
  // - modal dibuka lagi -> state baru
  // - guide berubah -> component dibuat ulang
  //
  // Dengan cara ini addedSuccess tetap reset tanpa
  // memanggil setState() secara synchronous di useEffect.
  //

  return (
    <DetailPemanduModalContent
      key={String(guide.id)}
      onClose={onClose}
      guide={guide}
      onAddToTrip={onAddToTrip}
      onOpenBookingSummary={onOpenBookingSummary}
      onGoToMyTrip={onGoToMyTrip}
      isFavorited={isFavorited}
      onToggleFavorite={onToggleFavorite}
      isInTrip={isInTrip}
    />
  )
}


// =====================================================
// MODAL CONTENT
// =====================================================

function DetailPemanduModalContent({
  onClose,
  guide,
  onAddToTrip,
  onOpenBookingSummary,
  onGoToMyTrip,
  isFavorited = false,
  onToggleFavorite,
  isInTrip = false,
}) {
  // ===================================================
  // SUCCESS STATE
  // ===================================================

  const [addedSuccess, setAddedSuccess] =
    useState(false)


  // ===================================================
  // DERIVED DATA
  // ===================================================

  const inTrip =
    isInTrip ||
    addedSuccess

  const priceLabel =
    formatGuidePrice(getGuidePrice(guide))

  const price =
    getGuidePrice(guide)

  const review =
    guide.featuredReview ||
    fallbackReview(guide)

  const isOffline =
    String(guide.status).toLowerCase() === 'offline'

  const availabilityLabel =
    isOffline
      ? 'Sedang Offline'
      : 'Sedang Aktif'


  // ===================================================
  // HANDLERS
  // ===================================================

  const handleAddTrip = () => {
    onAddToTrip?.({
      ...guide,

      type: 'guide',
      title: guide.name,
      price,
      guide,
    })

    setAddedSuccess(true)
  }


  const handleMyTrip = () => {
    onClose?.()
    onGoToMyTrip?.()
  }


  const handleBook = () => {
    onOpenBookingSummary?.({
      id: guide.id,
      guideId: guide.id,
      listingId: guide.listingId,
      providerId: guide.providerId || guide.user_id,
      priceUnit: guide.priceUnit,
      maxGuests: guide.priceUnit === 'trip' ? 1 : undefined,
      title:
        `Pendampingan Wisata bersama ${guide.name}`,

      location: guide.location,

      price,

      guide,

      name: guide.name,

      type: 'guide',

      meetingPoint:
        `Dikoordinasikan langsung bersama ${guide.name}`,
    })
  }


  const handleFavorite = () => {
    onToggleFavorite?.(guide)
  }


  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div
      className="guide-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-modal-title"
      {...getBackdropProps(onClose)}
    >

      <div className="guide-modal__panel">


        {/* =================================================
            HEADER
        ================================================= */}

        <header className="guide-modal__header">

          <div className="guide-modal__header-info">

            <span className="guide-modal__eyebrow">
              PEMANDU LOKAL
            </span>

            <span className="guide-modal__separator">
              ·
            </span>

            <span className="guide-modal__city">
              {guide.city}
            </span>

          </div>


          <div className="guide-modal__header-actions">

            <button
              type="button"
              className={`guide-icon-button ${
                isFavorited
                  ? 'guide-icon-button--favorite'
                  : ''
              }`}
              onClick={handleFavorite}
              aria-pressed={isFavorited}
              aria-label={
                isFavorited
                  ? 'Hapus pemandu dari favorit'
                  : 'Simpan pemandu ke favorit'
              }
              title={
                isFavorited
                  ? 'Hapus favorit'
                  : 'Tambah favorit'
              }
            >

              <span className="material-symbols-outlined">
                favorite
              </span>

            </button>


            <button
              type="button"
              className="guide-icon-button"
              onClick={onClose}
              aria-label="Tutup detail pemandu"
              title="Tutup"
            >

              <span className="material-symbols-outlined">
                close
              </span>

            </button>

          </div>

        </header>


        {/* =================================================
            SUCCESS NOTICE
        ================================================= */}

        {addedSuccess && (
          <div className="guide-success">

            <div className="guide-success__content">

              <div className="guide-success__icon">

                <span className="material-symbols-outlined">
                  task_alt
                </span>

              </div>


              <div>

                <strong>
                  Pemandu ditambahkan
                </strong>

                <span>
                  {guide.name} sudah masuk ke My Trip.
                </span>

              </div>

            </div>


            <button
              type="button"
              className="guide-success__button"
              onClick={handleMyTrip}
            >
              Buka My Trip
            </button>

          </div>
        )}


        {/* =================================================
            MAIN
        ================================================= */}

        <main className="guide-modal__body">

          <div className="guide-modal__layout">


            {/* =================================================
                LEFT CONTENT
            ================================================= */}

            <div className="guide-modal__main">


              {/* PROFILE HERO */}

              <section className="guide-profile-card">

                <div className="guide-profile-card__avatar-wrap">

                  <img
                    src={guide.avatar}
                    alt={`Foto ${guide.name}`}
                    className="guide-profile-card__avatar"
                    onError={(event) => {
                      event.currentTarget.src =
                        FALLBACK_GUIDE_IMAGE
                    }}
                  />

                  <span
                    className={`guide-status-dot ${
                      isOffline
                        ? 'guide-status-dot--offline'
                        : ''
                    }`}
                    title={availabilityLabel}
                  />

                </div>


                <div className="guide-profile-card__content">

                  <div className="guide-profile-card__title-row">

                    <h1 id="guide-modal-title">
                      {guide.name}
                    </h1>

                    {guide.certified && (
                      <span className="guide-certified">

                        <span className="material-symbols-outlined">
                          verified
                        </span>

                        Tersertifikasi

                      </span>
                    )}

                  </div>


                  <p className="guide-profile-card__role">
                    {guide.role}
                  </p>


                  <div className="guide-rating">

                    <span className="material-symbols-outlined guide-rating__star">
                      star
                    </span>

                    <strong>
                      {guide.rating > 0
                        ? guide.rating.toFixed(1)
                        : 'Baru'}
                    </strong>

                    <span>
                      ({guide.reviewCount} ulasan)
                    </span>

                    <span className="guide-rating__dot">
                      ·
                    </span>

                    <strong>
                      {guide.trips}+
                    </strong>

                    <span>
                      perjalanan
                    </span>

                  </div>

                </div>

              </section>


              {/* QUICK STATS */}

              <section className="guide-stats">

                <div className="guide-stat">

                  <strong>
                    {guide.experience}
                  </strong>

                  <span>
                    Tahun pengalaman
                  </span>

                </div>


                <div className="guide-stat">

                  <strong>
                    {guide.trips}+
                  </strong>

                  <span>
                    Perjalanan
                  </span>

                </div>


                <div className="guide-stat">

                  <strong
                    className={
                      isOffline
                        ? 'guide-stat__offline'
                        : 'guide-stat__active'
                    }
                  >
                    {isOffline
                      ? 'Offline'
                      : 'Aktif'}
                  </strong>

                  <span>
                    Status
                  </span>

                </div>

              </section>


              {/* ABOUT */}

              <section className="guide-section">

                <div className="guide-section__heading">

                  <div className="guide-section__icon">

                    <span className="material-symbols-outlined">
                      person
                    </span>

                  </div>


                  <div>

                    <span className="guide-section__kicker">
                      TENTANG PEMANDU
                    </span>

                    <h2>
                      Cerita & latar belakang
                    </h2>

                  </div>

                </div>


                <p className="guide-section__text">
                  {guide.bio}
                </p>

              </section>


              {/* LOCATION / LANGUAGE */}

              {(guide.languages.length > 0 ||
                guide.location) && (

                <section className="guide-info-grid">

                  {guide.location && (
                    <div className="guide-info-card">

                      <div className="guide-info-card__icon">

                        <span className="material-symbols-outlined">
                          location_on
                        </span>

                      </div>


                      <div>

                        <span>
                          Area layanan
                        </span>

                        <strong>
                          {guide.location}
                        </strong>

                      </div>

                    </div>
                  )}


                  {guide.languages.length > 0 && (
                    <div className="guide-info-card">

                      <div className="guide-info-card__icon">

                        <span className="material-symbols-outlined">
                          translate
                        </span>

                      </div>


                      <div>

                        <span>
                          Bahasa
                        </span>

                        <strong>
                          {guide.languages.join(' · ')}
                        </strong>

                      </div>

                    </div>
                  )}

                </section>
              )}


              {/* SPECIALTIES */}

              {guide.specialties.length > 0 && (

                <section className="guide-section">

                  <div className="guide-section__heading">

                    <div className="guide-section__icon">

                      <span className="material-symbols-outlined">
                        explore
                      </span>

                    </div>


                    <div>

                      <span className="guide-section__kicker">
                        KEAHLIAN
                      </span>

                      <h2>
                        Fokus keahlian
                      </h2>

                    </div>

                  </div>


                  <div className="guide-specialties">

                    {guide.specialties.map(
                      (item, index) => (
                        <span
                          key={`${item}-${index}`}
                          className="guide-specialty"
                        >

                          <span className="material-symbols-outlined">
                            check_circle
                          </span>

                          {item}

                        </span>
                      )
                    )}

                  </div>

                </section>
              )}


              {/* REVIEW */}

              <figure className="guide-review">

                <div className="guide-review__top">

                  <div className="guide-review__icon">

                    <span className="material-symbols-outlined">
                      format_quote
                    </span>

                  </div>


                  <div>

                    <span className="guide-section__kicker">
                      TRAVELER REVIEW
                    </span>

                    <figcaption>
                      Ulasan pelancong
                    </figcaption>

                  </div>

                </div>


                <blockquote>
                  “{review.text}”
                </blockquote>


                <div className="guide-review__author">

                  <span className="guide-review__avatar">
                    {review.author
                      ?.charAt(0)
                      ?.toUpperCase() || 'T'}
                  </span>

                  <span>
                    {review.author}
                  </span>

                </div>

              </figure>

            </div>


            {/* =================================================
                DESKTOP BOOKING SIDEBAR
            ================================================= */}

            <aside className="guide-booking-sidebar">

              <div className="guide-booking-card">


                {/* CARD TOP */}

                <div className="guide-booking-card__top">

                  <span className="guide-booking-card__label">
                    TARIF PENDAMPINGAN
                  </span>

                  <strong className="guide-booking-card__price">
                    {priceLabel}
                  </strong>

                  <p>
                    Koordinasi langsung dengan pemandu,
                    tanpa markup agen.
                  </p>

                </div>


                {/* QUICK BENEFITS */}

                <div className="guide-benefits">

                  <div>

                    <span className="material-symbols-outlined">
                      verified
                    </span>

                    <span>
                      Pemandu lokal
                    </span>

                  </div>


                  <div>

                    <span className="material-symbols-outlined">
                      handshake
                    </span>

                    <span>
                      Koordinasi langsung
                    </span>

                  </div>


                  <div>

                    <span className="material-symbols-outlined">
                      luggage
                    </span>

                    <span>
                      Bisa ditambahkan ke My Trip
                    </span>

                  </div>

                </div>


                {/* ACTIONS */}

                <div className="guide-booking-actions">

                  <button
                    type="button"
                    className="guide-primary-button"
                    onClick={
                      inTrip
                        ? handleMyTrip
                        : handleAddTrip
                    }
                  >

                    <span className="material-symbols-outlined">
                      {inTrip
                        ? 'luggage'
                        : 'add_location_alt'}
                    </span>

                    <span>
                      {inTrip
                        ? 'Sudah di My Trip'
                        : 'Tambah ke Perjalanan'}
                    </span>

                  </button>


                  <button
                    type="button"
                    className="guide-secondary-button"
                    onClick={handleBook}
                  >

                    <span className="material-symbols-outlined">
                      bolt
                    </span>

                    <span>
                      Pesan Pemandu Sekarang
                    </span>

                  </button>

                </div>


                <p className="guide-booking-note">
                  Belum melakukan pembayaran.
                  Booking akan dilanjutkan melalui
                  ringkasan pemesanan.
                </p>

              </div>

            </aside>

          </div>

        </main>


        {/* =================================================
            MOBILE BOTTOM ACTION
        ================================================= */}

        <footer className="guide-mobile-actions">

          <div className="guide-mobile-price">

            <span>
              Mulai dari
            </span>

            <strong>
              {priceLabel}
            </strong>

          </div>


          <div className="guide-mobile-buttons">

            <button
              type="button"
              className="guide-mobile-trip"
              onClick={
                inTrip
                  ? handleMyTrip
                  : handleAddTrip
              }
            >
              {inTrip
                ? 'My Trip'
                : '+ Trip'}
            </button>


            <button
              type="button"
              className="guide-mobile-book"
              onClick={handleBook}
            >
              Pesan
            </button>

          </div>

        </footer>

      </div>

    </div>
  )
}

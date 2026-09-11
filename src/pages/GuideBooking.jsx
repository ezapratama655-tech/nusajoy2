import React, { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  FileText,
  Star,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react'

import useTourGuideDetail from '../hooks/useTourGuideDetail'
import '../styles/GuideBooking.css'

export default function GuideBooking() {
  const { id } = useParams()
  const navigate = useNavigate()

  const {
    guide,
    submitBooking,
    loading,
    bookingLoading,
  } = useTourGuideDetail(id)

  // =====================================================
  // STATE
  // =====================================================

  const [date, setDate] = useState('')
  const [durationDays, setDurationDays] = useState(1)
  const [notes, setNotes] = useState('')

  const [errorMsg, setErrorMsg] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [showDetails, setShowDetails] = useState(true)

  // =====================================================
  // TODAY
  // =====================================================

  const today = useMemo(() => {
    const now = new Date()

    const year = now.getFullYear()
    const month = String(
      now.getMonth() + 1
    ).padStart(2, '0')

    const day = String(
      now.getDate()
    ).padStart(2, '0')

    return `${year}-${month}-${day}`
  }, [])

  // =====================================================
  // FORMAT PRICE
  // =====================================================

  const formatPrice = (price = 0) => {
    return new Intl.NumberFormat(
      'id-ID'
    ).format(Number(price) || 0)
  }

  // =====================================================
  // GUIDE PRICE
  // =====================================================

  const pricePerDay =
    Number(
      guide?.price_per_day ??
      guide?.price ??
      0
    ) || 0

  const totalPrice =
    pricePerDay * durationDays

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formattedDate = useMemo(() => {
    if (!date) return null

    try {
      return new Date(
        `${date}T00:00:00`
      ).toLocaleDateString(
        'id-ID',
        {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }
      )
    } catch {
      return date
    }
  }, [date])

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="booking-page">
        <div className="booking-loading">
          <div className="booking-loading-icon">
            <Loader2
              size={30}
              className="spin"
            />
          </div>

          <h2>
            Memuat formulir...
          </h2>

          <p>
            Tunggu sebentar, kami sedang
            menyiapkan data pemandu.
          </p>
        </div>
      </main>
    )
  }

  // =====================================================
  // GUIDE NOT FOUND
  // =====================================================

  if (!guide) {
    return (
      <main className="booking-page">
        <section className="booking-empty">
          <div className="booking-empty-icon">
            <AlertCircle size={38} />
          </div>

          <h1>
            Data Tidak Ditemukan
          </h1>

          <p>
            Pemandu wisata yang kamu cari
            tidak tersedia atau telah
            dihapus.
          </p>

          <button
            type="button"
            className="booking-primary-button"
            onClick={() =>
              navigate('/guides')
            }
          >
            Kembali ke Pemandu
          </button>
        </section>
      </main>
    )
  }

  // =====================================================
  // SUCCESS
  // =====================================================

  if (isSuccess) {
    return (
      <main className="booking-page">
        <section className="booking-success">
          <div className="booking-success-icon">
            <CheckCircle2 size={46} />
          </div>

          <span className="booking-success-badge">
            Booking berhasil dibuat
          </span>

          <h1>
            Pemesanan Berhasil!
          </h1>

          <p>
            Permintaan pemesanan kamu telah
            berhasil dikirim kepada pemandu.
            Tunggu konfirmasi selanjutnya.
          </p>

          <div className="booking-success-card">
            <div>
              <span>Pemandu</span>
              <strong>
                {guide.name}
              </strong>
            </div>

            <div>
              <span>Tanggal</span>
              <strong>
                {formattedDate || '-'}
              </strong>
            </div>

            <div>
              <span>Durasi</span>
              <strong>
                {durationDays} hari
              </strong>
            </div>

            <div>
              <span>Total</span>
              <strong>
                Rp {formatPrice(totalPrice)}
              </strong>
            </div>
          </div>

          <div className="booking-success-actions">
            <button
              type="button"
              className="booking-secondary-button"
              onClick={() =>
                navigate('/')
              }
            >
              Beranda
            </button>

            <button
              type="button"
              className="booking-primary-button"
              onClick={() =>
                navigate('/bookings')
              }
            >
              Lihat Pesanan
            </button>
          </div>
        </section>
      </main>
    )
  }

  // =====================================================
  // DURATION
  // =====================================================

  const increaseDuration = () => {
    setDurationDays((current) =>
      Math.min(current + 1, 14)
    )
  }

  const decreaseDuration = () => {
    setDurationDays((current) =>
      Math.max(current - 1, 1)
    )
  }

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault()

    setErrorMsg('')

    // -----------------------------------------------
    // VALIDATION DATE
    // -----------------------------------------------

    if (!date) {
      setErrorMsg(
        'Silakan pilih tanggal perjalanan terlebih dahulu.'
      )

      return
    }

    // -----------------------------------------------
    // PREVENT PAST DATE
    // -----------------------------------------------

    if (date < today) {
      setErrorMsg(
        'Tanggal perjalanan tidak boleh sebelum hari ini.'
      )

      return
    }

    // -----------------------------------------------
    // VALIDATE DURATION
    // -----------------------------------------------

    if (
      durationDays < 1 ||
      durationDays > 14
    ) {
      setErrorMsg(
        'Durasi perjalanan harus antara 1–14 hari.'
      )

      return
    }

    // -----------------------------------------------
    // VALIDATE GUIDE PRICE
    // -----------------------------------------------

    if (pricePerDay <= 0) {
      setErrorMsg(
        'Tarif pemandu belum tersedia. Silakan pilih pemandu lain.'
      )

      return
    }

    try {
      const bookingPayload = {
        booking_date: date,
        duration_days: Number(
          durationDays
        ),
        total_price: Number(
          totalPrice
        ),
        notes: notes.trim(),
        status: 'pending',
      }

      const result =
        await submitBooking(
          bookingPayload
        )

      if (result?.success) {
        setIsSuccess(true)
      } else {
        setErrorMsg(
          result?.error ||
            'Gagal membuat pemesanan. Silakan coba lagi.'
        )
      }
    } catch (error) {
      console.error(
        'Submit booking error:',
        error
      )

      setErrorMsg(
        error?.message ||
          'Terjadi kesalahan saat membuat pemesanan.'
      )
    }
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="booking-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="booking-header">
        <button
          type="button"
          className="booking-back-button"
          onClick={() =>
            navigate(-1)
          }
          aria-label="Kembali"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="booking-header-title">
          <span>Booking</span>
          <strong>
            Pemandu Wisata
          </strong>
        </div>

        <div className="booking-header-spacer" />
      </header>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="booking-container">

        {/* =================================================
            PAGE INTRO
        ================================================= */}

        <section className="booking-intro">
          <span className="booking-eyebrow">
            Mulai perjalananmu
          </span>

          <h1>
            Atur perjalanan
            <br />
            bersama pemandu
          </h1>

          <p>
            Tentukan tanggal dan durasi
            perjalananmu. Kami akan
            membantu menyiapkan pemesanan
            dengan mudah.
          </p>
        </section>

        {/* =================================================
            GUIDE CARD
        ================================================= */}

        <section className="booking-guide-card">

          <div className="booking-guide-image-wrapper">
            <img
              src={
                guide.avatar ||
                guide.photo ||
                guide.image ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80'
              }
              alt={guide.name}
              className="booking-guide-image"
            />

            {guide.status ===
              'online' && (
              <span className="booking-online-badge">
                <span />
                Online
              </span>
            )}
          </div>

          <div className="booking-guide-info">

            <div className="booking-guide-name-row">
              <h2>
                {guide.name}
              </h2>

              {guide.verified && (
                <ShieldCheck
                  size={17}
                  className="verified-icon"
                />
              )}
            </div>

            <div className="booking-guide-location">
              <MapPin size={14} />
              <span>
                {guide.city ||
                  guide.location ||
                  'Indonesia'}
              </span>
            </div>

            <div className="booking-guide-meta">
              <div className="booking-rating">
                <Star
                  size={14}
                  fill="currentColor"
                />
                <strong>
                  {guide.rating
                    ? Number(
                        guide.rating
                      ).toFixed(1)
                    : 'Baru'}
                </strong>
              </div>

              <span className="meta-dot">
                •
              </span>

              <span>
                {guide.trips || 0}{' '}
                perjalanan
              </span>
            </div>

          </div>

          <div className="booking-guide-price">
            <span>
              Mulai dari
            </span>

            <strong>
              Rp {formatPrice(pricePerDay)}
            </strong>

            <small>
              / hari
            </small>
          </div>

        </section>

        {/* =================================================
            FORM
        ================================================= */}

        <form
          className="booking-form"
          onSubmit={handleSubmit}
        >

          {/* ===============================================
              TRIP DETAILS
          =============================================== */}

          <section className="booking-section">

            <button
              type="button"
              className="booking-section-header"
              onClick={() =>
                setShowDetails(
                  (current) =>
                    !current
                )
              }
            >
              <div>
                <span className="section-number">
                  01
                </span>

                <div>
                  <h2>
                    Detail perjalanan
                  </h2>

                  <p>
                    Pilih tanggal dan durasi
                  </p>
                </div>
              </div>

              {showDetails ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>

            {showDetails && (
              <div className="booking-section-content">

                {/* DATE */}

                <div className="booking-field">

                  <label htmlFor="booking-date">
                    <CalendarDays
                      size={17}
                    />

                    <span>
                      Tanggal perjalanan
                    </span>

                    <b>*</b>
                  </label>

                  <div className="booking-input-wrapper">
                    <CalendarDays
                      size={18}
                      className="booking-input-icon"
                    />

                    <input
                      id="booking-date"
                      type="date"
                      required
                      min={today}
                      value={date}
                      onChange={(event) =>
                        setDate(
                          event.target.value
                        )
                      }
                    />
                  </div>

                  {formattedDate && (
                    <div className="booking-date-preview">
                      <CheckCircle2
                        size={15}
                      />

                      <span>
                        {formattedDate}
                      </span>
                    </div>
                  )}

                </div>

                {/* DURATION */}

                <div className="booking-field">

                  <label>
                    <Clock3
                      size={17}
                    />

                    <span>
                      Durasi perjalanan
                    </span>

                    <b>*</b>
                  </label>

                  <div className="duration-control">

                    <button
                      type="button"
                      onClick={
                        decreaseDuration
                      }
                      disabled={
                        durationDays <= 1
                      }
                      aria-label="Kurangi durasi"
                    >
                      −
                    </button>

                    <div className="duration-value">
                      <strong>
                        {durationDays}
                      </strong>

                      <span>
                        {durationDays ===
                        1
                          ? 'hari'
                          : 'hari'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={
                        increaseDuration
                      }
                      disabled={
                        durationDays >=
                        14
                      }
                      aria-label="Tambah durasi"
                    >
                      +
                    </button>

                  </div>

                  <small className="booking-helper">
                    Maksimal 14 hari per
                    pemesanan.
                  </small>

                </div>

              </div>
            )}

          </section>

          {/* ===============================================
              NOTES
          =============================================== */}

          <section className="booking-section">

            <div className="booking-section-header static">

              <div>
                <span className="section-number">
                  02
                </span>

                <div>
                  <h2>
                    Catatan perjalanan
                  </h2>

                  <p>
                    Sampaikan kebutuhanmu
                  </p>
                </div>
              </div>

            </div>

            <div className="booking-section-content">

              <div className="booking-field">

                <label htmlFor="booking-notes">
                  <FileText
                    size={17}
                  />

                  <span>
                    Catatan tambahan
                  </span>

                  <small>
                    Opsional
                  </small>
                </label>

                <textarea
                  id="booking-notes"
                  rows={5}
                  maxLength={500}
                  placeholder="Contoh: Saya ingin mengunjungi destinasi budaya, mencoba kuliner lokal, dan membutuhkan titik penjemputan..."
                  value={notes}
                  onChange={(event) =>
                    setNotes(
                      event.target.value
                    )
                  }
                />

                <div className="textarea-footer">
                  <span>
                    Tambahkan informasi
                    yang membantu guide
                    memahami kebutuhanmu.
                  </span>

                  <strong>
                    {notes.length}/500
                  </strong>
                </div>

              </div>

            </div>

          </section>

          {/* ===============================================
              ERROR
          =============================================== */}

          {errorMsg && (
            <div
              className="booking-form-error"
              role="alert"
            >
              <AlertCircle
                size={19}
              />

              <div>
                <strong>
                  Pemesanan belum dapat
                  diproses
                </strong>

                <span>
                  {errorMsg}
                </span>
              </div>
            </div>
          )}

          {/* ===============================================
              DESKTOP PRICE SUMMARY
          =============================================== */}

          <section className="booking-price-card">

            <div className="price-card-heading">
              <div>
                <span>
                  Ringkasan biaya
                </span>

                <small>
                  Estimasi sebelum
                  konfirmasi
                </small>
              </div>

              <Info size={18} />
            </div>

            <div className="price-row">
              <span>
                Tarif guide
              </span>

              <strong>
                Rp {formatPrice(pricePerDay)}
              </strong>
            </div>

            <div className="price-row">
              <span>
                Durasi
              </span>

              <strong>
                × {durationDays} hari
              </strong>
            </div>

            <div className="price-divider" />

            <div className="price-total">
              <span>
                Total estimasi
              </span>

              <strong>
                Rp {formatPrice(totalPrice)}
              </strong>
            </div>

          </section>

          {/* ===============================================
              MOBILE STICKY ACTION
          =============================================== */}

          <div className="booking-mobile-action">

            <div className="mobile-total">
              <span>
                Total
              </span>

              <strong>
                Rp {formatPrice(totalPrice)}
              </strong>
            </div>

            <button
              type="submit"
              className="booking-primary-button"
              disabled={
                bookingLoading ||
                isSubmittingDisabled(
                  date,
                  pricePerDay
                )
              }
            >
              {bookingLoading ? (
                <>
                  <Loader2
                    size={18}
                    className="spin"
                  />

                  Memproses...
                </>
              ) : (
                'Konfirmasi Booking'
              )}
            </button>

          </div>

          {/* ===============================================
              DESKTOP ACTION
          =============================================== */}

          <div className="booking-desktop-action">

            <div>
              <span>
                Total estimasi
              </span>

              <strong>
                Rp {formatPrice(totalPrice)}
              </strong>
            </div>

            <button
              type="submit"
              className="booking-primary-button"
              disabled={
                bookingLoading ||
                isSubmittingDisabled(
                  date,
                  pricePerDay
                )
              }
            >
              {bookingLoading ? (
                <>
                  <Loader2
                    size={18}
                    className="spin"
                  />

                  Memproses...
                </>
              ) : (
                <>
                  Konfirmasi Booking
                </>
              )}
            </button>

          </div>

          <p className="booking-disclaimer">
            Dengan melanjutkan booking,
            kamu menyetujui detail pemesanan
            yang telah dipilih.
          </p>

        </form>

      </div>
    </main>
  )
}

// =====================================================
// BUTTON VALIDATION HELPER
// =====================================================

function isSubmittingDisabled(
  date,
  price
) {
  return !date || price <= 0
}
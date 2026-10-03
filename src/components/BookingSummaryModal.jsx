/**
 * @file src/components/BookingSummaryModal.jsx
 * NuSaJoy — Universal Booking Summary Modal
 *
 * Prinsip:
 * - Satu alur booking untuk pengalaman dan pemandu.
 * - Tidak ada data pengguna/pemandu yang di-hardcode sebagai data asli.
 * - Semua hooks dipanggil sebelum guard clause.
 * - State dan kalkulasi booking dikelola oleh useBookingForm.
 * - Rincian harga dikelola oleh PriceBreakdown.
 * - Tampilan sukses dikelola oleh BookingSuccessState.
 *
 * Struktur:
 *
 * src/
 * ├── components/
 * │   ├── BookingSummaryModal.jsx
 * │   └── booking/
 * │       ├── PriceBreakdown.jsx
 * │       └── BookingSuccessState.jsx
 * │
 * ├── hooks/
 * │   └── useBookingForm.js
 * │
 * └── utils/
 *     └── profile.js
 */

import {
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import {
  useBookingForm,
} from '../hooks/useBookingForm.js';

import PriceBreakdown from './booking/PriceBreakdown.jsx';

import BookingSuccessState from './booking/BookingSuccessState.jsx';

import {
  getUserProfile,
} from '../utils/profile.js';


/* ==========================================================================
   HELPERS
   ========================================================================== */

/**
 * Menghasilkan tanggal hari ini dalam format:
 * YYYY-MM-DD
 *
 * Digunakan sebagai nilai minimum
 * pada date picker booking.
 */
const getTodayISODate = () => {
  const today = new Date();

  const year =
    today.getFullYear();

  const month =
    String(
      today.getMonth() + 1,
    ).padStart(2, '0');

  const day =
    String(
      today.getDate(),
    ).padStart(2, '0');

  return `${year}-${month}-${day}`;
};


/**
 * Mengambil nomor WhatsApp pemandu
 * dari beberapa kemungkinan struktur data.
 *
 * Tidak membuat nomor palsu.
 */
const getGuidePhone = (
  bookingData,
) => {
  if (!bookingData) {
    return '';
  }

  return (
    bookingData.guide?.phone ||
    bookingData.guide?.phoneNumber ||
    bookingData.guidePhone ||
    ''
  );
};


/**
 * Mengambil nama pemandu.
 *
 * Tidak memberikan nama default
 * seolah-olah merupakan data asli.
 */
const getGuideName = (
  bookingData,
) => {
  if (!bookingData) {
    return '';
  }

  return (
    bookingData.guide?.name ||
    bookingData.guideName ||
    bookingData.name ||
    ''
  );
};


/**
 * Membuat label jenis booking.
 */
const getBookingTypeLabel = (
  bookingData,
) => {
  if (
    bookingData?.type ===
    'guide'
  ) {
    return 'Layanan Pemandu';
  }

  return 'Pengalaman Lokal';
};


/**
 * Mengambil gambar booking.
 *
 * Mendukung beberapa format data
 * agar komponen tetap kompatibel.
 */
const getBookingImage = (
  bookingData,
) => {
  if (!bookingData) {
    return '';
  }

  return (
    bookingData.image ||
    bookingData.imageUrl ||
    bookingData.thumbnail ||
    ''
  );
};


/**
 * Mengambil lokasi booking.
 */
const getBookingLocation = (
  bookingData,
) => {
  if (!bookingData) {
    return '';
  }

  return (
    bookingData.location ||
    bookingData.address ||
    ''
  );
};


/**
 * Normalisasi title agar tidak
 * menyebabkan heading kosong.
 */
const getBookingTitle = (
  bookingData,
) => {
  return (
    bookingData?.title ||
    bookingData?.name ||
    'Reservasi NuSaJoy'
  );
};


/* ==========================================================================
   COMPONENT
   ========================================================================== */

export default function BookingSummaryModal({
  isOpen = false,
  onClose,
  bookingData = null,
  onBookingSuccess,
  onGoToMyTrip,
}) {
  /* ------------------------------------------------------------------------
     REFS
  ------------------------------------------------------------------------ */

  const dialogRef =
    useRef(null);

  const closeButtonRef =
    useRef(null);


  /* ------------------------------------------------------------------------
     ACCESSIBLE UNIQUE IDS
  ------------------------------------------------------------------------ */

  const generatedId =
    useId();

  const titleId =
    `booking-title-${generatedId}`;

  const descriptionId =
    `booking-description-${generatedId}`;

  const formErrorId =
    `booking-error-${generatedId}`;


  /* ------------------------------------------------------------------------
     LOCAL UI STATE
  ------------------------------------------------------------------------ */

  const [
    submitError,
    setSubmitError,
  ] = useState('');


  /* ------------------------------------------------------------------------
     BOOKING FORM HOOK
  ------------------------------------------------------------------------ */

  /**
   * Penting:
   *
   * useBookingForm dipanggil SELALU,
   * bahkan ketika modal sedang tertutup.
   *
   * Ini menjaga urutan hooks tetap konsisten.
   */
  const {
    guestsCount,
    selectedDate,
    setSelectedDate,

    customerName,
    setCustomerName,

    customerPhone,
    setCustomerPhone,

    customerNotes,
    setCustomerNotes,

    paymentMethod,
    setPaymentMethod,

    isSubmitted,
    confirmedOrder,

    unitPrice,
    maxGuests,

    baseCost,
    conservationFund,
    totalAmount,

    increaseGuests,
    decreaseGuests,

    submitBooking,
  } = useBookingForm(
    bookingData,
    isOpen,
  );


  /* ------------------------------------------------------------------------
     PROFILE PREFILL
  ------------------------------------------------------------------------ */

  /**
   * Profil pengguna menjadi sumber data awal
   * bila field booking masih kosong.
   *
   * Ini tidak menggantikan data yang sudah
   * sengaja dimasukkan pengguna.
   */
  useEffect(() => {
    if (
      !isOpen ||
      !bookingData
    ) {
      return;
    }

    try {
      const profile =
        getUserProfile();

      if (
        !customerName &&
        profile?.name
      ) {
        setCustomerName(
          profile.name,
        );
      }

      if (
        !customerPhone &&
        profile?.phone
      ) {
        setCustomerPhone(
          profile.phone,
        );
      }
    } catch (error) {
      console.warn(
        'NuSaJoy: profil lokal tidak dapat dipakai untuk prefill booking.',
        error,
      );
    }
  }, [
    isOpen,
    bookingData,
    customerName,
    customerPhone,
    setCustomerName,
    setCustomerPhone,
  ]);


  /* ------------------------------------------------------------------------
     RESET ERROR WHEN BOOKING CHANGES
  ------------------------------------------------------------------------ */

  useEffect(() => {
    const resetTimer =
      window.setTimeout(() => {
        setSubmitError('');
      }, 0);

    return () => {
      window.clearTimeout(
        resetTimer,
      );
    };
  }, [
    bookingData,
    isOpen,
  ]);


  /* ------------------------------------------------------------------------
     MODAL BEHAVIOR
  ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      'hidden';

    /**
     * Fokus awal dipindahkan ke
     * tombol close agar keyboard
     * user langsung mempunyai
     * titik interaksi yang jelas.
     */
    const focusTimer =
      window.setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 0);

    const handleKeyDown =
      (event) => {
        if (
          event.key ===
          'Escape'
        ) {
          event.preventDefault();
          onClose?.();
        }
      };

    document.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      window.clearTimeout(
        focusTimer,
      );

      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [
    isOpen,
    onClose,
  ]);


  /* ------------------------------------------------------------------------
     DERIVED BOOKING DATA
  ------------------------------------------------------------------------ */

  const bookingTitle =
    getBookingTitle(
      bookingData,
    );

  const bookingTypeLabel =
    getBookingTypeLabel(
      bookingData,
    );

  const bookingImage =
    getBookingImage(
      bookingData,
    );

  const bookingLocation =
    getBookingLocation(
      bookingData,
    );

  const guideName =
    getGuideName(
      bookingData,
    );

  const guidePhone =
    getGuidePhone(
      bookingData,
    );


  /* ------------------------------------------------------------------------
     HANDLERS
  ------------------------------------------------------------------------ */

  /**
   * Submit booking.
   *
   * Hook bertanggung jawab
   * membuat object order.
   */
  const handleConfirmPay =
    (event) => {
      event.preventDefault();

      setSubmitError('');

      try {
        const newOrder =
          submitBooking();

        /**
         * Pengaman bila hook gagal
         * menghasilkan order.
         */
        if (!newOrder) {
          throw new Error(
            'Data reservasi tidak berhasil dibuat.',
          );
        }

        onBookingSuccess?.(
          newOrder,
        );
      } catch (error) {
        console.error(
          'NuSaJoy: booking gagal dikonfirmasi.',
          error,
        );

        setSubmitError(
          error?.message ||
            'Reservasi belum dapat diproses. Periksa kembali data booking kamu.',
        );
      }
    };


  /**
   * Klik area overlay.
   *
   * Hanya menutup ketika user
   * benar-benar mengklik backdrop.
   */
  const handleOverlayMouseDown =
    (event) => {
      if (
        event.target ===
        event.currentTarget
      ) {
        onClose?.();
      }
    };


  /**
   * Contact guide.
   *
   * Tidak membuat nomor palsu.
   */
  const handleContactGuide =
    () => {
      if (!guidePhone) {
        setSubmitError(
          'Nomor WhatsApp pemandu belum tersedia.',
        );

        return;
      }

      const cleanPhone =
        String(
          guidePhone,
        ).replace(/\D/g, '');

      if (!cleanPhone) {
        setSubmitError(
          'Nomor WhatsApp pemandu tidak valid.',
        );

        return;
      }

      const customer =
        customerName ||
        'peserta NuSaJoy';

      const message =
        `Halo ${guideName || 'Pemandu Lokal'}, ` +
        `saya ${customer}. ` +
        `Saya baru saja melakukan reservasi ` +
        `"${bookingTitle}" ` +
        `di NuSaJoy. ` +
        `Kode reservasi saya ${
          confirmedOrder?.id || ''
        }.`;

      const whatsappUrl =
        `https://wa.me/${cleanPhone}` +
        `?text=${encodeURIComponent(
          message,
        )}`;

      window.open(
        whatsappUrl,
        '_blank',
        'noopener,noreferrer',
      );
    };


  /**
   * Kembali ke My Trip.
   */
  const handleGoToMyTrip =
    () => {
      onGoToMyTrip?.();

      if (!onGoToMyTrip) {
        onClose?.();
      }
    };


  /* ------------------------------------------------------------------------
     GUARD CLAUSE
     ------------------------------------------------------------------------
     Semua hooks sudah selesai dipanggil.
  ------------------------------------------------------------------------ */

  if (
    !isOpen ||
    !bookingData
  ) {
    return null;
  }


  /* ------------------------------------------------------------------------
     RENDER
  ------------------------------------------------------------------------ */

  return (
    <div
      className="
        fixed
        inset-0
        z-50

        flex
        items-center
        justify-center

        overflow-y-auto

        bg-black/60
        p-3
        backdrop-blur-sm

        sm:p-4
      "
      onMouseDown={
        handleOverlayMouseDown
      }
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={
          descriptionId
        }
        tabIndex={-1}

        className="
          my-4
          w-full
          max-w-[560px]

          overflow-hidden

          rounded-[24px]
          border
          border-[#DDE2D9]

          bg-[#FFFDF7]

          shadow-[0_24px_80px_rgba(23,37,30,0.22)]

          outline-none

          sm:my-6
        "
      >
        {/* ================================================================
            HEADER
        ================================================================= */}

        <header
          className="
            flex
            items-center
            justify-between
            gap-4

            bg-[#174D36]

            px-5
            py-4.5

            text-white
            sm:px-6
          "
        >
          <div
            className="
              flex
              min-w-0
              items-center
              gap-3
            "
          >
            <span
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center

                rounded-xl

                bg-white/10
                text-[#C69A3A]
              "
              aria-hidden="true"
            >
              <span
                className="
                  material-symbols-outlined
                  text-[22px]
                "
              >
                receipt_long
              </span>
            </span>

            <div
              id={descriptionId}
              className="min-w-0"
            >
              <h2
                id={titleId}
                className="
                  font-['Outfit']
                  text-[18px]
                  font-bold
                  leading-tight
                  sm:text-[19px]
                "
              >
                Ringkasan Reservasi
              </h2>

              <p
                className="
                  mt-0.5
                  text-[11px]
                  font-medium
                  text-[#BFD2C5]
                "
              >
                Periksa detail sebelum
                melakukan pembayaran
              </p>
            </div>
          </div>


          <button
            ref={
              closeButtonRef
            }
            type="button"
            onClick={onClose}
            aria-label="
              Tutup ringkasan reservasi
            "
            title="
              Tutup ringkasan reservasi
            "
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center

              rounded-full

              text-white/80

              transition-all
              duration-200

              hover:bg-white/10
              hover:text-white

              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-white/60

              cursor-pointer
            "
          >
            <span
              className="
                material-symbols-outlined
                text-[20px]
              "
              aria-hidden="true"
            >
              close
            </span>
          </button>
        </header>


        {/* ================================================================
            SUCCESS STATE
        ================================================================= */}

        {isSubmitted ? (
          <BookingSuccessState
            confirmedOrder={
              confirmedOrder
            }
            customerName={
              customerName ||
              'Pengguna NuSaJoy'
            }
            onClose={
              onClose
            }
            onGoToMyTrip={
              onGoToMyTrip
                ? handleGoToMyTrip
                : undefined
            }
            onContactGuide={
              handleContactGuide
            }
          />
        ) : (
          /* ================================================================
             BOOKING FORM
          ================================================================= */

          <form
            onSubmit={
              handleConfirmPay
            }
            className="
              max-h-[calc(100vh-100px)]
              overflow-y-auto

              p-5

              sm:p-6
            "
          >
            {/* ==========================================================
                ERROR BANNER
            =========================================================== */}

            {submitError && (
              <div
                id={formErrorId}
                role="alert"
                aria-live="assertive"

                className="
                  mb-5

                  flex
                  items-start
                  gap-2.5

                  rounded-[14px]
                  border
                  border-[#E7B6AE]

                  bg-[#FFF3F0]

                  px-3.5
                  py-3

                  text-[12px]
                  leading-relaxed
                  text-[#8F3E2B]
                "
              >
                <span
                  className="
                    material-symbols-outlined
                    mt-0.5
                    shrink-0
                    text-[17px]
                  "
                  aria-hidden="true"
                >
                  error
                </span>

                <div className="flex-1">
                  <p className="font-semibold">
                    Reservasi belum diproses
                  </p>

                  <p className="mt-0.5">
                    {submitError}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSubmitError('')
                  }
                  aria-label="
                    Tutup pesan error
                  "
                  className="
                    shrink-0
                    text-[#8F3E2B]

                    hover:text-[#5F271C]

                    cursor-pointer
                  "
                >
                  <span
                    className="
                      material-symbols-outlined
                      text-[16px]
                    "
                    aria-hidden="true"
                  >
                    close
                  </span>
                </button>
              </div>
            )}


            {/* ==========================================================
                BOOKING ITEM
            =========================================================== */}

            <section
              aria-label="
                Detail pengalaman yang dipesan
              "
              className="
                rounded-[18px]
                border
                border-[#DDE2D9]

                bg-[#FAF4DD]

                p-3.5
                sm:p-4
              "
            >
              <div
                className="
                  flex
                  items-start
                  gap-3.5
                "
              >
                {/* Image */}

                {bookingImage ? (
                  <img
                    src={bookingImage}
                    alt=""
                    className="
                      h-[72px]
                      w-[72px]
                      shrink-0

                      rounded-[14px]

                      object-cover

                      ring-1
                      ring-black/5
                    "
                  />
                ) : (
                  <div
                    className="
                      flex
                      h-[72px]
                      w-[72px]
                      shrink-0

                      items-center
                      justify-center

                      rounded-[14px]

                      bg-[#E8EFE3]

                      text-[#174D36]
                    "
                    aria-hidden="true"
                  >
                    <span
                      className="
                        material-symbols-outlined
                        text-[27px]
                      "
                    >
                      landscape
                    </span>
                  </div>
                )}


                {/* Content */}

                <div className="min-w-0 flex-1">
                  <span
                    className="
                      inline-flex
                      items-center

                      rounded-full
                      bg-[#FFFDF7]

                      px-2
                      py-1

                      font-['Plus_Jakarta_Sans']
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.06em]

                      text-[#B5653A]
                    "
                  >
                    {bookingTypeLabel}
                  </span>

                  <h3
                    className="
                      mt-1.5

                      font-['Outfit']
                      text-[16px]
                      font-bold
                      leading-snug
                      text-[#17251E]
                    "
                  >
                    {bookingTitle}
                  </h3>

                  {bookingLocation && (
                    <div
                      className="
                        mt-1

                        flex
                        items-start
                        gap-1

                        text-[11px]
                        leading-relaxed
                        text-[#68736D]
                      "
                    >
                      <span
                        className="
                          material-symbols-outlined
                          mt-px
                          text-[14px]
                        "
                        aria-hidden="true"
                      >
                        location_on
                      </span>

                      <span>
                        {bookingLocation}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </section>


            {/* ==========================================================
                DATE + GUESTS
            =========================================================== */}

            <section
              className="
                mt-5

                grid
                grid-cols-1
                gap-4

                sm:grid-cols-2
              "
            >
              {/* Date */}

              <div>
                <label
                  htmlFor="
                    booking-date
                  "
                  className="
                    mb-1.5
                    block

                    text-[12px]
                    font-semibold
                    text-[#17251E]
                  "
                >
                  Tanggal kegiatan
                </label>

                <div
                  className="
                    flex
                    items-center
                    gap-2

                    rounded-[14px]
                    border
                    border-[#DDE2D9]

                    bg-white

                    px-3
                    py-2.5

                    transition-colors

                    focus-within:border-[#174D36]
                  "
                >
                  <span
                    className="
                      material-symbols-outlined
                      shrink-0
                      text-[18px]
                      text-[#68736D]
                    "
                    aria-hidden="true"
                  >
                    calendar_month
                  </span>

                  <input
                    id="booking-date"
                    type="date"
                    value={
                      selectedDate || ''
                    }
                    min={
                      getTodayISODate()
                    }
                    onChange={(event) =>
                      setSelectedDate(
                        event.target.value,
                      )
                    }
                    aria-invalid={
                      !selectedDate
                    }
                    className="
                      min-w-0
                      w-full

                      bg-transparent

                      text-[12px]
                      text-[#17251E]

                      outline-none
                    "
                    required
                  />
                </div>
              </div>


              {/* Guests */}

              <div>
                <span
                  className="
                    mb-1.5
                    block

                    text-[12px]
                    font-semibold
                    text-[#17251E]
                  "
                >
                  Jumlah peserta
                </span>

                <div
                  className="
                    flex
                    h-[44px]
                    items-center
                    justify-between
                    gap-3

                    rounded-[14px]
                    border
                    border-[#DDE2D9]

                    bg-white

                    px-2
                  "
                >
                  <button
                    type="button"
                    onClick={
                      decreaseGuests
                    }
                    disabled={
                      guestsCount <= 1
                    }
                    aria-label="
                      Kurangi jumlah peserta
                    "
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center

                      rounded-[10px]

                      bg-[#FAF4DD]

                      text-[18px]
                      font-bold
                      text-[#174D36]

                      transition-colors

                      hover:bg-[#EEE8D2]

                      disabled:cursor-not-allowed
                      disabled:opacity-40

                      cursor-pointer
                    "
                  >
                    −
                  </button>

                  <span
                    className="
                      whitespace-nowrap

                      text-[12px]
                      font-bold
                      text-[#17251E]
                    "
                  >
                    {guestsCount}{' '}
                    {guestsCount === 1
                      ? 'orang'
                      : 'orang'}
                  </span>

                  <button
                    type="button"
                    onClick={
                      increaseGuests
                    }
                    disabled={
                      guestsCount >=
                      maxGuests
                    }
                    aria-label="
                      Tambah jumlah peserta
                    "
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center

                      rounded-[10px]

                      bg-[#FAF4DD]

                      text-[18px]
                      font-bold
                      text-[#174D36]

                      transition-colors

                      hover:bg-[#EEE8D2]

                      disabled:cursor-not-allowed
                      disabled:opacity-40

                      cursor-pointer
                    "
                  >
                    +
                  </button>
                </div>

                {maxGuests && (
                  <p
                    className="
                      mt-1

                      text-[9px]
                      text-[#68736D]
                    "
                  >
                    Maksimal{' '}
                    {maxGuests}{' '}
                    peserta
                  </p>
                )}
              </div>
            </section>


            {/* ==========================================================
                CUSTOMER DATA
            =========================================================== */}

            <section className="mt-5">
              <div className="mb-3">
                <h3
                  className="
                    font-['Outfit']
                    text-[15px]
                    font-bold
                    text-[#17251E]
                  "
                >
                  Data pemesan
                </h3>

                <p
                  className="
                    mt-0.5
                    text-[10px]
                    leading-relaxed
                    text-[#68736D]
                  "
                >
                  Data ini digunakan untuk
                  koordinasi perjalanan.
                </p>
              </div>


              <div
                className="
                  space-y-3
                "
              >
                {/* Name */}

                <div>
                  <label
                    htmlFor="
                      customer-name
                    "
                    className="
                      mb-1.5
                      block

                      text-[12px]
                      font-semibold
                      text-[#17251E]
                    "
                  >
                    Nama pemesan
                  </label>

                  <input
                    id="customer-name"
                    type="text"
                    autoComplete="name"
                    value={
                      customerName || ''
                    }
                    onChange={(event) =>
                      setCustomerName(
                        event.target.value,
                      )
                    }
                    className="
                      w-full

                      rounded-[14px]
                      border
                      border-[#DDE2D9]

                      bg-white

                      px-3.5
                      py-2.5

                      text-[13px]
                      text-[#17251E]

                      outline-none

                      transition-colors

                      placeholder:text-[#A4ACA7]

                      focus:border-[#174D36]
                      focus:ring-2
                      focus:ring-[#174D36]/10
                    "
                    placeholder="
                      Nama lengkap kamu
                    "
                    required
                  />
                </div>


                {/* Phone */}

                <div>
                  <label
                    htmlFor="
                      customer-phone
                    "
                    className="
                      mb-1.5
                      block

                      text-[12px]
                      font-semibold
                      text-[#17251E]
                    "
                  >
                    Nomor WhatsApp
                  </label>

                  <input
                    id="customer-phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    value={
                      customerPhone || ''
                    }
                    onChange={(event) =>
                      setCustomerPhone(
                        event.target.value,
                      )
                    }
                    pattern="
                      [0-9+\\s()-]{9,20}
                    "
                    className="
                      w-full

                      rounded-[14px]
                      border
                      border-[#DDE2D9]

                      bg-white

                      px-3.5
                      py-2.5

                      text-[13px]
                      text-[#17251E]

                      outline-none

                      transition-colors

                      placeholder:text-[#A4ACA7]

                      focus:border-[#174D36]
                      focus:ring-2
                      focus:ring-[#174D36]/10
                    "
                    placeholder="
                      0812xxxxxxxx
                    "
                    required
                  />

                  <p
                    className="
                      mt-1
                      text-[9px]
                      leading-relaxed
                      text-[#68736D]
                    "
                  >
                    Digunakan untuk koordinasi
                    titik kumpul dan perubahan
                    jadwal.
                  </p>
                </div>


                {/* Notes */}

                <div>
                  <label
                    htmlFor="
                      customer-notes
                    "
                    className="
                      mb-1.5
                      block

                      text-[12px]
                      font-semibold
                      text-[#17251E]
                    "
                  >
                    Catatan kebutuhan khusus
                    <span
                      className="
                        ml-1
                        font-normal
                        text-[#68736D]
                      "
                    >
                      (opsional)
                    </span>
                  </label>

                  <textarea
                    id="customer-notes"
                    value={
                      customerNotes || ''
                    }
                    onChange={(event) =>
                      setCustomerNotes(
                        event.target.value,
                      )
                    }
                    rows={3}
                    maxLength={500}
                    className="
                      w-full
                      resize-none

                      rounded-[14px]
                      border
                      border-[#DDE2D9]

                      bg-white

                      px-3.5
                      py-2.5

                      text-[12px]
                      leading-relaxed
                      text-[#17251E]

                      outline-none

                      transition-colors

                      placeholder:text-[#A4ACA7]

                      focus:border-[#174D36]
                      focus:ring-2
                      focus:ring-[#174D36]/10
                    "
                    placeholder="
                      Contoh: vegetarian,
                      alergi makanan, kebutuhan
                      mobilitas, atau kebutuhan
                      lainnya.
                    "
                  />

                  <div
                    className="
                      mt-1
                      text-right
                      text-[9px]
                      text-[#8A948E]
                    "
                  >
                    {(
                      customerNotes ||
                      ''
                    ).length}/500
                  </div>
                </div>
              </div>
            </section>


            {/* ==========================================================
                PRICE BREAKDOWN
            =========================================================== */}

            <section
              aria-label="
                Rincian pembayaran
              "
              className="mt-5"
            >
              <PriceBreakdown
                guestsCount={
                  guestsCount
                }
                unitPrice={
                  unitPrice
                }
                baseCost={
                  baseCost
                }
                conservationFund={
                  conservationFund
                }
                totalAmount={
                  totalAmount
                }
              />
            </section>


            {/* ==========================================================
                PAYMENT METHOD
            =========================================================== */}

            <section className="mt-5">
              <fieldset>
                <legend
                  className="
                    mb-2

                    text-[12px]
                    font-semibold
                    text-[#17251E]
                  "
                >
                  Pilih metode pembayaran
                </legend>

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-2

                    sm:grid-cols-2
                  "
                  role="radiogroup"
                  aria-label="
                    Metode pembayaran
                  "
                >
                  {/* QRIS */}

                  <button
                    type="button"
                    role="radio"
                    aria-checked={
                      paymentMethod ===
                      'qris'
                    }
                    onClick={() =>
                      setPaymentMethod(
                        'qris',
                      )
                    }
                    className={`
                      flex
                      items-center
                      gap-3

                      rounded-[14px]
                      border

                      p-3.5

                      text-left

                      transition-all

                      focus:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-[#174D36]/30

                      ${
                        paymentMethod ===
                        'qris'
                          ? `
                            border-[#174D36]
                            bg-[#CFEACB]/40
                            text-[#174D36]
                            shadow-sm
                          `
                          : `
                            border-[#DDE2D9]
                            bg-white
                            text-[#68736D]

                            hover:border-[#B9C5BC]
                            hover:bg-[#FAF4DD]/60
                          `
                      }

                      cursor-pointer
                    `}
                  >
                    <span
                      className={`
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl

                        ${
                          paymentMethod ===
                          'qris'
                            ? 'bg-[#174D36] text-white'
                            : 'bg-[#FAF4DD] text-[#68736D]'
                        }
                      `}
                    >
                      <span
                        className="
                          material-symbols-outlined
                          text-[19px]
                        "
                        aria-hidden="true"
                      >
                        qr_code_scanner
                      </span>
                    </span>

                    <span className="min-w-0">
                      <span
                        className={`
                          block

                          text-[12px]
                          font-bold

                          ${
                            paymentMethod ===
                            'qris'
                              ? 'text-[#174D36]'
                              : 'text-[#17251E]'
                          }
                        `}
                      >
                        QRIS instan
                      </span>

                      <span
                        className="
                          mt-0.5
                          block

                          text-[9px]
                          text-[#68736D]
                        "
                      >
                        Bayar melalui QR
                      </span>
                    </span>
                  </button>


                  {/* VA */}

                  <button
                    type="button"
                    role="radio"
                    aria-checked={
                      paymentMethod ===
                      'va'
                    }
                    onClick={() =>
                      setPaymentMethod(
                        'va',
                      )
                    }
                    className={`
                      flex
                      items-center
                      gap-3

                      rounded-[14px]
                      border

                      p-3.5

                      text-left

                      transition-all

                      focus:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-[#174D36]/30

                      ${
                        paymentMethod ===
                        'va'
                          ? `
                            border-[#174D36]
                            bg-[#CFEACB]/40
                            text-[#174D36]
                            shadow-sm
                          `
                          : `
                            border-[#DDE2D9]
                            bg-white
                            text-[#68736D]

                            hover:border-[#B9C5BC]
                            hover:bg-[#FAF4DD]/60
                          `
                      }

                      cursor-pointer
                    `}
                  >
                    <span
                      className={`
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl

                        ${
                          paymentMethod ===
                          'va'
                            ? 'bg-[#174D36] text-white'
                            : 'bg-[#FAF4DD] text-[#68736D]'
                        }
                      `}
                    >
                      <span
                        className="
                          material-symbols-outlined
                          text-[19px]
                        "
                        aria-hidden="true"
                      >
                        account_balance
                      </span>
                    </span>

                    <span className="min-w-0">
                      <span
                        className={`
                          block

                          text-[12px]
                          font-bold

                          ${
                            paymentMethod ===
                            'va'
                              ? 'text-[#174D36]'
                              : 'text-[#17251E]'
                          }
                        `}
                      >
                        Transfer bank / VA
                      </span>

                      <span
                        className="
                          mt-0.5
                          block

                          text-[9px]
                          text-[#68736D]
                        "
                      >
                        Pembayaran melalui bank
                      </span>
                    </span>
                  </button>
                </div>
              </fieldset>
            </section>


            {/* ==========================================================
                TRUST / INFORMATION NOTE
            =========================================================== */}

            <div
              className="
                mt-5

                flex
                items-start
                gap-2.5

                rounded-[14px]

                bg-[#E8EFE3]

                px-3.5
                py-3

                text-[10px]
                leading-relaxed
                text-[#174D36]
              "
            >
              <span
                className="
                  material-symbols-outlined
                  mt-0.5
                  shrink-0
                  text-[17px]
                "
                aria-hidden="true"
              >
                verified_user
              </span>

              <p>
                Periksa kembali tanggal,
                jumlah peserta, dan nomor
                WhatsApp sebelum melanjutkan.
              </p>
            </div>


            {/* ==========================================================
                ACTIONS
            =========================================================== */}

            <div
              className="
                mt-5

                flex
                flex-col-reverse
                gap-2.5

                sm:flex-row
              "
            >
              <button
                type="button"
                onClick={onClose}
                className="
                  flex-1

                  rounded-[14px]
                  border
                  border-[#DDE2D9]

                  bg-white

                  px-4
                  py-3.5

                  text-[12px]
                  font-bold
                  text-[#17251E]

                  transition-all

                  hover:bg-[#FAF4DD]
                  hover:border-[#C9D1CA]

                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#174D36]/30

                  cursor-pointer
                "
              >
                Batal
              </button>

              <button
                type="submit"
                className="
                  group

                  flex-[1.7]

                  rounded-[14px]

                  bg-[#174D36]

                  px-4
                  py-3.5

                  text-[12px]
                  font-bold
                  text-white

                  shadow-[0_6px_18px_rgba(23,77,54,0.16)]

                  transition-all

                  hover:bg-[#0F3524]

                  active:scale-[0.99]

                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#174D36]/40

                  cursor-pointer
                "
              >
                <span
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                  "
                >
                  <span>
                    Konfirmasi dan bayar
                  </span>

                  <span
                    className="
                      material-symbols-outlined
                      text-[16px]

                      transition-transform
                      duration-200

                      group-hover:translate-x-0.5
                    "
                    aria-hidden="true"
                  >
                    arrow_forward
                  </span>
                </span>
              </button>
            </div>


            {/* ==========================================================
                FOOTNOTE
            =========================================================== */}

            <p
              className="
                mt-3
                text-center

                text-[9px]
                leading-relaxed
                text-[#8A948E]
              "
            >
              Dengan melanjutkan pembayaran,
              kamu mengonfirmasi bahwa data
              reservasi yang dimasukkan sudah
              benar.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
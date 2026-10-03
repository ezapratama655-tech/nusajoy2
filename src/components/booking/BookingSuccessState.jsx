/**
 * @file src/components/booking/BookingSuccessState.jsx
 * NuSaJoy — Booking Success State
 *
 * Tampilan konfirmasi setelah pembayaran berhasil.
 *
 * Komponen ini dibuat terpisah dari BookingSummaryModal
 * agar alur booking tetap modular dan mudah dirawat.
 */

/* ==========================================================================
   HELPERS
   ========================================================================== */

const formatCurrency = (value) => {
  const numericValue = Number(value);

  if (
    !Number.isFinite(numericValue)
  ) {
    return 'Rp0';
  }

  return `Rp${numericValue.toLocaleString(
    'id-ID',
  )}`;
};


const formatDate = (value) => {
  if (!value) {
    return '-';
  }

  try {
    const date = new Date(value);

    if (
      Number.isNaN(date.getTime())
    ) {
      return value;
    }

    return date.toLocaleDateString(
      'id-ID',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      },
    );
  } catch {
    return value;
  }
};


/* ==========================================================================
   COMPONENT
   ========================================================================== */

export default function BookingSuccessState({
  confirmedOrder = null,
  customerName = 'Pengguna NuSaJoy',
  onClose,
  onGoToMyTrip,
  onContactGuide,
}) {
  /**
   * Pengaman agar komponen tidak crash
   * bila data belum tersedia.
   */
  if (!confirmedOrder) {
    return (
      <div className="p-8 text-center">
        <div
          className="
            mx-auto
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-[#FAF4DD]
            text-[#C69A3A]
          "
        >
          <span
            className="
              material-symbols-outlined
              text-2xl
            "
          >
            receipt_long
          </span>
        </div>

        <h3
          className="
            mt-4
            font-['Outfit']
            text-[20px]
            font-bold
            text-[#17251E]
          "
        >
          Data reservasi belum tersedia
        </h3>

        <p
          className="
            mt-2
            text-[13px]
            leading-relaxed
            text-[#68736D]
          "
        >
          Silakan tutup jendela ini dan
          ulangi proses reservasi.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="
            mt-5
            rounded-[14px]
            bg-[#174D36]
            px-5
            py-3
            text-[13px]
            font-semibold
            text-white
            transition-colors
            hover:bg-[#0F3524]
            cursor-pointer
          "
        >
          Kembali
        </button>
      </div>
    );
  }


  /* ------------------------------------------------------------------------
     DATA NORMALIZATION
  ------------------------------------------------------------------------ */

  const orderId =
    confirmedOrder.id ||
    'ORD-NSJ';

  const title =
    confirmedOrder.title ||
    'Reservasi NuSaJoy';

  const location =
    confirmedOrder.location ||
    'Indonesia';

  const guideName =
    confirmedOrder.guideName ||
    'Pemandu Lokal';

  const guidePhone =
    confirmedOrder.guidePhone ||
    '';

  const meetingPoint =
    confirmedOrder.meetingPoint ||
    'Titik Kumpul Desa';

  const meetingTime =
    confirmedOrder.meetingTime ||
    '08:30 WIB';

  const paymentMethod =
    confirmedOrder.paymentMethod ||
    'Pembayaran NuSaJoy';

  const guests =
    confirmedOrder.guests ||
    confirmedOrder.guestsCount ||
    1;

  const totalPrice =
    confirmedOrder.totalPrice ||
    confirmedOrder.totalAmount ||
    0;

  const bookingDate =
    confirmedOrder.date ||
    confirmedOrder.selectedDate ||
    null;


  /* ------------------------------------------------------------------------
     CONTACT GUIDE
  ------------------------------------------------------------------------ */

  const handleContactGuide = () => {
    if (
      typeof onContactGuide ===
      'function'
    ) {
      onContactGuide(
        confirmedOrder,
      );

      return;
    }

    /**
     * Fallback WhatsApp.
     * Hanya dijalankan bila nomor tersedia.
     */
    if (!guidePhone) {
      return;
    }

    const cleanPhone =
      String(guidePhone)
        .replace(/\D/g, '');

    if (!cleanPhone) {
      return;
    }

    const message =
      `Halo ${guideName}, saya ${customerName}. ` +
      `Saya telah melakukan reservasi "${title}" ` +
      `dengan kode ${orderId}.`;

    const whatsappUrl =
      `https://wa.me/${cleanPhone}` +
      `?text=${encodeURIComponent(message)}`;

    window.open(
      whatsappUrl,
      '_blank',
      'noopener,noreferrer',
    );
  };


  return (
    <div
      className="
        p-5
        sm:p-7
        text-center
      "
    >
      {/* ==================================================================
          SUCCESS ICON
      ================================================================== */}

      <div
        className="
          relative
          mx-auto
          flex
          h-[72px]
          w-[72px]
          items-center
          justify-center
          rounded-full

          bg-[#CFEACB]
          text-[#174D36]

          shadow-[0_8px_24px_rgba(23,77,54,0.12)]
        "
      >
        <span
          className="
            material-symbols-outlined
            text-[38px]
          "
          aria-hidden="true"
        >
          check_circle
        </span>

        <span
          className="
            absolute
            -right-1
            -top-1
            flex
            h-6
            w-6
            items-center
            justify-center
            rounded-full
            bg-[#C69A3A]
            text-white
            shadow-sm
          "
          aria-hidden="true"
        >
          <span
            className="
              material-symbols-outlined
              text-[13px]
            "
          >
            verified
          </span>
        </span>
      </div>


      {/* ==================================================================
          TITLE
      ================================================================== */}

      <div className="mt-5">
        <span
          className="
            inline-flex
            items-center
            gap-1.5

            rounded-full
            bg-[#FAF4DD]

            px-3
            py-1

            font-mono
            text-[11px]
            font-bold
            tracking-wide
            text-[#B5653A]
          "
        >
          <span
            className="
              material-symbols-outlined
              text-[13px]
            "
            aria-hidden="true"
          >
            confirmation_number
          </span>

          {orderId}
        </span>


        <h3
          className="
            mt-3

            font-['Outfit']
            text-[21px]
            font-bold
            leading-tight
            text-[#17251E]

            sm:text-[23px]
          "
        >
          Reservasi Berhasil!
        </h3>


        <p
          className="
            mx-auto
            mt-2
            max-w-md

            text-[13px]
            leading-relaxed
            text-[#68736D]
          "
        >
          Terima kasih,{' '}
          <span className="font-semibold text-[#174D36]">
            {customerName}
          </span>
          . Reservasi perjalananmu telah
          berhasil dikonfirmasi dan tersimpan
          di NuSaJoy.
        </p>
      </div>


      {/* ==================================================================
          EXPERIENCE SUMMARY
      ================================================================== */}

      <div
        className="
          mt-6
          rounded-[18px]
          border
          border-[#DDE2D9]
          bg-[#FAF4DD]/70
          p-4
          text-left
        "
      >
        {/* Experience */}

        <div
          className="
            flex
            items-start
            gap-3
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-[#174D36]
              text-white
            "
          >
            <span
              className="
                material-symbols-outlined
                text-[19px]
              "
              aria-hidden="true"
            >
              landscape
            </span>
          </div>


          <div className="min-w-0">
            <span
              className="
                block
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.08em]
                text-[#8FA88C]
              "
            >
              Pengalaman
            </span>

            <h4
              className="
                mt-0.5
                truncate
                font-['Outfit']
                text-[15px]
                font-bold
                text-[#17251E]
              "
            >
              {title}
            </h4>

            <div
              className="
                mt-1
                flex
                items-center
                gap-1
                text-[11px]
                text-[#68736D]
              "
            >
              <span
                className="
                  material-symbols-outlined
                  text-[14px]
                "
                aria-hidden="true"
              >
                location_on
              </span>

              <span>
                {location}
              </span>
            </div>
          </div>
        </div>


        {/* Divider */}

        <div
          className="
            my-4
            h-px
            bg-[#DDE2D9]
          "
        />


        {/* Details */}

        <div
          className="
            grid
            grid-cols-1
            gap-3

            sm:grid-cols-2
          "
        >
          {/* Date */}

          <div>
            <span
              className="
                block
                text-[10px]
                font-medium
                text-[#68736D]
              "
            >
              Tanggal
            </span>

            <span
              className="
                mt-1
                block
                text-[12px]
                font-semibold
                text-[#17251E]
              "
            >
              {formatDate(
                bookingDate,
              )}
            </span>
          </div>


          {/* Guests */}

          <div>
            <span
              className="
                block
                text-[10px]
                font-medium
                text-[#68736D]
              "
            >
              Jumlah peserta
            </span>

            <span
              className="
                mt-1
                block
                text-[12px]
                font-semibold
                text-[#17251E]
              "
            >
              {guests} orang
            </span>
          </div>


          {/* Meeting point */}

          <div>
            <span
              className="
                block
                text-[10px]
                font-medium
                text-[#68736D]
              "
            >
              Titik kumpul
            </span>

            <span
              className="
                mt-1
                block
                text-[12px]
                font-semibold
                text-[#17251E]
              "
            >
              {meetingPoint}
            </span>
          </div>


          {/* Meeting time */}

          <div>
            <span
              className="
                block
                text-[10px]
                font-medium
                text-[#68736D]
              "
            >
              Waktu
            </span>

            <span
              className="
                mt-1
                block
                text-[12px]
                font-semibold
                text-[#17251E]
              "
            >
              {meetingTime}
            </span>
          </div>
        </div>
      </div>


      {/* ==================================================================
          GUIDE INFO
      ================================================================== */}

      <div
        className="
          mt-3
          rounded-[18px]
          border
          border-[#DDE2D9]
          bg-white
          p-4
          text-left
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            gap-3
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
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#E8EFE3]
                text-[#174D36]
              "
            >
              <span
                className="
                  material-symbols-outlined
                  text-[19px]
                "
                aria-hidden="true"
              >
                person
              </span>
            </div>

            <div className="min-w-0">
              <span
                className="
                  block
                  text-[10px]
                  text-[#68736D]
                "
              >
                Pemandu lokal
              </span>

              <span
                className="
                  mt-0.5
                  block
                  truncate
                  text-[13px]
                  font-bold
                  text-[#17251E]
                "
              >
                {guideName}
              </span>
            </div>
          </div>


          <span
            className="
              inline-flex
              shrink-0
              items-center
              gap-1
              rounded-full
              bg-[#CFEACB]/70
              px-2
              py-1

              text-[9px]
              font-bold
              text-[#174D36]
            "
          >
            <span
              className="
                material-symbols-outlined
                text-[12px]
              "
              aria-hidden="true"
            >
              verified
            </span>

            Terverifikasi
          </span>
        </div>
      </div>


      {/* ==================================================================
          PAYMENT SUMMARY
      ================================================================== */}

      <div
        className="
          mt-3
          rounded-[18px]
          border
          border-[#DDE2D9]
          bg-[#FFFDF7]
          p-4
          text-left
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            gap-3
          "
        >
          <div>
            <span
              className="
                block
                text-[10px]
                font-medium
                text-[#68736D]
              "
            >
              Total pembayaran
            </span>

            <span
              className="
                mt-1
                block
                font-['Outfit']
                text-[20px]
                font-bold
                text-[#174D36]
              "
            >
              {formatCurrency(
                totalPrice,
              )}
            </span>
          </div>

          <div
            className="
              text-right
            "
          >
            <span
              className="
                block
                text-[10px]
                font-medium
                text-[#68736D]
              "
            >
              Metode
            </span>

            <span
              className="
                mt-1
                flex
                items-center
                justify-end
                gap-1
                text-[11px]
                font-semibold
                text-[#17251E]
              "
            >
              <span
                className="
                  material-symbols-outlined
                  text-[14px]
                  text-[#174D36]
                "
                aria-hidden="true"
              >
                payments
              </span>

              {paymentMethod}
            </span>
          </div>
        </div>
      </div>


      {/* ==================================================================
          ACTIONS
      ================================================================== */}

      <div
        className="
          mt-5
          flex
          flex-col
          gap-2.5
          sm:flex-row
        "
      >
        {/* Contact Guide */}

        <button
          type="button"
          onClick={
            handleContactGuide
          }
          disabled={
            !guidePhone &&
            !onContactGuide
          }
          className="
            flex
            flex-1
            items-center
            justify-center
            gap-2

            rounded-[14px]
            border
            border-[#DDE2D9]

            bg-white

            px-4
            py-3

            text-[12px]
            font-bold
            text-[#174D36]

            transition-all

            hover:border-[#174D36]
            hover:bg-[#F4F8F1]

            disabled:cursor-not-allowed
            disabled:opacity-50

            cursor-pointer
          "
        >
          <span
            className="
              material-symbols-outlined
              text-[17px]
            "
            aria-hidden="true"
          >
            chat
          </span>

          Hubungi Pemandu
        </button>


        {/* My Trip */}

        {onGoToMyTrip && (
          <button
            type="button"
            onClick={
              onGoToMyTrip
            }
            className="
              flex
              flex-1
              items-center
              justify-center
              gap-2

              rounded-[14px]
              bg-[#174D36]

              px-4
              py-3

              text-[12px]
              font-bold
              text-white

              shadow-sm

              transition-all

              hover:bg-[#0F3524]
              active:scale-[0.98]

              cursor-pointer
            "
          >
            <span
              className="
                material-symbols-outlined
                text-[17px]
              "
              aria-hidden="true"
            >
              luggage
            </span>

            Buka My Trip
          </button>
        )}
      </div>


      {/* ==================================================================
          CLOSE
      ================================================================== */}

      <button
        type="button"
        onClick={onClose}
        className="
          mt-3
          w-full

          rounded-[12px]
          px-4
          py-2

          text-[11px]
          font-semibold
          text-[#68736D]

          transition-colors

          hover:bg-[#FAF4DD]
          hover:text-[#174D36]

          cursor-pointer
        "
      >
        Kembali ke NuSaJoy
      </button>


      {/* ==================================================================
          TRUST NOTE
      ================================================================== */}

      <p
        className="
          mt-3
          text-center
          text-[9px]
          leading-relaxed
          text-[#8A948E]
        "
      >
        Simpan kode reservasi{' '}
        <span className="font-semibold">
          {orderId}
        </span>{' '}
        untuk referensi perjalananmu.
      </p>
    </div>
  );
}
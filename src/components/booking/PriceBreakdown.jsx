/**
 * @file src/components/booking/PriceBreakdown.jsx
 * NuSaJoy — Booking Price Breakdown
 *
 * Menampilkan rincian biaya booking secara transparan.
 *
 * Input:
 * - guestsCount
 * - unitPrice
 * - baseCost
 * - conservationFund
 * - totalAmount
 *
 * Prinsip:
 * - Tidak menghitung ulang biaya di komponen ini.
 * - Semua nilai berasal dari useBookingForm.
 * - Tampilan konsisten dengan visual NuSaJoy.
 * - Aman jika beberapa nilai belum tersedia.
 */

/* ==========================================================================
   HELPERS
   ========================================================================== */

/**
 * Format angka menjadi Rupiah.
 */
const formatRupiah = (
  value,
) => {
  const numericValue =
    Number(value);

  if (
    !Number.isFinite(
      numericValue,
    )
  ) {
    return 'Rp0';
  }

  return `Rp${numericValue.toLocaleString(
    'id-ID',
  )}`;
};


/**
 * Normalisasi number agar
 * komponen tidak menghasilkan NaN.
 */
const safeNumber = (
  value,
  fallback = 0,
) => {
  const numericValue =
    Number(value);

  return Number.isFinite(
    numericValue,
  )
    ? numericValue
    : fallback;
};


/* ==========================================================================
   COMPONENT
   ========================================================================== */

export default function PriceBreakdown({
  guestsCount = 1,
  isTrip = false,
  unitPrice = 0,
  baseCost = 0,
  conservationFund = 0,
  totalAmount = 0,
}) {
  /* ------------------------------------------------------------------------
     SAFE VALUES
  ------------------------------------------------------------------------ */

  const safeGuests =
    Math.max(
      1,
      Math.floor(
        safeNumber(
          guestsCount,
          1,
        ),
      ),
    );

  const safeUnitPrice =
    Math.max(
      0,
      safeNumber(
        unitPrice,
      ),
    );

  const safeBaseCost =
    Math.max(
      0,
      safeNumber(
        baseCost,
      ),
    );

  const safeConservationFund =
    Math.max(
      0,
      safeNumber(
        conservationFund,
      ),
    );

  const safeTotal =
    Math.max(
      0,
      safeNumber(
        totalAmount,
      ),
    );


  /* ------------------------------------------------------------------------
     RENDER
  ------------------------------------------------------------------------ */

  return (
    <div
      className="
        overflow-hidden

        rounded-[18px]
        border
        border-[#DDE2D9]

        bg-[#FAF4DD]/70
      "
    >
      {/* ==================================================================
          HEADER
      ================================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-3

          border-b
          border-[#DDE2D9]

          px-4
          py-3
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          <span
            className="
              flex
              h-8
              w-8
              items-center
              justify-center

              rounded-lg

              bg-[#E8EFE3]
              text-[#174D36]
            "
            aria-hidden="true"
          >
            <span
              className="
                material-symbols-outlined
                text-[17px]
              "
            >
              receipt_long
            </span>
          </span>

          <div>
            <h3
              className="
                font-['Outfit']
                text-[14px]
                font-bold
                text-[#17251E]
              "
            >
              Rincian biaya
            </h3>

            <p
              className="
                mt-0.5
                text-[9px]
                font-medium
                text-[#68736D]
              "
            >
              Transparan tanpa biaya tersembunyi
            </p>
          </div>
        </div>

        <span
          className="
            rounded-full

            bg-[#CFEACB]/70

            px-2
            py-1

            text-[8px]
            font-bold
            text-[#174D36]
          "
        >
          {safeGuests} peserta
        </span>
      </div>


      {/* ==================================================================
          BREAKDOWN
      ================================================================== */}

      <div
        className="
          space-y-3
          p-4
        "
      >
        {/* ---------------------------------------------------------------
            ACTIVITY COST
        ---------------------------------------------------------------- */}

        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >
          <div className="min-w-0">
            <span
              className="
                block
                text-[11px]
                font-medium
                text-[#68736D]
              "
            >
              Biaya kegiatan
            </span>

            <span
              className="
                mt-0.5
                block
                text-[9px]
                text-[#8A948E]
              "
            >
              {safeGuests} ×{' '}
              {formatRupiah(
                safeUnitPrice,
              )}
            </span>
          </div>

          <span
            className="
              shrink-0

              text-[12px]
              font-semibold
              text-[#17251E]
            "
          >
            {formatRupiah(
              safeBaseCost,
            )}
          </span>
        </div>


        {/* ---------------------------------------------------------------
            CONSERVATION FUND
        ---------------------------------------------------------------- */}

        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >
          <div
            className="
              flex
              min-w-0
              items-start
              gap-1.5
            "
          >
            <div className="min-w-0">
              <div
                className="
                  flex
                  items-center
                  gap-1
                "
              >
                <span
                  className="
                    text-[11px]
                    font-medium
                    text-[#68736D]
                  "
                >
                  Dana konservasi budaya
                </span>

                <span
                  className="
                    material-symbols-outlined
                    text-[13px]
                    text-[#174D36]
                  "
                  title="
                    Dana konservasi budaya
                  "
                  aria-hidden="true"
                >
                  info
                </span>
              </div>

              <span
                className="
                  mt-0.5
                  block
                  text-[9px]
                  text-[#8A948E]
                "
              >
                {conservationFund <= 0 ? 'Tidak ada tambahan dana konservasi' : isTrip ? '2,5% dari pengalaman dan penginapan' : '2,5% dari biaya kegiatan'}
              </span>
            </div>
          </div>

          <span
            className="
              shrink-0

              text-[12px]
              font-semibold
              text-[#174D36]
            "
          >
            +{formatRupiah(
              safeConservationFund,
            )}
          </span>
        </div>


        {/* ---------------------------------------------------------------
            PLATFORM FEE
        ---------------------------------------------------------------- */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-4
          "
        >
          <span
            className="
              text-[11px]
              font-medium
              text-[#68736D]
            "
          >
            Biaya platform NuSaJoy
          </span>

          <span
            className="
              shrink-0

              rounded-full

              bg-[#CFEACB]/60

              px-2
              py-1

              text-[9px]
              font-bold
              text-[#174D36]
            "
          >
            Gratis
          </span>
        </div>


        {/* =================================================================
            DIVIDER
        ================================================================== */}

        <div
          className="
            h-px
            bg-[#DDE2D9]
          "
        />


        {/* =================================================================
            TOTAL
        ================================================================== */}

        <div
          className="
            flex
            items-end
            justify-between
            gap-4
          "
        >
          <div>
            <span
              className="
                block
                text-[12px]
                font-bold
                text-[#17251E]
              "
            >
              Total pembayaran
            </span>

            <span
              className="
                mt-0.5
                block
                text-[9px]
                text-[#68736D]
              "
            >
              Sudah termasuk dana konservasi
            </span>
          </div>

          <span
            className="
              shrink-0

              font-['Outfit']
              text-[19px]
              font-bold
              text-[#174D36]
            "
          >
            {formatRupiah(
              safeTotal,
            )}
          </span>
        </div>
      </div>


      {/* ==================================================================
          INFORMATION FOOTER
      ================================================================== */}

      <div
        className="
          flex
          items-start
          gap-2

          border-t
          border-[#DDE2D9]

          bg-white/50

          px-4
          py-3
        "
      >
        <span
          className="
            material-symbols-outlined
            mt-0.5
            shrink-0
            text-[15px]
            text-[#174D36]
          "
          aria-hidden="true"
        >
          volunteer_activism
        </span>

        <p
          className="
            text-[9px]
            leading-relaxed
            text-[#68736D]
          "
        >
          Rincian biaya ini adalah simulasi.
          Belum ada pembayaran atau penyaluran
          dana konservasi yang dilakukan.
        </p>
      </div>
    </div>
  );
}

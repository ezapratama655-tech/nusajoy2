import { calculateBookingCosts } from '../utils/pricing.js';
import { demoPaymentService } from '../service/demoPaymentService.js';
/**
 * @file src/hooks/useBookingForm.js
 * NuSaJoy — Booking Form Hook
 *
 * Tanggung jawab:
 * - Menyimpan state form booking
 * - Reset otomatis ketika modal dibuka untuk item berbeda
 * - Mengatur jumlah peserta
 * - Mengatur tanggal
 * - Mengatur data pemesan
 * - Mengatur metode pembayaran
 * - Menghitung rincian biaya
 * - Membuat object order setelah konfirmasi
 *
 * Digunakan oleh:
 * src/components/BookingSummaryModal.jsx
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';


/* ==========================================================================
   CONSTANTS
   ========================================================================== */

/**
 * Batas default jumlah peserta.
 *
 * Bila bookingData tidak memiliki maxGuests/capacity,
 * kita menggunakan batas aman ini.
 */
const DEFAULT_MAX_GUESTS = 10;

/**
 * Harga demo/fallback dari struktur booking lama NuSaJoy.
 *
 * Bila bookingData menyediakan:
 * - price
 * - pricePerPerson
 * - pricePerDay
 *
 * nilai tersebut akan digunakan terlebih dahulu.
 */
const DEFAULT_UNIT_PRICE = 95000;

/**
 * Dana konservasi budaya NuSaJoy.
 */



/* ==========================================================================
   HELPERS
   ========================================================================== */

/**
 * Menghasilkan tanggal hari ini dalam format YYYY-MM-DD.
 */
export const getTodayISODate = () => {
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
 * Mengubah nilai menjadi angka valid.
 */
const toSafeNumber = (
  value,
  fallback = 0,
) => {
  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};


/**
 * Mengambil harga dari bookingData.
 */
const getBookingUnitPrice = (
  bookingData,
) => {
  if (
    !bookingData ||
    typeof bookingData !== 'object'
  ) {
    return DEFAULT_UNIT_PRICE;
  }

  const candidates = [
    bookingData.price,
    bookingData.pricePerPerson,
    bookingData.pricePerDay,
    bookingData.startingPrice,
  ];

  for (
    const candidate of candidates
  ) {
    if (candidate === undefined || candidate === null || candidate === '') continue;
    const value =
      Number(candidate);

    if (
      Number.isFinite(value) &&
      value >= 0
    ) {
      return value;
    }
  }

  return DEFAULT_UNIT_PRICE;
};


/**
 * Mengambil batas maksimal peserta.
 */
const getBookingMaxGuests = (
  bookingData,
) => {
  if (bookingData?.type === 'guide' && bookingData?.priceUnit === 'trip') return 1;
  if (
    !bookingData ||
    typeof bookingData !== 'object'
  ) {
    return DEFAULT_MAX_GUESTS;
  }

  const candidates = [
    bookingData.maxGuests,
    bookingData.capacity,
    bookingData.availableSlots,
    bookingData.maxParticipants,
  ];

  for (
    const candidate of candidates
  ) {
    const value =
      toSafeNumber(candidate);

    if (
      Number.isFinite(value) &&
      value > 0
    ) {
      return Math.max(
        1,
        Math.floor(value),
      );
    }
  }

  return DEFAULT_MAX_GUESTS;
};


/**
 * Mengambil jumlah peserta awal.
 */
const getInitialGuests = (
  bookingData,
  maxGuests,
) => {
  const requested =
    toSafeNumber(
      bookingData?.guestsCount ??
      bookingData?.guests ??
      1,
      1,
    );

  if (
    !Number.isFinite(requested)
  ) {
    return 1;
  }

  return Math.min(
    Math.max(
      1,
      Math.floor(requested),
    ),
    maxGuests,
  );
};


/**
 * Mengambil tanggal awal booking.
 *
 * Tidak menggunakan tanggal statis.
 */
const getInitialDate = (
  bookingData,
) => {
  const supplied =
    bookingData?.date ||
    bookingData?.selectedDate ||
    bookingData?.bookingDate;

  if (!supplied) {
    return getTodayISODate();
  }

  /**
   * Kalau format awal adalah ISO,
   * langsung kita gunakan.
   */
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      String(supplied),
    )
  ) {
    return String(supplied);
  }

  /**
   * Coba parse tanggal lain.
   */
  const parsed =
    new Date(supplied);

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return getTodayISODate();
  }

  const year =
    parsed.getFullYear();

  const month =
    String(
      parsed.getMonth() + 1,
    ).padStart(2, '0');

  const day =
    String(
      parsed.getDate(),
    ).padStart(2, '0');

  return `${year}-${month}-${day}`;
};


/**
 * Mengambil nama customer dari bookingData
 * tanpa mengarang nama.
 */
const getInitialCustomerName = (
  bookingData,
) => {
  return (
    bookingData?.customerName ||
    bookingData?.userName ||
    ''
  );
};


/**
 * Mengambil nomor customer.
 */
const getInitialCustomerPhone = (
  bookingData,
) => {
  return (
    bookingData?.customerPhone ||
    bookingData?.userPhone ||
    ''
  );
};


/**
 * Mengambil catatan customer.
 */
const getInitialCustomerNotes = (
  bookingData,
) => {
  return (
    bookingData?.customerNotes ||
    bookingData?.notes ||
    ''
  );
};


/**
 * Mengambil metode pembayaran awal.
 */
const getInitialPaymentMethod = (
  bookingData,
) => {
  const method =
    bookingData?.paymentMethod;

  if (
    method === 'va' ||
    method === 'qris'
  ) {
    return method;
  }

  return 'qris';
};


/**
 * Membuat key stabil untuk item booking.
 *
 * Sangat penting untuk mencegah useEffect
 * melakukan reset setiap render ketika
 * parent membuat object baru.
 */
const getBookingIdentity = (
  bookingData,
) => {
  if (!bookingData) {
    return 'empty-booking';
  }

  return String(
    bookingData.id ??
    bookingData.slug ??
    bookingData.destinationId ??
    bookingData.guideId ??
    bookingData.title ??
    bookingData.name ??
    'booking',
  );
};


/**
 * Menghasilkan ID order unik.
 */
const createOrderId = () => {
  const timestamp =
    Date.now()
      .toString(36)
      .toUpperCase();

  const random =
    Math.random()
      .toString(36)
      .slice(2, 7)
      .toUpperCase();

  return `ORD-NSJ-${timestamp}-${random}`;
};


/**
 * Mengambil nama item.
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


/**
 * Mengambil lokasi item.
 */
const getBookingLocation = (
  bookingData,
) => {
  return (
    bookingData?.location ||
    bookingData?.address ||
    ''
  );
};


/**
 * Mengambil nama pemandu.
 *
 * Tidak memberikan nama palsu.
 */
const getGuideName = (
  bookingData,
) => {
  return (
    bookingData?.guide?.name ||
    bookingData?.guideName ||
    ''
  );
};


/**
 * Mengambil nomor pemandu.
 */
const getGuidePhone = (
  bookingData,
) => {
  return (
    bookingData?.guide?.phone ||
    bookingData?.guide?.phoneNumber ||
    bookingData?.guidePhone ||
    ''
  );
};


/**
 * Mengambil meeting point.
 */
const getMeetingPoint = (
  bookingData,
) => {
  return (
    bookingData?.meetingPoint ||
    bookingData?.meeting_point ||
    ''
  );
};


/**
 * Mengambil meeting time.
 */
const getMeetingTime = (
  bookingData,
) => {
  return (
    bookingData?.meetingTime ||
    bookingData?.meeting_time ||
    ''
  );
};


/* ==========================================================================
   HOOK
   ========================================================================== */

export function useBookingForm(
  bookingData,
  isOpen = false,
) {
  const submissionRef = useRef(null);
  const pendingOrderRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  /* ------------------------------------------------------------------------
     DERIVED BOOKING CONFIG
  ------------------------------------------------------------------------ */

  const bookingIdentity =
    useMemo(
      () =>
        getBookingIdentity(
          bookingData,
        ),
      [bookingData],
    );

  const maxGuests =
    useMemo(
      () =>
        getBookingMaxGuests(
          bookingData,
        ),
      [bookingData],
    );

  const unitPrice =
    useMemo(
      () =>
        getBookingUnitPrice(
          bookingData,
        ),
      [bookingData],
    );


  /* ------------------------------------------------------------------------
     FORM STATE
  ------------------------------------------------------------------------ */

  const [
    guestsCount,
    setGuestsCount,
  ] = useState(1);

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    getTodayISODate(),
  );

  const [
    customerName,
    setCustomerName,
  ] = useState('');

  const [
    customerPhone,
    setCustomerPhone,
  ] = useState('');

  const [
    customerNotes,
    setCustomerNotes,
  ] = useState('');

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState('qris');


  /* ------------------------------------------------------------------------
     SUBMISSION STATE
  ------------------------------------------------------------------------ */

  const [
    isSubmitted,
    setIsSubmitted,
  ] = useState(false);

  const [
    confirmedOrder,
    setConfirmedOrder,
  ] = useState(null);


  /* ------------------------------------------------------------------------
     RESET WHEN BOOKING CHANGES / MODAL OPENS
  ------------------------------------------------------------------------ */

  useEffect(() => {
    /**
     * Tidak ada booking aktif.
     *
     * Reset secukupnya agar ketika dibuka
     * dengan item baru, form tidak membawa
     * data item sebelumnya.
     */
    if (
      !isOpen ||
      !bookingData
    ) {
      return;
    }

    const timeoutId =
      setTimeout(
        () => {
          const nextMaxGuests =
            getBookingMaxGuests(
              bookingData,
            );

          const nextGuests =
            getInitialGuests(
              bookingData,
              nextMaxGuests,
            );

          setGuestsCount(
            nextGuests,
          );

          setSelectedDate(
            getInitialDate(
              bookingData,
            ),
          );

          setCustomerName(
            getInitialCustomerName(
              bookingData,
            ),
          );

          setCustomerPhone(
            getInitialCustomerPhone(
              bookingData,
            ),
          );

          setCustomerNotes(
            getInitialCustomerNotes(
              bookingData,
            ),
          );

          setPaymentMethod(
            getInitialPaymentMethod(
              bookingData,
            ),
          );

          setIsSubmitted(
            false,
          );

          setConfirmedOrder(
            null,
          );
          pendingOrderRef.current = null;
        },
        0,
      );

    return () => {
      clearTimeout(
        timeoutId,
      );
    };
  }, [
    bookingData,
    bookingIdentity,
    isOpen,
  ]);


  /* ------------------------------------------------------------------------
     PRICE CALCULATIONS
  ------------------------------------------------------------------------ */

  const { baseCost, conservationFund, serviceFee, totalAmount } = useMemo(
    () => calculateBookingCosts({ ...bookingData, price: unitPrice }, guestsCount),
    [bookingData, unitPrice, guestsCount],
  );


  /* ------------------------------------------------------------------------
     GUEST CONTROLS
  ------------------------------------------------------------------------ */

  const increaseGuests =
    useCallback(() => {
      setGuestsCount(
        (current) => {
          if (
            current >=
            maxGuests
          ) {
            return current;
          }

          return current + 1;
        },
      );
    }, [
      maxGuests,
    ]);


  const decreaseGuests =
    useCallback(() => {
      setGuestsCount(
        (current) => {
          if (
            current <= 1
          ) {
            return 1;
          }

          return current - 1;
        },
      );
    }, []);


  /* ------------------------------------------------------------------------
     FIELD HANDLERS
  ------------------------------------------------------------------------ */

  const handleSetGuestsCount =
    useCallback(
      (value) => {
        const number =
          Number(value);

        if (
          !Number.isFinite(
            number,
          )
        ) {
          return;
        }

        setGuestsCount(
          Math.min(
            Math.max(
              1,
              Math.floor(number),
            ),
            maxGuests,
          ),
        );
      },
      [
        maxGuests,
      ],
    );


  const handleSetSelectedDate =
    useCallback(
      (value) => {
        const next =
          String(
            value || '',
          );

        /**
         * Jangan izinkan tanggal
         * kosong atau tanggal lampau.
         */
        if (!next) {
          setSelectedDate('');
          return;
        }

        setSelectedDate(
          next,
        );
      },
      [],
    );


  const handleSetCustomerName =
    useCallback(
      (value) => {
        setCustomerName(
          String(
            value ?? '',
          ),
        );
      },
      [],
    );


  const handleSetCustomerPhone =
    useCallback(
      (value) => {
        setCustomerPhone(
          String(
            value ?? '',
          ),
        );
      },
      [],
    );


  const handleSetCustomerNotes =
    useCallback(
      (value) => {
        setCustomerNotes(
          String(
            value ?? '',
          ).slice(0, 500),
        );
      },
      [],
    );


  const handleSetPaymentMethod =
    useCallback(
      (value) => {
        if (
          value !== 'qris' &&
          value !== 'va'
        ) {
          return;
        }

        setPaymentMethod(
          value,
        );
      },
      [],
    );


  /* ------------------------------------------------------------------------
     VALIDATION
  ------------------------------------------------------------------------ */

  const validateBooking =
    useCallback(() => {
      if (
        !bookingData
      ) {
        return {
          valid: false,
          message:
            'Data reservasi belum tersedia.',
        };
      }

      if (
        !selectedDate
      ) {
        return {
          valid: false,
          message:
            'Silakan pilih tanggal kegiatan.',
        };
      }

      const today =
        getTodayISODate();

      if (
        selectedDate <
        today
      ) {
        return {
          valid: false,
          message:
            'Tanggal kegiatan tidak boleh sebelum hari ini.',
        };
      }

      if (
        !Number.isInteger(
          guestsCount,
        ) ||
        guestsCount < 1
      ) {
        return {
          valid: false,
          message:
            'Jumlah peserta minimal 1 orang.',
        };
      }

      if (
        guestsCount >
        maxGuests
      ) {
        return {
          valid: false,
          message:
            `Jumlah peserta maksimal ${maxGuests} orang.`,
        };
      }

      if (
        !String(
          customerName,
        ).trim()
      ) {
        return {
          valid: false,
          message:
            'Nama pemesan wajib diisi.',
        };
      }

      const normalizedPhone =
        String(
          customerPhone,
        )
          .replace(
            /[\s()-]/g,
            '',
          );

      if (
        normalizedPhone.length <
        9
      ) {
        return {
          valid: false,
          message:
            'Nomor WhatsApp pemesan belum valid.',
        };
      }

      if (
        paymentMethod !==
          'qris' &&
        paymentMethod !==
          'va'
      ) {
        return {
          valid: false,
          message:
            'Silakan pilih metode pembayaran.',
        };
      }

      return {
        valid: true,
        message: '',
      };
    }, [
      bookingData,
      selectedDate,
      guestsCount,
      maxGuests,
      customerName,
      customerPhone,
      paymentMethod,
    ]);


  /* ------------------------------------------------------------------------
     SUBMIT BOOKING
  ------------------------------------------------------------------------ */

  const submitBooking =
    useCallback(async () => {
      if (submissionRef.current) return submissionRef.current;
      const validation =
        validateBooking();

      if (
        !validation.valid
      ) {
        throw new Error(
          validation.message,
        );
      }

      const normalizedPhone =
        String(
          customerPhone,
        )
          .trim();

      const order = {
        id:
          pendingOrderRef.current?.id || createOrderId(),
        listingId: bookingData.listingId,
        providerId: bookingData.providerId,
        guideId: bookingData.type === 'guide' ? bookingData.guideId || bookingData.id : undefined,

        /* --------------------------------------------------------------
           BOOKING DATA
        -------------------------------------------------------------- */

        type:
          bookingData.type ||
          'experience',

        title:
          getBookingTitle(
            bookingData,
          ),

        location:
          getBookingLocation(
            bookingData,
          ),

        image:
          bookingData.image ||
          bookingData.imageUrl ||
          '',

        /* --------------------------------------------------------------
           CUSTOMER
        -------------------------------------------------------------- */

        customerName:
          String(
            customerName,
          ).trim(),

        customerPhone:
          normalizedPhone,

        customerNotes:
          String(
            customerNotes ||
              '',
          ).trim(),

        /* --------------------------------------------------------------
           BOOKING CONFIG
        -------------------------------------------------------------- */

        date:
          selectedDate,

        guests:
          guestsCount,

        guestsCount:
          guestsCount,

        unitPrice:
          unitPrice,

        baseCost:
          baseCost,

        conservationFund:
          conservationFund,

        serviceFee:
          serviceFee,

        totalPrice:
          totalAmount,

        totalAmount:
          totalAmount,

        /* --------------------------------------------------------------
           PAYMENT
        -------------------------------------------------------------- */

        paymentMethod:
          paymentMethod ===
          'qris'
            ? 'QRIS NuSaJoy'
            : 'Virtual Account Transfer',

        paymentMethodKey:
          paymentMethod,

        status:
          'Menunggu pembayaran',

        isDemo: true,

        createdAt:
          new Date().toISOString(),

        /* --------------------------------------------------------------
           GUIDE
        -------------------------------------------------------------- */

        guideName:
          getGuideName(
            bookingData,
          ),

        guidePhone:
          getGuidePhone(
            bookingData,
          ),

        meetingPoint:
          getMeetingPoint(
            bookingData,
          ),

        meetingTime:
          getMeetingTime(
            bookingData,
          ),

        /* --------------------------------------------------------------
           ORIGINAL BOOKING DATA
        -------------------------------------------------------------- */

        bookingData: {
          ...bookingData,
        },
      };


      pendingOrderRef.current = order;
      setIsSubmitting(true);
      const request = demoPaymentService.createOrder(order);
      submissionRef.current = request;
      try {
        const saved = await request;
        setConfirmedOrder(saved);
        setIsSubmitted(true);
        return saved;
      } finally {
        submissionRef.current = null;
        setIsSubmitting(false);
      }
    }, [
      validateBooking,
      bookingData,
      customerName,
      customerPhone,
      customerNotes,
      selectedDate,
      guestsCount,
      unitPrice,
      baseCost,
      conservationFund,
      serviceFee,
      totalAmount,
      paymentMethod,
    ]);


  /* ------------------------------------------------------------------------
     RESET SUBMISSION
  ------------------------------------------------------------------------ */

  const resetBooking =
    useCallback(() => {
      if (!bookingData) {
        setGuestsCount(1);

        setSelectedDate(
          getTodayISODate(),
        );

        setCustomerName('');

        setCustomerPhone('');

        setCustomerNotes('');

        setPaymentMethod(
          'qris',
        );

        setIsSubmitted(
          false,
        );

        setConfirmedOrder(
          null,
        );

        return;
      }

      const nextMaxGuests =
        getBookingMaxGuests(
          bookingData,
        );

      setGuestsCount(
        getInitialGuests(
          bookingData,
          nextMaxGuests,
        ),
      );

      setSelectedDate(
        getInitialDate(
          bookingData,
        ),
      );

      setCustomerName(
        getInitialCustomerName(
          bookingData,
        ),
      );

      setCustomerPhone(
        getInitialCustomerPhone(
          bookingData,
        ),
      );

      setCustomerNotes(
        getInitialCustomerNotes(
          bookingData,
        ),
      );

      setPaymentMethod(
        getInitialPaymentMethod(
          bookingData,
        ),
      );

      setIsSubmitted(
        false,
      );

      setConfirmedOrder(
        null,
      );
    }, [
      bookingData,
    ]);


  /* ------------------------------------------------------------------------
     RETURN
  ------------------------------------------------------------------------ */

  return {
    /* ----------------------------------------------------------------------
       MAIN FORM STATE
    ---------------------------------------------------------------------- */

    guestsCount,

    selectedDate,

    customerName,

    customerPhone,

    customerNotes,

    paymentMethod,


    /* ----------------------------------------------------------------------
       SUBMISSION STATE
    ---------------------------------------------------------------------- */

    isSubmitted,
    isSubmitting,
    setConfirmedOrder,

    confirmedOrder,


    /* ----------------------------------------------------------------------
       BOOKING CONFIG
    ---------------------------------------------------------------------- */

    unitPrice,

    maxGuests,


    /* ----------------------------------------------------------------------
       CALCULATIONS
    ---------------------------------------------------------------------- */

    baseCost,

    conservationFund,

    serviceFee,

    totalAmount,


    /* ----------------------------------------------------------------------
       SETTERS
    ---------------------------------------------------------------------- */

    setGuestsCount:
      handleSetGuestsCount,

    setSelectedDate:
      handleSetSelectedDate,

    setCustomerName:
      handleSetCustomerName,

    setCustomerPhone:
      handleSetCustomerPhone,

    setCustomerNotes:
      handleSetCustomerNotes,

    setPaymentMethod:
      handleSetPaymentMethod,


    /* ----------------------------------------------------------------------
       ACTIONS
    ---------------------------------------------------------------------- */

    increaseGuests,

    decreaseGuests,

    submitBooking,

    resetBooking,

    validateBooking,


    /* ----------------------------------------------------------------------
       META
    ---------------------------------------------------------------------- */

    bookingIdentity,
  };
}


/* ==========================================================================
   DEFAULT EXPORT
   ========================================================================== */

export default useBookingForm;

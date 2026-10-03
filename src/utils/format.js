/**
 * @file src/utils/format.js
 * NuSaJoy — Shared Formatting & Data Adapter Utilities
 *
 * Digunakan oleh:
 * - FavoritModal
 * - DetailPemanduModal
 * - DetailPengalamanModal
 * - Booking
 * - Experience cards
 * - Guide cards
 * - My Trip
 *
 * Fungsi utama:
 * - format harga
 * - mengambil harga dari berbagai struktur data
 * - mengenali item pemandu
 * - mengubah data pemandu menjadi item My Trip
 * - mengambil lokasi, rating, durasi, dan data tampilan
 */


/* ==========================================================================
   CURRENCY
   ========================================================================== */

/**
 * Format angka menjadi Rupiah.
 *
 * Contoh:
 * 95000 → Rp95.000
 */
export const formatCurrency = (
  value,
  {
    fallback = '-',
    prefix = 'Rp',
  } = {},
) => {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return fallback;
  }

  const numericValue =
    Number(value);

  if (
    Number.isNaN(numericValue)
  ) {
    return fallback;
  }

  return `${prefix}${new Intl.NumberFormat(
    'id-ID',
    {
      maximumFractionDigits: 0,
    },
  ).format(numericValue)}`;
};


/* ==========================================================================
   NUMBER
   ========================================================================== */

export const toNumber = (
  value,
  fallback = 0,
) => {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return fallback;
  }

  const numericValue =
    Number(value);

  return Number.isFinite(
    numericValue,
  )
    ? numericValue
    : fallback;
};


/* ==========================================================================
   PRICE
   ========================================================================== */

/**
 * Mengambil harga dari berbagai
 * kemungkinan struktur data NuSaJoy.
 */
export const getItemPrice = (
  item,
) => {
  if (
    !item ||
    typeof item !== 'object'
  ) {
    return 0;
  }

  const candidates = [
    item.price,
    item.pricePerPerson,
    item.pricePerDay,
    item.startingPrice,
    item.basePrice,
    item.amount,
    item.minPrice,
  ];

  for (
    const candidate of candidates
  ) {
    const numericValue =
      Number(candidate);

    if (
      Number.isFinite(
        numericValue,
      ) &&
      numericValue > 0
    ) {
      return numericValue;
    }
  }

  return 0;
};


/**
 * Label harga untuk card/detail/favorit.
 */
export const getItemPriceLabel = (
  item,
  options = {},
) => {
  const {
    withPrefix = true,
    fallback =
      'Harga belum tersedia',
  } = options;

  const price =
    getItemPrice(item);

  if (!price) {
    return fallback;
  }

  const formatted =
    formatCurrency(
      price,
    );

  if (!withPrefix) {
    return formatted;
  }

  if (
    isGuideItem(item)
  ) {
    return `Mulai ${formatted}`;
  }

  return `Mulai dari ${formatted}`;
};


/* ==========================================================================
   GUIDE DETECTION
   ========================================================================== */

/**
 * Menentukan apakah data merupakan
 * pemandu wisata.
 */
export const isGuideItem = (
  item,
) => {
  if (
    !item ||
    typeof item !== 'object'
  ) {
    return false;
  }

  /* Explicit flag */

  if (
    item.isGuide === true
  ) {
    return true;
  }

  /* Type */

  const typeValues = [
    item.type,
    item.kind,
    item.entityType,
    item.role,
    item.category,
  ]
    .filter(Boolean)
    .map(
      (value) =>
        String(value)
          .trim()
          .toLowerCase(),
    );

  if (
    typeValues.some(
      (value) =>
        value === 'guide' ||
        value === 'tour-guide' ||
        value.includes(
          'pemandu',
        ),
    )
  ) {
    return true;
  }

  /* Guide object */

  if (
    item.guide &&
    typeof item.guide ===
      'object'
  ) {
    return true;
  }

  /* Guide-specific fields */

  if (
    item.guideId ||
    item.guideName ||
    item.guidePhone ||
    item.guideProfile ||
    item.meetingPoint
  ) {
    return true;
  }

  return false;
};


/* ==========================================================================
   GUIDE → MY TRIP ADAPTER
   ========================================================================== */

/**
 * Mengubah objek pemandu menjadi
 * format item yang bisa digunakan
 * oleh My Trip.
 *
 * Ini adalah adapter penting karena:
 *
 * DetailPemanduModal
 *       ↓
 * guideToTripItem()
 *       ↓
 * MyTrip / handleAddToTrip()
 *
 * Fungsi ini tidak mengubah
 * objek guide asli.
 */
export const guideToTripItem = (
  guide,
  options = {},
) => {
  if (
    !guide ||
    typeof guide !== 'object'
  ) {
    return null;
  }

  const {
    day = 1,
    time = '09:00 - 13:00',
    defaultCategory =
      'Pemandu Lokal',
    defaultLocation =
      'Yogyakarta',
  } = options;


  /* ------------------------------------------------------------------------
     BASIC INFORMATION
  ------------------------------------------------------------------------ */

  const guideId =
    guide.id ??
    guide.guideId ??
    guide.slug ??
    `guide-${Date.now()}`;


  const guideName =
    guide.name ??
    guide.guideName ??
    '';


  const title =
    guide.title ??
    guide.serviceName ??
    (
      guideName
        ? `Pemandu ${guideName}`
        : 'Pengalaman bersama pemandu lokal'
    );


  const location =
    guide.location ??
    guide.address ??
    guide.city ??
    defaultLocation;


  const category =
    guide.category ??
    guide.specialty ??
    defaultCategory;


  const image =
    guide.image ??
    guide.imageUrl ??
    guide.photo ??
    guide.avatar ??
    guide.profileImage ??
    '';


  /* ------------------------------------------------------------------------
     PRICE
  ------------------------------------------------------------------------ */

  const price =
    getItemPrice(
      guide,
    );


  /* ------------------------------------------------------------------------
     CONTACT
  ------------------------------------------------------------------------ */

  const guidePhone =
    guide.phone ??
    guide.phoneNumber ??
    guide.whatsapp ??
    '';


  /* ------------------------------------------------------------------------
     MEETING
  ------------------------------------------------------------------------ */

  const meetingPoint =
    guide.meetingPoint ??
    guide.meeting_point ??
    '';


  const meetingTime =
    guide.meetingTime ??
    guide.meeting_time ??
    '';


  /* ------------------------------------------------------------------------
     DURATION
  ------------------------------------------------------------------------ */

  const durationText =
    guide.durationText ??
    guide.duration ??
    guide.durationLabel ??
    '';


  /* ------------------------------------------------------------------------
     RESULT
  ------------------------------------------------------------------------ */

  return {
    /* Identity */

    id:
      `trip-guide-${String(
        guideId,
      )}`,

    sourceId:
      guideId,

    sourceType:
      'guide',

    type:
      'guide',

    isGuide:
      true,


    /* My Trip fields */

    day,

    time,

    title,

    category,

    location,

    price,

    image,

    imageUrl:
      image,

    durationText,

    guideName,

    guidePhone,

    meetingPoint,

    meetingTime,


    /* Optional guide data */

    rating:
      guide.rating ??
      guide.averageRating ??
      null,

    reviewCount:
      guide.reviewCount ??
      guide.reviews ??
      0,

    specialty:
      guide.specialty ??
      '',

    bio:
      guide.bio ??
      guide.description ??
      '',


    /* UX state */

    isNew:
      true,


    /* Transport helper */

    transportTip:
      guide.transportTip ??
      'Atur titik kumpul bersama pemandu sebelum kegiatan dimulai.',


    /* Preserve original object */

    guide: {
      ...guide,
    },
  };
};


/* ==========================================================================
   TEXT
   ========================================================================== */

/**
 * Kapitalisasi awal text.
 */
export const capitalize = (
  value = '',
) => {
  const text =
    String(value).trim();

  if (!text) {
    return '';
  }

  return (
    text.charAt(0).toUpperCase() +
    text.slice(1)
  );
};


/**
 * Truncate text untuk preview.
 */
export const truncateText = (
  value = '',
  maxLength = 120,
) => {
  const text =
    String(value);

  if (
    text.length <= maxLength
  ) {
    return text;
  }

  return `${text
    .slice(0, maxLength)
    .trim()}…`;
};


/* ==========================================================================
   DURATION
   ========================================================================== */

export const getDurationLabel = (
  item,
  fallback =
    'Durasi tidak tersedia',
) => {
  if (!item) {
    return fallback;
  }

  const duration =
    item.durationText ||
    item.duration ||
    item.durationLabel;

  return duration
    ? String(duration)
    : fallback;
};


/* ==========================================================================
   LOCATION
   ========================================================================== */

export const getLocationLabel = (
  item,
  fallback =
    'Lokasi belum tersedia',
) => {
  if (!item) {
    return fallback;
  }

  const location =
    item.location ||
    item.address ||
    item.city ||
    item.destination;

  return location
    ? String(location)
    : fallback;
};


/* ==========================================================================
   RATING
   ========================================================================== */

export const getRating = (
  item,
  fallback = 0,
) => {
  if (!item) {
    return fallback;
  }

  const rating =
    Number(
      item.rating ??
      item.averageRating ??
      item.score,
    );

  return Number.isFinite(
    rating,
  )
    ? rating
    : fallback;
};


/* ==========================================================================
   REVIEW COUNT
   ========================================================================== */

export const getReviewCount = (
  item,
  fallback = 0,
) => {
  if (!item) {
    return fallback;
  }

  const count =
    Number(
      item.reviewCount ??
      item.reviews ??
      item.totalReviews,
    );

  return Number.isFinite(
    count,
  )
    ? count
    : fallback;
};


/* ==========================================================================
   IMAGE
   ========================================================================== */

export const getItemImage = (
  item,
  fallback = '',
) => {
  if (!item) {
    return fallback;
  }

  return (
    item.image ||
    item.imageUrl ||
    item.thumbnail ||
    item.photo ||
    item.coverImage ||
    fallback
  );
};


/* ==========================================================================
   TITLE
   ========================================================================== */

export const getItemTitle = (
  item,
  fallback = 'Tanpa judul',
) => {
  if (!item) {
    return fallback;
  }

  return (
    item.title ||
    item.name ||
    item.serviceName ||
    fallback
  );
};


/* ==========================================================================
   CATEGORY
   ========================================================================== */

export const getItemCategory = (
  item,
  fallback =
    'Pengalaman Lokal',
) => {
  if (!item) {
    return fallback;
  }

  return (
    item.category ||
    item.type ||
    item.specialty ||
    fallback
  );
};


/* ==========================================================================
   DATE
   ========================================================================== */

/**
 * Format ISO date Indonesia.
 */
export const formatDateIndonesia = (
  value,
  fallback = '-',
) => {
  if (!value) {
    return fallback;
  }

  try {
    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return fallback;
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
    return fallback;
  }
};


/* ==========================================================================
   PHONE
   ========================================================================== */

/**
 * Bersihkan nomor telepon.
 */
export const normalizePhoneNumber = (
  value = '',
) => {
  return String(value)
    .replace(/[^\d+]/g, '')
    .trim();
};


/* ==========================================================================
   FAVORITE / GENERIC ITEM KEY
   ========================================================================== */

/**
 * Membuat key item yang dapat dipakai
 * oleh sistem favorit.
 */
export const getItemKey = (
  item,
) => {
  if (
    item === null ||
    item === undefined
  ) {
    return '';
  }

  if (
    typeof item ===
      'string' ||
    typeof item ===
      'number'
  ) {
    return String(item);
  }

  if (
    typeof item !==
    'object'
  ) {
    return '';
  }

  return String(
    item.id ??
    item.slug ??
    item.favoriteKey ??
    item.favoriteId ??
    item.guideId ??
    item.destinationId ??
    item.title ??
    item.name ??
    '',
  );
};


/* ==========================================================================
   DEFAULT EXPORT
   ========================================================================== */

export default {
  formatCurrency,
  toNumber,

  getItemPrice,
  getItemPriceLabel,

  isGuideItem,
  guideToTripItem,

  capitalize,
  truncateText,

  getDurationLabel,
  getLocationLabel,

  getRating,
  getReviewCount,

  getItemImage,
  getItemTitle,
  getItemCategory,

  formatDateIndonesia,
  normalizePhoneNumber,

  getItemKey,
};
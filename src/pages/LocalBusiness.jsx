import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

import { useNavigate } from "react-router-dom";

import { supabase } from "../utils/supabaseClient";
import { getPublishedListings } from '../service/partnerService.js';

import "../styles/LocalBusiness.css";

/* =========================================================
   CONFIGURATION
========================================================= */

const BUSINESS_TABLE =
  import.meta.env.VITE_LOCAL_BUSINESS_TABLE ||
  "local_businesses";

const FAVORITES_STORAGE_KEY =
  "nusajoy_local_business_favorites";

const WHATSAPP_DEFAULT_COUNTRY = "62";

const SORT_OPTIONS = [
  {
    value: "relevance",
    label: "Paling relevan",
  },
  {
    value: "rating",
    label: "Rating tertinggi",
  },
  {
    value: "reviews",
    label: "Ulasan terbanyak",
  },
  {
    value: "name",
    label: "Nama A–Z",
  },
  {
    value: "newest",
    label: "Terbaru",
  },
];

const DEFAULT_CATEGORY = "Semua";

const CATEGORY_CONFIG = [
  {
    value: "Semua",
    icon: "✨",
  },
  {
    value: "Kuliner",
    icon: "🍜",
  },
  {
    value: "Akomodasi",
    icon: "🏨",
  },
  {
    value: "Kriya",
    icon: "🎨",
  },
  {
    value: "Budaya",
    icon: "🏛️",
  },
  {
    value: "Aktivitas",
    icon: "🧭",
  },
  {
    value: "Produk Lokal",
    icon: "🛍️",
  },
];

const FALLBACK_CATEGORY_ICONS = {
  kuliner: "🍜",
  makanan: "🍜",
  restoran: "🍽️",
  kafe: "☕",
  akomodasi: "🏨",
  hotel: "🏨",
  homestay: "🏡",
  kriya: "🎨",
  kerajinan: "🎨",
  budaya: "🏛️",
  sejarah: "📖",
  aktivitas: "🧭",
  wisata: "🗺️",
  produk: "🛍️",
  "produk lokal": "🛍️",
};

const PLACEHOLDER_EMOJIS = [
  "🏛️",
  "🍜",
  "🎨",
  "🏡",
  "🧭",
  "🌿",
  "🛍️",
];

/* =========================================================
   HELPERS
========================================================= */

const asText = (value, fallback = "") => {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  const text = String(value).trim();

  return text || fallback;
};

const asNumber = (
  value,
  fallback = 0
) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const asBoolean = (
  value,
  fallback = false
) => {
  if (
    typeof value === "boolean"
  ) {
    return value;
  }

  if (
    value === 1 ||
    value === "1" ||
    value === "true" ||
    value === "TRUE" ||
    value === "yes" ||
    value === "published" ||
    value === "active"
  ) {
    return true;
  }

  if (
    value === 0 ||
    value === "0" ||
    value === "false" ||
    value === "FALSE" ||
    value === "no" ||
    value === "draft" ||
    value === "inactive"
  ) {
    return false;
  }

  return fallback;
};

const safeArray = (value) => {
  if (
    Array.isArray(value)
  ) {
    return value
      .map((item) => {
        if (
          typeof item === "string" ||
          typeof item === "number"
        ) {
          return String(
            item
          ).trim();
        }

        if (
          item &&
          typeof item === "object"
        ) {
          return (
            item.name ||
            item.label ||
            item.title ||
            ""
          )
            .toString()
            .trim();
        }

        return "";
      })
      .filter(Boolean);
  }

  if (
    typeof value === "string" &&
    value.trim()
  ) {
    return value
      .split(/[,\n|]+/)
      .map((item) =>
        item.trim()
      )
      .filter(Boolean);
  }

  return [];
};

const normalizePhone = (value) => {
  const raw = asText(value);

  if (!raw) {
    return "";
  }

  let digits = raw.replace(
    /\D/g,
    ""
  );

  if (digits.startsWith("0")) {
    digits =
      WHATSAPP_DEFAULT_COUNTRY +
      digits.slice(1);
  }

  if (
    digits.startsWith("8") &&
    !digits.startsWith(
      WHATSAPP_DEFAULT_COUNTRY
    )
  ) {
    digits =
      WHATSAPP_DEFAULT_COUNTRY +
      digits;
  }

  return digits;
};

const formatRating = (value) => {
  const rating =
    asNumber(value);

  if (rating <= 0) {
    return "Baru";
  }

  return rating.toFixed(1);
};

const formatPriceRange = (
  value
) => {
  const text = asText(value);

  if (!text) {
    return "Harga menyesuaikan";
  }

  if (
    [
      "1",
      "2",
      "3",
      "4",
    ].includes(text)
  ) {
    return "Rp".repeat(
      Number(text)
    );
  }

  return text;
};

const getCategoryIcon = (
  category
) => {
  const normalized =
    asText(category)
      .toLowerCase();

  if (
    FALLBACK_CATEGORY_ICONS[
      normalized
    ]
  ) {
    return FALLBACK_CATEGORY_ICONS[
      normalized
    ];
  }

  const matched =
    CATEGORY_CONFIG.find(
      (item) =>
        item.value.toLowerCase() ===
        normalized
    );

  return (
    matched?.icon ||
    "📍"
  );
};

const getPlaceholderEmoji = (
  index
) =>
  PLACEHOLDER_EMOJIS[
    index %
      PLACEHOLDER_EMOJIS.length
  ];

const normalizeImages = (
  raw
) => {
  const imageCandidates = [
    raw.images,
    raw.gallery,
    raw.photos,
    raw.image_urls,
  ];

  for (
    const candidate of imageCandidates
  ) {
    const array =
      safeArray(candidate);

    if (array.length) {
      return array;
    }
  }

  const singleImage =
    raw.cover_image ||
    raw.coverImage ||
    raw.image_url ||
    raw.imageUrl ||
    raw.image ||
    raw.photo;

  return singleImage
    ? [singleImage]
    : [];
};

const normalizeBusiness = (
  raw,
  index = 0
) => {
  const images =
    normalizeImages(raw);

  const location =
    raw.location ||
    raw.city ||
    raw.address ||
    raw.area ||
    "Indonesia";

  const address =
    raw.address ||
    raw.full_address ||
    raw.fullAddress ||
    "";

  const city =
    raw.city ||
    raw.kota ||
    raw.area ||
    location;

  const category =
    raw.category ||
    raw.category_name ||
    raw.business_category ||
    raw.businessCategory ||
    "Lokal";

  const rating =
    asNumber(
      raw.rating ??
        raw.average_rating ??
        raw.averageRating,
      0
    );

  const reviewCount =
    asNumber(
      raw.review_count ??
        raw.reviewCount ??
        raw.reviews_count ??
        raw.total_reviews,
      0
    );

  const featured =
    asBoolean(
      raw.featured ??
        raw.is_featured ??
        raw.isFeatured,
      false
    );

  const verified =
    asBoolean(
      raw.verified ??
        raw.is_verified ??
        raw.isVerified,
      false
    );

  const published =
    raw.published ??
    raw.is_published ??
    raw.status ??
    true;

  const services = safeArray(
    raw.services ||
      raw.service_list ||
      raw.serviceList
  );

  const amenities = safeArray(
    raw.amenities ||
      raw.facilities ||
      raw.fasilitas
  );

  const tags = safeArray(
    raw.tags ||
      raw.keywords ||
      raw.specialties
  );

  const openingHours =
    raw.opening_hours ||
    raw.openingHours ||
    raw.operating_hours ||
    raw.operatingHours ||
    raw.hours ||
    "";

  const latitude =
    asNumber(
      raw.latitude ??
        raw.lat ??
        raw.coordinates?.lat,
      NaN
    );

  const longitude =
    asNumber(
      raw.longitude ??
        raw.lng ??
        raw.long ??
        raw.coordinates?.lng ??
        raw.coordinates?.long,
      NaN
    );

  const bookingUrl =
    raw.booking_url ||
    raw.bookingUrl ||
    raw.reservation_url ||
    raw.reservationUrl ||
    "";

  const website =
    raw.website ||
    raw.website_url ||
    raw.websiteUrl ||
    "";

  const phone =
    raw.phone ||
    raw.phone_number ||
    raw.phoneNumber ||
    raw.contact_phone ||
    "";

  const whatsapp =
    raw.whatsapp ||
    raw.whatsapp_number ||
    raw.whatsappNumber ||
    phone;

  const destination =
    raw.destination ||
    raw.related_destination ||
    raw.relatedDestination ||
    raw.destination_name ||
    "";

  const owner =
    raw.owner ||
    raw.owner_name ||
    raw.ownerName ||
    raw.contact_name ||
    "";

  const responseTime =
    raw.response_time ||
    raw.responseTime ||
    "";

  const id =
    raw.id ||
    raw.business_id ||
    `business-${index + 1}`;

  return {
    ...raw,

    id: String(id),

    name:
      asText(
        raw.name ||
          raw.business_name ||
          raw.businessName,
        "Bisnis Lokal NuSaJoy"
      ),

    slug:
      asText(
        raw.slug ||
          raw.business_slug ||
          raw.businessSlug
      ),

    category:
      asText(
        category,
        "Lokal"
      ),

    categoryIcon:
      getCategoryIcon(
        category
      ),

    location:
      asText(
        location,
        "Indonesia"
      ),

    city:
      asText(
        city,
        "Indonesia"
      ),

    address:
      asText(
        address,
        "Alamat belum tersedia"
      ),

    description:
      asText(
        raw.description ||
          raw.short_description ||
          raw.shortDescription ||
          raw.about,
        "Profil bisnis lokal ini belum memiliki deskripsi."
      ),

    longDescription:
      asText(
        raw.long_description ||
          raw.longDescription ||
          raw.description_long ||
          raw.description
      ),

    rating,

    reviewCount,

    featured,

    verified,

    published:
      asBoolean(
        published,
        true
      ),

    priceRange:
      formatPriceRange(
        raw.price_range ||
          raw.priceRange ||
          raw.price ||
          raw.price_level
      ),

    images,

    services,

    amenities,

    tags,

    openingHours:
      asText(
        openingHours,
        "Jam operasional belum tersedia"
      ),

    phone:
      asText(phone),

    whatsapp:
      normalizePhone(
        whatsapp
      ),

    website:
      asText(website),

    bookingUrl:
      asText(bookingUrl),

    destination:
      asText(destination),

    destinationId:
      asText(
        raw.destination_id ||
          raw.destinationId ||
          ""
      ),

    owner:
      asText(owner),

    responseTime:
      asText(
        responseTime,
        "Respons biasanya cepat"
      ),

    latitude,

    longitude,

    createdAt:
      raw.created_at ||
      raw.createdAt ||
      null,

    updatedAt:
      raw.updated_at ||
      raw.updatedAt ||
      null,

    placeholderEmoji:
      getPlaceholderEmoji(
        index
      ),
  };
};

const isVisibleBusiness = (
  business
) => {
  if (
    business.published === false
  ) {
    return false;
  }

  const status =
    asText(
      business.status
    ).toLowerCase();

  if (
    [
      "draft",
      "inactive",
      "archived",
      "deleted",
      "pending",
    ].includes(status)
  ) {
    return false;
  }

  return true;
};

const getSearchScore = (
  business,
  query
) => {
  const normalizedQuery =
    query
      .trim()
      .toLowerCase();

  if (!normalizedQuery) {
    return 0;
  }

  const fields = [
    business.name,
    business.category,
    business.city,
    business.location,
    business.address,
    business.description,
    business.destination,
    ...business.tags,
    ...business.services,
  ];

  let score = 0;

  fields.forEach(
    (field) => {
      const text =
        asText(field)
          .toLowerCase();

      if (!text) {
        return;
      }

      if (
        text ===
        normalizedQuery
      ) {
        score += 100;
      } else if (
        text.startsWith(
          normalizedQuery
        )
      ) {
        score += 60;
      } else if (
        text.includes(
          normalizedQuery
        )
      ) {
        score += 30;
      }
    }
  );

  if (
    business.featured
  ) {
    score += 5;
  }

  if (
    business.verified
  ) {
    score += 3;
  }

  return score;
};

const getSortTimestamp = (
  value
) => {
  const timestamp =
    Date.parse(
      value || ""
    );

  return Number.isFinite(
    timestamp
  )
    ? timestamp
    : 0;
};

const readFavoriteIds = () => {
  try {
    const raw =
      localStorage.getItem(
        FAVORITES_STORAGE_KEY
      );

    const parsed =
      JSON.parse(
        raw || "[]"
      );

    return Array.isArray(
      parsed
    )
      ? parsed.map(
          String
        )
      : [];
  } catch (error) {
    console.warn(
      "Gagal membaca favorit bisnis:",
      error
    );

    return [];
  }
};

const writeFavoriteIds = (
  ids
) => {
  try {
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(
        ids
      )
    );
  } catch (error) {
    console.warn(
      "Gagal menyimpan favorit bisnis:",
      error
    );
  }
};

const buildMapsUrl = (
  business
) => {
  if (
    Number.isFinite(
      business.latitude
    ) &&
    Number.isFinite(
      business.longitude
    )
  ) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${business.latitude},${business.longitude}`
    )}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    business.address ||
      `${business.name}, ${business.city}`
  )}`;
};

const buildWhatsAppUrl = (
  business
) => {
  const phone =
    business.whatsapp ||
    normalizePhone(
      business.phone
    );

  if (!phone) {
    return "";
  }

  const message =
    `Halo ${business.name}, saya menemukan bisnis Anda di NuSaJoy dan ingin mendapatkan informasi lebih lanjut.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(
    message
  )}`;
};

const getImageAlt = (
  business,
  index = 0
) =>
  `${business.name} — ${business.category} di ${business.city}${
    index
      ? `, foto ${index + 1}`
      : ""
  }`;

const hasCoordinates = (
  business
) =>
  Number.isFinite(
    business.latitude
  ) &&
  Number.isFinite(
    business.longitude
  );

/* =========================================================
   ICONS
========================================================= */

const Icon = ({
  children,
  size = 20,
  strokeWidth = 1.8,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={
      strokeWidth
    }
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const icons = {
  search: (
    <Icon>
      <circle
        cx="11"
        cy="11"
        r="7"
      />
      <path d="m20 20-4-4" />
    </Icon>
  ),

  close: (
    <Icon>
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </Icon>
  ),

  filter: (
    <Icon>
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </Icon>
  ),

  sort: (
    <Icon>
      <path d="M8 6h13" />
      <path d="M8 12h9" />
      <path d="M8 18h5" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </Icon>
  ),

  star: (
    <Icon>
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    </Icon>
  ),

  heart: (
    <Icon>
      <path d="M20.8 8.7c0 5.2-8.8 10.3-8.8 10.3S3.2 13.9 3.2 8.7A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.3Z" />
    </Icon>
  ),

  heartFilled: (
    <Icon
      strokeWidth={0}
      size={19}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
    </Icon>
  ),

  arrow: (
    <Icon size={18}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Icon>
  ),

  arrowUp: (
    <Icon size={18}>
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </Icon>
  ),

  location: (
    <Icon size={17}>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle
        cx="12"
        cy="10"
        r="2.5"
      />
    </Icon>
  ),

  phone: (
    <Icon size={18}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .8 2.9a2 2 0 0 1-.5 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.4 1.9.7 2.9.8a2 2 0 0 1 1.6 1.9Z" />
    </Icon>
  ),

  globe: (
    <Icon size={18}>
      <circle
        cx="12"
        cy="12"
        r="9"
      />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </Icon>
  ),

  clock: (
    <Icon size={18}>
      <circle
        cx="12"
        cy="12"
        r="9"
      />
      <path d="M12 7v5l3 2" />
    </Icon>
  ),

  check: (
    <Icon size={15}>
      <path d="m5 12 4 4L19 6" />
    </Icon>
  ),

  share: (
    <Icon size={18}>
      <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
      <path d="m16 6-4-4-4 4" />
      <path d="M12 2v13" />
    </Icon>
  ),

  bookmark: (
    <Icon size={18}>
      <path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-3-6 3V4Z" />
    </Icon>
  ),

  calendar: (
    <Icon size={18}>
      <rect
        x="3"
        y="4.5"
        width="18"
        height="17"
        rx="2"
      />
      <path d="M16 2v5M8 2v5M3 10h18" />
    </Icon>
  ),

  refresh: (
    <Icon size={18}>
      <path d="M20 11a8 8 0 1 0-2.3 5.7" />
      <path d="M20 4v7h-7" />
    </Icon>
  ),

  verified: (
    <Icon size={16}>
      <path d="M12 3 14 4l2.3-.1 1.1 2 2 1.1-.1 2.3 1 2-1 2 .1 2.3-2 1.1-1.1 2-2.3-.1-2 1-2-1-2.3.1-1.1-2-2-1.1.1-2.3-1-2 1-2-.1-2.3 2-1.1 1.1-2 2.3.1 2-1Z" />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </Icon>
  ),

  image: (
    <Icon>
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
      />
      <circle
        cx="8.5"
        cy="9"
        r="1.5"
      />
      <path d="m21 16-5-5L5 20" />
    </Icon>
  ),

  map: (
    <Icon>
      <path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
      <path d="M9 3v15" />
      <path d="M15 6v15" />
    </Icon>
  ),

  message: (
    <Icon>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
    </Icon>
  ),

  sparkles: (
    <Icon>
      <path d="m12 3-1.3 4.5L7 9l3.7 1.5L12 15l1.3-4.5L17 9l-3.7-1.5L12 3Z" />
      <path d="m19 14-.7 2.3L16 17l2.3.7L19 20l.7-2.3L22 17l-2.3-.7L19 14Z" />
    </Icon>
  ),
};

/* =========================================================
   TOAST
========================================================= */

function useBusinessToast() {
  const [
    toast,
    setToast,
  ] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const timerRef =
    useRef(null);

  const showToast =
    useCallback(
      (
        message,
        type = "success"
      ) => {
        window.clearTimeout(
          timerRef.current
        );

        setToast({
          visible: true,
          message,
          type,
        });

        timerRef.current =
          window.setTimeout(
            () => {
              setToast(
                (previous) => ({
                  ...previous,
                  visible: false,
                })
              );
            },
            3200
          );
      },
      []
    );

  useEffect(
    () => () =>
      window.clearTimeout(
        timerRef.current
      ),
    []
  );

  return {
    toast,
    showToast,
  };
}

/* =========================================================
   PAGE
========================================================= */

function LocalBusiness({
  onOpenBookingSummary,
  businesses: providedBusinesses = null,
  onRetry,
}) {
  const navigate =
    useNavigate();

  /*
   * State khusus data yang berasal dari Supabase.
   */
  const [
    fetchedBusinesses,
    setFetchedBusinesses,
  ] = useState([]);

  const [loading, setLoading] =
    useState(
      !Array.isArray(
        providedBusinesses
      )
    );

  const [error, setError] =
    useState("");

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState(
    DEFAULT_CATEGORY
  );

  const [
    sortBy,
    setSortBy,
  ] = useState(
    "relevance"
  );

  const [
    featuredOnly,
    setFeaturedOnly,
  ] = useState(false);

  const [
    filtersOpen,
    setFiltersOpen,
  ] = useState(false);

  const [
    selectedBusiness,
    setSelectedBusiness,
  ] = useState(null);

  const [
    activeModalTab,
    setActiveModalTab,
  ] = useState(
    "overview"
  );

  const [
    galleryIndex,
    setGalleryIndex,
  ] = useState(0);

  const [
    favoriteIds,
    setFavoriteIds,
  ] = useState(
    readFavoriteIds
  );

  const [
    showBackToTop,
    setShowBackToTop,
  ] = useState(false);

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  const {
    toast,
    showToast,
  } =
    useBusinessToast();

  const searchRef =
    useRef(null);

  /*
   * Props businesses dinormalisasi secara langsung
   * tanpa setState() di dalam useEffect.
   */
  const normalizedProvidedBusinesses =
    useMemo(() => {
      if (
        !Array.isArray(
          providedBusinesses
        )
      ) {
        return null;
      }

      return providedBusinesses
        .map(
          (
            item,
            index
          ) =>
            normalizeBusiness(
              item,
              index
            )
        )
        .filter(
          isVisibleBusiness
        );
    }, [
      providedBusinesses,
    ]);

  /*
   * Data utama:
   * - gunakan props jika tersedia
   * - gunakan hasil Supabase jika tidak
   */
  const businesses =
    normalizedProvidedBusinesses ??
    fetchedBusinesses;

  const pageLoading =
    !Array.isArray(
      providedBusinesses
    ) &&
    loading;

  const pageError =
    !Array.isArray(
      providedBusinesses
    )
      ? error
      : "";

  /* =======================================================
     FETCH BUSINESSES
  ======================================================= */

  const fetchBusinesses =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        try {
          if (silent) {
            setIsRefreshing(
              true
            );
          } else {
            setLoading(true);
          }

          setError("");

          const {
            data,
            error: queryError,
          } =
            await supabase
              .from(
                BUSINESS_TABLE
              )
              .select("*");

          if (queryError) {
            throw queryError;
          }
          const partnerBusinesses = await getPublishedListings('business');

          const normalized =
            Array.isArray(data)
              ? [...data, ...partnerBusinesses]
                  .map(
                    (
                      item,
                      index
                    ) =>
                      normalizeBusiness(
                        item,
                        index
                      )
                  )
                  .filter(
                    isVisibleBusiness
                  )
              : [];

          setFetchedBusinesses(
            normalized
          );
        } catch (fetchError) {
          console.error(
            "LocalBusiness fetch error:",
            fetchError
          );

          setError(
            fetchError?.message ||
              "Gagal memuat data bisnis lokal."
          );
        } finally {
          setLoading(false);
          setIsRefreshing(false);
        }
      },
      []
    );

  /* =======================================================
     INITIAL FETCH
  ======================================================= */

  useEffect(() => {
    if (
      Array.isArray(
        providedBusinesses
      )
    ) {
      return undefined;
    }

    /*
     * Delay satu tick agar pemanggilan fungsi
     * yang berisi setState tidak dianggap sebagai
     * setState synchronous langsung di effect.
     */
    const timerId =
      window.setTimeout(() => {
        void fetchBusinesses();
      }, 0);

    return () => {
      window.clearTimeout(
        timerId
      );
    };
  }, [
    providedBusinesses,
    fetchBusinesses,
  ]);

  /* =======================================================
     SCROLL
  ======================================================= */

  useEffect(() => {
    const handleScroll =
      () => {
        setShowBackToTop(
          window.scrollY >
            520
        );
      };

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    handleScroll();

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

  /* =======================================================
     MODAL SIDE EFFECT
  ======================================================= */

  useEffect(() => {
    if (
      !selectedBusiness
    ) {
      return undefined;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    const handleKeyDown =
      (event) => {
        if (
          event.key ===
          "Escape"
        ) {
          setSelectedBusiness(
            null
          );
        }
      };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    selectedBusiness,
  ]);

  /* =======================================================
     CATEGORY OPTIONS
  ======================================================= */

  const categoryOptions =
    useMemo(() => {
      const existing =
        new Set(
          businesses.map(
            (business) =>
              business.category
          )
        );

      const predefined =
        CATEGORY_CONFIG.map(
          (item) =>
            item.value
        );

      const custom =
        Array.from(
          existing
        ).filter(
          (item) =>
            !predefined
              .map(
                (value) =>
                  value.toLowerCase()
              )
              .includes(
                item.toLowerCase()
              )
        );

      return [
        ...CATEGORY_CONFIG,
        ...custom.map(
          (value) => ({
            value,
            icon:
              getCategoryIcon(
                value
              ),
          })
        ),
      ];
    }, [
      businesses,
    ]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(
    () => {
      const verified =
        businesses.filter(
          (business) =>
            business.verified
        ).length;

      const featured =
        businesses.filter(
          (business) =>
            business.featured
        ).length;

      const categories =
        new Set(
          businesses.map(
            (business) =>
              business.category
          )
        ).size;

      return {
        total:
          businesses.length,
        verified,
        featured,
        categories,
      };
    },
    [businesses]
  );

  /* =======================================================
     FILTER + SORT
  ======================================================= */

  const filteredBusinesses =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      let result =
        businesses.filter(
          (business) => {
            if (
              category !==
                DEFAULT_CATEGORY &&
              business.category
                .toLowerCase() !==
                category.toLowerCase()
            ) {
              return false;
            }

            if (
              featuredOnly &&
              !business.featured
            ) {
              return false;
            }

            if (!query) {
              return true;
            }

            const searchable =
              [
                business.name,
                business.category,
                business.city,
                business.location,
                business.address,
                business.description,
                business.destination,
                ...business.tags,
                ...business.services,
                ...business.amenities,
              ]
                .join(" ")
                .toLowerCase();

            return searchable.includes(
              query
            );
          }
        );

      result = [
        ...result,
      ].sort(
        (a, b) => {
          switch (
            sortBy
          ) {
            case "rating":
              return (
                b.rating -
                a.rating
              );

            case "reviews":
              return (
                b.reviewCount -
                a.reviewCount
              );

            case "name":
              return a.name.localeCompare(
                b.name,
                "id"
              );

            case "newest":
              return (
                getSortTimestamp(
                  b.createdAt
                ) -
                getSortTimestamp(
                  a.createdAt
                )
              );

            case "relevance":
            default:
              return (
                getSearchScore(
                  b,
                  searchQuery
                ) -
                  getSearchScore(
                    a,
                    searchQuery
                  ) ||
                Number(
                  b.featured
                ) -
                  Number(
                    a.featured
                  ) ||
                b.rating -
                  a.rating
              );
          }
        }
      );

      return result;
    }, [
      businesses,
      category,
      featuredOnly,
      searchQuery,
      sortBy,
    ]);

  /* =======================================================
     FILTER COUNT
  ======================================================= */

  const activeFilterCount =
    [
      category !==
        DEFAULT_CATEGORY,
      featuredOnly,
      Boolean(
        searchQuery.trim()
      ),
    ].filter(
      Boolean
    ).length;

  /* =======================================================
     FAVORITE
  ======================================================= */

  const toggleFavorite =
    useCallback(
      (business) => {
        setFavoriteIds(
          (previous) => {
            const id =
              String(
                business.id
              );

            const exists =
              previous.includes(
                id
              );

            const next =
              exists
                ? previous.filter(
                    (
                      favoriteId
                    ) =>
                      favoriteId !==
                      id
                  )
                : [
                    ...previous,
                    id,
                  ];

            writeFavoriteIds(
              next
            );

            showToast(
              exists
                ? `${business.name} dihapus dari favorit.`
                : `${business.name} disimpan ke favorit.`
            );

            return next;
          }
        );
      },
      [showToast]
    );

  /* =======================================================
     OPEN BUSINESS
  ======================================================= */

  const openBusiness =
    useCallback(
      (business) => {
        /*
         * Reset dilakukan saat user membuka bisnis,
         * bukan lewat useEffect.
         */
        setGalleryIndex(0);

        setActiveModalTab(
          "overview"
        );

        setSelectedBusiness(
          business
        );
      },
      []
    );

  /* =======================================================
     CLOSE BUSINESS
  ======================================================= */

  const closeBusiness =
    useCallback(
      () => {
        setSelectedBusiness(
          null
        );
      },
      []
    );

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters =
    useCallback(() => {
      setSearchQuery("");

      setCategory(
        DEFAULT_CATEGORY
      );

      setFeaturedOnly(false);

      setSortBy(
        "relevance"
      );
    }, []);

  /* =======================================================
     SHARE
  ======================================================= */

  const handleShare =
    useCallback(
      async (business) => {
        const shareUrl =
          `${window.location.origin}/local-business${
            business.slug
              ? `/${business.slug}`
              : `?business=${encodeURIComponent(
                  business.id
                )}`
          }`;

        const shareData = {
          title:
            business.name,
          text:
            `${business.name} — ${business.category} di ${business.city}`,
          url: shareUrl,
        };

        try {
          if (
            navigator.share
          ) {
            await navigator.share(
              shareData
            );

            return;
          }

          await navigator.clipboard.writeText(
            shareUrl
          );

          showToast(
            "Link bisnis berhasil disalin."
          );
        } catch (shareError) {
          if (
            shareError?.name ===
            "AbortError"
          ) {
            return;
          }

          console.warn(
            "Share error:",
            shareError
          );

          showToast(
            "Link bisnis gagal dibagikan.",
            "error"
          );
        }
      },
      [showToast]
    );

  /* =======================================================
     WHATSAPP
  ======================================================= */

  const handleWhatsApp =
    useCallback(
      (business) => {
        const url =
          buildWhatsAppUrl(
            business
          );

        if (!url) {
          showToast(
            "Nomor WhatsApp bisnis belum tersedia.",
            "error"
          );

          return;
        }

        window.open(
          url,
          "_blank",
          "noopener,noreferrer"
        );
      },
      [showToast]
    );

  /* =======================================================
     DIRECTIONS
  ======================================================= */

  const handleDirections =
    useCallback(
      (business) => {
        window.open(
          buildMapsUrl(
            business
          ),
          "_blank",
          "noopener,noreferrer"
        );
      },
      []
    );

  /* =======================================================
     BOOKING
  ======================================================= */

  const handleBooking =
    useCallback(
      (business) => {
        if (business.listingId && onOpenBookingSummary) {
          setSelectedBusiness(null);
          onOpenBookingSummary({ ...business, type: 'business', title: business.name, image: business.image_url, price: Number(business.price), maxGuests: 100 });
          return;
        }
        if (
          business.bookingUrl
        ) {
          window.open(
            business.bookingUrl,
            "_blank",
            "noopener,noreferrer"
          );

          return;
        }

        if (
          business.whatsapp
        ) {
          handleWhatsApp(
            business
          );

          return;
        }

        showToast(
          "Reservasi online untuk bisnis ini belum tersedia."
        );
      },
      [
        handleWhatsApp,
        onOpenBookingSummary,
        showToast,
      ]
    );

  /* =======================================================
     RETRY
  ======================================================= */

  const handleRetry =
    useCallback(() => {
      if (
        typeof onRetry ===
        "function"
      ) {
        onRetry();
      }

      void fetchBusinesses();
    }, [
      fetchBusinesses,
      onRetry,
    ]);

  /* =======================================================
     SEARCH KEYBOARD
  ======================================================= */

  const handleSearchKeyDown =
    (event) => {
      if (
        event.key ===
        "Enter"
      ) {
        event.preventDefault();

        document
          .querySelector(
            ".business-result-section"
          )
          ?.scrollIntoView({
            behavior:
              "smooth",
            block: "start",
          });
      }

      if (
        event.key ===
        "Escape"
      ) {
        setSearchQuery("");
      }
    };

  /* =======================================================
     BACK TO TOP
  ======================================================= */

  const scrollToTop =
    () => {
      window.scrollTo({
        top: 0,
        behavior:
          "smooth",
      });
    };

  /* =======================================================
     DESTINATION
  ======================================================= */

  const navigateToDestination =
    (business) => {
      if (
        business.destinationId
      ) {
        navigate(
          `/explore?destination=${encodeURIComponent(
            business.destinationId
          )}`
        );

        return;
      }

      showToast(
        "Eksplorasi destinasi terkait akan segera tersedia."
      );
    };

  /* =======================================================
     LOADING
  ======================================================= */

  if (pageLoading) {
    return (
      <div className="local-business-page">
        <BusinessPageSkeleton />
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (pageError) {
    return (
      <div className="local-business-page">
        <BusinessError
          message={
            pageError
          }
          onRetry={
            handleRetry
          }
        />
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="local-business-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="business-hero">

        <div className="hero-decoration hero-decoration-one" />

        <div className="hero-decoration hero-decoration-two" />

        <div className="business-hero-main">

          <div className="business-hero-copy">

            <span className="hero-kicker">

              <span className="hero-kicker-dot" />

              Ekosistem lokal NuSaJoy

            </span>

            <h1>
              Temukan bisnis lokal
              yang punya cerita.
            </h1>

            <p>
              Jelajahi kuliner,
              homestay, kriya, budaya,
              dan pengalaman lokal
              yang membuat setiap
              perjalanan terasa lebih
              personal.
            </p>

            <div className="hero-trust-row">

              <HeroTrust
                icon="verified"
                value={
                  stats.verified
                }
                label="bisnis terverifikasi"
              />

              <HeroTrust
                icon="business"
                value={
                  stats.total
                }
                label="bisnis lokal"
              />

              <HeroTrust
                icon="sparkles"
                value={
                  stats.categories
                }
                label="kategori"
              />

            </div>

          </div>

          <div className="hero-spotlight">

            <div className="hero-spotlight-orbit hero-spotlight-orbit-one" />

            <div className="hero-spotlight-orbit hero-spotlight-orbit-two" />

            <div className="hero-spotlight-card">

              <span className="hero-spotlight-icon">
                ✦
              </span>

              <div>

                <strong>
                  {stats.featured}
                </strong>

                <span>
                  Pilihan unggulan
                </span>

              </div>

            </div>

            <div className="hero-floating-tag hero-floating-tag-one">

              <span>
                🍜
              </span>

              Kuliner lokal

            </div>

            <div className="hero-floating-tag hero-floating-tag-two">

              <span>
                🎨
              </span>

              Kriya & budaya

            </div>

            <div className="hero-sun" />

          </div>

        </div>

      </section>

      {/* =================================================
          SEARCH
      ================================================= */}

      <section className="business-discovery-bar">

        <div className="business-search">

          <span className="search-icon">
            {icons.search}
          </span>

          <input
            ref={
              searchRef
            }
            value={
              searchQuery
            }
            onChange={(
              event
            ) =>
              setSearchQuery(
                event.target
                  .value
              )
            }
            onKeyDown={
              handleSearchKeyDown
            }
            placeholder="Cari bisnis, kuliner, kriya, homestay, atau pengalaman..."
            aria-label="Cari bisnis lokal"
          />

          {searchQuery && (
            <button
              type="button"
              className="clear-search"
              onClick={() =>
                setSearchQuery(
                  ""
                )
              }
              aria-label="Hapus pencarian"
            >
              {icons.close}
            </button>
          )}

        </div>

        <button
          type="button"
          className={`business-filter-trigger${
            filtersOpen
              ? " is-open"
              : ""
          }`}
          onClick={() =>
            setFiltersOpen(
              (previous) =>
                !previous
            )
          }
        >

          {icons.filter}

          Filter

          {activeFilterCount >
            0 && (
            <span>
              {
                activeFilterCount
              }
            </span>
          )}

        </button>

        <label className="sort-wrapper">

          <span>
            {icons.sort}
          </span>

          <select
            value={sortBy}
            onChange={(
              event
            ) =>
              setSortBy(
                event.target
                  .value
              )
            }
            aria-label="Urutkan bisnis"
          >
            {SORT_OPTIONS.map(
              (option) => (
                <option
                  key={
                    option.value
                  }
                  value={
                    option.value
                  }
                >
                  {option.label}
                </option>
              )
            )}
          </select>

        </label>

      </section>

      {/* =================================================
          FILTER PANEL
      ================================================= */}

      <section
        className={`business-filter-panel${
          filtersOpen
            ? " is-open"
            : ""
        }`}
        aria-hidden={
          !filtersOpen
        }
      >

        <div className="business-filter-panel-inner">

          <div>

            <span className="filter-panel-kicker">
              Sesuaikan pencarian
            </span>

            <strong>
              Temukan yang paling
              relevan untukmu
            </strong>

          </div>

          <label className="featured-toggle">

            <input
              type="checkbox"
              checked={
                featuredOnly
              }
              onChange={(
                event
              ) =>
                setFeaturedOnly(
                  event.target
                    .checked
                )
              }
            />

            <span className="custom-checkbox">

              {featuredOnly &&
                icons.check}

            </span>

            Hanya tampilkan pilihan
            unggulan

          </label>

          <button
            type="button"
            className="clear-filter-button"
            onClick={
              clearFilters
            }
          >
            Reset filter
          </button>

        </div>

      </section>

      {/* =================================================
          CATEGORY
      ================================================= */}

      <section className="category-section">

        <div className="category-header">

          <div>

            <span className="category-eyebrow">
              Eksplorasi
            </span>

            <h2>
              Temukan sesuai
              minatmu
            </h2>

          </div>

          <span className="category-count">

            {
              categoryOptions.length -
              1
            }{" "}
            kategori

          </span>

        </div>

        <div className="category-list">

          {categoryOptions.map(
            (item) => {

              const active =
                category.toLowerCase() ===
                item.value.toLowerCase();

              return (
                <button
                  key={
                    item.value
                  }
                  type="button"
                  className={`category-button${
                    active
                      ? " active"
                      : ""
                  }`}
                  onClick={() =>
                    setCategory(
                      item.value
                    )
                  }
                  aria-pressed={
                    active
                  }
                >

                  <span>
                    {
                      item.icon
                    }
                  </span>

                  {item.value}

                </button>
              );
            }
          )}

        </div>

      </section>

      {/* =================================================
          RESULT HEADER
      ================================================= */}

      <section className="business-result-section">

        <div className="result-header">

          <div>

            <span className="result-label">
              LOCAL DISCOVERY
            </span>

            <h2>
              Bisnis lokal untuk
              perjalananmu
            </h2>

            <p>

              {searchQuery
                ? `Hasil pencarian untuk “${searchQuery}”`
                : category !==
                    DEFAULT_CATEGORY
                  ? `Menampilkan kategori ${category}`
                  : "Pilihan tempat yang bisa memperkaya pengalamanmu."}

            </p>

          </div>

          <div className="result-summary">

            <span className="result-count">

              {
                filteredBusinesses.length
              }{" "}
              tempat

            </span>

            {activeFilterCount >
              0 && (
              <button
                type="button"
                onClick={
                  clearFilters
                }
              >
                Reset
              </button>
            )}

          </div>

        </div>

        {isRefreshing && (
          <div className="refresh-indicator">

            <span className="loading-spinner small" />

            Memperbarui daftar bisnis…

          </div>
        )}

        {filteredBusinesses.length ===
        0 ? (
          <BusinessEmptyState
            hasFilters={
              Boolean(
                searchQuery.trim()
              ) ||
              category !==
                DEFAULT_CATEGORY ||
              featuredOnly
            }
            onReset={
              clearFilters
            }
            onSearch={() =>
              searchRef.current?.focus()
            }
          />
        ) : (
          <div className="business-grid">

            {filteredBusinesses.map(
              (
                business,
                index
              ) => (
                <BusinessCard
                  key={
                    business.id
                  }
                  business={
                    business
                  }
                  index={
                    index
                  }
                  favorite={
                    favoriteIds.includes(
                      String(
                        business.id
                      )
                    )
                  }
                  onFavorite={
                    toggleFavorite
                  }
                  onOpen={
                    openBusiness
                  }
                  onShare={
                    handleShare
                  }
                  onWhatsApp={
                    handleWhatsApp
                  }
                />
              )
            )}

          </div>
        )}

      </section>

      {/* =================================================
          EMPTY FOOTER INFO
      ================================================= */}

      {businesses.length > 0 && (
        <section className="business-community-callout">

          <div className="community-callout-icon">
            {icons.sparkles}
          </div>

          <div>

            <span>
              Untuk pelaku lokal
            </span>

            <h3>
              Punya bisnis yang ingin
              dikenal wisatawan?
            </h3>

            <p>
              Lengkapi profil bisnis
              dan jadikan tempatmu bagian
              dari ekosistem perjalanan
              budaya NuSaJoy.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              showToast(
                "Pendaftaran bisnis lokal akan segera terhubung ke dashboard mitra."
              )
            }
          >
            Gabung bisnis lokal
            {icons.arrow}
          </button>

        </section>
      )}

      {/* =================================================
          BACK TO TOP
      ================================================= */}

      {showBackToTop && (
        <button
          type="button"
          className="business-back-to-top"
          onClick={
            scrollToTop
          }
          aria-label="Kembali ke atas"
        >
          {icons.arrowUp}
        </button>
      )}

      {/* =================================================
          DETAIL MODAL
      ================================================= */}

      {selectedBusiness &&
        typeof document !==
          "undefined" &&
        createPortal(
          <BusinessDetailModal
            business={
              selectedBusiness
            }
            favorite={
              favoriteIds.includes(
                String(
                  selectedBusiness.id
                )
              )
            }
            activeTab={
              activeModalTab
            }
            galleryIndex={
              galleryIndex
            }
            onTabChange={
              setActiveModalTab
            }
            onGalleryChange={
              setGalleryIndex
            }
            onClose={
              closeBusiness
            }
            onFavorite={
              toggleFavorite
            }
            onShare={
              handleShare
            }
            onWhatsApp={
              handleWhatsApp
            }
            onDirections={
              handleDirections
            }
            onBooking={
              handleBooking
            }
            onDestination={
              navigateToDestination
            }
          />,
          document.body
        )}

      {/* =================================================
          TOAST
      ================================================= */}

      {toast.visible && (
        <div
          className={`business-toast ${toast.type}`}
          role="status"
          aria-live="polite"
        >
          <span className="business-toast-dot" />

          <span>
            {
              toast.message
            }
          </span>

        </div>
      )}

    </div>
  );
}

/* =========================================================
   HERO TRUST
========================================================= */

function HeroTrust({
  icon,
  value,
  label,
}) {
  const iconMap = {
    verified:
      icons.verified,

    business:
      icons.bookmark,

    sparkles:
      icons.sparkles,
  };

  return (
    <div className="hero-trust">

      <span className="hero-trust-icon">
        {
          iconMap[
            icon
          ] || icons.sparkles
        }
      </span>

      <div>

        <strong>
          {value}
        </strong>

        <span>
          {label}
        </span>

      </div>

    </div>
  );
}

/* =========================================================
   CARD
========================================================= */

function BusinessCard({
  business,
  index,
  favorite,
  onFavorite,
  onOpen,
  onShare,
  onWhatsApp,
}) {
  const mainImage =
    business.images[
      0
    ];

  return (
    <article
      className="business-card"
      style={{
        "--business-delay": `${Math.min(
          index * 45,
          360
        )}ms`,
      }}
    >

      <div className="business-image">

        {mainImage ? (
          <img
            src={
              mainImage
            }
            alt={getImageAlt(
              business
            )}
            loading="lazy"
          />
        ) : (
          <div
            className="image-placeholder"
            aria-label={`Foto ${business.name}`}
          >
            <span>
              {
                business.placeholderEmoji
              }
            </span>
          </div>
        )}

        <div className="image-overlay" />

        <div className="card-top-actions">

          <div className="card-badges">

            {business.featured && (
              <span className="featured-badge">
                ✦ Unggulan
              </span>
            )}

            {business.verified && (
              <span className="verified-badge">
                {icons.verified}
                Terverifikasi
              </span>
            )}

          </div>

          <div className="card-image-actions">

            <button
              type="button"
              className={`image-action-button${
                favorite
                  ? " is-active"
                  : ""
              }`}
              onClick={(
                event
              ) => {
                event.stopPropagation();

                onFavorite(
                  business
                );
              }}
              aria-label={
                favorite
                  ? `Hapus ${business.name} dari favorit`
                  : `Simpan ${business.name} ke favorit`
              }
              aria-pressed={
                favorite
              }
            >
              {favorite
                ? icons.heartFilled
                : icons.heart}
            </button>

            <button
              type="button"
              className="image-action-button"
              onClick={(
                event
              ) => {
                event.stopPropagation();

                onShare(
                  business
                );
              }}
              aria-label={`Bagikan ${business.name}`}
            >
              {icons.share}
            </button>

          </div>

        </div>

        <span className="image-category">

          {
            business.categoryIcon
          }{" "}

          {business.category}

        </span>

        {business.images
          .length >
          1 && (
          <span className="gallery-count">

            {icons.image}

            {
              business.images
                .length
            }

          </span>
        )}

      </div>

      <div className="business-content">

        <div className="business-title-row">

          <div>

            <h3>
              {business.name}
            </h3>

            {business.verified && (
              <span className="verified-inline">
                {icons.verified}
                Profil terverifikasi
              </span>
            )}

          </div>

          <div className="rating">

            <span>
              ★
            </span>

            <strong>
              {formatRating(
                business.rating
              )}
            </strong>

            {business.reviewCount >
              0 && (
              <small>
                ({business.reviewCount})
              </small>
            )}

          </div>

        </div>

        <div className="business-location">

          {icons.location}

          <span>
            {business.city ||
              business.location}
          </span>

        </div>

        <p className="business-description">
          {
            business.description
          }
        </p>

        <div className="business-highlight-row">

          <span>
            {icons.clock}
            {business.openingHours}
          </span>

          <span>
            {business.priceRange}
          </span>

        </div>

        {business.tags.length >
          0 && (
          <div className="business-tag-row">

            {business.tags
              .slice(0, 3)
              .map(
                (
                  tag
                ) => (
                  <span
                    key={
                      tag
                    }
                  >
                    {tag}
                  </span>
                )
              )}

          </div>
        )}

        {business.destination && (
          <button
            type="button"
            className="destination-link"
            onClick={() =>
              onOpen(
                business
              )
            }
          >

            <span className="destination-icon">
              🗺️
            </span>

            <span>

              <small>
                Bagian dari
                perjalanan
              </small>

              <strong>
                {
                  business.destination
                }
              </strong>

            </span>

            {icons.arrow}

          </button>
        )}

        <div className="business-card-actions">

          <button
            type="button"
            className="detail-button"
            onClick={() =>
              onOpen(
                business
              )
            }
          >
            Lihat detail

            <span>
              {icons.arrow}
            </span>

          </button>

          {business.whatsapp && (
            <button
              type="button"
              className="quick-contact-button"
              onClick={() =>
                onWhatsApp(
                  business
                )
              }
              aria-label={`Hubungi ${business.name}`}
            >
              {icons.message}
            </button>
          )}

        </div>

      </div>

    </article>
  );
}

/* =========================================================
   DETAIL MODAL
========================================================= */

function BusinessDetailModal({
  business,
  favorite,
  activeTab,
  galleryIndex,
  onTabChange,
  onGalleryChange,
  onClose,
  onFavorite,
  onShare,
  onWhatsApp,
  onDirections,
  onBooking,
  onDestination,
}) {
  const images =
    business.images.length
      ? business.images
      : [];

  const activeImage =
    images[
      galleryIndex
    ];

  return (
    <div
      className="business-modal-backdrop"
      onMouseDown={onClose}
      role="presentation"
    >

      <div
        className="business-modal"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="business-modal-title"
      >

        <button
          type="button"
          className="modal-close"
          onClick={
            onClose
          }
          aria-label="Tutup detail bisnis"
        >
          {icons.close}
        </button>

        <div className="modal-gallery">

          {activeImage ? (
            <img
              src={
                activeImage
              }
              alt={getImageAlt(
                business,
                galleryIndex
              )}
              className="modal-image"
            />
          ) : (
            <div className="modal-image modal-image-placeholder">
              {
                business.placeholderEmoji
              }
            </div>
          )}

          <div className="modal-gallery-gradient" />

          <div className="modal-gallery-meta">

            <span className="modal-category">
              {
                business.categoryIcon
              }{" "}
              {business.category}
            </span>

            {business.featured && (
              <span className="modal-featured">
                ✦ Pilihan NuSaJoy
              </span>
            )}

          </div>

          {images.length >
            1 && (
            <div className="modal-thumbnails">

              {images.map(
                (
                  image,
                  index
                ) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    className={`modal-thumbnail${
                      galleryIndex ===
                      index
                        ? " is-active"
                        : ""
                    }`}
                    onClick={() =>
                      onGalleryChange(
                        index
                      )
                    }
                    aria-label={`Foto ${
                      index + 1
                    }`}
                  >
                    <img
                      src={
                        image
                      }
                      alt=""
                    />
                  </button>
                )
              )}

            </div>
          )}

        </div>

        <div className="modal-content">

          <div className="modal-heading">

            <div>

              <h2
                id="business-modal-title"
              >
                {
                  business.name
                }
              </h2>

              <div className="modal-subline">

                <span>
                  ★{" "}
                  {formatRating(
                    business.rating
                  )}
                </span>

                {business.reviewCount >
                  0 && (
                  <span>
                    {
                      business.reviewCount
                    }{" "}
                    ulasan
                  </span>
                )}

                {business.verified && (
                  <span className="modal-verified">
                    {icons.verified}
                    Terverifikasi
                  </span>
                )}

              </div>

            </div>

            <div className="modal-heading-actions">

              <button
                type="button"
                className={`modal-icon-button${
                  favorite
                    ? " is-active"
                    : ""
                }`}
                onClick={() =>
                  onFavorite(
                    business
                  )}
                aria-label={
                  favorite
                    ? "Hapus dari favorit"
                    : "Simpan ke favorit"
                }
              >
                {favorite
                  ? icons.heartFilled
                  : icons.heart}
              </button>

              <button
                type="button"
                className="modal-icon-button"
                onClick={() =>
                  onShare(
                    business
                  )
                }
                aria-label="Bagikan"
              >
                {icons.share}
              </button>

            </div>

          </div>

          <div className="modal-location">

            {icons.location}

            <span>
              {business.address ||
                `${business.city}, ${business.location}`}
            </span>

          </div>

          <div className="modal-tabs">

            <button
              type="button"
              className={
                activeTab ===
                "overview"
                  ? "active"
                  : ""
              }
              onClick={() =>
                onTabChange(
                  "overview"
                )
              }
            >
              Ringkasan
            </button>

            <button
              type="button"
              className={
                activeTab ===
                "services"
                  ? "active"
                  : ""
              }
              onClick={() =>
                onTabChange(
                  "services"
                )
              }
            >
              Layanan
            </button>

            <button
              type="button"
              className={
                activeTab ===
                "location"
                  ? "active"
                  : ""
              }
              onClick={() =>
                onTabChange(
                  "location"
                )
              }
            >
              Lokasi
            </button>

          </div>

          <div className="modal-tab-content">

            {activeTab ===
              "overview" && (
              <BusinessOverview
                business={
                  business
                }
              />
            )}

            {activeTab ===
              "services" && (
              <BusinessServices
                business={
                  business
                }
              />
            )}

            {activeTab ===
              "location" && (
              <BusinessLocation
                business={
                  business
                }
                onDirections={
                  onDirections
                }
                onDestination={
                  onDestination
                }
              />
            )}

          </div>

          <div className="modal-primary-actions">

            <button
              type="button"
              className="modal-main-button"
              onClick={() =>
                onBooking(
                  business
                )
              }
            >

              {icons.calendar}

              {business.listingId ? 'Coba reservasi simulasi' : business.bookingUrl
                ? "Reservasi sekarang"
                : "Tanya ketersediaan"}

            </button>

            {business.whatsapp && (
              <button
                type="button"
                className="modal-secondary-button"
                onClick={() =>
                  onWhatsApp(
                    business
                  )
                }
              >
                {icons.message}
                WhatsApp
              </button>
            )}

          </div>

          <div className="modal-owner">

            <div className="owner-avatar">
              {business.categoryIcon}
            </div>

            <div>

              <span>
                Pelaku lokal
              </span>

              <strong>
                {business.owner ||
                  "Mitra NuSaJoy"}
              </strong>

              <small>
                {
                  business.responseTime
                }
              </small>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   OVERVIEW
========================================================= */

function BusinessOverview({
  business,
}) {
  return (
    <div className="modal-overview">

      <p className="modal-description">
        {
          business.longDescription ||
          business.description
        }
      </p>

      <div className="modal-info-grid">

        <div>

          <span>
            Jam operasional
          </span>

          <strong>
            {business.openingHours}
          </strong>

        </div>

        <div>

          <span>
            Kisaran harga
          </span>

          <strong>
            {business.priceRange}
          </strong>

        </div>

        <div>

          <span>
            Respons mitra
          </span>

          <strong>
            {
              business.responseTime
            }
          </strong>

        </div>

        <div>

          <span>
            Lokasi
          </span>

          <strong>
            {business.city}
          </strong>

        </div>

      </div>

      {business.destination && (
        <div className="modal-destination">

          <span>
            Rekomendasi perjalanan
          </span>

          <strong>
            {
              business.destination
            }
          </strong>

        </div>
      )}

      {business.tags.length >
        0 && (
        <div className="modal-section-block">

          <span className="modal-section-label">
            Cocok untuk
          </span>

          <div className="modal-chip-list">

            {business.tags.map(
              (tag) => (
                <span
                  key={tag}
                >
                  {tag}
                </span>
              )
            )}

          </div>

        </div>
      )}

    </div>
  );
}

/* =========================================================
   SERVICES
========================================================= */

function BusinessServices({
  business,
}) {
  const hasServices =
    business.services
      .length > 0;

  const hasAmenities =
    business.amenities
      .length > 0;

  if (
    !hasServices &&
    !hasAmenities
  ) {
    return (
      <div className="modal-no-data">

        <div>
          {icons.sparkles}
        </div>

        <h3>
          Detail layanan belum
          tersedia
        </h3>

        <p>
          Hubungi bisnis untuk
          mendapatkan informasi
          terbaru mengenai layanan
          dan fasilitas.
        </p>

      </div>
    );
  }

  return (
    <div className="modal-services">

      {hasServices && (
        <div className="modal-section-block">

          <span className="modal-section-label">
            Layanan
          </span>

          <div className="service-list">

            {business.services.map(
              (service) => (
                <div
                  key={service}
                  className="service-item"
                >

                  <span>
                    {icons.check}
                  </span>

                  <strong>
                    {service}
                  </strong>

                </div>
              )
            )}

          </div>

        </div>
      )}

      {hasAmenities && (
        <div className="modal-section-block">

          <span className="modal-section-label">
            Fasilitas
          </span>

          <div className="modal-chip-list">

            {business.amenities.map(
              (amenity) => (
                <span
                  key={
                    amenity
                  }
                >
                  {amenity}
                </span>
              )
            )}

          </div>

        </div>
      )}

    </div>
  );
}

/* =========================================================
   LOCATION
========================================================= */

function BusinessLocation({
  business,
  onDirections,
  onDestination,
}) {
  const coordinatesAvailable =
    hasCoordinates(
      business
    );

  return (
    <div
      className="modal-location-content"
      data-has-coordinates={
        coordinatesAvailable
      }
    >

      <div className="location-preview">

        <div className="location-preview-glow">
          {icons.map}
        </div>

        <div>

          <span>
            Lokasi bisnis
          </span>

          <strong>
            {
              business.address
            }
          </strong>

          <small>
            {business.city},{" "}
            {
              business.location
            }
          </small>

        </div>

      </div>

      <div className="location-action-grid">

        <button
          type="button"
          onClick={() =>
            onDirections(
              business
            )
          }
        >
          {icons.map}
          Buka Maps
        </button>

        {business.phone && (
          <a
            href={`tel:${business.phone}`}
          >
            {icons.phone}
            Telepon
          </a>
        )}

        {business.website && (
          <a
            href={
              business.website
            }
            target="_blank"
            rel="noreferrer"
          >
            {icons.globe}
            Website
          </a>
        )}

      </div>

      {business.destination && (
        <button
          type="button"
          className="destination-detail-link"
          onClick={() =>
            onDestination(
              business
            )
          }
        >

          <span>
            🗺️
          </span>

          <div>

            <small>
              Jelajahi destinasi
              terkait
            </small>

            <strong>
              {
                business.destination
              }
            </strong>

          </div>

          {icons.arrow}

        </button>
      )}

    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function BusinessEmptyState({
  hasFilters,
  onReset,
  onSearch,
}) {
  return (
    <div className="business-empty">

      <div className="empty-visual">

        <span>
          🔎
        </span>

        <i />
        <i />
        <i />

      </div>

      <span className="empty-eyebrow">
        Tidak menemukan
      </span>

      <h3>
        Belum ada tempat yang
        cocok
      </h3>

      <p>
        Coba gunakan kata kunci
        yang lebih umum atau
        jelajahi kategori lainnya.
      </p>

      <div className="empty-actions">

        {hasFilters && (
          <button
            type="button"
            className="empty-primary-button"
            onClick={
              onReset
            }
          >
            Reset filter
          </button>
        )}

        <button
          type="button"
          className="empty-secondary-button"
          onClick={
            onSearch
          }
        >
          Cari lagi
        </button>

      </div>

    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function BusinessPageSkeleton() {
  return (
    <div className="business-skeleton-page">

      <div className="business-skeleton hero" />

      <div className="business-skeleton-tools" />

      <div className="business-skeleton-category" />

      <div className="business-skeleton-grid">

        {Array.from({
          length: 6,
        }).map(
          (_, index) => (
            <div
              key={
                index
              }
              className="business-skeleton-card"
            >

              <div className="skeleton-image" />

              <div className="skeleton-content">

                <span />
                <span />
                <span />
                <span />

              </div>

            </div>
          )
        )}

      </div>

    </div>
  );
}

/* =========================================================
   ERROR
========================================================= */

function BusinessError({
  message,
  onRetry,
}) {
  return (
    <div className="business-error">

      <div className="error-icon">
        ⚠️
      </div>

      <span className="error-eyebrow">
        LOCAL BUSINESS
      </span>

      <h2>
        Daftar bisnis belum bisa
        dimuat
      </h2>

      <p>
        {message}
      </p>

      <button
        type="button"
        className="retry-button"
        onClick={
          onRetry
        }
      >
        {icons.refresh}
        Coba lagi
      </button>

    </div>
  );
}

export default LocalBusiness;

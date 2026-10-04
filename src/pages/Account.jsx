import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";

import { supabase } from "../utils/supabaseClient";
import "../styles/Account.css";

import {
  INITIAL_NOTIFICATIONS,
  INITIAL_ORDERS,
} from "../data/mockData.js";

import ProfilePhotoPicker from "../components/ProfilePhotoPicker.jsx";

/* =========================================================
   1. KONFIGURASI GLOBAL & DATA STATIS
========================================================= */

const DEFAULT_LOCATION = "Indonesia";
const TOAST_DURATION_MS = 3000;
const WHATSAPP_NUMBER = "6281234567890";

const STORAGE_KEYS = {
  notifications: "nusajoy_notifications_enabled",
  favorites: "nusajoy_favorites",
  favoriteGuides: "nusajoy_favorite_guides",
};

const VALID_SUB_TABS = [
  "profile",
  "pesanan",
  "reservasi",
  "pengalaman",
  "bisnis",
  "notifikasi",
  "bantuan",
  "mitra",
];

const TRAVEL_PREFERENCES = [
  "🌿 Alam",
  "🏖️ Pantai",
  "🍜 Kuliner",
  "🏛️ Budaya",
  "📸 Fotografi",
  "🧭 Adventure",
];

const GUIDE_SPECIALIZATIONS = [
  "🌿 Alam",
  "🏛️ Budaya",
  "🍜 Kuliner",
  "📖 Sejarah",
  "🎨 Kriya",
  "🧭 Adventure",
];

const BUSINESS_CATEGORIES = [
  "🏨 Akomodasi",
  "🍜 Kuliner",
  "🎨 Kriya",
  "🏛️ Budaya",
  "🛍️ Produk lokal",
  "🎟️ Aktivitas wisata",
];

const PERSONALIZATION = [
  {
    label: "Ritme perjalanan",
    value: "Santai & menikmati",
  },
  {
    label: "Minat favorit",
    value: "Kuliner tradisi, sejarah, kriya",
  },
  {
    label: "Rentang anggaran",
    value: "Menengah (Rp100k – Rp250k)",
  },
];

const IMPACT = {
  trips: 3,
  amount: "Rp48.500",
  destination:
    "ke Dana Konservasi Budaya Mandiri untuk pelestarian rumah adat Kotagede.",
};

const FAQS = [
  {
    q: "Bagaimana etika berkunjung ke desa adat?",
    a: "Gunakan pakaian sopan yang menutupi bahu dan lutut. Selalu minta izin sebelum memotret kegiatan ritual atau warga lansia. Pemandu lokal NuSaJoy akan mendampingi dan menjelaskan aturan adat secara rinci.",
  },
  {
    q: "Apakah bisa membatalkan jadwal perjalanan?",
    a: "Pembatalan gratis dengan pengembalian dana 100% jika dilakukan minimal 24 jam sebelum kegiatan dimulai.",
  },
  {
    q: "Ke mana 2.5% Dana Konservasi Budaya disalurkan?",
    a: "Dana konservasi dialokasikan langsung ke kas paguyuban desa adat atau sanggar kriya setempat untuk perawatan alat kesenian dan rumah adat.",
  },
  {
    q: "Bagaimana jika cuaca buruk atau hujan lebat?",
    a: "Pemandu lokal memiliki rute alternatif ramah cuaca seperti lokakarya kriya dalam ruangan atau pawon kuliner tradisi tanpa biaya tambahan.",
  },
];

const GUIDE_FAQS = [
  {
    q: "Bagaimana menerima reservasi baru?",
    a: "Reservasi akan muncul di menu Reservasi. Periksa detail wisatawan, jadwal, titik temu, dan status pembayaran sebelum mengonfirmasi kesiapan.",
  },
  {
    q: "Bagaimana mengubah ketersediaan jadwal?",
    a: "Gunakan pengaturan jadwal pemandu untuk menentukan hari, jam, dan kapasitas yang dapat kamu terima. Perubahan hanya berdampak pada reservasi yang belum dikonfirmasi.",
  },
  {
    q: "Bagaimana wisatawan menghubungi saya?",
    a: "Nomor kontak yang kamu tampilkan pada profil pemandu dapat digunakan untuk komunikasi perjalanan yang sudah terkonfirmasi.",
  },
  {
    q: "Bagaimana meningkatkan kepercayaan wisatawan?",
    a: "Lengkapi foto, cerita pengalaman, spesialisasi, harga, dan aturan layanan. Ulasan positif akan membantu profilmu tampil lebih meyakinkan.",
  },
];

const BUSINESS_FAQS = [
  {
    q: "Bagaimana mengelola informasi bisnis?",
    a: "Pastikan nama bisnis, deskripsi, lokasi, jam operasional, foto, kategori, dan layanan selalu diperbarui agar wisatawan mendapatkan informasi yang akurat.",
  },
  {
    q: "Bagaimana menangani reservasi pelanggan?",
    a: "Reservasi masuk dapat diperiksa dari menu Reservasi. Pastikan kapasitas, waktu layanan, dan status pembayaran sudah sesuai sebelum menerima pelanggan.",
  },
  {
    q: "Bagaimana bisnis mendapatkan lebih banyak pelanggan?",
    a: "Profil lengkap, foto yang jelas, informasi harga yang transparan, dan respons cepat terhadap pesan membantu calon wisatawan merasa lebih percaya.",
  },
  {
    q: "Bagaimana ulasan pelanggan bekerja?",
    a: "Setelah pengalaman selesai, pelanggan dapat memberikan penilaian. Gunakan masukan tersebut untuk memperbaiki layanan dan menjaga kualitas pengalaman lokal.",
  },
];

const PARTNER_BENEFITS = [
  {
    title: "Bebas biaya daftar",
    text: "Tidak ada pungutan pendaftaran untuk sanggar dan warga desa.",
  },
  {
    title: "Tarif ditentukan sendiri",
    text: "Kamu menetapkan nilai jerih payahmu secara mandiri dan bermartabat.",
  },
  {
    title: "Pelatihan ramah tamu",
    text: "Dukungan workshop penceritaan dan manajemen reservasi digital.",
  },
];

/* =========================================================
   2. HELPER MURNI
========================================================= */

const getValidSubTab = (value) =>
  VALID_SUB_TABS.includes(value) ? value : "profile";

const normalizeAccountRole = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const getAccountRole = (user) => {
  const metadata = user?.user_metadata || {};
  const appMetadata = user?.app_metadata || {};

  const rawRole =
    appMetadata.role ||
    metadata.role ||
    metadata.user_role ||
    metadata.account_type ||
    "wisatawan";

  const role = normalizeAccountRole(rawRole);

  if (
    [
      "local_guide",
      "guide",
      "pemandu",
      "pemandu_lokal",
      "tour_guide",
    ].includes(role)
  ) {
    return "local_guide";
  }

  if (
    [
      "local_business",
      "business",
      "bisnis",
      "bisnis_lokal",
      "umkm",
    ].includes(role)
  ) {
    return "local_business";
  }

  return "wisatawan";
};

const getOrderStatus = (order) =>
  String(order?.status || "").toLowerCase();

const isCompletedOrder = (order) => {
  const status = getOrderStatus(order);

  return (
    status.includes("selesai") ||
    status.includes("complete") ||
    status.includes("completed") ||
    status.includes("done")
  );
};

const isCancelledOrder = (order) => {
  const status = getOrderStatus(order);

  return (
    status.includes("batal") ||
    status.includes("cancel") ||
    status.includes("cancelled")
  );
};

const formatRupiah = (value) =>
  `Rp${Number(value || 0).toLocaleString("id-ID")}`;

const formatCount = (value) =>
  Number.isFinite(Number(value)) ? Number(value) : 0;

const readStoredArray = (key) => {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(key) || "[]"
    );

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn(`Gagal membaca ${key}:`, error);

    return [];
  }
};

const readNotificationPreference = () => {
  try {
    const stored = localStorage.getItem(
      STORAGE_KEYS.notifications
    );

    return stored === null ? true : stored === "true";
  } catch {
    return true;
  }
};

const safeMetadataNumber = (user, keys) => {
  const metadata = user?.user_metadata || {};

  for (const key of keys) {
    const numericValue = Number(metadata[key]);

    if (Number.isFinite(numericValue)) {
      return numericValue;
    }
  }

  return 0;
};

const getFaqsByRole = (role) => {
  if (role === "local_guide") {
    return GUIDE_FAQS;
  }

  if (role === "local_business") {
    return BUSINESS_FAQS;
  }

  return FAQS;
};

const openWhatsApp = (message) => {
  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`,
    "_blank",
    "noopener,noreferrer"
  );
};

/* =========================================================
   3. IKON
========================================================= */

const Icon = ({
  children,
  size = 22,
  strokeWidth = 1.8,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

const icons = {
  heart: (
    <Icon>
      <path d="M20.8 8.7c0 5.2-8.8 10.3-8.8 10.3S3.2 13.9 3.2 8.7A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.3Z" />
    </Icon>
  ),

  map: (
    <Icon>
      <path d="m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z" />
      <path d="M9 3v15" />
      <path d="M15 6v15" />
    </Icon>
  ),

  calendar: (
    <Icon>
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

  star: (
    <Icon>
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    </Icon>
  ),

  user: (
    <Icon>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </Icon>
  ),

  users: (
    <Icon>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14a6.5 6.5 0 0 1 3 6" />
    </Icon>
  ),

  settings: (
    <Icon>
      <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.1h-2.4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L8 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6.7v-2.4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L8 8.6l1.7-1.7.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.1h2.4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.7 1.7-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 .3 1.9 1.7 1.7 0 0 0 1.6 1h.1V14h-.1a1.7 1.7 0 0 0-1.6 1Z" />
    </Icon>
  ),

  business: (
    <Icon>
      <path d="M3 21h18" />
      <path d="M5 21V5h14v16" />
      <path d="M8 8h2M14 8h2M8 12h2M14 12h2M8 16h2M14 16h2" />
      <path d="M10 21v-3h4v3" />
    </Icon>
  ),

  clock: (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Icon>
  ),

  bell: (
    <Icon>
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </Icon>
  ),

  bellOff: (
    <Icon>
      <path d="M9.5 4.3A6 6 0 0 1 18 9c0 3 .6 4.7 1.4 6" />
      <path d="M6.3 6.3C6.1 7.1 6 8 6 9c0 7-3 7-3 9h14" />
      <path d="M10 21h4" />
      <path d="m3 3 18 18" />
    </Icon>
  ),

  receipt: (
    <Icon>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
      <path d="M9 8h6M9 12h6" />
    </Icon>
  ),

  help: (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.2a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7" />
      <path d="M12 17h.01" />
    </Icon>
  ),

  chat: (
    <Icon size={18}>
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
    </Icon>
  ),

  headset: (
    <Icon size={18}>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect
        x="3"
        y="14"
        width="4"
        height="6"
        rx="1.5"
      />
      <rect
        x="17"
        y="14"
        width="4"
        height="6"
        rx="1.5"
      />
      <path d="M20 20c0 1-2 2-5 2" />
    </Icon>
  ),

  tune: (
    <Icon size={20}>
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </Icon>
  ),

  leaf: (
    <Icon>
      <path d="M11 20A7 7 0 0 1 4 13c0-5 5-9 16-9 0 11-4 16-9 16Z" />
      <path d="M4 21c3-6 6-9 11-11" />
    </Icon>
  ),

  alert: (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" />
    </Icon>
  ),

  refresh: (
    <Icon size={18}>
      <path d="M20 11a8 8 0 1 0-2.3 5.7" />
      <path d="M20 4v7h-7" />
    </Icon>
  ),

  logout: (
    <Icon>
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 4v16" />
    </Icon>
  ),

  edit: (
    <Icon size={18}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z" />
    </Icon>
  ),

  arrow: (
    <Icon size={18}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Icon>
  ),

  close: (
    <Icon size={20}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Icon>
  ),

  location: (
    <Icon size={16}>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </Icon>
  ),
};

const NOTIFICATION_ICONS = {
  chat: icons.chat,
  booking: icons.receipt,
};

/* =========================================================
   4. KONFIGURASI ROLE NUSAJOY
========================================================= */

/* ---------------------------------------------------------
   WISATAWAN
--------------------------------------------------------- */

const WISATAWAN_ACCOUNT = {
  id: "wisatawan",

  roleLabel: "Pelancong Budaya",

  pageSubtitle:
    "Kelola profil, pesanan, dan preferensi perjalananmu.",

  tabs: [
    {
      id: "profile",
      label: "Ringkasan akun",
      icon: "user",
    },
    {
      id: "pesanan",
      label: "Pesanan saya",
      icon: "receipt",
    },
    {
      id: "notifikasi",
      label: "Notifikasi",
      icon: "bell",
    },
    {
      id: "bantuan",
      label: "Pusat bantuan",
      icon: "help",
    },
    {
      id: "mitra",
      label: "Gabung mitra budaya",
      icon: "users",
    },
  ],

  stats: [
    {
      key: "favoritesCount",
      icon: "heart",
      label: "Favorit",
      hint: "Destinasi tersimpan",
    },
    {
      key: "visitedCount",
      icon: "map",
      label: "Dikunjungi",
      hint: "Tempat yang pernah kamu jelajahi",
    },
    {
      key: "plansCount",
      icon: "calendar",
      label: "Rencana",
      hint: "Perjalanan yang direncanakan",
    },
    {
      key: "reviewsCount",
      icon: "star",
      label: "Ulasan",
      hint: "Ulasan yang kamu berikan",
    },
  ],

  quickActions: [
    {
      id: "favorite",
      icon: "heart",
      title: "Favorit saya",
      description:
        "Lihat destinasi yang kamu simpan",
      to: "/favorite",
    },
    {
      id: "plans",
      icon: "calendar",
      title: "Rencana perjalanan",
      description:
        "Kelola perjalanan yang akan datang",
      to: "/recommendation",
    },
    {
      id: "history",
      icon: "clock",
      title: "Riwayat aktivitas",
      description:
        "Lihat aktivitas perjalananmu",
      message:
        "Riwayat aktivitas akan segera hadir.",
    },
    {
      id: "recommendation",
      icon: "star",
      title: "Rekomendasi untuk saya",
      description:
        "Temukan destinasi berdasarkan preferensimu",
      to: "/recommendation",
    },
  ],

  sidebar: {
    label: "Gaya berwisata",
    title: "Preferensi wisata",
    description:
      "Preferensi perjalananmu membantu NuSaJoy memberi rekomendasi yang lebih sesuai.",
    tags: TRAVEL_PREFERENCES,
    actionLabel: "Atur preferensi",
    actionType: "recommendation",
  },

  settings: {
    notificationsTitle: "Notifikasi",
    notificationsDescription:
      "Update dan rekomendasi perjalanan",
    profileTitle: "Profil & privasi",
    profileDescription:
      "Kelola informasi akun",
    preferencesTitle: "Preferensi aplikasi",
    preferencesDescription:
      "Pengaturan pengalaman NuSaJoy",
  },

  businessCard: {
    icon: "business",
    title: "Punya bisnis lokal?",
    description:
      "Promosikan tempat atau bisnismu agar lebih mudah ditemukan wisatawan.",
    actionLabel: "Kelola bisnis",
    message:
      "Fitur Kelola Bisnis akan segera hadir.",
  },
};

/* ---------------------------------------------------------
   LOCAL GUIDE
--------------------------------------------------------- */

const LOCAL_GUIDE_ACCOUNT = {
  id: "local_guide",

  roleLabel: "Pemandu Lokal",

  pageSubtitle:
    "Kelola profil pemandu, pengalaman, jadwal, dan reservasi wisatawan.",

  tabs: [
    {
      id: "profile",
      label: "Profil pemandu",
      icon: "user",
    },
    {
      id: "reservasi",
      label: "Reservasi",
      icon: "receipt",
    },
    {
      id: "pengalaman",
      label: "Pengalaman saya",
      icon: "map",
    },
    {
      id: "notifikasi",
      label: "Notifikasi",
      icon: "bell",
    },
    {
      id: "bantuan",
      label: "Pusat bantuan",
      icon: "help",
    },
  ],

  stats: [
    {
      key: "activeOrdersCount",
      icon: "receipt",
      label: "Reservasi aktif",
      hint: "Reservasi wisatawan",
    },
    {
      key: "guideExperiencesCount",
      icon: "map",
      label: "Pengalaman",
      hint: "Pengalaman yang ditawarkan",
    },
    {
      key: "guideReviewsCount",
      icon: "star",
      label: "Ulasan",
      hint: "Ulasan dari wisatawan",
    },
    {
      key: "guideRevenue",
      icon: "calendar",
      label: "Pendapatan",
      hint: "Total pendapatan tercatat",
      format: "rupiah",
    },
  ],

  quickActions: [
    {
      id: "reservations",
      icon: "receipt",
      title: "Kelola reservasi",
      description:
        "Periksa dan kelola pemesanan wisatawan",
      action: "reservasi",
    },
    {
      id: "schedule",
      icon: "calendar",
      title: "Jadwal & ketersediaan",
      description:
        "Atur hari dan jam kamu menerima wisatawan",
      message:
        "Pengaturan jadwal pemandu akan segera hadir.",
    },
    {
      id: "experiences",
      icon: "map",
      title: "Pengalaman saya",
      description:
        "Kelola pengalaman wisata yang kamu tawarkan",
      action: "pengalaman",
    },
    {
      id: "reviews",
      icon: "star",
      title: "Ulasan wisatawan",
      description:
        "Lihat penilaian dan masukan dari wisatawan",
      message:
        "Halaman ulasan pemandu akan segera hadir.",
    },
  ],

  sidebar: {
    label: "Spesialisasi",
    title: "Profil pemandu",
    description:
      "Informasi profil dan spesialisasi membantu wisatawan menemukan pemandu yang paling sesuai.",
    tags: GUIDE_SPECIALIZATIONS,
    actionLabel: "Atur spesialisasi",
    actionType: "message",
    actionMessage:
      "Pengaturan spesialisasi pemandu akan segera hadir.",
  },

  settings: {
    notificationsTitle:
      "Notifikasi reservasi",
    notificationsDescription:
      "Pesanan baru dan perubahan jadwal",
    profileTitle: "Profil publik",
    profileDescription:
      "Kelola informasi yang dilihat wisatawan",
    preferencesTitle:
      "Preferensi pemandu",
    preferencesDescription:
      "Atur pengalaman dan kategori layanan",
  },

  businessCard: {
    icon: "users",
    title: "Bangun reputasi sebagai pemandu",
    description:
      "Lengkapi profil dan pengalaman agar lebih mudah ditemukan wisatawan.",
    actionLabel:
      "Lengkapi profil pemandu",
    message:
      "Pengaturan profil publik pemandu akan segera hadir.",
  },
};

/* ---------------------------------------------------------
   LOCAL BUSINESS
--------------------------------------------------------- */

const LOCAL_BUSINESS_ACCOUNT = {
  id: "local_business",

  roleLabel: "Bisnis Lokal",

  pageSubtitle:
    "Kelola bisnis, layanan, reservasi, ulasan, dan performa bisnis lokalmu.",

  tabs: [
    {
      id: "profile",
      label: "Profil bisnis",
      icon: "business",
    },
    {
      id: "reservasi",
      label: "Reservasi",
      icon: "receipt",
    },
    {
      id: "bisnis",
      label: "Kelola bisnis",
      icon: "settings",
    },
    {
      id: "notifikasi",
      label: "Notifikasi",
      icon: "bell",
    },
    {
      id: "bantuan",
      label: "Pusat bantuan",
      icon: "help",
    },
  ],

  stats: [
    {
      key: "businessCount",
      icon: "business",
      label: "Bisnis aktif",
      hint: "Profil bisnis terdaftar",
    },
    {
      key: "businessReservationsCount",
      icon: "receipt",
      label: "Reservasi",
      hint: "Reservasi pelanggan",
    },
    {
      key: "businessReviewsCount",
      icon: "star",
      label: "Ulasan",
      hint: "Ulasan pelanggan",
    },
    {
      key: "businessRevenue",
      icon: "calendar",
      label: "Pendapatan",
      hint: "Total pendapatan tercatat",
      format: "rupiah",
    },
  ],

  quickActions: [
    {
      id: "reservations",
      icon: "receipt",
      title: "Kelola reservasi",
      description:
        "Lihat dan kelola reservasi dari wisatawan",
      action: "reservasi",
    },
    {
      id: "business",
      icon: "business",
      title: "Kelola bisnis",
      description:
        "Perbarui informasi bisnis dan jam operasional",
      action: "bisnis",
    },
    {
      id: "services",
      icon: "map",
      title: "Layanan & pengalaman",
      description:
        "Kelola layanan atau pengalaman yang tersedia",
      message:
        "Pengelolaan layanan bisnis akan segera hadir.",
    },
    {
      id: "reviews",
      icon: "star",
      title: "Ulasan pelanggan",
      description:
        "Lihat penilaian dan masukan pelanggan",
      message:
        "Halaman ulasan bisnis akan segera hadir.",
    },
  ],

  sidebar: {
    label: "Kategori bisnis",
    title: "Profil bisnis",
    description:
      "Informasi yang lengkap membuat bisnis lebih mudah dipercaya dan ditemukan wisatawan.",
    tags: BUSINESS_CATEGORIES,
    actionLabel:
      "Atur kategori bisnis",
    actionType: "message",
    actionMessage:
      "Pengaturan kategori bisnis akan segera hadir.",
  },

  settings: {
    notificationsTitle:
      "Notifikasi bisnis",
    notificationsDescription:
      "Reservasi dan aktivitas pelanggan",
    profileTitle: "Profil bisnis",
    profileDescription:
      "Kelola informasi bisnis",
    preferencesTitle:
      "Preferensi bisnis",
    preferencesDescription:
      "Atur pengalaman pengelolaan bisnis",
  },

  businessCard: {
    icon: "business",
    title: "Kelola kehadiran bisnis",
    description:
      "Pastikan informasi bisnis, layanan, dan jam operasional selalu terbaru.",
    actionLabel:
      "Kelola profil bisnis",
    message:
      "Dashboard bisnis akan segera hadir.",
  },
};

const ACCOUNT_ROLE_CONFIGS = {
  wisatawan: WISATAWAN_ACCOUNT,
  local_guide: LOCAL_GUIDE_ACCOUNT,
  local_business: LOCAL_BUSINESS_ACCOUNT,
};

/* =========================================================
   5. CUSTOM HOOK KECIL
========================================================= */

function useToast() {
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const timerRef = useRef(null);

  const showToast = useCallback(
    (message, type = "success") => {
      window.clearTimeout(timerRef.current);

      setToast({
        visible: true,
        message,
        type,
      });

      timerRef.current = window.setTimeout(() => {
        setToast((prev) => ({
          ...prev,
          visible: false,
        }));
      }, TOAST_DURATION_MS);
    },
    []
  );

  useEffect(
    () => () =>
      window.clearTimeout(timerRef.current),
    []
  );

  return {
    toast,
    showToast,
  };
}

function useOverlayBehavior(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.classList.add(
      "account-modal-open"
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.classList.remove(
        "account-modal-open"
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isOpen, onClose]);
}

/* =========================================================
   6. ACCOUNT — PUSAT LOGIKA
========================================================= */

export default function Account({
  orders = INITIAL_ORDERS,
  notifications: initialNotifications =
    INITIAL_NOTIFICATIONS,
  onNavigateExplore,
  initialSubTab = "profile",
  uiState = "normal",
  currentState = null,
  onRetry,
}) {
  const navigate = useNavigate();

  const effectiveUiState =
    currentState ||
    uiState ||
    "normal";

  /* ---------- akun ---------- */

  const [user, setUser] = useState(null);
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [loggingOut, setLoggingOut] =
    useState(false);

  const [editOpen, setEditOpen] =
    useState(false);
  const [logoutOpen, setLogoutOpen] =
    useState(false);

  const emptyProfile = useMemo(
    () => ({
      name: "",
      location: DEFAULT_LOCATION,
      phone: "",
      bio: "",

      /* Local Business */
      businessName: "",
      category: "",
      openingHours: "",

      /* Local Guide */
      specializations: "",
      languages: "",
      serviceArea: "",
    }),
    []
  );

  const [profile, setProfile] =
    useState(emptyProfile);

  const [form, setForm] =
    useState(emptyProfile);

  /* ---------- akun role ---------- */

  const accountRole =
    getAccountRole(user);

  const accountConfig =
    ACCOUNT_ROLE_CONFIGS[
      accountRole
    ] || WISATAWAN_ACCOUNT;

  /* ---------- statistik ---------- */

  const [favoritesCount, setFavoritesCount] =
    useState(0);

  const visitedCount = 0;
  const plansCount = 0;
  const reviewsCount = 0;

  /* ---------- hub ---------- */

  const [
    selectedSubTab,
    setSelectedSubTab,
  ] = useState(() =>
    getValidSubTab(initialSubTab)
  );

  /*
   * Menentukan tab yang benar tanpa memanggil
   * setState() secara sinkron di dalam useEffect.
   *
   * Jika tab yang sedang dipilih masih tersedia
   * pada role saat ini, tab tersebut dipertahankan.
   *
   * Jika tidak tersedia, gunakan initialSubTab
   * atau tab pertama yang tersedia.
   */
  const activeSubTab = useMemo(() => {
    const currentTabIsValid =
      accountConfig.tabs.some(
        (tab) =>
          tab.id ===
          selectedSubTab
      );

    if (currentTabIsValid) {
      return selectedSubTab;
    }

    const nextInitialTab =
      getValidSubTab(
        initialSubTab
      );

    const initialTabIsValid =
      accountConfig.tabs.some(
        (tab) =>
          tab.id ===
          nextInitialTab
      );

    if (initialTabIsValid) {
      return nextInitialTab;
    }

    return (
      accountConfig.tabs[0]?.id ||
      "profile"
    );
  }, [
    selectedSubTab,
    initialSubTab,
    accountConfig,
  ]);

  const [profileActionHint, setProfileActionHint] =
    useState("");

  const ordersList = useMemo(
    () =>
      Array.isArray(orders)
        ? orders
        : [],
    [orders]
  );

  const [notifList, setNotifList] =
    useState(() =>
      Array.isArray(initialNotifications)
        ? initialNotifications
        : []
    );

  const [
    notificationsEnabled,
    setNotificationsEnabled,
  ] = useState(
    readNotificationPreference
  );

  const {
    toast,
    showToast,
  } = useToast();

  /* ---------- statistik role ---------- */

  const guideExperiencesCount =
    safeMetadataNumber(user, [
      "experiences_count",
      "experience_count",
    ]);

  const guideReviewsCount =
    safeMetadataNumber(user, [
      "reviews_count",
      "guide_reviews_count",
    ]);

  const guideRevenue =
    safeMetadataNumber(user, [
      "revenue_total",
      "guide_revenue",
      "total_revenue",
    ]);

  const businessCount =
    accountRole === "local_business"
      ? Math.max(
          1,
          safeMetadataNumber(user, [
            "business_count",
            "businesses_count",
          ])
        )
      : 0;

  const businessReservationsCount =
    safeMetadataNumber(user, [
      "reservations_count",
      "business_reservations_count",
    ]);

  const businessReviewsCount =
    safeMetadataNumber(user, [
      "reviews_count",
      "business_reviews_count",
    ]);

  const businessRevenue =
    safeMetadataNumber(user, [
      "revenue_total",
      "business_revenue",
      "total_revenue",
    ]);

  /* ---------- turunan ---------- */

  const {
    completedOrdersCount,
    activeOrdersCount,
  } = useMemo(
    () => ({
      completedOrdersCount:
        ordersList.filter(
          isCompletedOrder
        ).length,

      activeOrdersCount:
        ordersList.filter(
          (order) =>
            !isCompletedOrder(order) &&
            !isCancelledOrder(order)
        ).length,
    }),
    [ordersList]
  );

  const unreadNotificationsCount =
    useMemo(
      () =>
        notifList.filter(
          (notification) =>
            !notification?.read
        ).length,
      [notifList]
    );

  const profileCompletion =
    useMemo(() => {
      const profileChecks = [
        profile.name,
        profile.location,
        profile.phone,
        profile.bio,
      ];

      const roleChecks =
        accountRole === "local_guide"
          ? [
              profile.specializations,
              profile.languages,
              profile.serviceArea,
            ]
          : accountRole === "local_business"
            ? [
                profile.businessName,
                profile.category,
                profile.openingHours,
              ]
            : [];

      const checks = [
        ...profileChecks,
        ...roleChecks,
      ].map((value) =>
        Boolean(value?.trim())
      );

      return Math.round(
        (checks.filter(Boolean).length /
          checks.length) *
          100
      );
    }, [
      accountRole,
      profile,
    ]);

  const displayName =
    profile.name ||
    user?.user_metadata
      ?.full_name ||
    user?.user_metadata
      ?.name ||
    user?.email?.split("@")[0] ||
    "Traveler";

  const memberSince = useMemo(() => {
    if (!user?.created_at) {
      return "Member NuSaJoy";
    }

    const date =
      new Date(
        user.created_at
      ).toLocaleDateString(
        "id-ID",
        {
          month: "long",
          year: "numeric",
        }
      );

    return `Member sejak ${date}`;
  }, [user]);

  const statValues = useMemo(
    () => ({
      favoritesCount:
        formatCount(
          favoritesCount
        ),

      visitedCount,
      plansCount,
      reviewsCount,

      activeOrdersCount,

      guideExperiencesCount,
      guideReviewsCount,
      guideRevenue,

      businessCount,
      businessReservationsCount,
      businessReviewsCount,
      businessRevenue,
    }),
    [
      favoritesCount,
      activeOrdersCount,
      guideExperiencesCount,
      guideReviewsCount,
      guideRevenue,
      businessCount,
      businessReservationsCount,
      businessReviewsCount,
      businessRevenue,
    ]
  );

  const tabs = useMemo(
    () =>
      accountConfig.tabs.map(
        (tab) => {
          let label = tab.label;

          if (
            tab.id ===
              "pesanan" ||
            tab.id ===
              "reservasi"
          ) {
            label =
              `${tab.label} (${activeOrdersCount})`;
          }

          if (
            tab.id ===
            "notifikasi"
          ) {
            label =
              `${tab.label} (${unreadNotificationsCount})`;
          }

          return {
            ...tab,
            icon: icons[tab.icon],
            label,
          };
        }
      ),
    [
      accountConfig,
      activeOrdersCount,
      unreadNotificationsCount,
    ]
  );

  const faqItems = useMemo(
    () =>
      getFaqsByRole(
        accountRole
      ),
    [accountRole]
  );

  /* ---------- persistensi ---------- */

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.notifications,
        String(
          notificationsEnabled
        )
      );
    } catch (storageError) {
      console.warn(
        "Gagal menyimpan preferensi notifikasi:",
        storageError
      );
    }
  }, [
    notificationsEnabled,
  ]);

  /* ---------- muat akun + sesi ---------- */

  useEffect(() => {
    let mounted = true;

    const redirectToLogin =
      () =>
        navigate("/login", {
          replace: true,
        });

    async function loadAccount() {
      try {
        setLoading(true);

        const {
          data: {
            session,
          },
          error: sessionError,
        } =
          await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        if (
          sessionError ||
          !session?.user
        ) {
          if (sessionError) {
            console.error(
              "Session error:",
              sessionError
            );
          }

          redirectToLogin();
          return;
        }

        const currentUser =
          session.user;

        const metadata =
          currentUser.user_metadata ||
          {};

        const savedProfile = {
          name:
            metadata.full_name ||
            metadata.name ||
            currentUser.email?.split(
              "@"
            )[0] ||
            "Traveler",

          location:
            metadata.location ||
            DEFAULT_LOCATION,

          phone:
            metadata.phone ||
            "",

          bio:
            metadata.bio ||
            "",

          businessName:
            metadata.business_name ||
            metadata.businessName ||
            "",

          category:
            metadata.category ||
            "",

          openingHours:
            metadata.opening_hours ||
            metadata.openingHours ||
            "",

          specializations:
            metadata.specializations ||
            "",

          languages:
            metadata.languages ||
            "",

          serviceArea:
            metadata.service_area ||
            metadata.serviceArea ||
            "",
        };

        setUser(
          currentUser
        );

        setProfile(
          savedProfile
        );

        setForm(
          savedProfile
        );

        setFavoritesCount(
          readStoredArray(
            STORAGE_KEYS.favorites
          ).length +
            readStoredArray(
              STORAGE_KEYS.favoriteGuides
            ).length
        );
      } catch (error) {
        console.error(
          "Account error:",
          error
        );

        if (mounted) {
          redirectToLogin();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadAccount();

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (
          event,
          session
        ) => {
          if (!mounted) {
            return;
          }

          if (
            event ===
              "SIGNED_OUT" ||
            !session?.user
          ) {
            setUser(null);
            redirectToLogin();
          }
        }
      );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [navigate]);

  /* ---------- navigasi ---------- */

  const navigateFromAccountHub =
    useCallback(
      (target = "jelajah") => {
        if (
          typeof onNavigateExplore ===
          "function"
        ) {
          onNavigateExplore(
            target
          );

          return;
        }

        navigate(
          target ===
            "rekomendasi"
            ? "/recommendation"
            : "/explore"
        );
      },
      [
        navigate,
        onNavigateExplore,
      ]
    );

  const goToPreferences =
    useCallback(() => {
      if (
        accountRole ===
        "wisatawan"
      ) {
        navigate(
          "/recommendation"
        );

        return;
      }

      showToast(
        accountConfig.sidebar
          .actionMessage ||
          "Pengaturan akan segera hadir."
      );
    }, [
      accountRole,
      accountConfig,
      navigate,
      showToast,
    ]);

  /* ---------- edit profil ---------- */

  const openEdit =
    useCallback(() => {
      setForm(profile);
      setEditOpen(true);
    }, [profile]);

  const closeEdit =
    useCallback(() => {
      if (!saving) {
        setEditOpen(false);
      }
    }, [saving]);

  const handleChange =
    useCallback(
      (event) => {
        const {
          name,
          value,
        } = event.target;

        setForm(
          (prev) => ({
            ...prev,
            [name]: value,
          })
        );
      },
      []
    );

  const saveProfile =
    useCallback(
      async (event) => {
        event.preventDefault();

        if (
          !user ||
          saving
        ) {
          return;
        }

        const cleanedName =
          form.name.trim();

        if (!cleanedName) {
          showToast(
            "Nama lengkap wajib diisi.",
            "error"
          );

          return;
        }

        const updatedProfile = {
          name: cleanedName,

          location:
            form.location.trim() ||
            DEFAULT_LOCATION,

          phone:
            form.phone.trim(),

          bio:
            form.bio.trim(),

          businessName:
            form.businessName.trim(),

          category:
            form.category.trim(),

          openingHours:
            form.openingHours.trim(),

          specializations:
            form.specializations.trim(),

          languages:
            form.languages.trim(),

          serviceArea:
            form.serviceArea.trim(),
        };

        setSaving(true);

        try {
          const {
            data,
            error,
          } =
            await supabase.auth.updateUser(
              {
                data: {
                  full_name:
                    updatedProfile.name,

                  name:
                    updatedProfile.name,

                  location:
                    updatedProfile.location,

                  phone:
                    updatedProfile.phone,

                  bio:
                    updatedProfile.bio,

                  role:
                    accountRole,

                  business_name:
                    updatedProfile.businessName,

                  category:
                    updatedProfile.category,

                  opening_hours:
                    updatedProfile.openingHours,

                  specializations:
                    updatedProfile.specializations,

                  languages:
                    updatedProfile.languages,

                  service_area:
                    updatedProfile.serviceArea,
                },
              }
            );

          if (error) {
            throw error;
          }

          if (data?.user) {
            setUser(
              data.user
            );
          }

          setProfile(
            updatedProfile
          );

          setForm(
            updatedProfile
          );

          setEditOpen(false);

          showToast(
            "Profil berhasil diperbarui."
          );
        } catch (error) {
          console.error(
            "Failed to update profile:",
            error
          );

          showToast(
            error?.message ||
              "Gagal menyimpan profil.",
            "error"
          );
        } finally {
          setSaving(false);
        }
      },
      [
        accountRole,
        form,
        saving,
        showToast,
        user,
      ]
    );

  /* ---------- logout ---------- */

  const openLogout =
    useCallback(() => {
      if (!loggingOut) {
        setLogoutOpen(true);
      }
    }, [loggingOut]);

  const closeLogout =
    useCallback(() => {
      if (!loggingOut) {
        setLogoutOpen(false);
      }
    }, [loggingOut]);

  const handleLogout =
    useCallback(async () => {
      if (loggingOut) {
        return;
      }

      setLoggingOut(true);

      try {
        const {
          error,
        } =
          await supabase.auth.signOut();

        if (error) {
          throw error;
        }

        setLogoutOpen(false);

        navigate("/login", {
          replace: true,
        });
      } catch (error) {
        console.error(
          "Logout error:",
          error
        );

        setLoggingOut(false);

        showToast(
          error?.message ||
            "Gagal keluar dari akun.",
          "error"
        );
      }
    }, [
      loggingOut,
      navigate,
      showToast,
    ]);

  /* ---------- hub ---------- */

  const markAllNotificationsRead =
    useCallback(() => {
      setNotifList(
        (list) =>
          list.map(
            (item) => ({
              ...item,
              read: true,
            })
          )
      );
    }, []);

  const toggleNotifications =
    useCallback(() => {
      setNotificationsEnabled(
        (prev) => !prev
      );
    }, []);

  const submitPartnership =
    useCallback(() => {
      showToast(
        "Terima kasih! Formulir kemitraan budaya telah dikirim ke email terdaftar."
      );
    }, [showToast]);

  const handleRoleFeatureAction =
    useCallback(
      (item) => {
        if (item.action) {
          setSelectedSubTab(
            item.action
          );

          return;
        }

        if (item.to) {
          navigate(item.to);

          return;
        }

        showToast(
          item.message ||
            `${
              item.title ||
              "Fitur ini"
            } akan segera hadir.`
        );
      },
      [navigate, showToast]
    );

  const handleSidebarAction =
    useCallback(() => {
      const {
        actionType,
        actionMessage,
      } =
        accountConfig.sidebar;

      if (
        actionType ===
        "recommendation"
      ) {
        navigate(
          "/recommendation"
        );

        return;
      }

      showToast(
        actionMessage ||
          "Pengaturan akan segera hadir."
      );
    }, [
      accountConfig,
      navigate,
      showToast,
    ]);

  /* ---------- overlay ---------- */

  useOverlayBehavior(
    editOpen,
    closeEdit
  );

  useOverlayBehavior(
    logoutOpen,
    closeLogout
  );

  /* ---------- external state ---------- */

  if (
    effectiveUiState ===
    "error"
  ) {
    return (
      <div className="account-page">
        <div
          className="account-state"
          role="alert"
        >
          <div className="account-state-icon">
            {icons.alert}
          </div>

          <div>
            <strong>
              Gagal memuat profil akun
            </strong>

            <p>
              Terjadi gangguan saat
              mengambil data akun.
              Coba muat ulang halaman ini.
            </p>
          </div>

          <button
            type="button"
            className="account-btn account-btn-primary"
            onClick={
              onRetry ||
              (() =>
                window.location.reload())
            }
          >
            {icons.refresh}
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  if (
    effectiveUiState ===
    "loading"
  ) {
    return (
      <div
        className="account-page"
        aria-busy="true"
      >
        <div className="account-shell">
          <div className="account-skeleton account-skeleton-hero" />
          <div className="account-skeleton account-skeleton-body" />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="account-page">
        <div
          className="account-state"
          role="status"
        >
          <div className="account-spinner" />

          <div>
            <strong>
              Menyiapkan akunmu
            </strong>

            <p>
              Sedang mengambil data akun
              dan perjalananmu…
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="account-page"
      data-account-role={accountRole}
    >
      <main className="account-shell">

        {/* =================================================
            HEADER
        ================================================== */}

        <header className="account-header">
          <div>
            <div className="account-role-kicker">
              {accountConfig.roleLabel}
            </div>

            <h1 className="account-title">
              Akun saya
            </h1>

            <p className="account-subtitle">
              {accountConfig.pageSubtitle}
            </p>
          </div>

          <button
            type="button"
            className="account-header-edit"
            onClick={openEdit}
            aria-label="Edit profil"
          >
            {icons.edit}
          </button>
        </header>

        {/* =================================================
            HERO
        ================================================== */}

        <ProfileHero
          displayName={displayName}
          email={user?.email}
          location={
            profile.location
          }
          memberSince={
            memberSince
          }
          roleLabel={
            accountConfig.roleLabel
          }
          onEdit={openEdit}
        />

        {/* =================================================
            STATISTIK ROLE
        ================================================== */}

        <section
          className="account-stats"
          aria-label="Statistik akun"
        >
          {accountConfig.stats.map(
            (stat) => {
              let value =
                statValues[
                  stat.key
                ];

              if (
                stat.format ===
                "rupiah"
              ) {
                value =
                  formatRupiah(
                    value
                  );
              }

              return (
                <StatCard
                  key={
                    stat.key
                  }
                  icon={
                    icons[
                      stat.icon
                    ]
                  }
                  value={
                    value
                  }
                  label={
                    stat.label
                  }
                  hint={
                    stat.hint
                  }
                />
              );
            }
          )}
        </section>

        {/* =================================================
            JOURNEY / ACTIVITY SUMMARY
        ================================================== */}

        <JourneySummary
          role={accountRole}
          completed={
            completedOrdersCount
          }
          active={
            activeOrdersCount
          }
          unread={
            unreadNotificationsCount
          }
          completion={
            profileCompletion
          }
        />

        {/* =================================================
            ACCOUNT WORKSPACE
        ================================================== */}

        <section
          className="account-workspace"
          aria-label="Menu akun"
        >
          <AccountTabs
            tabs={tabs}
            activeTab={
              activeSubTab
            }
            onChange={
              setSelectedSubTab
            }
          />

          {/* ---------- Profile ---------- */}

          {activeSubTab ===
            "profile" && (
            <SummaryPanel
              role={
                accountRole
              }
              roleLabel={
                accountConfig.roleLabel
              }
              completion={
                profileCompletion
              }
              onEdit={openEdit}
              onEditPreferences={
                goToPreferences
              }
              quickActions={
                accountConfig.quickActions
              }
              onAction={
                handleRoleFeatureAction
              }
              hint={
                profileActionHint
              }
              setHint={
                setProfileActionHint
              }
            />
          )}

          {/* ---------- Pesanan / Reservasi ---------- */}

          {(activeSubTab ===
            "pesanan" ||
            activeSubTab ===
              "reservasi") && (
            <OrdersPanel
              role={
                accountRole
              }
              orders={
                ordersList
              }
              onExplore={() =>
                navigateFromAccountHub(
                  "jelajah"
                )
              }
            />
          )}

          {/* ---------- Guide experience ---------- */}

          {activeSubTab ===
            "pengalaman" && (
            <RoleFeaturePanel
              role="local_guide"
              title="Pengalaman yang saya tawarkan"
              description="Kelola pengalaman budaya, aktivitas, kategori, dan informasi yang dilihat wisatawan."
              items={
                accountConfig.quickActions.filter(
                  (item) =>
                    item.id ===
                      "experiences" ||
                    item.id ===
                      "reviews"
                )
              }
              onAction={
                handleRoleFeatureAction
              }
            />
          )}

          {/* ---------- Business ---------- */}

          {activeSubTab ===
            "bisnis" && (
            <RoleFeaturePanel
              role="local_business"
              title="Kelola bisnis"
              description="Atur informasi bisnis, layanan, pengalaman, dan kualitas profil bisnis lokalmu."
              items={
                accountConfig.quickActions.filter(
                  (item) =>
                    item.id ===
                      "business" ||
                    item.id ===
                      "services" ||
                    item.id ===
                      "reviews"
                )
              }
              onAction={
                handleRoleFeatureAction
              }
            />
          )}

          {/* ---------- Notifications ---------- */}

          {activeSubTab ===
            "notifikasi" && (
            <NotificationsPanel
              items={
                notifList
              }
              onMarkAllRead={
                markAllNotificationsRead
              }
            />
          )}

          {/* ---------- Help ---------- */}

          {activeSubTab ===
            "bantuan" && (
            <HelpPanel
              role={
                accountRole
              }
              faqs={
                faqItems
              }
            />
          )}

          {/* ---------- Partnership hanya wisatawan ---------- */}

          {activeSubTab ===
            "mitra" &&
            accountRole ===
              "wisatawan" && (
            <PartnerPanel
              onSubmit={
                submitPartnership
              }
            />
          )}
        </section>

        {/* =================================================
            MAIN CONTENT GRID
        ================================================== */}

        <div className="account-content-grid">
          <div className="account-column">

            {/* ---------- Quick Actions ---------- */}

            <section className="account-section">
              <SectionHeader
                label={
                  accountRole ===
                  "wisatawan"
                    ? "Jelajahi perjalananmu"
                    : accountRole ===
                        "local_guide"
                      ? "Kelola aktivitasmu"
                      : "Kelola bisnis kamu"
                }
                title={
                  accountRole ===
                  "wisatawan"
                    ? "Aktivitas & perjalanan"
                    : accountRole ===
                        "local_guide"
                      ? "Operasional pemandu"
                      : "Operasional bisnis"
                }
              />

              <div className="account-action-list">
                {accountConfig.quickActions.map(
                  (item) => (
                    <AccountAction
                      key={item.id}
                      icon={
                        icons[
                          item.icon
                        ]
                      }
                      title={
                        item.title
                      }
                      description={
                        item.description
                      }
                      to={
                        item.to
                      }
                      onClick={() =>
                        handleRoleFeatureAction(
                          item
                        )
                      }
                    />
                  )
                )}
              </div>
            </section>

            {/* ---------- Account Information ---------- */}

            <section className="account-section">
              <SectionHeader
                label="Data akun"
                title={
                  accountRole ===
                  "local_business"
                    ? "Informasi pemilik & kontak"
                    : accountRole ===
                        "local_guide"
                      ? "Informasi pemandu"
                      : "Informasi pribadi"
                }
                action={
                  <button
                    type="button"
                    className="account-link-button"
                    onClick={
                      openEdit
                    }
                  >
                    Edit
                  </button>
                }
              />

              <dl className="account-info">
                <InfoRow
                  label="Nama lengkap"
                  value={
                    displayName
                  }
                />

                <InfoRow
                  label="Email"
                  value={
                    user?.email ||
                    "-"
                  }
                />

                <InfoRow
                  label="Nomor telepon"
                  value={
                    profile.phone ||
                    "Belum ditambahkan"
                  }
                />

                <InfoRow
                  label="Lokasi"
                  value={
                    profile.location ||
                    DEFAULT_LOCATION
                  }
                />

                {accountRole ===
                  "local_guide" && (
                  <>
                    <InfoRow
                      label="Spesialisasi"
                      value={
                        profile.specializations ||
                        "Belum ditambahkan"
                      }
                    />

                    <InfoRow
                      label="Bahasa layanan"
                      value={
                        profile.languages ||
                        "Belum ditambahkan"
                      }
                    />

                    <InfoRow
                      label="Area layanan"
                      value={
                        profile.serviceArea ||
                        "Belum ditambahkan"
                      }
                    />
                  </>
                )}

                {accountRole ===
                  "local_business" && (
                  <>
                    <InfoRow
                      label="Nama bisnis"
                      value={
                        profile.businessName ||
                        "Belum ditambahkan"
                      }
                    />

                    <InfoRow
                      label="Kategori"
                      value={
                        profile.category ||
                        "Belum ditambahkan"
                      }
                    />

                    <InfoRow
                      label="Jam operasional"
                      value={
                        profile.openingHours ||
                        "Belum ditambahkan"
                      }
                    />
                  </>
                )}

                {profile.bio && (
                  <InfoRow
                    label={
                      accountRole ===
                      "local_business"
                        ? "Tentang pemilik"
                        : accountRole ===
                            "local_guide"
                          ? "Cerita pemandu"
                          : "Tentang saya"
                    }
                    value={
                      profile.bio
                    }
                  />
                )}
              </dl>
            </section>
          </div>

          {/* =================================================
              SIDEBAR
          ================================================== */}

          <aside className="account-column">

            {/* ---------- Role Sidebar ---------- */}

            <section className="account-section">
              <SectionHeader
                label={
                  accountConfig
                    .sidebar
                    .label
                }
                title={
                  accountConfig
                    .sidebar
                    .title
                }
              />

              <p className="account-section-text">
                {
                  accountConfig
                    .sidebar
                    .description
                }
              </p>

              <ul className="account-tags">
                {accountConfig.sidebar.tags.map(
                  (tag) => (
                    <li
                      key={tag}
                      className="account-tag"
                    >
                      {tag}
                    </li>
                  )
                )}
              </ul>

              <button
                type="button"
                className="account-btn account-btn-soft account-btn-block"
                onClick={
                  handleSidebarAction
                }
              >
                {
                  accountConfig
                    .sidebar
                    .actionLabel
                }

                {icons.arrow}
              </button>
            </section>

            {/* ---------- Settings ---------- */}

            <section className="account-section">
              <SectionHeader
                label="Akun"
                title="Pengaturan"
              />

              <div className="account-setting-list">
                <SettingRow
                  icon={
                    notificationsEnabled
                      ? icons.bell
                      : icons.bellOff
                  }
                  title={
                    accountConfig
                      .settings
                      .notificationsTitle
                  }
                  description={
                    accountConfig
                      .settings
                      .notificationsDescription
                  }
                  control={
                    <button
                      type="button"
                      className={`account-toggle${
                        notificationsEnabled
                          ? " is-on"
                          : ""
                      }`}
                      onClick={
                        toggleNotifications
                      }
                      aria-label="Aktifkan atau nonaktifkan notifikasi"
                      aria-pressed={
                        notificationsEnabled
                      }
                    >
                      <span />
                    </button>
                  }
                />

                <SettingRow
                  icon={icons.user}
                  title={
                    accountConfig
                      .settings
                      .profileTitle
                  }
                  description={
                    accountConfig
                      .settings
                      .profileDescription
                  }
                  onClick={
                    openEdit
                  }
                />

                <SettingRow
                  icon={
                    icons.settings
                  }
                  title={
                    accountConfig
                      .settings
                      .preferencesTitle
                  }
                  description={
                    accountConfig
                      .settings
                      .preferencesDescription
                  }
                  onClick={
                    handleSidebarAction
                  }
                />
              </div>
            </section>

            {/* ---------- Role Callout ---------- */}

            <section className="account-business">
              <div className="account-business-icon">
                {
                  icons[
                    accountConfig
                      .businessCard
                      .icon
                  ]
                }
              </div>

              <div>
                <h3>
                  {
                    accountConfig
                      .businessCard
                      .title
                  }
                </h3>

                <p>
                  {
                    accountConfig
                      .businessCard
                      .description
                  }
                </p>

                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      accountConfig
                        .businessCard
                        .message
                    )
                  }
                >
                  {
                    accountConfig
                      .businessCard
                      .actionLabel
                  }

                  {icons.arrow}
                </button>
              </div>
            </section>

            {/* ---------- Logout ---------- */}

            <button
              type="button"
              className="account-logout"
              onClick={
                openLogout
              }
              disabled={
                loggingOut
              }
            >
              {icons.logout}

              {loggingOut
                ? "Keluar…"
                : "Keluar dari akun"}
            </button>
          </aside>
        </div>
      </main>

      {/* =====================================================
          PORTAL: EDIT / LOGOUT / TOAST
      ===================================================== */}

      {typeof document !==
        "undefined" &&
        createPortal(
          <div className="account-overlay-root">

            {editOpen && (
              <EditProfileDialog
                form={form}
                email={
                  user?.email
                }
                role={
                  accountRole
                }
                roleLabel={
                  accountConfig.roleLabel
                }
                saving={
                  saving
                }
                onChange={
                  handleChange
                }
                onSubmit={
                  saveProfile
                }
                onClose={
                  closeEdit
                }
                onPhotoSaved={() =>
                  showToast(
                    "Foto profil berhasil diperbarui."
                  )
                }
                onPhotoRemoved={() =>
                  showToast(
                    "Foto profil berhasil dihapus."
                  )
                }
              />
            )}

            {logoutOpen && (
              <LogoutDialog
                loggingOut={
                  loggingOut
                }
                onConfirm={
                  handleLogout
                }
                onClose={
                  closeLogout
                }
              />
            )}

            {toast.visible && (
              <div
                className={`account-toast ${toast.type}`}
                role="status"
                aria-live="polite"
              >
                <span className="account-toast-dot" />
                {
                  toast.message
                }
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}

/* =========================================================
   7. KOMPONEN PRESENTASI
========================================================= */

/* ---------- hero ---------- */

function ProfileHero({
  displayName,
  email,
  location,
  memberSince,
  roleLabel,
  onEdit,
}) {
  return (
    <section className="account-hero">
      <div className="account-hero-avatar">
        <ProfilePhotoPicker
          size="large"
          showControls={false}
        />

        <span
          className="account-online-dot"
          role="img"
          aria-label="Akun aktif"
        />
      </div>

      <div className="account-hero-body">
        <h2 className="account-hero-name">
          Halo, {displayName}!{" "}
          <span aria-hidden="true">
            👋
          </span>
        </h2>

        <p className="account-hero-email">
          {email ||
            "Email tidak tersedia"}
        </p>

        <ul className="account-chip-row">
          <li className="account-chip">
            {icons.location}
            {location ||
              DEFAULT_LOCATION}
          </li>

          <li className="account-chip">
            {memberSince}
          </li>

          <li className="account-chip account-chip-accent">
            {roleLabel}
          </li>
        </ul>
      </div>

      <button
        type="button"
        className="account-hero-edit"
        onClick={onEdit}
      >
        {icons.edit}
        Edit profil
      </button>
    </section>
  );
}

/* ---------- stat ---------- */

function StatCard({
  icon,
  value,
  label,
  hint,
}) {
  return (
    <div className="account-stat">
      <div className="account-stat-icon">
        {icon}
      </div>

      <div className="account-stat-copy">
        <strong className="account-stat-value">
          {value}
        </strong>

        <span className="account-stat-label">
          {label}
        </span>

        <small className="account-stat-hint">
          {hint}
        </small>
      </div>
    </div>
  );
}

/* ---------- journey ---------- */

function JourneySummary({
  role,
  completed,
  active,
  unread,
  completion,
}) {
  const labelSet =
    role === "wisatawan"
      ? {
          first:
            "Perjalanan selesai",
          second:
            "Reservasi aktif",
          third:
            "Notifikasi belum dibaca",
        }
      : role ===
          "local_guide"
        ? {
            first:
              "Reservasi selesai",
            second:
              "Reservasi aktif",
            third:
              "Pesan belum dibaca",
          }
        : {
            first:
              "Pesanan selesai",
            second:
              "Reservasi aktif",
            third:
              "Pesan belum dibaca",
          };

  return (
    <section
      className="account-journey"
      aria-label="Ringkasan aktivitas terbaru"
    >
      <div className="account-journey-item account-journey-item-completed">
        <strong>
          {completed}
        </strong>

        <span>
          {labelSet.first}
        </span>
      </div>

      <div className="account-journey-item account-journey-item-active">
        <strong>
          {active}
        </strong>

        <span>
          {labelSet.second}
        </span>
      </div>

      <div className="account-journey-item account-journey-item-unread">
        <strong>
          {unread}
        </strong>

        <span>
          {labelSet.third}
        </span>
      </div>

      <div className="account-journey-item account-journey-item-completion">
        <strong>
          {completion}%
        </strong>

        <span>
          Profil lengkap
        </span>

        <div
          className="account-progress"
          aria-hidden="true"
        >
          <span
            style={{
              width: `${completion}%`,
            }}
          />
        </div>
      </div>
    </section>
  );
}

/* ---------- tabs ---------- */

function AccountTabs({
  tabs,
  activeTab,
  onChange,
}) {
  const handleKeyDown = (
    event
  ) => {
    const index =
      tabs.findIndex(
        (tab) =>
          tab.id ===
          activeTab
      );

    let next = null;

    if (
      event.key ===
      "ArrowRight"
    ) {
      next =
        (index + 1) %
        tabs.length;
    } else if (
      event.key ===
      "ArrowLeft"
    ) {
      next =
        (index - 1 +
          tabs.length) %
        tabs.length;
    } else if (
      event.key === "Home"
    ) {
      next = 0;
    } else if (
      event.key === "End"
    ) {
      next =
        tabs.length - 1;
    }

    if (next === null) {
      return;
    }

    event.preventDefault();

    onChange(
      tabs[next].id
    );

    document
      .getElementById(
        `account-tab-${tabs[next].id}`
      )
      ?.focus();
  };

  return (
    <div
      className="account-tabs"
      role="tablist"
      aria-label="Menu akun"
      onKeyDown={
        handleKeyDown
      }
    >
      {tabs.map((tab) => {
        const selected =
          activeTab ===
          tab.id;

        return (
          <button
            key={tab.id}
            id={`account-tab-${tab.id}`}
            type="button"
            role="tab"
            className="account-tab"
            aria-selected={
              selected
            }
            aria-controls={`account-subview-${tab.id}`}
            tabIndex={
              selected
                ? 0
                : -1
            }
            onClick={() =>
              onChange(
                tab.id
              )
            }
          >
            {tab.icon}

            <span>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- panel head ---------- */

function PanelHead({
  title,
  description,
  action,
}) {
  return (
    <div className="account-panel-head">
      <div>
        <h2>
          {title}
        </h2>

        {description && (
          <p>
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

/* ---------- summary ---------- */

function SummaryPanel({
  role,
  roleLabel,
  completion,
  onEdit,
  onEditPreferences,
  quickActions,
  onAction,
  hint,
  setHint,
}) {
  const isTourist =
    role === "wisatawan";

  const isGuide =
    role ===
    "local_guide";

  const isBusiness =
    role ===
    "local_business";

  return (
    <div
      id="account-subview-profile"
      role="tabpanel"
      aria-labelledby="account-tab-profile"
      className="account-panel account-summary-grid"
    >
      {/* completion */}

      <div className="account-card account-completion">
        <div>
          <span className="account-card-eyebrow">
            {roleLabel}
          </span>

          <h3>
            {isTourist
              ? "Lengkapi profil perjalananmu"
              : isGuide
                ? "Lengkapi profil pemandumu"
                : "Lengkapi profil bisnis dan kontakmu"}
          </h3>

          <p>
            {isTourist
              ? "Profil yang lebih lengkap membantu NuSaJoy menampilkan pengalaman yang lebih relevan."
              : isGuide
                ? "Profil pemandu yang lengkap membuat wisatawan lebih mudah memahami spesialisasi dan layananmu."
                : "Profil yang lengkap membantu wisatawan memahami bisnis, layanan, dan informasi kontakmu."}
          </p>
        </div>

        <div
          className="account-ring"
          style={{
            "--account-progress": `${completion}%`,
          }}
          role="img"
          aria-label={`Profil ${completion}% lengkap`}
        >
          <strong>
            {completion}%
          </strong>

          <span>
            Lengkap
          </span>
        </div>

        <button
          type="button"
          className="account-btn account-btn-soft"
          onClick={onEdit}
        >
          {completion >=
          100
            ? "Perbarui profil"
            : "Lengkapi profil"}

          {icons.arrow}
        </button>
      </div>

      {/* tourist personalization */}

      {isTourist && (
        <div className="account-card">
          <h3 className="account-card-title">
            {icons.tune}
            Preferensi personalisasi kamu
          </h3>

          <dl className="account-info account-info-flush">
            {PERSONALIZATION.map(
              (item) => (
                <InfoRow
                  key={
                    item.label
                  }
                  label={
                    item.label
                  }
                  value={
                    item.value
                  }
                />
              )
            )}
          </dl>

          <button
            type="button"
            className="account-btn account-btn-soft account-btn-block"
            onClick={
              onEditPreferences
            }
          >
            Atur ulang preferensi di Rekomendasi
          </button>
        </div>
      )}

      {/* guide-specific */}

      {isGuide && (
        <RoleMetricCard
          icon={icons.users}
          title="Profil yang dilihat wisatawan"
          value="Siap dikembangkan"
          description="Gunakan profil publik untuk menonjolkan cerita, spesialisasi, bahasa, dan area layananmu."
          actionLabel="Kelola pengalaman"
          onAction={() =>
            onAction({
              id: "summary-guide-experience",
              title:
                "Pengalaman saya",
              action:
                "pengalaman",
            })
          }
        />
      )}

      {/* business-specific */}

      {isBusiness && (
        <RoleMetricCard
          icon={icons.business}
          title="Kesiapan profil bisnis"
          value={`${completion}%`}
          description="Lengkapi identitas bisnis, lokasi, deskripsi, dan kontak agar lebih mudah ditemukan wisatawan."
          actionLabel="Kelola bisnis"
          onAction={() =>
            onAction({
              id: "summary-business",
              title:
                "Kelola bisnis",
              action:
                "bisnis",
            })
          }
        />
      )}

      {/* tourist impact */}

      {isTourist && (
        <div className="account-card">
          <h3 className="account-card-title">
            {icons.leaf}
            Dampak yang kamu ciptakan
          </h3>

          <div className="account-impact">
            <p>
              Melalui{" "}
              {IMPACT.trips}{" "}
              perjalananmu
              bersama NuSaJoy,
              kamu telah
              menyumbang:
            </p>

            <strong>
              {IMPACT.amount}
            </strong>

            <span>
              {
                IMPACT.destination
              }
            </span>
          </div>
        </div>
      )}

      {/* quick actions */}

      <div className="account-card account-summary-actions-card">
        <div>
          <h3 className="account-card-title">
            {isTourist
              ? icons.map
              : icons.settings}

            Aksi cepat
          </h3>

          <p>
            {isTourist
              ? "Akses fitur perjalanan yang paling sering kamu gunakan."
              : isGuide
                ? "Akses cepat untuk operasional pemandu kamu."
                : "Akses cepat untuk mengelola aktivitas bisnis kamu."}
          </p>
        </div>

        <div className="account-summary-actions">
          {quickActions
            .slice(0, 3)
            .map((item) => (
              <button
                key={
                  item.id
                }
                type="button"
                className="account-mini-action"
                onClick={() => {
                  setHint(
                    item.title
                  );

                  onAction(
                    item
                  );
                }}
              >
                <span className="account-mini-action-icon">
                  {
                    icons[
                      item.icon
                    ]
                  }
                </span>

                <span className="account-mini-action-copy">
                  <strong>
                    {
                      item.title
                    }
                  </strong>

                  <small>
                    {
                      item.description
                    }
                  </small>
                </span>

                {
                  icons.arrow
                }
              </button>
            ))}
        </div>

        {hint && (
          <span
            className="account-action-feedback"
            role="status"
          >
            Membuka: {hint}
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------- metric card ---------- */

function RoleMetricCard({
  icon,
  title,
  value,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className="account-card account-role-metric">
      <div className="account-role-metric-icon">
        {icon}
      </div>

      <div>
        <span className="account-role-metric-label">
          {title}
        </span>

        <strong>
          {value}
        </strong>

        <p>
          {description}
        </p>
      </div>

      <button
        type="button"
        className="account-btn account-btn-soft"
        onClick={
          onAction
        }
      >
        {actionLabel}
        {icons.arrow}
      </button>
    </div>
  );
}

/* ---------- order / reservation ---------- */

function OrdersPanel({
  role,
  orders,
  onExplore,
}) {
  const isTourist =
    role === "wisatawan";

  const title =
    isTourist
      ? "Riwayat & reservasi aktif"
      : role ===
          "local_guide"
        ? "Reservasi wisatawan"
        : "Reservasi pelanggan";

  const description =
    isTourist
      ? "Semua reservasi terkonfirmasi langsung terhubung dengan pemandu lokal."
      : role ===
          "local_guide"
        ? "Periksa jadwal, titik temu, peserta, dan informasi kontak wisatawan yang memesan pengalamanmu."
        : "Periksa detail reservasi pelanggan dan status layanan yang masuk ke bisnis kamu.";

  const tabId =
    isTourist
      ? "pesanan"
      : "reservasi";

  return (
    <div
      id={`account-subview-${tabId}`}
      role="tabpanel"
      aria-labelledby={`account-tab-${tabId}`}
      className="account-panel"
    >
      <PanelHead
        title={title}
        description={description}
      />

      {orders.length === 0 ? (
        <div className="account-empty">
          <div className="account-empty-icon">
            {
              icons.receipt
            }
          </div>

          <h3>
            {isTourist
              ? "Belum ada pesanan"
              : role ===
                  "local_guide"
                ? "Belum ada reservasi wisatawan"
                : "Belum ada reservasi pelanggan"}
          </h3>

          <p>
            {isTourist
              ? "Mulai jelajahi pengalaman lokal dan simpan perjalanan yang ingin kamu lakukan."
              : role ===
                  "local_guide"
                ? "Saat wisatawan memesan pengalamanmu, detail reservasinya akan muncul di sini."
                : "Saat pelanggan melakukan reservasi ke bisnismu, detailnya akan muncul di sini."}
          </p>

          {isTourist && (
            <button
              type="button"
              className="account-btn account-btn-primary"
              onClick={
                onExplore
              }
            >
              Jelajahi pengalaman
            </button>
          )}
        </div>
      ) : (
        <div className="account-order-list">
          {orders.map(
            (order) => (
              <article
                key={
                  order.id
                }
                className="account-order"
              >
                <div className="account-order-top">
                  <div>
                    <span className="account-order-code">
                      {
                        order.id
                      }
                    </span>

                    <span className="account-order-date">
                      {isTourist
                        ? `Dipesan untuk ${order.date}`
                        : `Jadwal ${order.date}`}
                    </span>
                  </div>

                  <span className="account-order-status">
                    {
                      order.status
                    }
                  </span>
                </div>

                <div className="account-order-body">
                  <div>
                    <h3>
                      {
                        order.title
                      }
                    </h3>

                    <p>
                      Titik kumpul:{" "}
                      <strong>
                        {
                          order.meetingPoint ||
                          "Akan dikonfirmasi"
                        }
                      </strong>{" "}
                      {order.meetingTime
                        ? `(${order.meetingTime})`
                        : ""}
                    </p>

                    {isTourist &&
                      order.guideName && (
                        <p>
                          Pemandu:{" "}
                          <strong>
                            {
                              order.guideName
                            }
                          </strong>{" "}
                          {order.guidePhone
                            ? `(${order.guidePhone})`
                            : ""}
                        </p>
                      )}

                    {!isTourist && (
                      <p>
                        Peserta:{" "}
                        <strong>
                          {
                            order.guests ||
                            0
                          }{" "}
                          orang
                        </strong>
                      </p>
                    )}

                    {order.guests !==
                      undefined &&
                      isTourist && (
                        <p>
                          Jumlah:{" "}
                          <strong>
                            {
                              order.guests
                            }{" "}
                            peserta
                          </strong>{" "}
                          {order.paymentMethod
                            ? `— pembayaran ${order.paymentMethod}`
                            : ""}
                        </p>
                      )}
                  </div>

                  <div className="account-order-pay">
                    <div className="account-order-total">
                      <span>
                        Total pembayaran
                      </span>

                      <strong>
                        {
                          formatRupiah(
                            order.totalPrice
                          )
                        }
                      </strong>
                    </div>

                    {(
                      isTourist &&
                      order.guideName
                    ) ||
                    (
                      !isTourist &&
                      order.phone
                    ) ? (
                      <button
                        type="button"
                        className="account-btn account-btn-whatsapp"
                        onClick={() =>
                          openWhatsApp(
                            isTourist
                              ? `Halo ${order.guideName}, saya pemesan ${order.title} (Kode ${order.id})`
                              : `Halo, saya ingin mengonfirmasi reservasi ${order.title} (Kode ${order.id})`
                          )
                        }
                      >
                        {
                          icons.chat
                        }

                        {isTourist
                          ? "WhatsApp pemandu"
                          : "Hubungi pelanggan"}
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- role feature ---------- */

function RoleFeaturePanel({
  role,
  title,
  description,
  items,
  onAction,
}) {
  const tabId =
    role ===
    "local_guide"
      ? "pengalaman"
      : "bisnis";

  return (
    <div
      id={`account-subview-${tabId}`}
      role="tabpanel"
      aria-labelledby={`account-tab-${tabId}`}
      className="account-panel"
    >
      <PanelHead
        title={title}
        description={description}
      />

      <div className="account-feature-grid">
        {items.map(
          (item) => (
            <article
              key={
                item.id
              }
              className="account-feature-card"
            >
              <div className="account-feature-icon">
                {
                  icons[
                    item.icon
                  ]
                }
              </div>

              <h3>
                {item.title}
              </h3>

              <p>
                {
                  item.description
                }
              </p>

              <button
                type="button"
                className="account-btn account-btn-soft"
                onClick={() =>
                  onAction(
                    item
                  )
                }
              >
                Buka fitur
                {icons.arrow}
              </button>
            </article>
          )
        )}
      </div>
    </div>
  );
}

/* ---------- notifications ---------- */

function NotificationsPanel({
  items,
  onMarkAllRead,
}) {
  const allRead =
    items.every(
      (item) =>
        item?.read
    );

  return (
    <div
      id="account-subview-notifikasi"
      role="tabpanel"
      aria-labelledby="account-tab-notifikasi"
      className="account-panel"
    >
      <PanelHead
        title="Pemberitahuan & pesan"
        description="Pembaruan jadwal, reservasi, dan komunikasi penting dari NuSaJoy."
        action={
          <button
            type="button"
            className="account-link-button"
            onClick={
              onMarkAllRead
            }
            disabled={
              allRead
            }
          >
            Tandai semua dibaca
          </button>
        }
      />

      {items.length ===
      0 ? (
        <div className="account-empty">
          <div className="account-empty-icon">
            {
              icons.bellOff
            }
          </div>

          <h3>
            Belum ada notifikasi
          </h3>

          <p>
            Pembaruan pemesanan,
            jadwal, dan pesan
            penting akan muncul
            di sini.
          </p>
        </div>
      ) : (
        <ul className="account-notif-list">
          {items.map(
            (item) => (
              <li
                key={
                  item.id
                }
                className={`account-notif${
                  item.read
                    ? ""
                    : " is-unread"
                }`}
              >
                <div className="account-notif-icon">
                  {
                    NOTIFICATION_ICONS[
                      item.type
                    ] ||
                      icons.leaf
                  }
                </div>

                <div className="account-notif-body">
                  <div className="account-notif-head">
                    <h3>
                      {
                        item.title
                      }
                    </h3>

                    <time>
                      {
                        item.time
                      }
                    </time>
                  </div>

                  <p>
                    {
                      item.message
                    }
                  </p>
                </div>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}

/* ---------- help ---------- */

function HelpPanel({
  role,
  faqs,
}) {
  const title =
    role === "wisatawan"
      ? "Pusat bantuan & panduan tamu"
      : role ===
          "local_guide"
        ? "Pusat bantuan pemandu"
        : "Pusat bantuan bisnis lokal";

  const description =
    role === "wisatawan"
      ? "Jawaban seputar pemesanan, etika berkunjung, dan pembatalan."
      : role ===
          "local_guide"
        ? "Panduan seputar reservasi wisatawan, profil pemandu, dan layanan pengalaman."
        : "Panduan seputar profil bisnis, reservasi pelanggan, layanan, dan ulasan.";

  const conciergeMessage =
    role === "wisatawan"
      ? "Halo Tim NuSaJoy, saya butuh bantuan sebagai wisatawan"
      : role ===
          "local_guide"
        ? "Halo Tim NuSaJoy, saya butuh bantuan sebagai local guide"
        : "Halo Tim NuSaJoy, saya butuh bantuan sebagai local business";

  return (
    <div
      id="account-subview-bantuan"
      role="tabpanel"
      aria-labelledby="account-tab-bantuan"
      className="account-panel"
    >
      <PanelHead
        title={title}
        description={
          description
        }
      />

      <div className="account-faq-grid">
        {faqs.map(
          (faq) => (
            <article
              key={faq.q}
              className="account-card"
            >
              <h3>
                {faq.q}
              </h3>

              <p>
                {faq.a}
              </p>
            </article>
          )
        )}
      </div>

      <div className="account-callout">
        <div>
          <h3>
            Butuh bantuan
            mendesak?
          </h3>

          <p>
            Tim concierge
            NuSaJoy siaga
            setiap hari pukul
            07:00–22:00 WIB.
          </p>
        </div>

        <button
          type="button"
          className="account-btn account-btn-primary"
          onClick={() =>
            openWhatsApp(
              conciergeMessage
            )
          }
        >
          {icons.headset}
          Hubungi concierge
        </button>
      </div>
    </div>
  );
}

/* ---------- partner ---------- */

function PartnerPanel({
  onSubmit,
}) {
  return (
    <div
      id="account-subview-mitra"
      role="tabpanel"
      aria-labelledby="account-tab-mitra"
      className="account-panel account-partner"
    >
      <PanelHead
        title="Gabung ekosistem pelaku budaya & pemandu"
        description="Pencerita sejarah, pengrajin kriya, atau pemilik homestay desa? Bergabunglah dengan NuSaJoy untuk menjangkau pelancong sadar budaya tanpa potongan komisi yang memberatkan."
      />

      <div className="account-benefits">
        {PARTNER_BENEFITS.map(
          (benefit) => (
            <div
              key={
                benefit.title
              }
              className="account-benefit"
            >
              <strong>
                {
                  benefit.title
                }
              </strong>

              <p>
                {
                  benefit.text
                }
              </p>
            </div>
          )
        )}
      </div>

      <button
        type="button"
        className="account-btn account-btn-primary"
        onClick={
          onSubmit
        }
      >
        Ajukan kemitraan komunitas
      </button>
    </div>
  );
}

/* ---------- section header ---------- */

function SectionHeader({
  label,
  title,
  action,
}) {
  return (
    <div className="account-section-head">
      <div>
        <span className="account-section-label">
          {label}
        </span>

        <h2>
          {title}
        </h2>
      </div>

      {action}
    </div>
  );
}

/* ---------- action ---------- */

function AccountAction({
  icon,
  title,
  description,
  to,
  onClick,
}) {
  const content = (
    <>
      <span className="account-action-icon">
        {icon}
      </span>

      <span className="account-action-text">
        <strong>
          {title}
        </strong>

        <small>
          {description}
        </small>
      </span>

      <span className="account-action-arrow">
        {icons.arrow}
      </span>
    </>
  );

  if (to) {
    return (
      <Link
        className="account-action"
        to={to}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="account-action"
      onClick={
        onClick
      }
    >
      {content}
    </button>
  );
}

/* ---------- info row ---------- */

function InfoRow({
  label,
  value,
}) {
  return (
    <div className="account-info-row">
      <dt>
        {label}
      </dt>

      <dd>
        {value}
      </dd>
    </div>
  );
}

/* ---------- setting ---------- */

function SettingRow({
  icon,
  title,
  description,
  control,
  onClick,
}) {
  const body = (
    <>
      <span className="account-setting-icon">
        {icon}
      </span>

      <span className="account-setting-text">
        <strong>
          {title}
        </strong>

        <small>
          {description}
        </small>
      </span>
    </>
  );

  if (control) {
    return (
      <div className="account-setting">
        {body}

        <span className="account-setting-control">
          {control}
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="account-setting account-setting-button"
      onClick={
        onClick
      }
    >
      {body}

      <span className="account-setting-control">
        {icons.arrow}
      </span>
    </button>
  );
}

/* ---------- edit profile dialog ---------- */

function EditProfileDialog({
  form,
  email,
  role,
  roleLabel,
  saving,
  onChange,
  onSubmit,
  onClose,
  onPhotoSaved,
  onPhotoRemoved,
}) {
  return (
    <div
      className="account-overlay"
      onMouseDown={
        onClose
      }
      role="presentation"
    >
      <div
        className="account-dialog"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-edit-title"
      >
        <div className="account-dialog-handle" />

        <div className="account-dialog-head">
          <div>
            <span className="account-dialog-kicker">
              {
                roleLabel
              }
            </span>

            <h2 id="account-edit-title">
              Edit profil
            </h2>
          </div>

          <button
            type="button"
            className="account-icon-button"
            onClick={
              onClose
            }
            disabled={
              saving
            }
            aria-label="Tutup"
          >
            {icons.close}
          </button>
        </div>

        <form
          className="account-form"
          onSubmit={
            onSubmit
          }
        >
          <div className="account-form-photo">
            <ProfilePhotoPicker
              size="large"
              showControls
              onSaved={
                onPhotoSaved
              }
              onRemoved={
                onPhotoRemoved
              }
            />

            <p className="account-hint">
              Gunakan foto
              PNG, JPG,
              WebP, atau
              GIF dengan
              ukuran maksimal
              5 MB.
            </p>
          </div>

          <label className="account-field">
            Nama lengkap

            <input
              name="name"
              value={
                form.name
              }
              onChange={
                onChange
              }
              placeholder="Masukkan nama lengkap"
              autoComplete="name"
              required
            />
          </label>

          <label className="account-field">
            Email

            <input
              value={
                email || ""
              }
              disabled
            />

            <small className="account-hint">
              Email dikelola
              oleh autentikasi
              Supabase.
            </small>
          </label>

          <label className="account-field">
            Nomor telepon

            <input
              name="phone"
              value={
                form.phone
              }
              onChange={
                onChange
              }
              placeholder="Contoh: 08123456789"
              inputMode="tel"
              autoComplete="tel"
            />
          </label>

          <label className="account-field">
            Lokasi

            <input
              name="location"
              value={
                form.location
              }
              onChange={
                onChange
              }
              placeholder="Kota / negara"
              autoComplete="address-level2"
            />
          </label>

          {/* guide fields */}

          {role ===
            "local_guide" && (
            <>
              <label className="account-field">
                Spesialisasi pemandu

                <input
                  name="specializations"
                  value={
                    form.specializations
                  }
                  onChange={
                    onChange
                  }
                  placeholder="Contoh: budaya, sejarah, kuliner"
                />
              </label>

              <label className="account-field">
                Bahasa layanan

                <input
                  name="languages"
                  value={
                    form.languages
                  }
                  onChange={
                    onChange
                  }
                  placeholder="Contoh: Indonesia, Inggris"
                />
              </label>

              <label className="account-field">
                Area layanan

                <input
                  name="serviceArea"
                  value={
                    form.serviceArea
                  }
                  onChange={
                    onChange
                  }
                  placeholder="Contoh: Kotagede & sekitarnya"
                />
              </label>
            </>
          )}

          {/* business fields */}

          {role ===
            "local_business" && (
            <>
              <label className="account-field">
                Nama bisnis

                <input
                  name="businessName"
                  value={
                    form.businessName
                  }
                  onChange={
                    onChange
                  }
                  placeholder="Masukkan nama bisnis"
                />
              </label>

              <label className="account-field">
                Kategori bisnis

                <input
                  name="category"
                  value={
                    form.category
                  }
                  onChange={
                    onChange
                  }
                  placeholder="Contoh: Kuliner, homestay, kriya"
                />
              </label>

              <label className="account-field">
                Jam operasional

                <input
                  name="openingHours"
                  value={
                    form.openingHours
                  }
                  onChange={
                    onChange
                  }
                  placeholder="Contoh: 09:00–21:00 WIB"
                />
              </label>
            </>
          )}

          <label className="account-field">
            Tentang saya

            <textarea
              name="bio"
              value={
                form.bio
              }
              onChange={
                onChange
              }
              placeholder="Ceritakan sedikit tentang dirimu…"
              maxLength={250}
              rows={4}
            />

            <small className="account-hint">
              {
                form.bio.length
              }
              /250 karakter
            </small>
          </label>

          <div className="account-dialog-actions">
            <button
              type="button"
              className="account-btn account-btn-ghost"
              onClick={
                onClose
              }
              disabled={
                saving
              }
            >
              Batal
            </button>

            <button
              type="submit"
              className="account-btn account-btn-primary"
              disabled={
                saving
              }
            >
              {saving
                ? "Menyimpan…"
                : "Simpan perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- logout dialog ---------- */

function LogoutDialog({
  loggingOut,
  onConfirm,
  onClose,
}) {
  return (
    <div
      className="account-overlay"
      onMouseDown={
        onClose
      }
      role="presentation"
    >
      <div
        className="account-dialog account-dialog-confirm"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="account-logout-title"
      >
        <div className="account-confirm-icon">
          {icons.logout}
        </div>

        <h2 id="account-logout-title">
          Keluar dari akun?
        </h2>

        <p>
          Kamu perlu
          login kembali
          untuk mengakses
          fitur akun dan
          perjalanan yang
          tersimpan.
        </p>

        <div className="account-dialog-actions">
          <button
            type="button"
            className="account-btn account-btn-ghost"
            onClick={
              onClose
            }
            disabled={
              loggingOut
            }
          >
            Batal
          </button>

          <button
            type="button"
            className="account-btn account-btn-danger"
            onClick={
              onConfirm
            }
            disabled={
              loggingOut
            }
          >
            {loggingOut
              ? "Keluar…"
              : "Ya, keluar"}
          </button>
        </div>
      </div>
    </div>
  );
}
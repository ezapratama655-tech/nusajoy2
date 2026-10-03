/**
 * @file src/App.jsx
 * NuSaJoy — Unified Application Shell
 *
 * Arsitektur:
 *   React Router → App → global state → shared props → pages → shared modals
 *
 * Dua sistem dipertahankan:
 * 1. Halaman modern berbasis Router
 * 2. View legacy berbasis state pada /classic/*
 *
 * Catatan perbaikan:
 * - sharedPageProps tidak lagi dibungkus useMemo
 *   (penyebab react-hooks/refs: "Cannot access refs during render").
 * - Halaman lazy dimuat lewat import.meta.glob. Jika file halaman belum ada,
 *   route tetap hidup dan menampilkan pesan jelas + console.error,
 *   sehingga satu file hilang tidak mematikan seluruh dev server.
 * - onRemoveFavorite menerima OBJEK item utuh (type/guideId tidak hilang).
 * - Favorit dibuka lewat openFavorites() agar modal tidak bertumpuk.
 * - Item My Trip yang sama tidak ditambahkan dua kali.
 */

/* ==========================================================================
   REACT
   ========================================================================== */

import {
  Component,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

/* ==========================================================================
   REACT ROUTER
   ========================================================================== */

import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';

/* ==========================================================================
   SHARED COMPONENTS
   ========================================================================== */

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import DetailPengalamanModal from './components/DetailPengalamanModal.jsx';
import DetailPemanduModal from './components/DetailPemanduModal.jsx';
import BookingSummaryModal from './components/BookingSummaryModal.jsx';
import FavoritModal from './components/FavoritModal.jsx';
import QuickTripGateModal from './components/QuickTripGateModal.jsx';
import StateSimulatorDrawer from './components/StateSimulatorDrawer.jsx';
import BrandIdentityModal from './components/BrandIdentityModal.jsx';

/* ==========================================================================
   LEGACY / STATE-DRIVEN VIEWS
   ========================================================================== */

import BerandaView from './views/BerandaView.jsx';
import JelajahView from './views/JelajahView.jsx';
import RekomendasiView from './views/RekomendasiView.jsx';
import MyTripView from './views/MyTripView.jsx';
import AkunView from './views/AkunView.jsx';

/* ==========================================================================
   GLOBAL STYLES
   ========================================================================== */

import './styles/Navbar.css';
import './styles/Home.css';
import './styles/Explore.css';
import './styles/DestinationDetail.css';
import './styles/TourGuide.css';
import './styles/TourGuideDetail.css';
import './styles/GuideBooking.css';
import './styles/Bookings.css';
import './styles/Account.css';
import './styles/Favorite.css';

/* ==========================================================================
   DATA & UTILITIES
   ========================================================================== */

import {
  EXPERIENCES_DATA,
  GUIDES_DATA,
  INITIAL_TRIP,
  INITIAL_ORDERS,
  INITIAL_NOTIFICATIONS,
} from './data/mockData.js';

import {
  getFavorites,
  toggleFavorite,
  isFavorite,
} from './utils/favorites.js';

import { UI_STATES, isValidUIState } from './constants/navigation.js';

/* ==========================================================================
   MODERN LAZY PAGES
   ========================================================================== */

const PAGE_MODULES = import.meta.glob('./pages/*.jsx');

function MissingPage({ name }) {
  return (
    <section
      className="flex min-h-[50vh] items-center justify-center px-4 py-16"
      role="alert"
    >
      <div className="w-full max-w-xl text-center">
        <h1 className="font-['Outfit'] text-2xl font-bold text-[#174D36]">
          Halaman belum tersedia
        </h1>
        <p className="mt-3 text-sm text-[#68736D]">
          File <code>src/pages/{name}.jsx</code> tidak ditemukan di project.
          Pulihkan file tersebut agar halaman ini tampil.
        </p>
      </div>
    </section>
  );
}

const lazyPage = (name) =>
  lazy(() => {
    const loader = PAGE_MODULES[`./pages/${name}.jsx`];

    if (loader) {
      return loader();
    }

    console.error(`NuSaJoy: ./pages/${name}.jsx tidak ditemukan.`);

    return Promise.resolve({
      default: () => <MissingPage name={name} />,
    });
  });

const Home = lazyPage('Home');
const Explore = lazyPage('Explore');
const Recommendation = lazyPage('Recommendation');
const DestinationDetail = lazyPage('DestinationDetail');
const Favorite = lazyPage('Favorite');
const Account = lazyPage('Account');
const Login = lazyPage('Login');
const LocalBusiness = lazyPage('LocalBusiness');
const TourGuide = lazyPage('TourGuide');
const TourGuideDetail = lazyPage('TourGuideDetail');
const GuideBooking = lazyPage('GuideBooking');
const Bookings = lazyPage('Bookings');

/* ==========================================================================
   ROUTE MAP
   ========================================================================== */

const TAB_ROUTES = {
  beranda: '/',
  jelajah: '/explore',
  rekomendasi: '/recommendation',
  mytrip: '/my-trip',
  akun: '/account',
};

const PATH_TO_TAB = {
  '/': 'beranda',
  '/explore': 'jelajah',
  '/recommendation': 'rekomendasi',
  '/my-trip': 'mytrip',
  '/account': 'akun',
  '/akun': 'akun',
  '/classic': 'beranda',
  '/classic/beranda': 'beranda',
  '/classic/jelajah': 'jelajah',
  '/classic/rekomendasi': 'rekomendasi',
  '/classic/my-trip': 'mytrip',
  '/classic/account': 'akun',
  '/classic/akun': 'akun',
};

/**
 * Halaman turunan tetap menyalakan tab navbar yang masuk akal.
 * Urutan penting: '/bookings' harus diperiksa sebelum prefix lain.
 */
const PREFIX_TO_TAB = [
  ['/destination/', 'jelajah'],
  ['/guides', 'jelajah'],
  ['/guide/', 'jelajah'],
  ['/tour-guide', 'jelajah'],
  ['/local-business', 'jelajah'],
  ['/book/', 'jelajah'],
  ['/booking/', 'jelajah'],
  ['/bookings', 'mytrip'],
  ['/favorite', 'akun'],
];

const getTabFromPathname = (pathname) => {
  if (PATH_TO_TAB[pathname]) {
    return PATH_TO_TAB[pathname];
  }

  const match = PREFIX_TO_TAB.find(([prefix]) => pathname.startsWith(prefix));

  return match ? match[1] : 'beranda';
};

/** Target dari Footer → tab */
const SECTION_TO_TAB = {
  home: 'beranda',
  beranda: 'beranda',
  explore: 'jelajah',
  jelajah: 'jelajah',
  recommendation: 'rekomendasi',
  rekomendasi: 'rekomendasi',
  mytrip: 'mytrip',
  'my-trip': 'mytrip',
};

/* ==========================================================================
   PAGE TITLES
   ========================================================================== */

const PAGE_TITLES = {
  '/': 'NuSaJoy — Temukan Perjalanan Terbaikmu',
  '/explore': 'Jelajahi Destinasi — NuSaJoy',
  '/recommendation': 'Rekomendasi Untukmu — NuSaJoy',
  '/favorite': 'Favorit Saya — NuSaJoy',
  '/favorites': 'Favorit Saya — NuSaJoy',
  '/account': 'Akun Saya — NuSaJoy',
  '/akun': 'Akun Saya — NuSaJoy',
  '/login': 'Masuk — NuSaJoy',
  '/guides': 'Pemandu Wisata — NuSaJoy',
  '/tour-guide': 'Pemandu Wisata — NuSaJoy',
  '/bookings': 'Pesanan Saya — NuSaJoy',
  '/local-business': 'Usaha Lokal — NuSaJoy',
  '/my-trip': 'My Trip — NuSaJoy',
  '/classic': 'Beranda — NuSaJoy',
  '/classic/beranda': 'Beranda — NuSaJoy',
  '/classic/jelajah': 'Jelajah — NuSaJoy',
  '/classic/rekomendasi': 'Rekomendasi — NuSaJoy',
  '/classic/my-trip': 'My Trip — NuSaJoy',
  '/classic/account': 'Akun Saya — NuSaJoy',
  '/classic/akun': 'Akun Saya — NuSaJoy',
};

const TITLE_PREFIXES = [
  ['/destination/', 'Detail Destinasi — NuSaJoy'],
  ['/guide/', 'Detail Pemandu — NuSaJoy'],
  ['/tour-guide/', 'Detail Pemandu — NuSaJoy'],
  ['/book/', 'Booking Pemandu — NuSaJoy'],
  ['/booking/', 'Booking Pemandu — NuSaJoy'],
  ['/bookings/', 'Pesanan Saya — NuSaJoy'],
  ['/local-business/', 'Usaha Lokal — NuSaJoy'],
];

const getPageTitle = (pathname) => {
  if (PAGE_TITLES[pathname]) {
    return PAGE_TITLES[pathname];
  }

  const match = TITLE_PREFIXES.find(([prefix]) => pathname.startsWith(prefix));

  return match ? match[1] : 'NuSaJoy';
};

function usePageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = getPageTitle(pathname);
  }, [pathname]);
}

/* ==========================================================================
   SCROLL TO TOP
   ========================================================================== */

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}

/* ==========================================================================
   ROUTE LOADING
   ========================================================================== */

function RouteLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="route-loading flex w-full flex-1 items-center justify-center py-20"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="route-loading-spinner" />
        <p className="text-sm font-medium text-[#68736D]">Memuat halaman...</p>
      </div>
    </div>
  );
}

/* ==========================================================================
   ERROR BOUNDARY
   Menampilkan error ke pengguna DAN ke console. Root cause tetap harus
   diperbaiki di sumbernya, bukan disembunyikan di sini.
   ========================================================================== */

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('NuSaJoy Route Error:', error);
    console.error('NuSaJoy Component Info:', info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.assign('/');
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <section className="not-found-page flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="not-found-content w-full max-w-xl text-center">
          <span className="not-found-code">Oops</span>

          <h1>Halaman Mengalami Masalah</h1>

          <p>
            Halaman ini gagal dimuat. Silakan coba lagi atau kembali ke
            halaman utama NuSaJoy.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              className="not-found-button"
              onClick={this.handleReload}
            >
              Muat Ulang
            </button>

            <button
              type="button"
              className="not-found-button"
              onClick={this.handleHome}
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </section>
    );
  }
}

/* ==========================================================================
   404
   ========================================================================== */

function NotFound() {
  const navigate = useNavigate();

  return (
    <section className="not-found-page flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="not-found-content w-full max-w-xl text-center">
        <span className="not-found-code">404</span>

        <h1>Halaman Tidak Ditemukan</h1>

        <p>
          Halaman yang kamu cari tidak tersedia atau mungkin sudah dipindahkan.
        </p>

        <button
          type="button"
          className="not-found-button"
          onClick={() => navigate('/')}
        >
          Kembali ke Beranda
        </button>
      </div>
    </section>
  );
}

/* ==========================================================================
   HELPERS
   ========================================================================== */

/** Mencegah referensi object yang sama terpakai saat membuat trip baru. */
const createInitialTrip = () => {
  try {
    if (typeof structuredClone === 'function') {
      return structuredClone(INITIAL_TRIP);
    }
  } catch {
    /* jatuh ke salinan manual di bawah */
  }

  return {
    ...INITIAL_TRIP,
    items: [...(INITIAL_TRIP?.items || [])],
  };
};

/** Item termasuk pemandu? Mendukung data guide asli maupun item My Trip. */
const isGuideLike = (item) =>
  item?.type === 'guide' ||
  item?.sourceType === 'guide' ||
  item?.isGuide === true;

/* ==========================================================================
   SHARED PAGE PROPS
   ========================================================================== */

function getSharedPageProps({
  activeTab,
  navigateToTab,

  uiState,
  retryUIState,

  activeTrip,
  orders,
  notifications,

  favoritesList,

  selectedExperience,
  selectedGuide,
  bookingModalData,

  handleAddToTrip,
  handleToggleFavorite,
  handleRemoveTripItem,

  openExperience,
  openGuide,
  openBookingSummary,
  openFavorites,
  openQuickTripGate,

  showToast,
}) {
  return {
    /* Navigation */
    activeTab,
    setActiveTab: navigateToTab,
    onNavigateTab: navigateToTab,

    /**
     * Sengaja dibungkus: jangan memberikan navigateToTab langsung ke onClick
     * karena MouseEvent bisa masuk sebagai argumen.
     */
    onNavigateExplore: () => navigateToTab('jelajah'),

    /* UI state */
    uiState,
    currentState: uiState,
    onRetry: retryUIState,

    /* Experience */
    experiences: EXPERIENCES_DATA,
    onSelectExperience: openExperience,

    /* Guide */
    guides: GUIDES_DATA,
    onSelectGuide: openGuide,

    /* Favorite */
    favorites: favoritesList,
    favoritesList,
    favoritesCount: favoritesList.length,
    isFavorited: (id) => isFavorite(id),
    onSaveFavorite: handleToggleFavorite,
    onToggleFavorite: handleToggleFavorite,
    onOpenFavorites: openFavorites,

    /* My Trip */
    trip: activeTrip,
    activeTrip,
    onAddToTrip: handleAddToTrip,
    onRemoveTripItem: handleRemoveTripItem,
    onGoToMyTrip: () => navigateToTab('mytrip'),
    onCreateTripClick: () => navigateToTab('mytrip'),

    /* Orders */
    orders,
    notifications,

    /* Booking */
    bookingData: bookingModalData,
    onOpenBookingSummary: openBookingSummary,

    /* Selected data */
    selectedExperience,
    selectedGuide,

    /* Quick trip */
    onOpenQuickTripGate: openQuickTripGate,

    /* Feedback */
    onShowToast: showToast,
  };
}

/* ==========================================================================
   APP
   ========================================================================== */

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  usePageTitle();

  /* ------------------------------------------------------------------------
     ACTIVE TAB — URL adalah source of truth
  ------------------------------------------------------------------------ */

  const activeTab = getTabFromPathname(location.pathname);

  /* ------------------------------------------------------------------------
     NAVIGATION
     Aman terhadap: string tab, route langsung, MouseEvent, undefined, ''.
  ------------------------------------------------------------------------ */

  const navigateToTab = useCallback(
    (target) => {
      if (typeof target !== 'string') {
        return;
      }

      const cleanTarget = target.trim();

      if (!cleanTarget) {
        return;
      }

      const destination =
        TAB_ROUTES[cleanTarget] ||
        (cleanTarget.startsWith('/') ? cleanTarget : '/');

      if (location.pathname !== destination) {
        navigate(destination);
      }
    },
    [location.pathname, navigate],
  );

  /* ------------------------------------------------------------------------
     STATE
  ------------------------------------------------------------------------ */

  const [uiState, setUiState] = useState('normal');

  const [selectedExperience, setSelectedExperience] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [bookingModalData, setBookingModalData] = useState(null);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [quickTripGateData, setQuickTripGateData] = useState(null);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [brandConcept, setBrandConcept] = useState(1);

  const [activeTrip, setActiveTrip] = useState(createInitialTrip);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const [favoritesList, setFavoritesList] = useState(() => {
    try {
      return getFavorites();
    } catch (error) {
      console.error('NuSaJoy: gagal mengambil favorit.', error);

      return [];
    }
  });

  /* ------------------------------------------------------------------------
     TOAST
     Ref hanya dibaca di dalam handler/effect, tidak saat render.
  ------------------------------------------------------------------------ */

  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message) => {
    if (message === null || message === undefined) {
      return;
    }

    const normalizedMessage = String(message).trim();

    if (!normalizedMessage) {
      return;
    }

    setToastMessage(normalizedMessage);

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 3500);
  }, []);

  useEffect(
    () => () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    },
    [],
  );

  /* ------------------------------------------------------------------------
     FAVORITES SYNC
  ------------------------------------------------------------------------ */

  useEffect(() => {
    const handleFavoriteUpdated = (event) => {
      try {
        setFavoritesList(getFavorites());

        if (event.detail?.added && event.detail?.item) {
          const item = event.detail.item;

          showToast(
            `"${item.title || item.name || 'Item'}" disimpan ke Favorit`,
          );
        }
      } catch (error) {
        console.error('NuSaJoy: gagal menyinkronkan favorit.', error);
      }
    };

    const handleStorage = (event) => {
      if (event.key !== 'nusajoy:favorites') {
        return;
      }

      try {
        setFavoritesList(getFavorites());
      } catch {
        setFavoritesList([]);
      }
    };

    window.addEventListener('nusajoy:favorites_updated', handleFavoriteUpdated);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(
        'nusajoy:favorites_updated',
        handleFavoriteUpdated,
      );
      window.removeEventListener('storage', handleStorage);
    };
  }, [showToast]);

  /* ------------------------------------------------------------------------
     MODAL OPENERS — hanya satu modal konten aktif
  ------------------------------------------------------------------------ */

  const openExperience = useCallback((experience) => {
    if (!experience) {
      return;
    }

    setSelectedGuide(null);
    setBookingModalData(null);
    setIsFavoritesOpen(false);
    setQuickTripGateData(null);
    setSelectedExperience(experience);
  }, []);

  const openGuide = useCallback((guide) => {
    if (!guide) {
      return;
    }

    setSelectedExperience(null);
    setBookingModalData(null);
    setIsFavoritesOpen(false);
    setQuickTripGateData(null);
    setSelectedGuide(guide);
  }, []);

  const openBookingSummary = useCallback((bookingData) => {
    if (!bookingData) {
      return;
    }

    setSelectedExperience(null);
    setSelectedGuide(null);
    setIsFavoritesOpen(false);
    setQuickTripGateData(null);
    setBookingModalData(bookingData);
  }, []);

  const openFavorites = useCallback(() => {
    setSelectedExperience(null);
    setSelectedGuide(null);
    setBookingModalData(null);
    setIsFavoritesOpen(true);
  }, []);

  const openQuickTripGate = useCallback((type) => {
    setSelectedExperience(null);
    setSelectedGuide(null);
    setBookingModalData(null);
    setIsFavoritesOpen(false);
    setQuickTripGateData({ type: type === 'transport' ? 'transport' : 'stay' });
  }, []);

  /* ------------------------------------------------------------------------
     ADD TO TRIP
     Item baru di paling atas, item lama diturunkan (isNew: false).
     Sumber asli disimpan agar info pemandu tidak hilang.
  ------------------------------------------------------------------------ */

  const handleAddToTrip = useCallback(
    (item) => {
      if (!item) {
        return;
      }

      const guideItem = isGuideLike(item);

      const itemTitle =
        item.title || item.name || item.serviceName || 'Aktivitas wisata';

      const sourceId =
        item.id ?? item.guideId ?? item.destinationId ?? '';

      /* Hindari item yang sama masuk dua kali. */
      const alreadyInTrip =
        sourceId !== '' &&
        (Array.isArray(activeTrip?.items) ? activeTrip.items : []).some(
          (tripItem) =>
            String(tripItem.sourceId) === String(sourceId) &&
            isGuideLike(tripItem) === guideItem,
        );

      if (alreadyInTrip) {
        showToast(`"${itemTitle}" sudah ada di My Trip.`);

        return;
      }

      const itemPrice = Number(
        item.price ??
          item.pricePerPerson ??
          item.pricePerDay ??
          item.startingPrice ??
          0,
      );

      const newItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        sourceId,
        sourceType: guideItem ? 'guide' : 'experience',
        type: guideItem ? 'guide' : item.type || 'experience',
        isGuide: guideItem,
        day: item.day || 1,
        time: item.time || item.startTime || '15:00 - 18:00',
        title: itemTitle,
        category:
          item.category ||
          item.specialty ||
          (guideItem ? 'Pemandu Lokal' : 'Wisata Budaya'),
        location: item.location || item.address || item.city || '',
        price: itemPrice > 0 ? itemPrice : 95000,
        image: item.image || item.imageUrl || item.thumbnail || '',
        guideName:
          item.guide?.name ||
          item.guideName ||
          (guideItem ? item.name || '' : ''),
        guidePhone:
          item.guide?.phone || item.guide?.phoneNumber || item.guidePhone || '',
        meetingPoint: item.meetingPoint || '',
        meetingTime: item.meetingTime || '',
        duration: item.duration || item.durationText || '',
        transportTip:
          item.transportTip ||
          'Atur transportasi dan titik kumpul sebelum kegiatan dimulai.',
        isNew: true,
        sourceItem: { ...item },
      };

      setActiveTrip((previous) => {
        const currentItems = Array.isArray(previous?.items)
          ? previous.items
          : [];

        return {
          ...previous,
          items: [
            newItem,
            ...currentItems.map((tripItem) => ({ ...tripItem, isNew: false })),
          ],
        };
      });

      showToast(`"${itemTitle}" ditambahkan ke My Trip!`);

      setSelectedExperience(null);
      setSelectedGuide(null);
    },
    [activeTrip, showToast],
  );

  /* ------------------------------------------------------------------------
     REMOVE FROM TRIP
  ------------------------------------------------------------------------ */

  const handleRemoveTripItem = useCallback(
    (itemId) => {
      if (!itemId) {
        return;
      }

      setActiveTrip((previous) => ({
        ...previous,
        items: (Array.isArray(previous?.items) ? previous.items : []).filter(
          (item) => item.id !== itemId,
        ),
      }));

      showToast('Aktivitas dihapus dari rencana perjalanan.');
    },
    [showToast],
  );

  /* ------------------------------------------------------------------------
     FAVORITES
  ------------------------------------------------------------------------ */

  const handleToggleFavorite = useCallback(
    (item) => {
      if (!item) {
        return null;
      }

      try {
        const result = toggleFavorite(item);

        if (result && Array.isArray(result.items)) {
          setFavoritesList(result.items);
        } else {
          setFavoritesList(getFavorites());
        }

        return result;
      } catch (error) {
        console.error('NuSaJoy: gagal mengubah favorit.', error);

        showToast('Favorit belum dapat diperbarui.');

        return null;
      }
    },
    [showToast],
  );

  /**
   * Menerima OBJEK item utuh dari FavoritModal supaya type/guideId/category
   * tetap ada dan kunci favorit konsisten. Jika yang datang hanya ID
   * (komponen lama), objeknya dicari dulu dari daftar favorit.
   */
  const handleRemoveFavorite = useCallback(
    (entry) => {
      const item =
        entry && typeof entry === 'object'
          ? entry
          : favoritesList.find(
              (favorite) => String(favorite?.id) === String(entry),
            );

      if (!item) {
        return;
      }

      handleToggleFavorite(item);
    },
    [favoritesList, handleToggleFavorite],
  );

  /* ------------------------------------------------------------------------
     BOOKING SUCCESS
  ------------------------------------------------------------------------ */

  const handleBookingSuccess = useCallback(
    (newOrder) => {
      if (!newOrder) {
        return;
      }

      setOrders((previous) => [
        newOrder,
        ...(Array.isArray(previous) ? previous : []),
      ]);

      setNotifications((previous) => [
        {
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title: `Reservasi ${newOrder.id || ''} Terkonfirmasi`.replace(
            /\s+/g,
            ' ',
          ),
          message: `Pembayaran ${
            newOrder.title || 'Reservasi NuSaJoy'
          } telah sukses diproses.`,
          time: 'Baru saja',
          read: false,
          type: 'booking',
        },
        ...(Array.isArray(previous) ? previous : []),
      ]);

      showToast('Reservasi berhasil dikonfirmasi.');
    },
    [showToast],
  );

  /* ------------------------------------------------------------------------
     UI STATE
  ------------------------------------------------------------------------ */

  const retryUIState = useCallback(() => {
    setUiState('normal');
  }, []);

  const handleStateChange = (newState) => {
    if (!isValidUIState(newState)) {
      return;
    }

    setUiState(newState);

    const label = UI_STATES?.[newState]?.label;

    if (label) {
      showToast(`UI state: ${label}`);
    }
  };

  /* ------------------------------------------------------------------------
     BRAND
  ------------------------------------------------------------------------ */

  const handleChangeBrandConcept = (concept) => {
    const numericConcept = Number(concept);

    if (![1, 2, 3].includes(numericConcept)) {
      return;
    }

    setBrandConcept(numericConcept);
    showToast(`Konsep Logo diubah ke: Konsep ${numericConcept}`);
  };

  /* ------------------------------------------------------------------------
     FOOTER NAVIGATION
  ------------------------------------------------------------------------ */

  const handleFooterNavigate = (section) => {
    if (typeof section !== 'string') {
      return;
    }

    if (section.startsWith('akun')) {
      navigateToTab('akun');

      return;
    }

    const tab = SECTION_TO_TAB[section];

    if (tab) {
      navigateToTab(tab);

      return;
    }

    if (section.startsWith('/')) {
      navigate(section);
    }
  };

  /* ------------------------------------------------------------------------
     SHARED PAGE PROPS
     Sengaja TANPA useMemo (lihat catatan di header file).
  ------------------------------------------------------------------------ */

  const sharedPageProps = getSharedPageProps({
    activeTab,
    navigateToTab,

    uiState,
    retryUIState,

    activeTrip,
    orders,
    notifications,

    favoritesList,

    selectedExperience,
    selectedGuide,
    bookingModalData,

    handleAddToTrip,
    handleToggleFavorite,
    handleRemoveTripItem,

    openExperience,
    openGuide,
    openBookingSummary,
    openFavorites,
    openQuickTripGate,

    showToast,
  });

  const page = (PageComponent) => <PageComponent {...sharedPageProps} />;

  /* ------------------------------------------------------------------------
     VIEW ELEMENTS (dipakai ulang oleh route modern & /classic/*)
  ------------------------------------------------------------------------ */

  const goExplore = () => navigateToTab('jelajah');

  const myTripElement = (
    <MyTripView
      trip={activeTrip}
      onRemoveTripItem={handleRemoveTripItem}
      onOpenBookingSummary={openBookingSummary}
      onNavigateExplore={goExplore}
      uiState={uiState}
      onRetry={retryUIState}
    />
  );

  const classicHomeElement = (
    <BerandaView
      onSelectExperience={openExperience}
      onNavigateTab={navigateToTab}
      onSaveFavorite={handleToggleFavorite}
      isFavorited={(id) => isFavorite(id)}
      onOpenQuickTripGate={openQuickTripGate}
      onAddToTrip={handleAddToTrip}
      uiState={uiState}
      onRetry={retryUIState}
    />
  );

  const classicExploreElement = (
    <JelajahView
      onSelectExperience={openExperience}
      onAddToTrip={handleAddToTrip}
      onSaveFavorite={handleToggleFavorite}
      isFavorited={(id) => isFavorite(id)}
      uiState={uiState}
      onRetry={retryUIState}
    />
  );

  const classicRecommendationElement = (
    <RekomendasiView
      onSelectExperience={openExperience}
      onAddToTrip={handleAddToTrip}
      onSaveFavorite={handleToggleFavorite}
      isFavorited={(id) => isFavorite(id)}
      uiState={uiState}
      onRetry={retryUIState}
    />
  );

  const classicAccountElement = (
    <AkunView
      orders={orders}
      notifications={notifications}
      onNavigateExplore={goExplore}
      uiState={uiState}
      onRetry={retryUIState}
    />
  );

  /* ==========================================================================
     RENDER
     ========================================================================== */

  return (
    <div className="app-container min-h-screen">
      <div className="flex min-h-screen flex-col bg-[#F4EED8] font-['Plus_Jakarta_Sans'] text-[#17251E] antialiased selection:bg-[#CFEACB] selection:text-[#174D36]">
        {/* NAVBAR */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={navigateToTab}
          favoritesCount={favoritesList.length}
          onOpenFavorites={openFavorites}
          onCreateTripClick={() => navigateToTab('mytrip')}
          brandConcept={brandConcept}
          onOpenBrandModal={() => setIsBrandModalOpen(true)}
        />

        {/* TOAST */}
        {toastMessage && (
          <div
            className="fixed left-1/2 top-24 z-[100] flex w-[min(92vw,520px)] -translate-x-1/2 items-center gap-2.5 rounded-2xl border border-[#8FA88C]/40 bg-[#174D36] px-4 py-3 text-[12px] font-medium text-white shadow-[0_12px_35px_rgba(23,77,54,0.22)] sm:px-5 sm:text-[13px]"
            role="status"
            aria-live="polite"
          >
            <span
              className="material-symbols-outlined shrink-0 text-[18px] text-[#C69A3A]"
              aria-hidden="true"
            >
              check_circle
            </span>

            <span className="min-w-0 flex-1">{toastMessage}</span>

            <button
              type="button"
              aria-label="Tutup notifikasi"
              onClick={() => setToastMessage(null)}
              className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <span
                className="material-symbols-outlined text-[15px]"
                aria-hidden="true"
              >
                close
              </span>
            </button>
          </div>
        )}

        {/* MAIN */}
        <main className="main-content flex w-full flex-1 flex-col pt-20">
          <ScrollToTop />

          <ErrorBoundary key={location.pathname}>
            <Suspense fallback={<RouteLoading />}>
              <Routes>
                {/* Modern pages */}
                <Route path="/" element={page(Home)} />
                <Route path="/explore" element={page(Explore)} />
                <Route path="/recommendation" element={page(Recommendation)} />
                <Route
                  path="/destination/:id"
                  element={page(DestinationDetail)}
                />

                <Route path="/favorite" element={page(Favorite)} />
                <Route
                  path="/favorites"
                  element={<Navigate to="/favorite" replace />}
                />

                {/* Tour guide */}
                <Route path="/guides" element={page(TourGuide)} />
                <Route path="/tour-guide" element={page(TourGuide)} />
                <Route path="/guide/:id" element={page(TourGuideDetail)} />
                <Route
                  path="/tour-guide/:id"
                  element={page(TourGuideDetail)}
                />

                {/* Booking */}
                <Route path="/book/:id" element={page(GuideBooking)} />
                <Route path="/booking/:id" element={page(GuideBooking)} />
                <Route path="/bookings" element={page(Bookings)} />

                {/* Others */}
                <Route path="/local-business" element={page(LocalBusiness)} />
                <Route path="/login" element={page(Login)} />
                <Route path="/account" element={page(Account)} />
                <Route
                  path="/akun"
                  element={<Navigate to="/account" replace />}
                />
                <Route path="/my-trip" element={myTripElement} />

                {/* Legacy */}
                <Route path="/classic" element={classicHomeElement} />
                <Route path="/classic/beranda" element={classicHomeElement} />
                <Route
                  path="/classic/jelajah"
                  element={classicExploreElement}
                />
                <Route
                  path="/classic/rekomendasi"
                  element={classicRecommendationElement}
                />
                <Route path="/classic/my-trip" element={myTripElement} />
                <Route
                  path="/classic/account"
                  element={classicAccountElement}
                />
                <Route path="/classic/akun" element={classicAccountElement} />

                {/* 404 harus paling bawah */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>

        {/* FOOTER */}
        <Footer
          onNavigateSection={handleFooterNavigate}
          brandConcept={brandConcept}
          onOpenBrandModal={() => setIsBrandModalOpen(true)}
        />

        {/* DETAIL PENGALAMAN */}
        <DetailPengalamanModal
          isOpen={Boolean(selectedExperience)}
          onClose={() => setSelectedExperience(null)}
          experience={selectedExperience}
          onAddToTrip={handleAddToTrip}
          onOpenBookingSummary={openBookingSummary}
          onOpenGuideDetail={openGuide}
          onGoToMyTrip={() => {
            setSelectedExperience(null);
            navigateToTab('mytrip');
          }}
          isFavorited={
            selectedExperience ? isFavorite(selectedExperience.id) : false
          }
          onToggleFavorite={handleToggleFavorite}
        />

        {/* DETAIL PEMANDU */}
        <DetailPemanduModal
          isOpen={Boolean(selectedGuide)}
          onClose={() => setSelectedGuide(null)}
          guide={selectedGuide}
          onAddToTrip={handleAddToTrip}
          onOpenBookingSummary={openBookingSummary}
          onGoToMyTrip={() => {
            setSelectedGuide(null);
            navigateToTab('mytrip');
          }}
          isFavorited={selectedGuide ? isFavorite(selectedGuide.id) : false}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* BOOKING SUMMARY (universal) */}
        <BookingSummaryModal
          isOpen={Boolean(bookingModalData)}
          onClose={() => setBookingModalData(null)}
          bookingData={bookingModalData}
          onBookingSuccess={handleBookingSuccess}
          onGoToMyTrip={() => {
            setBookingModalData(null);
            navigateToTab('mytrip');
          }}
        />

        {/* FAVORIT */}
        <FavoritModal
          isOpen={isFavoritesOpen}
          onClose={() => setIsFavoritesOpen(false)}
          favorites={favoritesList}
          onRemoveFavorite={handleRemoveFavorite}
          onAddToTrip={handleAddToTrip}
          onSelectExperience={(item) => {
            setIsFavoritesOpen(false);

            if (isGuideLike(item)) {
              openGuide(item);
            } else {
              openExperience(item);
            }
          }}
          onSelectGuide={(guide) => {
            setIsFavoritesOpen(false);
            openGuide(guide);
          }}
          onNavigateExplore={() => {
            setIsFavoritesOpen(false);
            navigateToTab('jelajah');
          }}
        />

        {/* QUICK TRIP GATE */}
        <QuickTripGateModal
          isOpen={Boolean(quickTripGateData)}
          onClose={() => setQuickTripGateData(null)}
          targetType={quickTripGateData?.type || 'stay'}
          hasActiveTrip={Boolean(activeTrip?.items?.length)}
          activeTripTitle={activeTrip?.title || 'Trip Yogyakarta'}
          onProceedWithTrip={() => {
            setQuickTripGateData(null);
            navigateToTab('mytrip');
          }}
          onCreateNewTrip={() => {
            setQuickTripGateData(null);
            setActiveTrip(createInitialTrip());
            navigateToTab('mytrip');
            showToast('Trip baru siap disusun di My Trip!');
          }}
        />

        {/* UI STATE SIMULATOR */}
        <StateSimulatorDrawer
          currentState={uiState}
          onStateChange={handleStateChange}
        />

        {/* BRAND IDENTITY */}
        <BrandIdentityModal
          isOpen={isBrandModalOpen}
          onClose={() => setIsBrandModalOpen(false)}
          activeConcept={brandConcept}
          onChangeConcept={handleChangeBrandConcept}
        />
      </div>
    </div>
  );
}

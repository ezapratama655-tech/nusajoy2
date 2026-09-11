import {
  Suspense,
  lazy,
  useEffect,
  Component,
} from 'react'

import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom'

import Nav from './components/Nav'

// =====================================================
// GLOBAL / SHARED STYLES
// =====================================================
// test ubah folder

import './components/Nav.css'

import './styles/Home.css'
import './styles/Explore.css'
import './styles/DestinationDetail.css'
import './styles/TourGuide.css'
import './styles/TourGuideDetail.css'
import './styles/GuideBooking.css'
import './styles/Bookings.css'
import './styles/Account.css'
import './styles/Favorite.css'

// =====================================================
// LAZY LOADED PAGES
// =====================================================

const Home = lazy(() =>
  import('./pages/Home')
)

const Explore = lazy(() =>
  import('./pages/Explore')
)

const Recommendation = lazy(() =>
  import('./pages/Recommendation')
)

const DestinationDetail = lazy(() =>
  import('./pages/DestinationDetail')
)

const Favorite = lazy(() =>
  import('./pages/Favorite')
)

const Account = lazy(() =>
  import('./pages/Account')
)

const Login = lazy(() =>
  import('./pages/Login')
)

const LocalBusiness = lazy(() =>
  import('./pages/LocalBusiness')
)

// =====================================================
// TOUR GUIDE
// =====================================================

const TourGuide = lazy(() =>
  import('./pages/TourGuide')
)

const TourGuideDetail = lazy(() =>
  import('./pages/TourGuideDetail')
)

const GuideBooking = lazy(() =>
  import('./pages/GuideBooking')
)

// =====================================================
// BOOKINGS
// =====================================================

const Bookings = lazy(() =>
  import('./pages/Bookings')
)

// =====================================================
// PAGE TITLES
// =====================================================

const PAGE_TITLES = {
  // Home
  '/':
    'NuSaJoy — Temukan Perjalanan Terbaikmu',

  // Explore
  '/explore':
    'Jelajahi Destinasi — NuSaJoy',

  // Recommendation
  '/recommendation':
    'Rekomendasi Untukmu — NuSaJoy',

  // Favorite
  '/favorite':
    'Favorit Saya — NuSaJoy',

  // Account
  '/account':
    'Akun Saya — NuSaJoy',

  // Login
  '/login':
    'Masuk — NuSaJoy',

  // Tour Guide
  '/guides':
    'Pemandu Wisata — NuSaJoy',

  '/tour-guide':
    'Pemandu Wisata — NuSaJoy',

  // Bookings
  '/bookings':
    'Pesanan Saya — NuSaJoy',

  // Local Business
  '/local-business':
    'Usaha Lokal — NuSaJoy',
}


// =====================================================
// PAGE TITLE HANDLER
// =====================================================

function usePageTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    let title = PAGE_TITLES[pathname]

    // Destination Detail
    if (
      pathname.startsWith('/destination/')
    ) {
      title =
        'Detail Destinasi — NuSaJoy'
    }

    // Tour Guide Detail
    else if (
      pathname.startsWith('/guide/')
    ) {
      title =
        'Detail Pemandu — NuSaJoy'
    }

    // Tour Guide Detail Alias
    else if (
      pathname.startsWith('/tour-guide/')
    ) {
      title =
        'Detail Pemandu — NuSaJoy'
    }

    // Guide Booking
    else if (
      pathname.startsWith('/book/')
    ) {
      title =
        'Booking Pemandu — NuSaJoy'
    }

    // Guide Booking Alias
    else if (
      pathname.startsWith('/booking/')
    ) {
      title =
        'Booking Pemandu — NuSaJoy'
    }

    // Default
    if (!title) {
      title = 'NuSaJoy'
    }

    document.title = title

  }, [pathname])
}


// =====================================================
// SCROLL TO TOP
// =====================================================

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    })
  }, [pathname])

  return null
}


// =====================================================
// PAGE LOADING
// =====================================================

function RouteLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="route-loading"
    >
      <div className="route-loading-spinner" />

      <p>
        Memuat halaman...
      </p>
    </div>
  )
}


// =====================================================
// ERROR BOUNDARY
// =====================================================

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)

    this.state = {
      hasError: false,
      error: null,
    }
  }


  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    }
  }


  componentDidCatch(error, info) {
    console.error(
      'NuSaJoy Route Error:',
      error
    )

    console.error(
      'Component Info:',
      info
    )
  }


  handleReload = () => {
    window.location.reload()
  }


  handleHome = () => {
    window.location.href = '/'
  }


  render() {
    if (this.state.hasError) {
      return (
        <section className="not-found-page">

          <div className="not-found-content">

            <span className="not-found-code">
              Oops
            </span>

            <h1>
              Halaman Mengalami Masalah
            </h1>

            <p>
              Halaman ini gagal dimuat.
              Silakan coba lagi atau kembali
              ke halaman utama NuSaJoy.
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
      )
    }

    return this.props.children
  }
}


// =====================================================
// 404 PAGE
// =====================================================

function NotFound() {
  return (
    <section className="not-found-page">

      <div className="not-found-content">

        <span className="not-found-code">
          404
        </span>

        <h1>
          Halaman Tidak Ditemukan
        </h1>

        <p>
          Halaman yang kamu cari tidak tersedia
          atau mungkin sudah dipindahkan.
        </p>

        <button
          type="button"
          className="not-found-button"
          onClick={() => {
            window.location.href = '/'
          }}
        >
          Kembali ke Beranda
        </button>

      </div>

    </section>
  )
}


// =====================================================
// APP
// =====================================================

export default function App() {
  const location = useLocation()

  usePageTitle()

  return (
    <div className="app-container">

      {/* GLOBAL NAVIGATION */}

      <Nav />


      {/* SCROLL MANAGEMENT */}

      <ScrollToTop />


      {/* MAIN CONTENT */}

      <main className="main-content">

        <ErrorBoundary
          key={location.pathname}
        >

          <Suspense
            fallback={<RouteLoading />}
          >

            <Routes>

              {/* =========================================
                  HOME
              ========================================= */}

              <Route
                path="/"
                element={<Home />}
              />


              {/* =========================================
                  EXPLORE
              ========================================= */}

              <Route
                path="/explore"
                element={<Explore />}
              />


              {/* =========================================
                  RECOMMENDATION
              ========================================= */}

              <Route
                path="/recommendation"
                element={<Recommendation />}
              />


              {/* =========================================
                  DESTINATION DETAIL
              ========================================= */}

              <Route
                path="/destination/:id"
                element={<DestinationDetail />}
              />


              {/* =========================================
                  FAVORITE
              ========================================= */}

              <Route
                path="/favorite"
                element={<Favorite />}
              />


              {/* FAVORITE ALIAS */}

              <Route
                path="/favorites"
                element={
                  <Navigate
                    to="/favorite"
                    replace
                  />
                }
              />


              {/* =========================================
                  TOUR GUIDE
              ========================================= */}

              <Route
                path="/guides"
                element={<TourGuide />}
              />


              {/* TOUR GUIDE ALIAS */}

              <Route
                path="/tour-guide"
                element={<TourGuide />}
              />


              {/* =========================================
                  TOUR GUIDE DETAIL
              ========================================= */}

              <Route
                path="/guide/:id"
                element={<TourGuideDetail />}
              />


              {/* TOUR GUIDE DETAIL ALIAS */}

              <Route
                path="/tour-guide/:id"
                element={<TourGuideDetail />}
              />


              {/* =========================================
                  GUIDE BOOKING
              ========================================= */}

              <Route
                path="/book/:id"
                element={<GuideBooking />}
              />


              {/* GUIDE BOOKING ALIAS */}

              <Route
                path="/booking/:id"
                element={<GuideBooking />}
              />


              {/* =========================================
                  BOOKINGS LIST
                  HARUS SEBELUM 404
              ========================================= */}

              <Route
                path="/bookings"
                element={<Bookings />}
              />


              {/* =========================================
                  LOCAL BUSINESS
              ========================================= */}

              <Route
                path="/local-business"
                element={<LocalBusiness />}
              />


              {/* =========================================
                  LOGIN
              ========================================= */}

              <Route
                path="/login"
                element={<Login />}
              />


              {/* =========================================
                  ACCOUNT
              ========================================= */}

              <Route
                path="/account"
                element={<Account />}
              />


              {/* =========================================
                  404
                  HARUS PALING BAWAH
              ========================================= */}

              <Route
                path="*"
                element={<NotFound />}
              />

            </Routes>

          </Suspense>

        </ErrorBoundary>

      </main>

    </div>
  )
}
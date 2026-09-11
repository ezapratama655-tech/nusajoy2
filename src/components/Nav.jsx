import { useState } from 'react'
import {
  NavLink,
  Link,
  useLocation,
} from 'react-router-dom'

import {
  Home,
  Compass,
  Sparkles,
  Heart,
  CalendarCheck,
  User,
  MapPinned,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react'

import './Nav.css'


// =====================================================
// NAVIGATION DATA
// =====================================================

const mainNavigation = [
  {
    label: 'Beranda',
    path: '/',
    icon: Home,
    end: true,
  },

  {
    label: 'Jelajah',
    path: '/explore',
    icon: Compass,
  },

  {
    label: 'Rekomendasi',
    path: '/recommendation',
    icon: Sparkles,
  },

  {
    label: 'Pemandu Wisata',
    path: '/guides',
    icon: MapPinned,
  },

  {
    label: 'Favorit',
    path: '/favorite',
    icon: Heart,
  },

  {
    label: 'Pesanan',
    path: '/bookings',
    icon: CalendarCheck,
  },
]


// =====================================================
// NAV COMPONENT
// =====================================================

export default function Nav() {

  const location = useLocation()

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false)


  // ===================================================
  // CLOSE MOBILE MENU
  // ===================================================

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }


  // ===================================================
  // ACTIVE CHECK
  // ===================================================

  const isActive = (path, end = false) => {

    if (end) {
      return location.pathname === path
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    )
  }


  return (

    <>

      {/* =================================================
          DESKTOP + MOBILE TOP NAVBAR
      ================================================= */}

      <header className="desktop-navbar">


        {/* ===============================================
            BRAND
        =============================================== */}

        <div className="nav-brand">

          <Link
            to="/"
            aria-label="NuSaJoy Beranda"
            onClick={closeMobileMenu}
          >

            <span className="brand-highlight">
              NuSa
            </span>

            Joy

          </Link>

        </div>


        {/* ===============================================
            DESKTOP NAVIGATION
        =============================================== */}

        <nav
          className="nav-links"
          aria-label="Navigasi utama"
        >

          {mainNavigation.map((item) => {

            const Icon = item.icon

            return (

              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `nav-link ${
                    isActive
                      ? 'active'
                      : ''
                  }`
                }
              >

                <Icon
                  size={16}
                  strokeWidth={2}
                />

                <span>
                  {item.label}
                </span>

              </NavLink>

            )
          })}

        </nav>


        {/* ===============================================
            ACCOUNT
        =============================================== */}

        <div className="nav-action">

          <NavLink
            to="/account"
            className={({ isActive }) =>
              `btn-profile ${
                isActive
                  ? 'active'
                  : ''
              }`
            }
          >

            <User
              size={17}
              strokeWidth={2}
            />

            <span>
              Akun
            </span>

          </NavLink>

        </div>


        {/* ===============================================
            MOBILE MENU BUTTON
        =============================================== */}

        <button
          type="button"
          className="mobile-menu-button"
          onClick={() =>
            setMobileMenuOpen(
              (prev) => !prev
            )
          }
          aria-label={
            mobileMenuOpen
              ? 'Tutup menu'
              : 'Buka menu'
          }
          aria-expanded={mobileMenuOpen}
        >

          {mobileMenuOpen ? (

            <X size={22} />

          ) : (

            <Menu size={22} />

          )}

        </button>

      </header>


      {/* =================================================
          MOBILE DROPDOWN MENU
      ================================================= */}

      <div
        className={
          `mobile-menu ${
            mobileMenuOpen
              ? 'open'
              : ''
          }`
        }
      >

        <div className="mobile-menu-inner">


          {/* =============================================
              MOBILE HEADER
          ============================================= */}

          <div className="mobile-menu-header">

            <div>

              <span className="mobile-menu-label">
                NAVIGASI
              </span>

              <h3>
                Jelajahi NuSaJoy
              </h3>

            </div>


            <button
              type="button"
              onClick={closeMobileMenu}
              aria-label="Tutup menu"
            >

              <X size={20} />

            </button>

          </div>


          {/* =============================================
              MOBILE LINKS
          ============================================= */}

          <div className="mobile-menu-links">

            {mainNavigation.map((item) => {

              const Icon = item.icon

              return (

                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `mobile-menu-link ${
                      isActive
                        ? 'active'
                        : ''
                    }`
                  }
                >

                  <span className="mobile-link-icon">

                    <Icon
                      size={19}
                      strokeWidth={2}
                    />

                  </span>


                  <span className="mobile-link-text">

                    {item.label}

                  </span>


                  <ChevronDown
                    size={16}
                    className="mobile-link-arrow"
                  />

                </NavLink>

              )
            })}


            {/* =========================================
                ACCOUNT
            ========================================= */}

            <NavLink
              to="/account"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `mobile-menu-link ${
                  isActive
                    ? 'active'
                    : ''
                }`
              }
            >

              <span className="mobile-link-icon">

                <User
                  size={19}
                  strokeWidth={2}
                />

              </span>


              <span className="mobile-link-text">

                Akun

              </span>


              <ChevronDown
                size={16}
                className="mobile-link-arrow"
              />

            </NavLink>

          </div>

        </div>

      </div>


      {/* =================================================
          MOBILE BOTTOM NAVIGATION
      ================================================= */}

      <nav
        className="mobile-bottom-nav"
        aria-label="Navigasi mobile"
      >


        {/* =============================================
            HOME
        ============================================= */}

        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `nav-item ${
              isActive
                ? 'active'
                : ''
            }`
          }
          aria-label="Beranda"
        >

          <Home
            size={21}
            strokeWidth={2}
          />

          <span>
            Beranda
          </span>

        </NavLink>


        {/* =============================================
            EXPLORE
        ============================================= */}

        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `nav-item ${
              isActive
                ? 'active'
                : ''
            }`
          }
          aria-label="Jelajah"
        >

          <Compass
            size={21}
            strokeWidth={2}
          />

          <span>
            Jelajah
          </span>

        </NavLink>


        {/* =============================================
            RECOMMENDATION
        ============================================= */}

        <NavLink
          to="/recommendation"
          className={({ isActive }) =>
            `nav-item nav-item-recommendation ${
              isActive
                ? 'active'
                : ''
            }`
          }
          aria-label="Rekomendasi"
        >

          <span className="recommendation-icon">

            <Sparkles
              size={21}
              strokeWidth={2}
            />

          </span>

          <span>
            Rekomendasi
          </span>

        </NavLink>


        {/* =============================================
            BOOKINGS
        ============================================= */}

        <NavLink
          to="/bookings"
          className={({ isActive }) =>
            `nav-item ${
              isActive
                ? 'active'
                : ''
            }`
          }
          aria-label="Pesanan"
        >

          <CalendarCheck
            size={21}
            strokeWidth={2}
          />

          <span>
            Pesanan
          </span>

        </NavLink>


        {/* =============================================
            ACCOUNT
        ============================================= */}

        <NavLink
          to="/account"
          className={({ isActive }) =>
            `nav-item ${
              isActive
                ? 'active'
                : ''
            }`
          }
          aria-label="Akun"
        >

          <User
            size={21}
            strokeWidth={2}
          />

          <span>
            Akun
          </span>

        </NavLink>

      </nav>

    </>

  )
}
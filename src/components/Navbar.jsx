/**
 * NuSaJoy — Universal Navigation
 *
 * Arsitektur:
 * --------------------------------------------------
 * Desktop (>= 1024px)
 *   Logo | Search | Main Navigation | Favorite | Trip | Account
 *
 * Mobile / Tablet (< 1024px)
 *   Bottom Navigation:
 *   Beranda | Jelajah | Rekomendasi | My Trip | Akun
 *
 * Prinsip:
 * - React Router sebagai single source of truth untuk active state
 * - Tidak membutuhkan activeTab state dari App.jsx
 * - Tidak bergantung pada Tailwind
 * - Navigation config terpusat
 * - Responsive
 * - Accessible
 */

import { memo, useCallback, useMemo, useState } from 'react'
import {
  Compass,
  Heart,
  Home,
  Search,
  Sparkles,
  CalendarCheck,
  User,
  Plus,
  Palette,
} from 'lucide-react'
import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import NuSaJoyLogo from './NuSaJoyLogo.jsx'
import '../styles/Navbar.css'

/* ==========================================================================
   NAVIGATION CONFIG
   ========================================================================== */

const MAIN_NAVIGATION = [
  {
    id: 'beranda',
    label: 'Beranda',
    path: '/',
    icon: Home,
  },
  {
    id: 'jelajah',
    label: 'Jelajah',
    path: '/explore',
    icon: Compass,
  },
  {
    id: 'rekomendasi',
    label: 'Rekomendasi',
    path: '/recommendation',
    icon: Sparkles,
  },
  {
    id: 'mytrip',
    label: 'My Trip',
    path: '/bookings',
    icon: CalendarCheck,
  },
  {
    id: 'akun',
    label: 'Akun',
    path: '/account',
    icon: User,
  },
]

const MAX_BADGE = 99

/* ==========================================================================
   HELPERS
   ========================================================================== */

function formatBadge(value) {
  const count = Number(value) || 0

  if (count <= 0) {
    return null
  }

  return count > MAX_BADGE
    ? `${MAX_BADGE}+`
    : String(count)
}

function isRouteActive(item, pathname) {
  if (item.path === '/') {
    return pathname === '/'
  }

  if (item.id === 'jelajah') {
    return (
      pathname === '/explore' ||
      pathname.startsWith('/destination/')
    )
  }

  if (item.id === 'rekomendasi') {
    return pathname === '/recommendation'
  }

  if (item.id === 'mytrip') {
    return (
      pathname === '/bookings' ||
      pathname === '/my-trip' ||
      pathname.startsWith('/book/') ||
      pathname.startsWith('/booking/')
    )
  }

  if (item.id === 'akun') {
    return pathname === '/account'
  }

  return pathname === item.path
}


/* ==========================================================================
   NAV ITEM
   ========================================================================== */

const NavItem = memo(function NavItem({
  item,
  active,
  mobile = false,
  badge = 0,
  onNavigate,
}) {
  const Icon = item.icon
  const badgeText = formatBadge(badge)

  return (
    <button
      type="button"
      className={[
        mobile
          ? 'nj-nav-mobile-item'
          : 'nj-nav-item',
        active ? 'is-active' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => onNavigate(item.path)}
      aria-current={active ? 'page' : undefined}
      aria-label={item.label}
    >
      <span className="nj-nav-icon">
        <Icon
          size={mobile ? 21 : 17}
          strokeWidth={active ? 2.3 : 2}
        />
      </span>

      {badgeText && (
        <span
          className={
            mobile
              ? 'nj-nav-badge nj-nav-badge--mobile'
              : 'nj-nav-badge'
          }
        >
          {badgeText}
        </span>
      )}

      <span className="nj-nav-label">
        {item.label}
      </span>
    </button>
  )
})


/* ==========================================================================
   SEARCH
   ========================================================================== */

const NavSearch = memo(function NavSearch({
  value,
  onChange,
  onSubmit,
}) {
  return (
    <form
      className="nj-nav-search"
      role="search"
      onSubmit={onSubmit}
    >
      <Search
        size={17}
        strokeWidth={2}
        className="nj-nav-search-icon"
        aria-hidden="true"
      />

      <input
        type="search"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder="Cari destinasi, rasa, cerita..."
        aria-label="Cari pengalaman NuSaJoy"
        autoComplete="off"
      />
    </form>
  )
})


/* ==========================================================================
   FAVORITE BUTTON
   ========================================================================== */

const FavoriteButton = memo(function FavoriteButton({
  count = 0,
  onClick,
}) {
  const badgeText = formatBadge(count)

  return (
    <button
      type="button"
      className={[
        'nj-action-button',
        count > 0 ? 'has-value' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      aria-label={
        count > 0
          ? `Favorit, ${count} tersimpan`
          : 'Favorit'
      }
      title="Favorit"
    >
      <Heart
        size={21}
        strokeWidth={2}
        fill={count > 0 ? 'currentColor' : 'none'}
      />

      {badgeText && (
        <span className="nj-action-badge">
          {badgeText}
        </span>
      )}
    </button>
  )
})


/* ==========================================================================
   PROFILE BUTTON
   ========================================================================== */

const ProfileButton = memo(function ProfileButton({
  onClick,
}) {
  return (
    <button
      type="button"
      className="nj-profile-button"
      onClick={onClick}
      aria-label="Buka akun"
      title="Akun"
    >
      <User
        size={22}
        strokeWidth={2}
        aria-hidden="true"
      />

      <span
        className="nj-profile-status"
        aria-hidden="true"
      />
    </button>
  )
})


/* ==========================================================================
   MAIN NAV
   ========================================================================== */

function Nav({
  favoritesCount = 0,
  tripCount = 0,
  onOpenFavorites,
  onCreateTripClick,
  onSearch,
  brandConcept = 1,
  onOpenBrandModal,
}) {
  const navigate = useNavigate()
  const location = useLocation()

  const [searchQuery, setSearchQuery] = useState('')

  const navigationItems = useMemo(
    () => MAIN_NAVIGATION,
    [],
  )

  /* ------------------------------------------------------------------------
     ROUTING
  ------------------------------------------------------------------------ */

  const handleNavigate = useCallback(
    (path) => {
      if (location.pathname === path) {
        return
      }

      navigate(path)
    },
    [location.pathname, navigate],
  )

  /* ------------------------------------------------------------------------
     BRAND
  ------------------------------------------------------------------------ */

  const handleBrandClick = useCallback(() => {
    handleNavigate('/')
  }, [handleNavigate])

  /* ------------------------------------------------------------------------
     SEARCH
  ------------------------------------------------------------------------ */

  const handleSearchSubmit = useCallback(
    (event) => {
      event.preventDefault()

      const query = searchQuery.trim()

      if (!query) {
        return
      }

      onSearch?.(query)

      navigate(
        `/explore?search=${encodeURIComponent(query)}`,
      )
    },
    [navigate, onSearch, searchQuery],
  )

  /* ------------------------------------------------------------------------
     FAVORITES
  ------------------------------------------------------------------------ */

  const handleFavoriteClick = useCallback(() => {
    if (onOpenFavorites) {
      onOpenFavorites()
      return
    }

    navigate('/favorite')
  }, [navigate, onOpenFavorites])

  /* ------------------------------------------------------------------------
     CREATE TRIP
  ------------------------------------------------------------------------ */

  const handleCreateTrip = useCallback(() => {
    if (onCreateTripClick) {
      onCreateTripClick()
      return
    }

    navigate('/bookings')
  }, [navigate, onCreateTripClick])

  /* ------------------------------------------------------------------------
     ACCOUNT
  ------------------------------------------------------------------------ */

  const handleAccount = useCallback(() => {
    navigate('/account')
  }, [navigate])

  return (
    <div className="nj-nav">
      {/* ==================================================================
          DESKTOP / LARGE SCREEN
      ================================================================== */}

      <header className="nj-nav-header">
        <div className="nj-nav-header-inner">
          {/* --------------------------------------------------------------
              BRAND
          -------------------------------------------------------------- */}

          <div className="nj-nav-brand-area">
            <button
              type="button"
              className="nj-nav-brand"
              onClick={handleBrandClick}
              aria-label="NuSaJoy Beranda"
              title="NuSaJoy Beranda"
            >
              <NuSaJoyLogo
                concept={brandConcept}
              />
            </button>

            {onOpenBrandModal && (
              <button
                type="button"
                className="nj-brand-concept-button"
                onClick={onOpenBrandModal}
                title="Lihat konsep identitas NuSaJoy"
              >
                <Palette
                  size={13}
                  strokeWidth={2}
                />

                <span>
                  Konsep Logo
                </span>
              </button>
            )}

            <NavSearch
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={handleSearchSubmit}
            />
          </div>

          {/* --------------------------------------------------------------
              MAIN NAVIGATION
          -------------------------------------------------------------- */}

          <nav
            className="nj-nav-main"
            aria-label="Navigasi utama"
          >
            {navigationItems
              .slice(0, 4)
              .map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  active={isRouteActive(
                    item,
                    location.pathname,
                  )}
                  badge={
                    item.id === 'mytrip'
                      ? tripCount
                      : 0
                  }
                  onNavigate={
                    handleNavigate
                  }
                />
              ))}
          </nav>

          {/* --------------------------------------------------------------
              ACTION AREA
          -------------------------------------------------------------- */}

          <div className="nj-nav-actions">
            <FavoriteButton
              count={favoritesCount}
              onClick={
                handleFavoriteClick
              }
            />

            <button
              type="button"
              className="nj-create-trip-button"
              onClick={
                handleCreateTrip
              }
            >
              <Plus
                size={17}
                strokeWidth={2.4}
              />

              <span>
                Buat Trip
              </span>
            </button>

            <div className="nj-nav-divider" />

            <ProfileButton
              onClick={handleAccount}
            />
          </div>
        </div>
      </header>


      {/* ==================================================================
          MOBILE / TABLET
      ================================================================== */}

      <nav
        className="nj-nav-mobile"
        aria-label="Navigasi mobile"
      >
        <div className="nj-nav-mobile-inner">
          {navigationItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              mobile
              active={isRouteActive(
                item,
                location.pathname,
              )}
              badge={
                item.id === 'mytrip'
                  ? tripCount
                  : 0
              }
              onNavigate={
                handleNavigate
              }
            />
          ))}
        </div>
      </nav>
    </div>
  )
}

export default memo(Nav)
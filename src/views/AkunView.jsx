/**
 * @file src/views/AkunView.jsx
 * NuSaJoy Account compatibility boundary.
 *
 * Legacy App.jsx tetap bisa menggunakan:
 *   import AkunView from './views/AkunView.jsx';
 *
 * Account.jsx menjadi single source of truth untuk UI + business logic.
 * Adapter ini hanya:
 * - menormalkan props lama / baru,
 * - menjaga shape data tetap aman,
 * - meneruskan state dan callback tanpa mengambil alih fungsi Account.
 *
 * Catatan:
 * Account.jsx di-load secara lazy agar tidak terjadi:
 * [INEFFECTIVE_DYNAMIC_IMPORT]
 * karena App.jsx juga menggunakan lazy import untuk Account.jsx.
 */

import { lazy, Suspense } from 'react'

const Account = lazy(() => import('../pages/Account.jsx'))

const VALID_SUB_TABS = new Set([
  'profile',
  'pesanan',
  'notifikasi',
  'bantuan',
  'mitra',
])

function normalizeList(value) {
  return Array.isArray(value) ? value : []
}

function normalizeSubTab(value) {
  return VALID_SUB_TABS.has(value) ? value : 'profile'
}

function AccountLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[50vh] w-full items-center justify-center px-4 py-12"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-[#174D36]/20 border-t-[#174D36]"
          aria-hidden="true"
        />

        <p className="text-sm font-medium text-[#68736D]">
          Memuat akun...
        </p>
      </div>
    </div>
  )
}

export default function AkunView({
  orders = [],
  notifications = [],
  onNavigateExplore,
  initialSubTab = 'profile',
  uiState = 'normal',
  currentState,
  onRetry,
  ...rest
}) {
  const safeOrders = normalizeList(orders)
  const safeNotifications = normalizeList(notifications)

  const effectiveState =
    currentState || uiState || 'normal'

  const handleNavigate = (target = 'jelajah') => {
    if (typeof onNavigateExplore === 'function') {
      onNavigateExplore(target)
    }
  }

  return (
    <Suspense fallback={<AccountLoading />}>
      <Account
        {...rest}
        orders={safeOrders}
        notifications={safeNotifications}
        onNavigateExplore={
          typeof onNavigateExplore === 'function'
            ? handleNavigate
            : undefined
        }
        initialSubTab={normalizeSubTab(initialSubTab)}
        uiState={effectiveState}
        currentState={effectiveState}
        onRetry={onRetry}
      />
    </Suspense>
  )
}
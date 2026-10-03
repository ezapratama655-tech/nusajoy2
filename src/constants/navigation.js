/**
 * NuSaJoy — Navigation & UI State Constants
 *
 * Shared by:
 * - Navbar
 * - StateSimulatorDrawer
 * - App
 */

export const NAV_ITEMS = [
  {
    id: 'beranda',
    label: 'Beranda',
    icon: 'home',
    route: '/',
  },

  {
    id: 'jelajah',
    label: 'Jelajah',
    icon: 'explore',
    route: '/explore',
  },

  {
    id: 'rekomendasi',
    label: 'Rekomendasi',
    icon: 'auto_awesome',
    route: '/recommendation',
  },

  {
    id: 'mytrip',
    label: 'My Trip',
    icon: 'luggage',
    route: '/my-trip',
  },

  {
    id: 'akun',
    label: 'Akun',
    icon: 'person',
    route: '/account',
  },
];

/**
 * State simulator
 *
 * normal  = data tersedia
 * empty   = data kosong
 * loading = data sedang dimuat
 * error   = terjadi kesalahan
 */

export const UI_STATES = {
  normal: {
    id: 'normal',
    label: 'Normal',
    shortLabel: 'Normal',
    description: 'Default',
    helperText:
      'Tampilan normal dengan data tersedia.',
    color: '#10B981',
    icon: 'check_circle',
  },

  empty: {
    id: 'empty',
    label: 'Kosong (Empty)',
    shortLabel: 'Kosong',
    description: '0 Hasil',
    helperText:
      'Tidak ada data yang dapat ditampilkan.',
    color: '#EAB308',
    icon: 'inbox',
  },

  loading: {
    id: 'loading',
    label: 'Loading...',
    shortLabel: 'Loading',
    description: 'Skeleton',
    helperText:
      'Data sedang dimuat.',
    color: '#3B82F6',
    icon: 'progress_activity',
  },

  error: {
    id: 'error',
    label: 'Error',
    shortLabel: 'Error',
    description: 'Retry',
    helperText:
      'Terjadi kesalahan saat memuat data.',
    color: '#F87171',
    icon: 'error',
  },
};

export const UI_STATE_LIST =
  Object.values(UI_STATES);

export const DEFAULT_UI_STATE =
  'normal';

export const isValidUIState = (value) =>
  Object.prototype.hasOwnProperty.call(
    UI_STATES,
    value,
  );
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { supabase } from '../utils/supabaseClient';
import { saveUserProfile } from '../utils/profile.js';

import '../styles/Login.css';

/**
 * NuSaJoy — Authentication
 *
 * Satu halaman autentikasi dengan pemilihan peran:
 * - Wisatawan
 * - Pemandu Lokal
 * - Pemilik Bisnis Lokal
 *
 * Fitur yang dipertahankan + dikembangkan:
 * - Login Supabase
 * - Register Supabase
 * - Konfirmasi password
 * - Password visibility
 * - Password strength
 * - Lupa password / reset password
 * - Session state
 * - Redirect berdasarkan halaman asal
 * - Redirect berdasarkan role
 * - Role disimpan ke Supabase user_metadata
 * - Role tersimpan lokal agar UX konsisten
 * - Visual kiri berubah ketika role dipilih
 * - Role card interaktif
 * - Responsive desktop / tablet / mobile
 */

const ROLE_STORAGE_KEY = 'nusajoy:selected-role';

const ROLE_REDIRECTS = {
  wisatawan: '/',
  pemandu: '/account',
  pemilik_bisnis: '/account',
};

const ROLE_CONFIG = {
  wisatawan: {
    id: 'wisatawan',
    label: 'Wisatawan',
    shortLabel: 'Traveler',
    eyebrow: 'PERJALANANMU',
    icon: 'compass',
    headline: 'Temukan perjalanan yang terasa lokal.',
    description:
      'Jelajahi destinasi autentik, kuliner khas, budaya, dan pengalaman lokal yang sesuai dengan gayamu.',
    loginDescription:
      'Masuk untuk menyimpan destinasi favorit dan merencanakan perjalananmu.',
    registerDescription:
      'Buat akun dan biarkan NuSaJoy membantu menemukan pengalaman yang lebih personal.',
    sceneTitle: 'Jelajah Indonesia dengan caramu',
    sceneSubtitle: 'Destinasi · Budaya · Kuliner · Adventure',
    floatingOneTitle: 'Desa Wisata Pilihan',
    floatingOneText: 'Autentik · Ramah · Lokal',
    floatingTwoTitle: '4.9 / 5',
    floatingTwoText: 'Dari traveler NuSaJoy',
    benefits: [
      {
        icon: 'heart',
        title: 'Favorit tersimpan',
        description: 'Destinasi yang kamu suka tetap dekat.',
      },
      {
        icon: 'calendar',
        title: 'Trip lebih rapi',
        description: 'Rencana perjalanan mudah dilanjutkan.',
      },
      {
        icon: 'sparkles',
        title: 'Rekomendasi personal',
        description: 'Temukan pengalaman yang lebih relevan.',
      },
    ],
  },

  pemandu: {
    id: 'pemandu',
    label: 'Pemandu Lokal',
    shortLabel: 'Local Guide',
    eyebrow: 'CERITAMU',
    icon: 'guide',
    headline: 'Bagikan cerita lokalmu kepada dunia.',
    description:
      'Tawarkan pengalaman yang autentik, bantu tamu mengenal tempatmu, dan ciptakan perjalanan yang berkesan.',
    loginDescription:
      'Masuk untuk mengelola pengalaman wisata, jadwal, reservasi, dan komunikasi dengan tamu.',
    registerDescription:
      'Daftarkan diri sebagai pemandu lokal dan mulai membangun pengalaman wisata bersama NuSaJoy.',
    sceneTitle: 'Bawa tamu melihat sisi lain Indonesia',
    sceneSubtitle: 'Guide · Experience · Guest · Story',
    floatingOneTitle: 'Local Guide',
    floatingOneText: 'Cerita langsung dari warga',
    floatingTwoTitle: 'Pengalaman aktif',
    floatingTwoText: 'Jadwal & tamu lebih teratur',
    benefits: [
      {
        icon: 'guide',
        title: 'Kelola pengalaman',
        description: 'Atur aktivitas dan cerita lokalmu.',
      },
      {
        icon: 'calendar',
        title: 'Jadwal terorganisir',
        description: 'Kelola reservasi dan waktu bertemu.',
      },
      {
        icon: 'chat',
        title: 'Terhubung dengan tamu',
        description: 'Komunikasi perjalanan lebih mudah.',
      },
    ],
  },

  pemilik_bisnis: {
    id: 'pemilik_bisnis',
    label: 'Pemilik Bisnis Lokal',
    shortLabel: 'Local Business',
    eyebrow: 'BISNIS LOKAL',
    icon: 'store',
    headline: 'Buat bisnismu lebih mudah ditemukan.',
    description:
      'Tampilkan kuliner, penginapan, kerajinan, dan layanan lokal kepada wisatawan yang sedang mencari pengalaman autentik.',
    loginDescription:
      'Masuk untuk mengelola profil bisnis, informasi layanan, dan hubungan dengan wisatawan.',
    registerDescription:
      'Daftarkan bisnis lokalmu dan mulai hadir di ekosistem wisata NuSaJoy.',
    sceneTitle: 'Bawa bisnis lokalmu ke lebih banyak traveler',
    sceneSubtitle: 'Kuliner · Toko · Homestay · Craft',
    floatingOneTitle: 'Local Business',
    floatingOneText: 'Lebih mudah ditemukan traveler',
    floatingTwoTitle: 'Profil aktif',
    floatingTwoText: 'Informasi bisnis selalu terbaru',
    benefits: [
      {
        icon: 'store',
        title: 'Kelola profil bisnis',
        description: 'Tampilkan tempat dan layananmu.',
      },
      {
        icon: 'sparkles',
        title: 'Promosi lebih relevan',
        description: 'Temukan audiens wisata yang sesuai.',
      },
      {
        icon: 'chat',
        title: 'Terhubung dengan pelanggan',
        description: 'Bangun komunikasi yang lebih dekat.',
      },
    ],
  },
};

const ICONS = {
  arrowRight: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  ),

  arrowLeft: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),

  mail: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  ),

  lock: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  ),

  eye: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ),

  eyeOff: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 3 18 18" />
      <path d="M10.6 6.2A10.8 10.8 0 0 1 12 6c6 0 9.5 6 9.5 6a18.3 18.3 0 0 1-3.1 3.8" />
      <path d="M6.6 6.7C4 8.3 2.5 12 2.5 12s3.5 6 9.5 6a9.7 9.7 0 0 0 3.4-.6" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  ),

  user: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  ),

  compass: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="m15.7 8.3-2.1 5.3-5.3 2.1 2.1-5.3 5.3-2.1Z" />
    </svg>
  ),

  guide: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="6.5" r="3" />
      <path d="M5 21a7 7 0 0 1 14 0" />
      <path d="M4 11h4" />
      <path d="M16 11h4" />
      <path d="M6 14h12" />
    </svg>
  ),

  store: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 10h16l-1.2-5H5.2L4 10Z" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-5h6v5" />
      <path d="M4 10c0 1.3 1 2.3 2.3 2.3S8.6 11.3 8.6 10c0 1.3 1 2.3 2.3 2.3s2.3-1 2.3-2.3c0 1.3 1 2.3 2.3 2.3s2.3-1 2.3-2.3c0 1.3 1 2.3 2.3 2.3S20 11.3 20 10" />
    </svg>
  ),

  heart: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.8 8.7c0 5.2-8.8 10.3-8.8 10.3S3.2 13.9 3.2 8.7A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.3Z" />
    </svg>
  ),

  calendar: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="17" rx="2" />
      <path d="M16 2v5M8 2v5M3 10h18" />
    </svg>
  ),

  sparkles: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" />
      <path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" />
      <path d="m5 14 .6 1.9L7.5 16l-1.9.6L5 18.5l-.6-1.9L2.5 16l1.9-.6L5 14Z" />
    </svg>
  ),

  chat: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.7 8.7 0 0 1-3.2-.6L4 20l1.2-3.5A7.2 7.2 0 0 1 4 12c0-4.1 3.6-7.5 8-7.5s8 3.1 8 7Z" />
      <path d="M8 12h.01M12 12h.01M16 12h.01" />
    </svg>
  ),

  shield: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 20 6v5c0 5-3.3 8.4-8 10-4.7-1.6-8-5-8-10V6l8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),

  check: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12 4.5 4.5L19 7" />
    </svg>
  ),
};

/* =========================================================
   LOGO
========================================================= */

function NuSaJoyLogo({ compact = false }) {
  return (
    <span className={`nusajoy-logo ${compact ? 'is-compact' : ''}`}>
      <span className="nusajoy-logo-mark" aria-hidden="true">
        <svg viewBox="0 0 44 44">
          <rect x="2" y="2" width="40" height="40" rx="13" />
          <path
            d="M12 29V15.6c0-1.9 1.5-3.4 3.4-3.4h2.1v10.2"
            className="logo-stroke"
          />
          <path
            d="M28 29V15.6c0-1.9-1.5-3.4-3.4-3.4h-2.1v10.2"
            className="logo-stroke"
          />
          <path
            d="M17.5 13.3 26.8 29"
            className="logo-stroke logo-stroke-accent"
          />
        </svg>
      </span>

      <span className="nusajoy-logo-name">
        NuSa<span>Joy</span>
      </span>
    </span>
  );
}

/* =========================================================
   HELPERS
========================================================= */

const getRoleConfig = (role) =>
  ROLE_CONFIG[role] || ROLE_CONFIG.wisatawan;

const getStoredRole = () => {
  if (typeof window === 'undefined') return 'wisatawan';

  const stored = window.localStorage.getItem(ROLE_STORAGE_KEY);

  return ROLE_CONFIG[stored] ? stored : 'wisatawan';
};

const validateEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const passwordScore = (value) => {
  let score = 0;

  if (value.length >= 6) score += 1;
  if (value.length >= 10) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  return Math.min(score, 5);
};

const getReadableError = (error) => {
  const message = String(error?.message || '').trim();

  if (!message) {
    return 'Terjadi kesalahan. Silakan coba lagi.';
  }

  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return 'Email atau password belum sesuai. Periksa kembali lalu coba lagi.';
  }

  if (normalized.includes('email not confirmed')) {
    return 'Email belum dikonfirmasi. Cek kotak masuk email untuk tautan verifikasi.';
  }

  if (normalized.includes('user already registered')) {
    return 'Email ini sudah terdaftar. Silakan masuk menggunakan akun tersebut.';
  }

  if (normalized.includes('password should be at least')) {
    return 'Password belum memenuhi panjang minimum yang ditentukan.';
  }

  if (normalized.includes('rate limit')) {
    return 'Terlalu banyak percobaan. Tunggu beberapa saat sebelum mencoba lagi.';
  }

  if (normalized.includes('network')) {
    return 'Koneksi sedang bermasalah. Periksa internetmu lalu coba lagi.';
  }

  if (normalized.includes('email') && normalized.includes('invalid')) {
    return 'Format email belum benar. Periksa kembali alamat emailmu.';
  }

  return message;
};

function getUserRole(user) {
  const metadataRole =
    user?.user_metadata?.role ||
    user?.user_metadata?.user_role ||
    user?.user_metadata?.account_type;

  if (ROLE_CONFIG[metadataRole]) {
    return metadataRole;
  }

  return getStoredRole();
}

/* =========================================================
   ROLE SELECTOR
========================================================= */

function RoleSelector({ selectedRole, onSelect, disabled = false }) {
  return (
    <div className="login-role-section">
      <div className="login-role-heading">
        <div>
          <span className="login-field-eyebrow">MASUK SEBAGAI</span>
          <p>Pilih peran kamu di NuSaJoy</p>
        </div>

        <span className="login-role-hint">Bisa diubah</span>
      </div>

      <div
        className="login-role-grid"
        role="radiogroup"
        aria-label="Pilih peran akun NuSaJoy"
      >
        {Object.values(ROLE_CONFIG).map((role) => {
          const active = role.id === selectedRole;

          return (
            <button
              key={role.id}
              type="button"
              className={`login-role-card ${active ? 'is-selected' : ''}`}
              onClick={() => onSelect(role.id)}
              disabled={disabled}
              role="radio"
              aria-checked={active}
            >
              <span className="login-role-card-glow" />

              <span className="login-role-card-top">
                <span className="login-role-icon">{ICONS[role.icon]}</span>

                <span className="login-role-radio" aria-hidden="true">
                  <span />
                </span>
              </span>

              <strong>{role.label}</strong>

              <small>
                {role.id === 'wisatawan'
                  ? 'Jelajah dan rencanakan perjalanan.'
                  : role.id === 'pemandu'
                    ? 'Bagikan pengalaman sebagai pemandu.'
                    : 'Kembangkan visibilitas bisnis lokal.'}
              </small>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   LOGIN
========================================================= */

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('login');
  const [selectedRole, setSelectedRole] = useState(getStoredRole);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [session, setSession] = useState(null);

  const [message, setMessage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const roleConfig = useMemo(
    () => getRoleConfig(selectedRole),
    [selectedRole],
  );

  const score = useMemo(
    () => passwordScore(password),
    [password],
  );

  const passwordLabel = useMemo(() => {
    if (!password) return 'Isi password untuk melihat kekuatannya';
    if (score <= 2) return 'Perlu diperkuat';
    if (score <= 3) return 'Cukup aman';
    if (score === 4) return 'Bagus';
    return 'Kuat';
  }, [password, score]);

  const redirectTarget = useMemo(() => {
    const from = location.state?.from;

    if (typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')) {
      return from;
    }

    if (typeof from?.pathname === 'string' && from.pathname.startsWith('/') && !from.pathname.startsWith('//')) {
      return `${from.pathname}${from.search || ''}${from.hash || ''}`;
    }

    return null;
  }, [location.state]);

  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  /* =====================================================
     SESSION INITIALIZATION
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (!mounted) return;

        const currentSession = data?.session || null;

        setSession(currentSession);

        if (currentSession?.user) {
          const role = getUserRole(currentSession.user);

          setSelectedRole(role);

          window.localStorage.setItem(
            ROLE_STORAGE_KEY,
            role,
          );
        }
      } catch (error) {
        console.error(
          'NuSaJoy login session error:',
          error,
        );

        if (mounted) {
          setMessage({
            type: 'error',
            text: getReadableError(error),
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (event === 'PASSWORD_RECOVERY') { navigate('/reset-password', { replace: true }); }
        if (!mounted) return;

        setSession(newSession || null);

        if (newSession?.user) {
          const role = getUserRole(newSession.user);

          setSelectedRole(role);

          if (typeof window !== 'undefined') {
            window.localStorage.setItem(
              ROLE_STORAGE_KEY,
              role,
            );
          }
        }
      },
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [navigate]);

  /* =====================================================
     ROLE
  ===================================================== */

  const handleRoleChange = useCallback((role) => {
    if (!ROLE_CONFIG[role]) return;

    setSelectedRole(role);
    setMessage(null);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        ROLE_STORAGE_KEY,
        role,
      );
    }
  }, []);

  /* =====================================================
     MODE
  ===================================================== */

  const switchMode = (nextMode) => {
    if (submitting || resetting) return;

    setMessage(null);
    setResetOpen(false);
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setMode(nextMode);
  };

  /* =====================================================
     NAVIGATION
  ===================================================== */

  const getPostAuthRoute = useCallback(
    (role = selectedRole) => {
      /*
       * Kalau user datang dari route tertentu,
       * dahulukan route asal agar UX tidak kehilangan
       * konteks halaman.
       *
       * Kalau tidak ada route asal, gunakan dashboard
       * berdasarkan role.
       */
      if (
        redirectTarget &&
        redirectTarget !== '/login' &&
        !redirectTarget.startsWith('/login?')
      ) {
        return redirectTarget;
      }

      return (
        ROLE_REDIRECTS[role] ||
        '/'
      );
    },
    [redirectTarget, selectedRole],
  );

  /* =====================================================
     LOGIN
  ===================================================== */

  const handleLogin = async () => {
    if (submitting) return;

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!validateEmail(normalizedEmail)) {
      setMessage({
        type: 'error',
        text: 'Masukkan alamat email yang valid.',
      });
      return;
    }

    if (password.length < 6) {
      setMessage({
        type: 'error',
        text: 'Password minimal terdiri dari 6 karakter.',
      });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

      if (error) throw error;

      const loggedUser = data?.user;

      if (!loggedUser) {
        throw new Error(
          'Data pengguna tidak ditemukan setelah login.',
        );
      }

      const existingRole =
        loggedUser?.user_metadata?.role ||
        loggedUser?.user_metadata?.user_role ||
        loggedUser?.user_metadata?.account_type;

      let finalRole = selectedRole;

      if (ROLE_CONFIG[existingRole]) {
        finalRole = existingRole;
        setSelectedRole(existingRole);
      } else {
        /*
         * Akun lama yang belum mempunyai role
         * akan diisi menggunakan role yang dipilih
         * saat login pertama kali.
         */
        const { error: roleError } =
          await supabase.auth.updateUser({
            data: {
              role: selectedRole,
              user_role: selectedRole,
              account_type: selectedRole,
            },
          });

        if (roleError) {
          console.warn(
            'NuSaJoy: role belum dapat disimpan ke metadata.',
            roleError,
          );
        }
      }

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          ROLE_STORAGE_KEY,
          finalRole,
        );
      }

      try {
        saveUserProfile({
          name:
            loggedUser?.user_metadata?.full_name ||
            loggedUser?.user_metadata?.name ||
            normalizedEmail.split('@')[0],

          email:
            loggedUser.email ||
            normalizedEmail,

          role: finalRole,
        });
      } catch (profileError) {
        console.warn(
          'NuSaJoy: gagal menyinkronkan profil lokal.',
          profileError,
        );
      }

      navigate(
        getPostAuthRoute(finalRole),
        { replace: true },
      );
    } catch (error) {
      console.error(
        'NuSaJoy authentication error:',
        error,
      );

      setMessage({
        type: 'error',
        text: getReadableError(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     REGISTER
  ===================================================== */

  const handleRegister = async () => {
    if (submitting) return;

    const cleanName = fullName.trim();
    const normalizedEmail =
      email.trim().toLowerCase();

    if (cleanName.length < 2) {
      setMessage({
        type: 'error',
        text: 'Nama lengkap minimal terdiri dari 2 karakter.',
      });
      return;
    }

    if (!validateEmail(normalizedEmail)) {
      setMessage({
        type: 'error',
        text: 'Masukkan alamat email yang valid.',
      });
      return;
    }

    if (password.length < 6) {
      setMessage({
        type: 'error',
        text: 'Password minimal terdiri dari 6 karakter.',
      });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Konfirmasi password belum sama.',
      });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const { data, error } =
        await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
              name: cleanName,
              role: selectedRole,
              user_role: selectedRole,
              account_type: selectedRole,
            },
          },
        });

      if (error) throw error;

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          ROLE_STORAGE_KEY,
          selectedRole,
        );
      }

      if (data?.session) {
        try {
          saveUserProfile({
            name: cleanName,
            email: normalizedEmail,
            role: selectedRole,
          });
        } catch (profileError) {
          console.warn(
            'NuSaJoy: gagal menyimpan profil lokal.',
            profileError,
          );
        }

        navigate(
          getPostAuthRoute(selectedRole),
          { replace: true },
        );

        return;
      }

      setMessage({
        type: 'success',
        text: `Akun ${roleConfig.label} berhasil dibuat. Silakan cek email untuk konfirmasi sebelum masuk.`,
      });

      setPassword('');
      setConfirmPassword('');
      setMode('login');
    } catch (error) {
      console.error(
        'NuSaJoy registration error:',
        error,
      );

      setMessage({
        type: 'error',
        text: getReadableError(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (mode === 'login') {
      await handleLogin();
      return;
    }

    await handleRegister();
  };

  /* =====================================================
     RESET PASSWORD
  ===================================================== */

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setMessage(null);

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!validateEmail(normalizedEmail)) {
      setMessage({
        type: 'error',
        text: 'Masukkan email yang valid terlebih dahulu.',
      });
      return;
    }

    setResetting(true);

    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(
          normalizedEmail,
          {
            redirectTo:
              `${window.location.origin}/reset-password`,
          },
        );

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Tautan reset password sudah dikirim. Periksa inbox atau folder spam emailmu.',
      });
    } catch (error) {
      console.error(
        'NuSaJoy reset password error:',
        error,
      );

      setMessage({
        type: 'error',
        text: getReadableError(error),
      });
    } finally {
      setResetting(false);
    }
  };

  /* =====================================================
     SESSION
  ===================================================== */

  const handleContinue = () => {
    const role = getUserRole(session?.user);

    navigate(
      getPostAuthRoute(role),
      { replace: true },
    );
  };

  const handleLogout = async () => {
    if (submitting) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const { error } =
        await supabase.auth.signOut();

      if (error) throw error;

      setSession(null);
      setMessage(null);
    } catch (error) {
      console.error(
        'NuSaJoy logout error:',
        error,
      );

      setMessage({
        type: 'error',
        text: getReadableError(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="login-page login-page-loading">
        <div className="login-loading-card">
          <NuSaJoyLogo compact />

          <div className="login-loading-orbit">
            <span />
          </div>

          <div className="login-loading-copy">
            <strong>Menyiapkan NuSaJoy...</strong>
            <span>
              Membuka jalan menuju perjalananmu.
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     ACTIVE SESSION
  ===================================================== */

  if (session) {
    const currentRole =
      getUserRole(session.user);

    const currentRoleConfig =
      getRoleConfig(currentRole);

    return (
      <div
        className={`login-page login-page-session login-role-${currentRole}`}
      >
        <div className="login-background" aria-hidden="true">
          <span className="login-blob login-blob-a" />
          <span className="login-blob login-blob-b" />
          <span className="login-blob login-blob-c" />
          <span className="login-route-orb login-route-orb-one" />
          <span className="login-route-orb login-route-orb-two" />
        </div>

        <header className="login-header">
          <Link
            to="/"
            className="login-header-brand"
            aria-label="Kembali ke NuSaJoy"
          >
            <NuSaJoyLogo />
          </Link>

          <Link
            to="/"
            className="login-back-link"
          >
            {ICONS.arrowLeft}
            <span>Kembali ke beranda</span>
          </Link>
        </header>

        <main className="login-centered-main">
          <section
            className="login-session-card"
            aria-labelledby="session-title"
          >
            <div className="login-session-art">
              <div className="login-session-sky" />
              <div className="login-session-sun" />
              <div className="login-session-hill session-hill-a" />
              <div className="login-session-hill session-hill-b" />
              <div className="login-session-road" />
              <div className="login-session-marker">
                {ICONS[currentRoleConfig.icon]}
              </div>

              <div className="login-session-floating">
                <span>
                  {currentRoleConfig.label}
                </span>
                <strong>
                  Siap melanjutkan?
                </strong>
              </div>
            </div>

            <div className="login-session-content">
              <span className="login-kicker">
                AKUN SUDAH AKTIF
              </span>

              <h1 id="session-title">
                Selamat datang kembali
                👋
              </h1>

              <p className="login-session-text">
                Kamu masuk sebagai{' '}
                <strong>
                  {currentRoleConfig.label}
                </strong>
                .
              </p>

              <div className="login-session-user">
                <span className="login-session-avatar">
                  {session.user.email
                    ?.slice(0, 1)
                    .toUpperCase() || 'N'}
                </span>

                <div>
                  <strong>
                    {session.user.user_metadata
                      ?.full_name ||
                      session.user.user_metadata
                        ?.name ||
                      'Pengguna NuSaJoy'}
                  </strong>

                  <span>
                    {session.user.email}
                  </span>
                </div>
              </div>

              <div className="login-session-role">
                <span className="login-session-role-icon">
                  {ICONS[currentRoleConfig.icon]}
                </span>

                <div>
                  <span>
                    Peran aktif
                  </span>
                  <strong>
                    {currentRoleConfig.shortLabel}
                  </strong>
                </div>
              </div>

              {message && (
                <div
                  className={`login-alert login-alert-${message.type}`}
                  role={
                    message.type === 'error'
                      ? 'alert'
                      : 'status'
                  }
                  aria-live="polite"
                >
                  <span className="login-alert-dot" />
                  <span>
                    {message.text}
                  </span>
                </div>
              )}

              <div className="login-session-actions">
                <button
                  type="button"
                  className="login-primary-btn"
                  onClick={
                    handleContinue
                  }
                >
                  <span>
                    {currentRoleConfig.id ===
                    'wisatawan'
                      ? 'Mulai Menjelajah'
                      : currentRoleConfig.id ===
                          'pemandu'
                        ? 'Buka Ruang Pemandu'
                        : 'Kelola Bisnis'}
                  </span>

                  {ICONS.arrowRight}
                </button>

                <button
                  type="button"
                  className="login-secondary-btn"
                  onClick={
                    handleLogout
                  }
                  disabled={submitting}
                >
                  {submitting
                    ? 'Keluar...'
                    : 'Gunakan akun lain'}
                </button>
              </div>

              <div className="login-security-note">
                {ICONS.shield}
                <span>
                  Sesi akunmu diproses secara
                  aman melalui Supabase
                  Authentication.
                </span>
              </div>
            </div>
          </section>
        </main>

        <footer className="login-footer">
          <span>NuSaJoy</span>
          <span>•</span>
          <span>
            Perjalanan yang terasa lokal
          </span>
        </footer>
      </div>
    );
  }

  /* =====================================================
     LOGIN / REGISTER
  ===================================================== */

  return (
    <div
      className={[
        'login-page',
        mode === 'register'
          ? 'login-page-register'
          : '',
        `login-role-${selectedRole}`,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className="login-background"
        aria-hidden="true"
      >
        <span className="login-blob login-blob-a" />
        <span className="login-blob login-blob-b" />
        <span className="login-blob login-blob-c" />
        <span className="login-grid-glow" />
        <span className="login-route-orb login-route-orb-one" />
        <span className="login-route-orb login-route-orb-two" />
        <span className="login-route-orb login-route-orb-three" />
      </div>

      <header className="login-header">
        <Link
          to="/"
          className="login-header-brand"
          aria-label="NuSaJoy Home"
        >
          <NuSaJoyLogo />
        </Link>

        <Link
          to="/"
          className="login-back-link"
        >
          {ICONS.arrowLeft}
          <span>Kembali ke beranda</span>
        </Link>
      </header>

      <main className="login-main">
        <section
          className="login-visual"
          aria-label="Pengalaman NuSaJoy"
        >
          <div className="login-visual-topline">
            <span className="login-status-pill">
              <span className="login-status-dot" />
              PLATFORM WISATA LOKAL INDONESIA
            </span>

            <span className="login-visual-badge">
              Personal Travel
            </span>
          </div>

          <div className="login-visual-copy">
            <span className="login-kicker">
              {roleConfig.eyebrow}
            </span>

            <h1 key={selectedRole}>
              {roleConfig.headline}
            </h1>

            <p key={`${selectedRole}-description`}>
              {roleConfig.description}
            </p>
          </div>

          <div
            key={selectedRole}
            className={`login-experience-stage login-stage-${selectedRole}`}
            aria-hidden="true"
          >
            <div className="login-sun" />

            <div className="login-cloud login-cloud-one" />
            <div className="login-cloud login-cloud-two" />

            <div className="login-mountain login-mountain-one" />
            <div className="login-mountain login-mountain-two" />

            <div className="login-rice-field rice-a" />
            <div className="login-rice-field rice-b" />
            <div className="login-rice-field rice-c" />

            <div className="login-visual-photo">
              <div className="scene-sky" />
              <div className="scene-sun-glow" />
              <div className="scene-hill scene-hill-back" />
              <div className="scene-hill scene-hill-front" />

              <div className="scene-village">
                <span className="scene-house scene-house-a">
                  <i />
                  <b />
                </span>

                <span className="scene-house scene-house-b">
                  <i />
                  <b />
                </span>

                <span className="scene-house scene-house-c">
                  <i />
                  <b />
                </span>
              </div>

              <div className="scene-palm scene-palm-a">
                <i />
                <b />
              </div>

              <div className="scene-palm scene-palm-b">
                <i />
                <b />
              </div>

              <div className="scene-person scene-person-a" />
              <div className="scene-person scene-person-b" />

              <div className="scene-table">
                <span />
                <span />
                <span />
              </div>

              <div className="scene-storefront">
                <span className="scene-store-awning" />
                <span className="scene-store-window" />
                <span className="scene-store-window second" />
              </div>

              <div className="scene-guide-flag">
                <i />
                <b />
              </div>

              <div className="scene-road" />
            </div>

            <div className="login-floating-card login-card-place">
              <div className="login-floating-icon">
                {ICONS[roleConfig.icon]}
              </div>

              <div>
                <strong>
                  {roleConfig.floatingOneTitle}
                </strong>
                <span>
                  {roleConfig.floatingOneText}
                </span>
              </div>
            </div>

            <div className="login-floating-card login-card-rating">
              <span className="login-rating-star">
                ★
              </span>

              <div>
                <strong>
                  {roleConfig.floatingTwoTitle}
                </strong>
                <span>
                  {roleConfig.floatingTwoText}
                </span>
              </div>
            </div>

            <div className="login-map-route">
              <span className="route-node route-node-one" />
              <span className="route-node route-node-two" />
              <span className="route-node route-node-three" />
              <span className="route-line" />
            </div>

            <div className="login-scene-caption">
              <span>{roleConfig.sceneTitle}</span>
              <small>
                {roleConfig.sceneSubtitle}
              </small>
            </div>
          </div>

          <div className="login-benefits">
            {roleConfig.benefits.map(
              (benefit, index) => (
                <div
                  className="login-benefit"
                  key={benefit.title}
                  style={{
                    '--benefit-delay':
                      `${index * 70}ms`,
                  }}
                >
                  <span>
                    {ICONS[benefit.icon]}
                  </span>

                  <div>
                    <strong>
                      {benefit.title}
                    </strong>

                    <small>
                      {benefit.description}
                    </small>
                  </div>
                </div>
              ),
            )}
          </div>
        </section>

        <section
          className="login-form-panel"
          aria-labelledby="auth-title"
        >
          <div className="login-form-card">
            <div className="login-mobile-brand">
              <NuSaJoyLogo compact />
            </div>

            <div className="login-form-heading">
              <div className="login-form-icon">
                {ICONS[roleConfig.icon]}
              </div>

              <div>
                <span className="login-kicker">
                  {mode === 'login'
                    ? 'WELCOME BACK'
                    : 'JOIN NUSAJOY'}
                </span>

                <h2 id="auth-title">
                  {mode === 'login'
                    ? 'Masuk ke akunmu'
                    : 'Mulai petualanganmu'}
                </h2>

                <p>
                  {mode === 'login'
                    ? roleConfig.loginDescription
                    : roleConfig.registerDescription}
                </p>
              </div>
            </div>

            <div
              className="login-mode-switch"
              role="tablist"
              aria-label="Jenis autentikasi"
            >
              <button
                type="button"
                role="tab"
                aria-selected={
                  mode === 'login'
                }
                className={
                  mode === 'login'
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  switchMode('login')
                }
              >
                Masuk
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={
                  mode === 'register'
                }
                className={
                  mode === 'register'
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  switchMode('register')
                }
              >
                Daftar
              </button>
            </div>

            <RoleSelector
              selectedRole={
                selectedRole
              }
              onSelect={
                handleRoleChange
              }
              disabled={
                submitting ||
                resetting
              }
            />

            {message && (
              <div
                className={`login-alert login-alert-${message.type}`}
                role={
                  message.type ===
                  'error'
                    ? 'alert'
                    : 'status'
                }
                aria-live="polite"
              >
                <span className="login-alert-dot" />
                <span>
                  {message.text}
                </span>
              </div>
            )}

            {resetOpen ? (
              <form
                className="login-form"
                onSubmit={
                  handleResetPassword
                }
              >
                <div className="login-reset-intro">
                  <button
                    type="button"
                    className="login-back-inline"
                    onClick={() => {
                      setResetOpen(false);
                      setMessage(null);
                    }}
                  >
                    {ICONS.arrowLeft}
                    <span>
                      Kembali ke login
                    </span>
                  </button>

                  <h3>
                    Atur ulang password
                  </h3>

                  <p>
                    Masukkan email akunmu.
                    Kami akan mengirim
                    tautan untuk membuat
                    password baru.
                  </p>
                </div>

                <div className="login-field-group">
                  <label htmlFor="reset-email">
                    Email
                  </label>

                  <div className="login-input-wrap">
                    <span className="login-input-icon">
                      {ICONS.mail}
                    </span>

                    <input
                      id="reset-email"
                      name="reset-email"
                      type="email"
                      required
                      value={email}
                      onChange={(
                        event,
                      ) => {
                        setEmail(
                          event.target
                            .value,
                        );
                        clearMessage();
                      }}
                      placeholder="nama@email.com"
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="login-primary-btn login-submit-btn"
                  disabled={
                    resetting
                  }
                >
                  <span>
                    {resetting
                      ? 'Mengirim tautan...'
                      : 'Kirim tautan reset'}
                  </span>

                  {resetting ? (
                    <span
                      className="login-spinner"
                      aria-hidden="true"
                    />
                  ) : (
                    ICONS.arrowRight
                  )}
                </button>
              </form>
            ) : (
              <form
                className="login-form"
                onSubmit={
                  handleSubmit
                }
              >
                {mode ===
                  'register' && (
                  <div className="login-field-group login-field-animate">
                    <label htmlFor="full-name">
                      Nama lengkap
                    </label>

                    <div className="login-input-wrap">
                      <span className="login-input-icon">
                        {ICONS.user}
                      </span>

                      <input
                        id="full-name"
                        name="name"
                        type="text"
                        required
                        value={
                          fullName
                        }
                        onChange={(
                          event,
                        ) => {
                          setFullName(
                            event.target
                              .value,
                          );
                          clearMessage();
                        }}
                        placeholder="Nama lengkapmu"
                        autoComplete="name"
                        maxLength={
                          80
                        }
                      />
                    </div>
                  </div>
                )}

                <div className="login-field-group">
                  <div className="login-label-row">
                    <label htmlFor="email">
                      Email
                    </label>
                    <span className="login-required-hint">
                      Wajib
                    </span>
                  </div>

                  <div
                    className={`login-input-wrap ${
                      email &&
                      !validateEmail(
                        email,
                      )
                        ? 'has-error'
                        : ''
                    }`}
                  >
                    <span className="login-input-icon">
                      {ICONS.mail}
                    </span>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={
                        email
                      }
                      onChange={(
                        event,
                      ) => {
                        setEmail(
                          event.target
                            .value,
                        );
                        clearMessage();
                      }}
                      placeholder="nama@email.com"
                      autoComplete="email"
                      spellCheck="false"
                    />

                    {email &&
                      validateEmail(
                        email,
                      ) && (
                        <span className="login-valid-icon">
                          {
                            ICONS.check
                          }
                        </span>
                      )}
                  </div>

                  {email &&
                    !validateEmail(
                      email,
                    ) && (
                    <small className="login-field-error">
                      Gunakan format
                      email yang benar.
                    </small>
                  )}
                </div>

                <div className="login-field-group">
                  <div className="login-label-row">
                    <label htmlFor="password">
                      Password
                    </label>

                    {mode ===
                      'login' && (
                      <button
                        type="button"
                        className="login-forgot-link"
                        onClick={() => {
                          setResetOpen(
                            true,
                          );
                          setMessage(
                            null,
                          );
                        }}
                      >
                        Lupa password?
                      </button>
                    )}
                  </div>

                  <div className="login-input-wrap">
                    <span className="login-input-icon">
                      {ICONS.lock}
                    </span>

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      required
                      minLength={6}
                      value={
                        password
                      }
                      onChange={(
                        event,
                      ) => {
                        setPassword(
                          event.target
                            .value,
                        );
                        clearMessage();
                      }}
                      placeholder="Minimal 6 karakter"
                      autoComplete={
                        mode ===
                        'login'
                          ? 'current-password'
                          : 'new-password'
                      }
                    />

                    <button
                      type="button"
                      className="login-visibility-btn"
                      onClick={() =>
                        setShowPassword(
                          (prev) =>
                            !prev,
                        )
                      }
                      aria-label={
                        showPassword
                          ? 'Sembunyikan password'
                          : 'Tampilkan password'
                      }
                    >
                      {showPassword
                        ? ICONS.eyeOff
                        : ICONS.eye}
                    </button>
                  </div>

                  {mode ===
                    'register' && (
                    <div
                      className="login-password-strength"
                      aria-live="polite"
                    >
                      <div
                        className="login-strength-meter"
                        aria-hidden="true"
                      >
                        {Array.from({
                          length: 5,
                        }).map(
                          (
                            _,
                            index,
                          ) => (
                            <span
                              key={
                                index
                              }
                              className={
                                index <
                                score
                                  ? 'filled'
                                  : ''
                              }
                            />
                          ),
                        )}
                      </div>

                      <div className="login-strength-row">
                        <small>
                          {
                            passwordLabel
                          }
                        </small>

                        <small>
                          {
                            password.length
                          }
                          /6+
                          karakter
                        </small>
                      </div>
                    </div>
                  )}
                </div>

                {mode ===
                  'register' && (
                  <div className="login-field-group login-field-animate">
                    <label htmlFor="confirm-password">
                      Konfirmasi password
                    </label>

                    <div className="login-input-wrap">
                      <span className="login-input-icon">
                        {ICONS.lock}
                      </span>

                      <input
                        id="confirm-password"
                        name="confirm-password"
                        type={
                          showConfirmPassword
                            ? 'text'
                            : 'password'
                        }
                        required
                        minLength={6}
                        value={
                          confirmPassword
                        }
                        onChange={(
                          event,
                        ) => {
                          setConfirmPassword(
                            event.target
                              .value,
                          );
                          clearMessage();
                        }}
                        placeholder="Ulangi password"
                        autoComplete="new-password"
                      />

                      <button
                        type="button"
                        className="login-visibility-btn"
                        onClick={() =>
                          setShowConfirmPassword(
                            (
                              prev,
                            ) =>
                              !prev,
                          )
                        }
                        aria-label={
                          showConfirmPassword
                            ? 'Sembunyikan konfirmasi password'
                            : 'Tampilkan konfirmasi password'
                        }
                      >
                        {showConfirmPassword
                          ? ICONS.eyeOff
                          : ICONS.eye}
                      </button>
                    </div>

                    {confirmPassword &&
                      password !==
                        confirmPassword && (
                        <small className="login-field-error">
                          Konfirmasi
                          password
                          belum sama.
                        </small>
                      )}

                    {confirmPassword &&
                      password ===
                        confirmPassword && (
                        <small className="login-field-success">
                          {
                            ICONS.check
                          }
                          Password
                          sudah
                          sama.
                        </small>
                      )}
                  </div>
                )}

                <div className="login-role-summary">
                  <span className="login-role-summary-icon">
                    {ICONS[
                      roleConfig.icon
                    ]}
                  </span>

                  <div>
                    <span>
                      Kamu masuk
                      sebagai
                    </span>

                    <strong>
                      {
                        roleConfig.label
                      }
                    </strong>
                  </div>

                  <span className="login-role-summary-dot" />
                </div>

                <div className="login-helper-row">
                  <span className="login-helper-icon">
                    {ICONS.shield}
                  </span>

                  <p>
                    {mode === 'login'
                      ? 'Data akun diproses melalui autentikasi Supabase dan tidak dibagikan ke publik.'
                      : 'Akun ini akan menggunakan peran pilihanmu agar pengalaman NuSaJoy lebih sesuai.'}
                  </p>
                </div>

                <button
                  type="submit"
                  className="login-primary-btn login-submit-btn"
                  disabled={
                    submitting
                  }
                >
                  <span>
                    {submitting
                      ? mode ===
                        'login'
                        ? 'Sedang masuk...'
                        : 'Membuat akun...'
                      : mode ===
                          'login'
                        ? `Masuk sebagai ${roleConfig.shortLabel}`
                        : `Daftar sebagai ${roleConfig.shortLabel}`}
                  </span>

                  {submitting ? (
                    <span
                      className="login-spinner"
                      aria-hidden="true"
                    />
                  ) : (
                    ICONS.arrowRight
                  )}
                </button>
              </form>
            )}

            {!resetOpen && (
              <div className="login-switch-copy">
                <span>
                  {mode === 'login'
                    ? 'Belum punya akun?'
                    : 'Sudah punya akun?'}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    switchMode(
                      mode === 'login'
                        ? 'register'
                        : 'login',
                    )
                  }
                  disabled={
                    submitting
                  }
                >
                  {mode === 'login'
                    ? 'Daftar sekarang'
                    : 'Login di sini'}
                  {ICONS.arrowRight}
                </button>
              </div>
            )}

            <div className="login-form-footer">
              <span />
              <small>
                NuSaJoy · Personal Travel
                Indonesia
              </small>
              <span />
            </div>
          </div>
        </section>
      </main>

      <footer className="login-footer login-footer-floating">
        <span>
          © {new Date().getFullYear()} NuSaJoy
        </span>
        <span>•</span>
        <span>
          Perjalanan yang terasa lokal
        </span>
      </footer>
    </div>
  );
}

export default Login;

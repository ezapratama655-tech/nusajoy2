import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { supabase } from "../utils/supabaseClient";

import "../styles/Account.css";

import {
  INITIAL_ORDERS,
  INITIAL_NOTIFICATIONS,
} from "../data/mockData.js";

import elegantProfileImage from "../assets/images/profile_budi_elegant_1790501843907.jpg";

/* =========================================================
   ICON
========================================================= */

const Icon = ({
  children,
  size = 22,
  strokeWidth = 1.8,
}) => {
  return (
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
};

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
      <circle
        cx="12"
        cy="8"
        r="4"
      />
      <path d="M4 21a8 8 0 0 1 16 0" />
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
      <circle
        cx="12"
        cy="12"
        r="9"
      />
      <path d="M12 7v5l3 2" />
    </Icon>
  ),

  bell: (
    <Icon>
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
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
    <Icon size={18}>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle
        cx="12"
        cy="10"
        r="2.5"
      />
    </Icon>
  ),
};

/* =========================================================
   ACCOUNT
========================================================= */

function Account({
  orders = INITIAL_ORDERS,
  notifications: initialNotifications = INITIAL_NOTIFICATIONS,
  onNavigateExplore,
  initialSubTab = "profile",
  uiState = "normal",
  onRetry,
}) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [editOpen, setEditOpen] =
    useState(false);

  const [logoutOpen, setLogoutOpen] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [profile, setProfile] = useState({
    name: "",
    location: "Indonesia",
    phone: "",
    bio: "",
  });

  const [form, setForm] = useState({
    name: "",
    location: "Indonesia",
    phone: "",
    bio: "",
  });

  const [favoritesCount, setFavoritesCount] =
    useState(0);

  const [visitedCount] =
    useState(0);

  const [plansCount] =
    useState(0);

  const [reviewsCount] =
    useState(0);

  const [toast, setToast] =
    useState({
      visible: false,
      message: "",
      type: "success",
    });

  /* =========================================================
     SECONDARY ACCOUNT HUB STATE
  ========================================================= */

  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
  const ordersList = useMemo(
    () => (Array.isArray(orders) ? orders : []),
    [orders]
  );
  const [notifList, setNotifList] = useState(() =>
    Array.isArray(initialNotifications) ? initialNotifications : []
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const navigateFromAccountHub = useCallback(
    (target = "jelajah") => {
      if (typeof onNavigateExplore === "function") {
        onNavigateExplore(target);
        return;
      }

      navigate(
        target === "rekomendasi"
          ? "/recommendation"
          : "/explore"
      );
    },
    [navigate, onNavigateExplore]
  );

  /* =========================================================
     TOAST
  ========================================================= */

  const showToast = useCallback(
    (message, type = "success") => {
      setToast({
        visible: true,
        message,
        type,
      });

      window.setTimeout(() => {
        setToast((prev) => ({
          ...prev,
          visible: false,
        }));
      }, 3000);
    },
    []
  );

  /* =========================================================
     LOAD ACCOUNT
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadAccount() {
      try {
        setLoading(true);

        /*
          Gunakan getSession() terlebih dahulu.

          Ini mencegah AuthSessionMissingError
          ketika user belum login.
        */

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error(
            "Session error:",
            sessionError
          );

          if (mounted) {
            setLoading(false);
            navigate("/login", {
              replace: true,
            });
          }

          return;
        }

        if (!session?.user) {
          if (mounted) {
            setLoading(false);

            navigate("/login", {
              replace: true,
            });
          }

          return;
        }

        const currentUser = session.user;

        if (!mounted) {
          return;
        }

        setUser(currentUser);

        const metadata =
          currentUser.user_metadata || {};

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
            "Indonesia",

          phone:
            metadata.phone ||
            "",

          bio:
            metadata.bio ||
            "",
        };

        setProfile(savedProfile);
        setForm(savedProfile);

        /* ===============================================
           FAVORITES
        =============================================== */

        try {
          const storedFavorites =
            JSON.parse(
              localStorage.getItem(
                "nusajoy_favorites"
              ) || "[]"
            );

          const favoriteGuides =
            JSON.parse(
              localStorage.getItem(
                "nusajoy_favorite_guides"
              ) || "[]"
            );

          const destinationCount =
            Array.isArray(
              storedFavorites
            )
              ? storedFavorites.length
              : 0;

          const guideCount =
            Array.isArray(
              favoriteGuides
            )
              ? favoriteGuides.length
              : 0;

          setFavoritesCount(
            destinationCount +
              guideCount
          );
        } catch (storageError) {
          console.warn(
            "Gagal membaca favorite:",
            storageError
          );

          setFavoritesCount(0);
        }
      } catch (error) {
        console.error(
          "Account error:",
          error
        );

        if (mounted) {
          navigate("/login", {
            replace: true,
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadAccount();

    /* ===============================================
       AUTH STATE LISTENER
    =============================================== */

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (event, session) => {
          if (!mounted) {
            return;
          }

          if (
            event === "SIGNED_OUT" ||
            !session?.user
          ) {
            setUser(null);

            navigate("/login", {
              replace: true,
            });
          }
        }
      );

    return () => {
      mounted = false;

      subscription?.unsubscribe();
    };
  }, [navigate]);

  /* =========================================================
     BODY LOCK
  ========================================================= */

  useEffect(() => {
    const modalOpen =
      editOpen || logoutOpen;

    if (modalOpen) {
      document.body.classList.add(
        "account-modal-open"
      );
    } else {
      document.body.classList.remove(
        "account-modal-open"
      );
    }

    return () => {
      document.body.classList.remove(
        "account-modal-open"
      );
    };
  }, [
    editOpen,
    logoutOpen,
  ]);

  /* =========================================================
     ESC KEY
  ========================================================= */

  useEffect(() => {
    function handleEscape(event) {
      if (event.key !== "Escape") {
        return;
      }

      if (
        editOpen &&
        !saving
      ) {
        setEditOpen(false);
      }

      if (
        logoutOpen &&
        !loggingOut
      ) {
        setLogoutOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [
    editOpen,
    logoutOpen,
    saving,
    loggingOut,
  ]);

  /* =========================================================
     DISPLAY DATA
  ========================================================= */

  const displayName = useMemo(() => {
    return (
      profile.name ||
      user?.user_metadata?.full_name ||
      user?.email?.split(
        "@"
      )[0] ||
      "Traveler"
    );
  }, [
    profile.name,
    user,
  ]);

  const initials = useMemo(() => {
    return (
      displayName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
          (word) => word[0]
        )
        .join("")
        .toUpperCase() ||
      "N"
    );
  }, [displayName]);

  const memberSince =
    useMemo(() => {
      if (!user?.created_at) {
        return "Member NuSaJoy";
      }

      const date = new Date(
        user.created_at
      );

      return `Member sejak ${date.toLocaleDateString(
        "id-ID",
        {
          month: "long",
          year: "numeric",
        }
      )}`;
    }, [user]);

  /* =========================================================
     EDIT PROFILE
  ========================================================= */

  function openEdit() {
    setForm(profile);
    setEditOpen(true);
  }

  function closeEdit() {
    if (!saving) {
      setEditOpen(false);
    }
  }

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function saveProfile(event) {
    event.preventDefault();

    if (!user || saving) {
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

    setSaving(true);

    try {
      const {
        data,
        error,
      } =
        await supabase.auth.updateUser({
          data: {
            full_name:
              cleanedName,

            name:
              cleanedName,

            location:
              form.location.trim() ||
              "Indonesia",

            phone:
              form.phone.trim(),

            bio:
              form.bio.trim(),
          },
        });

      if (error) {
        throw error;
      }

      if (data?.user) {
        setUser(data.user);
      }

      const updatedProfile = {
        name: cleanedName,

        location:
          form.location.trim() ||
          "Indonesia",

        phone:
          form.phone.trim(),

        bio:
          form.bio.trim(),
      };

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
  }

  /* =========================================================
     LOGOUT
  ========================================================= */

  function openLogout() {
    if (!loggingOut) {
      setLogoutOpen(true);
    }
  }

  function closeLogout() {
    if (!loggingOut) {
      setLogoutOpen(false);
    }
  }

  async function handleLogout() {
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
  }

  /* =========================================================
     EXTERNAL UI STATE COMPATIBILITY
  ========================================================= */

  if (uiState === "error") {
    return (
      <div className="account-loading account-state-error">
        <div className="account-state-icon" aria-hidden="true">
          <span className="material-symbols-outlined">account_circle_off</span>
        </div>
        <div>
          <strong>Gagal Memuat Profil Akun</strong>
          <p>Terjadi gangguan saat mengambil data akun pengguna.</p>
          <button
            type="button"
            className="save-button"
            onClick={onRetry || (() => window.location.reload())}
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (uiState === "loading") {
    return (
      <div className="max-w-5xl mx-auto px-5 py-12 space-y-8 animate-pulse">
        <div className="h-32 bg-[#FAF4DD] rounded-[24px]" />
        <div className="h-80 bg-[#F0ECDF] rounded-[24px]" />
      </div>
    );
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="account-loading">
        <div className="account-loader" />

        <div>
          <strong>
            Menyiapkan akunmu
          </strong>

          <p>
            Sedang mengambil data
            perjalananmu...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="account-page">

      {/* ===================================================
          TOP NAV
      =================================================== */}

      <header className="account-topbar">
        <Link
          to="/"
          className="account-brand"
          aria-label="NuSaJoy Home"
        >
          <span className="brand-mark">
            N
          </span>

          <span className="brand-name">
            NuSa<span>Joy</span>
          </span>
        </Link>

        <nav
          className="account-nav"
          aria-label="Navigasi akun"
        >
          <Link to="/">
            Home
          </Link>

          <Link to="/explore">
            Explore
          </Link>

          <Link to="/recommendation">
            Rekomendasi
          </Link>

          <Link to="/favorite">
            Favorit
          </Link>

          <Link
            to="/account"
            className="active"
          >
            Akun
          </Link>
        </nav>

        <Link
          to="/explore"
          className="topbar-action"
        >
          Jelajahi
        </Link>
      </header>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="account-main">

        {/* MOBILE TITLE */}

        <div className="account-mobile-title">
          <div>
            <p className="eyebrow">
              MY ACCOUNT
            </p>

            <h1>
              Akun Saya
            </h1>
          </div>

          <button
            type="button"
            className="mobile-edit-button"
            onClick={openEdit}
            aria-label="Edit profil"
          >
            {icons.edit}
          </button>
        </div>

        {/* =================================================
            PROFILE HERO
        ================================================= */}

        <section className="profile-hero">

          <div className="profile-glow profile-glow-one" />

          <div className="profile-glow profile-glow-two" />

          <div className="profile-content">

            <div className="avatar-wrapper">
              <div className="profile-avatar">
                {initials}
              </div>

              <span
                className="online-dot"
                aria-label="Akun aktif"
              />
            </div>

            <div className="profile-info">

              <span className="profile-label">
                TRAVELER
              </span>

              <h1>
                Halo, {displayName}! 👋
              </h1>

              <p className="profile-email">
                {user?.email ||
                  "Email tidak tersedia"}
              </p>

              <div className="profile-meta">

                <span>
                  {icons.location}
                  {profile.location ||
                    "Indonesia"}
                </span>

                <span>
                  {memberSince}
                </span>

              </div>
            </div>

            <button
              type="button"
              className="edit-profile-btn"
              onClick={openEdit}
            >
              {icons.edit}
              Edit Profil
            </button>

          </div>
        </section>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section
          className="stats-grid"
          aria-label="Statistik perjalanan"
        >
          <StatCard
            icon={icons.heart}
            value={favoritesCount}
            label="Favorit"
            description="Destinasi tersimpan"
          />

          <StatCard
            icon={icons.map}
            value={visitedCount}
            label="Dikunjungi"
            description="Tempat yang pernah kamu jelajahi"
          />

          <StatCard
            icon={icons.calendar}
            value={plansCount}
            label="Rencana"
            description="Perjalanan yang direncanakan"
          />

          <StatCard
            icon={icons.star}
            value={reviewsCount}
            label="Ulasan"
            description="Ulasan yang kamu berikan"
          />
        </section>

        {/* =================================================
            SECONDARY ACCOUNT HUB
        ================================================= */}

        <AccountSecondaryHub
          activeSubTab={activeSubTab}
          setActiveSubTab={setActiveSubTab}
          ordersList={ordersList}
          notifList={notifList}
          setNotifList={setNotifList}
          navigateFromAccountHub={navigateFromAccountHub}
          displayName={displayName}
          profileEmail={user?.email || "Email tidak tersedia"}
          profileLocation={profile.location || "Indonesia"}
          memberSince={memberSince}
        />

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="account-content-grid">

          {/* LEFT */}

          <div className="account-column">

            {/* ACTIVITIES */}

            <section className="account-section">

              <SectionHeader
                eyebrow="EXPLORE YOUR JOURNEY"
                title="Aktivitas & Perjalanan"
              />

              <div className="action-list">

                <AccountAction
                  icon={icons.heart}
                  title="Favorit Saya"
                  description="Lihat destinasi yang kamu simpan"
                  to="/favorite"
                />

                <AccountAction
                  icon={icons.calendar}
                  title="Rencana Perjalanan"
                  description="Kelola perjalanan yang akan datang"
                  to="/recommendation"
                />

                <AccountAction
                  icon={icons.clock}
                  title="Riwayat Aktivitas"
                  description="Lihat aktivitas perjalananmu"
                />

                <AccountAction
                  icon={icons.star}
                  title="Rekomendasi Untuk Saya"
                  description="Temukan destinasi berdasarkan preferensimu"
                  to="/recommendation"
                />

              </div>
            </section>

            {/* PERSONAL */}

            <section className="account-section">

              <SectionHeader
                eyebrow="PERSONAL INFORMATION"
                title="Informasi Pribadi"
                action={
                  <button
                    type="button"
                    onClick={openEdit}
                    className="text-action"
                  >
                    Edit
                  </button>
                }
              />

              <div className="personal-card">

                <InfoRow
                  label="Nama Lengkap"
                  value={displayName}
                />

                <InfoRow
                  label="Email"
                  value={
                    user?.email || "-"
                  }
                />

                <InfoRow
                  label="Nomor Telepon"
                  value={
                    profile.phone ||
                    "Belum ditambahkan"
                  }
                />

                <InfoRow
                  label="Lokasi"
                  value={
                    profile.location ||
                    "Indonesia"
                  }
                />

                {profile.bio && (
                  <InfoRow
                    label="Tentang Saya"
                    value={profile.bio}
                  />
                )}

              </div>
            </section>
          </div>

          {/* RIGHT */}

          <aside className="account-column">

            {/* PREFERENCE */}

            <section className="account-section preference-section">

              <SectionHeader
                eyebrow="TRAVEL STYLE"
                title="Preferensi Wisata"
              />

              <p className="section-description">
                Gunakan preferensi perjalananmu
                untuk membantu NuSaJoy memberikan
                rekomendasi yang lebih sesuai.
              </p>

              <div className="preference-tags">
                <span>🌿 Alam</span>
                <span>🏖️ Pantai</span>
                <span>🍜 Kuliner</span>
                <span>🏛️ Budaya</span>
                <span>📸 Fotografi</span>
                <span>🧭 Adventure</span>
              </div>

              <button
                type="button"
                className="preference-button"
                onClick={() =>
                  navigate("/recommendation")
                }
              >
                Atur Preferensi
                {icons.arrow}
              </button>

            </section>

            {/* SETTINGS */}

            <section className="account-section">

              <SectionHeader
                eyebrow="ACCOUNT"
                title="Pengaturan"
              />

              <div className="settings-list">

                {/* 
                   Penting:
                   SettingRow sekarang menggunakan
                   div ketika memiliki control.
                   Jadi tidak ada button di dalam button.
                */}

                <SettingRow
                  icon={icons.bell}
                  title="Notifikasi"
                  description="Update dan rekomendasi perjalanan"
                  control={
                    <button
                      type="button"
                      className={`toggle ${
                        notificationsEnabled
                          ? "on"
                          : ""
                      }`}
                      onClick={() =>
                        setNotificationsEnabled(
                          (prev) => !prev
                        )
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
                  title="Profil & Privasi"
                  description="Kelola informasi akun"
                  onClick={openEdit}
                />

                <SettingRow
                  icon={icons.settings}
                  title="Preferensi Aplikasi"
                  description="Pengaturan pengalaman NuSaJoy"
                  onClick={() =>
                    navigate(
                      "/recommendation"
                    )
                  }
                />

              </div>
            </section>

            {/* BUSINESS */}

            <section className="business-card">

              <div className="business-icon">
                {icons.business}
              </div>

              <div className="business-content">

                <span className="business-label">
                  FOR LOCAL BUSINESS
                </span>

                <h3>
                  Punya bisnis lokal?
                </h3>

                <p>
                  Promosikan tempat atau bisnis
                  kamu agar lebih mudah ditemukan
                  wisatawan.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      "Fitur Kelola Bisnis akan segera hadir."
                    )
                  }
                >
                  Kelola Bisnis
                  {icons.arrow}
                </button>

              </div>
            </section>

            {/* LOGOUT */}

            <button
              type="button"
              className="logout-button"
              onClick={openLogout}
              disabled={loggingOut}
            >
              {icons.logout}

              {loggingOut
                ? "Keluar..."
                : "Keluar dari Akun"}
            </button>

          </aside>
        </div>
      </main>

      {/* =====================================================
          MOBILE NAV
      ===================================================== */}

      <nav
        className="mobile-bottom-nav"
        aria-label="Navigasi utama mobile"
      >
        <Link to="/">
          <span>⌂</span>
          <small>Home</small>
        </Link>

        <Link to="/explore">
          <span>⌕</span>
          <small>Explore</small>
        </Link>

        <Link to="/favorite">
          <span>♡</span>
          <small>Favorit</small>
        </Link>

        <Link
          to="/account"
          className="active"
        >
          <span>◉</span>
          <small>Akun</small>
        </Link>
      </nav>

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {editOpen && (
        <div
          className="modal-overlay"
          onMouseDown={closeEdit}
          role="presentation"
        >
          <div
            className="profile-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
          >

            <div className="modal-handle" />

            <div className="modal-header">

              <div>
                <span className="eyebrow">
                  ACCOUNT
                </span>

                <h2 id="edit-profile-title">
                  Edit Profil
                </h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeEdit}
                disabled={saving}
                aria-label="Tutup"
              >
                {icons.close}
              </button>

            </div>

            <form
              onSubmit={saveProfile}
            >

              <div className="modal-avatar">
                {initials}
              </div>

              <label>
                Nama Lengkap

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                  autoComplete="name"
                  required
                />
              </label>

              <label>
                Email

                <input
                  value={
                    user?.email || ""
                  }
                  disabled
                  className="disabled-input"
                />

                <small>
                  Email dikelola oleh
                  autentikasi Supabase.
                </small>
              </label>

              <label>
                Nomor Telepon

                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Contoh: 08123456789"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </label>

              <label>
                Lokasi

                <input
                  name="location"
                  value={
                    form.location
                  }
                  onChange={handleChange}
                  placeholder="Kota / Negara"
                  autoComplete="address-level2"
                />
              </label>

              <label>
                Tentang Saya

                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Ceritakan sedikit tentang dirimu..."
                  maxLength={250}
                  rows={4}
                />

                <small>
                  {form.bio.length}/250
                  karakter
                </small>
              </label>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeEdit}
                  disabled={saving}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Menyimpan..."
                    : "Simpan Perubahan"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          LOGOUT MODAL
      ===================================================== */}

      {logoutOpen && (
        <div
          className="modal-overlay"
          onMouseDown={closeLogout}
          role="presentation"
        >
          <div
            className="confirm-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
          >

            <div className="confirm-icon">
              {icons.logout}
            </div>

            <h2 id="logout-title">
              Keluar dari akun?
            </h2>

            <p>
              Kamu perlu login kembali untuk
              mengakses fitur akun dan perjalanan
              yang tersimpan.
            </p>

            <div className="confirm-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={closeLogout}
                disabled={loggingOut}
              >
                Batal
              </button>

              <button
                type="button"
                className="danger-button"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut
                  ? "Keluar..."
                  : "Ya, Keluar"}
              </button>

            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          TOAST
      ===================================================== */}

      {toast.visible && (
        <div
          className={`account-toast ${toast.type}`}
          role="status"
        >
          <span className="toast-dot" />
          {toast.message}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  value,
  label,
  description,
}) {
  return (
    <div className="stat-card">
      <div className="stat-icon">
        {icon}
      </div>

      <div className="stat-content">
        <strong>{value}</strong>

        <span>{label}</span>

        <small>
          {description}
        </small>
      </div>
    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  eyebrow,
  title,
  action,
}) {
  return (
    <div className="section-header">
      <div>
        <span className="eyebrow">
          {eyebrow}
        </span>

        <h2>{title}</h2>
      </div>

      {action}
    </div>
  );
}

/* =========================================================
   ACCOUNT ACTION
========================================================= */

function AccountAction({
  icon,
  title,
  description,
  to,
  onClick,
}) {
  const content = (
    <>
      <div className="action-icon">
        {icon}
      </div>

      <div className="action-content">
        <strong>{title}</strong>

        <span>{description}</span>
      </div>

      <div className="action-arrow">
        {icons.arrow}
      </div>
    </>
  );

  if (to) {
    return (
      <Link
        className="account-action"
        to={to}
        aria-label={title}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="account-action"
      onClick={onClick}
      aria-label={title}
    >
      {content}
    </button>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  label,
  value,
}) {
  return (
    <div className="info-row">
      <span>{label}</span>

      <strong>
        {value}
      </strong>
    </div>
  );
}

/* =========================================================
   SETTING ROW
========================================================= */

function SettingRow({
  icon,
  title,
  description,
  control,
  onClick,
}) {
  /*
    Kalau ada control seperti toggle,
    wrapper harus DIV, bukan BUTTON.

    Ini memperbaiki error:
    <button> cannot be a descendant of <button>
  */

  if (control) {
    return (
      <div className="setting-row">

        <div className="setting-icon">
          {icon}
        </div>

        <div className="setting-content">
          <strong>
            {title}
          </strong>

          <span>
            {description}
          </span>
        </div>

        <div className="setting-control">
          {control}
        </div>

      </div>
    );
  }

  return (
    <button
      type="button"
      className="setting-row setting-row-button"
      onClick={onClick}
    >
      <div className="setting-icon">
        {icon}
      </div>

      <div className="setting-content">
        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>
      </div>

      <div className="setting-arrow">
        {icons.arrow}
      </div>
    </button>
  );
}

/* =========================================================
   EMBEDDED SECONDARY ACCOUNT HUB
========================================================= */

function AccountSecondaryHub({
  activeSubTab,
  setActiveSubTab,
  ordersList,
  notifList,
  setNotifList,
  navigateFromAccountHub,
  displayName,
  profileEmail,
  profileLocation,
  memberSince,
}) {
  return (
    <section className="account-secondary-hub">
      <div className="secondary-hub-inner max-w-5xl mx-auto px-5 lg:px-8 space-y-8">
        
        {/* User Profile Card */}
        <div className="bg-[#FFFDF7] rounded-[28px] p-6 sm:p-8 border border-[#DDE2D9] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              alt={`Profil ${displayName}`}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover object-top ring-4 ring-[#174D36]/20 border-2 border-[#174D36] shadow-md transition-all duration-300 hover:ring-[#C69A3A]/40"
              src={elegantProfileImage}
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="font-['Outfit'] text-[22px] sm:text-[26px] font-bold text-[#17251E]">
                  {displayName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#CFEACB] text-[#174D36] text-[11px] font-bold">
                  Pelancong Budaya
                </span>
              </div>
              <p className="text-[13px] text-[#68736D]">
                {profileEmail} · {profileLocation}
              </p>
              <p className="text-[12px] text-[#174D36] font-medium pt-0.5">
                {memberSince} · Reputasi Tamu Ramah Desa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="px-3 py-1.5 rounded-xl bg-[#FAF4DD] text-[#174D36] text-[12px] font-semibold border border-[#DDE2D9]">
              3 Perjalanan Selesai
            </span>
          </div>
        </div>

        {/* Navigation Tabs inside Akun (Bagian 2 Requirement) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#DDE2D9]">
          {[
            { id: 'profile', label: 'Ringkasan Akun', icon: 'person' },
            { id: 'pesanan', label: `Pesanan Saya (${ordersList.length})`, icon: 'receipt_long' },
            { id: 'notifikasi', label: `Notifikasi (${notifList.filter((n) => !n.read).length})`, icon: 'notifications' },
            { id: 'bantuan', label: 'Pusat Bantuan', icon: 'help' },
            { id: 'mitra', label: 'Gabung Mitra Budaya', icon: 'handshake' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-[#174D36] text-white shadow-xs'
                  : 'bg-[#FFFDF7] text-[#68736D] hover:text-[#17251E] border border-[#DDE2D9]'
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* SUB-VIEW 1: PESANAN SAYA */}
        {activeSubTab === 'pesanan' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-['Outfit'] text-[20px] font-bold text-[#17251E]">
                  Riwayat & Reservasi Aktif
                </h2>
                <p className="text-[13px] text-[#68736D]">
                  Semua reservasi terkonfirmasi langsung terhubung dengan pemandu lokal
                </p>
              </div>
            </div>

            {ordersList.length === 0 ? (
              <div className="bg-[#FFFDF7] p-12 rounded-[24px] border border-[#DDE2D9] text-center space-y-3">
                <p className="text-[14px] text-[#68736D]">Belum ada pesanan aktif saat ini.</p>
                <button
                  onClick={() => navigateFromAccountHub('jelajah')}
                  className="px-4 py-2 rounded-xl bg-[#174D36] text-white text-[13px] font-semibold cursor-pointer"
                >
                  Jelajahi Pengalaman
                </button>
              </div>
            ) : (
              ordersList.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-[#FFFDF7] rounded-[24px] p-6 border border-[#DDE2D9] shadow-2xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#DDE2D9] gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FAF4DD] font-mono font-bold text-[12px] text-[#174D36]">
                        {ord.id}
                      </span>
                      <span className="text-[12px] text-[#68736D]">Dipesan untuk {ord.date}</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#CFEACB] text-[#174D36] text-[12px] font-bold self-start sm:self-center">
                      {ord.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <h3 className="font-['Outfit'] text-[17px] font-bold text-[#17251E]">
                        {ord.title}
                      </h3>
                      <p className="text-[13px] text-[#68736D]">
                        Titik Kumpul: <strong>{ord.meetingPoint}</strong> ({ord.meetingTime})
                      </p>
                      <p className="text-[13px] text-[#68736D]">
                        Pemandu: <strong>{ord.guideName}</strong> ({ord.guidePhone})
                      </p>
                      <p className="text-[13px] text-[#68736D]">
                        Jumlah: <strong>{ord.guests} Peserta</strong> · Pembayaran: {ord.paymentMethod}
                      </p>
                    </div>

                    <div className="bg-[#FAF4DD] p-4 rounded-[18px] border border-[#DDE2D9] flex flex-col justify-between space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[12px] text-[#68736D]">Total Pembayaran:</span>
                        <span className="font-['Outfit'] text-[18px] font-bold text-[#174D36]">
                          Rp{ord.totalPrice.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            window.open(`https://wa.me/6281234567890?text=Halo%20${encodeURIComponent(ord.guideName)},%20saya%20pemesan%20${encodeURIComponent(ord.title)}%20(Kode%20${ord.id})`, '_blank');
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-base">chat</span>
                          <span>WhatsApp Pemandu</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* SUB-VIEW 2: NOTIFIKASI */}
        {activeSubTab === 'notifikasi' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-['Outfit'] text-[20px] font-bold text-[#17251E]">
                  Pemberitahuan & Pesan
                </h2>
                <p className="text-[13px] text-[#68736D]">
                  Pembaruan jadwal dan komunikasi dari pemandu lokal kamu
                </p>
              </div>
              <button
                onClick={() => {
                  setNotifList(notifList.map((n) => ({ ...n, read: true })));
                }}
                className="text-[12px] font-semibold text-[#174D36] hover:underline cursor-pointer"
              >
                Tandai semua dibaca
              </button>
            </div>

            <div className="space-y-3">
              {notifList.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-[20px] border transition-all flex items-start gap-3.5 ${
                    notif.read ? 'bg-[#FFFDF7] border-[#DDE2D9]' : 'bg-[#FAF4DD] border-[#174D36]/40 shadow-xs'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#CFEACB] text-[#174D36] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-lg">
                      {notif.type === 'chat' ? 'chat' : notif.type === 'booking' ? 'receipt' : 'park'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-['Outfit'] text-[15px] font-bold text-[#17251E]">
                        {notif.title}
                      </h4>
                      <span className="text-[11px] text-[#68736D]">{notif.time}</span>
                    </div>
                    <p className="text-[13px] text-[#68736D] mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-VIEW 3: PUSAT BANTUAN */}
        {activeSubTab === 'bantuan' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-['Outfit'] text-[20px] font-bold text-[#17251E]">
                Pusat Bantuan & Panduan Tamu
              </h2>
              <p className="text-[13px] text-[#68736D]">
                Jawaban seputar pemesanan, etika berkunjung ke desa adat, dan pembatalan
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  q: 'Bagaimana etika berkunjung ke desa adat?',
                  a: 'Gunakan pakaian sopan yang menutupi bahu dan lutut. Selalu meminta izin sebelum memotret kegiatan ritual atau warga lansia. Pemandu lokal NuSaJoy akan mendampingi dan menjelaskan aturan adat secara rinci.',
                },
                {
                  q: 'Apakah bisa membatalkan jadwal perjalanan?',
                  a: 'Gratis pembatalan dengan pengembalian dana 100% jika dilakukan minimal 24 jam sebelum kegiatan dimulai.',
                },
                {
                  q: 'Ke mana 2.5% Dana Konservasi Budaya disalurkan?',
                  a: 'Dana konservasi dialokasikan langsung ke kas paguyuban desa adat atau sanggar kriya setempat untuk perawatan alat kesenian dan rumah adat.',
                },
                {
                  q: 'Bagaimana jika cuaca buruk atau hujan lebat?',
                  a: 'Pemandu lokal memiliki rute alternatif ramah cuaca (seperti lokakarya kriya dalam ruangan atau pawon kuliner tradisi) tanpa biaya tambahan.',
                },
              ].map((faq, i) => (
                <div key={i} className="bg-[#FFFDF7] p-5 rounded-[20px] border border-[#DDE2D9] space-y-2">
                  <h3 className="font-['Outfit'] text-[15px] font-bold text-[#17251E]">
                    {faq.q}
                  </h3>
                  <p className="text-[13px] text-[#68736D] leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-[#FAF4DD] p-6 rounded-[22px] border border-[#DDE2D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-['Outfit'] text-[16px] font-bold text-[#17251E]">
                  Butuh Bantuan Mendesak?
                </h3>
                <p className="text-[13px] text-[#68736D]">
                  Tim concierge NuSaJoy siaga setiap hari pukul 07:00 - 22:00 WIB
                </p>
              </div>
              <button
                onClick={() => {
                  window.open('https://wa.me/6281234567890?text=Halo%20Tim%20NuSaJoy,%20saya%20butuh%20bantuan', '_blank');
                }}
                className="px-4 py-2.5 rounded-xl bg-[#174D36] text-white text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">support_agent</span>
                <span>Hubungi Concierge</span>
              </button>
            </div>
          </div>
        )}

        {/* SUB-VIEW 4: GABUNG MITRA BUDAYA */}
        {activeSubTab === 'mitra' && (
          <div className="bg-[#FFFDF7] rounded-[24px] p-6 sm:p-8 border border-[#DDE2D9] space-y-5">
            <div>
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#B5653A]">
                Pemberdayaan Warga
              </span>
              <h2 className="font-['Outfit'] text-[22px] font-bold text-[#17251E] mt-1">
                Gabung Ekosistem Pelaku Budaya & Pemandu
              </h2>
              <p className="text-[14px] text-[#68736D] mt-1 leading-relaxed">
                Apakah kamu pencerita sejarah, pengrajin kriya, atau pemilik homestay desa? Bergabunglah dengan NuSaJoy untuk menjangkau pelancong sadar budaya tanpa potongan komisi yang memberatkan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-[18px] bg-[#FAF4DD] border border-[#DDE2D9] space-y-1.5">
                <span className="font-['Outfit'] text-[16px] font-bold text-[#174D36]">Bebas Biaya Daftar</span>
                <p className="text-[12px] text-[#68736D]">Tidak ada pungutan pendaftaran untuk sanggar dan warga desa.</p>
              </div>
              <div className="p-4 rounded-[18px] bg-[#FAF4DD] border border-[#DDE2D9] space-y-1.5">
                <span className="font-['Outfit'] text-[16px] font-bold text-[#174D36]">Tarif Ditentukan Sendiri</span>
                <p className="text-[12px] text-[#68736D]">Kamu menetapkan nilai jerih payahmu secara mandiri dan bermartabat.</p>
              </div>
              <div className="p-4 rounded-[18px] bg-[#FAF4DD] border border-[#DDE2D9] space-y-1.5">
                <span className="font-['Outfit'] text-[16px] font-bold text-[#174D36]">Pelatihan Ramah Tamu</span>
                <p className="text-[12px] text-[#68736D]">Dukungan workshop penceritaan dan manajemen reservasi digital.</p>
              </div>
            </div>

            <button
              onClick={() => alert('Terima kasih atas ketertarikanmu! Formulir pendaftaran mitra budaya telah dikirimkan ke email terdaftar.')}
              className="px-6 py-3 rounded-[14px] bg-[#174D36] text-white font-semibold text-[14px] shadow-sm hover:bg-[#0F3524] transition-all cursor-pointer"
            >
              Ajukan Kemitraan Komunitas
            </button>
          </div>
        )}

        {/* SUB-VIEW 0: RINGKASAN AKUN (DEFAULT) */}
        {activeSubTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#FFFDF7] rounded-[24px] p-6 border border-[#DDE2D9] space-y-4">
              <h3 className="font-['Outfit'] text-[17px] font-bold text-[#17251E] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#174D36]">tune</span>
                Preferensi Personalisasi Kamu
              </h3>
              <div className="space-y-2.5 text-[13px]">
                <div className="flex justify-between py-1.5 border-b border-[#DDE2D9]/60">
                  <span className="text-[#68736D]">Ritme Perjalanan:</span>
                  <strong className="text-[#17251E]">Santai & Menikmati</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#DDE2D9]/60">
                  <span className="text-[#68736D]">Minat Favorit:</span>
                  <strong className="text-[#17251E]">Kuliner Tradisi, Sejarah, Kriya</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#DDE2D9]/60">
                  <span className="text-[#68736D]">Rentang Anggaran:</span>
                  <strong className="text-[#17251E]">Menengah (Rp100k - Rp250k)</strong>
                </div>
              </div>
              <button
                onClick={() => navigateFromAccountHub('rekomendasi')}
                className="w-full py-2.5 rounded-xl bg-[#FAF4DD] hover:bg-[#F0ECDF] text-[#174D36] text-[13px] font-semibold border border-[#DDE2D9] transition-all cursor-pointer"
              >
                Atur Ulang Preferensi di Rekomendasi
              </button>
            </div>

            <div className="bg-[#FFFDF7] rounded-[24px] p-6 border border-[#DDE2D9] space-y-4">
              <h3 className="font-['Outfit'] text-[17px] font-bold text-[#17251E] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#174D36]">favorite</span>
                Dampak yang Kamu Ciptakan
              </h3>
              <div className="bg-[#FAF4DD] p-4 rounded-[18px] border border-[#DDE2D9] space-y-2 text-[13px]">
                <p className="text-[#17251E] font-medium">
                  Melalui 3 perjalananmu bersama NuSaJoy, kamu telah menyumbang:
                </p>
                <div className="pt-1">
                  <span className="font-['Outfit'] text-[22px] font-bold text-[#174D36]">
                    Rp48.500
                  </span>
                  <p className="text-[12px] text-[#68736D]">
                    ke Dana Konservasi Budaya Mandiri untuk pelestarian rumah adat Kotagede.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}


export default Account;
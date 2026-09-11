import {
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

function Account() {
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

  const [notifications, setNotifications] =
    useState(true);

  const [toast, setToast] =
    useState({
      visible: false,
      message: "",
      type: "success",
    });

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
                        notifications
                          ? "on"
                          : ""
                      }`}
                      onClick={() =>
                        setNotifications(
                          (prev) => !prev
                        )
                      }
                      aria-label="Aktifkan atau nonaktifkan notifikasi"
                      aria-pressed={
                        notifications
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

export default Account;
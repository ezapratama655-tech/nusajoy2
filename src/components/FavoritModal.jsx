/**
 * @file src/components/FavoritModal.jsx
 * NuSaJoy Favorit Modal
 *
 * Aturan Bagian 2 & 5:
 * - Diakses lewat ikon Favorit di header kanan atas.
 * - Punya state Normal dan state Kosong (ramah, dengan CTA eksplorasi).
 *
 * Fitur:
 * - Filter Semua / Pengalaman / Pemandu
 * - Perhitungan jumlah favorit per kategori
 * - Item pemandu dibedakan dari item pengalaman
 * - Item favorit dapat dibuka ke detail
 * - Tambahkan favorit ke My Trip
 * - Menampilkan status "Di Trip"
 * - Hapus favorit
 * - Empty state ketika belum ada favorit
 * - Empty state khusus ketika filter tidak memiliki item
 * - Backdrop click untuk menutup
 * - Tombol ESC ditangani oleh useModalBehavior
 * - Scroll modal
 * - Responsive desktop/mobile
 * - Accessibility dasar
 *
 * Perbaikan:
 * - hooks tetap berada sebelum early return
 * - isOpen=false sekarang benar-benar menghilangkan modal
 * - tombol X menggunakan close handler yang aman
 * - event click pada isi modal tidak membubble ke backdrop
 * - getBackdropProps tetap dipertahankan
 * - wrapper FavoriteModal tetap tersedia agar default export valid
 * - image fallback ditambahkan
 * - data item dibuat lebih defensif agar tidak mudah crash
 */

import {
  useMemo,
  useRef,
  useState,
} from "react";

import useModalBehavior, {
  getBackdropProps,
} from "../hooks/useModalBehavior.js";

import {
  getFavoriteKey,
} from "../hooks/useFavorites.js";

import {
  getItemPriceLabel,
  isGuideItem,
} from "../utils/format.js";

/* =========================================================
   FILTERS
========================================================= */

const FILTERS = [
  {
    id: "all",
    label: "Semua",
  },
  {
    id: "experience",
    label: "Pengalaman",
  },
  {
    id: "guide",
    label: "Pemandu",
  },
];

/* =========================================================
   DEFAULT IMAGE FALLBACK
========================================================= */

const DEFAULT_FAVORITE_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' rx='24' fill='%23FAF4DD'/%3E%3Ccircle cx='80' cy='68' r='25' fill='%23174D36' opacity='.14'/%3E%3Cpath d='M80 54c-14 0-25 11-25 25 0 19 25 40 25 40s25-21 25-40c0-14-11-25-25-25Zm0 34a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z' fill='%23174D36' opacity='.65'/%3E%3C/svg%3E";

/* =========================================================
   FAVORIT MODAL BODY
========================================================= */

function FavoritModalBody({
  isOpen,
  onClose,
  favorites = [],
  onRemoveFavorite,
  onAddToTrip,
  isInTrip,
  onSelectExperience,
  onSelectGuide,
  onNavigateExplore,
}) {
  /* =======================================================
     STATE
  ======================================================= */

  const [
    activeFilter,
    setActiveFilter,
  ] = useState("all");

  /*
    useRef tetap dipertahankan dari struktur lama.
    Bisa digunakan untuk perluasan animasi/focus management
    tanpa mengubah API component.
  */
  const modalContentRef =
    useRef(null);

  /* =======================================================
     MODAL BEHAVIOR
  ======================================================= */

  useModalBehavior(
    isOpen,
    onClose
  );

  /* =======================================================
     NORMALIZE FAVORITES
  ======================================================= */

  const safeFavorites = useMemo(() => {
    if (!Array.isArray(favorites)) {
      return [];
    }

    /*
      Buang nilai null / undefined agar filter
      dan key tidak mudah menyebabkan runtime error.
    */
    return favorites.filter(
      (item) =>
        item &&
        typeof item === "object"
    );
  }, [favorites]);

  /* =======================================================
     RESET FILTER SAAT MODAL DIBUKA
  ======================================================= */

  /*
    Tidak memaksa filter berubah setiap render.
    Hanya menjaga agar filter yang sedang aktif
    selalu valid terhadap struktur FILTERS.
  */

  const validFilterIds =
    FILTERS.map(
      (filter) => filter.id
    );

  const normalizedActiveFilter =
    validFilterIds.includes(
      activeFilter
    )
      ? activeFilter
      : "all";

  /* =======================================================
     FAVORITE COUNTS
  ======================================================= */

  const counts = useMemo(() => {
    const guides =
      safeFavorites.filter(
        isGuideItem
      ).length;

    const experiences =
      safeFavorites.length -
      guides;

    return {
      all: safeFavorites.length,
      guide: guides,
      experience:
        Math.max(experiences, 0),
    };
  }, [safeFavorites]);

  /* =======================================================
     FILTERED FAVORITES
  ======================================================= */

  const filtered = useMemo(
    () => {
      return safeFavorites.filter(
        (item) => {
          if (
            normalizedActiveFilter ===
            "guide"
          ) {
            return isGuideItem(
              item
            );
          }

          if (
            normalizedActiveFilter ===
            "experience"
          ) {
            return !isGuideItem(
              item
            );
          }

          return true;
        }
      );
    },
    [
      safeFavorites,
      normalizedActiveFilter,
    ]
  );

  /* =======================================================
     HELPERS
  ======================================================= */

  const getItemName = (
    item
  ) => {
    return (
      item?.title ||
      item?.name ||
      item?.business_name ||
      item?.guideName ||
      "Favorit NuSaJoy"
    );
  };

  const getItemLocation = (
    item
  ) => {
    return (
      item?.location ||
      item?.city ||
      item?.address ||
      "Lokasi belum tersedia"
    );
  };

  const getItemRating = (
    item
  ) => {
    const rating =
      Number(item?.rating);

    if (
      Number.isFinite(rating) &&
      rating > 0
    ) {
      return rating;
    }

    return 4.9;
  };

  const getItemImage = (
    item
  ) => {
    return (
      item?.image ||
      item?.image_url ||
      item?.photo ||
      item?.avatar ||
      DEFAULT_FAVORITE_IMAGE
    );
  };

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const handleClose = () => {
    /*
      Optional chaining membuat component aman
      ketika onClose belum diberikan dari parent.
    */
    onClose?.();
  };

  /* =======================================================
     BACKDROP
  ======================================================= */

  const handleContentClick = (
    event
  ) => {
    /*
      Jangan biarkan click di dalam modal
      dianggap sebagai click pada backdrop.
    */
    event.stopPropagation();
  };

  /* =======================================================
     OPEN FAVORITE ITEM
  ======================================================= */

  const openItem = (
    item
  ) => {
    if (!item) {
      return;
    }

    /*
      Tutup modal terlebih dahulu.
    */
    handleClose();

    /*
      GUIDE:
      buka pemandu bila handler tersedia.
      Fallback ke pengalaman dipertahankan
      agar item tidak mati ketika handler guide
      tidak diberikan.
    */
    if (
      isGuideItem(item)
    ) {
      if (
        typeof onSelectGuide ===
        "function"
      ) {
        onSelectGuide(item);
        return;
      }

      onSelectExperience?.(
        item
      );

      return;
    }

    /*
      EXPERIENCE
    */
    onSelectExperience?.(
      item
    );
  };

  /* =======================================================
     HANDLE FILTER
  ======================================================= */

  const handleFilterChange = (
    filterId
  ) => {
    if (
      !validFilterIds.includes(
        filterId
      )
    ) {
      return;
    }

    setActiveFilter(
      filterId
    );
  };

  /* =======================================================
     ADD TO TRIP
  ======================================================= */

  const handleAddToTrip = (
    item
  ) => {
    if (!item) {
      return;
    }

    const alreadyInTrip =
      Boolean(
        isInTrip?.(item)
      );

    if (
      alreadyInTrip
    ) {
      return;
    }

    onAddToTrip?.(
      item
    );
  };

  /* =======================================================
     REMOVE FAVORITE
  ======================================================= */

  const handleRemoveFavorite = (
    item
  ) => {
    if (!item) {
      return;
    }

    onRemoveFavorite?.(
      item
    );
  };

  /* =======================================================
     IMAGE ERROR HANDLER
  ======================================================= */

  const handleImageError = (
    event
  ) => {
    if (
      event.currentTarget.dataset
        .fallbackApplied ===
      "true"
    ) {
      return;
    }

    event.currentTarget.dataset.fallbackApplied =
      "true";

    event.currentTarget.src =
      DEFAULT_FAVORITE_IMAGE;
  };

  /* =======================================================
     ACCESSIBILITY / EARLY RETURN
  ======================================================= */

  /*
    WAJIB diletakkan setelah semua hooks.

    Ketika parent:
      setFavoriteModalOpen(false)

    component ini langsung tidak dirender.

    Ini adalah pengaman tambahan apabila parent
    masih menyimpan component di tree.
  */
  if (!isOpen) {
    return null;
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      {...getBackdropProps(
        handleClose
      )}
    >

      {/* ===================================================
          MODAL CONTENT
      =================================================== */}

      <div
        ref={
          modalContentRef
        }
        role="dialog"
        aria-modal="true"
        aria-label="Favorit tersimpan"
        aria-describedby="favorite-modal-description"
        onClick={
          handleContentClick
        }
        className="bg-[#FFFDF7] rounded-[24px] max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-[#DDE2D9] animate-[favoriteModalIn_.24s_ease-out]"
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="p-5 border-b border-[#DDE2D9] flex items-center justify-between bg-[#FAF4DD] shrink-0">

          <div className="flex items-center gap-3 min-w-0">

            <div
              className="w-10 h-10 rounded-[14px] bg-white border border-[#DDE2D9] flex items-center justify-center shrink-0"
              aria-hidden="true"
            >

              <span className="material-symbols-outlined icon-fill text-2xl text-[#B5653A]">
                favorite
              </span>

            </div>

            <div className="min-w-0">

              <h3 className="font-['Outfit'] text-[18px] font-bold text-[#17251E] leading-tight">

                Favorit tersimpan (
                {safeFavorites.length}
                )

              </h3>

              <p
                id="favorite-modal-description"
                className="text-[12px] text-[#68736D] mt-0.5"
              >
                Pengalaman dan pemandu
                yang kamu minati
              </p>

            </div>

          </div>

          {/* CLOSE */}

          <button
            type="button"
            onClick={(
              event
            ) => {
              event.preventDefault();
              event.stopPropagation();
              handleClose();
            }}
            aria-label="Tutup favorit"
            title="Tutup"
            className="p-2 rounded-full text-[#68736D] hover:text-[#17251E] hover:bg-[#EEE8D2] active:scale-95 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#174D36]/30 shrink-0"
          >

            <span className="material-symbols-outlined text-xl">
              close
            </span>

          </button>

        </div>

        {/* =================================================
            FILTER
        ================================================= */}

        {safeFavorites.length >
          0 && (

          <div
            className="px-5 py-3 border-b border-[#DDE2D9] flex flex-wrap gap-2 shrink-0 bg-[#FFFDF7]"
            role="tablist"
            aria-label="Filter favorit"
          >

            {FILTERS.map(
              (tab) => {

                const isActive =
                  normalizedActiveFilter ===
                  tab.id;

                return (
                  <button
                    key={
                      tab.id
                    }
                    type="button"
                    role="tab"
                    aria-selected={
                      isActive
                    }
                    aria-controls="favorite-items-panel"
                    onClick={() =>
                      handleFilterChange(
                        tab.id
                      )
                    }
                    className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#174D36]/30 ${
                      isActive
                        ? "bg-[#174D36] text-white shadow-sm"
                        : "bg-[#FAF4DD] text-[#68736D] hover:text-[#17251E] hover:bg-[#EEE8D2]"
                    }`}
                  >

                    {tab.label} (
                    {
                      counts[
                        tab.id
                      ]
                    }
                    )

                  </button>
                );
              }
            )}

          </div>

        )}

        {/* =================================================
            DAFTAR / STATE
        ================================================= */}

        <div
          id="favorite-items-panel"
          role="tabpanel"
          className="overflow-y-auto flex-1 min-h-0 p-5 space-y-3.5 overscroll-contain"
        >

          {/* ================================================
              EMPTY TOTAL
          ================================================ */}

          {safeFavorites.length ===
          0 ? (

            <div className="py-12 px-4 text-center space-y-4">

              <div
                className="w-16 h-16 rounded-full bg-[#FAF4DD] text-[#B5653A] mx-auto flex items-center justify-center shadow-sm"
                aria-hidden="true"
              >

                <span className="material-symbols-outlined text-3xl">
                  favorite
                </span>

              </div>

              <div className="max-w-xs mx-auto">

                <h4 className="font-['Outfit'] text-[17px] font-bold text-[#17251E]">
                  Belum ada favorit tersimpan
                </h4>

                <p className="text-[13px] text-[#68736D] mt-1.5 leading-relaxed">
                  Sentuh ikon hati pada
                  kartu pengalaman atau
                  pemandu lokal untuk
                  menyimpannya di sini.
                </p>

              </div>

              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onNavigateExplore?.();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[14px] bg-[#174D36] hover:bg-[#0F3524] active:scale-[0.98] text-white text-[13px] font-semibold transition-all cursor-pointer shadow-sm"
              >

                <span>
                  Mulai jelajahi pengalaman
                </span>

                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>

              </button>

            </div>

          ) : filtered.length ===
            0 ? (

            /* ==============================================
               EMPTY FILTER
            ============================================== */

            <div className="py-12 px-4 text-center space-y-3">

              <div
                className="w-14 h-14 rounded-[18px] bg-[#FAF4DD] text-[#B5653A] mx-auto flex items-center justify-center"
                aria-hidden="true"
              >

                <span className="material-symbols-outlined text-2xl">
                  filter_alt_off
                </span>

              </div>

              <h4 className="font-['Outfit'] text-[16px] font-bold text-[#17251E]">

                Belum ada{" "}

                {
                  normalizedActiveFilter ===
                  "guide"
                    ? "pemandu"
                    : "pengalaman"
                }{" "}

                di favorit

              </h4>

              <p className="max-w-xs mx-auto text-[12px] text-[#68736D] leading-relaxed">

                Kamu belum menyimpan item
                dalam kategori ini.

              </p>

              <button
                type="button"
                onClick={() =>
                  handleFilterChange(
                    "all"
                  )
                }
                className="text-[13px] font-semibold text-[#174D36] hover:text-[#0F3524] underline cursor-pointer"
              >
                Tampilkan semua favorit
              </button>

            </div>

          ) : (

            /* ==============================================
               FAVORITE LIST
            ============================================== */

            filtered.map(
              (
                item,
                index
              ) => {

                const inTrip =
                  Boolean(
                    isInTrip?.(
                      item
                    )
                  );

                const name =
                  getItemName(
                    item
                  );

                const location =
                  getItemLocation(
                    item
                  );

                const rating =
                  getItemRating(
                    item
                  );

                const image =
                  getItemImage(
                    item
                  );

                let favoriteKey;

                try {
                  favoriteKey =
                    getFavoriteKey(
                      item
                    );
                } catch {
                  favoriteKey =
                    `${name}-${index}`;
                }

                const guide =
                  isGuideItem(
                    item
                  );

                return (
                  <div
                    key={
                      favoriteKey
                    }
                    className="group p-3.5 rounded-[18px] bg-white border border-[#DDE2D9] hover:border-[#174D36]/40 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
                  >

                    {/* ===================================
                        ITEM DETAIL
                    =================================== */}

                    <button
                      type="button"
                      onClick={() =>
                        openItem(
                          item
                        )
                      }
                      className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#174D36]/30"
                      aria-label={`Buka ${name}`}
                    >

                      {/* IMAGE */}

                      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[#FAF4DD]">

                        <img
                          src={
                            image
                          }
                          alt={
                            name
                          }
                          onError={
                            handleImageError
                          }
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />

                        {/* GUIDE BADGE */}

                        {guide && (
                          <span
                            className="absolute bottom-1 left-1 right-1 px-1 py-0.5 rounded-md bg-black/55 text-white text-[8px] font-semibold text-center backdrop-blur-sm"
                            aria-hidden="true"
                          >
                            Pemandu
                          </span>
                        )}

                      </div>

                      {/* TEXT */}

                      <span className="min-w-0">

                        <span className="block font-['Outfit'] text-[15px] font-bold text-[#17251E] line-clamp-1">
                          {
                            name
                          }
                        </span>

                        <span className="block text-[12px] text-[#68736D] line-clamp-1 mt-0.5">

                          {guide
                            ? "Pemandu · "
                            : ""}

                          {
                            location
                          }

                          {" · ★ "}

                          {
                            rating
                          }

                        </span>

                        <span className="block text-[13px] font-bold text-[#174D36] mt-0.5 font-['Outfit']">

                          {(() => {
                            try {
                              return getItemPriceLabel(
                                item
                              );
                            } catch {
                              return "Harga belum tersedia";
                            }
                          })()}

                        </span>

                      </span>

                    </button>

                    {/* ===================================
                        ITEM ACTIONS
                    =================================== */}

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">

                      {/* ADD TO TRIP */}

                      <button
                        type="button"
                        onClick={() =>
                          handleAddToTrip(
                            item
                          )
                        }
                        disabled={
                          inTrip
                        }
                        className={`px-3 py-1.5 rounded-xl font-semibold text-[12px] flex items-center gap-1 transition-all ${
                          inTrip
                            ? "bg-[#CFEACB] text-[#174D36] cursor-default"
                            : "bg-[#FAF4DD] hover:bg-[#CFEACB] active:scale-[0.97] text-[#174D36] cursor-pointer"
                        }`}
                        title={
                          inTrip
                            ? "Sudah ada di My Trip"
                            : "Tambah ke My Trip"
                        }
                        aria-label={
                          inTrip
                            ? `${name} sudah ada di My Trip`
                            : `Tambahkan ${name} ke My Trip`
                        }
                      >

                        <span className="material-symbols-outlined text-sm">
                          {
                            inTrip
                              ? "check"
                              : "add_location_alt"
                          }
                        </span>

                        <span>
                          {inTrip
                            ? "Di Trip"
                            : "+ Trip"}
                        </span>

                      </button>

                      {/* DELETE FAVORITE */}

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveFavorite(
                            item
                          )
                        }
                        aria-label={`Hapus ${name} dari favorit`}
                        title="Hapus dari favorit"
                        className="p-1.5 rounded-xl text-[#68736D] hover:text-[#B5653A] hover:bg-[#FAF4DD] active:scale-95 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B5653A]/30"
                      >

                        <span className="material-symbols-outlined text-lg">
                          delete
                        </span>

                      </button>

                    </div>

                  </div>
                );
              }
            )

          )}

        </div>

        {/* =================================================
            FOOTER INFO
        ================================================= */}

        {safeFavorites.length >
          0 && (

          <div className="px-5 py-3 border-t border-[#DDE2D9] bg-[#FAF4DD]/45 shrink-0">

            <div className="flex items-center justify-between gap-3">

              <div className="flex items-center gap-2 min-w-0">

                <span
                  className="material-symbols-outlined text-[#174D36] text-base shrink-0"
                  aria-hidden="true"
                >
                  info
                </span>

                <p className="text-[10px] sm:text-[11px] text-[#68736D] leading-relaxed">
                  Favoritmu tersimpan pada
                  perangkat ini dan dapat
                  kamu tambahkan ke My Trip.
                </p>

              </div>

              <span className="hidden sm:inline-flex shrink-0 px-2 py-1 rounded-full bg-[#CFEACB] text-[#174D36] text-[10px] font-bold">
                {safeFavorites.length} tersimpan
              </span>

            </div>

          </div>

        )}

      </div>
    </div>
  );
}

/* =========================================================
   FAVORITE MODAL WRAPPER
========================================================= */

/*
  Wrapper ini sengaja dipertahankan.

  App.jsx dapat menggunakan:

    import FavoriteModal from
      "./components/FavoritModal.jsx";

  lalu:

    <FavoriteModal
      isOpen={favoriteModalOpen}
      onClose={() =>
        setFavoriteModalOpen(false)
      }
      ...
    />

  Wrapper meneruskan seluruh props
  ke FavoritModalBody.
*/

function FavoriteModal(
  props
) {
  return (
    <FavoritModalBody
      {...props}
    />
  );
}

/* =========================================================
   EXPORT
========================================================= */

export {
  FavoriteModal,
  FavoritModalBody,
};

export default FavoriteModal;
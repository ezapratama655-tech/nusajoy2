/**
 * @file src/components/StateSimulatorDrawer.jsx
 * NuSaJoy UI State Simulator
 *
 * Fungsi:
 * - Menguji 4 keadaan UI NuSaJoy:
 *   1. Normal
 *   2. Kosong
 *   3. Loading
 *   4. Error
 *
 * - Dapat ditempatkan di semua layar melalui:
 *
 *   <StateSimulatorDrawer
 *     currentState={uiState}
 *     onStateChange={setUiState}
 *   />
 *
 * Catatan:
 * - UI_STATES berasal dari satu sumber:
 *   src/constants/navigation.js
 * - Drawer menggunakan z-index 45 agar berada
 *   di bawah modal z-index 50.
 * - Mendukung desktop, tablet, dan mobile.
 * - Accessible: aria-expanded, aria-pressed,
 *   aria-label, focus-visible.
 */

import {
  useMemo,
  useState,
} from 'react';

import {
  UI_STATES,
} from '../constants/navigation.js';

/* ==========================================================================
   HELPERS
   ========================================================================== */

/**
 * UI_STATES pada constants berbentuk object.
 * Dibuat menjadi array untuk kebutuhan render.
 */
const getStateList = () => {
  if (Array.isArray(UI_STATES)) {
    return UI_STATES;
  }

  if (
    UI_STATES &&
    typeof UI_STATES === 'object'
  ) {
    return Object.values(UI_STATES);
  }

  return [];
};

/**
 * Fallback jika currentState tidak valid.
 */
const getActiveState = (
  stateList,
  currentState,
) => {
  return (
    stateList.find(
      (state) =>
        state.id === currentState,
    ) ||
    stateList[0] ||
    null
  );
};

/**
 * Warna dot dibuat inline karena warna berasal
 * dari konfigurasi constants.
 */
const getDotStyle = (state) => ({
  backgroundColor:
    state?.color || '#94A3B8',
});

/**
 * Warna glow aktif.
 */
const getGlowStyle = (state) => {
  if (!state?.color) {
    return undefined;
  }

  return {
    boxShadow: `0 0 0 3px ${state.color}22`,
  };
};


/* ==========================================================================
   COMPONENT
   ========================================================================== */

export default function StateSimulatorDrawer({
  currentState = 'normal',
  onStateChange,
}) {
  const [
    isCollapsed,
    setIsCollapsed,
  ] = useState(false);

  /**
   * Mengubah UI_STATES object menjadi array.
   * useMemo mencegah kalkulasi ulang setiap render.
   */
  const stateList = useMemo(
    () => getStateList(),
    [],
  );

  const active =
    getActiveState(
      stateList,
      currentState,
    );

  /**
   * Kalau constants kosong,
   * jangan membuat aplikasi crash.
   */
  if (!stateList.length) {
    return null;
  }

  /* ------------------------------------------------------------------------
     EVENTS
  ------------------------------------------------------------------------ */

  const handleToggle = () => {
    setIsCollapsed(
      (previous) => !previous,
    );
  };

  const handleStateChange = (
    nextState,
  ) => {
    if (
      !nextState ||
      nextState === currentState
    ) {
      return;
    }

    onStateChange?.(nextState);
  };

  return (
    <aside
      aria-label="Simulator state NuSaJoy"
      className={`
        fixed
        bottom-[84px]
        right-3
        sm:right-4
        lg:bottom-6
        lg:right-6

        z-[45]

        rounded-[20px]
        border
        border-[#DDE2D9]

        bg-[#FFFDF7]/95
        backdrop-blur-xl

        shadow-[0_14px_40px_rgba(23,37,30,0.14)]

        transition-all
        duration-300
        ease-out

        ${
          isCollapsed
            ? 'w-auto'
            : 'w-[min(280px,calc(100vw-24px))]'
        }
      `}
    >
      {/* ==================================================================
          HEADER
      ================================================================== */}

      <div
        className={`
          flex
          items-center
          justify-between
          gap-3
          px-3
          py-2.5

          ${
            isCollapsed
              ? ''
              : 'border-b border-[#DDE2D9]'
          }
        `}
      >
        {/* ---------------------------------------------------------------
            TITLE
        --------------------------------------------------------------- */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-2
          "
        >
          {/* Simulator icon */}

          <span
            className="
              material-symbols-outlined
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              rounded-lg

              bg-[#FAF4DD]
              text-[17px]
              text-[#C69A3A]
            "
            aria-hidden="true"
          >
            tune
          </span>

          {/* Title */}

          <div className="min-w-0">
            {isCollapsed ? (
              <span
                className="
                  block
                  truncate

                  font-['Plus_Jakarta_Sans']
                  text-[11px]
                  font-bold
                  text-[#174D36]
                "
              >
                {active?.shortLabel ||
                  active?.label ||
                  'State'}
              </span>
            ) : (
              <>
                <span
                  className="
                    block

                    font-['Plus_Jakarta_Sans']
                    text-[11px]
                    font-bold
                    leading-tight
                    text-[#174D36]
                  "
                >
                  Simulasi UI state
                </span>

                <span
                  className="
                    mt-0.5
                    block

                    font-['Plus_Jakarta_Sans']
                    text-[9px]
                    font-medium
                    leading-tight
                    text-[#68736D]
                  "
                >
                  Uji kondisi layar NuSaJoy
                </span>
              </>
            )}
          </div>
        </div>


        {/* ---------------------------------------------------------------
            CURRENT STATE MINI INDICATOR
        --------------------------------------------------------------- */}

        {!isCollapsed && active && (
          <span
            className="
              hidden
              shrink-0
              items-center
              gap-1
              rounded-full
              bg-[#FAF4DD]
              px-2
              py-1
              sm:inline-flex
            "
          >
            <span
              className="
                h-1.5
                w-1.5
                rounded-full
              "
              style={getDotStyle(active)}
            />

            <span
              className="
                font-['Plus_Jakarta_Sans']
                text-[9px]
                font-semibold
                text-[#68736D]
              "
            >
              {active.shortLabel ||
                active.label}
            </span>
          </span>
        )}


        {/* ---------------------------------------------------------------
            COLLAPSE BUTTON
        --------------------------------------------------------------- */}

        <button
          type="button"
          onClick={handleToggle}
          aria-label={
            isCollapsed
              ? 'Perluas simulator'
              : 'Ciutkan simulator'
          }
          aria-expanded={!isCollapsed}
          title={
            isCollapsed
              ? 'Perluas simulator'
              : 'Ciutkan simulator'
          }
          className="
            flex
            h-7
            w-7
            shrink-0
            items-center
            justify-center

            rounded-lg

            text-[#68736D]

            transition-all
            duration-200

            hover:bg-[#FAF4DD]
            hover:text-[#174D36]

            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#174D36]/40

            cursor-pointer
          "
        >
          <span
            className="
              material-symbols-outlined
              text-[17px]
            "
            aria-hidden="true"
          >
            {
              isCollapsed
                ? 'expand_less'
                : 'expand_more'
            }
          </span>
        </button>
      </div>


      {/* ==================================================================
          COLLAPSED STATE
      ================================================================== */}

      {isCollapsed && active && (
        <button
          type="button"
          onClick={() => {
            setIsCollapsed(false);
          }}
          title={`State aktif: ${active.label}`}
          aria-label={`State aktif ${active.label}. Buka simulator.`}
          className="
            group

            flex
            items-center
            gap-2

            px-3
            pb-2.5
            pt-0.5

            text-left

            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#174D36]/30
          "
        >
          {/* Active dot */}

          <span
            className="
              h-2
              w-2
              shrink-0
              rounded-full

              transition-transform
              duration-200

              group-hover:scale-125
            "
            style={getDotStyle(active)}
          />

          {/* Active state label */}

          <span
            className="
              whitespace-nowrap

              font-['Plus_Jakarta_Sans']
              text-[10px]
              font-semibold
              text-[#17251E]
            "
          >
            {active.label}
          </span>

          {/* Expand hint */}

          <span
            className="
              material-symbols-outlined
              text-[13px]
              text-[#68736D]
            "
            aria-hidden="true"
          >
            tune
          </span>
        </button>
      )}


      {/* ==================================================================
          STATE OPTIONS
      ================================================================== */}

      {!isCollapsed && (
        <div
          className="
            flex
            flex-col
            gap-1.5

            p-2.5
          "
        >
          {stateList.map(
            (state) => {
              const isActive =
                currentState ===
                state.id;

              return (
                <button
                  key={state.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() =>
                    handleStateChange(
                      state.id,
                    )
                  }
                  disabled={
                    !onStateChange
                  }
                  className={`
                    group

                    relative
                    w-full

                    overflow-hidden

                    rounded-xl
                    border

                    px-2.5
                    py-2

                    text-left

                    transition-all
                    duration-200

                    focus:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#174D36]/30

                    ${
                      isActive
                        ? 'border-[#174D36] bg-[#174D36] text-white shadow-sm'
                        : 'border-transparent bg-transparent text-[#17251E] hover:border-[#DDE2D9] hover:bg-[#FAF4DD]'
                    }

                    ${
                      !onStateChange
                        ? 'cursor-not-allowed opacity-60'
                        : 'cursor-pointer'
                    }
                  `}
                  style={
                    isActive
                      ? getGlowStyle(
                          state,
                        )
                      : undefined
                  }
                >
                  {/* ------------------------------------------------------
                      ACTIVE ACCENT
                  ------------------------------------------------------ */}

                  <span
                    className={`
                      absolute
                      bottom-0
                      left-0
                      top-0
                      w-1

                      rounded-r-full

                      transition-opacity
                      duration-200

                      ${
                        isActive
                          ? 'opacity-100'
                          : 'opacity-0'
                      }
                    `}
                    style={getDotStyle(
                      state,
                    )}
                    aria-hidden="true"
                  />


                  {/* ------------------------------------------------------
                      STATE CONTENT
                  ------------------------------------------------------ */}

                  <span
                    className="
                      flex
                      items-center
                      justify-between
                      gap-3
                    "
                  >
                    {/* Left */}

                    <span
                      className="
                        flex
                        min-w-0
                        items-center
                        gap-2
                      "
                    >
                      {/* Dot */}

                      <span
                        className={`
                          h-2
                          w-2
                          shrink-0
                          rounded-full

                          ${
                            isActive
                              ? 'ring-2 ring-white/20'
                              : ''
                          }
                        `}
                        style={getDotStyle(
                          state,
                        )}
                        aria-hidden="true"
                      />

                      {/* Text */}

                      <span
                        className="
                          min-w-0
                        "
                      >
                        <span
                          className={`
                            block
                            truncate

                            font-['Plus_Jakarta_Sans']
                            text-[10px]
                            leading-tight

                            ${
                              isActive
                                ? 'font-bold text-white'
                                : 'font-semibold text-[#17251E]'
                            }
                          `}
                        >
                          {state.label}
                        </span>

                        <span
                          className={`
                            mt-0.5
                            block
                            truncate

                            font-['Plus_Jakarta_Sans']
                            text-[8px]
                            leading-tight

                            ${
                              isActive
                                ? 'text-white/70'
                                : 'text-[#68736D]'
                            }
                          `}
                        >
                          {state.helperText ||
                            state.description ||
                            ''}
                        </span>
                      </span>
                    </span>


                    {/* Right */}

                    <span
                      className={`
                        shrink-0

                        font-['Plus_Jakarta_Sans']
                        text-[8px]
                        font-medium

                        ${
                          isActive
                            ? 'text-white/70'
                            : 'text-[#68736D]'
                        }
                      `}
                    >
                      {state.description ||
                        state.shortLabel ||
                        ''}
                    </span>
                  </span>
                </button>
              );
            },
          )}
        </div>
      )}


      {/* ==================================================================
          FOOTER / EXPLANATION
      ================================================================== */}

      {!isCollapsed && (
        <div
          className="
            border-t
            border-[#DDE2D9]

            px-3
            py-2
          "
        >
          <p
            className="
              font-['Plus_Jakarta_Sans']
              text-[8px]
              font-medium
              leading-relaxed
              text-[#68736D]
            "
          >
            Simulator ini hanya untuk pengujian
            tampilan state. Pilih state untuk
            melihat bagaimana layar merespons.
          </p>
        </div>
      )}
    </aside>
  );
}
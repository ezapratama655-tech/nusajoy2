/**
 * @file src/hooks/useModalBehavior.js
 * NuSaJoy — Shared Modal Behavior
 *
 * Hook dan utility bersama untuk seluruh modal NuSaJoy.
 *
 * Mendukung:
 * - Escape untuk menutup modal
 * - klik backdrop untuk menutup modal
 * - lock scroll body
 * - menjaga posisi scrollbar agar layout tidak bergeser
 * - autofocus saat modal dibuka
 * - mengembalikan focus ke elemen sebelumnya saat modal ditutup
 * - helper getBackdropProps
 * - kompatibilitas dengan komponen modal lama dan baru
 *
 * ============================================================================
 * DEFAULT HOOK
 * ============================================================================
 *
 * import useModalBehavior from '../hooks/useModalBehavior.js';
 *
 * const {
 *   modalRef,
 *   dialogRef,
 *   handleClose,
 *   getBackdropProps,
 * } = useModalBehavior({
 *   isOpen,
 *   onClose,
 * });
 *
 *
 * ============================================================================
 * NAMED EXPORT
 * ============================================================================
 *
 * import {
 *   getBackdropProps,
 * } from '../hooks/useModalBehavior.js';
 *
 * const backdropProps = getBackdropProps({
 *   onClose,
 * });
 */


/* ==========================================================================
   REACT IMPORTS
   ========================================================================== */

import {
  useCallback,
  useEffect,
  useRef,
} from 'react';


/* ==========================================================================
   CONSTANTS
   ========================================================================== */

/**
 * Event yang digunakan secara internal untuk
 * memberitahu perubahan state modal, bila nanti
 * dibutuhkan oleh komponen lain.
 */
export const MODAL_BEHAVIOR_EVENT =
  'nusajoy:modal_behavior';


/* ==========================================================================
   HELPERS
   ========================================================================== */

/**
 * Memastikan kode hanya menggunakan API browser
 * ketika tersedia.
 */
const isBrowser = () =>
  typeof window !== 'undefined' &&
  typeof document !== 'undefined';


/**
 * Menjalankan callback hanya bila memang function.
 */
const safeCall = (
  callback,
  ...args
) => {
  if (
    typeof callback === 'function'
  ) {
    return callback(...args);
  }

  return undefined;
};


/**
 * Menggabungkan dua event handler tanpa
 * menghilangkan handler milik caller.
 */
const composeEventHandlers = (
  userHandler,
  internalHandler,
) => {
  return (event) => {
    safeCall(
      userHandler,
      event,
    );

    safeCall(
      internalHandler,
      event,
    );
  };
};


/**
 * Apakah target merupakan backdrop itu sendiri?
 *
 * Ini penting agar:
 *
 * klik backdrop  → tutup
 *
 * klik isi modal → jangan tutup
 */
const isBackdropTarget = (
  event,
) => {
  return (
    event.target ===
    event.currentTarget
  );
};


/* ==========================================================================
   NAMED EXPORT
   ========================================================================== */

/**
 * getBackdropProps
 *
 * Utility tanpa React hook.
 *
 * Bisa digunakan sebagai:
 *
 * getBackdropProps(onClose)
 *
 * atau:
 *
 * getBackdropProps({
 *   onClose,
 *   closeOnBackdrop: true,
 * })
 *
 * atau:
 *
 * getBackdropProps({
 *   onClose,
 *   closeOnBackdrop: false,
 *   className: '...',
 * })
 */
export const getBackdropProps = (
  options = {},
) => {
  /* ------------------------------------------------------------------------
     NORMALIZE OPTIONS
  ------------------------------------------------------------------------ */

  let config;

  if (
    typeof options ===
    'function'
  ) {
    config = {
      onClose: options,
    };
  } else {
    config =
      options &&
      typeof options === 'object'
        ? options
        : {};
  }


  /* ------------------------------------------------------------------------
     CONFIG
  ------------------------------------------------------------------------ */

  const {
    onClose,

    closeOnBackdrop = true,

    onMouseDown: userOnMouseDown,

    onClick: userOnClick,

    onMouseUp: userOnMouseUp,

    ...rest
  } = config;


  /* ------------------------------------------------------------------------
     BACKDROP MOUSE DOWN
  ------------------------------------------------------------------------ */

  const handleMouseDown = (
    event,
  ) => {
    if (
      isBackdropTarget(
        event,
      ) &&
      closeOnBackdrop
    ) {
      safeCall(
        onClose,
        event,
      );
    }
  };


  /* ------------------------------------------------------------------------
     CLICK
  ------------------------------------------------------------------------ */

  /**
   * Tidak menutup modal lagi di onClick.
   *
   * Alasannya:
   * onMouseDown sudah menangani interaksi pointer.
   *
   * Ini menghindari:
   *
   * mousedown → close()
   * click     → close()
   *
   * yang menyebabkan callback terpanggil dua kali.
   */
  const handleClick = (
    event,
  ) => {
    /**
     * Untuk keyboard / programmatic click,
     * event.detail umumnya 0.
     *
     * Kita tetap mendukung kasus tersebut.
     */
    if (
      isBackdropTarget(
        event,
      ) &&
      closeOnBackdrop &&
      event.detail === 0
    ) {
      safeCall(
        onClose,
        event,
      );
    }
  };


  /* ------------------------------------------------------------------------
     MOUSE UP
  ------------------------------------------------------------------------ */

  const handleMouseUp = (
    event,
  ) => {
    /**
     * Utility tetap menyediakan mouseUp
     * agar handler dari caller tidak hilang.
     */
    safeCall(
      userOnMouseUp,
      event,
    );
  };


  /* ------------------------------------------------------------------------
     RETURN
  ------------------------------------------------------------------------ */

  return {
    ...rest,

    role:
      rest.role ||
      'presentation',

    onMouseDown:
      composeEventHandlers(
        userOnMouseDown,
        handleMouseDown,
      ),

    onClick:
      composeEventHandlers(
        userOnClick,
        handleClick,
      ),

    onMouseUp:
      handleMouseUp,
  };
};


/* ==========================================================================
   DEFAULT HOOK
   ========================================================================== */

/**
 * useModalBehavior
 *
 * Hook bersama untuk perilaku modal NuSaJoy.
 */
export default function useModalBehavior(
  options = {},
) {
  /* ------------------------------------------------------------------------
     OPTIONS
  ------------------------------------------------------------------------ */

  const {
    isOpen = false,

    onClose,

    closeOnBackdrop = true,

    closeOnEscape = true,

    lockScroll = true,

    autoFocus = true,

    restoreFocus = true,

    initialFocusRef = null,
  } = options || {};


  /* ------------------------------------------------------------------------
     REFS
  ------------------------------------------------------------------------ */

  /**
   * Root dialog ref.
   */
  const modalRef =
    useRef(null);


  /**
   * Element yang aktif sebelum modal dibuka.
   */
  const previousActiveElementRef =
    useRef(null);


  /**
   * Menandai apakah effect modal
   * sudah menyimpan active element.
   */
  const hasStoredFocusRef =
    useRef(false);


  /* ------------------------------------------------------------------------
     CLOSE HANDLER
  ------------------------------------------------------------------------ */

  const handleClose =
    useCallback(() => {
      safeCall(
        onClose,
      );
    }, [
      onClose,
    ]);


  /* ==========================================================================
     STORE PREVIOUS FOCUS
  ========================================================================== */

  useEffect(() => {
    if (
      !isOpen ||
      !isBrowser()
    ) {
      return undefined;
    }

    if (
      !hasStoredFocusRef.current
    ) {
      previousActiveElementRef.current =
        document.activeElement;

      hasStoredFocusRef.current =
        true;
    }

    return undefined;
  }, [
    isOpen,
  ]);


  /* ==========================================================================
     ESCAPE
  ========================================================================== */

  useEffect(() => {
    if (
      !isOpen ||
      !closeOnEscape ||
      !isBrowser()
    ) {
      return undefined;
    }

    const handleKeyDown =
      (event) => {
        if (
          event.key !==
          'Escape'
        ) {
          return;
        }

        /**
         * Modal terdalam mendapat
         * prioritas untuk close.
         */
        event.preventDefault();
        event.stopPropagation();

        handleClose();
      };

    document.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [
    isOpen,
    closeOnEscape,
    handleClose,
  ]);


  /* ==========================================================================
     BODY SCROLL LOCK
  ========================================================================== */

  useEffect(() => {
    if (
      !isOpen ||
      !lockScroll ||
      !isBrowser()
    ) {
      return undefined;
    }

    const body =
      document.body;

    const previousOverflow =
      body.style.overflow;

    const previousPaddingRight =
      body.style.paddingRight;

    /**
     * Hitung lebar scrollbar.
     */
    const scrollbarWidth =
      window.innerWidth -
      document.documentElement
        .clientWidth;

    body.style.overflow =
      'hidden';

    /**
     * Mencegah layout bergeser ketika
     * scrollbar menghilang.
     */
    if (
      scrollbarWidth > 0
    ) {
      body.style.paddingRight =
        `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow =
        previousOverflow;

      body.style.paddingRight =
        previousPaddingRight;
    };
  }, [
    isOpen,
    lockScroll,
  ]);


  /* ==========================================================================
     AUTO FOCUS
  ========================================================================== */

  useEffect(() => {
    if (
      !isOpen ||
      !autoFocus ||
      !isBrowser()
    ) {
      return undefined;
    }

    const focusTimer =
      window.setTimeout(
        () => {
          /* --------------------------------------------------------------
             1. Initial focus ref
          -------------------------------------------------------------- */

          if (
            initialFocusRef?.current
          ) {
            initialFocusRef.current.focus?.();
            return;
          }


          /* --------------------------------------------------------------
             2. Dialog root
          -------------------------------------------------------------- */

          modalRef.current?.focus?.();
        },
        0,
      );

    return () => {
      window.clearTimeout(
        focusTimer,
      );
    };
  }, [
    isOpen,
    autoFocus,
    initialFocusRef,
  ]);


  /* ==========================================================================
     RESTORE FOCUS
  ========================================================================== */

  useEffect(() => {
    /**
     * Saat modal ditutup:
     *
     * kembalikan focus ke elemen
     * yang sebelumnya aktif.
     */
    if (
      isOpen ||
      !restoreFocus ||
      !isBrowser()
    ) {
      return undefined;
    }

    if (
      !hasStoredFocusRef.current
    ) {
      return undefined;
    }

    const previousElement =
      previousActiveElementRef.current;

    const restoreTimer =
      window.setTimeout(
        () => {
          if (
            previousElement &&
            typeof previousElement.focus ===
              'function'
          ) {
            /**
             * Jangan fokus ke element
             * yang sudah tidak berada di DOM.
             */
            if (
              document.contains(
                previousElement,
              )
            ) {
              previousElement.focus();
            }
          }

          previousActiveElementRef.current =
            null;

          hasStoredFocusRef.current =
            false;
        },
        0,
      );

    return () => {
      window.clearTimeout(
        restoreTimer,
      );
    };
  }, [
    isOpen,
    restoreFocus,
  ]);


  /* ==========================================================================
     BACKDROP HANDLERS
  ========================================================================== */

  const handleBackdropMouseDown =
    useCallback(
      (event) => {
        if (
          !closeOnBackdrop
        ) {
          return;
        }

        if (
          isBackdropTarget(
            event,
          )
        ) {
          handleClose();
        }
      },
      [
        closeOnBackdrop,
        handleClose,
      ],
    );


  const handleBackdropClick =
    useCallback(
      (event) => {
        if (
          !closeOnBackdrop
        ) {
          return;
        }

        /**
         * Keyboard/programmatic interaction.
         *
         * Pointer sudah ditangani oleh
         * mouseDown untuk mencegah double close.
         */
        if (
          isBackdropTarget(
            event,
          ) &&
          event.detail === 0
        ) {
          handleClose();
        }
      },
      [
        closeOnBackdrop,
        handleClose,
      ],
    );


  /* ==========================================================================
     HOOK GET BACKDROP PROPS
  ========================================================================== */

  const hookGetBackdropProps =
    useCallback(
      (
        additionalProps = {},
      ) => {
        const {
          ref: callerRef,

          onMouseDown:
            callerOnMouseDown,

          onClick:
            callerOnClick,

          ...rest
        } = additionalProps;


        /* ---------------------------------------------------------------
           MOUSE DOWN
        --------------------------------------------------------------- */

        const combinedMouseDown =
          (event) => {
            safeCall(
              callerOnMouseDown,
              event,
            );

            handleBackdropMouseDown(
              event,
            );
          };


        /* ---------------------------------------------------------------
           CLICK
        --------------------------------------------------------------- */

        const combinedClick =
          (event) => {
            safeCall(
              callerOnClick,
              event,
            );

            handleBackdropClick(
              event,
            );
          };


        /* ---------------------------------------------------------------
           RETURN
        --------------------------------------------------------------- */

        return {
          ...rest,

          /**
           * Ref dari caller punya prioritas.
           */
          ref:
            callerRef ||
            modalRef,

          role:
            rest.role ||
            'presentation',

          onMouseDown:
            combinedMouseDown,

          onClick:
            combinedClick,
        };
      },
      [
        handleBackdropMouseDown,
        handleBackdropClick,
      ],
    );


  /* ==========================================================================
     RETURN API
  ========================================================================== */

  return {
    /* ------------------------------------------------------------------------
       REFS
    ------------------------------------------------------------------------ */

    modalRef,

    /**
     * Alias kompatibilitas.
     */
    dialogRef:
      modalRef,


    /* ------------------------------------------------------------------------
       ACTIONS
    ------------------------------------------------------------------------ */

    handleClose,


    /* ------------------------------------------------------------------------
       BACKDROP
    ------------------------------------------------------------------------ */

    getBackdropProps:
      hookGetBackdropProps,


    /* ------------------------------------------------------------------------
       STATUS
    ------------------------------------------------------------------------ */

    isOpen,
  };
}
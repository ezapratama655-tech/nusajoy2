/**
 * @file src/components/NuSaJoyLogo.jsx
 * NuSaJoy Brand Identity & Logo System
 *
 * Struktur file:
 *   1. Token warna        -> BRAND_COLORS, PALETTES
 *   2. Definisi simbol    -> SYMBOLS
 *   3. Helper SVG         -> getPalette, getLogoSvgDataUri
 *   4. Komponen React     -> NuSaJoySymbol, SymbolConcept1-3,
 *                            NuSaJoyLogo (named + default)
 *
 * Pembagian tugas:
 *   - JSX  : struktur, props, aksesibilitas
 *   - CSS  : warna tema, ukuran, tipografi
 *            -> src/styles/NuSaJoyLogo.css
 *   - PALETTES : dipakai oleh generator SVG data URI.
 *
 * Catatan kompatibilitas:
 *   - Export lama tetap dipertahankan.
 *   - `NuSaJoyLogo` tersedia sebagai named export dan default export.
 *   - `SymbolConcept1`, `SymbolConcept2`, `SymbolConcept3` tetap tersedia.
 */

import "../styles/NuSaJoyLogo.css";

/* React Fast Refresh tidak perlu menganggap helper/constants
   sebagai komponen yang harus dipisahkan ke file lain. */
/* eslint-disable react-refresh/only-export-components */

/* ==========================================================================
   1. TOKEN WARNA
========================================================================== */

export const BRAND_COLORS = {
  green: "#174D36",
  gold: "#C69A3A",
  goldText: "#A47B22",
  sand: "#F4EED8",
  surface: "#FFFDF7",
  mint: "#CFEACB",
  ink: "#17251E",
};

const PALETTES = {
  light: {
    primary: BRAND_COLORS.green,
    accent: BRAND_COLORS.gold,
    bg: "rgba(23,77,54,0.08)",
  },

  dark: {
    primary: "#FFFFFF",
    accent: BRAND_COLORS.mint,
    bg: "rgba(255,255,255,0.12)",
  },

  mono: {
    primary: BRAND_COLORS.ink,
    accent: BRAND_COLORS.ink,
    bg: "transparent",
  },
};

/**
 * Mengambil palette lengkap berdasarkan tema.
 *
 * @param {"light"|"dark"|"mono"} theme
 * @returns {object}
 */
export function getPalette(theme = "light") {
  switch (theme) {
    case "dark":
      return {
        ...PALETTES.dark,
        nusa: "#FFFFFF",
        joy: BRAND_COLORS.mint,
        tagline: "#8FA88C",
      };

    case "mono":
      return {
        primary: "currentColor",
        accent: "currentColor",
        bg: "transparent",
        nusa: "currentColor",
        joy: "currentColor",
        tagline: "currentColor",
      };

    case "light":
    default:
      return {
        ...PALETTES.light,
        nusa: BRAND_COLORS.green,
        joy: BRAND_COLORS.goldText,
        tagline: "#68736D",
      };
  }
}

/* ==========================================================================
   2. DEFINISI SIMBOL
========================================================================== */

/**
 * Sistem simbol menggunakan grid 32x32.
 *
 * tone:
 *   - primary
 *   - accent
 *
 * paint:
 *   - fill
 *   - stroke
 */
const SYMBOLS = {
  1: {
    label: "Simpul Titik Temu",

    shapes: [
      {
        tag: "path",
        tone: "primary",
        paint: "stroke",
        attrs: {
          d: "M8.5 24V11.5C8.5 9.567 10.067 8 12 8H13C14.933 8 16.5 9.567 16.5 11.5V20.5C16.5 22.433 18.067 24 20 24H21C22.933 24 24.5 22.433 24.5 20.5V8",
          fill: "none",
          "stroke-width": 3.2,
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
        },
      },

      {
        tag: "circle",
        tone: "accent",
        paint: "fill",
        attrs: {
          cx: 20.5,
          cy: 11.5,
          r: 2.5,
        },
      },
    ],
  },

  2: {
    label: "Gerbang Budaya Presisi",

    shapes: [
      {
        tag: "rect",
        tone: "primary",
        paint: "fill",
        attrs: {
          x: 7,
          y: 10,
          width: 4.5,
          height: 14,
          rx: 2.25,
        },
      },

      {
        tag: "rect",
        tone: "primary",
        paint: "fill",
        attrs: {
          x: 20.5,
          y: 10,
          width: 4.5,
          height: 14,
          rx: 2.25,
        },
      },

      {
        tag: "path",
        tone: "accent",
        paint: "stroke",
        attrs: {
          d: "M7 13.5C7 8.5 25 8.5 25 13.5",
          fill: "none",
          "stroke-width": 3,
          "stroke-linecap": "round",
        },
      },

      {
        tag: "circle",
        tone: "primary",
        paint: "fill",
        attrs: {
          cx: 16,
          cy: 18,
          r: 2.2,
        },
      },
    ],
  },

  3: {
    label: "Monogram Kurasi",

    shapes: [
      {
        tag: "path",
        tone: "primary",
        paint: "stroke",
        attrs: {
          d: "M8.5 24V9",
          fill: "none",
          "stroke-width": 3.2,
          "stroke-linecap": "round",
        },
      },

      {
        tag: "path",
        tone: "primary",
        paint: "stroke",
        attrs: {
          d: "M9 10L22.5 22.5",
          fill: "none",
          "stroke-width": 3,
          "stroke-linecap": "round",
        },
      },

      {
        tag: "path",
        tone: "accent",
        paint: "stroke",
        attrs: {
          d: "M23 9V19C23 21.76 20.76 24 18 24C16.8 24 15.5 23.3 14.8 22.2",
          fill: "none",
          "stroke-width": 3.2,
          "stroke-linecap": "round",
        },
      },
    ],
  },
};

const DEFAULT_CONCEPT = 1;

/**
 * Daftar ID konsep yang tersedia.
 */
export const CONCEPT_IDS = Object.keys(SYMBOLS).map(Number);

/**
 * Mengambil definisi simbol.
 * Jika concept tidak ditemukan, gunakan konsep default.
 */
function getSymbol(concept) {
  return SYMBOLS[concept] || SYMBOLS[DEFAULT_CONCEPT];
}

/* ==========================================================================
   3. HELPER SVG
========================================================================== */

/**
 * Mengubah nama atribut SVG dari kebab-case
 * menjadi format yang diterima React.
 *
 * Contoh:
 *   stroke-width -> strokeWidth
 *   stroke-linecap -> strokeLinecap
 */
const camelize = (key) =>
  key.replace(/-([a-z])/g, (_, character) => character.toUpperCase());

/**
 * Mengubah object atribut SVG ke object atribut React.
 */
const toReactAttrs = (attrs) =>
  Object.fromEntries(
    Object.entries(attrs).map(([key, value]) => [
      camelize(key),
      value,
    ]),
  );

/**
 * Membuat markup SVG standalone.
 *
 * Digunakan untuk:
 * - favicon
 * - <img src="...">
 * - asset SVG berbasis data URI
 */
function buildSvgMarkup(concept, palette) {
  const symbol = getSymbol(concept);

  const body = symbol.shapes
    .map((shape) => {
      const color =
        shape.tone === "accent"
          ? palette.accent
          : palette.primary;

      const attributes = Object.entries({
        ...shape.attrs,
        [shape.paint]: color,
      })
        .map(
          ([key, value]) => `${key}="${String(value)}"`,
        )
        .join(" ");

      return `<${shape.tag} ${attributes}/>`;
    })
    .join("");

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" ` +
    `viewBox="0 0 32 32" fill="none">` +
    `<rect width="32" height="32" rx="9" fill="${palette.bg}"/>` +
    body +
    `</svg>`
  );
}

/**
 * Menghasilkan data URI SVG untuk favicon atau <img>.
 *
 * @param {number} concept
 * @param {"light"|"dark"|"mono"|boolean} theme
 */
export function getLogoSvgDataUri(
  concept = DEFAULT_CONCEPT,
  theme = "light",
) {
  const resolvedTheme =
    theme === true
      ? "dark"
      : theme === false
        ? "light"
        : theme;

  const palette =
    PALETTES[resolvedTheme] || PALETTES.light;

  const svgMarkup = buildSvgMarkup(
    concept,
    palette,
  );

  return (
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(svgMarkup)
  );
}

/* ==========================================================================
   4. UKURAN
========================================================================== */

const SIZE_PRESETS = {
  sm: {
    symbol: 24,
    text: 17,
  },

  md: {
    symbol: 32,
    text: 22,
  },

  lg: {
    symbol: 48,
    text: 32,
  },
};

const TEXT_RATIO = 22 / 32;

/**
 * Menyelesaikan ukuran logo.
 *
 * @param {"sm"|"md"|"lg"|number} size
 */
function resolveSize(size) {
  if (typeof size === "number" && Number.isFinite(size)) {
    return {
      symbol: size,
      text: Math.round(size * TEXT_RATIO),
    };
  }

  return SIZE_PRESETS[size] || SIZE_PRESETS.md;
}

/* ==========================================================================
   5. UTILITY CLASS
========================================================================== */

const cx = (...parts) =>
  parts
    .filter(Boolean)
    .join(" ");

/* ==========================================================================
   6. NUSAJOY SYMBOL
========================================================================== */

/**
 * Simbol tunggal.
 *
 * Cocok untuk:
 * - favicon
 * - app icon
 * - avatar
 * - icon-only branding
 */
export function NuSaJoySymbol({
  concept = DEFAULT_CONCEPT,
  size = 32,
  theme = "light",
  color,
  accentColor,
  monochrome = false,
  decorative = false,
  className = "",
}) {
  const symbol = getSymbol(concept);

  const activeTheme = monochrome
    ? "mono"
    : theme;

  const style = {};

  if (color) {
    style["--nsj-primary"] = color;
  }

  if (accentColor) {
    style["--nsj-accent"] = accentColor;
  }

  return (
    <svg
      className={cx(
        "nsj-symbol",
        `nsj-theme-${activeTheme}`,
        className,
      )}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...(
        decorative
          ? {
              "aria-hidden": true,
            }
          : {
              role: "img",
              "aria-label": `NuSaJoy Symbol - ${symbol.label}`,
            }
      )}
    >
      <rect
        className="nsj-symbol__bg"
        width="32"
        height="32"
        rx="9"
      />

      {symbol.shapes.map((shape, index) => {
        const Tag = shape.tag;

        return (
          <Tag
            key={`${shape.tag}-${index}`}
            className={cx(
              "nsj-shape",
              `nsj-shape--${shape.tone}`,
              `nsj-shape--${shape.paint}`,
            )}
            {...toReactAttrs(shape.attrs)}
          />
        );
      })}
    </svg>
  );
}

/* ==========================================================================
   7. ALIAS KOMPATIBILITAS
========================================================================== */

export const SymbolConcept1 = (props) => (
  <NuSaJoySymbol
    concept={1}
    {...props}
  />
);

export const SymbolConcept2 = (props) => (
  <NuSaJoySymbol
    concept={2}
    {...props}
  />
);

export const SymbolConcept3 = (props) => (
  <NuSaJoySymbol
    concept={3}
    {...props}
  />
);

/* ==========================================================================
   8. WORDMARK
========================================================================== */

/**
 * Wordmark "NuSaJoy".
 *
 * Konsep 3:
 * - Nu : bold
 * - Sa : medium
 * - Joy : light
 */
function Wordmark({ concept }) {
  if (concept === 3) {
    return (
      <span className="nsj-wordmark nsj-wordmark--rhythm">
        <span className="nsj-wordmark__nu">
          Nu
        </span>

        <span className="nsj-wordmark__sa">
          Sa
        </span>

        <span className="nsj-wordmark__joy">
          Joy
        </span>
      </span>
    );
  }

  return (
    <span className="nsj-wordmark">
      NuSa
      <span className="nsj-wordmark__joy">
        Joy
      </span>
    </span>
  );
}

/* ==========================================================================
   9. NUSAJOY LOGO UTAMA
========================================================================== */

/**
 * Logo utama NuSaJoy.
 *
 * Props:
 *
 * variant:
 *   - primary  -> horizontal
 *   - stacked  -> vertikal
 *   - symbol   -> hanya simbol
 *
 * concept:
 *   - 1
 *   - 2
 *   - 3
 *
 * theme:
 *   - light
 *   - dark
 *   - mono
 *
 * size:
 *   - sm
 *   - md
 *   - lg
 *   - number
 *
 * showTagline:
 *   Menampilkan "Wisata Budaya Lokal"
 *   pada variant stacked.
 */
function NuSaJoyLogo({
  concept = DEFAULT_CONCEPT,
  variant = "primary",
  theme = "light",
  size = "md",
  showTagline = true,
  className = "",
}) {
  const {
    symbol,
    text,
  } = resolveSize(size);

  const rootClass = cx(
    "nsj-logo",
    `nsj-logo--${variant}`,
    `nsj-theme-${theme}`,
    className,
  );

  const rootStyle = {
    "--nsj-symbol-size": `${symbol}px`,
    "--nsj-text-size": `${text}px`,
  };

  return (
    <div
      className={rootClass}
      style={rootStyle}
      role="img"
      aria-label="NuSaJoy"
    >
      <NuSaJoySymbol
        concept={concept}
        size={symbol}
        theme={theme}
        decorative
      />

      {variant !== "symbol" && (
        <Wordmark concept={concept} />
      )}

      {variant === "stacked" &&
        showTagline && (
          <span className="nsj-tagline">
            Wisata Budaya Lokal
          </span>
        )}
    </div>
  );
}

/* ==========================================================================
   10. EXPORT
========================================================================== */

/**
 * Named export.
 *
 * Contoh:
 *   import { NuSaJoyLogo } from "../components/NuSaJoyLogo";
 */
export { NuSaJoyLogo };

/**
 * Default export.
 *
 * Contoh:
 *   import NuSaJoyLogo from "../components/NuSaJoyLogo";
 */
export default NuSaJoyLogo;
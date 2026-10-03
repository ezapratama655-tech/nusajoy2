/**
 * @file src/components/NuSaJoyLogo.jsx
 * NuSaJoy Brand Identity & Logo System
 *
 * Struktur file (dibaca dari atas ke bawah):
 *   1. Token warna        -> BRAND_COLORS, PALETTES
 *   2. Definisi simbol    -> SYMBOLS (bentuk hanya ditulis SEKALI)
 *   3. Helper SVG         -> getPalette, getLogoSvgDataUri (untuk favicon / <img>)
 *   4. Komponen React     -> NuSaJoySymbol, Wordmark, NuSaJoyLogo (default)
 *
 * Pembagian tugas:
 *   - JSX   : struktur, prop, aksesibilitas
 *   - CSS   : warna tema, ukuran, tipografi (src/styles/NuSaJoyLogo.css)
 *   - PALETTES di sini hanya dipakai generator data URI, karena file SVG
 *     mandiri (favicon) tidak bisa membaca CSS halaman.
 *     Jika mengubah warna brand, ubah di BRAND_COLORS DAN di :root pada CSS.
 *
 * Semua export lama dipertahankan agar BrandIdentityModal, Navbar, dan Footer
 * tidak perlu diubah.
 */

import '../styles/NuSaJoyLogo.css';

/* Modul ini sengaja mengekspor helper logo bersama komponennya. */
/* eslint-disable react-refresh/only-export-components */

/* ==========================================================================
   1. TOKEN WARNA
   ========================================================================== */

export const BRAND_COLORS = {
  green: '#174D36',
  gold: '#C69A3A',
  goldText: '#A47B22', // emas lebih tua: kontras teks besar lolos WCAG (~3.3:1 di atas Warm Sand)
  sand: '#F4EED8',
  surface: '#FFFDF7',
  mint: '#CFEACB',
  ink: '#17251E',
};

const PALETTES = {
  light: {
    primary: BRAND_COLORS.green,
    accent: BRAND_COLORS.gold,
    bg: 'rgba(23,77,54,0.08)',
  },
  dark: {
    primary: '#FFFFFF',
    accent: BRAND_COLORS.mint,
    bg: 'rgba(255,255,255,0.12)',
  },
  // Mono untuk data URI: satu warna pekat (ink). Di komponen, mono ikut currentColor via CSS.
  mono: {
    primary: BRAND_COLORS.ink,
    accent: BRAND_COLORS.ink,
    bg: 'transparent',
  },
};

/** Palet lengkap per tema (termasuk warna teks). Dipertahankan untuk kompatibilitas. */
export function getPalette(theme = 'light') {
  if (theme === 'dark') {
    return { ...PALETTES.dark, nusa: '#FFFFFF', joy: BRAND_COLORS.mint, tagline: '#8FA88C' };
  }
  if (theme === 'mono') {
    return {
      primary: 'currentColor',
      accent: 'currentColor',
      bg: 'transparent',
      nusa: 'currentColor',
      joy: 'currentColor',
      tagline: 'currentColor',
    };
  }
  return { ...PALETTES.light, nusa: BRAND_COLORS.green, joy: BRAND_COLORS.goldText, tagline: '#68736D' };
}

/* ==========================================================================
   2. DEFINISI SIMBOL (grid 32x32)
   tone  : 'primary' | 'accent'  -> warna mana yang dipakai
   paint : 'fill' | 'stroke'     -> atribut SVG yang menerima warna
   ========================================================================== */

const SYMBOLS = {
  1: {
    label: 'Simpul Titik Temu',
    shapes: [
      {
        tag: 'path',
        tone: 'primary',
        paint: 'stroke',
        attrs: {
          d: 'M8.5 24V11.5C8.5 9.567 10.067 8 12 8H13C14.933 8 16.5 9.567 16.5 11.5V20.5C16.5 22.433 18.067 24 20 24H21C22.933 24 24.5 22.433 24.5 20.5V8',
          fill: 'none',
          'stroke-width': 3.2,
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
        },
      },
      { tag: 'circle', tone: 'accent', paint: 'fill', attrs: { cx: 20.5, cy: 11.5, r: 2.5 } },
    ],
  },
  2: {
    label: 'Gerbang Budaya Presisi',
    shapes: [
      { tag: 'rect', tone: 'primary', paint: 'fill', attrs: { x: 7, y: 10, width: 4.5, height: 14, rx: 2.25 } },
      { tag: 'rect', tone: 'primary', paint: 'fill', attrs: { x: 20.5, y: 10, width: 4.5, height: 14, rx: 2.25 } },
      {
        tag: 'path',
        tone: 'accent',
        paint: 'stroke',
        attrs: { d: 'M7 13.5C7 8.5 25 8.5 25 13.5', fill: 'none', 'stroke-width': 3, 'stroke-linecap': 'round' },
      },
      { tag: 'circle', tone: 'primary', paint: 'fill', attrs: { cx: 16, cy: 18, r: 2.2 } },
    ],
  },
  3: {
    label: 'Monogram Kurasi',
    shapes: [
      {
        tag: 'path',
        tone: 'primary',
        paint: 'stroke',
        attrs: { d: 'M8.5 24V9', fill: 'none', 'stroke-width': 3.2, 'stroke-linecap': 'round' },
      },
      {
        tag: 'path',
        tone: 'primary',
        paint: 'stroke',
        attrs: { d: 'M9 10L22.5 22.5', fill: 'none', 'stroke-width': 3, 'stroke-linecap': 'round' },
      },
      {
        tag: 'path',
        tone: 'accent',
        paint: 'stroke',
        attrs: {
          d: 'M23 9V19C23 21.76 20.76 24 18 24C16.8 24 15.5 23.3 14.8 22.2',
          fill: 'none',
          'stroke-width': 3.2,
          'stroke-linecap': 'round',
        },
      },
    ],
  },
};

const DEFAULT_CONCEPT = 1;
const getSymbol = (concept) => SYMBOLS[concept] || SYMBOLS[DEFAULT_CONCEPT];

export const CONCEPT_IDS = Object.keys(SYMBOLS).map(Number);

/* ==========================================================================
   3. HELPER SVG (favicon / <img src>)
   ========================================================================== */

const camelize = (key) => key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const toReactAttrs = (attrs) =>
  Object.fromEntries(Object.entries(attrs).map(([key, value]) => [camelize(key), value]));

function buildSvgMarkup(concept, palette) {
  const body = getSymbol(concept)
    .shapes.map((shape) => {
      const color = shape.tone === 'accent' ? palette.accent : palette.primary;
      const attrs = Object.entries({ ...shape.attrs, [shape.paint]: color })
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');
      return `<${shape.tag} ${attrs}/>`;
    })
    .join('');

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">` +
    `<rect width="32" height="32" rx="9" fill="${palette.bg}"/>${body}</svg>`
  );
}

/**
 * Data URI SVG untuk <img> atau <link rel="icon">.
 * `theme`: 'light' | 'dark' | 'mono' (boolean lama: true = dark, false = light).
 */
export function getLogoSvgDataUri(concept = DEFAULT_CONCEPT, theme = 'light') {
  const resolved = theme === true ? 'dark' : theme === false ? 'light' : theme;
  const palette = PALETTES[resolved] || PALETTES.light;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildSvgMarkup(concept, palette))}`;
}

/* ==========================================================================
   4. KOMPONEN REACT
   ========================================================================== */

/** Ukuran preset: simbol (px) dan teks wordmark (px). Angka bebas memakai rasio 0.69. */
const SIZE_PRESETS = {
  sm: { symbol: 24, text: 17 },
  md: { symbol: 32, text: 22 },
  lg: { symbol: 48, text: 32 },
};
const TEXT_RATIO = 22 / 32;

function resolveSize(size) {
  if (typeof size === 'number') return { symbol: size, text: Math.round(size * TEXT_RATIO) };
  return SIZE_PRESETS[size] || SIZE_PRESETS.md;
}

const cx = (...parts) => parts.filter(Boolean).join(' ');

/**
 * Simbol tunggal (favicon / app icon / avatar).
 * Warna mengikuti tema lewat CSS. `color` dan `accentColor` menimpa per-instance.
 */
export function NuSaJoySymbol({
  concept = DEFAULT_CONCEPT,
  size = 32,
  theme = 'light',
  color,
  accentColor,
  monochrome = false,
  decorative = false, // true jika dipakai di dalam logo yang sudah punya label
  className = '',
}) {
  const def = getSymbol(concept);
  const activeTheme = monochrome ? 'mono' : theme;

  const overrides = {};
  if (color) overrides['--nsj-primary'] = color;
  if (accentColor) overrides['--nsj-accent'] = accentColor;

  return (
    <svg
      className={cx('nsj-symbol', `nsj-theme-${activeTheme}`, className)}
      style={overrides}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...(decorative
        ? { 'aria-hidden': true }
        : { role: 'img', 'aria-label': `NuSaJoy Symbol - ${def.label}` })}
    >
      <rect className="nsj-symbol__bg" width="32" height="32" rx="9" />
      {def.shapes.map((shape, index) => {
        const Tag = shape.tag;
        return (
          <Tag
            key={index}
            className={cx('nsj-shape', `nsj-shape--${shape.tone}`, `nsj-shape--${shape.paint}`)}
            {...toReactAttrs(shape.attrs)}
          />
        );
      })}
    </svg>
  );
}

// Alias lama agar import di file lain tidak rusak.
export const SymbolConcept1 = (props) => <NuSaJoySymbol concept={1} {...props} />;
export const SymbolConcept2 = (props) => <NuSaJoySymbol concept={2} {...props} />;
export const SymbolConcept3 = (props) => <NuSaJoySymbol concept={3} {...props} />;

/** Teks "NuSaJoy". Konsep 3 memakai kontras ketebalan Nu (tebal) - Sa (sedang) - Joy (ringan). */
function Wordmark({ concept }) {
  if (concept === 3) {
    return (
      <span className="nsj-wordmark nsj-wordmark--rhythm">
        <span className="nsj-wordmark__nu">Nu</span>
        <span className="nsj-wordmark__sa">Sa</span>
        <span className="nsj-wordmark__joy">Joy</span>
      </span>
    );
  }
  return (
    <span className="nsj-wordmark">
      NuSa<span className="nsj-wordmark__joy">Joy</span>
    </span>
  );
}

/**
 * Logo utama.
 *
 * Prop:
 * - variant     : 'primary' (horizontal) | 'stacked' (vertikal) | 'symbol'
 * - concept     : 1 | 2 | 3
 * - theme       : 'light' (latar terang) | 'dark' (latar hijau/gelap) | 'mono'
 * - size        : 'sm' | 'md' | 'lg' | angka (px simbol; teks ikut proporsional)
 * - showTagline : tampilkan "Wisata Budaya Lokal" pada variant 'stacked'
 * - className   : kelas tambahan dari pemakai (mis. untuk margin)
 *
 * Contoh:
 *   <NuSaJoyLogo />                              // Navbar (latar terang)
 *   <NuSaJoyLogo theme="dark" />                 // Footer (latar gelap)
 *   <NuSaJoyLogo variant="symbol" size={40} />   // Avatar / ikon
 */
export default function NuSaJoyLogo({
  concept = DEFAULT_CONCEPT,
  variant = 'primary',
  theme = 'light',
  size = 'md',
  showTagline = true,
  className = '',
}) {
  const { symbol, text } = resolveSize(size);

  const rootClass = cx('nsj-logo', `nsj-logo--${variant}`, `nsj-theme-${theme}`, className);
  const rootStyle = { '--nsj-symbol-size': `${symbol}px`, '--nsj-text-size': `${text}px` };

  return (
    <div className={rootClass} style={rootStyle} role="img" aria-label="NuSaJoy">
      <NuSaJoySymbol concept={concept} size={symbol} theme={theme} decorative />
      {variant !== 'symbol' && <Wordmark concept={concept} />}
      {variant === 'stacked' && showTagline && <span className="nsj-tagline">Wisata Budaya Lokal</span>}
    </div>
  );
}

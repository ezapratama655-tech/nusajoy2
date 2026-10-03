/**
 * @file src/components/BrandIdentityModal.jsx
 * NuSaJoy Professional Brand Identity & Logo Showcase
 *
 * Fungsi modal:
 * - Memilih 1 dari 3 konsep logo. Pilihan langsung diterapkan ke seluruh
 *   aplikasi lewat onSelectConcept (Navbar, Footer, favicon).
 * - Menguji logo di 3 latar: Warm Sand, Deep Nusa, Surface.
 * - Menampilkan sistem varian: Primary, Stacked, Simbol/Favicon, Monokrom.
 * - BARU: palet warna (klik untuk salin hex), unduh simbol SVG, pratinjau tab browser.
 *
 * Struktur file (dibaca dari atas ke bawah):
 *   1. Data & konstanta       -> CONCEPTS, BACKGROUNDS, PALETTE_NOTES, AUDIT, ...
 *   2. Helper                 -> downloadSvg, copyText
 *   3. Subkomponen            -> ModalHeader, ConceptPicker, PhilosophyCard, ...
 *   4. Komponen utama         -> BrandIdentityModal (hanya merangkai)
 *
 * Styling ada di src/styles/BrandIdentityModal.css (kelas berawalan .bim-).
 *
 * Perbaikan:
 * - Error lint react-hooks/set-state-in-effect: sinkronisasi konsep saat modal
 *   dibuka kini memakai pola "sesuaikan state saat render", bukan useEffect.
 * - Semua hook tetap berada di atas `if (!isOpen) return null` (Rules of Hooks).
 * - Kontrol latar memakai radiogroup (sebelumnya role="tab" tanpa tabpanel).
 */

import { useEffect, useRef, useState } from 'react';
import NuSaJoyLogo, { NuSaJoySymbol, BRAND_COLORS, getLogoSvgDataUri } from './NuSaJoyLogo.jsx';
import useModalBehavior, { getBackdropProps } from '../hooks/useModalBehavior.js';
import '../styles/BrandIdentityModal.css';

/* ==========================================================================
   1. DATA & KONSTANTA
   ========================================================================== */

const CONCEPTS = [
  {
    id: 1,
    title: 'Simpul Titik Temu',
    subtitle: 'The Nusantara Node',
    approach: 'Pendekatan Geometris Simbolik & Konektivitas',
    oneSentence:
      'Satu lintasan lengkung organik membentuk simpul tak terputus dengan sebuah titik temu, tempat pelancong bertemu pencerita lokal.',
    whyNotSlop:
      'Tidak memakai kompas, koper, daun kelapa, atau garis abstrak kosong. Bentuknya terinspirasi simpul persahabatan tradisional yang disederhanakan menjadi satu garis tebal dengan titik emas.',
  },
  {
    id: 2,
    title: 'Gerbang Budaya Presisi',
    subtitle: 'The Cultural Portal',
    approach: 'Pendekatan Arsitektur Warisan Nusantara',
    oneSentence:
      'Abstraksi dua pilar gapura (candi bentar) di bawah lengkung peneduh minimalis, melambangkan pintu masuk menuju ruang hidup masyarakat lokal.',
    whyNotSlop:
      'Tidak menempelkan ornamen batik yang rumit atau klise turistik. Proporsi monumental gapura desa adat diterjemahkan ke grid modern 32x32.',
  },
  {
    id: 3,
    title: 'Monogram Ritme Tiga Suku Kata',
    subtitle: 'The Rhythmic Monogram',
    approach: 'Pendekatan Tipografi Bespoke & Monogram Stempel',
    oneSentence:
      'Ritme tiga suku kata Nu-Sa-Joy diartikulasikan lewat kontras ketebalan huruf Outfit dan monogram NJ yang berfungsi sebagai stempel kurasi.',
    whyNotSlop:
      'Menolak ikon tempelan berlebihan. Kekuatannya ada pada fonetik "NuSaJoy" dan monogram inisial yang terbaca sebagai stempel otentik.',
  },
];

/** Latar uji. `theme` dikirim ke NuSaJoyLogo, `id` menjadi modifier kelas .bim-stage--{id}. */
const BACKGROUNDS = [
  { id: 'sand', label: 'Warm Sand', hex: '#F4EED8', theme: 'light' },
  { id: 'dark', label: 'Deep Nusa', hex: '#174D36', theme: 'dark' },
  { id: 'white', label: 'Surface', hex: '#FFFDF7', theme: 'light' },
];

/** Ukuran simbol yang diuji. `theme: null` berarti ikut tema latar aktif. */
const SYMBOL_TESTS = [
  { label: 'App icon 48px', size: 48, theme: null },
  { label: 'Favicon 32px', size: 32, theme: null },
  { label: 'Tab 16px', size: 16, theme: null },
  { label: 'Monokrom', size: 32, theme: 'mono' },
];

/** Keterangan fungsi tiap warna brand. Hex diambil dari BRAND_COLORS (satu sumber). */
const PALETTE_NOTES = [
  { key: 'green', name: 'Deep Nusa', usage: 'Wordmark "NuSa", tombol utama' },
  { key: 'gold', name: 'Nusa Gold', usage: 'Titik aksen pada simbol' },
  { key: 'goldText', name: 'Gold Text', usage: 'Teks "Joy" (lolos WCAG)' },
  { key: 'sand', name: 'Warm Sand', usage: 'Latar halaman' },
  { key: 'surface', name: 'Surface', usage: 'Kartu dan modal' },
  { key: 'mint', name: 'Mint', usage: 'Aksen di atas latar gelap' },
  { key: 'ink', name: 'Ink', usage: 'Teks dan versi monokrom' },
];

const DOWNLOAD_THEMES = [
  { theme: 'light', label: 'Terang' },
  { theme: 'dark', label: 'Gelap' },
  { theme: 'mono', label: 'Monokrom' },
];

const AUDIT = [
  { title: 'Keterbacaan favicon', text: 'Diuji pada 32px dan 16px (ukuran tab browser); bentuk tetap dikenali.' },
  { title: 'Kekuatan monokrom', text: 'Tidak bergantung pada gradien; tetap kuat dicetak satu warna.' },
  { title: 'Diferensiasi', text: 'Berbeda dari logo bulat generik platform OTA pada umumnya.' },
  { title: 'Bebas AI slop', text: 'Tanpa efek 3D, bevel glossy, atau ikon kompas/gunung/koper/palem klise.' },
  {
    title: 'Kontras wordmark',
    text: '"NuSa" hijau ±8:1 di atas Warm Sand. "Joy" memakai emas tua #A47B22 (±3,3:1) agar lolos syarat teks besar WCAG.',
  },
];

const COPY_FEEDBACK_MS = 1600;

/* ==========================================================================
   2. HELPER
   ========================================================================== */

/** Unduh simbol sebagai file .svg (memakai generator yang sama dengan favicon). */
function downloadSvg(concept, theme) {
  const link = document.createElement('a');
  link.href = getLogoSvgDataUri(concept, theme);
  link.download = `nusajoy-simbol-konsep-${concept}-${theme}.svg`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/** Salin teks ke clipboard. Mengembalikan true jika berhasil. */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false; // contoh: http non-localhost atau izin ditolak
  }
}

const cx = (...parts) => parts.filter(Boolean).join(' ');

/* ==========================================================================
   3. SUBKOMPONEN
   ========================================================================== */

function Icon({ name, className = '' }) {
  return (
    <span className={cx('material-symbols-outlined', className)} aria-hidden="true">
      {name}
    </span>
  );
}

function ModalHeader({ onClose }) {
  return (
    <header className="bim-header">
      <div className="bim-header__text">
        <div className="bim-header__title-row">
          <Icon name="verified" className="bim-header__icon" />
          <h2 className="bim-header__title">Sistem Identitas Brand & Logo NuSaJoy</h2>
        </div>
        <p className="bim-header__desc">Dokumentasi desain identitas: profesional, otentik, bebas AI slop</p>
      </div>
      <button type="button" className="bim-close" onClick={onClose} aria-label="Tutup">
        <Icon name="close" />
      </button>
    </header>
  );
}

function ConceptPicker({ selectedId, onChoose }) {
  return (
    <section className="bim-section" aria-labelledby="bim-concepts-title">
      <h3 id="bim-concepts-title" className="bim-eyebrow">
        Pilih arah konsep (3 pendekatan berbeda)
      </h3>
      <div className="bim-concepts" role="radiogroup" aria-labelledby="bim-concepts-title">
        {CONCEPTS.map((concept) => {
          const isSelected = selectedId === concept.id;
          return (
            <button
              key={concept.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={cx('bim-concept', isSelected && 'bim-concept--selected')}
              onClick={() => onChoose(concept.id)}
            >
              <span className="bim-concept__top">
                <NuSaJoySymbol concept={concept.id} size={28} decorative />
                {isSelected && <span className="bim-concept__badge">Aktif digunakan</span>}
              </span>
              <span className="bim-concept__body">
                <span className="bim-concept__title">{concept.title}</span>
                <span className="bim-concept__approach">{concept.approach}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function PhilosophyCard({ concept }) {
  return (
    <section className="bim-philosophy" aria-live="polite">
      <p className="bim-philosophy__label">
        <Icon name="lightbulb" />
        <span>
          Filosofi inti · {concept.title} ({concept.subtitle})
        </span>
      </p>
      <blockquote className="bim-philosophy__quote">“{concept.oneSentence}”</blockquote>
      <p className="bim-philosophy__note">
        <strong>Kenapa bukan AI slop: </strong>
        {concept.whyNotSlop}
      </p>
    </section>
  );
}

function BackgroundSwitcher({ value, onChange }) {
  return (
    <div className="bim-segmented" role="radiogroup" aria-label="Latar uji">
      {BACKGROUNDS.map((item) => (
        <button
          key={item.id}
          type="button"
          role="radio"
          aria-checked={value === item.id}
          className="bim-segmented__btn"
          onClick={() => onChange(item.id)}
          title={item.hex}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function VariantCell({ title, children }) {
  return (
    <div className="bim-variant">
      <span className="bim-variant__caption">{title}</span>
      <div className="bim-variant__box">{children}</div>
    </div>
  );
}

/** Pratinjau kecil tab browser supaya favicon 16px terlihat dalam konteks nyata. */
function BrowserTabMock({ concept, theme }) {
  return (
    <div className="bim-tab-mock" aria-hidden="true">
      <NuSaJoySymbol concept={concept} size={16} theme={theme} decorative />
      <span className="bim-tab-mock__title">NuSaJoy — Temukan Perjalanan</span>
    </div>
  );
}

function VariantShowcase({ concept, backgroundId, onBackgroundChange }) {
  const stage = BACKGROUNDS.find((b) => b.id === backgroundId) || BACKGROUNDS[0];

  return (
    <section className="bim-section" aria-labelledby="bim-variants-title">
      <div className="bim-showcase-head">
        <div>
          <h3 id="bim-variants-title" className="bim-heading">
            Sistem varian logo
          </h3>
          <p className="bim-hint">Diuji di berbagai latar produk</p>
        </div>
        <BackgroundSwitcher value={backgroundId} onChange={onBackgroundChange} />
      </div>

      <div className={cx('bim-stage', `bim-stage--${stage.id}`)}>
        <div className="bim-variants">
          <VariantCell title="1. Primary lockup (header / web)">
            <NuSaJoyLogo concept={concept} variant="primary" theme={stage.theme} />
          </VariantCell>

          <VariantCell title="2. Stacked lockup (splash / mobile)">
            <NuSaJoyLogo concept={concept} variant="stacked" theme={stage.theme} />
          </VariantCell>

          <VariantCell title="3. Simbol tunggal & favicon">
            <div className="bim-sizes">
              {SYMBOL_TESTS.map((test) => (
                <div key={test.label} className="bim-size">
                  <NuSaJoySymbol
                    concept={concept}
                    size={test.size}
                    theme={test.theme || stage.theme}
                    decorative
                  />
                  <span className="bim-size__label">{test.label}</span>
                </div>
              ))}
            </div>
            <BrowserTabMock concept={concept} theme={stage.theme} />
          </VariantCell>
        </div>
      </div>
    </section>
  );
}

function DownloadPanel({ concept }) {
  return (
    <section className="bim-section" aria-labelledby="bim-download-title">
      <div>
        <h3 id="bim-download-title" className="bim-heading">
          Unduh simbol (SVG)
        </h3>
        <p className="bim-hint">Untuk materi lomba, slide, atau dokumen. Berisi simbol tanpa teks wordmark.</p>
      </div>
      <div className="bim-downloads">
        {DOWNLOAD_THEMES.map((item) => (
          <button
            key={item.theme}
            type="button"
            className="bim-btn bim-btn--ghost"
            onClick={() => downloadSvg(concept, item.theme)}
          >
            <Icon name="download" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function PaletteSection() {
  const [copiedKey, setCopiedKey] = useState(null);
  const timerRef = useRef(null);

  // Bersihkan timer saat modal ditutup agar tidak memanggil setState pada komponen yang sudah lepas.
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleCopy = async (key, hex) => {
    if (!(await copyText(hex))) return;
    setCopiedKey(key);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopiedKey(null), COPY_FEEDBACK_MS);
  };

  const copied = PALETTE_NOTES.find((n) => n.key === copiedKey);

  return (
    <section className="bim-section" aria-labelledby="bim-palette-title">
      <div>
        <h3 id="bim-palette-title" className="bim-heading">
          Palet warna brand
        </h3>
        <p className="bim-hint">Klik warna untuk menyalin kode hex.</p>
      </div>
      <ul className="bim-palette">
        {PALETTE_NOTES.map(({ key, name, usage }) => {
          const hex = BRAND_COLORS[key];
          const isCopied = copiedKey === key;
          return (
            <li key={key}>
              <button
                type="button"
                className="bim-swatch"
                onClick={() => handleCopy(key, hex)}
                aria-label={`Salin ${name} ${hex}`}
              >
                <span className="bim-swatch__chip" style={{ backgroundColor: hex }} />
                <span className="bim-swatch__info">
                  <span className="bim-swatch__name">{name}</span>
                  <span className="bim-swatch__hex">{isCopied ? 'Tersalin' : hex.toUpperCase()}</span>
                  <span className="bim-swatch__usage">{usage}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="bim-sr-only" role="status">
        {copied ? `${copied.name} ${BRAND_COLORS[copied.key]} tersalin` : ''}
      </p>
    </section>
  );
}

function QualityAudit() {
  return (
    <section className="bim-section" aria-labelledby="bim-audit-title">
      <h3 id="bim-audit-title" className="bim-heading">
        Hasil uji kualitas identitas brand
      </h3>
      <ul className="bim-audit">
        {AUDIT.map(({ title, text }) => (
          <li key={title} className="bim-audit__item">
            <Icon name="check_circle" className="bim-audit__icon" />
            <span>
              <strong>{title}:</strong> {text}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ModalFooter({ onClose }) {
  return (
    <footer className="bim-footer">
      <p className="bim-footer__note">
        Konsep yang kamu pilih langsung diterapkan pada Navbar, Footer, dan ikon tab browser.
      </p>
      <button type="button" className="bim-btn bim-btn--primary" onClick={onClose}>
        <Icon name="check" />
        <span>Simpan & tutup</span>
      </button>
    </footer>
  );
}

/* ==========================================================================
   4. KOMPONEN UTAMA
   ========================================================================== */

export default function BrandIdentityModal({ isOpen, onClose, activeConcept = 1, onSelectConcept }) {
  const [selectedConcept, setSelectedConcept] = useState(activeConcept);
  const [backgroundId, setBackgroundId] = useState('sand');
  const [wasOpen, setWasOpen] = useState(isOpen);

  useModalBehavior(isOpen, onClose);

  // Sinkronkan pilihan lokal dengan konsep aktif aplikasi setiap modal DIBUKA.
  // Pola resmi React "sesuaikan state saat render": menggantikan useEffect + setState
  // yang memicu error lint `set-state-in-effect` dan render berlapis.
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setSelectedConcept(activeConcept);
  }

  if (!isOpen) return null;

  const current = CONCEPTS.find((c) => c.id === selectedConcept) || CONCEPTS[0];

  const chooseConcept = (id) => {
    setSelectedConcept(id);
    onSelectConcept?.(id); // langsung diterapkan ke Navbar, Footer, dan favicon
  };

  return (
    <div
      className="bim-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Sistem Identitas Brand NuSaJoy"
      {...getBackdropProps(onClose)}
    >
      <div className="bim-dialog">
        <ModalHeader onClose={onClose} />

        <div className="bim-body">
          <ConceptPicker selectedId={selectedConcept} onChoose={chooseConcept} />
          <PhilosophyCard concept={current} />
          <VariantShowcase
            concept={selectedConcept}
            backgroundId={backgroundId}
            onBackgroundChange={setBackgroundId}
          />
          <DownloadPanel concept={selectedConcept} />
          <PaletteSection />
          <QualityAudit />
        </div>

        <ModalFooter onClose={onClose} />
      </div>
    </div>
  );
}

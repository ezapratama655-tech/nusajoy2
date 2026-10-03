/**
 * @file src/components/Footer.jsx
 * NuSaJoy Global Footer
 *
 * - Kolom tautan berbasis data (FOOTER_COLUMNS), tidak lagi disalin-tempel per item.
 * - Item tanpa `section` ditampilkan sebagai teks "Segera hadir" (bukan tautan palsu).
 * - `pb-20 lg:pb-0` agar isi footer tidak tertutup bottom navigation di mobile.
 * - Callback: onNavigateSection(sectionId, label). Id section: lihat SECTION_TARGETS.
 */

import NuSaJoyLogo from './NuSaJoyLogo.jsx';

const FOOTER_COLUMNS = [
  {
    title: 'Jelajah Nusantara',
    links: [
      { label: 'Desa Wisata Adat', section: 'jelajah' },
      { label: 'Kuliner Warisan', section: 'jelajah' },
      { label: 'Kriya & Budaya Hidup', section: 'jelajah' },
      { label: 'Rute Hidden Gem', section: 'jelajah' },
      { label: 'Ekspedisi Alam Liar', section: 'jelajah' },
    ],
  },
  {
    title: 'Dampak & Mitra',
    links: [
      { label: 'Gabung Pemandu Lokal', section: 'akun-mitra' },
      { label: 'Kemitraan UMKM Desa', section: 'akun-mitra' },
      { label: 'Dana Konservasi Budaya' },
      { label: 'Cerita Perubahan' },
      { label: 'Panduan Etika Tamu', section: 'akun-bantuan' },
    ],
  },
  {
    title: 'Bantuan & Legal',
    links: [
      { label: 'Pusat Bantuan', section: 'akun-bantuan' },
      { label: 'Kebijakan Privasi' },
      { label: 'Ketentuan Layanan' },
      { label: 'Standar Keselamatan' },
      { label: 'Kontak Tim NuSaJoy', section: 'akun-bantuan' },
    ],
  },
];

const SOCIALS = ['Instagram', 'YouTube', 'Spotify Narasi Budaya'];

export default function Footer({ onNavigateSection, brandConcept = 1, onOpenBrandModal }) {
  return (
    <footer className="w-full bg-[#FFFDF7] border-t border-[#DDE2D9] mt-auto pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Info brand */}
          <div className="lg:col-span-2 pr-4">
            <div className="flex items-center gap-2 mb-3">
              <NuSaJoyLogo concept={brandConcept} size="sm" />
              {onOpenBrandModal && (
                <button
                  type="button"
                  onClick={onOpenBrandModal}
                  className="ml-2 text-[11px] text-[#68736D] hover:text-[#174D36] underline cursor-pointer"
                >
                  Brand System
                </button>
              )}
            </div>
            <p className="text-[14px] text-[#68736D] max-w-sm mb-4 leading-relaxed">
              Platform personalisasi wisata lokal autentik nusantara. Menghubungkan pelancong sadar budaya
              dengan pemandu lokal, tradisi hidup, dan petualangan berdaya.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#CFEACB] text-[#174D36] text-[12px] font-semibold">
              <span className="material-symbols-outlined text-[15px]">eco</span>
              Pariwisata Berkelanjutan & Komunitas 100% Lokal
            </div>
          </div>

          {/* Kolom tautan */}
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h4 className="text-[15px] font-bold text-[#17251E] mb-3 font-['Outfit']">{column.title}</h4>
              <ul className="space-y-2 text-[14px] text-[#68736D]">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.section ? (
                      <button
                        type="button"
                        onClick={() => onNavigateSection?.(link.section, link.label)}
                        className="hover:text-[#174D36] transition-colors cursor-pointer text-left"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <span title="Segera hadir" className="cursor-default opacity-80">
                        {link.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bar bawah */}
        <div className="pt-6 border-t border-[#DDE2D9] flex flex-col sm:flex-row items-center justify-between gap-4 text-[#68736D] text-[13px]">
          <p>Â© {new Date().getFullYear()} NuSaJoy Indonesia. Hak cipta dilindungi undang-undang.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {SOCIALS.map((name) => (
              <span key={name} title="Segera hadir" className="cursor-default">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

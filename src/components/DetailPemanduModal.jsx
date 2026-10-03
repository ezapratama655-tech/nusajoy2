/**
 * @file src/components/DetailPemanduModal.jsx
 * NuSaJoy Detail Pemandu Wisata Lokal
 *
 * Aturan Bagian 3 & 6:
 * - "Tambah ke Perjalanan" terhubung nyata ke My Trip, dengan konfirmasi + "Buka My Trip".
 * - Memakai Booking Summary universal yang sama (onOpenBookingSummary).
 * - Desktop: kartu booking sticky di kanan. Mobile: bar sticky di bawah.
 *
 * Perbaikan: hooks di atas early return, banner sukses reset saat pemandu berganti,
 * duplikasi handler desktop/mobile dijadikan satu, kontainer scroll di dalam modal
 * (bar atas/bawah selalu terlihat di mobile), tombol berubah jadi "Buka My Trip"
 * bila pemandu sudah ada di trip.
 */

import { useEffect, useState } from 'react';
import useModalBehavior, { getBackdropProps } from '../hooks/useModalBehavior.js';
import { getItemPrice, getItemPriceLabel, guideToTripItem } from '../utils/format.js';

// PLACEHOLDER: ganti dengan ulasan asli lewat `guide.featuredReview = { text, author }`.
const buildFallbackReview = (guide) => ({
  text: `Menjelajah bersama ${guide.name} terasa seperti diajak berkeliling oleh sahabat lama di kampung halaman. Beliau menceritakan filosofi arsitektur dan mengajak kami mencicipi jajanan yang tidak ada di Google Maps!`,
  author: 'Rian S. (Wisatawan dari Jakarta, Agustus 2026)',
});

export default function DetailPemanduModal({
  isOpen,
  onClose,
  guide,
  onAddToTrip,
  onOpenBookingSummary,
  onGoToMyTrip,
  isFavorited = false,
  onToggleFavorite,
  isInTrip = false,
}) {
  const [addedSuccess, setAddedSuccess] = useState(false);

  useModalBehavior(isOpen && Boolean(guide), onClose);

  useEffect(() => {
    setAddedSuccess(false);
  }, [guide?.id, isOpen]);

  if (!isOpen || !guide) return null;

  const inTrip = isInTrip || addedSuccess;
  const priceLabel = getItemPriceLabel(guide);
  const review = guide.featuredReview || buildFallbackReview(guide);

  const handleAddTrip = () => {
    onAddToTrip?.(guideToTripItem(guide));
    setAddedSuccess(true);
  };

  const handleGoToMyTrip = () => {
    onClose?.();
    onGoToMyTrip?.();
  };

  const handleBook = () =>
    onOpenBookingSummary?.({
      title: `Pendampingan Wisata bersama ${guide.name}`,
      location: guide.location,
      price: getItemPrice(guide),
      guide,
      name: guide.name,
      type: 'guide',
      meetingPoint: `Dikoordinasikan langsung bersama ${guide.name}`,
    });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Detail pemandu ${guide.name}`}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4"
      {...getBackdropProps(onClose)}
    >
      <div className="bg-[#FFFDF7] h-dvh sm:h-auto sm:max-h-[92vh] sm:rounded-[28px] max-w-4xl w-full overflow-hidden shadow-2xl border border-[#DDE2D9] flex flex-col">
        {/* Bar atas */}
        <div className="bg-[#FFFDF7] px-5 py-3.5 border-b border-[#DDE2D9] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[13px] font-bold text-[#174D36] font-['Plus_Jakarta_Sans']">Pemandu Wisata Budaya</span>
            <span className="text-[#68736D] text-xs">·</span>
            <span className="text-[13px] font-medium text-[#68736D] truncate">{guide.city}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onToggleFavorite?.(guide)}
              aria-pressed={isFavorited}
              className="p-2 rounded-xl text-[#68736D] hover:text-[#B5653A] hover:bg-[#FAF4DD] transition-colors cursor-pointer"
              title={isFavorited ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
              aria-label={isFavorited ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
            >
              <span className={`material-symbols-outlined text-xl ${isFavorited ? 'icon-fill text-[#B5653A]' : ''}`}>
                favorite
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#68736D] hover:text-[#17251E] hover:bg-[#EEE8D2] transition-colors cursor-pointer"
              title="Tutup"
              aria-label="Tutup"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Banner sukses */}
        {addedSuccess && (
          <div
            role="status"
            className="bg-[#CFEACB] border-b border-[#8FA88C] px-5 py-3 flex items-center justify-between gap-3 text-[#174D36] text-[13px] font-medium shrink-0"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">task_alt</span>
              <span>
                Pemandu <strong>{guide.name}</strong> ditambahkan ke My Trip.
              </span>
            </div>
            <button
              type="button"
              onClick={handleGoToMyTrip}
              className="px-3 py-1 bg-[#174D36] text-white rounded-lg text-xs font-semibold hover:bg-[#0F3524] transition-colors cursor-pointer shrink-0"
            >
              Buka My Trip
            </button>
          </div>
        )}

        {/* Isi yang bisa di-scroll */}
        <div className="overflow-y-auto flex-1 min-h-0 p-5 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Kiri */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6 bg-[#FAF4DD] rounded-[22px] border border-[#DDE2D9]">
                <img
                  src={guide.avatar}
                  alt={guide.name}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-[#174D36] shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-['Outfit'] text-[22px] font-bold text-[#17251E]">{guide.name}</h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#CFEACB] text-[#174D36] text-[11px] font-bold">
                      <span className="material-symbols-outlined text-xs">verified</span>
                      Terverifikasi
                    </span>
                  </div>
                  <p className="text-[14px] text-[#68736D]">{guide.role}</p>
                  <p className="text-[13px] text-[#174D36] font-medium flex items-center gap-1.5 pt-1">
                    <span className="material-symbols-outlined icon-fill text-sm text-[#C69A3A]">star</span>
                    <strong>{guide.rating}</strong> ({guide.reviewCount} ulasan) · <strong>{guide.tripsCount}+</strong>{' '}
                    perjalanan
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-[18px] bg-white border border-[#DDE2D9] space-y-2">
                <span className="text-[12px] font-bold text-[#B5653A]">Sertifikasi & etika warga</span>
                <div className="flex items-center gap-2 text-[13px] text-[#17251E]">
                  <span className="material-symbols-outlined text-[#174D36] text-base">badge</span>
                  <span>{guide.license || 'Lisensi Resmi Himpunan Pramuwisata Indonesia'}</span>
                </div>
                <div className="flex items-center gap-2 text-[13px] text-[#68736D]">
                  <span className="material-symbols-outlined text-[#174D36] text-base">diversity_3</span>
                  <span>Lulus Pelatihan Tata Krama Komunitas Adat & Protokol Keamanan Tamu</span>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="font-['Outfit'] text-[18px] font-bold text-[#17251E]">Cerita & latar belakang</h2>
                <p className="text-[15px] text-[#68736D] leading-relaxed">
                  {guide.bio || 'Pemandu lokal berdedikasi tinggi yang lahir dan dibesarkan di lingkungan budaya setempat.'}
                </p>
              </div>

              {guide.specialties?.length > 0 && (
                <div className="space-y-2.5">
                  <h2 className="font-['Outfit'] text-[18px] font-bold text-[#17251E]">Fokus & keahlian khusus</h2>
                  <div className="flex flex-wrap gap-2">
                    {guide.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="px-3.5 py-1.5 rounded-full bg-[#FAF4DD] border border-[#DDE2D9] text-[#17251E] text-[13px] font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <figure className="bg-[#FAF4DD]/70 rounded-[20px] p-5 border border-[#DDE2D9] space-y-3">
                <figcaption className="font-['Outfit'] text-[16px] font-bold text-[#17251E]">Ulasan pelancong</figcaption>
                <blockquote className="text-[13px] text-[#68736D] italic leading-relaxed">“{review.text}”</blockquote>
                <p className="text-[12px] font-semibold text-[#17251E]">— {review.author}</p>
              </figure>
            </div>

            {/* Kanan: kartu booking sticky (desktop) */}
            <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-0 self-start">
              <div className="bg-[#FAF4DD] rounded-[24px] p-6 border border-[#DDE2D9] shadow-lg space-y-5">
                <div>
                  <span className="text-[12px] text-[#68736D] block">Tarif pendampingan</span>
                  <span className="font-['Outfit'] text-[26px] font-bold text-[#174D36] block mt-1">{priceLabel}</span>
                  <p className="text-[11px] text-[#68736D] mt-1">100% langsung disalurkan ke pemandu tanpa potongan agen</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-[#DDE2D9]">
                  <button
                    type="button"
                    onClick={inTrip ? handleGoToMyTrip : handleAddTrip}
                    className="w-full py-3.5 px-4 rounded-[14px] bg-[#174D36] hover:bg-[#0F3524] text-white font-semibold text-[14px] flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">{inTrip ? 'luggage' : 'add_location_alt'}</span>
                    <span>{inTrip ? 'Sudah di My Trip, buka' : 'Tambah ke Perjalanan'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBook}
                    className="w-full py-3 px-4 rounded-[14px] bg-white hover:bg-[#FFFDF7] text-[#174D36] font-semibold text-[14px] border border-[#174D36] flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">bolt</span>
                    <span>Pesan Pemandu Sekarang</span>
                  </button>
                </div>

                <div className="pt-2 text-[12px] text-[#68736D] space-y-1.5 border-t border-[#DDE2D9]/80">
                  <div className="flex items-center gap-2 text-[#174D36]">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    <span>Tarif adil & bermartabat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">forum</span>
                    <span>Koordinasi WhatsApp langsung setelah konfirmasi</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Bar bawah (mobile) */}
        <div className="lg:hidden bg-[#FFFDF7] border-t border-[#DDE2D9] px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] shrink-0">
          <div>
            <span className="text-[11px] text-[#68736D] block">Tarif</span>
            <span className="font-['Outfit'] text-[17px] font-bold text-[#174D36]">{priceLabel}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={inTrip ? handleGoToMyTrip : handleAddTrip}
              className="py-2.5 px-3.5 rounded-xl bg-[#FAF4DD] hover:bg-[#EEE8D2] text-[#174D36] font-semibold text-[13px] border border-[#DDE2D9] flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">{inTrip ? 'luggage' : 'add_location_alt'}</span>
              <span>{inTrip ? 'My Trip' : '+ Trip'}</span>
            </button>
            <button
              type="button"
              onClick={handleBook}
              className="py-2.5 px-4 rounded-xl bg-[#174D36] hover:bg-[#0F3524] text-white font-semibold text-[13px] shadow-sm cursor-pointer"
            >
              Pesan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

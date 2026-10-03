/**
 * @file src/components/DetailPengalamanModal.jsx
 * NuSaJoy Detail Pengalaman (Pure JavaScript)
 * 
 * Aturan Bagian 3 & 6:
 * - Tombol "Tambah ke Perjalanan" terhubung nyata ke My Trip.
 * - Konfirmasi visual jelas dengan opsi "Buka My Trip Sekarang".
 * - Desktop: Ringkasan booking sticky di kanan.
 * - Mobile: Sticky bar di bagian bawah layar.
 * - Booking langsung memicu komponen Booking Summary universal.
 */

import React, { useState } from 'react';

export default function DetailPengalamanModal({
  isOpen,
  onClose,
  experience,
  onAddToTrip,
  onOpenBookingSummary,
  onOpenGuideDetail,
  onGoToMyTrip,
  isFavorited,
  onToggleFavorite,
}) {
  if (!isOpen || !experience) return null;

  const [addedSuccess, setAddedSuccess] = useState(false);

  const handleAddTrip = () => {
    if (onAddToTrip) {
      onAddToTrip(experience);
    }
    setAddedSuccess(true);
    setTimeout(() => {
      // Keep feedback visible until user closes or clicks
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4">
      <div className="bg-[#FFFDF7] min-h-screen sm:min-h-0 sm:max-h-[92vh] sm:rounded-[28px] max-w-5xl w-full overflow-hidden shadow-2xl border border-[#DDE2D9] flex flex-col relative">
        
        {/* Top Floating Control Bar */}
        <div className="sticky top-0 z-20 bg-[#FFFDF7]/90 backdrop-blur-md px-5 py-3.5 border-b border-[#DDE2D9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#B5653A] font-['Plus_Jakarta_Sans']">
              {experience.category || 'Budaya Lokal'}
            </span>
            <span className="text-[#68736D] text-xs">·</span>
            <span className="text-[13px] font-medium text-[#68736D]">
              {experience.city || 'Indonesia'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite && onToggleFavorite(experience)}
              className="p-2 rounded-xl text-[#68736D] hover:text-[#B5653A] hover:bg-[#FAF4DD] transition-colors cursor-pointer"
              title="Simpan ke Favorit"
            >
              <span className={`material-symbols-outlined text-xl ${isFavorited ? 'text-[#B5653A] fill-current' : ''}`}>
                {isFavorited ? 'favorite' : 'favorite_border'}
              </span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#68736D] hover:text-[#17251E] hover:bg-[#EEE8D2] transition-colors cursor-pointer"
              title="Tutup"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Success Alert Banner when added to My Trip */}
        {addedSuccess && (
          <div className="bg-[#CFEACB] border-b border-[#8FA88C] px-5 py-3 flex items-center justify-between gap-3 text-[#174D36] text-[13px] font-medium animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-[#174D36]">task_alt</span>
              <span>Berhasil ditambahkan ke rencana <strong>My Trip</strong>!</span>
            </div>
            <button
              onClick={() => {
                onClose();
                if (onGoToMyTrip) onGoToMyTrip();
              }}
              className="px-3 py-1 bg-[#174D36] text-white rounded-lg text-xs font-semibold hover:bg-[#0F3524] transition-colors cursor-pointer"
            >
              Buka My Trip →
            </button>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT MAIN CONTENT (8 cols on desktop) */}
            <div className="lg:col-span-8 space-y-7">
              {/* Hero Image */}
              <div className="relative rounded-[22px] overflow-hidden aspect-[16/10] bg-[#EEE8D2] shadow-sm">
                <img
                  src={experience.image}
                  alt={experience.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-[#FFFDF7]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <span className="material-symbols-outlined text-sm text-[#C69A3A]">star</span>
                  <span className="text-[13px] font-bold text-[#17251E]">{experience.rating || 4.9}</span>
                  <span className="text-[12px] text-[#68736D]">({experience.reviewCount || 100}+ ulasan)</span>
                </div>
              </div>

              {/* Title & Metadata */}
              <div>
                <h1 className="font-['Outfit'] text-[24px] sm:text-[30px] font-bold text-[#17251E] leading-snug">
                  {experience.title}
                </h1>
                <p className="text-[14px] text-[#68736D] mt-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-[#174D36]">location_on</span>
                  {experience.location}
                </p>
              </div>

              {/* Quick Specs Cards */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-[#FAF4DD] rounded-[18px] border border-[#DDE2D9]">
                <div className="text-center">
                  <span className="material-symbols-outlined text-xl text-[#174D36] block mb-1">schedule</span>
                  <span className="text-[11px] text-[#68736D] block">Durasi</span>
                  <strong className="text-[13px] text-[#17251E]">{experience.durationText || '3-4 Jam'}</strong>
                </div>
                <div className="text-center border-x border-[#DDE2D9]">
                  <span className="material-symbols-outlined text-xl text-[#174D36] block mb-1">group</span>
                  <span className="text-[11px] text-[#68736D] block">Grup Intim</span>
                  <strong className="text-[13px] text-[#17251E]">Maks. {experience.maxGuests || 6} orang</strong>
                </div>
                <div className="text-center">
                  <span className="material-symbols-outlined text-xl text-[#174D36] block mb-1">translate</span>
                  <span className="text-[11px] text-[#68736D] block">Bahasa</span>
                  <strong className="text-[13px] text-[#17251E]">Indonesia & Lokal</strong>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h2 className="font-['Outfit'] text-[18px] font-bold text-[#17251E]">
                  Tentang Pengalaman Ini
                </h2>
                <p className="text-[15px] text-[#68736D] leading-relaxed">
                  {experience.description}
                </p>
              </div>

              {/* Highlights */}
              {experience.highlights && (
                <div className="space-y-3">
                  <h2 className="font-['Outfit'] text-[18px] font-bold text-[#17251E]">
                    Yang Akan Kamu Rasakan
                  </h2>
                  <ul className="space-y-2.5">
                    {experience.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-[14px] text-[#17251E]">
                        <span className="material-symbols-outlined text-[#174D36] text-lg shrink-0 mt-0.5">check_circle</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pemandu Lokal Card */}
              {experience.guide && (
                <div className="bg-[#FAF4DD] rounded-[20px] p-5 border border-[#DDE2D9] space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#B5653A]">
                    Pemandu Berlisensi
                  </span>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={experience.guide.avatar}
                        alt={experience.guide.name}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-[#174D36]"
                      />
                      <div>
                        <h3 className="font-['Outfit'] text-[16px] font-bold text-[#17251E]">
                          {experience.guide.name}
                        </h3>
                        <p className="text-[13px] text-[#68736D]">{experience.guide.role}</p>
                        <p className="text-[12px] text-[#174D36] font-medium mt-0.5">
                          ★ {experience.guide.rating} · {experience.guide.tripsCount}+ tur dipandu
                        </p>
                      </div>
                    </div>
                    {onOpenGuideDetail && (
                      <button
                        onClick={() => onOpenGuideDetail(experience.guide)}
                        className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#EEE8D2] text-[#174D36] font-semibold text-[13px] border border-[#DDE2D9] transition-all cursor-pointer shrink-0"
                      >
                        Lihat Profil
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Meeting Point & What is Included */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-[18px] bg-white border border-[#DDE2D9] space-y-2">
                  <h3 className="font-['Outfit'] text-[15px] font-bold text-[#17251E] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#174D36]">pin_drop</span>
                    Titik Kumpul
                  </h3>
                  <p className="text-[13px] text-[#68736D] leading-relaxed">
                    {experience.meetingPoint || 'Akan dikoordinasikan langsung bersama pemandu via WhatsApp.'}
                  </p>
                </div>

                <div className="p-4 rounded-[18px] bg-white border border-[#DDE2D9] space-y-2">
                  <h3 className="font-['Outfit'] text-[15px] font-bold text-[#17251E] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#174D36]">inventory_2</span>
                    Fasilitas Termasuk
                  </h3>
                  <ul className="text-[13px] text-[#68736D] space-y-1">
                    {(experience.included || ['Pemandu lokal pencerita', 'Cicipan khas daerah', 'Donasi konservasi cagar budaya']).map((inc, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#174D36]"></span>
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR (Desktop Sticky Booking Summary, 4 cols) */}
            <div className="hidden lg:block lg:col-span-4 sticky top-20">
              <div className="bg-[#FAF4DD] rounded-[24px] p-6 border border-[#DDE2D9] shadow-lg space-y-5">
                <div>
                  <span className="text-[12px] text-[#68736D] block">Tarif Pengalaman</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-['Outfit'] text-[28px] font-bold text-[#174D36]">
                      {experience.priceFormatted || `Rp${(experience.price || 95000).toLocaleString('id-ID')}`}
                    </span>
                    <span className="text-[13px] text-[#68736D]">/ orang</span>
                  </div>
                  <p className="text-[11px] text-[#8FA88C] mt-1">
                    Sudah termasuk 2.5% Dana Konservasi Budaya
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-[#DDE2D9]">
                  {/* TOMBOL UTAMA: TAMBAH KE PERJALANAN (FUNCTIONAL REAL CONNECTION) */}
                  <button
                    onClick={handleAddTrip}
                    className="w-full py-3.5 px-4 rounded-[14px] bg-[#174D36] hover:bg-[#0F3524] text-white font-semibold text-[14px] flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">add_location_alt</span>
                    <span>Tambah ke Perjalanan</span>
                  </button>

                  {/* TOMBOL KEDUA: PESAN SEKARANG (DIRECT BOOKING FLOW) */}
                  <button
                    onClick={() => {
                      if (onOpenBookingSummary) {
                        onOpenBookingSummary({
                          ...experience,
                          type: 'experience',
                        });
                      }
                    }}
                    className="w-full py-3 px-4 rounded-[14px] bg-white hover:bg-[#FFFDF7] text-[#174D36] font-semibold text-[14px] border border-[#174D36] flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">bolt</span>
                    <span>Pesan Langsung</span>
                  </button>
                </div>

                <div className="pt-2 text-[12px] text-[#68736D] space-y-1.5 border-t border-[#DDE2D9]/80">
                  <div className="flex items-center gap-2 text-[#174D36]">
                    <span className="material-symbols-outlined text-sm">lock</span>
                    <span>Konfirmasi instan tanpa biaya tersembunyi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">event_repeat</span>
                    <span>Gratis pembatalan hingga 24 jam sebelumnya</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* MOBILE STICKY BAR (Aturan Bagian 6) */}
        <div className="lg:hidden sticky bottom-0 bg-[#FFFDF7] border-t border-[#DDE2D9] px-5 py-3.5 flex items-center justify-between gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] z-30">
          <div>
            <span className="text-[11px] text-[#68736D] block">Mulai dari</span>
            <span className="font-['Outfit'] text-[18px] font-bold text-[#174D36]">
              {experience.priceFormatted || `Rp${(experience.price || 95000).toLocaleString('id-ID')}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddTrip}
              className="py-2.5 px-3.5 rounded-xl bg-[#FAF4DD] hover:bg-[#EEE8D2] text-[#174D36] font-semibold text-[13px] border border-[#DDE2D9] flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">add_location_alt</span>
              <span>+ Trip</span>
            </button>
            <button
              onClick={() => {
                if (onOpenBookingSummary) {
                  onOpenBookingSummary({
                    ...experience,
                    type: 'experience',
                  });
                }
              }}
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

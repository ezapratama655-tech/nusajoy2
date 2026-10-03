/**
 * @file src/components/FavoritModal.jsx
 * NuSaJoy Favorit Modal
 *
 * Aturan Bagian 2 & 5:
 * - Diakses lewat ikon Favorit di header kanan atas.
 * - Punya state Normal dan state Kosong (ramah, dengan CTA eksplorasi).
 *
 * Perbaikan: hooks di atas early return; filter "Pengalaman" tidak lagi ikut memuat pemandu
 * (memakai isGuideItem); ada empty state khusus filter; item pemandu membuka detail pemandu;
 * "+ Trip" memakai item ter-normalisasi dan menampilkan status "Di Trip";
 * onRemoveFavorite kini menerima OBJEK item (kunci favorit dihitung di useFavorites).
 */

import React, { useMemo, useState } from 'react';
import useModalBehavior, { getBackdropProps } from '../hooks/useModalBehavior.js';
import { getFavoriteKey } from '../hooks/useFavorites.js';
import { getItemPriceLabel, isGuideItem } from '../utils/format.js';

const FILTERS = [
  { id: 'all', label: 'Semua' },
  { id: 'experience', label: 'Pengalaman' },
  { id: 'guide', label: 'Pemandu' },
];

export default function FavoritModal({
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
  const [activeFilter, setActiveFilter] = useState('all');

  useModalBehavior(isOpen, onClose);

  useEffect(() => {
    if (isOpen) setActiveFilter('all');
  }, [isOpen]);

  const counts = useMemo(() => {
    const guides = favorites.filter(isGuideItem).length;
    return { all: favorites.length, guide: guides, experience: favorites.length - guides };
  }, [favorites]);

  const filtered = useMemo(
    () =>
      favorites.filter((item) => {
        if (activeFilter === 'guide') return isGuideItem(item);
        if (activeFilter === 'experience') return !isGuideItem(item);
        return true;
      }),
    [favorites, activeFilter],
  );

  if (!isOpen) return null;

  const openItem = (item) => {
    onClose?.();
    if (isGuideItem(item)) (onSelectGuide || onSelectExperience)?.(item);
    else onSelectExperience?.(item);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Favorit tersimpan"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      {...getBackdropProps(onClose)}
    >
      <div className="bg-[#FFFDF7] rounded-[24px] max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-[#DDE2D9]">
        {/* Header */}
        <div className="p-5 border-b border-[#DDE2D9] flex items-center justify-between bg-[#FAF4DD] shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined icon-fill text-2xl text-[#B5653A]">favorite</span>
            <div>
              <h3 className="font-['Outfit'] text-[18px] font-bold text-[#17251E]">
                Favorit tersimpan ({favorites.length})
              </h3>
              <p className="text-[12px] text-[#68736D]">Pengalaman dan pemandu yang kamu minati</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-1.5 rounded-full text-[#68736D] hover:text-[#17251E] hover:bg-[#EEE8D2] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Filter */}
        {favorites.length > 0 && (
          <div className="px-5 py-3 border-b border-[#DDE2D9] flex flex-wrap gap-2 shrink-0" role="tablist" aria-label="Filter favorit">
            {FILTERS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeFilter === tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-[#174D36] text-white shadow-xs'
                    : 'bg-[#FAF4DD] text-[#68736D] hover:text-[#17251E]'
                }`}
              >
                {tab.label} ({counts[tab.id]})
              </button>
            ))}
          </div>
        )}

        {/* Daftar / state kosong */}
        <div className="overflow-y-auto flex-1 min-h-0 p-5 space-y-3.5">
          {favorites.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FAF4DD] text-[#B5653A] mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">favorite</span>
              </div>
              <div className="max-w-xs mx-auto">
                <h4 className="font-['Outfit'] text-[17px] font-bold text-[#17251E]">Belum ada favorit tersimpan</h4>
                <p className="text-[13px] text-[#68736D] mt-1.5 leading-relaxed">
                  Sentuh ikon hati pada kartu pengalaman atau pemandu lokal untuk menyimpannya di sini.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose?.();
                  onNavigateExplore?.();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[14px] bg-[#174D36] hover:bg-[#0F3524] text-white text-[13px] font-semibold transition-all cursor-pointer shadow-sm"
              >
                <span>Mulai jelajahi pengalaman</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-3">
              <h4 className="font-['Outfit'] text-[16px] font-bold text-[#17251E]">
                Belum ada {activeFilter === 'guide' ? 'pemandu' : 'pengalaman'} di favorit
              </h4>
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className="text-[13px] font-semibold text-[#174D36] underline cursor-pointer"
              >
                Tampilkan semua favorit
              </button>
            </div>
          ) : (
            filtered.map((item) => {
              const inTrip = Boolean(isInTrip?.(item));
              const name = item.title || item.name;
              return (
                <div
                  key={getFavoriteKey(item)}
                  className="p-3.5 rounded-[18px] bg-white border border-[#DDE2D9] hover:border-[#174D36] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => openItem(item)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
                  >
                    <img
                      src={item.image || item.avatar}
                      alt={name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <span className="min-w-0">
                      <span className="block font-['Outfit'] text-[15px] font-bold text-[#17251E] line-clamp-1">{name}</span>
                      <span className="block text-[12px] text-[#68736D]">
                        {isGuideItem(item) ? 'Pemandu Â· ' : ''}
                        {item.location || item.city} Â· â˜… {item.rating ?? 4.9}
                      </span>
                      <span className="block text-[13px] font-bold text-[#174D36] mt-0.5 font-['Outfit']">
                        {getItemPriceLabel(item)}
                      </span>
                    </span>
                  </button>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => !inTrip && onAddToTrip?.(item)}
                      disabled={inTrip}
                      className={`px-3 py-1.5 rounded-xl font-semibold text-[12px] flex items-center gap-1 transition-all ${
                        inTrip
                          ? 'bg-[#CFEACB] text-[#174D36] cursor-default'
                          : 'bg-[#FAF4DD] hover:bg-[#CFEACB] text-[#174D36] cursor-pointer'
                      }`}
                      title={inTrip ? 'Sudah ada di My Trip' : 'Tambah ke My Trip'}
                    >
                      <span className="material-symbols-outlined text-sm">{inTrip ? 'check' : 'add_location_alt'}</span>
                      <span>{inTrip ? 'Di Trip' : '+ Trip'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveFavorite?.(item)}
                      aria-label={`Hapus ${name} dari favorit`}
                      className="p-1.5 rounded-xl text-[#68736D] hover:text-[#B5653A] hover:bg-[#FAF4DD] transition-colors cursor-pointer"
                      title="Hapus"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

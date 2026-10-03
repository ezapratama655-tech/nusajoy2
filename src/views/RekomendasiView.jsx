/**
 * @file src/views/RekomendasiView.jsx
 * NuSaJoy Rekomendasi / Smart Matcher Screen (Pure JavaScript)
 * 
 * Mengimplementasikan alur 'Match' dari alur Discover, Match, Plan, Book:
 * - Algoritma personalisasi mencocokkan waktu luang, ritme perjalanan, dan budget.
 * - Match Badge persen kecocokan seragam di semua kartu.
 * - Mendukung 4 state (Normal, Kosong, Loading, Error).
 */

import { useState, useMemo } from 'react';
import { EXPERIENCES_DATA } from '../data/mockData.js';
import { calculateMatchScore } from '../utils/recommendation.js';

export default function RekomendasiView({
  onSelectExperience,
  onAddToTrip,
  onSaveFavorite,
  isFavorited,
  uiState = 'normal',
  onRetry,
}) {
  const [selectedCity, setSelectedCity] = useState('Yogyakarta');
  const [selectedDuration, setSelectedDuration] = useState('halfday'); // '2-4h' | 'halfday' | 'fullday' | 'multiday'
  const [selectedRhythm, setSelectedRhythm] = useState('santai'); // 'santai' | 'sedang' | 'aktif'
  const [selectedInterest, setSelectedInterest] = useState('Kuliner'); // 'Kuliner' | 'Kriya' | 'Sejarah' | 'Teduh'
  const [selectedBudget, setSelectedBudget] = useState('menengah'); // 'hemat' | 'menengah' | 'nyaman'

  // Hitung hasil rekomendasi dengan algoritma Matcher
  const matchedResults = useMemo(() => {
    return EXPERIENCES_DATA.map((item) => {
      const score = calculateMatchScore(item, {
        city: selectedCity,
        rhythm: selectedRhythm,
        interest: selectedInterest,
        budgetTier: selectedBudget,
      });
      return {
        ...item,
        computedMatch: score,
      };
    }).sort((a, b) => b.computedMatch - a.computedMatch);
  }, [selectedCity, selectedRhythm, selectedInterest, selectedBudget]);

  // STATE ERROR (Bagian 5)
  if (uiState === 'error') {
    return (
      <div className="max-w-4xl mx-auto px-5 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#FFDAD6] text-[#BA1A1A] mx-auto flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl">sync_problem</span>
        </div>
        <h2 className="font-['Outfit'] text-[24px] font-bold text-[#17251E]">
          Mesin Pencocokan Mengalami Kendala
        </h2>
        <p className="text-[14px] text-[#68736D] max-w-md mx-auto leading-relaxed">
          Tidak dapat menghitung skor personalisasi rute saat ini.
        </p>
        <button
          onClick={onRetry}
          className="px-6 py-3 rounded-[14px] bg-[#174D36] text-white font-semibold text-[14px] inline-flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined text-base">refresh</span>
          <span>Coba Hitung Ulang</span>
        </button>
      </div>
    );
  }

  // STATE LOADING (Bagian 5)
  if (uiState === 'loading') {
    return (
      <div className="max-w-7xl mx-auto px-5 py-12 space-y-8 animate-pulse">
        <div className="h-44 bg-[#EEE8D2] rounded-[24px]"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-[#EEE8D2] rounded-[24px]"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8 lg:py-12 bg-[#F4EED8] min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="max-w-3xl space-y-2">
          <span className="text-[12px] font-bold uppercase tracking-wider text-[#B5653A]">
            Personalisasi Akurat
          </span>
          <h1 className="font-['Outfit'] text-[28px] sm:text-[38px] font-bold text-[#17251E] leading-tight">
            Rekomendasi Berdasarkan Ritme Hidupmu
          </h1>
          <p className="text-[15px] text-[#68736D] leading-relaxed">
            Sesuaikan parameter di bawah ini. NuSaJoy akan mencocokkan waktu luang, preferensi kuliner, dan ritme napasmu dengan pengalaman warga terbaik.
          </p>
        </div>

        {/* Interactive Matcher Control Box */}
        <div className="bg-[#FFFDF7] rounded-[28px] p-6 sm:p-8 shadow-sm border border-[#DDE2D9] space-y-6">
          <div className="flex items-center gap-2 text-[#174D36] font-['Outfit'] text-[17px] font-bold pb-2 border-b border-[#DDE2D9]">
            <span className="material-symbols-outlined text-[#C69A3A]">tune</span>
            <span>Parameter Personalisasi Perjalanan</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
            
            {/* Kota Tujuan */}
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[#17251E] block uppercase tracking-wider">
                1. Kota Tujuan
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[14px] bg-[#FAF4DD] border border-[#DDE2D9] text-[14px] font-medium text-[#17251E] outline-none cursor-pointer focus:border-[#174D36]"
              >
                <option value="Yogyakarta">Yogyakarta & Sekitarnya</option>
                <option value="Bali">Bali (Sidemen & Karangasem)</option>
                <option value="Bandung">Bandung (Pangalengan)</option>
                <option value="Lombok">Lombok (Desa Sade)</option>
                <option value="Semarang">Semarang (Kota Lama)</option>
              </select>
            </div>

            {/* Waktu Luang */}
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[#17251E] block uppercase tracking-wider">
                2. Waktu Luang
              </label>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[14px] bg-[#FAF4DD] border border-[#DDE2D9] text-[14px] font-medium text-[#17251E] outline-none cursor-pointer focus:border-[#174D36]"
              >
                <option value="2-4h">2 - 4 Jam (Singkat & Padat)</option>
                <option value="halfday">Setengah Hari (4 - 6 Jam)</option>
                <option value="fullday">Seharian Penuh (8 Jam)</option>
                <option value="multiday">2 - 3 Hari (Itinerary Lengkap)</option>
              </select>
            </div>

            {/* Ritme Perjalanan */}
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[#17251E] block uppercase tracking-wider">
                3. Ritme Perjalanan
              </label>
              <div className="grid grid-cols-3 gap-1 bg-[#FAF4DD] p-1 rounded-[14px] border border-[#DDE2D9]">
                {[
                  { id: 'santai', label: 'Santai' },
                  { id: 'sedang', label: 'Seimbang' },
                  { id: 'aktif', label: 'Aktif' },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRhythm(r.id)}
                    className={`py-2 text-[12px] font-semibold rounded-xl transition-all cursor-pointer ${
                      selectedRhythm === r.id
                        ? 'bg-[#174D36] text-white shadow-xs'
                        : 'text-[#68736D] hover:text-[#17251E]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Minat Utama */}
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[#17251E] block uppercase tracking-wider">
                4. Minat Utama
              </label>
              <select
                value={selectedInterest}
                onChange={(e) => setSelectedInterest(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[14px] bg-[#FAF4DD] border border-[#DDE2D9] text-[14px] font-medium text-[#17251E] outline-none cursor-pointer focus:border-[#174D36]"
              >
                <option value="Kuliner">Kuliner Warisan & Kopi</option>
                <option value="Kriya">Lokakarya Kriya & Keramik</option>
                <option value="Walking">Walking Tour & Narasi Sejarah</option>
                <option value="Teduh">Wisata Alam & Perkebunan Teduh</option>
              </select>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[#17251E] block uppercase tracking-wider">
                5. Budget
              </label>
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[14px] bg-[#FAF4DD] border border-[#DDE2D9] text-[14px] font-medium text-[#17251E] outline-none cursor-pointer focus:border-[#174D36]"
              >
                <option value="hemat">Hemat</option>
                <option value="menengah">Menengah</option>
                <option value="nyaman">Nyaman</option>
              </select>
            </div>

          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-['Outfit'] text-[22px] sm:text-[26px] font-bold text-[#17251E]">
                Hasil Kecocokan Tertinggi
              </h2>
              <p className="text-[14px] text-[#68736D]">
                Diurutkan berdasarkan skor kecocokan algoritma personalisasi untuk {selectedCity}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#CFEACB] text-[#174D36] text-[12px] font-bold">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              <span>Matching Aktif</span>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchedResults.map((exp, idx) => (
              <div
                key={exp.id}
                className={`bg-[#FFFDF7] rounded-[24px] overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col group border ${
                  idx === 0 ? 'border-[#174D36] ring-2 ring-[#174D36]/20' : 'border-[#DDE2D9]'
                }`}
              >
                {/* Image */}
                <div
                  className="relative h-60 overflow-hidden cursor-pointer bg-[#EEE8D2]"
                  onClick={() => onSelectExperience(exp)}
                >
                  <img
                    src={exp.image}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Top Match Highlight Tag */}
                  {idx === 0 && (
                    <span className="absolute top-4 left-4 bg-[#C69A3A] text-white text-[11px] px-3 py-1 rounded-full font-bold shadow-xs">
                      Pilihan Teratas Untukmu
                    </span>
                  )}

                  {/* Universal Match Badge */}
                  <span className="absolute top-4 right-4 bg-[#174D36] text-white text-[12px] px-3 py-1 rounded-full font-bold shadow-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-[#C69A3A]">auto_awesome</span>
                    <span>{exp.computedMatch}% Cocok</span>
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-[#68736D] text-[12px] mb-2.5">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      <span>{exp.durationText}</span>
                      <span>•</span>
                      <span>{exp.category}</span>
                    </div>

                    <h3
                      onClick={() => onSelectExperience(exp)}
                      className="font-['Outfit'] text-[17px] font-bold text-[#17251E] group-hover:text-[#174D36] transition-colors leading-snug cursor-pointer mb-2"
                    >
                      {exp.title}
                    </h3>
                    
                    <p className="text-[13px] text-[#68736D] leading-relaxed line-clamp-2">
                      {exp.description}
                    </p>
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-4 border-t border-[#DDE2D9] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#68736D] block">Tarif Mulai</span>
                      <span className="font-['Outfit'] text-[18px] text-[#174D36] font-bold">
                        {exp.priceFormatted}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onSaveFavorite?.(exp)}
                        aria-label={typeof isFavorited === 'function' && isFavorited(exp.id) ? 'Hapus favorit' : 'Simpan favorit'}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          typeof isFavorited === 'function' && isFavorited(exp.id)
                            ? 'bg-[#174D36] text-white'
                            : 'bg-[#FAF4DD] text-[#174D36] hover:bg-[#CFEACB]'
                        }`}
                        title={typeof isFavorited === 'function' && isFavorited(exp.id) ? 'Hapus dari favorit' : 'Simpan ke favorit'}
                      >
                        <span className="material-symbols-outlined text-base">
                          {typeof isFavorited === 'function' && isFavorited(exp.id) ? 'favorite' : 'favorite_border'}
                        </span>
                      </button>

                      <button
                        onClick={() => onAddToTrip(exp)}
                        className="px-3.5 py-2 rounded-xl bg-[#FAF4DD] hover:bg-[#CFEACB] text-[#174D36] font-semibold text-[12px] flex items-center gap-1 transition-all cursor-pointer"
                        title="Tambah ke My Trip"
                      >
                        <span className="material-symbols-outlined text-base">add_location_alt</span>
                        <span>+ Trip</span>
                      </button>

                      <button
                        onClick={() => onSelectExperience(exp)}
                        className="bg-[#174D36] hover:bg-[#0F3524] text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
                      >
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

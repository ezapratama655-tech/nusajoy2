/**
 * @file src/views/JelajahView.jsx
 * NuSaJoy Jelajah (Explore) Screen (Pure JavaScript)
 * 
 * Aturan Bagian 4 & 5:
 * - Konsistensi kartu pengalaman (Experience Card) dan Match Badge (#174D36 / #C69A3A).
 * - Mendukung 4 State: Normal, Kosong (0 hasil dengan tombol Reset), Loading (Skeleton), Error (Retry).
 * - Terhubung langsung ke Detail Pengalaman dan My Trip.
 */

import { useState, useMemo } from 'react';
import { EXPERIENCES_DATA } from '../data/mockData.js';

export default function JelajahView({
  onSelectExperience,
  onAddToTrip,
  onSaveFavorite,
  isFavorited,
  uiState = 'normal',
  onRetry,
}) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedCity, setSelectedCity] = useState('Semua');
  const [sortBy, setSortBy] = useState('match');
  const [savedFeedbackMap, setSavedFeedbackMap] = useState({});

  const categories = ['Semua', 'Kuliner Tradisi', 'Wisata Teduh', 'Lokakarya Kriya', 'Walking Tour'];
  const cities = ['Semua', 'Yogyakarta', 'Bali', 'Bandung', 'Lombok', 'Semarang'];

  // Filter & Sort logic
  const filteredList = useMemo(() => {
    return EXPERIENCES_DATA.filter((item) => {
      const matchKeyword =
        !searchKeyword ||
        item.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.location.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.description.toLowerCase().includes(searchKeyword.toLowerCase());

      const matchCat =
        selectedCategory === 'Semua' || item.category === selectedCategory;

      const matchCity =
        selectedCity === 'Semua' || item.city.toLowerCase() === selectedCity.toLowerCase();

      return matchKeyword && matchCat && matchCity;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return (b.matchScore || 90) - (a.matchScore || 90);
    });
  }, [searchKeyword, selectedCategory, selectedCity, sortBy]);

  const handleSave = (exp) => {
    onSaveFavorite(exp);
    setSavedFeedbackMap((prev) => ({ ...prev, [exp.id]: true }));
    setTimeout(() => {
      setSavedFeedbackMap((prev) => ({ ...prev, [exp.id]: false }));
    }, 2000);
  };

  // STATE ERROR (Bagian 5)
  if (uiState === 'error') {
    return (
      <div className="max-w-4xl mx-auto px-5 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#FFDAD6] text-[#BA1A1A] mx-auto flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl">cloud_off</span>
        </div>
        <h2 className="font-['Outfit'] text-[24px] font-bold text-[#17251E]">
          Gagal Memuat Katalog Jelajah
        </h2>
        <p className="text-[14px] text-[#68736D] max-w-md mx-auto leading-relaxed">
          Terjadi kendala saat menyinkronkan daftar pengalaman lokal terkini.
        </p>
        <button
          onClick={onRetry}
          className="px-6 py-3 rounded-[14px] bg-[#174D36] text-white font-semibold text-[14px] inline-flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined text-base">refresh</span>
          <span>Coba Muat Ulang</span>
        </button>
      </div>
    );
  }

  // STATE LOADING (Bagian 5)
  if (uiState === 'loading') {
    return (
      <div className="max-w-7xl mx-auto px-5 py-12 space-y-8 animate-pulse">
        <div className="h-14 bg-[#EEE8D2] rounded-2xl max-w-md"></div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 w-24 bg-[#EEE8D2] rounded-full"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-[#EEE8D2] rounded-[24px]"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8 lg:py-12 bg-[#F4EED8] min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 space-y-8">
        
        {/* Page Title & Search Header */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#B5653A]">
                Eksplorasi Kurasi
              </span>
              <h1 className="font-['Outfit'] text-[28px] sm:text-[36px] font-bold text-[#17251E] mt-1">
                Jelajah Pengalaman Lokal
              </h1>
              <p className="text-[14px] text-[#68736D] mt-1">
                Menampilkan {filteredList.length} aktivitas autentik bersama warga dan pemandu lokal
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-[#FFFDF7] px-3.5 py-2 rounded-xl border border-[#DDE2D9] self-start md:self-end">
              <span className="text-[12px] font-semibold text-[#68736D]">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-[13px] font-bold text-[#174D36] outline-none cursor-pointer"
              >
                <option value="match">Paling Cocok (Rekomendasi)</option>
                <option value="rating">Rating Tertinggi</option>
                <option value="price-low">Harga: Rendah ke Tinggi</option>
                <option value="price-high">Harga: Tinggi ke Rendah</option>
              </select>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-[#FFFDF7] rounded-2xl p-2.5 shadow-sm border border-[#DDE2D9] flex items-center gap-3">
            <span className="material-symbols-outlined text-[#717973] pl-2">search</span>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Cari nama desa, pemandu, aktivitas kriya, atau kuliner..."
              className="w-full bg-transparent outline-none text-[14px] text-[#17251E] placeholder:text-[#68736D]"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className="p-1 rounded-full text-[#68736D] hover:text-[#17251E] cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
          </div>

          {/* Filter Chips - Categories & Cities */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            {/* Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#174D36] text-white shadow-xs'
                      : 'bg-[#FFFDF7] text-[#68736D] hover:text-[#17251E] border border-[#DDE2D9]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* City Filter Pills */}
            <div className="flex items-center gap-1.5 text-[12px] text-[#68736D] overflow-x-auto pb-1">
              <span className="font-semibold text-[#17251E] mr-1">Kota:</span>
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-2.5 py-1 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${
                    selectedCity === city
                      ? 'bg-[#CFEACB] text-[#174D36] font-bold'
                      : 'hover:bg-[#FFFDF7] text-[#68736D]'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Grid or Empty State */}
        {filteredList.length === 0 ? (
          /* STATE KOSONG (Bagian 5) */
          <div className="bg-[#FFFDF7] rounded-[28px] border border-[#DDE2D9] p-12 text-center max-w-xl mx-auto space-y-4 my-8">
            <div className="w-16 h-16 rounded-full bg-[#FAF4DD] text-[#B5653A] mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">travel_explore</span>
            </div>
            <h3 className="font-['Outfit'] text-[20px] font-bold text-[#17251E]">
              Tidak Ada Pengalaman yang Cocok
            </h3>
            <p className="text-[14px] text-[#68736D] leading-relaxed">
              Tidak ditemukan aktivitas untuk filter atau kata kunci "{searchKeyword || selectedCategory}". Coba atur ulang pencarian kamu.
            </p>
            <button
              onClick={() => {
                setSearchKeyword('');
                setSelectedCategory('Semua');
                setSelectedCity('Semua');
              }}
              className="px-5 py-2.5 rounded-[14px] bg-[#174D36] text-white text-[13px] font-semibold hover:bg-[#0F3524] transition-all cursor-pointer"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          /* STATE NORMAL: Grid Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredList.map((exp) => (
              <div
                key={exp.id}
                className="bg-[#FFFDF7] rounded-[24px] overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col group border border-[#DDE2D9]"
              >
                {/* Image & Match Badge */}
                <div
                  className="relative h-60 overflow-hidden cursor-pointer bg-[#EEE8D2]"
                  onClick={() => onSelectExperience(exp)}
                >
                  <img
                    src={exp.image}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Rating Pill */}
                  <span className="absolute top-4 left-4 bg-[#FFFDF7]/95 backdrop-blur-md text-[#17251E] text-[12px] px-3 py-1 rounded-full font-bold shadow-xs flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#C69A3A]">star</span>
                    <span>{exp.rating} · {exp.city}</span>
                  </span>

                  {/* Match Badge (Bagian 4: Seragam warna & bentuk) */}
                  <span className="absolute top-4 right-4 bg-[#174D36] text-white text-[11px] px-2.5 py-1 rounded-full font-bold shadow-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-[#C69A3A]">auto_awesome</span>
                    <span>{exp.matchScore || 95}% Cocok</span>
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-[#68736D] text-[12px] mb-2.5">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      <span>{exp.durationText}</span>
                      <span>•</span>
                      <span>Maks. {exp.maxGuests} tamu</span>
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

                  {/* Pricing & Functional Actions */}
                  <div className="pt-4 border-t border-[#DDE2D9] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#68736D] block">Mulai dari</span>
                      <span className="font-['Outfit'] text-[18px] text-[#174D36] font-bold">
                        {exp.priceFormatted}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Tambah ke My Trip Button */}
                      <button
                        onClick={() => onAddToTrip(exp)}
                        className="p-2 rounded-xl bg-[#FAF4DD] hover:bg-[#CFEACB] text-[#174D36] transition-all cursor-pointer"
                        title="Tambah ke My Trip"
                      >
                        <span className="material-symbols-outlined text-lg">add_location_alt</span>
                      </button>

                      {/* Detail Button */}
                      <button
                        onClick={() => onSelectExperience(exp)}
                        className="bg-white hover:bg-[#FAF4DD] border border-[#DDE2D9] text-[#17251E] text-[13px] font-semibold px-3 py-2 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
                      >
                        Detail
                      </button>

                      {/* Simpan Favorite */}
                      <button
                        onClick={() => handleSave(exp)}
                        className={`p-2 rounded-xl border border-[#DDE2D9] transition-all cursor-pointer ${
                          savedFeedbackMap[exp.id] || isFavorited(exp.id)
                            ? 'bg-[#CFEACB] text-[#174D36]'
                            : 'bg-white hover:bg-[#FAF4DD] text-[#68736D]'
                        }`}
                        title="Simpan ke Favorit"
                      >
                        <span className={`material-symbols-outlined text-lg ${isFavorited(exp.id) ? 'fill-current text-[#B5653A]' : ''}`}>
                          {isFavorited(exp.id) ? 'favorite' : 'bookmark_add'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

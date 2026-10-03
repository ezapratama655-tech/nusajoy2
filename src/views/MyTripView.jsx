/**
 * @file src/views/MyTripView.jsx
 * NuSaJoy My Trip Control Center (Pure JavaScript)
 * 
 * Aturan Bagian 3 & 6:
 * - Pusat kendali, bukan halaman statis.
 * - Itinerary per hari dengan estimasi waktu & jarak transportasi.
 * - Ringkasan budget yang berubah otomatis secara dinamis.
 * - Item yang baru ditambahkan tampil paling atas dengan badge 'Baru Ditambahkan'.
 * - Desktop: 2 kolom (itinerary kiri, sticky budget & peta kanan).
 * - Mobile: Tab Itinerary dan Tab Peta/Budget yang dapat berpindah.
 * - Jalur utama rekomendasi Penginapan & Transportasi lokal.
 */

import { useState } from 'react';
import { STAYS_DATA, TRANSPORTS_DATA } from '../data/mockData.js';

export default function MyTripView({
  trip,
  onRemoveTripItem,
  onOpenBookingSummary,
  onNavigateExplore,
  uiState = 'normal',
  onRetry,
}) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [mobileTab, setMobileTab] = useState('itinerary'); // 'itinerary' | 'budget_map'
  const [selectedStay] = useState(STAYS_DATA[0]);
  const [selectedTransport] = useState(TRANSPORTS_DATA[0]);

  // STATE ERROR (Bagian 5)
  if (uiState === 'error') {
    return (
      <div className="max-w-4xl mx-auto px-5 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#FFDAD6] text-[#BA1A1A] mx-auto flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl">error</span>
        </div>
        <h2 className="font-['Outfit'] text-[24px] font-bold text-[#17251E]">
          Gagal Memuat Jadwal Perjalanan
        </h2>
        <p className="text-[14px] text-[#68736D] max-w-md mx-auto leading-relaxed">
          Terjadi kesalahan saat memproses data itinerary kamu.
        </p>
        <button
          onClick={onRetry}
          className="px-6 py-3 rounded-[14px] bg-[#174D36] text-white font-semibold text-[14px] inline-flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined text-base">refresh</span>
          <span>Coba Lagi</span>
        </button>
      </div>
    );
  }

  // STATE LOADING (Bagian 5)
  if (uiState === 'loading') {
    return (
      <div className="max-w-7xl mx-auto px-5 py-12 space-y-8 animate-pulse">
        <div className="h-28 bg-[#EEE8D2] rounded-[24px]"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <div className="h-44 bg-[#EEE8D2] rounded-[20px]"></div>
            <div className="h-44 bg-[#EEE8D2] rounded-[20px]"></div>
          </div>
          <div className="lg:col-span-4 h-96 bg-[#EEE8D2] rounded-[24px]"></div>
        </div>
      </div>
    );
  }

  // STATE KOSONG (Bagian 5)
  if (uiState === 'empty' || !trip || !trip.items || trip.items.length === 0) {
    return (
      <div className="w-full py-16 px-5 min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#F4EED8]">
        <div className="bg-[#FFFDF7] rounded-[28px] border border-[#DDE2D9] p-8 sm:p-12 text-center max-w-lg w-full space-y-5 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-[#FAF4DD] text-[#174D36] mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl">luggage</span>
          </div>
          <div>
            <h2 className="font-['Outfit'] text-[24px] font-bold text-[#17251E]">
              Belum Ada Rencana Perjalanan
            </h2>
            <p className="text-[14px] text-[#68736D] mt-2 leading-relaxed">
              Kamu belum menyusun aktivitas untuk trip ini. Jelajahi katalog pengalaman lokal atau gunakan Smart Matcher untuk rekomendasi cepat.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigateExplore('jelajah')}
              className="flex-1 py-3 px-4 rounded-[14px] bg-[#174D36] hover:bg-[#0F3524] text-white font-semibold text-[13px] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">explore</span>
              <span>Jelajah Destinasi</span>
            </button>
            <button
              onClick={() => onNavigateExplore('rekomendasi')}
              className="flex-1 py-3 px-4 rounded-[14px] bg-[#FAF4DD] hover:bg-[#EEE8D2] text-[#174D36] font-semibold text-[13px] border border-[#DDE2D9] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">auto_awesome</span>
              <span>Coba Matcher</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Perhitungan Dinamis Real-Time (Bagian 3: Ringkasan Budget yang Berubah Otomatis)
  const itemsList = trip.items || [];
  
  // Sort agar item yang baru ditambahkan (isNew) tampil paling atas
  const sortedItems = [...itemsList].sort((a, b) => {
    if (a.isNew && !b.isNew) return -1;
    if (!a.isNew && b.isNew) return 1;
    return a.day - b.day;
  });

  const dayFilteredItems = sortedItems.filter((item) => item.day === selectedDay);

  const totalExperienceCost = itemsList.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const stayCost = selectedStay ? selectedStay.pricePerNight * 1 : 0;
  const transportCost = selectedTransport ? selectedTransport.pricePerTrip : 0;
  const conservationFund = Math.round((totalExperienceCost + stayCost) * 0.025);
  const grandTotal = totalExperienceCost + stayCost + transportCost + conservationFund;

  return (
    <div className="w-full py-8 lg:py-12 bg-[#F4EED8] min-h-[calc(100vh-80px)]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 space-y-8">
        
        {/* Active Trip Header */}
        <div className="bg-[#FFFDF7] rounded-[24px] p-6 sm:p-8 border border-[#DDE2D9] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CFEACB] text-[#174D36] text-[12px] font-bold">
              <span className="material-symbols-outlined text-sm">flight_takeoff</span>
              <span>Trip Aktif Disusun</span>
            </div>
            <h1 className="font-['Outfit'] text-[24px] sm:text-[32px] font-bold text-[#17251E]">
              {trip.title}
            </h1>
            <p className="text-[14px] text-[#68736D] flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#174D36]">calendar_month</span>
              <span>{trip.dates}</span>
              <span>•</span>
              <span>{trip.city}</span>
              <span>•</span>
              <strong className="text-[#174D36]">{itemsList.length} Aktivitas</strong>
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => onNavigateExplore('jelajah')}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-[14px] bg-[#FAF4DD] hover:bg-[#EEE8D2] text-[#174D36] text-[13px] font-semibold border border-[#DDE2D9] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>Tambah Aktivitas</span>
            </button>
            <button
              onClick={() => {
                onOpenBookingSummary({
                  title: trip.title,
                  location: trip.city,
                  price: grandTotal,
                  guestsCount: 1,
                  type: 'trip',
                });
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-[14px] bg-[#174D36] hover:bg-[#0F3524] text-white text-[13px] font-semibold shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">shopping_cart_checkout</span>
              <span>Pesan Seluruh Rute</span>
            </button>
          </div>
        </div>

        {/* MOBILE VIEW TABS (Bagian 6 Requirement) */}
        <div className="lg:hidden flex bg-[#FFFDF7] p-1.5 rounded-2xl border border-[#DDE2D9]">
          <button
            onClick={() => setMobileTab('itinerary')}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mobileTab === 'itinerary'
                ? 'bg-[#174D36] text-white shadow-xs'
                : 'text-[#68736D]'
            }`}
          >
            <span className="material-symbols-outlined text-base">view_timeline</span>
            <span>Itinerary Harian</span>
          </button>
          <button
            onClick={() => setMobileTab('budget_map')}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mobileTab === 'budget_map'
                ? 'bg-[#174D36] text-white shadow-xs'
                : 'text-[#68736D]'
            }`}
          >
            <span className="material-symbols-outlined text-base">calculate</span>
            <span>Ringkasan Budget & Peta</span>
          </button>
        </div>

        {/* 2-COLUMN DESKTOP LAYOUT (Bagian 6: Itinerary di kiri, budget/peta sticky di kanan) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: ITINERARY (8 cols) */}
          <div className={`space-y-6 lg:col-span-7 xl:col-span-8 ${mobileTab === 'budget_map' ? 'hidden lg:block' : 'block'}`}>
            
            {/* Day Selector Pills */}
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-bold text-[#17251E]">Jadwal Hari:</span>
              {[1, 2].map((dayNum) => (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDay(dayNum)}
                  className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
                    selectedDay === dayNum
                      ? 'bg-[#174D36] text-white shadow-xs'
                      : 'bg-[#FFFDF7] text-[#68736D] hover:text-[#17251E] border border-[#DDE2D9]'
                  }`}
                >
                  Hari {dayNum} ({dayNum === 1 ? 'Kotagede' : 'Bantul Selatan'})
                </button>
              ))}
            </div>

            {/* Timeline Cards for Selected Day */}
            <div className="space-y-4">
              {dayFilteredItems.length === 0 ? (
                <div className="bg-[#FFFDF7] p-8 rounded-[20px] border border-[#DDE2D9] text-center space-y-3">
                  <p className="text-[14px] text-[#68736D]">
                    Belum ada kegiatan yang dijadwalkan pada Hari {selectedDay}.
                  </p>
                  <button
                    onClick={() => onNavigateExplore('jelajah')}
                    className="px-4 py-2 rounded-xl bg-[#174D36] text-white text-[12px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    <span>Pilih Pengalaman untuk Hari Ini</span>
                  </button>
                </div>
              ) : (
                dayFilteredItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className={`bg-[#FFFDF7] rounded-[22px] p-5 sm:p-6 border transition-all shadow-2xs ${
                      item.isNew ? 'border-[#174D36] ring-2 ring-[#174D36]/20 bg-[#FAF4DD]/30' : 'border-[#DDE2D9]'
                    }`}
                  >
                    {/* Top Marker: New badge or Timeline index */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-[#CFEACB] text-[#174D36] font-bold text-[12px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-[12px] font-bold text-[#174D36] flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          {item.time || 'Waktu Fleksibel'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.isNew && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#C69A3A] text-white text-[11px] font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">auto_awesome</span>
                            Baru Ditambahkan
                          </span>
                        )}
                        <button
                          onClick={() => onRemoveTripItem(item.id)}
                          className="p-1 rounded-lg text-[#68736D] hover:text-[#BA1A1A] hover:bg-[#FFDAD6]/40 transition-colors cursor-pointer"
                          title="Hapus dari Rencana"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Title & Category */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#B5653A]">
                        {item.category}
                      </span>
                      <h3 className="font-['Outfit'] text-[17px] font-bold text-[#17251E]">
                        {item.title}
                      </h3>
                      <p className="text-[13px] text-[#68736D] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-[#174D36]">location_on</span>
                        {item.location}
                      </p>
                    </div>

                    {/* Transport & Distance Suggestion */}
                    {item.transportTip && (
                      <div className="mt-3.5 pt-3 border-t border-[#DDE2D9]/70 flex items-center gap-2 text-[12px] text-[#174D36] bg-[#FAF4DD] p-2.5 rounded-xl">
                        <span className="material-symbols-outlined text-base text-[#174D36]">commute</span>
                        <span>Saran Rute: <strong>{item.transportTip}</strong></span>
                      </div>
                    )}

                    {/* Pricing */}
                    <div className="mt-3 flex items-center justify-between text-[13px]">
                      <span className="text-[#68736D]">Pemandu: {item.guideName || 'Warga Setempat'}</span>
                      <span className="font-['Outfit'] font-bold text-[#174D36] text-[15px]">
                        Rp{(item.price || 95000).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Rekomendasi Terkait Rute Hari Ini (Jalur Utama Penginapan & Transportasi) */}
            <div className="bg-[#FAF4DD] rounded-[24px] p-6 border border-[#DDE2D9] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#B5653A]">
                    Jalur Utama Integrasi
                  </span>
                  <h3 className="font-['Outfit'] text-[17px] font-bold text-[#17251E]">
                    Rekomendasi Berdasarkan Rute Hari Ini
                  </h3>
                </div>
              </div>

              {/* Homestay Card */}
              <div className="bg-[#FFFDF7] p-4 rounded-[18px] border border-[#DDE2D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#CFEACB] text-[#174D36] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-2xl">cottage</span>
                  </div>
                  <div>
                    <h4 className="font-['Outfit'] text-[15px] font-bold text-[#17251E]">
                      {selectedStay.name}
                    </h4>
                    <p className="text-[12px] text-[#68736D]">
                      {selectedStay.category} · Berjarak 10 menit dari titik akhir Hari {selectedDay}
                    </p>
                    <span className="text-[12px] font-bold text-[#174D36]">
                      {selectedStay.priceFormatted}
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#CFEACB] text-[#174D36] text-[11px] font-bold shrink-0">
                  Sudah Terpilih
                </span>
              </div>

              {/* Transport Card */}
              <div className="bg-[#FFFDF7] p-4 rounded-[18px] border border-[#DDE2D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#CFEACB] text-[#174D36] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-2xl">electric_rickshaw</span>
                  </div>
                  <div>
                    <h4 className="font-['Outfit'] text-[15px] font-bold text-[#17251E]">
                      {selectedTransport.name}
                    </h4>
                    <p className="text-[12px] text-[#68736D]">
                      {selectedTransport.description}
                    </p>
                    <span className="text-[12px] font-bold text-[#174D36]">
                      {selectedTransport.priceFormatted}
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#CFEACB] text-[#174D36] text-[11px] font-bold shrink-0">
                  Sudah Terpilih
                </span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: STICKY BUDGET SUMMARY & MAP (Desktop 4-5 cols) */}
          <div className={`space-y-6 lg:col-span-5 xl:col-span-4 sticky top-24 ${mobileTab === 'itinerary' ? 'hidden lg:block' : 'block'}`}>
            
            {/* Auto-Updating Budget Summary Box */}
            <div className="bg-[#FFFDF7] rounded-[24px] p-6 border border-[#DDE2D9] shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#DDE2D9]">
                <div>
                  <h3 className="font-['Outfit'] text-[18px] font-bold text-[#17251E]">
                    Ringkasan Budget
                  </h3>
                  <p className="text-[12px] text-[#68736D]">Otomatis diperbarui saat rute berubah</p>
                </div>
                <span className="material-symbols-outlined text-[#174D36]">account_balance_wallet</span>
              </div>

              <div className="space-y-2.5 text-[13px]">
                <div className="flex justify-between text-[#68736D]">
                  <span>Total Pengalaman ({itemsList.length} item)</span>
                  <span className="font-semibold text-[#17251E]">Rp{totalExperienceCost.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-[#68736D]">
                  <span>Penginapan Budaya (1 Malam)</span>
                  <span className="font-semibold text-[#17251E]">Rp{stayCost.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-[#68736D]">
                  <span>Transportasi Ramah Lingkungan</span>
                  <span className="font-semibold text-[#17251E]">Rp{transportCost.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-[#68736D]">
                  <span className="flex items-center gap-1">
                    2.5% Dana Konservasi Budaya
                    <span className="material-symbols-outlined text-[13px] text-[#174D36]" title="Diteruskan langsung ke paguyuban cagar budaya setempat">info</span>
                  </span>
                  <span className="font-semibold text-[#174D36]">+Rp{conservationFund.toLocaleString('id-ID')}</span>
                </div>
                
                <div className="pt-3 border-t border-[#DDE2D9] flex justify-between items-center text-[16px] font-bold text-[#17251E]">
                  <span>Estimasi Total</span>
                  <span className="text-[#174D36] text-[20px] font-['Outfit']">
                    Rp{grandTotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onOpenBookingSummary({
                    title: trip.title,
                    location: trip.city,
                    price: grandTotal,
                    guestsCount: 1,
                    type: 'trip',
                  });
                }}
                className="w-full py-3.5 px-4 rounded-[14px] bg-[#174D36] hover:bg-[#0F3524] text-white font-semibold text-[14px] flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>Lanjut ke Pembayaran</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            {/* Mini Map View Preview */}
            <div className="bg-[#FFFDF7] rounded-[24px] p-5 border border-[#DDE2D9] shadow-sm space-y-3">
              <div className="flex items-center justify-between text-[13px] font-bold text-[#17251E]">
                <span className="flex items-center gap-1.5 font-['Outfit']">
                  <span className="material-symbols-outlined text-base text-[#174D36]">map</span>
                  Visualisasi Peta Rute
                </span>
                <span className="text-[11px] font-semibold text-[#8FA88C]">3 Titik Singgah</span>
              </div>

              {/* Styled Map Container */}
              <div className="relative rounded-[18px] overflow-hidden aspect-[4/3] bg-[#FAF4DD] border border-[#DDE2D9] flex items-center justify-center p-4">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#174D36_1px,transparent_1px)] [background-size:16px_16px]"></div>
                
                {/* SVG Route Visualizer */}
                <div className="relative z-10 w-full text-center space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-xs text-[11px] font-bold text-[#174D36]">
                    <span className="w-2 h-2 rounded-full bg-[#174D36] animate-ping"></span>
                    <span>Kotagede → Kasongan → Sewon</span>
                  </div>
                  <p className="text-[12px] text-[#68736D]">
                    Total jarak jelajah: <strong>14.2 km</strong> (Efisiensi 94%)
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

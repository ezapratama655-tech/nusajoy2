/**
 * @file src/views/BerandaView.jsx
 * NuSaJoy Home Screen (Pure JavaScript)
 * 
 * Mengikuti referensi visual Stitch, proporsi warna 60-30-10,
 * tipografi disederhanakan (5 scale roles: Outfit + Plus Jakarta Sans),
 * spacing 3:1 section-to-card, anti-slop, dan responsif penuh.
 */

import { useState } from 'react';
import { EXPERIENCES_DATA } from '../data/mockData.js';

export default function BerandaView({
  onSelectExperience,
  onNavigateTab,
  onSaveFavorite,
  isFavorited,
  onOpenQuickTripGate,
  onAddToTrip,
  uiState = 'normal',
  onRetry,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [savedSuccessMap, setSavedSuccessMap] = useState({});

  const handleHeroSearch = (e) => {
    e.preventDefault();
    onNavigateTab('jelajah');
  };

  const handleSaveItem = (exp) => {
    onSaveFavorite(exp);
    setSavedSuccessMap((prev) => ({ ...prev, [exp.id]: true }));
    setTimeout(() => {
      setSavedSuccessMap((prev) => ({ ...prev, [exp.id]: false }));
    }, 2500);
  };

  // State Error (Bagian 5)
  if (uiState === 'error') {
    return (
      <div className="max-w-4xl mx-auto px-5 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#FFDAD6] text-[#BA1A1A] mx-auto flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl">wifi_off</span>
        </div>
        <h2 className="font-['Outfit'] text-[24px] font-bold text-[#17251E]">
          Koneksi Terputus ke Server NuSaJoy
        </h2>
        <p className="text-[14px] text-[#68736D] max-w-md mx-auto leading-relaxed">
          Gagal mengambil kurasi destinasi terbaru dari database. Periksa sambungan internet kamu dan coba muat ulang.
        </p>
        <button
          onClick={onRetry}
          className="px-6 py-3 rounded-[14px] bg-[#174D36] hover:bg-[#0F3524] text-white font-semibold text-[14px] transition-all cursor-pointer shadow-sm inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">refresh</span>
          <span>Coba Lagi</span>
        </button>
      </div>
    );
  }

  // State Loading (Bagian 5)
  if (uiState === 'loading') {
    return (
      <div className="max-w-7xl mx-auto px-5 py-20 space-y-12 animate-pulse">
        <div className="h-64 bg-[#EEE8D2] rounded-[28px]"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-44 bg-[#EEE8D2] rounded-[20px]"></div>
          ))}
        </div>
        <div className="h-80 bg-[#EEE8D2] rounded-[24px]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full -mt-20 pt-28 pb-16 lg:pb-24 overflow-hidden bg-gradient-to-b from-[#F4EED8] via-[#F4EED8] to-[#FFFDF7]">
        {/* Ambient organic backdrop blobs */}
        <div className="absolute -top-16 right-[-8%] w-[520px] h-[520px] bg-[#174D36]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 -left-32 w-[420px] h-[420px] bg-[#C69A3A]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-5 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Text & Search Column */}
            <div className="lg:col-span-7 flex flex-col space-y-6">
              <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-[#CFEACB] text-[#174D36] text-[12px] font-semibold font-['Plus_Jakarta_Sans']">
                <span className="material-symbols-outlined text-sm">verified</span>
                <span>Platform Personalisasi Wisata Budaya #1</span>
              </div>

              <h1 className="font-['Outfit'] text-[32px] sm:text-[44px] lg:text-[50px] leading-[1.2] text-[#174D36] tracking-tight font-extrabold">
                Temukan perjalanan yang <span className="text-[#B5653A]">terasa lokal</span>
              </h1>

              <p className="text-[16px] text-[#68736D] max-w-xl leading-relaxed font-['Plus_Jakarta_Sans']">
                Temukan destinasi autentik, kuliner legendaris, aktivitas budaya, dan pengalaman tersembunyi yang pas dengan minat, waktu, dan budget kamu.
              </p>

              {/* Interactive Search Component */}
              <form
                onSubmit={handleHeroSearch}
                className="bg-[#FFFDF7] rounded-2xl shadow-xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border border-[#DDE2D9]"
              >
                <div className="flex items-center gap-3 flex-1 px-3 py-2 bg-[#FAF4DD] rounded-xl">
                  <span className="material-symbols-outlined text-[#717973]">search</span>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent outline-none text-[14px] text-[#17251E] placeholder:text-[#68736D]"
                    placeholder="Cari destinasi, pengalaman, atau kota..."
                    type="text"
                  />
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-[#FAF4DD] rounded-xl sm:w-48">
                  <span className="material-symbols-outlined text-[#717973] text-lg">calendar_today</span>
                  <input
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full bg-transparent outline-none text-[14px] text-[#17251E] placeholder:text-[#68736D] cursor-pointer"
                    placeholder="Kapan saja"
                    type="text"
                    onFocus={(e) => (e.target.type = 'date')}
                    onBlur={(e) => {
                      if (!e.target.value) e.target.type = 'text';
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#174D36] hover:bg-[#0F3524] text-white p-3 sm:px-6 rounded-xl flex items-center justify-center gap-2 transition-all text-[14px] font-semibold shadow-md active:scale-95 shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">search</span>
                  <span className="sm:inline">Cari</span>
                </button>
              </form>

              {/* Dual CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button
                  onClick={() => onNavigateTab('jelajah')}
                  className="bg-[#174D36] hover:bg-[#0F3524] text-white text-[14px] font-semibold px-6 py-3.5 rounded-[14px] shadow-md transition-all active:scale-95 inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Mulai Menjelajah</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
                <button
                  onClick={() => onNavigateTab('rekomendasi')}
                  className="bg-[#FFFDF7] hover:bg-[#EEE8D2] text-[#174D36] border border-[#DDE2D9] text-[14px] font-semibold px-6 py-3.5 rounded-[14px] transition-all shadow-xs active:scale-95 inline-flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm text-[#C69A3A]">auto_awesome</span>
                  <span>Temukan Rekomendasi Untukmu</span>
                </button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4 pt-1">
                <div className="flex -space-x-2">
                  <img
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-[#FFFDF7]"
                    alt="Pelancong Lokal 1"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9oUqRNvX6jDrP1iMl3I1kvWeBtOXB0AuA227Lvk8sZkuSRF4XmeNMe4UAHv3POcSoJUxiIwUfAwdpfi4JuVocawUbdaMGGpdUSbThlt6oorvhjPkQnLIoh5Q2Q1TIKv3sj642q3aePV6AboUL9gg3jXlTcBxruzL0IFm4nn4c266ygNMV8FbXjru1HEoBSRP1x5BGymQi8LHyF18ZY8KrL8TBIWuaN98MM3iZU4vMg0QpYZY9P1_Abg"
                  />
                  <img
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-[#FFFDF7]"
                    alt="Pelancong Lokal 2"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB74vH_YlJdU4f-RPnv-GqRlN1288eeKAveIaXh1xPsuws7S23lya49IAG5tAOI0YmLf40gEvIZpHQkfhlOUY7mFM7K8ILIcdPLxZXVq_h2mNTO_aKHxln9hpSjIHofUAef4jGR-YJPFRzJi-L1WGejQHOL8vUnLHjNrwfcCf2AoGwlK8PWxKKFwNWmWJtXG9ptUzOU9Oq_wr9iN95ydIsIJZ14q_sdK7XpkrFIQ_Ftl46sMfcTrUQLWA"
                  />
                  <img
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-[#FFFDF7]"
                    alt="Pelancong Lokal 3"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTUBnmGDKlpMNlivbKfBqAoenkCHxgnH0BZS_GuV5CWPT8EPQoz2GeOoZxVrU3Tt4KDqwF8eIKkkmJI4r5P7V9w9F0DDUmQ6LLzndNvDBkumIYh1uYcsVClpkJzpPtzEzSAQF133PNuVLnRcVu9yOKXgpyxsQ--cxzYSkKlFsaFE12dK9CtReGzS7qpei2gtesWE4gmKE73fotcXsnac2Q8F0dcupnPSi1rXc-YipHWoJbsaaU2pqL3Q"
                  />
                </div>
                <p className="text-[13px] text-[#68736D]">
                  <strong className="text-[#17251E] font-semibold">12.400+ pelancong</strong> menemukan cerita tak terlupakan bulan ini.
                </p>
              </div>
            </div>

            {/* Visual Hero Banner */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-[28px] overflow-hidden shadow-2xl bg-[#EEE8D2] aspect-[4/5] border border-[#DDE2D9]">
                <img
                  className="w-full h-full object-cover"
                  alt="Suasana Hangat Wisata Budaya Indonesia"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAS3RO7K5ysk-mHpF8liFCdOj6y8ZdxucUKhq2uFeK0mpOHUf0qh-DXo2x32wefb5OEobQ-AEwQx5GrK1ovIpy8_WrnLGB-0RoXhYm8Spr1DFmmubEB1qDjA1J_DOMSegAEsILD1YqvuP4exur3YoIC85rlKOyXmLs4LkQ-O_S6bxq159jTWqm5D0vvvdZcwk55vtR8nr575dPJywGZNU4hpN5TUFFfQlDZPtQadR7yMxmtIuIuXo6SSQ"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#174D36]/80 via-transparent to-black/10"></div>
                
                {/* Floating Micro-badge 1 */}
                <div className="absolute top-5 left-5 bg-[#FFFDF7]/90 backdrop-blur-md rounded-2xl p-3 shadow-lg flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#C69A3A]/20 flex items-center justify-center text-[#174D36]">
                    <span className="material-symbols-outlined text-lg">local_cafe</span>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-[#17251E]">Kopi Klotok Asli</p>
                    <p className="text-[11px] text-[#68736D]">Resep Desa Pakem • 4.9 ★</p>
                  </div>
                </div>

                {/* Floating Micro-badge 2 */}
                <div className="absolute bottom-5 left-5 right-5 bg-[#FFFDF7]/95 backdrop-blur-md rounded-2xl p-4 shadow-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#CFEACB] flex items-center justify-center text-[#174D36]">
                      <span className="material-symbols-outlined">workspace_premium</span>
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-[#17251E]">Desa Adat Sade, Lombok</p>
                      <p className="text-[12px] text-[#68736D]">Ditemani Pak Amaq (Pemandu Gen-3)</p>
                    </div>
                  </div>
                  <span className="bg-[#174D36] text-white px-3 py-1 rounded-full text-[11px] font-bold">
                    Autentik
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. QUICK ACTIONS ("Mau pergi ke mana hari ini?") */}
      <section className="w-full bg-[#FFFDF7] py-16 border-y border-[#DDE2D9]/60">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-2">
            <div>
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#B5653A]">
                Rencana Singkat
              </span>
              <h2 className="font-['Outfit'] text-[24px] sm:text-[28px] font-bold text-[#17251E] mt-1">
                Mau pergi ke mana hari ini?
              </h2>
            </div>
            <p className="text-[14px] text-[#68736D]">
              Pilih mood eksplorasi cepat sesuai suasana hatimu
            </p>
          </div>

          {/* 5 Chips Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { title: 'Ngopi & Kuliner Otentik', count: '84 spot legendaris', icon: 'restaurant' },
              { title: 'Wisata Alam Teduh', count: '42 air terjun & desa', icon: 'forest' },
              { title: 'Belajar Kriya Lokal', count: '31 lokakarya warga', icon: 'palette' },
              { title: 'Jalan Kaki Kota Lama', count: '19 rute narasi lisan', icon: 'directions_walk' },
              { title: 'Hidden Gem Weekend', count: 'Aman dari kerumunan', icon: 'diamond', special: true },
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={() => onNavigateTab('jelajah')}
                className="group bg-[#FAF4DD] hover:bg-[#174D36] transition-all duration-200 rounded-[20px] p-4 text-left shadow-2xs flex flex-col justify-between h-32 active:scale-95 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-white group-hover:bg-white/20 flex items-center justify-center text-[#174D36] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-xl">{q.icon}</span>
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[#17251E] group-hover:text-white transition-colors leading-tight font-['Outfit']">
                    {q.title}
                  </h3>
                  <span className="text-[11px] text-[#68736D] group-hover:text-[#CFEACB] transition-colors mt-0.5 block">
                    {q.count}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* JALUR KEDUA: Quick Action Penginapan & Transportasi (Bagian 2 Requirement) */}
          <div className="mt-8 pt-6 border-t border-[#DDE2D9]/70 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FAF4DD]/50 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#174D36] text-2xl">signpost</span>
              <div>
                <p className="text-[13px] font-bold text-[#17251E]">Jalur Pencarian Bebas Penginapan & Transportasi</p>
                <p className="text-[12px] text-[#68736D]">Terhubung dengan itinerary trip aktif agar bebas macet</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => onOpenQuickTripGate('stay')}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white hover:bg-[#FAF4DD] text-[#174D36] text-[13px] font-semibold border border-[#DDE2D9] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <span className="material-symbols-outlined text-base">cottage</span>
                <span>Cari Penginapan Desa</span>
              </button>
              <button
                onClick={() => onOpenQuickTripGate('transport')}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white hover:bg-[#FAF4DD] text-[#174D36] text-[13px] font-semibold border border-[#DDE2D9] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <span className="material-symbols-outlined text-base">electric_rickshaw</span>
                <span>Sewa Transportasi</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DISCOVER SECTION ("Mulai dari apa yang kamu suka") */}
      <section className="w-full py-20 bg-[#F4EED8]">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="max-w-2xl mb-12">
            <div className="inline-flex items-center gap-1.5 text-[#174D36] text-[12px] font-bold uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-base">category</span>
              <span>Katalog Kurasi Pengalaman</span>
            </div>
            <h2 className="font-['Outfit'] text-[28px] sm:text-[36px] font-bold text-[#17251E] mb-3">
              Mulai dari apa yang kamu suka
            </h2>
            <p className="text-[15px] text-[#68736D] leading-relaxed">
              Eksplorasi dirancang khusus untuk membawa kamu menyelami kebiasaan, cita rasa, dan warisan hidup penduduk setempat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Rasa Lokal & Kuliner Legendaris',
                tag: 'Kuliner Tradisi',
                desc: 'Santap langsung resep warisan turun-temurun di warung pojok desa yang terjaga cita rasanya selama 3 dekade.',
                count: '90+ Destinasi Rasa',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUWFWSR5P5TmtHMUM1BpTRVcgvgofel8x64EOb0MqaEXyQrB6_KINZjw2iHn26wNkgLjb1lAhiDcL4iYNW_9rllx0jbMSxUd6vRpkV05DwbV9hJcIbWGkhnyOOgPxy9tqHpQkwnYayc3iEi-mkWIO0QqKExkUCT-zcRV5NBL3EX-MLxHepBCQCgC3_cknvf6ZXC5DpEnGO4RFlxB1rPMLe3lh9pTJkbFr0uANTLLwGeWI4xl6lPyc8vQ',
              },
              {
                title: 'Alam & Eksplorasi Hijau',
                tag: 'Wisata Teduh',
                desc: 'Jelajahi perbukitan hening, hutan bambu, dan pantai pesisir terpencil yang dirawat langsung oleh paguyuban masyarakat adat.',
                count: '65+ Jalur Tenang',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAMXwacoDteIDtfPnNAk304y9vMAvb6lNA8i1v3iCO4NZ_XLC_7MaC8AuEkgoQL1ICBprJJsM0gNm1udE5yyW8aKoBes9ZoWpex470TuEk0HL1KsvUfGVOV9kTEMWxfZ3v4yibgg-uSt9GBM1bqbJ4P_0p49hdL6-d5Bpwy0uNP3zY8kKmFPCGHYm34KGLTj8MDVSPFVAFDVkQ1n9njSXCvvpGBRr8bOX7KSa-2DnUeBk66LRjxyviGA',
              },
              {
                title: 'Seni & Kriya Tradisi',
                tag: 'Lokakarya Kriya',
                desc: 'Duduk berdampingan dengan maestro tenun ikat, tembikar tanah liat, hingga pelukis wayang kulit di bengkel seninya.',
                count: '48+ Workshop Warga',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9MWBl1vbQhBHOeFU8tCIdMexa_eAN7N4sM5uTp-PWSt1iwwV5-SLhiQeISKcWzcpeAdzzGncYWXRGREALnNWjz75P8rq1_OdVJQB4tMZjZKIVhxPHSkMHRKGjzE4qWlXHj3Kf3QSG5PtWXatvlPiQ7ycmqrvzTBV6h9m4KeAIMVm85rZqcu1RMVfwN2BjGwUB3uVXL-ZnN6wx14UcZf0HuQXi3_74sv9dXLt-vc_cImONj5FOimAQbA',
              },
              {
                title: 'Kisah & Sudut Sejarah',
                tag: 'Walking Tour',
                desc: 'Dengarkan mitos kuno dan narasi sejarah kemerdekaan yang tidak tercatat di buku panduan umum lewat jalan santai di kampung tua.',
                count: '35+ Napak Tilas',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAD5pN2P4hOYbxMfUHcQm6l9gx7X6zO_mpLllgrSLaSqxx_Fd46I4cKsrxnrR4zhln-WOESndlX5qNAKMPe6ihdj7E7cXYpGJEfoPP7ToaMxDvgO25TIfYvMrtKyGjG5kDNERQD5AmlHQaRt_l3C7wcxTA39Jy6pU8OeaJo8n2gOSdC1_OG1xK7xCWzI7KzhacYItMv_GRQK73cydsryOKoZUCsXD4m6DU83CGeu6ndQt5mSLJ-2xfqUA',
              },
            ].map((cat, i) => (
              <div
                key={i}
                onClick={() => onNavigateTab('jelajah')}
                className="group bg-[#FFFDF7] rounded-[20px] overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer border border-[#DDE2D9]"
              >
                <div className="relative h-52 overflow-hidden bg-[#EEE8D2]">
                  <img
                    src={cat.img}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 bg-[#FFFDF7]/95 backdrop-blur-md px-3 py-1 rounded-full text-[12px] font-bold text-[#17251E] shadow-2xs">
                    {cat.tag}
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-['Outfit'] text-[18px] font-bold text-[#17251E] group-hover:text-[#174D36] transition-colors mb-2">
                      {cat.title}
                    </h3>
                    <p className="text-[13px] text-[#68736D] leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                  <div className="pt-4 flex items-center justify-between text-[13px] text-[#174D36] font-bold">
                    <span>{cat.count}</span>
                    <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PENJELASAN MASALAH (EMPATI) */}
      <section className="w-full py-20 bg-[#FFFDF7]">
        <div className="max-w-5xl mx-auto px-5 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EEE8D2] text-[#B5653A] text-[12px] font-semibold mb-4">
            <span className="material-symbols-outlined text-sm">sentiment_dissatisfied</span>
            <span>Realita Traveling Hari Ini</span>
          </div>

          <h2 className="font-['Outfit'] text-[28px] sm:text-[36px] font-bold text-[#17251E] mb-4 max-w-2xl mx-auto leading-tight">
            Terlalu banyak pilihan, tapi susah menemukan yang pas
          </h2>
          
          <p className="text-[16px] text-[#68736D] max-w-2xl mx-auto mb-12 leading-relaxed">
            Pernahkah kamu menghabiskan waktu berjam-jam browsing media sosial, namun ujung-ujungnya terjebak di rute template yang terasa bising dan melelahkan?
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              {
                icon: 'groups',
                title: 'Wisata Viral yang Sesak',
                desc: 'Antrean panjang hanya demi foto singkat di spot buatan yang kehilangan karakter aslinya.',
              },
              {
                icon: 'distance',
                title: 'Itinerary Kaku Tanpa Konteks',
                desc: 'Rute algoritma umum yang mengabaikan waktu santai, ritme napas, dan minat kuliner personal.',
              },
              {
                icon: 'contact_support',
                title: 'Jauh dari Penjaga Budaya',
                desc: 'Sebagian besar pengeluaran terserap agen perantara, sementara warga desa pengrajin jarang tersentuh manfaat langsung.',
              },
            ].map((prob, idx) => (
              <div
                key={idx}
                className="bg-[#FAF4DD] rounded-[20px] p-6 border border-[#DDE2D9] shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#FFDAD6] text-[#BA1A1A] flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-2xl">{prob.icon}</span>
                  </div>
                  <h3 className="font-['Outfit'] text-[17px] font-bold text-[#17251E] mb-2 leading-snug">
                    {prob.title}
                  </h3>
                  <p className="text-[13px] text-[#68736D] leading-relaxed">
                    {prob.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SOLUSI TIGA PILAR */}
      <section className="w-full py-20 bg-[#FAF4DD]">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[12px] font-bold text-[#174D36] uppercase tracking-wider">
              Standar NuSaJoy
            </span>
            <h2 className="font-['Outfit'] text-[28px] sm:text-[34px] font-bold text-[#17251E] mt-1 mb-3">
              Tiga pilar pengalaman bermakna
            </h2>
            <p className="text-[15px] text-[#68736D]">
              Setiap pengalaman di NuSaJoy lolos kurasi ketat untuk memastikan kamu pulang membawa cerita berkesan dan relasi baru.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: 'badge',
                title: 'Pemandu Lokal Berlisensi & Ramah',
                desc: 'Bukan sekadar penunjuk arah, mereka adalah pencerita kampung halaman. Mengetahui sudut foto terbaik, silsilah warung kopi, dan filosofi tarian adat.',
                check: '100% Lulus Verifikasi Latar & Etika',
              },
              {
                icon: 'storefront',
                title: 'UMKM & Kuliner Berdaya',
                desc: 'Dampak ekonomi mengalir langsung ke ibu-ibu pembuat jamu, perajin anyaman bambu, dan pengelola homestay desa tanpa potongan perantara yang mencekik.',
                check: 'Model Royalti Terbuka untuk Komunitas',
              },
              {
                icon: 'explore_off',
                title: 'Hidden Experience Terkurasi',
                desc: 'Spot eksklusif yang tenang, tidak terjamah bus pariwisata massal. Pengalaman terbatas peserta agar alam tetap lestari dan suasananya intim bagi kamu.',
                check: 'Batas Maksimal 8 Pelancong per Sesi',
              },
            ].map((pilar, i) => (
              <div
                key={i}
                className="bg-[#FFFDF7] rounded-[20px] p-6 shadow-2xs border border-[#DDE2D9] flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  <div className="w-13 h-13 rounded-2xl bg-[#CFEACB] text-[#174D36] flex items-center justify-center mb-5">
                    <span className="material-symbols-outlined text-3xl">{pilar.icon}</span>
                  </div>
                  <h3 className="font-['Outfit'] text-[18px] font-bold text-[#17251E] mb-2.5">
                    {pilar.title}
                  </h3>
                  <p className="text-[14px] text-[#68736D] leading-relaxed">
                    {pilar.desc}
                  </p>
                </div>
                <div className="pt-4 mt-6 border-t border-[#DDE2D9] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#174D36] text-lg">check_circle</span>
                  <span className="text-[12px] font-semibold text-[#17251E]">{pilar.check}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CARA KERJA 4 LANGKAH (Discover • Match • Plan • Book) */}
      <section className="w-full py-20 bg-[#FFFDF7]">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#B5653A]">
              Langkah Sederhana
            </span>
            <h2 className="font-['Outfit'] text-[28px] sm:text-[34px] font-bold text-[#17251E] mt-1 mb-2">
              Cara Kerja NuSaJoy
            </h2>
            <p className="text-[15px] text-[#68736D]">
              Dari rasa penasaran hingga petualangan nyata dalam 4 ketukan mudah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {[
              { num: '1', step: 'LANGKAH 01', title: 'Discover', desc: 'Eksplorasi destinasi dan aktivitas sesuai mood, kota tujuan, atau selera kulinermu.' },
              { num: '2', step: 'LANGKAH 02', title: 'Match', desc: 'Algoritma personalisasi mencocokkan waktu luang, ritme perjalanan, dan budget kamu.' },
              { num: '3', step: 'LANGKAH 03', title: 'Plan', desc: 'Susun itinerary harian yang fleksibel lengkap dengan estimasi jarak dan saran transportasi.' },
              { num: '4', step: 'LANGKAH 04', title: 'Book', desc: 'Reservasi pemandu lokal secara transparan tanpa biaya tersembunyi, langsung konfirmasi.' },
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#174D36] text-white flex items-center justify-center font-['Outfit'] text-[20px] font-bold mb-4 shadow-md">
                  {step.num}
                </div>
                <div className="bg-[#FAF4DD] p-5 rounded-[20px] w-full flex-1 border border-[#DDE2D9]">
                  <span className="text-[11px] font-bold text-[#B5653A] tracking-wider block mb-1">
                    {step.step}
                  </span>
                  <h3 className="font-['Outfit'] text-[17px] font-bold text-[#17251E] mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-[13px] text-[#68736D] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. PREVIEW PENGALAMAN PILIHAN BULAN INI */}
      <section className="w-full py-20 bg-[#F4EED8]" id="rekomendasi-preview">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-3">
            <div>
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#B5653A]">
                Paling Dicari
              </span>
              <h2 className="font-['Outfit'] text-[28px] sm:text-[34px] font-bold text-[#17251E] mt-1">
                Pengalaman Pilihan Bulan Ini
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('jelajah')}
              className="inline-flex items-center gap-1.5 text-[14px] text-[#174D36] font-bold hover:underline cursor-pointer"
            >
              <span>Lihat Semua Pengalaman ({EXPERIENCES_DATA.length}+)</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EXPERIENCES_DATA.slice(0, 3).map((exp) => (
              <div
                key={exp.id}
                className="bg-[#FFFDF7] rounded-[24px] overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col group border border-[#DDE2D9]"
              >
                <div
                  className="relative h-60 overflow-hidden cursor-pointer bg-[#EEE8D2]"
                  onClick={() => onSelectExperience(exp)}
                >
                  <img
                    src={exp.image}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-4 left-4 bg-[#FFFDF7]/95 backdrop-blur-md text-[#17251E] text-[12px] px-3.5 py-1.5 rounded-full font-bold shadow-xs flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#C69A3A]">star</span>
                    <span>{exp.rating} · {exp.city}</span>
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-[#68736D] text-[12px] mb-2.5">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      <span>{exp.durationText}</span>
                      <span>•</span>
                      <span>Maks. {exp.maxGuests} peserta</span>
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

                  <div className="pt-4 border-t border-[#DDE2D9] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#68736D] block">Mulai dari</span>
                      <span className="font-['Outfit'] text-[18px] text-[#174D36] font-bold">
                        {exp.priceFormatted}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectExperience(exp)}
                        className="bg-white hover:bg-[#FAF4DD] border border-[#DDE2D9] text-[#17251E] text-[13px] font-semibold px-3.5 py-2 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => onAddToTrip(exp)}
                        className="bg-[#FAF4DD] hover:bg-[#EEE8D2] border border-[#DDE2D9] text-[#174D36] text-[13px] font-semibold px-3 py-2 rounded-xl transition-all shadow-2xs active:scale-95 cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">add_circle</span>
                        <span>Trip</span>
                      </button>
                      <button
                        onClick={() => handleSaveItem(exp)}
                        className={`py-2 px-3 rounded-xl flex items-center gap-1 text-[13px] font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer ${
                          savedSuccessMap[exp.id] || isFavorited(exp.id)
                            ? 'bg-[#CFEACB] text-[#174D36]'
                            : 'bg-[#174D36] hover:bg-[#0F3524] text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {savedSuccessMap[exp.id] || isFavorited(exp.id) ? 'check' : 'bookmark_add'}
                        </span>
                        <span>
                          {savedSuccessMap[exp.id] || isFavorited(exp.id) ? 'Disimpan' : 'Simpan'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. BANNER MINI ITINERARY */}
      <section className="w-full py-12 bg-[#FFFDF7]">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="bg-gradient-to-r from-[#174D36] to-[#0F3524] text-white rounded-[28px] p-8 lg:p-12 relative overflow-hidden shadow-xl">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="max-w-2xl space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CFEACB] text-[#174D36] text-[12px] font-bold">
                  <span className="material-symbols-outlined text-sm">timer</span>
                  Smart Trip Matcher
                </span>
                <h2 className="font-['Outfit'] text-[26px] sm:text-[32px] font-bold leading-tight">
                  Punya waktu cuma 4 jam di Jogja atau Bandung?
                </h2>
                <p className="text-[14px] text-[#CFEACB] max-w-xl leading-relaxed">
                  Jangan buang waktu di jalan macet. Biarkan NuSaJoy susunkan rute lokal terbaik berjarak dekat yang sesuai dengan ritme dan anggaran santaimu.
                </p>
              </div>

              <div className="shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => onNavigateTab('rekomendasi')}
                  className="w-full sm:w-auto bg-[#FFFDF7] text-[#174D36] hover:bg-white text-[15px] font-bold px-7 py-4 rounded-[14px] shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl text-[#C69A3A]">bolt</span>
                  <span>Coba Rekomendasi Cepat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. DAMPAK DUA SISI & EKOSISTEM LOKAL */}
      <section className="w-full py-20 bg-[#F4EED8]">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Narrative */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#B5653A]">
                Pariwisata Berdaya
              </span>
              <h2 className="font-['Outfit'] text-[28px] sm:text-[36px] font-bold text-[#17251E] leading-tight">
                Dampak nyata di setiap senyuman dan cerita
              </h2>
              <p className="text-[15px] text-[#68736D] leading-relaxed">
                NuSaJoy dibangun bukan sekadar sebagai aplikasi tiket, melainkan jembatan keadilan ekonomi pariwisata nusantara. Ketika kamu menjelajah dengan kami, penghasilan mengalir langsung kepada penjaga budaya sesungguhnya.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#CFEACB] text-[#174D36] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined">volunteer_activism</span>
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-[#17251E]">Transparansi Penghasilan Mitra</h3>
                    <p className="text-[13px] text-[#68736D]">Pemandu dan pelaku UMKM menentukan tarif mereka sendiri secara adil dan bermartabat.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#CFEACB] text-[#174D36] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined">park</span>
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-[#17251E]">Dana Konservasi Budaya Mandiri</h3>
                    <p className="text-[13px] text-[#68736D]">2.5% dari setiap pemesanan dialokasikan untuk pemeliharaan sanggar seni dan rumah adat.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Stats */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#FFFDF7] rounded-[20px] p-6 shadow-2xs border border-[#DDE2D9] flex flex-col justify-between">
                <span className="text-[11px] text-[#68736D] font-semibold uppercase tracking-wider">Perputaran Dana</span>
                <div className="my-3">
                  <span className="font-['Outfit'] text-[42px] font-extrabold text-[#174D36] block">85%</span>
                  <p className="text-[14px] font-bold text-[#17251E] mt-0.5">Langsung ke Pelaku Lokal</p>
                </div>
                <p className="text-[12px] text-[#68736D]">Memangkas biaya agen komersial perantara berlebihan.</p>
              </div>

              <div className="bg-[#FFFDF7] rounded-[20px] p-6 shadow-2xs border border-[#DDE2D9] flex flex-col justify-between">
                <span className="text-[11px] text-[#68736D] font-semibold uppercase tracking-wider">Keluarga Pemandu</span>
                <div className="my-3">
                  <span className="font-['Outfit'] text-[42px] font-extrabold text-[#B5653A] block">450+</span>
                  <p className="text-[14px] font-bold text-[#17251E] mt-0.5">Pemandu Terverifikasi</p>
                </div>
                <p className="text-[12px] text-[#68736D]">Tersebar di 63 desa wisata dari Sabang sampai Raja Ampat.</p>
              </div>

              <div className="bg-[#FFFDF7] rounded-[20px] p-6 shadow-2xs border border-[#DDE2D9] sm:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-[11px] text-[#68736D] font-semibold uppercase tracking-wider">Ekosistem Tradisi</span>
                  <div className="my-1">
                    <span className="font-['Outfit'] text-[24px] font-bold text-[#174D36]">1.200+ Warung & Perajin</span>
                    <p className="text-[13px] text-[#68736D] mt-0.5">Mendapatkan pendapatan berkala yang menopang keluarga dan pewarisan ilmu kriya ke anak muda desa.</p>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-[#CFEACB] text-[#174D36] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-3xl">eco</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 10. CLOSING HERO CTA BANNER */}
      <section className="w-full py-20 bg-[#FFFDF7] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="relative rounded-[32px] overflow-hidden shadow-2xl bg-[#0F3524] border border-[#DDE2D9]">
            <div className="absolute inset-0 z-0">
              <img
                className="w-full h-full object-cover opacity-25 mix-blend-luminosity"
                alt="Keindahan Panorama Wisata Alam Nusantara"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQT4LRB6OsSWo_Zra5fxMCuwMGunH0TRcpyNkvEkj4hUqcOYWGtvX0jPvSC6CJx2W-y5lqKXIJ35snDGlJc73KKHqWh55sAWLvALwS-c4c9rqOWr83eFcm4MsPMb0JsoPzdTJ-0BmT-q-Zy3PcioY9bewsN3zAyFDRtNCZyhsjTTATQD8-nSJeob0Wi2fCOOFAzOKOmpXbZrV6IvwauOAxk_JgykbhLECLDsOIy5155snodXui7hIDMQ"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0F3524] via-[#174D36]/90 to-[#0F3524]/80"></div>
            </div>

            <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-3xl space-y-5 text-white">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#CFEACB] text-[#174D36] text-[12px] font-bold">
                <span className="material-symbols-outlined text-sm">flight_takeoff</span>
                <span>Langkah Pertama Dimulai Hari Ini</span>
              </span>

              <h2 className="font-['Outfit'] text-[28px] sm:text-[40px] font-bold leading-tight">
                Perjalananmu dimulai dari sini. Temukan sudut Indonesia yang belum pernah kamu lihat.
              </h2>

              <p className="text-[15px] text-[#CFEACB] max-w-xl leading-relaxed">
                Mulai rancang perjalanan autentikmu atau hubungi langsung pencerita lokal terpercaya di kotamu.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onNavigateTab('mytrip')}
                  className="bg-[#FFFDF7] hover:bg-white text-[#174D36] text-[14px] font-bold px-7 py-3.5 rounded-[14px] shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span>Daftar Gratis & Buat Trip</span>
                  <span className="material-symbols-outlined text-base">east</span>
                </button>
                <button
                  onClick={() => onNavigateTab('jelajah')}
                  className="bg-white/15 hover:bg-white/25 text-white text-[14px] font-semibold px-6 py-3.5 rounded-[14px] transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">map</span>
                  <span>Jelajahi Peta Destinasi</span>
                </button>
              </div>

              <p className="text-[12px] text-[#CFEACB]/80 pt-2">
                Gratis pembatalan hingga 24 jam sebelum tur • Jaminan perlindungan etika & rasa hormat warga
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

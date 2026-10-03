/**
 * @file src/views/AkunView.jsx
 * NuSaJoy Akun & Secondary Menu Hub (Pure JavaScript)
 * 
 * Aturan Bagian 2:
 * "Pesanan dan Notifikasi dan Pusat Bantuan tidak mendapat slot navigasi utama,
 * ketiganya diakses lewat menu di dalam Akun."
 */

import { useState } from 'react';
import { INITIAL_ORDERS, INITIAL_NOTIFICATIONS } from '../data/mockData.js';

const profileImage =
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80';

export default function AkunView({
  orders = INITIAL_ORDERS,
  notifications = INITIAL_NOTIFICATIONS,
  onNavigateExplore,
  initialSubTab = 'profile',
  uiState = 'normal',
  onRetry,
}) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab); // 'profile' | 'pesanan' | 'notifikasi' | 'bantuan' | 'mitra'
  const [ordersList, setOrdersList] = useState(orders);
  const [notifList, setNotifList] = useState(notifications);

  // STATE ERROR
  if (uiState === 'error') {
    return (
      <div className="max-w-4xl mx-auto px-5 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#FFDAD6] text-[#BA1A1A] mx-auto flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl">account_circle_off</span>
        </div>
        <h2 className="font-['Outfit'] text-[24px] font-bold text-[#17251E]">
          Gagal Memuat Profil Akun
        </h2>
        <p className="text-[14px] text-[#68736D] max-w-md mx-auto">
          Terjadi gangguan saat mengambil data akun pengguna.
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

  // STATE LOADING
  if (uiState === 'loading') {
    return (
      <div className="max-w-5xl mx-auto px-5 py-12 space-y-8 animate-pulse">
        <div className="h-32 bg-[#EEE8D2] rounded-[24px]"></div>
        <div className="h-80 bg-[#EEE8D2] rounded-[24px]"></div>
      </div>
    );
  }

  return (
    <div className="w-full py-8 lg:py-12 bg-[#F4EED8] min-h-[calc(100vh-80px)]">
      <div className="max-w-5xl mx-auto px-5 lg:px-8 space-y-8">
        
        {/* User Profile Card */}
        <div className="bg-[#FFFDF7] rounded-[28px] p-6 sm:p-8 border border-[#DDE2D9] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              alt="Profil Pengguna Budi Santoso"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover object-top ring-4 ring-[#174D36]/20 border-2 border-[#174D36] shadow-md transition-all duration-300 hover:ring-[#C69A3A]/40"
              src={profileImage}
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="font-['Outfit'] text-[22px] sm:text-[26px] font-bold text-[#17251E]">
                  Budi Santoso
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#CFEACB] text-[#174D36] text-[11px] font-bold">
                  Pelancong Budaya
                </span>
              </div>
              <p className="text-[13px] text-[#68736D]">budi.santoso@email.com · Jakarta Selatan</p>
              <p className="text-[12px] text-[#174D36] font-medium pt-0.5">
                ★ 4.9 Reputasi Tamu Ramah Desa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="px-3 py-1.5 rounded-xl bg-[#FAF4DD] text-[#174D36] text-[12px] font-semibold border border-[#DDE2D9]">
              3 Perjalanan Selesai
            </span>
          </div>
        </div>

        {/* Navigation Tabs inside Akun (Bagian 2 Requirement) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#DDE2D9]">
          {[
            { id: 'profile', label: 'Ringkasan Akun', icon: 'person' },
            { id: 'pesanan', label: `Pesanan Saya (${ordersList.length})`, icon: 'receipt_long' },
            { id: 'notifikasi', label: `Notifikasi (${notifList.filter((n) => !n.read).length})`, icon: 'notifications' },
            { id: 'bantuan', label: 'Pusat Bantuan', icon: 'help' },
            { id: 'mitra', label: 'Gabung Mitra Budaya', icon: 'handshake' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-[#174D36] text-white shadow-xs'
                  : 'bg-[#FFFDF7] text-[#68736D] hover:text-[#17251E] border border-[#DDE2D9]'
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* SUB-VIEW 1: PESANAN SAYA */}
        {activeSubTab === 'pesanan' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-['Outfit'] text-[20px] font-bold text-[#17251E]">
                  Riwayat & Reservasi Aktif
                </h2>
                <p className="text-[13px] text-[#68736D]">
                  Semua reservasi terkonfirmasi langsung terhubung dengan pemandu lokal
                </p>
              </div>
            </div>

            {ordersList.length === 0 ? (
              <div className="bg-[#FFFDF7] p-12 rounded-[24px] border border-[#DDE2D9] text-center space-y-3">
                <p className="text-[14px] text-[#68736D]">Belum ada pesanan aktif saat ini.</p>
                <button
                  onClick={() => onNavigateExplore('jelajah')}
                  className="px-4 py-2 rounded-xl bg-[#174D36] text-white text-[13px] font-semibold cursor-pointer"
                >
                  Jelajahi Pengalaman
                </button>
              </div>
            ) : (
              ordersList.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-[#FFFDF7] rounded-[24px] p-6 border border-[#DDE2D9] shadow-2xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#DDE2D9] gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FAF4DD] font-mono font-bold text-[12px] text-[#174D36]">
                        {ord.id}
                      </span>
                      <span className="text-[12px] text-[#68736D]">Dipesan untuk {ord.date}</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#CFEACB] text-[#174D36] text-[12px] font-bold self-start sm:self-center">
                      {ord.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <h3 className="font-['Outfit'] text-[17px] font-bold text-[#17251E]">
                        {ord.title}
                      </h3>
                      <p className="text-[13px] text-[#68736D]">
                        Titik Kumpul: <strong>{ord.meetingPoint}</strong> ({ord.meetingTime})
                      </p>
                      <p className="text-[13px] text-[#68736D]">
                        Pemandu: <strong>{ord.guideName}</strong> ({ord.guidePhone})
                      </p>
                      <p className="text-[13px] text-[#68736D]">
                        Jumlah: <strong>{ord.guests} Peserta</strong> · Pembayaran: {ord.paymentMethod}
                      </p>
                    </div>

                    <div className="bg-[#FAF4DD] p-4 rounded-[18px] border border-[#DDE2D9] flex flex-col justify-between space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[12px] text-[#68736D]">Total Pembayaran:</span>
                        <span className="font-['Outfit'] text-[18px] font-bold text-[#174D36]">
                          Rp{ord.totalPrice.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            window.open(`https://wa.me/6281234567890?text=Halo%20${encodeURIComponent(ord.guideName)},%20saya%20pemesan%20${encodeURIComponent(ord.title)}%20(Kode%20${ord.id})`, '_blank');
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-base">chat</span>
                          <span>WhatsApp Pemandu</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* SUB-VIEW 2: NOTIFIKASI */}
        {activeSubTab === 'notifikasi' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-['Outfit'] text-[20px] font-bold text-[#17251E]">
                  Pemberitahuan & Pesan
                </h2>
                <p className="text-[13px] text-[#68736D]">
                  Pembaruan jadwal dan komunikasi dari pemandu lokal kamu
                </p>
              </div>
              <button
                onClick={() => {
                  setNotifList(notifList.map((n) => ({ ...n, read: true })));
                }}
                className="text-[12px] font-semibold text-[#174D36] hover:underline cursor-pointer"
              >
                Tandai semua dibaca
              </button>
            </div>

            <div className="space-y-3">
              {notifList.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-[20px] border transition-all flex items-start gap-3.5 ${
                    notif.read ? 'bg-[#FFFDF7] border-[#DDE2D9]' : 'bg-[#FAF4DD] border-[#174D36]/40 shadow-xs'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#CFEACB] text-[#174D36] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-lg">
                      {notif.type === 'chat' ? 'chat' : notif.type === 'booking' ? 'receipt' : 'park'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-['Outfit'] text-[15px] font-bold text-[#17251E]">
                        {notif.title}
                      </h4>
                      <span className="text-[11px] text-[#68736D]">{notif.time}</span>
                    </div>
                    <p className="text-[13px] text-[#68736D] mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-VIEW 3: PUSAT BANTUAN */}
        {activeSubTab === 'bantuan' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-['Outfit'] text-[20px] font-bold text-[#17251E]">
                Pusat Bantuan & Panduan Tamu
              </h2>
              <p className="text-[13px] text-[#68736D]">
                Jawaban seputar pemesanan, etika berkunjung ke desa adat, dan pembatalan
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  q: 'Bagaimana etika berkunjung ke desa adat?',
                  a: 'Gunakan pakaian sopan yang menutupi bahu dan lutut. Selalu meminta izin sebelum memotret kegiatan ritual atau warga lansia. Pemandu lokal NuSaJoy akan mendampingi dan menjelaskan aturan adat secara rinci.',
                },
                {
                  q: 'Apakah bisa membatalkan jadwal perjalanan?',
                  a: 'Gratis pembatalan dengan pengembalian dana 100% jika dilakukan minimal 24 jam sebelum kegiatan dimulai.',
                },
                {
                  q: 'Ke mana 2.5% Dana Konservasi Budaya disalurkan?',
                  a: 'Dana konservasi dialokasikan langsung ke kas paguyuban desa adat atau sanggar kriya setempat untuk perawatan alat kesenian dan rumah adat.',
                },
                {
                  q: 'Bagaimana jika cuaca buruk atau hujan lebat?',
                  a: 'Pemandu lokal memiliki rute alternatif ramah cuaca (seperti lokakarya kriya dalam ruangan atau pawon kuliner tradisi) tanpa biaya tambahan.',
                },
              ].map((faq, i) => (
                <div key={i} className="bg-[#FFFDF7] p-5 rounded-[20px] border border-[#DDE2D9] space-y-2">
                  <h3 className="font-['Outfit'] text-[15px] font-bold text-[#17251E]">
                    {faq.q}
                  </h3>
                  <p className="text-[13px] text-[#68736D] leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-[#FAF4DD] p-6 rounded-[22px] border border-[#DDE2D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-['Outfit'] text-[16px] font-bold text-[#17251E]">
                  Butuh Bantuan Mendesak?
                </h3>
                <p className="text-[13px] text-[#68736D]">
                  Tim concierge NuSaJoy siaga setiap hari pukul 07:00 - 22:00 WIB
                </p>
              </div>
              <button
                onClick={() => {
                  window.open('https://wa.me/6281234567890?text=Halo%20Tim%20NuSaJoy,%20saya%20butuh%20bantuan', '_blank');
                }}
                className="px-4 py-2.5 rounded-xl bg-[#174D36] text-white text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">support_agent</span>
                <span>Hubungi Concierge</span>
              </button>
            </div>
          </div>
        )}

        {/* SUB-VIEW 4: GABUNG MITRA BUDAYA */}
        {activeSubTab === 'mitra' && (
          <div className="bg-[#FFFDF7] rounded-[24px] p-6 sm:p-8 border border-[#DDE2D9] space-y-5">
            <div>
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#B5653A]">
                Pemberdayaan Warga
              </span>
              <h2 className="font-['Outfit'] text-[22px] font-bold text-[#17251E] mt-1">
                Gabung Ekosistem Pelaku Budaya & Pemandu
              </h2>
              <p className="text-[14px] text-[#68736D] mt-1 leading-relaxed">
                Apakah kamu pencerita sejarah, pengrajin kriya, atau pemilik homestay desa? Bergabunglah dengan NuSaJoy untuk menjangkau pelancong sadar budaya tanpa potongan komisi yang memberatkan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-[18px] bg-[#FAF4DD] border border-[#DDE2D9] space-y-1.5">
                <span className="font-['Outfit'] text-[16px] font-bold text-[#174D36]">Bebas Biaya Daftar</span>
                <p className="text-[12px] text-[#68736D]">Tidak ada pungutan pendaftaran untuk sanggar dan warga desa.</p>
              </div>
              <div className="p-4 rounded-[18px] bg-[#FAF4DD] border border-[#DDE2D9] space-y-1.5">
                <span className="font-['Outfit'] text-[16px] font-bold text-[#174D36]">Tarif Ditentukan Sendiri</span>
                <p className="text-[12px] text-[#68736D]">Kamu menetapkan nilai jerih payahmu secara mandiri dan bermartabat.</p>
              </div>
              <div className="p-4 rounded-[18px] bg-[#FAF4DD] border border-[#DDE2D9] space-y-1.5">
                <span className="font-['Outfit'] text-[16px] font-bold text-[#174D36]">Pelatihan Ramah Tamu</span>
                <p className="text-[12px] text-[#68736D]">Dukungan workshop penceritaan dan manajemen reservasi digital.</p>
              </div>
            </div>

            <button
              onClick={() => alert('Terima kasih atas ketertarikanmu! Formulir pendaftaran mitra budaya telah dikirimkan ke email terdaftar.')}
              className="px-6 py-3 rounded-[14px] bg-[#174D36] text-white font-semibold text-[14px] shadow-sm hover:bg-[#0F3524] transition-all cursor-pointer"
            >
              Ajukan Kemitraan Komunitas
            </button>
          </div>
        )}

        {/* SUB-VIEW 0: RINGKASAN AKUN (DEFAULT) */}
        {activeSubTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#FFFDF7] rounded-[24px] p-6 border border-[#DDE2D9] space-y-4">
              <h3 className="font-['Outfit'] text-[17px] font-bold text-[#17251E] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#174D36]">tune</span>
                Preferensi Personalisasi Kamu
              </h3>
              <div className="space-y-2.5 text-[13px]">
                <div className="flex justify-between py-1.5 border-b border-[#DDE2D9]/60">
                  <span className="text-[#68736D]">Ritme Perjalanan:</span>
                  <strong className="text-[#17251E]">Santai & Menikmati</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#DDE2D9]/60">
                  <span className="text-[#68736D]">Minat Favorit:</span>
                  <strong className="text-[#17251E]">Kuliner Tradisi, Sejarah, Kriya</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#DDE2D9]/60">
                  <span className="text-[#68736D]">Rentang Anggaran:</span>
                  <strong className="text-[#17251E]">Menengah (Rp100k - Rp250k)</strong>
                </div>
              </div>
              <button
                onClick={() => onNavigateExplore('rekomendasi')}
                className="w-full py-2.5 rounded-xl bg-[#FAF4DD] hover:bg-[#EEE8D2] text-[#174D36] text-[13px] font-semibold border border-[#DDE2D9] transition-all cursor-pointer"
              >
                Atur Ulang Preferensi di Rekomendasi
              </button>
            </div>

            <div className="bg-[#FFFDF7] rounded-[24px] p-6 border border-[#DDE2D9] space-y-4">
              <h3 className="font-['Outfit'] text-[17px] font-bold text-[#17251E] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#174D36]">favorite</span>
                Dampak yang Kamu Ciptakan
              </h3>
              <div className="bg-[#FAF4DD] p-4 rounded-[18px] border border-[#DDE2D9] space-y-2 text-[13px]">
                <p className="text-[#17251E] font-medium">
                  Melalui 3 perjalananmu bersama NuSaJoy, kamu telah menyumbang:
                </p>
                <div className="pt-1">
                  <span className="font-['Outfit'] text-[22px] font-bold text-[#174D36]">
                    Rp48.500
                  </span>
                  <p className="text-[12px] text-[#68736D]">
                    ke Dana Konservasi Budaya Mandiri untuk pelestarian rumah adat Kotagede.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

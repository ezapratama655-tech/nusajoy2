/**
 * @file src/components/QuickTripGateModal.jsx
 * NuSaJoy Quick Trip Gate untuk Penginapan & Transportasi
 *
 * Aturan Bagian 2: jalur kedua (pencarian bebas di Beranda) tanpa trip aktif harus
 * mengajak pengguna membuat trip dulu. Booking tidak boleh berjalan tanpa konteks trip.
 *
 * Perbaikan: Esc/backdrop menutup modal, semua callback aman bila tidak diberikan,
 * atribut dialog untuk aksesibilitas.
 */

import useModalBehavior, { getBackdropProps } from '../hooks/useModalBehavior.js';

export default function QuickTripGateModal({
  isOpen,
  onClose,
  targetType, // 'stay' | 'transport'
  hasActiveTrip = false,
  activeTripTitle = '',
  onProceedWithTrip,
  onCreateNewTrip,
}) {
  useModalBehavior(isOpen, onClose);

  if (!isOpen) return null;

  const isStay = targetType === 'stay';
  const title = isStay ? 'Rekomendasi Penginapan Budaya' : 'Sewa Transportasi Ramah Lingkungan';
  const targetLabel = isStay ? 'Penginapan' : 'Transport';

  const handlePrimary = () => {
    onClose?.();
    if (hasActiveTrip) onProceedWithTrip?.();
    else onCreateNewTrip?.();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      {...getBackdropProps(onClose)}
    >
      <div className="bg-[#FFFDF7] rounded-[24px] max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#DDE2D9] p-6 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-[#CFEACB] text-[#174D36] mx-auto flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl">{isStay ? 'cottage' : 'electric_rickshaw'}</span>
        </div>

        <div>
          <span className="text-[12px] font-bold text-[#B5653A] font-['Plus_Jakarta_Sans']">
            Jalur masuk kedua (pencarian bebas)
          </span>
          <h3 className="font-['Outfit'] text-[20px] font-bold text-[#17251E] mt-1">{title}</h3>
          <p className="text-[14px] text-[#68736D] mt-2 leading-relaxed">
            {hasActiveTrip
              ? `Penginapan dan transportasi akan diselaraskan dengan titik rute di perjalanan "${activeTripTitle}".`
              : 'NuSaJoy menyusun penginapan dan transportasi berdasarkan lokasi aktivitasmu agar tidak terjebak macet. Mulai dengan membuat trip dulu.'}
          </p>
        </div>

        {hasActiveTrip ? (
          <div className="bg-[#FAF4DD] p-4 rounded-[18px] border border-[#DDE2D9] text-left text-[13px] space-y-2">
            <div className="flex items-center gap-2 text-[#174D36] font-semibold">
              <span className="material-symbols-outlined text-base">task_alt</span>
              <span>Trip aktif ditemukan</span>
            </div>
            <p className="text-[#17251E] font-medium pl-6">{activeTripTitle}</p>
          </div>
        ) : (
          <div className="bg-[#FAF4DD] p-4 rounded-[18px] border border-[#DDE2D9] text-left text-[13px]">
            <div className="flex items-start gap-2 text-[#B5653A] font-medium">
              <span className="material-symbols-outlined text-base mt-0.5 shrink-0">info</span>
              <span>Belum ada trip aktif. Pemesanan membutuhkan konteks tanggal dan wilayah kota.</span>
            </div>
          </div>
        )}

        <div className="pt-2 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handlePrimary}
            className="w-full py-3.5 px-4 rounded-[14px] bg-[#174D36] hover:bg-[#0F3524] text-white font-semibold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            {hasActiveTrip ? (
              <>
                <span>Lanjut ke My Trip & pilih {targetLabel}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">add_location_alt</span>
                <span>Buat trip baru dulu</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-[14px] text-[#68736D] hover:text-[#17251E] text-[13px] font-medium transition-colors cursor-pointer"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}

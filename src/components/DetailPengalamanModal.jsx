import useModalBehavior, { getBackdropProps } from '../hooks/useModalBehavior.js';
import { getItemImage, getItemPriceLabel, getItemTitle, getLocationLabel } from '../utils/format.js';

export default function DetailPengalamanModal({
  isOpen, experience, onClose, onAddToTrip, onOpenBookingSummary,
  onOpenGuideDetail, isFavorited, onToggleFavorite,
}) {
  const { modalRef } = useModalBehavior({ isOpen: isOpen && Boolean(experience), onClose });
  if (!isOpen || !experience) return null;
  const title = getItemTitle(experience);
  const highlights = Array.isArray(experience.highlights) ? experience.highlights : [];
  const included = Array.isArray(experience.included) ? experience.included : [];
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#17251E]/60 p-4" {...getBackdropProps({ onClose })}>
      <section ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="experience-detail-title" tabIndex={-1}
        className="relative max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-[#FFFDF7] shadow-2xl">
        <button type="button" onClick={onClose} aria-label="Tutup detail pengalaman" className="absolute right-4 top-4 z-10 rounded-full bg-white px-4 py-2 font-semibold shadow">Tutup</button>
        <img src={getItemImage(experience)} alt={title} className="h-56 w-full object-cover sm:h-72" />
        <div className="space-y-5 p-6 sm:p-8">
          <div>
            <p className="text-sm text-[#68736D]">{experience.category} · {getLocationLabel(experience)}</p>
            <h2 id="experience-detail-title" className="mt-2 text-2xl font-bold text-[#174D36]">{title}</h2>
            <p className="mt-3 leading-relaxed">{experience.description}</p>
          </div>
          <div className="flex flex-wrap gap-4 rounded-2xl bg-[#F4EED8] p-4 text-sm">
            <span>{getItemPriceLabel(experience)}</span>
            {experience.durationText && <span>{experience.durationText}</span>}
            {experience.maxGuests && <span>Maksimal {experience.maxGuests} peserta</span>}
            {experience.rating && <span>Rating {experience.rating}</span>}
          </div>
          {highlights.length > 0 && <div><h3 className="font-semibold">Yang akan kamu jelajahi</h3><ul className="mt-2 list-disc space-y-2 pl-5">{highlights.map((item) => <li key={item}>{item}</li>)}</ul></div>}
          {included.length > 0 && <div><h3 className="font-semibold">Sudah termasuk</h3><ul className="mt-2 list-disc space-y-2 pl-5">{included.map((item) => <li key={item}>{item}</li>)}</ul></div>}
          {experience.meetingPoint && <p><strong>Titik kumpul:</strong> {experience.meetingPoint}</p>}
          {experience.guide && <button type="button" className="text-left font-semibold text-[#174D36] underline" onClick={() => onOpenGuideDetail?.(experience.guide)}>Kenali pemandu: {experience.guide.name}</button>}
          <div className="flex flex-wrap gap-3 border-t border-[#DDE2D9] pt-5">
            <button type="button" aria-pressed={isFavorited} className="rounded-xl border border-[#174D36] px-4 py-3" onClick={() => onToggleFavorite?.(experience)}>{isFavorited ? 'Hapus dari favorit' : 'Simpan ke favorit'}</button>
            <button type="button" className="rounded-xl bg-[#F4EED8] px-4 py-3 font-semibold" onClick={() => onAddToTrip?.(experience)}>Tambah ke My Trip</button>
            <button type="button" className="rounded-xl bg-[#174D36] px-4 py-3 font-semibold text-white" onClick={() => onOpenBookingSummary?.({ ...experience, type: 'experience' })}>Lihat ringkasan reservasi</button>
          </div>
        </div>
      </section>
    </div>
  );
}

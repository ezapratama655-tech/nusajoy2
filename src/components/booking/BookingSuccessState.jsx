import { Link } from 'react-router-dom';
import SimulatedPayment from './SimulatedPayment.jsx';

export default function BookingSuccessState({ confirmedOrder, customerName, onClose, onGoToMyTrip, onOrderChange }) {
  if (!confirmedOrder) return <p role="alert">Data pesanan belum tersedia. Tutup jendela ini dan coba lagi.</p>;
  const date = confirmedOrder.date
    ? new Date(`${confirmedOrder.date}T00:00:00`).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-';
  return (
    <div className="p-5 sm:p-7">
      <h3 className="text-xl font-bold">Pesanan simulasi tersimpan</h3>
      <p className="mt-2 text-sm">Terima kasih, {customerName}. Pesanan ini hanya untuk mencoba alur aplikasi.</p>
      <SimulatedPayment order={confirmedOrder} onOrderChange={onOrderChange} />
      <div className="rounded-2xl border border-[#DDE2D9] bg-[#FFFDF7] p-5">
        <h4 className="font-bold">{confirmedOrder.title}</h4>
        <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div><dt>Kode pesanan simulasi</dt><dd className="break-all font-semibold">{confirmedOrder.id}</dd></div>
          <div><dt>Tanggal</dt><dd>{date}</dd></div>
          <div><dt>Jumlah peserta</dt><dd>{confirmedOrder.guestsCount || 1} orang</dd></div>
          <div><dt>Total simulasi</dt><dd className="font-semibold">Rp{Number(confirmedOrder.totalPrice).toLocaleString('id-ID')}</dd></div>
        </dl>
        {confirmedOrder.location && <p className="mt-3 text-sm">Lokasi: {confirmedOrder.location}</p>}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        {confirmedOrder.owner !== 'guest' && <Link to="/account" onClick={onClose} className="rounded-xl bg-[#174D36] px-4 py-3 text-sm font-semibold text-white">Lihat pesanan</Link>}
        {onGoToMyTrip && <button type="button" onClick={onGoToMyTrip} className="rounded-xl bg-[#174D36] px-4 py-3 text-sm font-semibold text-white">Buka My Trip</button>}
        <button type="button" onClick={onClose} className="rounded-xl border border-[#174D36] px-4 py-3 text-sm font-semibold">Tutup</button>
      </div>
    </div>
  );
}

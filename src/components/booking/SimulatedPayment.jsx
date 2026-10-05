import { useRef, useState } from 'react';
import { demoPaymentService } from '../../service/demoPaymentService.js';
import './SimulatedPayment.css';

export default function SimulatedPayment({ order, onOrderChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  if (!order?.demoPayment) return null;
  const succeeded = order.paymentStatus === 'succeeded';
  const failed = order.paymentStatus === 'failed';

  async function simulate(status) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError('');
    try {
      const updated = await demoPaymentService.updatePayment(order, status);
      onOrderChange?.(updated);
    } catch (requestError) {
      setError(requestError.message || 'Simulasi belum dapat disimpan. Coba lagi.');
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <section className="simulated-payment" aria-label="Simulasi pembayaran">
      <strong>Simulasi — tidak ada transaksi uang</strong>
      <p>Metode: {order.paymentMethod}. QRIS/VA ini hanya contoh; tidak ada kode untuk dibayar.</p>
      <p className="simulated-payment-status" role="status">
        {succeeded ? `Pembayaran berhasil (simulasi). ${order.status}.` :
          failed ? 'Pembayaran gagal (simulasi). Kamu bisa mencoba lagi.' : 'Menunggu pembayaran (simulasi). Pilih hasil untuk mencoba alurnya.'}
      </p>
      <small>{order.owner === 'guest' ? 'Tersimpan di browser ini. Login sebelum membuat pesanan untuk menyimpannya ke akun.' : 'Tersimpan di akun Supabase kamu.'}</small>
      {!succeeded && (
        <div className="simulated-payment-actions">
          {failed ? <button type="button" disabled={busy} onClick={() => simulate('pending')}>Coba lagi</button> : <>
            <button type="button" disabled={busy} onClick={() => simulate('succeeded')}>Simulasikan berhasil</button>
            <button type="button" disabled={busy} onClick={() => simulate('failed')}>Simulasikan gagal</button>
          </>}
        </div>
      )}
      {busy && <p role="status">Menyimpan hasil simulasi...</p>}
      {error && <p className="simulated-payment-error" role="alert">{error}</p>}
    </section>
  );
}

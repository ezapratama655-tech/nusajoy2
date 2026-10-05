import SimulatedPayment from './SimulatedPayment.jsx';

export default function DemoOrdersPanel({ orders = [], onOrderChange }) {
  const demos = orders.filter((order) => order.demoPayment);
  if (!demos.length) return null;
  return (
    <section style={{ marginTop: 24 }} aria-label="Pesanan simulasi">
      <h2>Pesanan simulasi</h2>
      <p>Status tersimpan setelah refresh. Tidak ada transaksi uang atau reservasi nyata.</p>
      {demos.map((order) => (
        <article key={order.id} style={{ marginTop: 16 }}>
          <h3>{order.title}</h3>
          <p>{order.date} · Rp{Number(order.totalPrice).toLocaleString('id-ID')} · {order.status}</p>
          <SimulatedPayment order={order} onOrderChange={onOrderChange} />
        </article>
      ))}
    </section>
  );
}

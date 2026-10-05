import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, CheckCircle2, ClipboardList, RefreshCw, Store, Plus, Pencil, Archive, ArrowUpRight } from 'lucide-react';
import { partnerService } from '../../service/partnerService.js';
import { EMPTY_LISTING, FULFILLMENT_LABELS, getPartnerStats } from '../../utils/partner.js';
import './PartnerDashboard.css';

const money = (amount) => `Rp${Number(amount || 0).toLocaleString('id-ID')}`;
const today = () => new Date().toLocaleDateString('en-CA');
const emptyData = { listings: [], reservations: [], availability: [] };

export default function PartnerDashboard({ user, role, onLogout, loggingOut = false, service = partnerService }) {
  const kind = role === 'local_guide' ? 'guide' : 'business';
  const isGuide = kind === 'guide';
  const [tab, setTab] = useState('overview');
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editor, setEditor] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [reservationFilter, setReservationFilter] = useState('all');
  const [schedule, setSchedule] = useState({ listing_id: '', available_date: today(), start_time: '09:00', end_time: '17:00', capacity: 1, is_available: true });
  const generation = useRef(0);
  const mutation = useRef(false);
  const active = useRef(false);

  const load = useCallback(async () => {
    const request = ++generation.current;
    setLoading(true);
    setError('');
    try {
      const result = await service.load(user.id, kind);
      if (active.current && generation.current === request) setData(result);
    } catch (requestError) {
      if (active.current && generation.current === request) setError(requestError.message || 'Dashboard gagal dimuat.');
    } finally {
      if (active.current && generation.current === request) setLoading(false);
    }
  }, [service, user.id, kind]);

  useEffect(() => {
    active.current = true;
    queueMicrotask(() => { if (active.current) void load(); });
    return () => { active.current = false; generation.current += 1; };
  }, [load]);

  async function run(operation, success) {
    if (mutation.current) return false;
    mutation.current = true;
    setBusy(true); setError(''); setMessage('');
    try {
      await operation();
      if (!active.current) return false;
      setMessage(success);
      await load();
      return true;
    } catch (requestError) {
      if (active.current) setError(requestError.message || 'Perubahan belum dapat disimpan.');
      return false;
    } finally {
      mutation.current = false;
      if (active.current) setBusy(false);
    }
  }

  const stats = useMemo(() => getPartnerStats(data.listings, data.reservations), [data]);
  const listings = data.listings.filter((l) => showArchived ? l.archived : !l.archived);
  const reservations = data.reservations.filter((o) => reservationFilter === 'all' || o.fulfillment_status === reservationFilter);
  const selectedListing = data.listings.find((l) => l.id === schedule.listing_id);
  const tabs = [ ['overview', 'Ringkasan'], ['listings', isGuide ? 'Profil & pengalaman' : 'Bisnis & layanan'], ['schedule', 'Jadwal'], ['reservations', 'Reservasi'] ];
  function openEditor(listing) {
    setError(''); setMessage('');
    setEditor(listing ? { ...listing, languages: listing.languages.join(', ') } : { ...EMPTY_LISTING, category: isGuide ? 'Budaya' : 'Kuliner', id: crypto.randomUUID(), isNew: true });
    setTab('listings');
  }
  function field(key, value) { setEditor((current) => ({ ...current, [key]: value })); }

  return (
    <main className="partner-dashboard" aria-busy={loading || busy}>
      <div className="partner-shell">
        <header className="partner-header">
          <div><span className="partner-eyebrow">NUSAJOY · MITRA LOKAL</span><h1>Dashboard {isGuide ? 'pemandu' : 'bisnis'}</h1><p>Halo, {user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Mitra NuSaJoy'}. Kelola layanan dan reservasi kamu.</p></div>
          <div className="partner-actions"><button onClick={() => void load()} disabled={loading || busy}><RefreshCw size={16} /> Muat ulang</button>{onLogout && <button onClick={async () => { const logoutError = await onLogout(); if (logoutError && active.current) setError(logoutError.message || 'Gagal keluar dari akun.'); }} disabled={busy || loggingOut}>{loggingOut ? 'Keluar...' : 'Keluar'}</button>}</div>
        </header>
        <div className="partner-demo-note"><CheckCircle2 size={18} /><p><strong>Reservasi dan pembayaran masih simulasi.</strong> Nilai di dashboard ini bukan pendapatan nyata. Profil yang kamu publikasikan akan tampil di katalog.</p></div>
        <div className="partner-stats">
          <Stat icon={<Store />} label="Layanan dipublikasikan" value={stats.published} />
          <Stat icon={<ClipboardList />} label="Menunggu konfirmasi" value={stats.waiting} />
          <Stat icon={<CalendarDays />} label="Reservasi dikonfirmasi" value={stats.confirmed} />
          <Stat icon={<CheckCircle2 />} label="Nilai simulasi selesai" value={money(stats.simulationTotal)} hint={`${stats.completed} reservasi selesai`} />
        </div>
        <nav className="partner-tabs" aria-label="Navigasi dashboard mitra">{tabs.map(([id, label]) => <button key={id} aria-pressed={tab === id} onClick={() => { setTab(id); setMessage(''); }} disabled={busy}>{label}</button>)}</nav>
        {error && <div className="partner-error" role="alert">{error}<button disabled={busy || loading} onClick={() => void load()}>Coba muat ulang</button></div>}
        {message && <p className="partner-message" role="status">{message}</p>}
        {loading ? <div className="partner-panel" role="status">Memuat layanan dan reservasi...</div> : <>
          {tab === 'overview' && <section className="partner-overview">
            <div className="partner-panel"><span className="partner-eyebrow">MULAI DARI SINI</span><h2>{data.listings.length ? 'Kelola aktivitas layananmu' : 'Siapkan layanan pertamamu'}</h2><p>Lengkapi profil, tentukan tarif, lalu publikasikan. Atur tanggal tersedia sebelum menerima reservasi.</p><div className="partner-actions"><button className="primary" onClick={() => openEditor()} disabled={Boolean(error)}><Plus size={17} /> Tambah layanan</button><button onClick={() => setTab('schedule')}>Atur jadwal</button></div></div>
            <div className="partner-panel"><h2>Reservasi masuk</h2><p>{stats.waiting ? `${stats.waiting} pembayaran simulasi berhasil dan membutuhkan konfirmasi kamu.` : 'Belum ada reservasi yang menunggu konfirmasi.'}</p><button onClick={() => setTab('reservations')}>Lihat reservasi <ArrowUpRight size={16} /></button><Link to={isGuide ? '/guides' : '/local-business'}>Buka katalog publik</Link></div>
          </section>}
          {tab === 'listings' && <section className="partner-panel">
            <div className="partner-section-head"><div><h2>{isGuide ? 'Profil & pengalaman saya' : 'Bisnis & layanan saya'}</h2><p>Draf hanya terlihat oleh kamu. Arsip dapat dipulihkan tanpa menghapus riwayat reservasi.</p></div><button className="primary" onClick={() => openEditor()} disabled={busy || Boolean(error)}><Plus size={16} /> Tambah layanan</button></div>
            <label className="partner-check"><input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} /> Tampilkan arsip</label>
            {editor && <form className="partner-editor" onSubmit={async (e) => {
              e.preventDefault();
              if (await run(() => service.saveListing(user.id, kind, editor, editor.isNew ? undefined : editor.id), 'Layanan berhasil disimpan.')) setEditor(null);
            }}>
              <h3>{editor.isNew ? 'Layanan baru' : 'Edit layanan'}</h3>
              <fieldset disabled={busy}>
                <div className="partner-form-grid">
                  <Input label={isGuide ? 'Nama profil / pengalaman' : 'Nama bisnis / layanan'} value={editor.title} onChange={(v) => field('title', v)} required maxLength={150} />
                  <label>Kategori<select value={editor.category} onChange={(e) => field('category', e.target.value)}>{[...new Set(['Budaya','Alam','Kuliner','Petualangan','Akomodasi','Kriya','Aktivitas','Produk Lokal', editor.category])].filter(Boolean).map((c) => <option key={c}>{c}</option>)}</select></label>
                  <Input label="Lokasi / kota" value={editor.location} onChange={(v) => field('location', v)} required maxLength={250} />
                  <Input label={`Tarif ${isGuide ? 'per trip' : 'per peserta'} (Rp)`} type="number" value={editor.price} onChange={(v) => field('price', v)} required min={1} max={9999999999} />
                  <Input label="Alamat / titik layanan" value={editor.address} onChange={(v) => field('address', v)} maxLength={500} />
                  <Input label="URL foto (HTTPS)" type="url" value={editor.image_url} onChange={(v) => field('image_url', v)} />
                  <Input label="Kontak publik (opsional)" type="tel" value={editor.phone} onChange={(v) => field('phone', v)} maxLength={25} />
                  <Input label={isGuide ? 'Bahasa (pisahkan dengan koma)' : 'Jam operasional'} value={isGuide ? editor.languages : editor.opening_hours} onChange={(v) => field(isGuide ? 'languages' : 'opening_hours', v)} maxLength={250} />
                </div>
                <label>Deskripsi<textarea value={editor.description} onChange={(e) => field('description', e.target.value)} maxLength={3000} rows={4} /></label>
                <label className="partner-check"><input type="checkbox" checked={editor.published} onChange={(e) => field('published', e.target.checked)} /> Publikasikan di katalog {isGuide ? 'pemandu' : 'bisnis'}</label>
                <p className="partner-help">Foto dan nomor kontak pada profil yang dipublikasikan dapat dilihat pengunjung katalog.</p>
                <div className="partner-actions"><button type="submit" className="primary">{busy ? 'Menyimpan...' : 'Simpan layanan'}</button><button type="button" onClick={() => setEditor(null)}>Batal</button></div>
              </fieldset>
            </form>}
            {!listings.length && <Empty text={showArchived ? 'Belum ada layanan yang diarsipkan.' : 'Belum ada layanan. Tambahkan profil atau layanan pertamamu.'} />}
            <div className="partner-listings">{listings.map((l) => <article key={l.id} className="partner-listing">
              {l.image_url && <img src={l.image_url} alt={l.title} />}
              <div><span className={`partner-badge ${l.published ? 'green' : ''}`}>{l.archived ? 'Arsip' : l.published ? 'Dipublikasikan' : 'Draf'}</span><h3>{l.title}</h3><p>{l.category} · {l.location}</p><strong>{money(l.price)} / {isGuide ? 'trip' : 'peserta'}</strong><p>{l.description || 'Deskripsi belum diisi.'}</p></div>
              <div className="partner-actions">{l.archived ? <button disabled={busy} onClick={() => void run(() => service.archiveListing(user.id, l, false), 'Layanan dipulihkan sebagai draf.')}>Pulihkan</button> : <><button disabled={busy} onClick={() => openEditor(l)}><Pencil size={15} /> Edit</button><button disabled={busy} onClick={() => void run(() => service.archiveListing(user.id, l, true), 'Layanan diarsipkan; riwayat reservasi tetap tersedia.')}><Archive size={15} /> Arsipkan</button>{l.published && <Link to={isGuide ? `/guide/${l.id}` : '/local-business'}>Lihat di katalog <ArrowUpRight size={15} /></Link>}</>}</div>
            </article>)}</div>
          </section>}
          {tab === 'schedule' && <section className="partner-panel">
            <h2>Jadwal & kapasitas</h2><p>Atur kapasitas per hari. Reservasi pemandu beberapa hari membutuhkan jadwal tersedia untuk setiap harinya. Jika belum ada jadwal, layanan belum membatasi tanggal.</p>
            {!data.listings.some((l) => !l.archived) ? <Empty text="Tambahkan layanan terlebih dahulu untuk mengatur jadwal." /> : <form className="partner-editor" onSubmit={(e) => { e.preventDefault(); void run(() => service.saveAvailability(user.id, schedule), 'Jadwal berhasil disimpan.'); }}>
              <fieldset disabled={busy} className="partner-form-grid">
                <label>Layanan<select required value={schedule.listing_id} onChange={(e) => setSchedule({ ...schedule, listing_id: e.target.value })}><option value="">Pilih layanan</option>{data.listings.filter((l) => !l.archived).map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}</select></label>
                <Input label="Tanggal tersedia" type="date" min={today()} required value={schedule.available_date} onChange={(v) => setSchedule({ ...schedule, available_date: v })} />
                <Input label="Jam mulai" type="time" required value={schedule.start_time} onChange={(v) => setSchedule({ ...schedule, start_time: v })} />
                <Input label="Jam selesai" type="time" required value={schedule.end_time} onChange={(v) => setSchedule({ ...schedule, end_time: v })} />
                <Input label={`Kapasitas ${isGuide ? 'pemesanan' : 'peserta'} per hari`} type="number" required min={1} max={100} value={schedule.capacity} onChange={(v) => setSchedule({ ...schedule, capacity: v })} />
                <label className="partner-check"><input type="checkbox" checked={schedule.is_available} onChange={(e) => setSchedule({ ...schedule, is_available: e.target.checked })} /> Tersedia</label>
                <button className="primary" type="submit" disabled={!selectedListing}>Simpan jadwal</button>
              </fieldset>
            </form>}
            {!data.availability.length && <Empty text="Belum ada jadwal yang disimpan." />}
            <div className="partner-table-wrap"><table><thead><tr><th>Layanan</th><th>Tanggal & jam</th><th>Kapasitas</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{data.availability.map((a) => <tr key={a.id}><td>{data.listings.find((l) => l.id === a.listing_id)?.title}</td><td>{a.available_date}<small>{a.start_time.slice(0,5)}–{a.end_time.slice(0,5)}</small></td><td>{a.capacity}</td><td>{a.is_available ? 'Tersedia' : 'Ditutup'}</td><td><button disabled={busy} onClick={() => { setSchedule({ ...a, start_time: a.start_time.slice(0,5), end_time: a.end_time.slice(0,5) }); }}>Edit jadwal</button></td></tr>)}</tbody></table></div>
          </section>}
          {tab === 'reservations' && <section className="partner-panel">
            <div className="partner-section-head"><div><h2>Reservasi masuk</h2><p>Konfirmasikan setelah pembayaran simulasi berhasil. Kapasitas diperiksa saat konfirmasi.</p></div><label>Filter status<select value={reservationFilter} onChange={(e) => setReservationFilter(e.target.value)}><option value="all">Semua</option>{Object.entries(FULFILLMENT_LABELS).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></label></div>
            {!reservations.length && <Empty text="Belum ada reservasi untuk filter ini. Pesanan baru dari layananmu akan muncul di sini." />}
            <div className="partner-orders">{reservations.map((o) => <article key={`${o.user_id}:${o.id}`}>
              <div className="partner-section-head"><div><small className="partner-code">{o.id}</small><h3>{o.order_data.title || 'Reservasi layanan'}</h3><p>{o.order_data.date} · {o.order_data.guestsCount || 1} {isGuide ? 'pemesanan' : 'peserta'}{o.order_data.duration_days ? ` · ${o.order_data.duration_days} hari` : ''}</p></div><span className="partner-badge green">{FULFILLMENT_LABELS[o.fulfillment_status]}</span></div>
              <p>Wisatawan: <strong>{o.order_data.customerName || 'Wisatawan NuSaJoy'}</strong>{o.order_data.customerPhone ? ` · ${o.order_data.customerPhone}` : ''}</p>
              {o.order_data.customerNotes && <p>Catatan: {o.order_data.customerNotes}</p>}
              <p><strong>{money(o.amount)} (simulasi)</strong> · Pembayaran {o.payment_status === 'succeeded' ? 'berhasil' : o.payment_status === 'failed' ? 'gagal' : 'belum selesai'}</p>
              <div className="partner-actions">{o.payment_status === 'succeeded' && ['pending','confirmed'].includes(o.fulfillment_status) ? <>
                <button className="primary" disabled={busy} onClick={() => void run(() => service.updateReservation(user.id, o, o.fulfillment_status === 'pending' ? 'confirmed' : 'completed'), 'Status reservasi simulasi diperbarui.')}>{o.fulfillment_status === 'pending' ? 'Konfirmasi reservasi' : 'Tandai selesai'}</button>
                <button disabled={busy} onClick={() => void run(() => service.updateReservation(user.id, o, 'cancelled'), 'Reservasi simulasi dibatalkan.')}>Batalkan reservasi</button>
              </> : <small>{o.payment_status !== 'succeeded' ? 'Tunggu hasil pembayaran simulasi dari wisatawan.' : 'Reservasi ini sudah selesai atau dibatalkan.'}</small>}</div>
            </article>)}</div>
          </section>}
        </>}
      </div>
    </main>
  );
}

function Stat({ icon, label, value, hint }) { return <article className="partner-stat"><span>{icon}</span><p>{label}</p><strong>{value}</strong>{hint && <small>{hint}</small>}</article>; }
function Empty({ text }) { return <div className="partner-empty"><ClipboardList size={28} /><p>{text}</p></div>; }
function Input({ label, onChange, ...props }) { return <label>{label}<input {...props} onChange={(e) => onChange(e.target.value)} /></label>; }

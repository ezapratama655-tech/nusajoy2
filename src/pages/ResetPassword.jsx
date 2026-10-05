import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient.js';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) setSession(nextSession);
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      setSession(data.session);
      if (error) setError(error.message);
      setLoading(false);
    }).catch(() => {
      if (active) { setError('Gagal memeriksa tautan reset. Silakan coba lagi.'); setLoading(false); }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    setError('');
    if (!session) { setError('Tautan reset sudah kedaluwarsa. Minta tautan baru.'); return; }
    if (password.length < 6) { setError('Password minimal 6 karakter.'); return; }
    if (password !== confirmation) { setError('Konfirmasi password belum sesuai.'); return; }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setPassword('');
      setConfirmation('');
      navigate('/reset-password', { replace: true });
    } catch (error) {
      setError(error.message || 'Password gagal diperbarui.');
    } finally { setSaving(false); }
  }

  return (
    <main className="mx-auto my-16 w-full max-w-md rounded-3xl border border-[#DDE2D9] bg-[#FFFDF7] p-8">
      <h1 className="mb-4 text-2xl font-bold">Atur password baru</h1>
      {loading ? <p role="status">Memeriksa tautan reset...</p> : done ? (
        <div role="status"><p>Password berhasil diperbarui.</p><Link className="mt-4 inline-block underline" to="/account">Buka akun</Link></div>
      ) : !session ? (
        <div><p role="alert">{error || 'Tautan reset tidak valid atau sudah kedaluwarsa.'}</p><Link className="mt-4 inline-block underline" to="/login">Minta tautan reset baru</Link></div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">Password baru
            <input className="rounded-xl border p-3" type="password" autoComplete="new-password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} disabled={saving} />
          </label>
          <label className="flex flex-col gap-2">Konfirmasi password
            <input className="rounded-xl border p-3" type="password" autoComplete="new-password" minLength={6} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} disabled={saving} />
          </label>
          {error && <p role="alert" className="text-red-700">{error}</p>}
          <button className="rounded-xl bg-[#174D36] p-3 font-semibold text-white disabled:opacity-50" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan password'}</button>
        </form>
      )}
    </main>
  );
}

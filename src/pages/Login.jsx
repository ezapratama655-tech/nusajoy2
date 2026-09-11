import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'

function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [session, setSession] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage(null)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage({ type: 'error', text: error.message })
      else navigate('/')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Akun berhasil dibuat! Silakan login.' })
        setMode('login')
      }
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  if (loading) return <div className="container"><p>Memuat...</p></div>

  if (session) {
    return (
      <div className="container">
        <h1>Akun</h1>
        <p style={{ color: 'var(--color-muted)', margin: '0.5rem 0 1.5rem 0' }}>
          Login sebagai <strong>{session.user.email}</strong>
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link to="/local-business" style={secondaryButtonStyle}>
            Kelola Bisnis Lokal
          </Link>
          <Link to="/favorite" style={secondaryButtonStyle}>
            Lihat Favorit Saya
          </Link>
          <button onClick={handleLogout} style={logoutButtonStyle}>
            Logout
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>{mode === 'login' ? 'Login' : 'Daftar Akun'}</h1>
      <p style={{ color: 'var(--color-muted)', margin: '0.5rem 0 1.5rem 0' }}>
        {mode === 'login'
          ? 'Masuk untuk menyimpan favorit dan mengelola bisnismu.'
          : 'Buat akun baru untuk mulai menggunakan NuSaJoy.'}
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </label>

        {message && (
          <p style={{ color: message.type === 'error' ? '#DC2626' : 'var(--color-primary)', fontSize: '0.9rem' }}>
            {message.text}
          </p>
        )}

        <button type="submit" style={buttonStyle}>
          {mode === 'login' ? 'Login' : 'Daftar'}
        </button>
      </form>

      <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
        {mode === 'login' ? (
          <>Belum punya akun?{' '}
            <button type="button" onClick={() => setMode('register')} style={linkButtonStyle}>Daftar di sini</button>
          </>
        ) : (
          <>Sudah punya akun?{' '}
            <button type="button" onClick={() => setMode('login')} style={linkButtonStyle}>Login di sini</button>
          </>
        )}
      </p>
    </div>
  )
}

const inputStyle = {
  display: 'block',
  width: '100%',
  marginTop: '0.4rem',
  padding: '0.65rem',
  borderRadius: '10px',
  border: '1px solid #ddd',
  fontSize: '0.95rem',
}

const buttonStyle = {
  background: 'var(--color-accent)',
  color: 'white',
  border: 'none',
  padding: '0.85rem',
  borderRadius: 'var(--radius-full)',
  fontWeight: 600,
  fontSize: '1rem',
  width: '100%',
}

const secondaryButtonStyle = {
  display: 'block',
  textAlign: 'center',
  background: 'var(--color-primary-light)',
  color: 'var(--color-primary)',
  padding: '0.85rem',
  borderRadius: 'var(--radius-full)',
  fontWeight: 600,
  fontSize: '1rem',
}

const logoutButtonStyle = {
  background: 'none',
  border: '1px solid #ddd',
  color: 'var(--color-muted)',
  padding: '0.85rem',
  borderRadius: 'var(--radius-full)',
  fontWeight: 600,
  fontSize: '1rem',
  cursor: 'pointer',
}

const linkButtonStyle = {
  background: 'none',
  border: 'none',
  color: 'var(--color-primary)',
  fontWeight: 600,
  cursor: 'pointer',
  padding: 0,
  fontSize: '0.9rem',
}

export default Login
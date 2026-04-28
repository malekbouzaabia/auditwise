import { useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function SignIn({ onBack, onSignUp, onLoginSuccess }) {
  const [form,         setForm]         = useState({ email: '', password: '' })
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post(API + '/api/auth/login', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user',  JSON.stringify(res.data.user))
      onLoginSuccess?.(res.data.user)
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f6ff' }}>
      <div style={{ background: 'white', padding: '50px', borderRadius: '20px', maxWidth: '440px', width: '100%', boxShadow: '0 20px 60px rgba(11,31,69,0.1)' }}>

        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#0b1f45', marginBottom: '32px', padding: 0, fontFamily: 'DM Sans, sans-serif' }}>
          Retour
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <div style={{ width: '44px', height: '44px', background: '#1b6fd8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🛡️</div>
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: '800', fontSize: '20px', color: '#0b1f45' }}>AuditWise</span>
        </div>

        <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '24px', fontWeight: '800', color: '#0b1f45', marginBottom: '6px' }}>Connexion</h1>
        <p style={{ fontSize: '13px', color: '#6b8cba', marginBottom: '28px' }}>Acces reserve aux emails autorises</p>

        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '13px', color: '#dc2626', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#0b1f45' }}>Email *</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>✉️</span>
              <input type="email" name="email" placeholder="nom@drax.com" value={form.email} onChange={handle} required
                style={{ width: '100%', border: '1.5px solid #d1e3f8', borderRadius: '8px', padding: '13px 14px 13px 42px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'DM Sans, sans-serif', color: '#0b1f45' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#0b1f45' }}>Mot de passe *</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>🔒</span>
              <input type={showPassword ? 'text' : 'password'} name="password" placeholder="••••••••" value={form.password} onChange={handle} required
                style={{ width: '100%', border: '1.5px solid #d1e3f8', borderRadius: '8px', padding: '13px 42px 13px 42px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'DM Sans, sans-serif', color: '#0b1f45' }} />
              <span onClick={() => setShowPassword(p => !p)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '16px' }}>
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>
          </div>

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '14px', background: loading ? 'rgba(27,111,216,0.5)' : '#1b6fd8', color: 'white', border: 'none', borderRadius: '10px', fontFamily: 'Sora, sans-serif', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px' }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#6b8cba' }}>
          Pas encore de compte ?{' '}
          <span onClick={onSignUp} style={{ color: '#1b6fd8', fontWeight: '600', cursor: 'pointer' }}>S'inscrire</span>
        </p>
      </div>
    </div>
  )
}
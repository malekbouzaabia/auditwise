import { useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:5000'

export default function SignIn({ onBack, onSignUp, onLoginSuccess }) {
  const [step,          setStep]          = useState('login') // 'login' | 'mfa'
  const [form,          setForm]          = useState({ email: '', password: '' })
  const [mfaCode,       setMfaCode]       = useState('')
  const [mfaEmail,      setMfaEmail]      = useState('')
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState('')
  const [showPassword,  setShowPassword]  = useState(false)
  const [success,       setSuccess]       = useState(false)

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  // ── Étape 1 : Login ──────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post(API + '/api/auth/login', form)
      setMfaEmail(form.email)
      setStep('mfa')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  // ── Étape 2 : Vérifier MFA ───────────────────────────────────
  const handleMFA = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await axios.post(API + '/api/auth/verify-mfa', {
        email: mfaEmail,
        code:  mfaCode,
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user',  JSON.stringify(res.data.user))
      setSuccess(true)
      setTimeout(() => onLoginSuccess?.(res.data.user), 800)
    } catch (err) {
      setError(err.response?.data?.message || 'Code incorrect')
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f6ff' }}>
      <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', boxShadow: '0 20px 60px rgba(11,31,69,0.08)' }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '26px', fontWeight: '800', color: '#0b1f45' }}>Connexion réussie !</h2>
        <p style={{ color: '#6b7e99' }}>Redirection en cours...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f6ff', padding: '40px 20px' }}>
      <div style={{ background: 'white', width: '100%', maxWidth: '480px', padding: '50px', borderRadius: '20px', boxShadow: '0 20px 60px rgba(11,31,69,0.08)' }}>

        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#0b1f45', marginBottom: '32px', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>← Retour</button>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{ width: '44px', height: '44px', background: '#1b6fd8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🛡️</div>
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: '800', fontSize: '20px', color: '#0b1f45' }}>AuditWise</span>
        </div>

        {/* ── ÉTAPE 1 : LOGIN ─────────────────────────────────── */}
        {step === 'login' && (
          <>
            <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '24px', fontWeight: '800', color: '#0b1f45', marginBottom: '8px' }}>Connexion</h1>
            <p style={{ fontSize: '13px', color: '#6b8cba', marginBottom: '28px' }}>Réservé aux employés <strong>@drax.com</strong></p>

            {error && (
              <div style={{ background: '#fff0f0', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#dc2626' }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#0b1f45', display: 'block', marginBottom: '6px' }}>Email @drax.com</label>
                <input type="email" name="email" placeholder="nom@drax.com" value={form.email} onChange={handle} required
                  style={{ width: '100%', padding: '13px 16px', fontSize: '14px', border: '1.5px solid #d1e3f8', borderRadius: '10px', outline: 'none', fontFamily: 'DM Sans, sans-serif', color: '#0b1f45', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#1b6fd8'}
                  onBlur={e => e.target.style.borderColor = '#d1e3f8'}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#0b1f45', display: 'block', marginBottom: '6px' }}>Mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} name="password" placeholder="••••••••••" value={form.password} onChange={handle} required
                    style={{ width: '100%', padding: '13px 44px 13px 16px', fontSize: '14px', border: '1.5px solid #d1e3f8', borderRadius: '10px', outline: 'none', fontFamily: 'DM Sans, sans-serif', color: '#0b1f45', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#1b6fd8'}
                    onBlur={e => e.target.style.borderColor = '#d1e3f8'}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '14px', background: loading ? 'rgba(27,111,216,0.5)' : '#1b6fd8', color: 'white', border: 'none', borderRadius: '10px', fontFamily: 'Sora, sans-serif', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {loading ? <><Spinner /> Connexion...</> : 'Se connecter →'}
              </button>

              <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7e99', margin: 0 }}>
                Pas encore de compte ?{' '}
                <button type="button" onClick={onSignUp} style={{ background: 'none', border: 'none', color: '#1b6fd8', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>S'inscrire</button>
              </p>
            </form>
          </>
        )}

        {/* ── ÉTAPE 2 : MFA ───────────────────────────────────── */}
        {step === 'mfa' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔐</div>
              <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '22px', fontWeight: '800', color: '#0b1f45', marginBottom: '8px' }}>Vérification en 2 étapes</h1>
              <p style={{ fontSize: '13px', color: '#6b8cba' }}>
                Un code a été envoyé à<br />
                <strong style={{ color: '#1b6fd8' }}>{mfaEmail}</strong>
              </p>
            </div>

            {error && (
              <div style={{ background: '#fff0f0', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#dc2626' }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleMFA} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#0b1f45', display: 'block', marginBottom: '6px' }}>Code à 6 chiffres</label>
                <input type="text" placeholder="000000" value={mfaCode} onChange={e => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))} required maxLength={6}
                  style={{ width: '100%', padding: '16px', fontSize: '28px', fontWeight: '800', letterSpacing: '12px', textAlign: 'center', border: '2px solid #d1e3f8', borderRadius: '12px', outline: 'none', fontFamily: 'Sora, sans-serif', color: '#0b1f45', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#1b6fd8'}
                  onBlur={e => e.target.style.borderColor = '#d1e3f8'}
                  autoFocus
                />
                <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginTop: '6px' }}>⏱️ Ce code expire dans 10 minutes</p>
              </div>

              <button type="submit" disabled={loading || mfaCode.length !== 6}
                style={{ width: '100%', padding: '14px', background: mfaCode.length === 6 && !loading ? '#1b6fd8' : 'rgba(27,111,216,0.4)', color: 'white', border: 'none', borderRadius: '10px', fontFamily: 'Sora, sans-serif', fontSize: '15px', fontWeight: '700', cursor: mfaCode.length === 6 && !loading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {loading ? <><Spinner /> Vérification...</> : '✅ Valider le code'}
              </button>

              <button type="button" onClick={() => { setStep('login'); setError(''); setMfaCode('') }}
                style={{ background: 'none', border: 'none', color: '#6b8cba', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}>
                ← Retour à la connexion
              </button>
            </form>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function Spinner() {
  return <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
}
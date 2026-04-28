import { useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const COMPANY_SIZES = ['1 - 10 employes', '11 - 50 employes', '51 - 200 employes', '201 - 500 employes', '500+ employes']

const inputBase = {
  border: '1.5px solid #d1e3f8', background: '#ffffff', color: '#0b1f45',
  fontFamily: 'DM Sans, sans-serif', borderRadius: '8px', fontSize: '14px',
  width: '100%', outline: 'none', padding: '13px 14px 13px 42px', transition: 'all 0.2s',
  boxSizing: 'border-box'
}

function InputField({ label, icon, type, name, placeholder, value, onChange, required }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.8px', textTransform: 'uppercase', color: '#0b1f45', fontFamily: 'DM Sans, sans-serif' }}>{label} *</label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none' }}>{icon}</span>
        <input type={type || 'text'} name={name} placeholder={placeholder} value={value} onChange={onChange} required={required}
          style={{ ...inputBase, borderColor: focused ? '#1b6fd8' : '#d1e3f8', boxShadow: focused ? '0 0 0 3px rgba(27,111,216,0.12)' : 'none' }}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
      </div>
    </div>
  )
}

function SelectField({ label, name, value, onChange, required }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.8px', textTransform: 'uppercase', color: '#0b1f45', fontFamily: 'DM Sans, sans-serif' }}>{label} *</label>
      <select name={name} value={value} onChange={onChange} required={required}
        style={{ ...inputBase, padding: '13px 14px', appearance: 'none', cursor: 'pointer', borderColor: focused ? '#1b6fd8' : '#d1e3f8', color: value ? '#0b1f45' : '#aab8cc' }}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
        <option value="" disabled>Selectionner...</option>
        {COMPANY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  )
}

export default function SignUp({ onBack, onSignIn }) {
  const [step,    setStep]    = useState('form')  // 'form' | 'code' | 'success'
  const [form,    setForm]    = useState({ nom: '', prenom: '', email: '', entreprise: '', taille: '', telephone: '', password: '' })
  const [code,    setCode]    = useState('')
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  // Etape 1 : Inscription
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await axios.post(API + '/api/auth/register', form)
      setEmail(form.email)
      setStep('code')
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  // Etape 2 : Verifier code MFA
  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await axios.post(API + '/api/auth/verify-mfa', { email, code })
      setStep('success')
    } catch (err) {
      setError(err.response?.data?.message || 'Code incorrect ou expire')
    } finally {
      setLoading(false)
    }
  }

  // Renvoyer le code
  const handleResend = async () => {
    setError('')
    setLoading(true)
    try {
      await axios.post(API + '/api/auth/register', form)
      setError('')
      alert('Nouveau code envoye !')
    } catch (err) {
      setError('Erreur envoi code')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f6ff' }}>
      <div style={{ background: 'white', padding: '60px 50px', borderRadius: '20px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(11,31,69,0.1)' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '26px', fontWeight: '800', color: '#0b1f45', marginBottom: '12px' }}>Compte active !</h2>
        <p style={{ fontSize: '14px', color: '#6b8cba', lineHeight: '1.7', marginBottom: '28px' }}>
          Votre compte AuditWise est actif.<br />Vous pouvez maintenant vous connecter.
        </p>
        <button onClick={onSignIn || onBack}
          style={{ width: '100%', padding: '14px', background: '#1b6fd8', color: 'white', border: 'none', borderRadius: '10px', fontFamily: 'Sora, sans-serif', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
          Se connecter
        </button>
      </div>
    </div>
  )

  if (step === 'code') return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f6ff' }}>
      <div style={{ background: 'white', padding: '50px', borderRadius: '20px', maxWidth: '440px', width: '100%', boxShadow: '0 20px 60px rgba(11,31,69,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '22px', fontWeight: '800', color: '#0b1f45', marginBottom: '8px' }}>Verification de votre email</h2>
          <p style={{ fontSize: '13px', color: '#6b8cba', lineHeight: '1.6' }}>
            Un code a 6 chiffres a ete envoye a<br />
            <strong style={{ color: '#1b6fd8' }}>{email}</strong>
          </p>
        </div>

        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '13px', color: '#dc2626', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#0b1f45' }}>Code de verification *</label>
            <input
              value={code} onChange={e => setCode(e.target.value)} required maxLength={6}
              placeholder="000000"
              style={{ border: '2px solid #1b6fd8', borderRadius: '12px', padding: '16px', fontSize: '28px', fontWeight: '800', textAlign: 'center', letterSpacing: '12px', outline: 'none', color: '#0b1f45', fontFamily: 'Sora, sans-serif', boxSizing: 'border-box', width: '100%' }}
            />
          </div>

          <button type="submit" disabled={loading || code.length !== 6}
            style={{ width: '100%', padding: '14px', background: loading || code.length !== 6 ? 'rgba(27,111,216,0.4)' : '#1b6fd8', color: 'white', border: 'none', borderRadius: '10px', fontFamily: 'Sora, sans-serif', fontSize: '15px', fontWeight: '700', cursor: loading || code.length !== 6 ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Verification...' : 'Activer mon compte'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <span style={{ fontSize: '13px', color: '#6b8cba' }}>Pas recu le code ? </span>
          <span onClick={handleResend} style={{ fontSize: '13px', color: '#1b6fd8', fontWeight: '600', cursor: 'pointer' }}>
            Renvoyer
          </span>
        </div>

        <button onClick={() => setStep('form')} style={{ width: '100%', marginTop: '12px', padding: '10px', background: '#f0f6ff', border: 'none', borderRadius: '10px', color: '#6b8cba', fontSize: '13px', cursor: 'pointer' }}>
          Modifier mes informations
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f6ff' }}>
      <div style={{ background: 'linear-gradient(160deg, #f0f6ff 0%, #e8f2ff 100%)', padding: '50px 60px', width: '100%', maxWidth: '680px', borderRadius: '20px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#0b1f45', marginBottom: '32px', padding: 0, fontFamily: 'DM Sans, sans-serif' }}>
          Retour
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <div style={{ width: '44px', height: '44px', background: '#1b6fd8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🛡️</div>
          <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: '800', fontSize: '20px', color: '#0b1f45' }}>AuditWise</span>
        </div>

        <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '24px', fontWeight: '800', color: '#0b1f45', marginBottom: '6px' }}>
          Creer votre compte
        </h1>
        <p style={{ fontSize: '13px', color: '#6b8cba', marginBottom: '28px' }}>
          Reserve aux emails @drax.com, @draexlmaier.com et @gmail.com
        </p>

        {error && (
          <div style={{ background: '#fff0f0', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '13px', color: '#dc2626' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <InputField label="Nom" icon="👤" name="nom" placeholder="Nom" value={form.nom} onChange={handle} required />
            <InputField label="Prenom" icon="👤" name="prenom" placeholder="Prenom" value={form.prenom} onChange={handle} required />
          </div>
          <InputField label="Email" icon="✉️" type="email" name="email" placeholder="nom@drax.com" value={form.email} onChange={handle} required />
          <InputField label="Entreprise" icon="🏢" name="entreprise" placeholder="Nom entreprise" value={form.entreprise} onChange={handle} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <SelectField label="Taille entreprise" name="taille" value={form.taille} onChange={handle} required />
            <InputField label="Telephone" icon="📞" type="tel" name="telephone" placeholder="+216 00 000 000" value={form.telephone} onChange={handle} required />
          </div>
          <InputField label="Mot de passe" icon="🔒" type="password" name="password" placeholder="••••••••" value={form.password} onChange={handle} required />

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '14px', background: loading ? 'rgba(27,111,216,0.5)' : '#1b6fd8', color: 'white', border: 'none', borderRadius: '10px', fontFamily: 'Sora, sans-serif', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px' }}>
            {loading ? 'Creation...' : 'Creer mon compte et recevoir le code'}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#6b8cba' }}>
          Deja un compte ?{' '}
          <span onClick={onSignIn || onBack} style={{ color: '#1b6fd8', fontWeight: '600', cursor: 'pointer' }}>Se connecter</span>
        </p>
      </div>
    </div>
  )
}
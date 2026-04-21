import { useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const COMPANY_SIZES = [
  '1 - 10 employes',
  '11 - 50 employes',
  '51 - 200 employes',
  '201 - 500 employes',
  '500+ employes',
]

const inputBase = {
  border: '1.5px solid #d1e3f8',
  background: '#ffffff',
  color: '#0b1f45',
  fontFamily: 'DM Sans, sans-serif',
  borderRadius: '8px',
  fontSize: '14px',
  width: '100%',
  outline: 'none',
  padding: '13px 14px 13px 42px',
  transition: 'all 0.2s',
}

function InputField({ label, icon, type, name, placeholder, value, onChange, required }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.8px', textTransform: 'uppercase', color: '#0b1f45', fontFamily: 'DM Sans, sans-serif' }}>
        {label} *
      </label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', pointerEvents: 'none' }}>{icon}</span>
        <input
          type={type || 'text'} name={name} placeholder={placeholder} value={value} onChange={onChange} required={required}
          style={{ ...inputBase, borderColor: focused ? '#1b6fd8' : '#d1e3f8', boxShadow: focused ? '0 0 0 3px rgba(27,111,216,0.12)' : 'none' }}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        />
      </div>
    </div>
  )
}

function SelectField({ label, name, value, onChange, required }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.8px', textTransform: 'uppercase', color: '#0b1f45', fontFamily: 'DM Sans, sans-serif' }}>
        {label} *
      </label>
      <div style={{ position: 'relative' }}>
        <select name={name} value={value} onChange={onChange} required={required}
          style={{ ...inputBase, padding: '13px 40px 13px 14px', appearance: 'none', cursor: 'pointer', borderColor: focused ? '#1b6fd8' : '#d1e3f8', color: value ? '#0b1f45' : '#aab8cc' }}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        >
          <option value="" disabled>Selectionner...</option>
          {COMPANY_SIZES.map(s => <option key={s} value={s} style={{ color: '#0b1f45' }}>{s}</option>)}
        </select>
        <svg style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="#6b8cba" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}

export default function SignUp({ onBack }) {
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', entreprise: '', taille: '', telephone: '', password: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await axios.post(API + '/api/auth/register', form)
      console.log(response.data)
      setSubmitted(true)
    } catch (error) {
      console.error(error.response?.data || error.message)
      alert(error.response?.data?.message || "Erreur inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f6ff' }}>
      <div style={{ background: 'linear-gradient(160deg, #f0f6ff 0%, #e8f2ff 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 80px', width: '100%', maxWidth: '700px' }}>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎉</div>
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '26px', fontWeight: '800', color: '#0b1f45', marginBottom: '12px' }}>Inscription reussie !</h2>
            <p style={{ fontSize: '14px', color: '#6b8cba', lineHeight: '1.7', marginBottom: '28px' }}>
              Merci <strong style={{ color: '#0b1f45' }}>{form.prenom}</strong>, votre compte a ete cree.
              Un email de confirmation vous a ete envoye.
            </p>
            <button onClick={onBack} style={{ width: '100%', padding: '14px', background: '#1b6fd8', color: 'white', border: 'none', borderRadius: '10px', fontFamily: 'Sora, sans-serif', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 6px 20px rgba(27,111,216,0.4)' }}>
              Retour accueil
            </button>
          </div>
        ) : (
          <>
            <button onClick={onBack}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#0b1f45', fontFamily: 'DM Sans, sans-serif', marginBottom: '36px', padding: 0 }}
              onMouseEnter={e => e.currentTarget.style.color = '#1b6fd8'}
              onMouseLeave={e => e.currentTarget.style.color = '#0b1f45'}
            >
              Retour
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
              <div style={{ width: '44px', height: '44px', background: '#1b6fd8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 4px 14px rgba(27,111,216,0.4)' }}>🛡️</div>
              <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: '800', fontSize: '20px', color: '#0b1f45' }}>AuditWise</span>
            </div>

            <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '24px', fontWeight: '800', color: '#0b1f45', marginBottom: '8px' }}>
              Creer votre compte <span style={{ color: '#1b6fd8' }}>AuditWise</span>
            </h1>
            <p style={{ fontSize: '14px', color: '#6b8cba', marginBottom: '32px', lineHeight: '1.6' }}>
              Reserve aux emails @drax.com et @gmail.com
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <InputField label="Nom" icon="👤" name="nom" placeholder="Nom" value={form.nom} onChange={handle} required />
                <InputField label="Prenom" icon="👤" name="prenom" placeholder="Prenom" value={form.prenom} onChange={handle} required />
              </div>

              <InputField label="Email" icon="✉️" type="email" name="email" placeholder="nom@drax.com" value={form.email} onChange={handle} required />

              <InputField label="Entreprise" icon="🏢" name="entreprise" placeholder="Nom entreprise" value={form.entreprise} onChange={handle} required />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <SelectField label="Taille entreprise" name="taille" value={form.taille} onChange={handle} required />
                <InputField label="Telephone" icon="📞" type="tel" name="telephone" placeholder="+216 00 000 000" value={form.telephone} onChange={handle} required />
              </div>

              <InputField label="Mot de passe" icon="🔒" type="password" name="password" placeholder="••••••••" value={form.password} onChange={handle} required />

              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '15px', background: loading ? 'rgba(27,111,216,0.5)' : '#1b6fd8', color: 'white', border: 'none', borderRadius: '10px', fontFamily: 'Sora, sans-serif', fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 6px 20px rgba(27,111,216,0.4)', marginTop: '4px' }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1560c0' }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#1b6fd8' }}
              >
                {loading ? 'Creation...' : 'Creer mon compte ->'}
              </button>
            </form>

            <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#6b8cba' }}>
              Deja un compte ?{' '}
              <span onClick={onBack} style={{ color: '#1b6fd8', fontWeight: '600', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >
                Se connecter
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
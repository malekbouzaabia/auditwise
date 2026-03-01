import { useState } from 'react'
import axios from 'axios'
const COMPANY_SIZES = [
  '1 – 10 employés',
  '11 – 50 employés',
  '51 – 200 employés',
  '201 – 500 employés',
  '500+ employés',
]

const RIGHT_FEATURES = [
  { icon: '🔒', title: 'Données chiffrées',    desc: 'Toutes vos données protégées par AES-256' },
  { icon: '✅', title: 'Conformité ISO 27001', desc: 'Suivi continu et rapports automatisés' },
  { icon: '⚡', title: 'Mise en place rapide', desc: 'Opérationnel en moins de 30 minutes' },
]

const CHIPS = [
  { bg: '#22c55e', label: 'Compliance Status', value: '99.2%' },
  { bg: '#3b9eff', label: 'Threats Blocked',   value: '1,284' },
  { bg: '#f59e0b', label: 'Audit Score',       value: 'A+' },
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

function InputField({ label, icon, type = 'text', name, placeholder, value, onChange, required }) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <label style={{
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '0.8px',
        textTransform: 'uppercase',
        color: '#0b1f45',
        fontFamily: 'DM Sans, sans-serif'
      }}>
        {label} *
      </label>

      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute',
          left: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '16px',
          pointerEvents: 'none'
        }}>
          {icon}
        </span>

        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          style={{
            ...inputBase,
            borderColor: focused ? '#1b6fd8' : '#d1e3f8',
            boxShadow: focused ? '0 0 0 3px rgba(27,111,216,0.12)' : 'none',
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
    </div>
  )
}

function SelectField({ label, name, value, onChange, required }) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <label style={{
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '0.8px',
        textTransform: 'uppercase',
        color: '#0b1f45',
        fontFamily: 'DM Sans, sans-serif'
      }}>
        {label} *
      </label>

      <div style={{ position: 'relative' }}>
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          style={{
            ...inputBase,
            padding: '13px 40px 13px 14px',
            appearance: 'none',
            cursor: 'pointer',
            borderColor: focused ? '#1b6fd8' : '#d1e3f8',
            boxShadow: focused ? '0 0 0 3px rgba(27,111,216,0.12)' : 'none',
            color: value ? '#0b1f45' : '#aab8cc',
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          <option value="" disabled>Sélectionner...</option>
          {COMPANY_SIZES.map(s => (
            <option key={s} value={s} style={{ color: '#0b1f45' }}>
              {s}
            </option>
          ))}
        </select>

        <svg
          style={{
            position: 'absolute',
            right: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none'
          }}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="#6b8cba"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}

export default function SignUp({ onBack }) {
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    entreprise: '',
    taille: '',
    telephone: '',
    password: '',
  })

  const [submitted, setSubmitted] = useState(false)

  const handle = e =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
  e.preventDefault()

  try {
    const response = await axios.post(
      'http://localhost:5000/api/auth/register',
      form
    )

    console.log(response.data)
    setSubmitted(true)

  } catch (error) {
    console.error(error.response?.data || error.message)
    alert(error.response?.data?.message || 'Erreur lors de l’inscription')
  }
}

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f0f6ff'
      }}
    >
      <div
        style={{
          background: 'linear-gradient(160deg, #f0f6ff 0%, #e8f2ff 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 80px',
          position: 'relative',
          width: '100%',
          maxWidth: '700px'
        }}
      >
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎉</div>
            <h2 style={{
              fontFamily: 'Sora, sans-serif',
              fontSize: '26px',
              fontWeight: '800',
              color: '#0b1f45',
              letterSpacing: '-0.8px',
              marginBottom: '12px'
            }}>
              Inscription réussie !
            </h2>
            <p style={{ fontSize: '14px', color: '#6b8cba', lineHeight: '1.7', marginBottom: '28px' }}>
              Merci <strong style={{ color: '#0b1f45' }}>{form.prenom}</strong>, votre compte a été créé.<br />
              Un e-mail de confirmation vous a été envoyé.
            </p>
            <button
              onClick={onBack}
              style={{
                width: '100%',
                padding: '14px',
                background: '#1b6fd8',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontFamily: 'Sora, sans-serif',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(27,111,216,0.4)',
                transition: 'all 0.2s',
              }}
            >
              Retour à l'accueil
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={onBack}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                color: '#0b1f45',
                fontFamily: 'DM Sans, sans-serif',
                marginBottom: '36px',
                padding: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#1b6fd8'}
              onMouseLeave={e => e.currentTarget.style.color = '#0b1f45'}
            >
              ← Retour à l'accueil
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                background: '#1b6fd8',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                boxShadow: '0 4px 14px rgba(27,111,216,0.4)',
              }}>
                🛡️
              </div>
              <span style={{
                fontFamily: 'Sora, sans-serif',
                fontWeight: '800',
                fontSize: '20px',
                color: '#0b1f45',
                letterSpacing: '-0.3px',
              }}>
                IFSentry
              </span>
            </div>

            <h1 style={{
              fontFamily: 'Sora, sans-serif',
              fontSize: '24px',
              fontWeight: '800',
              color: '#0b1f45',
              letterSpacing: '-0.5px',
              marginBottom: '8px',
            }}>
              Créer votre compte <span style={{ color: '#1b6fd8' }}>IFSentry</span>
            </h1>

            <p style={{
              fontSize: '14px',
              color: '#6b8cba',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              Commencez gratuitement — aucune carte bancaire requise.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <InputField label="Nom" icon="👤" name="nom" placeholder="nom" value={form.nom} onChange={handle} required />
                <InputField label="Prénom" icon="👤" name="prenom" placeholder="prenom" value={form.prenom} onChange={handle} required />
              </div>

              <InputField label="Adresse e-mail" icon="🖥️" type="email"
                name="email"
                placeholder="nom@entreprise.com"
                value={form.email}
                onChange={handle}
                required
              />

              <InputField label="Nom de l'entreprise" icon="🏢"
                name="entreprise"
                placeholder=""
                value={form.entreprise}
                onChange={handle}
                required
              />
              

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <SelectField label="Taille de l'entreprise"
                  name="taille"
                  value={form.taille}
                  onChange={handle}
                  required
                />

                <InputField label="Téléphone" icon="📞" type="tel"
                  name="telephone"
                  placeholder="+33 6 00 00 00 00"
                  value={form.telephone}
                  onChange={handle}
                  required
                />
              </div>
                <InputField
               label="Mot de passe"
               icon="🔒"
                type="password"
               name="password"
               placeholder="••••••••"
              value={form.password}
              onChange={handle}
              required
              />
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '15px',
                  background: '#1b6fd8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontFamily: 'Sora, sans-serif',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(27,111,216,0.4)',
                  transition: 'all 0.2s',
                  letterSpacing: '-0.2px',
                  marginTop: '4px',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#1560c0'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#1b6fd8'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Créer mon compte gratuitement →
              </button>
              
            </form>

            <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#6b8cba' }}>
              Déjà un compte ?{' '}
              <span
                onClick={onBack}
                style={{ color: '#1b6fd8', fontWeight: '600', cursor: 'pointer' }}
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
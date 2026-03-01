import { useState } from 'react'
import axios from 'axios'
export default function SignIn({ onBack, onSignUp }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
  e.preventDefault()

  try {
    const response = await axios.post(
      'http://localhost:5000/api/auth/login',
      form
    )

    console.log(response.data)

    // Sauvegarder le token
    localStorage.setItem('token', response.data.token)

    // Sauvegarder user si tu veux
    localStorage.setItem('user', JSON.stringify(response.data.user))

    setSubmitted(true)

  } catch (error) {
    console.error(error.response?.data || error.message)
    alert(error.response?.data?.message || 'Erreur de connexion')
  }
}

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f0f6ff',
      padding: '40px 20px'
    }}>

      {/* CARD CENTRÉE */}
      <div style={{
        background: 'linear-gradient(160deg, #f0f6ff 0%, #e8f2ff 100%)',
        width: '100%',
        maxWidth: '520px',
        padding: '60px 60px',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(11,31,69,0.08)',
      }}>
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
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
            <h2 style={{
              fontFamily: 'Sora, sans-serif',
              fontSize: '26px',
              fontWeight: '800',
              color: '#0b1f45',
              marginBottom: '12px',
            }}>
              Connexion réussie !
            </h2>
            <button onClick={onBack} style={{
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
            }}>
              Retour à l'accueil
            </button>
          </div>
          
          
        ) : (
          <>
            {/* Logo */}
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
              }}>
                IFSentry
              </span>
            </div>
            

            <h1 style={{
              fontFamily: 'Sora, sans-serif',
              fontSize: '26px',
              fontWeight: '800',
              color: '#0b1f45',
              marginBottom: '8px',
            }}>
              connectez-vous à votre compte
            </h1>

            
             

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Email */}
              <Field label="Adresse e-mail">
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}>
                    ✉️
                  </span>
                  <Input
                    type="email"
                    name="email"
                    placeholder="nom@entreprise.com"
                    value={form.email}
                    onChange={handle}
                    required
                  />
                </div>
              </Field>

              {/* Password */}
              <Field label="Mot de passe">
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}>
                    🔑
                  </span>

                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••••••"
                    value={form.password}
                    onChange={handle}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </Field>

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
                }}
              >
                Se connecter →
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

/* Helpers */

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{
        fontSize: '11px',
        fontWeight: '700',
        textTransform: 'uppercase',
        color: '#0b1f45',
        fontFamily: 'DM Sans, sans-serif',
      }}>
        {label} *
      </label>
      {children}
    </div>
  )
}

function Input({ type, name, placeholder, value, onChange, required }) {
  const [focused, setFocused] = useState(false)

  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      style={{
        width: '100%',
        padding: '13px 44px',
        fontSize: '14px',
        border: `1.5px solid ${focused ? '#1b6fd8' : '#d1e3f8'}`,
        borderRadius: '9px',
        outline: 'none',
        background: focused ? '#fff' : '#f8fbff',
        color: '#0b1f45',
        fontFamily: 'DM Sans, sans-serif',
        transition: 'all 0.2s',
        boxShadow: focused ? '0 0 0 3px rgba(27,111,216,0.12)' : 'none',
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}
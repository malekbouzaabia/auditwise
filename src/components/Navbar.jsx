import { useState } from 'react'

const NAV_ITEMS = [
  { label: 'Accueil',   key: 'home'    },
  { label: 'À propos',  key: 'about'   },
  { label: 'Contact',   key: 'contact' },
]

function getInitials(u) {
  if (!u) return '?'
  const name = u.name || u.username || u.email || ''
  const parts = name.trim().split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function getName(u) {
  return u?.name || u?.username || u?.email?.split('@')[0] || 'Utilisateur'
}

export default function Navbar({ onSignUp, onSignIn, onAbout, onDashboard, onChatBot, onContact, user, onLogout }) {
  const [active, setActive] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)

  const handleNav = (key) => {
    setActive(key)
    if (key === 'about')   onAbout?.()
    if (key === 'chat')    onDashboard?.()
    if (key === 'contact') onContact?.()
  }

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <div className="nav-logo-badge">🤖</div>
        <span>AuditWise</span>
        <span className="nav-logo-sub">by Draxlmaier</span>
      </div>

      <ul className="nav-links">
        {NAV_ITEMS.map(item => (
          <li key={item.key}>
            <a
              href="#"
              className={active === item.key ? 'active' : ''}
              onClick={e => { e.preventDefault(); handleNav(item.key) }}
            >
              {item.label}
            </a>
          </li>
        ))}
        {user && (
          <li>
            <a href="#" onClick={e => { e.preventDefault(); onChatBot?.() }}
              style={{ color: '#1b6fd8', fontWeight: '700' }}>
              🤖 Audit
            </a>
          </li>
        )}
      </ul>

      <div className="nav-actions">
        {user ? (
          /* ── Utilisateur connecté — Avatar + Menu ── */
          <div style={{ position: 'relative' }}>
            <button onClick={() => setMenuOpen(p => !p)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(27,111,216,0.08)', border: '1.5px solid rgba(27,111,216,0.2)', borderRadius: '100px', padding: '6px 14px 6px 6px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(27,111,216,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(27,111,216,0.08)'}
            >
              {/* Avatar initiales */}
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #1b6fd8, #3b9eff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', color: 'white', fontFamily: '"Sora", sans-serif', boxShadow: '0 2px 8px rgba(27,111,216,0.3)', flexShrink: 0 }}>
                {getInitials(user)}
              </div>
              {/* Nom */}
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#0b1f45', fontFamily: '"DM Sans", sans-serif', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {getName(user)}
              </span>
              <span style={{ fontSize: '10px', color: '#7c9cbf' }}>▼</span>
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 98 }} onClick={() => setMenuOpen(false)} />
                <div style={{ position: 'absolute', top: '48px', right: 0, background: 'white', borderRadius: '16px', boxShadow: '0 8px 40px rgba(11,31,69,0.15)', border: '1px solid rgba(27,111,216,0.1)', minWidth: '200px', overflow: 'hidden', zIndex: 99, animation: 'fadeDown 0.2s ease' }}>

                  {/* Info */}
                  <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, #f0f6ff, #e8f2ff)', borderBottom: '1px solid rgba(27,111,216,0.08)' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#0b1f45' }}>{getName(user)}</div>
                    <div style={{ fontSize: '11px', color: '#7c9cbf', marginTop: '2px' }}>{user?.email || ''}</div>
                  </div>

                  {/* Items */}
                  <div style={{ padding: '8px' }}>
                    <NavMenuItem icon="🤖" label="Lancer l'audit" onClick={() => { setMenuOpen(false); onChatBot?.() }} color="#1b6fd8" />
                    <NavMenuItem icon="👤" label="Mon profil" onClick={() => setMenuOpen(false)} />
                    <div style={{ height: '1px', background: 'rgba(27,111,216,0.08)', margin: '6px 0' }} />
                    <NavMenuItem icon="🚪" label="Se déconnecter" onClick={() => { setMenuOpen(false); onLogout?.() }} color="#ef4444" />
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          /* ── Non connecté — Boutons Connexion/Inscription ── */
          <>
            <button className="btn-signin" onClick={onSignIn}>Connexion</button>
            <button className="btn-signup" onClick={onSignUp}>S'inscrire</button>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </nav>
  )
}

function NavMenuItem({ icon, label, onClick, color }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button onClick={onClick}
      style={{ width: '100%', padding: '9px 12px', background: hovered ? (color ? color + '12' : '#f0f6ff') : 'transparent', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '600', color: color || '#0b1f45', fontFamily: '"DM Sans", sans-serif', transition: 'all 0.15s', textAlign: 'left' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ fontSize: '15px' }}>{icon}</span>
      {label}
    </button>
  )
}
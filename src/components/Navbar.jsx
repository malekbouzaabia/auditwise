import { useState } from 'react'

const NAV_ITEMS = [
  { label: 'Accueil',  key: 'home'    },
  { label: 'À propos', key: 'about'   },
  { label: 'Services', key: 'services'},
  { label: 'Contact',  key: 'contact' },
]

export default function Navbar({ onSignUp, onSignIn, onAbout }) {
  const [active, setActive] = useState('home')

  const handleNav = (key) => {
    setActive(key)
    if (key === 'about') onAbout?.()
  }

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <div className="nav-logo-badge">🛡️</div>
        <span>IFSentry</span>
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
      </ul>

      <div className="nav-actions">
        <button className="btn-signin" onClick={onSignIn}>Connexion</button>
        <button className="btn-signup" onClick={onSignUp}>S'inscrire</button>
      </div>
    </nav>
  )
}
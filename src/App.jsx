import { useState, useEffect } from 'react'
import './App.css'
import Home           from './Pages/Home.jsx'
import SignUp         from './Pages/SignUp.jsx'
import SignIn         from './Pages/SignIn.jsx'
import About          from './Pages/About.jsx'
import ChatSessions   from './Pages/Chatsessions.jsx'
import AdminDashboard from './Pages/DashboardAdmin.jsx'
import ChatBot        from './Pages/chatbot.jsx'
import Tutoriel       from './Pages/Tutoriel.jsx'

const ROUTES = {
  '':             'home',
  'home':         'home',
  'signup':       'signup',
  'signin':       'signin',
  'about':        'about',
  'chatsessions': 'chat',
  'admin':        'admin',
  'chatbot':      'chatbot',
  'tutoriel':     'tutoriel',
}

export default function App() {
  const getPageFromHash = () => {
    const hash = window.location.hash.replace('#', '').toLowerCase().trim()
    return ROUTES[hash] || 'home'
  }

  const [page, setPage] = useState(getPageFromHash)

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })

  useEffect(() => {
    const onHashChange = () => setPage(getPageFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = (p) => {
    const hashMap = {
      home:    '',
      signup:  'signup',
      signin:  'signin',
      about:   'about',
      chat:    'chatsessions',
      admin:   'admin',
      chatbot: 'chatbot',
      tutoriel: 'tutoriel',
    }
    window.location.hash = hashMap[p] || ''
    setPage(p)
  }

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    window.location.hash = ''
    setPage('home')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('home')
  }

  return (
    <>
      {page === 'home'    && <Home           onSignUp={() => navigate('signup')} onSignIn={() => navigate('signin')} onAbout={() => navigate('about')} onDashboard={() => navigate('chat')} onAdmin={() => navigate('admin')} onChatBot={() => navigate('chatbot')} onTutoriel={() => navigate('tutoriel')} user={user} onLogout={handleLogout} />}
      {page === 'signup'  && <SignUp          onBack={() => navigate('home')} onSignIn={() => navigate('signin')} />}
      {page === 'signin'  && <SignIn          onBack={() => navigate('home')} onSignUp={() => navigate('signup')} onLoginSuccess={handleLoginSuccess} />}
      {page === 'about'   && <About           onBack={() => navigate('home')} onSignUp={() => navigate('signup')} />}
      {page === 'chat'    && <ChatSessions    onBack={() => navigate('home')} />}
      {page === 'admin'   && <AdminDashboard  onBack={() => navigate('home')} />}
      {page === 'chatbot'  && <ChatBot         onBack={() => navigate('home')} user={user} />}
      {page === 'tutoriel' && <Tutoriel        onBack={() => navigate('home')} onSignUp={() => navigate('signup')} />}
    </>
  )
}

function UserAvatar({ user, onLogout, onChatBot }) {
  const [open, setOpen] = useState(false)

  const getInitials = (u) => {
    if (!u) return '?'
    const name = u.name || u.username || u.email || ''
    const parts = name.trim().split(' ')
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }

  const getName = (u) => u?.name || u?.username || u?.email?.split('@')[0] || 'Utilisateur'

  return (
    <div style={{ position: 'fixed', top: '16px', right: '24px', zIndex: 9999 }}>
      <button onClick={() => setOpen(p => !p)}
        style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #1b6fd8, #3b9eff)', border: '2px solid white', boxShadow: '0 4px 16px rgba(27,111,216,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Sora", sans-serif', fontSize: '14px', fontWeight: '800', color: 'white', transition: 'transform 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {getInitials(user)}
      </button>

      {open && (
        <div style={{ position: 'absolute', top: '52px', right: 0, background: 'white', borderRadius: '16px', boxShadow: '0 8px 40px rgba(11,31,69,0.15)', border: '1px solid rgba(27,111,216,0.1)', minWidth: '220px', overflow: 'hidden', animation: 'fadeDown 0.2s ease' }}>
          <div style={{ padding: '16px', background: 'linear-gradient(135deg, #f0f6ff, #e8f2ff)', borderBottom: '1px solid rgba(27,111,216,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #1b6fd8, #3b9eff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: 'white', fontFamily: '"Sora", sans-serif', flexShrink: 0 }}>
                {getInitials(user)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#0b1f45', fontFamily: '"Sora", sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {getName(user)}
                </div>
                <div style={{ fontSize: '11px', color: '#7c9cbf', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email || ''}
                </div>
              </div>
            </div>
          </div>
          <div style={{ padding: '8px' }}>
            <MenuItem icon="🤖" label="Lancer l'audit" onClick={() => { setOpen(false); onChatBot() }} color="#1b6fd8" />
            <MenuItem icon="👤" label="Mon profil" onClick={() => setOpen(false)} />
            <div style={{ height: '1px', background: 'rgba(27,111,216,0.08)', margin: '6px 0' }} />
            <MenuItem icon="🚪" label="Se déconnecter" onClick={() => { setOpen(false); onLogout() }} color="#ef4444" />
          </div>
        </div>
      )}

      {open && <div style={{ position: 'fixed', inset: 0, zIndex: -1 }} onClick={() => setOpen(false)} />}
      <style>{`@keyframes fadeDown { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: translateY(0) } }`}</style>
    </div>
  )
}

function MenuItem({ icon, label, onClick, color }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button onClick={onClick}
      style={{ width: '100%', padding: '10px 12px', background: hovered ? (color ? color + '12' : '#f0f6ff') : 'transparent', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '600', color: color || '#0b1f45', fontFamily: '"DM Sans", sans-serif', transition: 'all 0.15s', textAlign: 'left' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ fontSize: '16px' }}>{icon}</span>
      {label}
    </button>
  )
}
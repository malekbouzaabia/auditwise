import { useState, useEffect } from 'react'
import './App.css'
import Home           from './Pages/Home.jsx'
import SignUp         from './Pages/SignUp.jsx'
import SignIn         from './Pages/SignIn.jsx'
import About          from './Pages/About.jsx'
import ChatSessions   from './Pages/ChatSessions.jsx'
import AdminDashboard from './Pages/DashboardAdmin.jsx'

const ROUTES = {
  '':              'home',
  'home':          'home',
  'signup':        'signup',
  'signin':        'signin',
  'about':         'about',
  'chatsessions':  'chat',
  'admin':         'admin',
}

export default function App() {
  const getPageFromHash = () => {
    const hash = window.location.hash.replace('#', '').toLowerCase().trim()
    return ROUTES[hash] || 'home'
  }

  const [page, setPage] = useState(getPageFromHash)

  useEffect(() => {
    const onHashChange = () => setPage(getPageFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = (p) => {
    const hashMap = {
      home:   '',
      signup: 'signup',
      signin: 'signin',
      about:  'about',
      chat:   'chatsessions',
      admin:  'admin',
    }
    window.location.hash = hashMap[p] || ''
    setPage(p)
  }

  return (
    <>
      {page === 'home'   && <Home           onSignUp={() => navigate('signup')} onSignIn={() => navigate('signin')} onAbout={() => navigate('about')} onDashboard={() => navigate('chat')} onAdmin={() => navigate('admin')} />}
      {page === 'signup' && <SignUp          onBack={() => navigate('home')}    onSignIn={() => navigate('signin')} />}
      {page === 'signin' && <SignIn          onBack={() => navigate('home')}    onSignUp={() => navigate('signup')} />}
      {page === 'about'  && <About           onBack={() => navigate('home')}    onSignUp={() => navigate('signup')} />}
      {page === 'chat'   && <ChatSessions    onBack={() => navigate('home')} />}
      {page === 'admin'  && <AdminDashboard  onBack={() => navigate('home')} />}
    </>
  )
}
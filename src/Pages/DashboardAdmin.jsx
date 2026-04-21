import { useState, useEffect } from 'react'

const STATS = [
  { icon: '👥', label: 'Utilisateurs',    value: '124',   sub: '+12 ce mois',      color: '#1b6fd8', bg: '#e8f2ff' },
  { icon: '💬', label: 'Sessions chat',   value: '1 847', sub: '+38 cette semaine', color: '#22c55e', bg: '#f0fff4' },
  { icon: '📄', label: 'Rapports générés',value: '312',   sub: "+8 aujourd'hui",   color: '#f59e0b', bg: '#fff8f0' },
  { icon: '⚠️', label: 'Non-conformités', value: '47',    sub: '12 critiques',     color: '#ef4444', bg: '#fff0f0' },
]

const USERS_DEFAULT = [
  { id: 1, nom: 'Dupont Jean',   email: 'jean.dupont@acme.com',    entreprise: 'Acme Corp',   statut: 'actif'    },
  { id: 2, nom: 'Martin Sophie', email: 'sophie.martin@techco.com', entreprise: 'TechCo',      statut: 'actif'    },
  { id: 3, nom: 'Benali Karim',  email: 'k.benali@securit.com',    entreprise: 'Securit SA',  statut: 'inactif'  },
  { id: 4, nom: 'Leroy Claire',  email: 'c.leroy@datagroup.fr',    entreprise: 'DataGroup',   statut: 'actif'    },
  { id: 5, nom: 'Ahmed Youssef', email: 'y.ahmed@infotech.tn',     entreprise: 'InfoTech TN', statut: 'actif'    },
  { id: 6, nom: 'Nguyen Linh',   email: 'l.nguyen@cyberdef.com',   entreprise: 'CyberDef',    statut: 'suspendu' },
]

const SESSIONS_RECENT = [
  { id: 'a1b2c3d4', user: 'Dupont Jean',   msgs: 12, statut: 'terminée',   date: '26/05/2024 09:36' },
  { id: 'e5f6g7h8', user: 'Martin Sophie', msgs: 8,  statut: 'terminée',   date: '25/05/2024 14:21' },
  { id: 'i9j0k1l2', user: 'Leroy Claire',  msgs: 15, statut: 'en cours',   date: '26/05/2024 11:05' },
  { id: 'm3n4o5p6', user: 'Ahmed Youssef', msgs: 6,  statut: 'terminée',   date: '24/05/2024 16:48' },
  { id: 'q7r8s9t0', user: 'Benali Karim',  msgs: 3,  statut: 'abandonnée', date: '22/05/2024 08:30' },
]

const CONFORMITE = [
  { label: "Politique de sécurité", pct: 87, color: '#22c55e' },
  { label: "Contrôle d'accès",      pct: 72, color: '#1b6fd8' },
  { label: 'Sécurité RH',           pct: 65, color: '#f59e0b' },
  { label: 'Gestion des incidents', pct: 54, color: '#ef4444' },
  { label: 'Sécurité physique',     pct: 91, color: '#22c55e' },
  { label: 'Chiffrement',           pct: 78, color: '#1b6fd8' },
]

const NAV_ITEMS = [
  { icon: '🏠', label: 'Tableau de bord', key: 'dashboard' },
  { icon: '👥', label: 'Utilisateurs',    key: 'users'     },
  { icon: '💬', label: 'Sessions',        key: 'sessions'  },
  { icon: '📄', label: 'Rapports',        key: 'reports'   },
  { icon: '❓', label: 'Questions',        key: 'questions' },
  { icon: '📊', label: 'Statistiques',     key: 'stats'     },
  { icon: '🎯', label: 'Campagnes',         key: 'campagnes' },
]

const RAPPORTS = [
  { entreprise: 'Acme Corp',   score: 87, statut: 'validé',     date: '26/05/2024', auditeur: 'Martin Sophie' },
  { entreprise: 'TechCo',      score: 62, statut: 'en attente', date: '25/05/2024', auditeur: 'Dupont Jean'   },
  { entreprise: 'DataGroup',   score: 91, statut: 'validé',     date: '24/05/2024', auditeur: 'Leroy Claire'  },
  { entreprise: 'Securit SA',  score: 45, statut: 'rejeté',     date: '23/05/2024', auditeur: 'Ahmed Youssef' },
  { entreprise: 'InfoTech TN', score: 78, statut: 'validé',     date: '22/05/2024', auditeur: 'Benali Karim'  },
  { entreprise: 'CyberDef',    score: 55, statut: 'en attente', date: '21/05/2024', auditeur: 'Nguyen Linh'   },
]

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function AdminDashboard({ onBack }) {
  const [activeNav,      setActiveNav]      = useState('dashboard')
  const [sidebarOpen,    setSidebarOpen]    = useState(true)
  const [userFilter,     setUserFilter]     = useState('tous')
  const [users,          setUsers]          = useState([])
  // Sessions
  const [sessions,       setSessions]       = useState([])
  const [loadingSessions,setLoadingSessions] = useState(false)
  const [dateFrom,       setDateFrom]       = useState('')
  const [dateTo,         setDateTo]         = useState('')
  // Questions
  const [qDomains,       setQDomains]       = useState([])
  const [selectedDomain, setSelectedDomain] = useState(null)
  const [newQuestion,    setNewQuestion]    = useState('')
  const [editIdx,        setEditIdx]        = useState(null)
  const [editText,       setEditText]       = useState('')
  const [qLoading,       setQLoading]       = useState(false)
  const [importing,      setImporting]      = useState(false)
  const [importMsg,      setImportMsg]      = useState('')
  const [rapports,       setRapports]       = useState([])
  const [stats,          setStats]          = useState([])
  const [totalRapports,  setTotalRapports]  = useState(0)
  const [loadingStats,   setLoadingStats]   = useState(false)
  const [campagnes,      setCampagnes]      = useState([])
  const [loadingCamp,    setLoadingCamp]    = useState(false)
  const [newCampNom,     setNewCampNom]     = useState('')
  const [newCampDebut,   setNewCampDebut]   = useState('')
  const [newCampFin,     setNewCampFin]     = useState('')
  const [campagneActive, setCampagneActive] = useState(null)
  const [participants,   setParticipants]   = useState([])
  const [selectedCamp,   setSelectedCamp]   = useState(null)
  const [loadingPart,    setLoadingPart]    = useState(false)
  const [editCamp,       setEditCamp]       = useState(null)   // campagne en édition
  const [editNom,        setEditNom]        = useState('')
  const [editDebut,      setEditDebut]      = useState('')
  const [editFin,        setEditFin]        = useState('')
  const [loadingRapports,setLoadingRapports] = useState(false)
  const [dashStats,      setDashStats]      = useState(null)
  const [recentSessions, setRecentSessions] = useState([])
  const [conformiteData, setConformiteData] = useState([])
  const [selectedRapport,setSelectedRapport] = useState(null)

  const getHeaders = () => {
    const token = localStorage.getItem('token')
    return { 'Content-Type': 'application/json', ...(token ? { 'Authorization': 'Bearer ' + token } : {}) }
  }

  // ── Charger utilisateurs ──────────────────────────────────
  useEffect(() => {
    fetch(API + '/api/auth/users')
      .then(r => r.json())
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers(USERS_DEFAULT))
  }, [])

  // ── Charger sessions ──────────────────────────────────────
  useEffect(() => {
    if (activeNav === 'sessions') {
      setLoadingSessions(true)
      fetch(API + '/api/admin/sessions', { headers: getHeaders() })
        .then(r => r.json())
        .then(data => { setSessions(Array.isArray(data) ? data : []); setLoadingSessions(false) })
        .catch(() => { setSessions([]); setLoadingSessions(false) })
    }
  }, [activeNav])

  // ── Charger dashboard dynamique ──────────────────────────────
  useEffect(() => {
    if (activeNav !== 'dashboard') return
    // Stats globales
    Promise.all([
      fetch(API + '/api/auth/users').then(r => r.json()),
      fetch(API + '/api/admin/sessions').then(r => r.json()),
      fetch(API + '/api/rapports').then(r => r.json()),
      fetch(API + '/api/stats/domaines').then(r => r.json()),
    ]).then(([usersData, sessionsData, rapportsData, statsData]) => {
      const totalUsers    = Array.isArray(usersData)    ? usersData.length    : 0
      const totalSessions = Array.isArray(sessionsData) ? sessionsData.reduce((a,s) => a + (s.totalSessions||0), 0) : 0
      const totalRapports = Array.isArray(rapportsData) ? rapportsData.length : 0
      const nonConformes  = Array.isArray(rapportsData)
        ? rapportsData.filter(r => r.statut === 'non-conforme').length : 0

      // Charger campagnes aussi
      fetch(API + '/api/campagnes').then(r => r.json()).then(campsData => {
        const totalCamps  = Array.isArray(campsData) ? campsData.length : 0
        const campActive  = Array.isArray(campsData) ? campsData.find(c => c.statut === 'ouverte') : null
        const campSub     = campActive ? `"${campActive.nom}" ouverte` : 'Aucune ouverte'

        setDashStats([
          { icon: '👥', label: 'Utilisateurs',     value: totalUsers,    sub: 'inscrits',         color: '#1b6fd8', bg: '#e8f2ff' },
          { icon: '💬', label: 'Sessions chat',    value: totalSessions, sub: 'au total',          color: '#22c55e', bg: '#f0fff4' },
          { icon: '📄', label: 'Rapports générés', value: totalRapports, sub: 'audits complétés',  color: '#f59e0b', bg: '#fff8f0' },
          { icon: '🎯', label: 'Campagnes',         value: totalCamps,    sub: campSub,             color: '#8b5cf6', bg: '#f5f3ff' },
        ])
      }).catch(() => {
        setDashStats([
          { icon: '👥', label: 'Utilisateurs',     value: totalUsers,    sub: 'inscrits',         color: '#1b6fd8', bg: '#e8f2ff' },
          { icon: '💬', label: 'Sessions chat',    value: totalSessions, sub: 'au total',          color: '#22c55e', bg: '#f0fff4' },
          { icon: '📄', label: 'Rapports générés', value: totalRapports, sub: 'audits complétés',  color: '#f59e0b', bg: '#fff8f0' },
          { icon: '🎯', label: 'Campagnes',         value: 0,             sub: 'Aucune ouverte',    color: '#8b5cf6', bg: '#f5f3ff' },
        ])
      })

      // Conformité par domaine depuis stats réelles
      if (statsData?.stats?.length > 0) {
        setConformiteData(statsData.stats.slice(0, 6).map(s => ({
          label: s.label,
          pct:   s.scoreMoyen,
          color: s.scoreMoyen >= 70 ? '#22c55e' : s.scoreMoyen >= 40 ? '#f59e0b' : '#ef4444'
        })))
      }

      // Sessions récentes
      if (Array.isArray(sessionsData)) {
        setRecentSessions(sessionsData.slice(0, 5).map(s => ({
          id:     s.userEmail,
          user:   s.userEmail,
          msgs:   s.totalMessages || 0,
          statut: s.lastScore != null ? 'terminée' : 'en cours',
          date:   s.lastDate ? new Date(s.lastDate).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '—'
        })))
      }
    }).catch(() => {})
  }, [activeNav])

  // ── Charger campagnes ────────────────────────────────────────
  useEffect(() => {
    if (activeNav === 'campagnes') {
      setLoadingCamp(true)
      fetch(API + '/api/campagnes')
        .then(r => r.json())
        .then(data => {
          setCampagnes(Array.isArray(data) ? data : [])
          setCampagneActive(data.find(c => c.statut === 'ouverte') || null)
          setLoadingCamp(false)
        })
        .catch(() => setLoadingCamp(false))
    }
  }, [activeNav])

  async function deleteCampagne(id) {
    if (!window.confirm('Supprimer cette campagne ?')) return
    await fetch(API + '/api/campagnes/' + id, { method: 'DELETE', headers: getHeaders() })
    const res2 = await fetch(API + '/api/campagnes')
    const list = await res2.json()
    setCampagnes(list)
    setCampagneActive(list.find(c => c.statut === 'ouverte') || null)
    if (selectedCamp === id) { setSelectedCamp(null); setParticipants([]) }
  }

  function openEditCamp(c) {
    setEditCamp(c._id)
    setEditNom(c.nom)
    setEditDebut(c.dateDebut ? new Date(c.dateDebut).toISOString().slice(0,10) : '')
    setEditFin(c.dateFin   ? new Date(c.dateFin).toISOString().slice(0,10)   : '')
  }

  async function saveEditCamp(id) {
    if (!editNom.trim() || !editDebut || !editFin) { alert('Remplissez tous les champs'); return }
    const res = await fetch(API + '/api/campagnes/' + id + '/edit', {
      method: 'PUT', headers: getHeaders(),
      body: JSON.stringify({ nom: editNom, dateDebut: editDebut, dateFin: editFin })
    })
    const data = await res.json()
    if (data.error) { alert(data.error); return }
    setEditCamp(null)
    const res2 = await fetch(API + '/api/campagnes')
    const list = await res2.json()
    setCampagnes(list)
    setCampagneActive(list.find(c => c.statut === 'ouverte') || null)
  }

  async function loadParticipants(campId) {
    setSelectedCamp(campId)
    setLoadingPart(true)
    try {
      const res  = await fetch(API + '/api/campagnes/' + campId + '/participants')
      const data = await res.json()
      setParticipants(Array.isArray(data) ? data : [])
    } catch (e) { setParticipants([]) }
    finally { setLoadingPart(false) }
  }

  async function creerCampagne() {
    if (!newCampNom.trim() || !newCampDebut || !newCampFin) {
      alert('Remplissez le nom, la date début et la date fin')
      return
    }
    const res  = await fetch(API + '/api/campagnes', {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ nom: newCampNom.trim(), dateDebut: newCampDebut, dateFin: newCampFin })
    })
    const data = await res.json()
    if (data.error) { alert(data.error); return }
    setNewCampNom(''); setNewCampDebut(''); setNewCampFin('')
    const res2 = await fetch(API + '/api/campagnes')
    const list = await res2.json()
    setCampagnes(list)
    setCampagneActive(list.find(c => c.statut === 'ouverte') || null)
  }

  async function fermerCampagne(id) {
    if (!window.confirm('Fermer cette campagne ?')) return
    await fetch(API + '/api/campagnes/' + id + '/fermer', { method: 'PUT', headers: getHeaders() })
    const res2 = await fetch(API + '/api/campagnes')
    const list = await res2.json()
    setCampagnes(list)
    setCampagneActive(list.find(c => c.statut === 'ouverte') || null)
  }

  // ── Charger statistiques ─────────────────────────────────────
  useEffect(() => {
    if (activeNav === 'stats') {
      setLoadingStats(true)
      fetch(API + '/api/stats/domaines')
        .then(r => r.json())
        .then(data => {
          setStats(data.stats || [])
          setTotalRapports(data.totalRapports || 0)
          setLoadingStats(false)
        })
        .catch(() => setLoadingStats(false))
    }
  }, [activeNav])

  // ── Charger rapports ──────────────────────────────────────
  useEffect(() => {
    if (activeNav === 'reports') {
      setLoadingRapports(true)
      fetch(API + '/api/rapports')
        .then(r => r.json())
        .then(data => { setRapports(Array.isArray(data) ? data : []); setLoadingRapports(false) })
        .catch(() => setLoadingRapports(false))
    }
  }, [activeNav])

  // ── Charger domaines/questions ────────────────────────────
  useEffect(() => {
    if (activeNav === 'questions') {
      setQLoading(true)
      fetch(API + '/api/domains')
        .then(r => r.json())
        .then(data => { setQDomains(Array.isArray(data) ? data : []); setQLoading(false) })
        .catch(() => setQLoading(false))
    }
  }, [activeNav])

  // ── Import Excel ──────────────────────────────────────────
  async function importExcel(e) {
    const file = e.target.files[0]
    if (!file) return
    setImporting(true)
    setImportMsg('')
    const formData = new FormData()
    formData.append('excel', file)
    try {
      const res  = await fetch(API + '/api/domains/import-excel', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setImportMsg('✅ ' + data.domains + ' domaines · ' + data.questions + ' questions importés !')
      const res2    = await fetch(API + '/api/domains')
      const domains = await res2.json()
      setQDomains(Array.isArray(domains) ? domains : [])
      setSelectedDomain(null)
    } catch (err) {
      setImportMsg('❌ Erreur : ' + err.message)
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  // ── Ajouter question ──────────────────────────────────────
  async function addQuestion() {
    if (!newQuestion.trim() || !selectedDomain) return
    const domainId = selectedDomain._id || selectedDomain.id
    if (!domainId) { alert('Domaine invalide — ID manquant. Vérifiez que MongoDB contient les domaines.'); return }
    const res     = await fetch(API + '/api/domains/' + domainId + '/questions', {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ question: newQuestion.trim() })
    })
    const updated = await res.json()
    setQDomains(prev => prev.map(d => (d._id || d.id) === (selectedDomain._id || selectedDomain.id) ? updated : d))
    setSelectedDomain(updated)
    setNewQuestion('')
  }

  // ── Supprimer question ────────────────────────────────────
  async function deleteQuestion(idx) {
    if (!window.confirm('Supprimer cette question ?')) return
    const domainId = selectedDomain._id || selectedDomain.id
    if (!domainId) return
    const res     = await fetch(API + '/api/domains/' + domainId + '/questions/' + idx, {
      method: 'DELETE', headers: getHeaders()
    })
    const updated = await res.json()
    setQDomains(prev => prev.map(d => (d._id || d.id) === (selectedDomain._id || selectedDomain.id) ? updated : d))
    setSelectedDomain(updated)
  }

  // ── Modifier question ─────────────────────────────────────
  async function saveEditQuestion(idx) {
    if (!editText.trim()) return
    const domainId = selectedDomain._id || selectedDomain.id
    if (!domainId) return
    const res     = await fetch(API + '/api/domains/' + domainId + '/questions/' + idx, {
      method: 'PUT', headers: getHeaders(),
      body: JSON.stringify({ question: editText.trim() })
    })
    const updated = await res.json()
    setQDomains(prev => prev.map(d => (d._id || d.id) === (selectedDomain._id || selectedDomain.id) ? updated : d))
    setSelectedDomain(updated)
    setEditIdx(null); setEditText('')
  }

  const filteredUsers = users.filter(u => userFilter === 'tous' ? true : u.statut === userFilter)

  const filteredSessions = sessions.filter(s => {
    const d = s.lastDate ? new Date(s.lastDate) : null
    if (!d) return true
    if (dateFrom && d < new Date(dateFrom)) return false
    if (dateTo   && d > new Date(dateTo + 'T23:59:59')) return false
    return true
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', background: '#f0f6ff' }}>

      {/* SIDEBAR */}
      <div style={{ width: sidebarOpen ? '240px' : '68px', background: 'linear-gradient(180deg, #0b1f45 0%, #0d2a60 100%)', display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease', flexShrink: 0, boxShadow: '4px 0 20px rgba(11,31,69,0.25)' }}>
        <div style={{ padding: '24px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', background: '#1b6fd8', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, boxShadow: '0 4px 12px rgba(27,111,216,0.5)' }}>🛡️</div>
          {sidebarOpen && <div><div style={{ fontFamily: 'Sora, sans-serif', fontWeight: '800', fontSize: '16px', color: 'white' }}>AuditWise</div><div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Administration</div></div>}
        </div>
        <nav style={{ flex: 1, padding: '16px 10px' }}>
          {NAV_ITEMS.map(item => <NavItem key={item.key} item={item} active={activeNav === item.key} collapsed={!sidebarOpen} onClick={() => setActiveNav(item.key)} />)}
        </nav>
        <div style={{ padding: '16px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {sidebarOpen && <button onClick={onBack} style={{ width: '100%', padding: '9px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '9px', color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', marginBottom: '8px', fontFamily: 'DM Sans, sans-serif' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.15)'} onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.08)'}>← Retour accueil</button>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ width: '100%', padding: '9px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9px', color: 'rgba(255,255,255,0.5)', fontSize: '14px', cursor: 'pointer' }}>{sidebarOpen ? '◀' : '▶'}</button>
        </div>
      </div>

      {/* CONTENU */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* TOPBAR */}
        <div style={{ height: '64px', background: 'white', borderBottom: '1px solid rgba(27,111,216,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0, boxShadow: '0 2px 12px rgba(11,31,69,0.06)' }}>
          <div>
            <h1 style={{ fontFamily: 'Sora, sans-serif', fontSize: '18px', fontWeight: '800', color: '#0b1f45', margin: 0 }}>
              {activeNav === 'dashboard' && 'Tableau de bord'}
              {activeNav === 'users'     && 'Gestion des utilisateurs'}
              {activeNav === 'sessions'  && 'Sessions de chat'}
              {activeNav === 'reports'   && 'Rapports'}
              {activeNav === 'questions' && 'Gestion des questions'}
              {activeNav === 'stats'     && 'Statistiques par domaine'}
              {activeNav === 'campagnes'  && 'Gestion des campagnes'}
            </h1>
            <p style={{ fontSize: '12px', color: '#6b8cba', margin: 0 }}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #1b6fd8, #3b9eff)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 4px 12px rgba(27,111,216,0.35)' }}>👨‍💼</div>
            <div><div style={{ fontSize: '13px', fontWeight: '700', color: '#0b1f45' }}>Administrateur</div><div style={{ fontSize: '11px', color: '#6b8cba' }}>admin@auditwise.com</div></div>
          </div>
        </div>

        {/* BODY */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>

          {/* DASHBOARD */}
          {activeNav === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Stats dynamiques */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
                {(dashStats || STATS).map(s => <StatCard key={s.label} stat={s} />)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                {/* Conformité dynamique */}
                <div style={{ background: 'white', borderRadius: '18px', padding: '24px', border: '1px solid rgba(27,111,216,0.08)', boxShadow: '0 4px 20px rgba(11,31,69,0.06)' }}>
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '15px', fontWeight: '800', color: '#0b1f45', marginBottom: '20px' }}>📊 Taux de conformité par domaine</h3>
                  {conformiteData.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '12px' }}>
                      Aucune donnée — faites des audits d'abord
                    </div>
                  ) : conformiteData.map(c => (
                    <div key={c.label} style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontSize: '12px', color: '#0b1f45', fontWeight: '600' }}>{c.label}</span>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: c.color }}>{c.pct}%</span>
                      </div>
                      <div style={{ height: '7px', background: '#f0f6ff', borderRadius: '100px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${c.pct}%`, background: c.color, borderRadius: '100px' }} />
                      </div>
                    </div>
                  ))}
                </div>
                {/* Sessions récentes dynamiques */}
                <div style={{ background: 'white', borderRadius: '18px', padding: '24px', border: '1px solid rgba(27,111,216,0.08)', boxShadow: '0 4px 20px rgba(11,31,69,0.06)' }}>
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '15px', fontWeight: '800', color: '#0b1f45', marginBottom: '20px' }}>💬 Sessions récentes</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {recentSessions.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '12px' }}>Aucune session</div>
                    ) : recentSessions.map(s => (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', background: '#f8fbff', border: '1px solid rgba(27,111,216,0.07)' }}>
                        <div style={{ width: '32px', height: '32px', background: '#e8f2ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>💬</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#0b1f45' }}>{s.user}</div>
                          <div style={{ fontSize: '10px', color: '#6b8cba' }}>{s.date} · {s.msgs} messages</div>
                        </div>
                        <StatutBadge statut={s.statut} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* UTILISATEURS */}
          {activeNav === 'users' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['tous', 'actif', 'inactif', 'suspendu'].map(f => (
                  <button key={f} onClick={() => setUserFilter(f)} style={{ padding: '7px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', background: userFilter === f ? '#1b6fd8' : 'white', color: userFilter === f ? 'white' : '#6b8cba', border: `1.5px solid ${userFilter === f ? '#1b6fd8' : 'rgba(27,111,216,0.2)'}` }}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              <div style={{ background: 'white', borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(27,111,216,0.08)', boxShadow: '0 4px 20px rgba(11,31,69,0.06)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr 2fr 1fr', background: 'linear-gradient(135deg, #0b1f45, #1040a0)', padding: '14px 24px' }}>
                  {['Nom', 'Email', 'Entreprise', 'Actions'].map(h => (
                    <div key={h} style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{h}</div>
                  ))}
                </div>
                {filteredUsers.map((u, i) => <UserRow key={u.id || u._id} user={u} isLast={i === filteredUsers.length - 1} />)}
              </div>
            </div>
          )}

          {/* SESSIONS */}
          {activeNav === 'sessions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'white', borderRadius: '14px', padding: '16px 20px', border: '1px solid rgba(27,111,216,0.1)', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#0b1f45' }}>📅 Filtrer par date :</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '12px', color: '#6b8cba', fontWeight: '600' }}>Du</label>
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                    style={{ padding: '7px 12px', border: '1.5px solid rgba(27,111,216,0.2)', borderRadius: '8px', fontSize: '12px', fontFamily: 'DM Sans, sans-serif', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '12px', color: '#6b8cba', fontWeight: '600' }}>Au</label>
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                    style={{ padding: '7px 12px', border: '1.5px solid rgba(27,111,216,0.2)', borderRadius: '8px', fontSize: '12px', fontFamily: 'DM Sans, sans-serif', outline: 'none' }} />
                </div>
                <button onClick={() => { setDateFrom(''); setDateTo('') }}
                  style={{ padding: '7px 14px', background: '#f0f6ff', border: '1px solid rgba(27,111,216,0.2)', borderRadius: '8px', fontSize: '12px', fontWeight: '600', color: '#1b6fd8', cursor: 'pointer' }}>
                  ✕ Réinitialiser
                </button>
                <button onClick={() => { setLoadingSessions(true); fetch(API + '/api/admin/sessions', { headers: getHeaders() }).then(r => r.json()).then(d => { setSessions(Array.isArray(d) ? d : []); setLoadingSessions(false) }).catch(() => setLoadingSessions(false)) }}
                  style={{ padding: '7px 16px', background: '#1b6fd8', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', marginLeft: 'auto' }}>
                  🔄 Actualiser
                </button>
              </div>
              <div style={{ fontSize: '13px', color: '#6b8cba' }}>
                {loadingSessions ? 'Chargement...' : filteredSessions.length + ' utilisateur(s)' + (dateFrom || dateTo ? ' (filtré)' : ' au total')}
              </div>
              <div style={{ background: 'white', borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(27,111,216,0.08)', boxShadow: '0 4px 20px rgba(11,31,69,0.06)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1.5fr', background: 'linear-gradient(135deg, #0b1f45, #1040a0)', padding: '14px 20px' }}>
                  {['Compte utilisateur', 'Sessions', 'Messages', 'Dernier score', 'Dernière activité'].map(h => (
                    <div key={h} style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{h}</div>
                  ))}
                </div>
                {loadingSessions ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#6b8cba' }}>⏳ Chargement...</div>
                ) : filteredSessions.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#6b8cba' }}>Aucune session trouvée</div>
                ) : filteredSessions.map((s, i) => (
                  <div key={s.userEmail} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 1.5fr', padding: '14px 20px', borderBottom: i < filteredSessions.length - 1 ? '1px solid rgba(27,111,216,0.06)' : 'none', background: i % 2 === 0 ? 'white' : '#fafcff', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #1b6fd8, #3b9eff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800', color: 'white', flexShrink: 0 }}>
                        {(s.userEmail || '?').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#0b1f45' }}>{s.userEmail}</div>
                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>Utilisateur actif</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '18px', fontWeight: '800', color: '#1b6fd8' }}>{s.totalSessions}</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>sessions</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '18px', fontWeight: '800', color: '#0b1f45' }}>{s.totalMessages}</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>msg</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: s.lastScore >= 70 ? '#22c55e' : s.lastScore >= 40 ? '#f59e0b' : s.lastScore != null ? '#ef4444' : '#aab8cc' }}>
                      {s.lastScore != null ? s.lastScore + '%' : '—'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#6b8cba' }}>
                      {s.lastDate ? new Date(s.lastDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RAPPORTS */}
          {activeNav === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '13px', color: '#6b8cba' }}>
                  {loadingRapports ? 'Chargement...' : rapports.length + ' rapport(s) généré(s)'}
                </div>
                <button onClick={() => { setLoadingRapports(true); fetch(API + '/api/rapports').then(r => r.json()).then(d => { setRapports(Array.isArray(d) ? d : []); setLoadingRapports(false) }).catch(() => setLoadingRapports(false)) }}
                  style={{ padding: '7px 16px', background: '#1b6fd8', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                  🔄 Actualiser
                </button>
              </div>

              {loadingRapports ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b8cba' }}>⏳ Chargement...</div>
              ) : rapports.length === 0 ? (
                <div style={{ background: 'white', borderRadius: '18px', padding: '60px', textAlign: 'center', border: '1px solid rgba(27,111,216,0.08)' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📄</div>
                  <div style={{ fontFamily: '"Sora", sans-serif', fontSize: '15px', fontWeight: '700', color: '#0b1f45' }}>Aucun rapport généré</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>Les rapports apparaîtront ici après chaque audit</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
                  {rapports.map((r, i) => (
                    <RapportCard key={r._id || i}
                      rapport={{
                        entreprise:   r.userEmail || 'Anonyme',
                        score:        r.globalScore || 0,
                        statut:       r.statut || 'généré',
                        date:         new Date(r.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
                        auditeur:     r.userEmail || 'Anonyme',
                        domainScores: r.domainScores || {},
                        domainsData:  r.domainsData  || [],
                      }}
                      onView={setSelectedRapport}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* QUESTIONS */}
          {activeNav === 'questions' && (
            <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 150px)' }}>

              {/* Liste domaines */}
              <div style={{ width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                <div style={{ background: 'white', borderRadius: '14px', padding: '14px 16px', border: '1px solid rgba(27,111,216,0.1)' }}>
                  <div style={{ fontFamily: '"Sora", sans-serif', fontSize: '13px', fontWeight: '800', color: '#0b1f45' }}>📚 Domaines</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                    {qDomains.length} domaines · {qDomains.reduce((a,d) => a+(d.questions?.length||0),0)} questions
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 12px', background: importing ? 'rgba(27,111,216,0.1)' : 'linear-gradient(135deg, #1b6fd8, #1551a8)', borderRadius: '8px', cursor: importing ? 'not-allowed' : 'pointer', fontSize: '11px', fontWeight: '700', color: importing ? '#94a3b8' : 'white' }}>
                      {importing ? '⏳ Import...' : '📥 Importer Excel'}
                      <input type="file" accept=".xlsx,.xls" onChange={importExcel} disabled={importing} style={{ display: 'none' }} />
                    </label>
                    {importMsg && (
                      <div style={{ marginTop: '6px', fontSize: '10px', color: importMsg.startsWith('✅') ? '#22c55e' : '#ef4444', fontWeight: '600' }}>
                        {importMsg}
                      </div>
                    )}
                  </div>
                </div>

                {qLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>⏳ Chargement...</div>
                ) : qDomains.map((d, i) => (
                  <div key={d._id || d.label || i} onClick={() => { setSelectedDomain(d); setEditIdx(null); setNewQuestion('') }}
                    style={{ background: selectedDomain?._id === d._id ? 'linear-gradient(135deg, #1b6fd8, #1551a8)' : 'white', borderRadius: '12px', padding: '12px 14px', cursor: 'pointer', border: '1px solid rgba(27,111,216,0.1)', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>{d.icon || '📋'}</span>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: selectedDomain?._id === d._id ? 'white' : '#0b1f45' }}>{d.label}</div>
                        <div style={{ fontSize: '10px', color: selectedDomain?._id === d._id ? 'rgba(255,255,255,0.6)' : '#94a3b8' }}>
                          {d.questions?.length || 0} questions · cl. {d.clause || '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Questions du domaine */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>
                {!selectedDomain ? (
                  <div style={{ background: 'white', borderRadius: '18px', padding: '60px', textAlign: 'center', border: '1px solid rgba(27,111,216,0.08)' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>👈</div>
                    <div style={{ fontFamily: '"Sora", sans-serif', fontSize: '15px', fontWeight: '700', color: '#0b1f45' }}>Sélectionnez un domaine</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>Pour gérer ses questions</div>
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <div style={{ background: 'linear-gradient(135deg, #0b1f45, #1040a0)', borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                      <span style={{ fontSize: '24px' }}>{selectedDomain.icon || '📋'}</span>
                      <div>
                        <div style={{ fontFamily: '"Sora", sans-serif', fontSize: '14px', fontWeight: '800', color: 'white' }}>{selectedDomain.label}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                          {selectedDomain.questions?.length || 0} questions · Clause {selectedDomain.clause || 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Ajouter */}
                    <div style={{ background: 'white', borderRadius: '14px', padding: '16px 20px', border: '1px solid rgba(27,111,216,0.1)', flexShrink: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#0b1f45', marginBottom: '10px' }}>➕ Ajouter une question</div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input value={newQuestion} onChange={e => setNewQuestion(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addQuestion()}
                          placeholder="Tapez votre nouvelle question..."
                          style={{ flex: 1, padding: '10px 14px', border: '1.5px solid rgba(27,111,216,0.2)', borderRadius: '10px', fontSize: '13px', fontFamily: '"DM Sans", sans-serif', outline: 'none', color: '#0b1f45' }}
                          onFocus={e => e.target.style.borderColor = '#1b6fd8'}
                          onBlur={e => e.target.style.borderColor = 'rgba(27,111,216,0.2)'}
                        />
                        <button onClick={addQuestion} disabled={!newQuestion.trim()}
                          style={{ padding: '10px 20px', background: newQuestion.trim() ? 'linear-gradient(135deg, #1b6fd8, #1551a8)' : '#e8f2ff', border: 'none', borderRadius: '10px', color: newQuestion.trim() ? 'white' : '#94a3b8', fontSize: '13px', fontWeight: '700', cursor: newQuestion.trim() ? 'pointer' : 'not-allowed', fontFamily: '"DM Sans", sans-serif' }}>
                          ➕ Ajouter
                        </button>
                      </div>
                    </div>

                    {/* Liste questions */}
                    <div style={{ background: 'white', borderRadius: '14px', border: '1px solid rgba(27,111,216,0.1)', overflow: 'hidden', flex: 1 }}>
                      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(27,111,216,0.08)', background: '#f8faff' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#0b1f45' }}>📋 Questions ({selectedDomain.questions?.length || 0})</span>
                      </div>
                      <div style={{ overflowY: 'auto', height: 'calc(100% - 50px)' }}>
                        {(selectedDomain.questions || []).length === 0 ? (
                          <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Aucune question — ajoutez-en une !</div>
                        ) : (selectedDomain.questions || []).map((q, idx) => (
                          <div key={idx} style={{ padding: '12px 20px', borderBottom: idx < selectedDomain.questions.length - 1 ? '1px solid rgba(27,111,216,0.06)' : 'none', display: 'flex', alignItems: 'center', gap: '12px', background: idx % 2 === 0 ? 'white' : '#fafcff' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #1b6fd8, #3b9eff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', color: 'white', flexShrink: 0 }}>
                              {idx + 1}
                            </div>
                            {editIdx === idx ? (
                              <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                                <input value={editText} onChange={e => setEditText(e.target.value)}
                                  onKeyDown={e => { if (e.key === 'Enter') saveEditQuestion(idx); if (e.key === 'Escape') { setEditIdx(null); setEditText('') } }}
                                  style={{ flex: 1, padding: '6px 10px', border: '1.5px solid #1b6fd8', borderRadius: '8px', fontSize: '12px', fontFamily: '"DM Sans", sans-serif', outline: 'none' }}
                                  autoFocus
                                />
                                <button onClick={() => saveEditQuestion(idx)} style={{ padding: '6px 12px', background: '#22c55e', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>✓</button>
                                <button onClick={() => { setEditIdx(null); setEditText('') }} style={{ padding: '6px 12px', background: '#f0f6ff', border: 'none', borderRadius: '8px', color: '#6b8cba', fontSize: '12px', cursor: 'pointer' }}>✕</button>
                              </div>
                            ) : (
                              <>
                                <span style={{ flex: 1, fontSize: '12px', color: '#0b1f45' }}>{q}</span>
                                <button onClick={() => { setEditIdx(idx); setEditText(q) }}
                                  style={{ padding: '5px 10px', background: '#e8f2ff', color: '#1b6fd8', border: 'none', borderRadius: '7px', fontSize: '12px', cursor: 'pointer' }}
                                  onMouseEnter={e => { e.currentTarget.style.background = '#1b6fd8'; e.currentTarget.style.color = 'white' }}
                                  onMouseLeave={e => { e.currentTarget.style.background = '#e8f2ff'; e.currentTarget.style.color = '#1b6fd8' }}>✏️</button>
                                <button onClick={() => deleteQuestion(idx)}
                                  style={{ padding: '5px 10px', background: '#fff0f0', color: '#ef4444', border: 'none', borderRadius: '7px', fontSize: '12px', cursor: 'pointer' }}
                                  onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white' }}
                                  onMouseLeave={e => { e.currentTarget.style.background = '#fff0f0'; e.currentTarget.style.color = '#ef4444' }}>🗑️</button>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* STATISTIQUES */}
          {activeNav === 'stats' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
                <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid rgba(27,111,216,0.08)', boxShadow: '0 4px 16px rgba(11,31,69,0.06)' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>Total Audits</div>
                  <div style={{ fontFamily: '"Sora",sans-serif', fontSize: '32px', fontWeight: '800', color: '#0b1f45' }}>{totalRapports}</div>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid rgba(27,111,216,0.08)', boxShadow: '0 4px 16px rgba(11,31,69,0.06)' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>Domaines analysés</div>
                  <div style={{ fontFamily: '"Sora",sans-serif', fontSize: '32px', fontWeight: '800', color: '#1b6fd8' }}>{stats.length}</div>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid rgba(27,111,216,0.08)', boxShadow: '0 4px 16px rgba(11,31,69,0.06)' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>Score moyen global</div>
                  <div style={{ fontFamily: '"Sora",sans-serif', fontSize: '32px', fontWeight: '800', color: '#22c55e' }}>
                    {stats.length > 0 ? Math.round(stats.reduce((a,s) => a + s.scoreMoyen, 0) / stats.length) : 0}%
                  </div>
                </div>
              </div>

              {/* Stats par domaine */}
              {loadingStats ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b8cba' }}>⏳ Chargement...</div>
              ) : stats.length === 0 ? (
                <div style={{ background: 'white', borderRadius: '18px', padding: '60px', textAlign: 'center', border: '1px solid rgba(27,111,216,0.08)' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
                  <div style={{ fontFamily: '"Sora",sans-serif', fontSize: '15px', fontWeight: '700', color: '#0b1f45' }}>Aucune donnée disponible</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>Les statistiques apparaîtront après les premiers audits</div>
                </div>
              ) : (
                <div style={{ background: 'white', borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(27,111,216,0.08)', boxShadow: '0 4px 20px rgba(11,31,69,0.06)' }}>
                  {/* Header tableau */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr', background: 'linear-gradient(135deg,#0b1f45,#1040a0)', padding: '14px 20px' }}>
                    {['Domaine', '✅ Vrai', '❌ Faux', '⚠️ Partiel', 'Score moyen'].map(h => (
                      <div key={h} style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</div>
                    ))}
                  </div>

                  {/* Lignes */}
                  {stats.map((s, i) => {
                    const col = s.scoreMoyen >= 70 ? '#22c55e' : s.scoreMoyen >= 40 ? '#f59e0b' : '#ef4444'
                    const totalReponses = s.vrai + s.faux + s.partiel || 1
                    return (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr', padding: '14px 20px', borderBottom: i < stats.length - 1 ? '1px solid rgba(27,111,216,0.06)' : 'none', background: i % 2 === 0 ? 'white' : '#fafcff', alignItems: 'center' }}>

                        {/* Domaine */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg,#1b6fd8,#3b9eff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800', color: 'white', flexShrink: 0 }}>{s.ordre}</div>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#0b1f45' }}>{s.label}</div>
                            <div style={{ fontSize: '10px', color: '#94a3b8' }}>Clause {s.clause || '-'}</div>
                          </div>
                        </div>

                        {/* Vrai */}
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: '800', color: '#22c55e' }}>{s.vrai}</div>
                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>{Math.round(s.vrai/totalReponses*100)}%</div>
                        </div>

                        {/* Faux */}
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: '800', color: '#ef4444' }}>{s.faux}</div>
                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>{Math.round(s.faux/totalReponses*100)}%</div>
                        </div>

                        {/* Partiel */}
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: '800', color: '#f59e0b' }}>{s.partiel}</div>
                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>{Math.round(s.partiel/totalReponses*100)}%</div>
                        </div>



                        {/* Score moyen + barre */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, height: '6px', background: '#f0f6ff', borderRadius: '100px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: s.scoreMoyen + '%', background: col, borderRadius: '100px' }} />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '800', color: col, width: '36px' }}>{s.scoreMoyen}%</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* CAMPAGNES */}
          {activeNav === 'campagnes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Campagne active */}
              <div style={{ background: campagneActive ? 'linear-gradient(135deg, #0b1f45, #1040a0)' : 'white', borderRadius: '18px', padding: '24px', border: '1px solid rgba(27,111,216,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: '"Sora",sans-serif', fontSize: '14px', fontWeight: '800', color: campagneActive ? 'white' : '#0b1f45', marginBottom: '6px' }}>
                      {campagneActive ? '🟢 Campagne active : ' + campagneActive.nom : '🔴 Aucune campagne ouverte'}
                    </div>
                    <div style={{ fontSize: '12px', color: campagneActive ? 'rgba(255,255,255,0.6)' : '#94a3b8' }}>
                      {campagneActive
                      ? `Du ${new Date(campagneActive.dateDebut).toLocaleDateString('fr-FR')} au ${new Date(campagneActive.dateFin).toLocaleDateString('fr-FR')}`
                      : 'Créez une nouvelle campagne pour permettre les audits'}
                    </div>
                  </div>
                  {campagneActive && (
                    <button onClick={() => fermerCampagne(campagneActive._id)}
                      style={{ padding: '10px 20px', background: '#ef4444', border: 'none', borderRadius: '10px', color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                      🔒 Fermer la campagne
                    </button>
                  )}
                </div>
              </div>

              {/* Créer campagne */}
              <div style={{ background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid rgba(27,111,216,0.1)' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0b1f45', marginBottom: '12px' }}>🎯 Créer une nouvelle campagne</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input value={newCampNom} onChange={e => setNewCampNom(e.target.value)}
                    placeholder="Ex: Audit Q2 2026, Audit Annuel..."
                    style={{ width: '100%', padding: '11px 16px', border: '1.5px solid rgba(27,111,216,0.2)', borderRadius: '10px', fontSize: '13px', fontFamily: '"DM Sans",sans-serif', outline: 'none', color: '#0b1f45', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#1b6fd8'}
                    onBlur={e => e.target.style.borderColor = 'rgba(27,111,216,0.2)'}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#6b8cba', display: 'block', marginBottom: '5px' }}>📅 Date début</label>
                      <input type="date" value={newCampDebut} onChange={e => setNewCampDebut(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid rgba(27,111,216,0.2)', borderRadius: '10px', fontSize: '13px', fontFamily: '"DM Sans",sans-serif', outline: 'none', color: '#0b1f45', boxSizing: 'border-box' }}
                        onFocus={e => e.target.style.borderColor = '#1b6fd8'}
                        onBlur={e => e.target.style.borderColor = 'rgba(27,111,216,0.2)'}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: '#6b8cba', display: 'block', marginBottom: '5px' }}>📅 Date fin</label>
                      <input type="date" value={newCampFin} onChange={e => setNewCampFin(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid rgba(27,111,216,0.2)', borderRadius: '10px', fontSize: '13px', fontFamily: '"DM Sans",sans-serif', outline: 'none', color: '#0b1f45', boxSizing: 'border-box' }}
                        onFocus={e => e.target.style.borderColor = '#1b6fd8'}
                        onBlur={e => e.target.style.borderColor = 'rgba(27,111,216,0.2)'}
                      />
                    </div>
                  </div>
                  <button onClick={creerCampagne} disabled={!newCampNom.trim() || !newCampDebut || !newCampFin}
                    style={{ padding: '11px 24px', background: newCampNom.trim() && newCampDebut && newCampFin ? 'linear-gradient(135deg, #1b6fd8, #1551a8)' : '#e8f2ff', border: 'none', borderRadius: '10px', color: newCampNom.trim() && newCampDebut && newCampFin ? 'white' : '#94a3b8', fontSize: '13px', fontWeight: '700', cursor: newCampNom.trim() && newCampDebut && newCampFin ? 'pointer' : 'not-allowed' }}>
                    🎯 Créer la campagne
                  </button>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
                  ⚠️ La campagne s'ouvrira automatiquement à la date début et se fermera à la date fin
                </div>
              </div>

              {/* Liste campagnes */}
              <div style={{ background: 'white', borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(27,111,216,0.08)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', background: 'linear-gradient(135deg,#0b1f45,#1040a0)', padding: '14px 20px' }}>
                  {['Campagne', 'Statut', 'Audits', 'Score moyen', 'Date'].map(h => (
                    <div key={h} style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>{h}</div>
                  ))}
                </div>
                {loadingCamp ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#6b8cba' }}>⏳ Chargement...</div>
                ) : campagnes.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#6b8cba' }}>Aucune campagne créée</div>
                ) : campagnes.map((c, i) => (
                  <div key={c._id} style={{ borderBottom: i < campagnes.length - 1 ? '1px solid rgba(27,111,216,0.06)' : 'none', background: selectedCamp === c._id ? '#eff6ff' : i % 2 === 0 ? 'white' : '#fafcff' }}>
                    {/* Mode édition */}
                    {editCamp === c._id ? (
                      <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input value={editNom} onChange={e => setEditNom(e.target.value)}
                          style={{ padding: '8px 12px', border: '1.5px solid #1b6fd8', borderRadius: '8px', fontSize: '13px', fontFamily: '"DM Sans",sans-serif', outline: 'none' }} />
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input type="date" value={editDebut} onChange={e => setEditDebut(e.target.value)}
                            style={{ flex: 1, padding: '8px 12px', border: '1.5px solid rgba(27,111,216,0.3)', borderRadius: '8px', fontSize: '12px', outline: 'none' }} />
                          <input type="date" value={editFin} onChange={e => setEditFin(e.target.value)}
                            style={{ flex: 1, padding: '8px 12px', border: '1.5px solid rgba(27,111,216,0.3)', borderRadius: '8px', fontSize: '12px', outline: 'none' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => saveEditCamp(c._id)} style={{ padding: '7px 16px', background: '#22c55e', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>✅ Sauvegarder</button>
                          <button onClick={() => setEditCamp(null)} style={{ padding: '7px 16px', background: '#f0f6ff', border: 'none', borderRadius: '8px', color: '#6b8cba', fontSize: '12px', cursor: 'pointer' }}>✕ Annuler</button>
                        </div>
                      </div>
                    ) : (
                    <div onClick={() => loadParticipants(c._id)} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', padding: '14px 20px', alignItems: 'center', cursor: 'pointer' }}>
                    <div style={{ fontFamily: '"Sora",sans-serif', fontSize: '13px', fontWeight: '700', color: '#0b1f45' }}>{c.nom}</div>
                    <span style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '700',
                      background: c.statut === 'ouverte' ? 'rgba(34,197,94,0.1)' : c.statut === 'planifiee' ? 'rgba(245,158,11,0.1)' : 'rgba(107,140,186,0.1)',
                      color: c.statut === 'ouverte' ? '#16a34a' : c.statut === 'planifiee' ? '#d97706' : '#6b8cba',
                      border: c.statut === 'ouverte' ? '1px solid rgba(34,197,94,0.3)' : c.statut === 'planifiee' ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(107,140,186,0.3)',
                      width: 'fit-content' }}>
                      {c.statut === 'ouverte' ? '🟢 Ouverte' : c.statut === 'planifiee' ? '🟡 Planifiée' : '🔴 Fermée'}
                    </span>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#1b6fd8' }}>{c.totalAudits || 0}</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: c.scoreMoyen >= 70 ? '#22c55e' : c.scoreMoyen >= 40 ? '#f59e0b' : '#ef4444' }}>
                      {c.scoreMoyen || 0}%
                    </div>
                    <div style={{ fontSize: '11px', color: '#0b1f45', fontWeight: '600' }}>
                      {c.dateDebut ? new Date(c.dateDebut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#0b1f45', fontWeight: '600' }}>
                      {c.dateFin ? new Date(c.dateFin).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—'}
                    </div>
                    </div>
                    )}
                    {/* Boutons action */}
                    {editCamp !== c._id && (
                      <div style={{ display: 'flex', gap: '6px', padding: '4px 20px 8px', justifyContent: 'flex-end' }}>
                        <button onClick={e => { e.stopPropagation(); openEditCamp(c) }}
                          style={{ padding: '4px 10px', background: '#e8f2ff', border: 'none', borderRadius: '6px', color: '#1b6fd8', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                          ✏️ Modifier
                        </button>
                        <button onClick={e => { e.stopPropagation(); deleteCampagne(c._id) }}
                          style={{ padding: '4px 10px', background: '#fff0f0', border: 'none', borderRadius: '6px', color: '#ef4444', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                          🗑️ Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PARTICIPANTS CAMPAGNE */}
          {activeNav === 'campagnes' && selectedCamp && (
            <div style={{ marginTop: '20px', background: 'white', borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(27,111,216,0.08)', boxShadow: '0 4px 20px rgba(11,31,69,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#f8faff', borderBottom: '1px solid rgba(27,111,216,0.08)' }}>
                <div style={{ fontFamily: '"Sora",sans-serif', fontSize: '14px', fontWeight: '800', color: '#0b1f45' }}>
                  👥 Participants — {campagnes.find(c => c._id === selectedCamp)?.nom}
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                  <span style={{ color: '#22c55e', fontWeight: '700' }}>✅ {participants.filter(p => p.statut === 'complete').length} Complétés</span>
                  <span style={{ color: '#f59e0b', fontWeight: '700' }}>🔄 {participants.filter(p => p.statut === 'en_cours').length} En cours</span>
                  <span style={{ color: '#94a3b8', fontWeight: '700' }}>⏳ {participants.filter(p => p.statut === 'pas_encore').length} Pas encore</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', background: 'linear-gradient(135deg,#0b1f45,#1040a0)', padding: '12px 20px' }}>
                {['Utilisateur', 'Email', 'Statut', 'Progression', 'Score'].map(h => (
                  <div key={h} style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>{h}</div>
                ))}
              </div>

              {loadingPart ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#6b8cba' }}>⏳ Chargement...</div>
              ) : participants.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#6b8cba' }}>Aucun utilisateur trouvé</div>
              ) : participants.map((p, i) => {
                const statutConfig = {
                  complete:   { label: '✅ Complété',   color: '#22c55e', bg: 'rgba(34,197,94,0.1)'   },
                  en_cours:   { label: '🔄 En cours',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                  pas_encore: { label: '⏳ Pas encore', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
                }[p.statut] || { label: '⏳ Pas encore', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' }

                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', padding: '12px 20px', borderBottom: i < participants.length - 1 ? '1px solid rgba(27,111,216,0.06)' : 'none', background: i % 2 === 0 ? 'white' : '#fafcff', alignItems: 'center' }}>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: '#0b1f45' }}>{p.nom}</div>
                    <div style={{ fontSize: '12px', color: '#6b8cba' }}>{p.email}</div>
                    <span style={{ padding: '3px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: '700', background: statutConfig.bg, color: statutConfig.color, width: 'fit-content' }}>
                      {statutConfig.label}
                    </span>
                    <div>
                      <div style={{ fontSize: '11px', color: '#0b1f45', marginBottom: '3px' }}>{p.nbReponses}/{p.totalQ}</div>
                      <div style={{ height: '5px', background: '#f0f6ff', borderRadius: '100px', overflow: 'hidden', width: '80px' }}>
                        <div style={{ height: '100%', width: (p.nbReponses/p.totalQ*100) + '%', background: statutConfig.color, borderRadius: '100px' }} />
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: p.score >= 70 ? '#22c55e' : p.score >= 40 ? '#f59e0b' : p.score != null ? '#ef4444' : '#94a3b8' }}>
                      {p.score != null ? p.score + '%' : '—'}
                    </div>
                  </div>
                )
              })}
            </div>
          )}



        </div>
      </div>

      {/* Modal Rapport */}
      {selectedRapport && <RapportModal rapport={selectedRapport} onClose={() => setSelectedRapport(null)} />}

    </div>
  )
}

function NavItem({ item, active, collapsed, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', marginBottom: '4px', transition: 'all 0.2s', background: active ? 'rgba(27,111,216,0.25)' : hovered ? 'rgba(255,255,255,0.07)' : 'transparent', borderLeft: active ? '3px solid #3b9eff' : '3px solid transparent' }}>
      <span style={{ fontSize: '17px', flexShrink: 0 }}>{item.icon}</span>
      {!collapsed && <span style={{ fontSize: '13px', fontWeight: active ? '700' : '500', color: active ? 'white' : 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>{item.label}</span>}
    </div>
  )
}

function StatCard({ stat }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ background: 'white', borderRadius: '16px', padding: '20px', border: `1px solid ${hovered ? stat.color + '40' : 'rgba(27,111,216,0.08)'}`, boxShadow: hovered ? `0 12px 32px ${stat.color}20` : '0 4px 16px rgba(11,31,69,0.06)', transition: 'all 0.3s', transform: hovered ? 'translateY(-3px)' : 'translateY(0)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ width: '42px', height: '42px', background: stat.bg, borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{stat.icon}</div>
      </div>
      <div style={{ fontFamily: 'Sora, sans-serif', fontSize: '26px', fontWeight: '800', color: '#0b1f45', lineHeight: '1', marginBottom: '4px' }}>{stat.value}</div>
      <div style={{ fontSize: '12px', color: '#6b8cba', fontWeight: '600', marginBottom: '2px' }}>{stat.label}</div>
      <div style={{ fontSize: '11px', color: stat.color, fontWeight: '500' }}>{stat.sub}</div>
    </div>
  )
}

function StatutBadge({ statut }) {
  const colors = {
    'actif':      { bg: 'rgba(34,197,94,0.1)',  text: '#16a34a', border: 'rgba(34,197,94,0.25)'  },
    'inactif':    { bg: 'rgba(107,140,186,0.1)',text: '#6b8cba', border: 'rgba(107,140,186,0.25)'},
    'suspendu':   { bg: 'rgba(239,68,68,0.1)',  text: '#dc2626', border: 'rgba(239,68,68,0.25)'  },
    'terminée':   { bg: 'rgba(34,197,94,0.1)',  text: '#16a34a', border: 'rgba(34,197,94,0.25)'  },
    'en cours':   { bg: 'rgba(27,111,216,0.1)', text: '#1b6fd8', border: 'rgba(27,111,216,0.25)' },
    'abandonnée': { bg: 'rgba(239,68,68,0.1)',  text: '#dc2626', border: 'rgba(239,68,68,0.25)'  },
    'en attente': { bg: 'rgba(245,158,11,0.1)', text: '#d97706', border: 'rgba(245,158,11,0.25)' },
    'validé':     { bg: 'rgba(34,197,94,0.1)',  text: '#16a34a', border: 'rgba(34,197,94,0.25)'  },
    'rejeté':     { bg: 'rgba(239,68,68,0.1)',  text: '#dc2626', border: 'rgba(239,68,68,0.25)'  },
  }
  const c = colors[statut] || colors['inactif']
  return <span style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '700', background: c.bg, color: c.text, border: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>{statut}</span>
}

function UserRow({ user, isLast }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display: 'grid', gridTemplateColumns: '2fr 3fr 2fr 1fr', padding: '14px 24px', borderBottom: isLast ? 'none' : '1px solid rgba(27,111,216,0.06)', background: hovered ? '#f0f6ff' : 'white', transition: 'background 0.15s', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #1b6fd8, #3b9eff)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>👤</div>
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#0b1f45' }}>{user.nom || user.name}</span>
      </div>
      <span style={{ fontSize: '13px', color: '#6b8cba' }}>{user.email}</span>
      <span style={{ fontSize: '13px', color: '#0b1f45', fontWeight: '600' }}>{user.entreprise || '—'}</span>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button style={{ padding: '6px 12px', background: '#e8f2ff', color: '#1b6fd8', border: 'none', borderRadius: '7px', fontSize: '12px', cursor: 'pointer' }}>✏️</button>
        <button style={{ padding: '6px 12px', background: '#fff0f0', color: '#ef4444', border: 'none', borderRadius: '7px', fontSize: '12px', cursor: 'pointer' }}>🗑️</button>
      </div>
    </div>
  )
}

function RapportCard({ rapport, onView }) {
  const [hovered, setHovered] = useState(false)
  const scoreColor = rapport.score >= 80 ? '#22c55e' : rapport.score >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ background: 'white', borderRadius: '16px', padding: '22px', border: `1px solid ${hovered ? 'rgba(27,111,216,0.25)' : 'rgba(27,111,216,0.08)'}`, boxShadow: hovered ? '0 12px 32px rgba(11,31,69,0.1)' : '0 4px 16px rgba(11,31,69,0.06)', transition: 'all 0.3s', transform: hovered ? 'translateY(-4px)' : 'translateY(0)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ fontSize: '16px', fontWeight: '800', color: '#0b1f45', fontFamily: 'Sora, sans-serif' }}>{rapport.entreprise}</div>
        <StatutBadge statut={rapport.statut} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
        <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: `conic-gradient(${scoreColor} ${rapport.score * 3.6}deg, #f0f6ff 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: '800', color: scoreColor }}>{rapport.score}%</span>
          </div>
        </div>
        <div><div style={{ fontSize: '12px', fontWeight: '600', color: '#0b1f45' }}>Score conformité</div><div style={{ fontSize: '11px', color: '#6b8cba' }}>ISO 27001</div></div>
      </div>
      <div style={{ fontSize: '11px', color: '#6b8cba', marginBottom: '4px' }}>👤 {rapport.auditeur}</div>
      <div style={{ fontSize: '11px', color: '#aab8cc', marginBottom: '14px' }}>📅 {rapport.date}</div>
      <button onClick={() => onView(rapport)}
        style={{ width: '100%', padding: '8px', background: 'linear-gradient(135deg, #1b6fd8, #1551a8)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
        Voir le rapport →
      </button>
    </div>
  )
}

function RapportModal({ rapport, onClose }) {
  if (!rapport) return null
  const scoreColor = rapport.score >= 70 ? '#22c55e' : rapport.score >= 40 ? '#f59e0b' : '#ef4444'
  const domainScores = rapport.domainScores || {}
  const domainsData  = rapport.domainsData  || []

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,31,69,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '650px', maxHeight: '85vh', overflow: 'hidden', boxShadow: '0 30px 80px rgba(11,31,69,0.3)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0b1f45, #1b6fd8)', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: '"Sora", sans-serif', fontSize: '18px', fontWeight: '800', color: 'white' }}>📊 Rapport d'Audit</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>ISO 27001:2022 — AuditWise</div>
          </div>
          <button onClick={onClose} style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '18px', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ overflowY: 'auto', maxHeight: 'calc(85vh - 80px)', padding: '24px 28px' }}>

          {/* Infos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: '#f8faff', borderRadius: '12px', padding: '14px', border: '1px solid rgba(27,111,216,0.1)' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>Utilisateur</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#0b1f45' }}>{rapport.auditeur || rapport.entreprise}</div>
            </div>
            <div style={{ background: '#f8faff', borderRadius: '12px', padding: '14px', border: '1px solid rgba(27,111,216,0.1)' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>Date</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#0b1f45' }}>{rapport.date}</div>
            </div>
            <div style={{ background: scoreColor + '15', borderRadius: '12px', padding: '14px', border: '1px solid ' + scoreColor + '30' }}>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>Statut</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: scoreColor }}>{rapport.statut}</div>
            </div>
          </div>

          {/* Score global */}
          <div style={{ background: scoreColor + '10', borderRadius: '16px', padding: '20px', border: '1px solid ' + scoreColor + '30', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: `conic-gradient(${scoreColor} ${rapport.score * 3.6}deg, #e8f2ff 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ width: '62px', height: '62px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: '"Sora", sans-serif', fontSize: '20px', fontWeight: '800', color: scoreColor }}>{rapport.score}%</span>
              </div>
            </div>
            <div>
              <div style={{ fontFamily: '"Sora", sans-serif', fontSize: '16px', fontWeight: '800', color: '#0b1f45' }}>Score Global</div>
              <div style={{ fontSize: '13px', color: scoreColor, fontWeight: '700', marginTop: '4px' }}>
                {rapport.score >= 70 ? '✅ Conforme' : rapport.score >= 40 ? '⚠️ Partiellement conforme' : '❌ Non-conforme'}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Norme ISO 27001:2022</div>
            </div>
          </div>

          {/* Scores par domaine */}
          {(domainsData.length > 0 || Object.keys(domainScores).length > 0) && (
            <div>
              <div style={{ fontFamily: '"Sora", sans-serif', fontSize: '14px', fontWeight: '800', color: '#0b1f45', marginBottom: '14px' }}>📋 Scores par domaine</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {domainsData.length > 0
                  ? domainsData.map((d, i) => {
                      const score = d.score || 0
                      const col   = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: '#f8faff', borderRadius: '10px', border: '1px solid rgba(27,111,216,0.08)' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #1b6fd8, #3b9eff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800', color: 'white', flexShrink: 0 }}>
                            {i + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: '#0b1f45', marginBottom: '4px' }}>{d.label}</div>
                            <div style={{ height: '6px', background: '#dce8f8', borderRadius: '100px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: score + '%', background: col, borderRadius: '100px' }} />
                            </div>
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: '800', color: col, width: '40px', textAlign: 'right' }}>{score}%</span>
                        </div>
                      )
                    })
                  : Object.entries(domainScores).map(([idx, score]) => {
                      const col = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'
                      return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: '#f8faff', borderRadius: '10px', border: '1px solid rgba(27,111,216,0.08)' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #1b6fd8, #3b9eff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800', color: 'white', flexShrink: 0 }}>
                            {parseInt(idx) + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ height: '6px', background: '#dce8f8', borderRadius: '100px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: score + '%', background: col, borderRadius: '100px' }} />
                            </div>
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: '800', color: col, width: '40px', textAlign: 'right' }}>{score}%</span>
                        </div>
                      )
                    })
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
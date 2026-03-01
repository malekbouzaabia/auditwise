import { useState, useEffect } from 'react'
import axios from 'axios'
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
  { id: 'a1b2c3d4-...', user: 'Dupont Jean',   msgs: 12, statut: 'terminée',   date: '26/05/2024 09:36' },
  { id: 'e5f6g7h8-...', user: 'Martin Sophie', msgs: 8,  statut: 'terminée',   date: '25/05/2024 14:21' },
  { id: 'i9j0k1l2-...', user: 'Leroy Claire',  msgs: 15, statut: 'en cours',   date: '26/05/2024 11:05' },
  { id: 'm3n4o5p6-...', user: 'Ahmed Youssef', msgs: 6,  statut: 'terminée',   date: '24/05/2024 16:48' },
  { id: 'q7r8s9t0-...', user: 'Benali Karim',  msgs: 3,  statut: 'abandonnée', date: '22/05/2024 08:30' },
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
  { icon: '⚙️', label: 'Paramètres',      key: 'settings'  },
]

const RAPPORTS = [
  { entreprise: 'Acme Corp',   score: 87, statut: 'validé',     date: '26/05/2024', auditeur: 'Martin Sophie' },
  { entreprise: 'TechCo',      score: 62, statut: 'en attente', date: '25/05/2024', auditeur: 'Dupont Jean'   },
  { entreprise: 'DataGroup',   score: 91, statut: 'validé',     date: '24/05/2024', auditeur: 'Leroy Claire'  },
  { entreprise: 'Securit SA',  score: 45, statut: 'rejeté',     date: '23/05/2024', auditeur: 'Ahmed Youssef' },
  { entreprise: 'InfoTech TN', score: 78, statut: 'validé',     date: '22/05/2024', auditeur: 'Benali Karim'  },
  { entreprise: 'CyberDef',    score: 55, statut: 'en attente', date: '21/05/2024', auditeur: 'Nguyen Linh'   },
]

export default function AdminDashboard({ onBack }) {
  const [activeNav,   setActiveNav]   = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userFilter,  setUserFilter]  = useState('tous')
  const [users, setUsers] = useState([])

  useEffect(() => {
    // Utilisation de fetch
    fetch('http://localhost:5000/api/users')  // adapte l'URL à ton backend
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => {
        console.error('Erreur fetch users:', err)
        setUsers([])  // fallback vide si erreur
      })})

  const filteredUsers = users.filter(u =>
    userFilter === 'tous' ? true : u.statut === userFilter
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', background: '#f0f6ff' }}>

      {/* SIDEBAR */}
      <div style={{ width: sidebarOpen ? '240px' : '68px', background: 'linear-gradient(180deg, #0b1f45 0%, #0d2a60 100%)', display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease', flexShrink: 0, boxShadow: '4px 0 20px rgba(11,31,69,0.25)' }}>
        <div style={{ padding: '24px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', background: '#1b6fd8', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, boxShadow: '0 4px 12px rgba(27,111,216,0.5)' }}>🛡️</div>
          {sidebarOpen && <div><div style={{ fontFamily: 'Sora, sans-serif', fontWeight: '800', fontSize: '16px', color: 'white' }}>IFSentry</div><div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Administration</div></div>}
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
              {activeNav === 'users'    && 'Gestion des utilisateurs'}
              {activeNav === 'sessions' && 'Sessions de chat'}
              {activeNav === 'reports'  && 'Rapports'}
              {activeNav === 'settings' && 'Paramètres'}
            </h1>
            <p style={{ fontSize: '12px', color: '#6b8cba', margin: 0 }}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <div style={{ width: '38px', height: '38px', background: '#f0f6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', border: '1px solid rgba(27,111,216,0.15)' }}>🔔</div>
              <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '14px', height: '14px', background: '#ef4444', borderRadius: '50%', fontSize: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', border: '2px solid white' }}>3</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #1b6fd8, #3b9eff)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 4px 12px rgba(27,111,216,0.35)' }}>👨‍💼</div>
              <div><div style={{ fontSize: '13px', fontWeight: '700', color: '#0b1f45' }}>Administrateur</div><div style={{ fontSize: '11px', color: '#6b8cba' }}>admin@ifsentry.com</div></div>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>

          {/* DASHBOARD */}
          {activeNav === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
                {STATS.map(s => <StatCard key={s.label} stat={s} />)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                <div style={{ background: 'white', borderRadius: '18px', padding: '24px', border: '1px solid rgba(27,111,216,0.08)', boxShadow: '0 4px 20px rgba(11,31,69,0.06)' }}>
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '15px', fontWeight: '800', color: '#0b1f45', marginBottom: '20px' }}>📊 Taux de conformité par domaine</h3>
                  {CONFORMITE.map(c => (
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
                <div style={{ background: 'white', borderRadius: '18px', padding: '24px', border: '1px solid rgba(27,111,216,0.08)', boxShadow: '0 4px 20px rgba(11,31,69,0.06)' }}>
                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '15px', fontWeight: '800', color: '#0b1f45', marginBottom: '20px' }}>💬 Sessions récentes</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {SESSIONS_RECENT.map(s => (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', background: '#f8fbff', border: '1px solid rgba(27,111,216,0.07)' }}>
                        <div style={{ width: '32px', height: '32px', background: '#e8f2ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>💬</div>
                        <div style={{ flex: 1 }}><div style={{ fontSize: '12px', fontWeight: '700', color: '#0b1f45' }}>{s.user}</div><div style={{ fontSize: '10px', color: '#6b8cba' }}>{s.date} · {s.msgs} messages</div></div>
                        <StatutBadge statut={s.statut} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ background: 'white', borderRadius: '18px', padding: '24px', border: '1px solid rgba(27,111,216,0.08)', boxShadow: '0 4px 20px rgba(11,31,69,0.06)' }}>
                <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '15px', fontWeight: '800', color: '#0b1f45', marginBottom: '20px' }}>🕐 Activité récente</h3>
                {[
                  { icon: '👤', text: 'Nouveau compte créé — Ahmed Youssef', time: 'il y a 2h',  color: '#1b6fd8' },
                  { icon: '📄', text: 'Rapport généré — Acme Corp',           time: 'il y a 4h',  color: '#22c55e' },
                  { icon: '⚠️', text: 'Non-conformité détectée — TechCo',     time: 'il y a 6h',  color: '#ef4444' },
                  { icon: '✅', text: 'Rapport validé — DataGroup',           time: 'hier 15:30', color: '#22c55e' },
                  { icon: '🔐', text: 'Tentative de connexion échouée',        time: 'hier 09:12', color: '#f59e0b' },
                ].map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < 4 ? '1px solid rgba(27,111,216,0.06)' : 'none' }}>
                    <div style={{ width: '34px', height: '34px', background: `${a.color}15`, borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0 }}>{a.icon}</div>
                    <span style={{ flex: 1, fontSize: '13px', color: '#0b1f45', fontWeight: '500' }}>{a.text}</span>
                    <span style={{ fontSize: '11px', color: '#aab8cc' }}>{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* UTILISATEURS */}
          {activeNav === 'users' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['tous', 'actif', 'inactif', 'suspendu'].map(f => (
                    <button key={f} onClick={() => setUserFilter(f)} style={{ padding: '7px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', background: userFilter === f ? '#1b6fd8' : 'white', color: userFilter === f ? 'white' : '#6b8cba', border: `1.5px solid ${userFilter === f ? '#1b6fd8' : 'rgba(27,111,216,0.2)'}`, boxShadow: userFilter === f ? '0 4px 12px rgba(27,111,216,0.3)' : 'none' }}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
                <button style={{ padding: '9px 20px', background: '#1b6fd8', color: 'white', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Sora, sans-serif', boxShadow: '0 4px 14px rgba(27,111,216,0.4)' }}>+ Ajouter utilisateur</button>
              </div>
              <div style={{ background: 'white', borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(27,111,216,0.08)', boxShadow: '0 4px 20px rgba(11,31,69,0.06)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr 2fr 1fr', background: 'linear-gradient(135deg, #0b1f45, #1040a0)', padding: '14px 24px' }}>
                  {['Nom', 'Email', 'Entreprise', 'Actions'].map(h => (
                    <div key={h} style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{h}</div>
                  ))}
                </div>
                {filteredUsers.map((u, i) => <UserRow key={u.id} user={u} isLast={i === filteredUsers.length - 1} />)}
              </div>
            </div>
          )}

          {/* SESSIONS */}
          {activeNav === 'sessions' && (
            <div style={{ background: 'white', borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(27,111,216,0.08)', boxShadow: '0 4px 20px rgba(11,31,69,0.06)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 0.8fr 1fr 1fr', background: 'linear-gradient(135deg, #0b1f45, #1040a0)', padding: '14px 20px' }}>
                {['Session ID', 'Utilisateur', 'Messages', 'Statut', 'Date'].map(h => (
                  <div key={h} style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{h}</div>
                ))}
              </div>
              {SESSIONS_RECENT.map((s, i) => (
                <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 0.8fr 1fr 1fr', padding: '14px 20px', borderBottom: i < SESSIONS_RECENT.length - 1 ? '1px solid rgba(27,111,216,0.06)' : 'none', background: i % 2 === 0 ? 'white' : '#fafcff', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#1b6fd8' }}>{s.id}</span>
                  <span style={{ fontSize: '13px', color: '#0b1f45', fontWeight: '600' }}>{s.user}</span>
                  <span style={{ fontSize: '13px', color: '#0b1f45' }}>{s.msgs}</span>
                  <StatutBadge statut={s.statut} />
                  <span style={{ fontSize: '12px', color: '#6b8cba', fontFamily: 'monospace' }}>{s.date}</span>
                </div>
              ))}
            </div>
          )}

          {/* RAPPORTS */}
          {activeNav === 'reports' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
              {RAPPORTS.map((r, i) => <RapportCard key={i} rapport={r} />)}
            </div>
          )}

          {/* PARAMÈTRES */}
          {activeNav === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' }}>
              {[
                { titre: '🔔 Notifications',          desc: 'Recevoir des alertes par email',      active: true  },
                { titre: '🔐 Double authentification', desc: "Sécuriser l'accès admin",             active: true  },
                { titre: '📊 Rapports automatiques',   desc: 'Générer les rapports chaque semaine', active: false },
                { titre: '🌙 Mode sombre',             desc: 'Interface en thème sombre',           active: false },
              ].map((s, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(27,111,216,0.08)', boxShadow: '0 2px 10px rgba(11,31,69,0.05)' }}>
                  <div><div style={{ fontSize: '14px', fontWeight: '700', color: '#0b1f45', marginBottom: '3px' }}>{s.titre}</div><div style={{ fontSize: '12px', color: '#6b8cba' }}>{s.desc}</div></div>
                  <div style={{ width: '44px', height: '24px', borderRadius: '100px', background: s.active ? '#1b6fd8' : '#d1e3f8', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: s.active ? '23px' : '3px', transition: 'left 0.3s', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

/* ══ HELPERS ══ */

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
        <div style={{ fontSize: '10px', color: '#22c55e', fontWeight: '700', background: '#f0fff4', padding: '3px 8px', borderRadius: '100px', border: '1px solid rgba(34,197,94,0.2)' }}>↑ actif</div>
      </div>
      <div style={{ fontFamily: 'Sora, sans-serif', fontSize: '26px', fontWeight: '800', color: '#0b1f45', letterSpacing: '-1px', lineHeight: '1', marginBottom: '4px' }}>{stat.value}</div>
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
        <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #1b6fd8, #3b9eff)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0, boxShadow: '0 3px 8px rgba(27,111,216,0.3)' }}>👤</div>
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#0b1f45' }}>{user.nom}</span>
      </div>
      <span style={{ fontSize: '13px', color: '#6b8cba' }}>{user.email}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
        <div style={{ width: '26px', height: '26px', background: '#f0f6ff', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>🏢</div>
        <span style={{ fontSize: '13px', color: '#0b1f45', fontWeight: '600' }}>{user.entreprise}</span>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button style={{ padding: '6px 12px', background: '#e8f2ff', color: '#1b6fd8', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#1b6fd8'; e.currentTarget.style.color = 'white' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#e8f2ff'; e.currentTarget.style.color = '#1b6fd8' }}>✏️</button>
        <button style={{ padding: '6px 12px', background: '#fff0f0', color: '#ef4444', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff0f0'; e.currentTarget.style.color = '#ef4444' }}>🗑️</button>
      </div>
    </div>
  )
}

function RapportCard({ rapport }) {
  const [hovered, setHovered] = useState(false)
  const scoreColor = rapport.score >= 80 ? '#22c55e' : rapport.score >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ background: 'white', borderRadius: '16px', padding: '22px', border: `1px solid ${hovered ? 'rgba(27,111,216,0.25)' : 'rgba(27,111,216,0.08)'}`, boxShadow: hovered ? '0 12px 32px rgba(11,31,69,0.1)' : '0 4px 16px rgba(11,31,69,0.06)', transition: 'all 0.3s', transform: hovered ? 'translateY(-4px)' : 'translateY(0)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ fontSize: '16px', fontWeight: '800', color: '#0b1f45', fontFamily: 'Sora, sans-serif' }}>{rapport.entreprise}</div>
        <StatutBadge statut={rapport.statut} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
        <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: `conic-gradient(${scoreColor} ${rapport.score * 3.6}deg, #f0f6ff 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Sora, sans-serif', fontSize: '13px', fontWeight: '800', color: scoreColor }}>{rapport.score}%</span>
          </div>
        </div>
        <div><div style={{ fontSize: '12px', fontWeight: '600', color: '#0b1f45' }}>Score conformité</div><div style={{ fontSize: '11px', color: '#6b8cba' }}>ISO 27001</div></div>
      </div>
      <div style={{ fontSize: '11px', color: '#6b8cba', marginBottom: '4px' }}>👨‍💼 {rapport.auditeur}</div>
      <div style={{ fontSize: '11px', color: '#aab8cc', marginBottom: '14px' }}>📅 {rapport.date}</div>
      <button style={{ width: '100%', padding: '8px', background: '#e8f2ff', color: '#1b6fd8', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}>Voir le rapport →</button>
    </div>
  )
}
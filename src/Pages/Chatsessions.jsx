import { useState } from 'react'

const generateSessions = () => {
  const sessions = []
  const ids = [
    '4f6c807a-6e1a-4895-a00e-275ea5cf7ae7',
    '71b8a359-905a-46a8-a6f5-7ab8311ac732',
    'fcc6f7ae-ef6e-4988-81a5-0f1aa477ba61',
    '4f11f336-9b05-4327-88fc-e71aa53ab03c',
    '47349827-0523-4c03-d736-80a957a035a',
    '7537fab5-d898-4ad7-9516-4d8eaa6efa97',
    '7196d2f-a9ac-4c25-b892-d7748b81830',
    '4039b330-6e13-4c7a-8bd4-53ab8875ab3',
    '73ba9c03-6af3-4080-a3b4-10895824af1a',
    '196f5a05-25ba-4e3c-ac0a-5173e376a778',
    'd9e6fb6d-310a-4a9e-8d18-aaf5a3a088b7',
    'a1d1a952-133a-4c61-8a8d-09677788a3a',
    '8f113105-8916-4c27-9ac7-8886b87a8993',
    '24da8c37-8832-49c2-b13c-a67a8ab49b41',
    '23750ce1-c738-4a98-8ca8-71a967a98383',
    '8e6ba40-4301-4160-8163-4af5c7ab6f93',
    '18ca8b11-3917-401a-aa0e-21309c3c9a45',
    'bf6a8f8c-4ba7-4214-8898-06d98001fe71',
    'a301116a-da80-4a7c-9aad-8861360330c15',
    'e5177b63-7ba8-47c3-8107-a8c1153540a8',
    'ef80ef63-3013-4e43-a891-4aa888038aab5',
    'e18a97a6-51be-4c13-8c56-7677136c7738',
    'a676c741-38ae-4e43-ac18-c317aaea05ba',
    '8aaaa603-a638-4aad-8ae3-136a763ac768',
    '83886310-78c3-4c39-8a87-1a9b78c3aab6',
    '8ba81279-6d4e-4698-87c8-8c1331765b61',
    '8aaaee7c-c271-4c15-8ab2-8aea808a96b2',
    'a038886e-8ac7-a8ac-3110-a78e1a80c13',
    'bc7888ec-3ac7-4b3c-8b3c-88c3a03b5a89',
    'b17c7ab3-c611-4a8c-3136-a3c3f8aaab63c',
    '71c718a8-c831-4a8c-311c-a3c3f8aaab63c',
  ]

  const dates = [
    '26/05/2024 09:36:12', '25/05/2024 08:41:54', '17/05/2024 16:17:52',
    '13/05/2024 15:08:43', '19/05/2024 12:15:21', '16/06/2024 12:07:16',
    '13/05/2024 12:53:40', '17/05/2024 15:36:00', '14/05/2024 08:40:42',
    '15/05/2024 08:41:95', '21/05/2024 15:23:19', '23/05/2024 13:55:12',
    '15/05/2024 08:48:01', '16/08/2024 12:09:25', '14/05/2024 08:41:28',
    '23/05/2024 11:51:08', '22/05/2024 11:44:52', '22/05/2024 15:23:51',
    '17/05/2024 12:48:08', '17/05/2024 15:56:12', '16/05/2024 08:40:08',
    '22/05/2024 15:26:00', '22/05/2024 11:47:48', '12/10/2024 15:58:10',
    '17/01/2024 13:08:28', '28/07/2024 08:40:43', '10/01/2024 09:50:47',
    '14/10/2024 08:46:07', '15/05/2024 10:51:07', '26/01/2024 16:04:40',
    '17/01/2024 10:00:41',
  ]

  const msgs = [5,5,10,9,9,10,9,10,9,9,9,9,5,10,9,9,9,9,9,10,9,9,9,9,9,10,9,9,10,10,10]

  return ids.map((id, i) => ({
    id,
    messages: msgs[i] || Math.floor(Math.random() * 12) + 3,
    date: dates[i] || '01/01/2024 00:00:00',
  }))
}

const ALL_SESSIONS = generateSessions()

export default function ChatSessions({ onBack }) {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const PER_PAGE = 10

  const filtered = ALL_SESSIONS.filter(s =>
    s.id.toLowerCase().includes(search.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'messages') {
      return sortDir === 'asc' ? a.messages - b.messages : b.messages - a.messages
    }
    return sortDir === 'asc'
      ? a.date.localeCompare(b.date)
      : b.date.localeCompare(a.date)
  })

  const totalPages = Math.ceil(sorted.length / PER_PAGE)
  const paginated = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span style={{ color: 'rgba(255,255,255,0.3)', marginLeft: '4px' }}>↕</span>
    return <span style={{ color: '#3b9eff', marginLeft: '4px' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f6ff', fontFamily: 'DM Sans, sans-serif' }}>

      {/* ══ HEADER ══ */}
      <div style={{
        background: 'linear-gradient(135deg, #0b1f45 0%, #1040a0 55%, #1b6fd8 100%)',
        padding: '32px 48px 48px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '400px', height: '400px', borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(59,158,255,0.15) 0%, transparent 70%)',
        }} />

        {/* Bouton retour */}
        <button onClick={onBack} style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px', color: 'white', fontSize: '13px', fontWeight: '600',
          padding: '8px 16px', cursor: 'pointer', marginBottom: '28px',
          fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s', position: 'relative', zIndex: 2,
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          ← Retour
        </button>

        {/* Titre + sous-titre */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(59,158,255,0.2)', border: '1px solid rgba(59,158,255,0.4)',
              borderRadius: '100px', padding: '4px 14px', fontSize: '11px', fontWeight: '700',
              color: '#3b9eff', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '12px',
            }}>
              💬 Tableau de bord
            </div>
            <h1 style={{
              fontFamily: 'Sora, sans-serif', fontSize: '32px', fontWeight: '800',
              color: 'white', letterSpacing: '-1px', lineHeight: '1.1', marginBottom: '8px',
            }}>
              Sessions de <span style={{ color: '#3b9eff' }}>Chat</span>
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
              {ALL_SESSIONS.length} sessions enregistrées au total
            </p>
          </div>

          {/* Stats rapides */}
          <div style={{ display: 'flex', gap: '16px' }}>
            {[
              { num: ALL_SESSIONS.length, label: 'Sessions totales', icon: '💬' },
              { num: ALL_SESSIONS.reduce((s, x) => s + x.messages, 0), label: 'Messages totaux', icon: '📨' },
              { num: Math.round(ALL_SESSIONS.reduce((s, x) => s + x.messages, 0) / ALL_SESSIONS.length), label: 'Moy. messages', icon: '📊' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '14px', padding: '14px 20px', textAlign: 'center', minWidth: '110px',
              }}>
                <div style={{ fontSize: '18px', marginBottom: '4px' }}>{s.icon}</div>
                <div style={{ fontFamily: 'Sora, sans-serif', fontSize: '22px', fontWeight: '800', color: 'white', letterSpacing: '-0.5px', lineHeight: '1' }}>
                  {s.num}
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', fontWeight: '500' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vague */}
      <div style={{ marginTop: '-2px', lineHeight: 0 }}>
        <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block' }}>
          <path d="M0 0 C480 50 960 50 1440 0 L1440 50 L0 50 Z" fill="#f0f6ff"/>
        </svg>
      </div>

      {/* ══ CONTENU ══ */}
      <div style={{ padding: '0 48px 60px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Barre de recherche + info */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '16px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '420px' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', pointerEvents: 'none' }}>🔍</span>
            <input
              type="text"
              placeholder="Rechercher par ID de session..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
              style={{
                width: '100%', padding: '11px 14px 11px 42px', fontSize: '14px',
                border: '1.5px solid rgba(27,111,216,0.2)', borderRadius: '10px',
                background: 'white', color: '#0b1f45', outline: 'none',
                fontFamily: 'DM Sans, sans-serif', boxShadow: '0 2px 8px rgba(10,22,40,0.06)',
                transition: 'all 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = '#1b6fd8'; e.target.style.boxShadow = '0 0 0 3px rgba(27,111,216,0.1)' }}
              onBlur={e  => { e.target.style.borderColor = 'rgba(27,111,216,0.2)'; e.target.style.boxShadow = '0 2px 8px rgba(10,22,40,0.06)' }}
            />
          </div>
          <div style={{ fontSize: '13px', color: '#6b8cba', fontWeight: '500' }}>
            Affichage de <strong style={{ color: '#0b1f45' }}>{(currentPage-1)*PER_PAGE+1}–{Math.min(currentPage*PER_PAGE, sorted.length)}</strong> sur <strong style={{ color: '#0b1f45' }}>{sorted.length}</strong> sessions
          </div>
        </div>

        {/* ══ TABLE ══ */}
        <div style={{
          background: 'white', borderRadius: '20px',
          boxShadow: '0 4px 30px rgba(10,22,40,0.08)',
          border: '1px solid rgba(27,111,216,0.08)',
          overflow: 'hidden',
        }}>
          {/* En-tête */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 160px 200px',
            background: 'linear-gradient(135deg, #0b1f45, #1040a0)',
            padding: '0',
          }}>
            {[
              { label: 'Session ID', field: null, align: 'left' },
              { label: 'Messages', field: 'messages', align: 'center' },
              { label: 'Créée le', field: 'date', align: 'right' },
            ].map((col, i) => (
              <div
                key={col.label}
                onClick={() => col.field && handleSort(col.field)}
                style={{
                  padding: '16px 24px',
                  fontSize: '11px', fontWeight: '700', letterSpacing: '0.8px',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)',
                  cursor: col.field ? 'pointer' : 'default',
                  textAlign: col.align,
                  userSelect: 'none',
                  transition: 'color 0.2s',
                  borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                }}
                onMouseEnter={e => col.field && (e.currentTarget.style.color = 'white')}
                onMouseLeave={e => col.field && (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              >
                {col.label} {col.field && <SortIcon field={col.field} />}
              </div>
            ))}
          </div>

          {/* Lignes */}
          {paginated.map((session, idx) => (
            <Row key={session.id} session={session} idx={idx} isLast={idx === paginated.length - 1} />
          ))}

          {paginated.length === 0 && (
            <div style={{ padding: '60px', textAlign: 'center', color: '#6b8cba' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
              <p style={{ fontWeight: '600' }}>Aucune session trouvée</p>
            </div>
          )}
        </div>

        {/* ══ PAGINATION ══ */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '28px' }}>
            <PageBtn onClick={() => setCurrentPage(1)} disabled={currentPage === 1} label="««" />
            <PageBtn onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} label="‹ Précédent" />

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i-1] > 1) acc.push('...')
                acc.push(p)
                return acc
              }, [])
              .map((p, i) => p === '...'
                ? <span key={`e${i}`} style={{ padding: '0 4px', color: '#6b8cba' }}>…</span>
                : <PageBtn key={p} onClick={() => setCurrentPage(p)} active={currentPage === p} label={p} />
              )
            }

            <PageBtn onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} label="Suivant ›" />
            <PageBtn onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} label="»»" />
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Composant Ligne ── */
function Row({ session, idx, isLast }) {
  const [hovered, setHovered] = useState(false)

  const msgColor = session.messages >= 10
    ? { bg: 'rgba(239,68,68,0.1)',  text: '#dc2626', border: 'rgba(239,68,68,0.2)'  }
    : session.messages >= 7
    ? { bg: 'rgba(245,158,11,0.1)', text: '#d97706', border: 'rgba(245,158,11,0.2)' }
    : { bg: 'rgba(59,130,246,0.1)', text: '#2563eb', border: 'rgba(59,130,246,0.2)' }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid', gridTemplateColumns: '1fr 160px 200px',
        background: hovered ? '#f0f6ff' : idx % 2 === 0 ? 'white' : '#fafcff',
        borderBottom: isLast ? 'none' : '1px solid rgba(27,111,216,0.07)',
        transition: 'background 0.15s', cursor: 'pointer',
      }}
    >
      {/* Session ID */}
      <div style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderRight: '1px solid rgba(27,111,216,0.07)' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
          background: hovered ? 'linear-gradient(135deg, #1b6fd8, #3b9eff)' : '#e8f2ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', transition: 'all 0.2s',
        }}>
          💬
        </div>
        <span style={{
          fontFamily: 'monospace', fontSize: '13px',
          color: hovered ? '#1b6fd8' : '#0b1f45', fontWeight: '500',
          letterSpacing: '0.3px', transition: 'color 0.2s',
        }}>
          {session.id}
        </span>
      </div>

      {/* Messages */}
      <div style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(27,111,216,0.07)' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '4px 12px', borderRadius: '100px', fontSize: '12px',
          fontWeight: '700', background: msgColor.bg, color: msgColor.text,
          border: `1px solid ${msgColor.border}`,
        }}>
          📨 {session.messages}
        </span>
      </div>

      {/* Date */}
      <div style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '12px', color: '#6b8cba', fontWeight: '500', fontFamily: 'monospace' }}>
          🕐 {session.date}
        </span>
      </div>
    </div>
  )
}

/* ── Bouton pagination ── */
function PageBtn({ onClick, disabled, active, label }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
        fontFamily: 'DM Sans, sans-serif', border: '1.5px solid',
        background: active ? '#1b6fd8' : hovered && !disabled ? '#e8f2ff' : 'white',
        color: active ? 'white' : disabled ? '#c5d4e8' : hovered ? '#1b6fd8' : '#0b1f45',
        borderColor: active ? '#1b6fd8' : disabled ? '#e2ecf7' : hovered ? '#1b6fd8' : 'rgba(27,111,216,0.2)',
        boxShadow: active ? '0 4px 12px rgba(27,111,216,0.35)' : 'none',
      }}
    >
      {label}
    </button>
  )
}
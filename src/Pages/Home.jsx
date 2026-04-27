import Navbar from '../components/Navbar.jsx'
import SecurityCard from '../components/SecurityCard.jsx'

export default function Home({ onSignUp, onSignIn, onAbout, onDashboard, onAdmin, onChatBot, onContact, user, onLogout }) {
  return (
    <>
      <Navbar
        onSignUp={onSignUp}
        onSignIn={onSignIn}
        onAbout={onAbout}
        onDashboard={onDashboard}
        onChatBot={onChatBot}
        onContact={onContact}
        user={user}
        onLogout={onLogout}
      />

      <main className="hero">
        <div style={{
          position: 'absolute', top: '-150px', right: '-180px',
          width: '600px', height: '600px', borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(27,111,216,0.1) 0%, transparent 70%)'
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', left: '-120px',
          width: '500px', height: '500px', borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(59,158,255,0.08) 0%, transparent 70%)'
        }} />

        {/* ══ TITRE ══ */}
        <section style={{ position: 'relative', zIndex: 1, width: '100%', textAlign: 'center', padding: '64px 24px 44px' }}>

          <div className="hero-badge">🛡️ Plateforme de sécurité IA</div>

          <h1 className="hero-title">
            Atteignez la conformité <span>ISO 27001</span> en toute confiance
          </h1>

          <p style={{ marginTop: '14px', fontSize: '15px', color: '#6b8cba' }}>
            Évaluations automatisées · Analyses en temps réel · Informations exploitables
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', marginTop: '28px' }}>
            {user ? (
              <button className="btn-primary" onClick={onChatBot}>
                🤖 Lancer l'audit ISO 27001
              </button>
            ) : (
              <button className="btn-primary" onClick={onSignIn}>
                Commencer l'audit →
              </button>
            )}
            <button className="btn-ghost" onClick={onAbout}>En savoir plus →</button>
          </div>

          {/* Message de bienvenue si connecté */}
          {user && (
            <div style={{
              marginTop: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(27,111,216,0.08)',
              border: '1px solid rgba(27,111,216,0.15)',
              borderRadius: '100px',
              padding: '8px 20px',
            }}>
              <div style={{
                width: '28px', height: '28px',
                background: 'linear-gradient(135deg, #1b6fd8, #3b9eff)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: '800', color: 'white',
                fontFamily: '"Sora", sans-serif',
              }}>
                {getInitials(user)}
              </div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#0b1f45' }}>
                Bienvenue, <strong>{getName(user)}</strong> 👋
              </span>
            </div>
          )}
        </section>

        {/* ══ QR CODE PWA — seulement sur PC ══ */}
        <section style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '1100px', padding: '0 40px 24px', display: window.innerWidth < 768 ? 'none' : 'flex', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px 40px', border: '1px solid rgba(27,111,216,0.12)', boxShadow: '0 8px 32px rgba(11,31,69,0.08)', display: 'flex', alignItems: 'center', gap: '28px', maxWidth: '560px', width: '100%' }}>
            {/* QR Code via API publique */}
            <div style={{ flexShrink: 0, background: 'white', padding: '8px', borderRadius: '12px', border: '2px solid #1b6fd8', boxShadow: '0 4px 16px rgba(27,111,216,0.15)' }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(window.location.origin)}&color=0b1f45&bgcolor=ffffff`}
                alt="QR Code AuditWise"
                width={120}
                height={120}
                style={{ borderRadius: '8px', display: 'block' }}
              />
            </div>
            {/* Texte */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>📱</span>
                <span style={{ fontFamily: '"Sora", sans-serif', fontSize: '16px', fontWeight: '800', color: '#0b1f45' }}>Accès Mobile</span>
              </div>
              <p style={{ fontSize: '13px', color: '#6b8cba', lineHeight: '1.6', margin: '0 0 12px' }}>
                Scannez ce QR code avec votre téléphone pour accéder à AuditWise et installer l'application.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ padding: '4px 10px', background: '#e8f2ff', borderRadius: '20px', fontSize: '11px', fontWeight: '700', color: '#1b6fd8' }}>📲 iOS Safari</span>
                <span style={{ padding: '4px 10px', background: '#e8f2ff', borderRadius: '20px', fontSize: '11px', fontWeight: '700', color: '#1b6fd8' }}>🤖 Android Chrome</span>
                <span style={{ padding: '4px 10px', background: '#f0fff4', borderRadius: '20px', fontSize: '11px', fontWeight: '700', color: '#16a34a' }}>✅ PWA</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══ CARD ══ */}
        <section style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '1100px', padding: '0 40px 48px' }}>
          <SecurityCard />
        </section>
      </main>
    </>
  )
}

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
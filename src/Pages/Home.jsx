import Navbar from '../components/Navbar.jsx'
import SecurityCard from '../components/SecurityCard.jsx'


export default function Home({ onSignUp, onSignIn, onAbout }) {
  return (
    <>
      <Navbar onSignUp={onSignUp} onSignIn={onSignIn} onAbout={onAbout} />

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
            
            <button className="btn-ghost" onClick={onAbout}>En savoir plus →</button>
          </div>
        </section>

        {/* ══ CARD ══ */}
        <section style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '1100px', padding: '0 40px 48px' }}>
          <SecurityCard />
        </section>

        {/* ══ STATS ══ */}
        
      </main>
    </>
  )
}
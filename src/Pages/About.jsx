import { useState, useEffect } from 'react'

const TEAM = [
  { nom: 'Malek Bouzaabia',   role: 'Développeur Full Stack',  emoji: '👨‍💻', color: '#1b6fd8' },
  { nom: 'Encadreur PFE',     role: 'Encadreur Académique',    emoji: '🎓', color: '#8b5cf6' },
  { nom: 'Draexlmaier Group', role: 'Partenaire Industriel',   emoji: '🏭', color: '#22c55e' },
]

const FEATURES = [
  { icon: '🤖', title: 'IA Générative',       desc: 'Propulsé par Groq LLaMA 3.3 — analyse intelligente de vos réponses en temps réel.',           color: '#1b6fd8' },
  { icon: '📋', title: 'ISO 27001:2022',       desc: '106 questions couvrant les 13 domaines de la norme ISO 27001:2022 intégralement.',             color: '#8b5cf6' },
  { icon: '📄', title: 'Rapports PDF',         desc: 'Génération automatique de rapports professionnels avec recommandations RAG personnalisées.',    color: '#f59e0b' },
  { icon: '🎯', title: 'Campagnes d\'Audit',   desc: 'Système de campagnes avec suivi des participants et statistiques par domaine.',                 color: '#22c55e' },
  { icon: '🔐', title: 'Sécurité MFA',         desc: 'Authentification multi-facteurs et accès restreint aux emails autorisés.',                     color: '#ef4444' },
  { icon: '📊', title: 'Dashboard Admin',      desc: 'Tableau de bord complet pour suivre les audits, sessions et statistiques en temps réel.',       color: '#06b6d4' },
]

const STACK = [
  { name: 'React',      icon: '⚛️',  cat: 'Frontend'  },
  { name: 'Node.js',    icon: '🟢',  cat: 'Backend'   },
  { name: 'MongoDB',    icon: '🍃',  cat: 'Base de données' },
  { name: 'Groq AI',    icon: '🤖',  cat: 'IA'        },
  { name: 'PDFKit',     icon: '📄',  cat: 'PDF'       },
  { name: 'JWT + MFA',  icon: '🔐',  cat: 'Sécurité'  },
  { name: 'Render',     icon: '☁️',  cat: 'Cloud'     },
  { name: 'RAG',        icon: '📚',  cat: 'IA'        },
]

export default function About({ onBack, onSignUp }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#f0f6ff', fontFamily: '"DM Sans", sans-serif', overflow: 'hidden' }}>

      {/* ── HERO ── */}
      <div style={{ background: 'linear-gradient(135deg, #0b1f45 0%, #1040a0 50%, #1b6fd8 100%)', padding: '80px 40px 100px', position: 'relative', overflow: 'hidden' }}>
        {/* Cercles décoratifs */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(59,158,255,0.08)', border: '1px solid rgba(59,158,255,0.1)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(59,158,255,0.05)', border: '1px solid rgba(59,158,255,0.08)' }} />

        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: 'white', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginBottom: '40px', fontFamily: '"DM Sans", sans-serif' }}>
            ← Retour
          </button>

          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(27,111,216,0.3)', border: '1px solid rgba(59,158,255,0.4)', borderRadius: '100px', padding: '6px 16px', marginBottom: '24px' }}>
            <span style={{ fontSize: '12px' }}>🎓</span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#7ab3f0', letterSpacing: '0.5px' }}>PROJET PFE — DRAEXLMAIER GROUP</span>
          </div>

          <h1 style={{ fontFamily: '"Sora", sans-serif', fontSize: '52px', fontWeight: '800', color: 'white', lineHeight: '1.1', marginBottom: '20px', letterSpacing: '-1px' }}>
            À propos de<br />
            <span style={{ background: 'linear-gradient(90deg, #3b9eff, #7ab3f0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AuditWise AI</span>
          </h1>

          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.7', maxWidth: '600px', marginBottom: '40px' }}>
            Plateforme d'auto-évaluation ISO 27001:2022 propulsée par l'intelligence artificielle — développée dans le cadre d'un projet de fin d'études.
          </p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', maxWidth: '700px' }}>
            {[
              { num: '106', label: 'Questions' },
              { num: '13',  label: 'Domaines' },
              { num: 'AI',  label: 'Propulsé' },
              { num: 'ISO', label: '27001:2022' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.06)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontFamily: '"Sora", sans-serif', fontSize: '28px', fontWeight: '800', color: '#3b9eff' }}>{s.num}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '600', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENU ── */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 40px' }}>

        {/* ISO 27001 Definition */}
        <div style={{ background: 'linear-gradient(135deg, #0b1f45, #1040a0)', borderRadius: '24px', padding: '40px', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(59,158,255,0.06)', border: '1px solid rgba(59,158,255,0.1)' }} />
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '56px', height: '56px', background: 'rgba(27,111,216,0.4)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0, border: '1px solid rgba(59,158,255,0.3)' }}>📋</div>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(59,158,255,0.15)', border: '1px solid rgba(59,158,255,0.3)', borderRadius: '100px', padding: '4px 12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '10px', fontWeight: '700', color: '#7ab3f0', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Norme internationale</span>
              </div>
              <h2 style={{ fontFamily: '"Sora", sans-serif', fontSize: '22px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>
                Qu'est-ce que la norme ISO 27001:2022 ?
              </h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', lineHeight: '1.8', marginBottom: '20px' }}>
                <strong style={{ color: '#3b9eff' }}>ISO/IEC 27001:2022</strong> est une norme internationale publiée par l'Organisation internationale de normalisation (ISO) qui spécifie les exigences pour établir, mettre en œuvre, maintenir et améliorer continuellement un <strong style={{ color: '#7ab3f0' }}>Système de Management de la Sécurité de l'Information (SMSI)</strong>.
              </p>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.8', marginBottom: '24px' }}>
                Elle aide les organisations à gérer la sécurité de leurs actifs informationnels — données financières, propriété intellectuelle, données des employés, ou informations confiées par des tiers — en appliquant un processus de gestion des risques.
              </p>
              {/* Piliers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { icon: '🔒', title: 'Confidentialité',  desc: 'Protéger les données contre les accès non autorisés' },
                  { icon: '✅', title: 'Intégrité',         desc: 'Garantir lexactitude et la fiabilité des données' },
                  { icon: '📡', title: 'Disponibilité',     desc: 'Assurer laccès aux données quand nécessaire' },
                ].map((p, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '22px', marginBottom: '8px' }}>{p.icon}</div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: 'white', marginBottom: '4px' }}>{p.title}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.5' }}>{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mission */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '40px', marginBottom: '32px', border: '1px solid rgba(27,111,216,0.08)', boxShadow: '0 8px 32px rgba(11,31,69,0.06)' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #1b6fd8, #3b9eff)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0 }}>🎯</div>
            <div>
              <h2 style={{ fontFamily: '"Sora", sans-serif', fontSize: '22px', fontWeight: '800', color: '#0b1f45', marginBottom: '12px' }}>Notre Mission</h2>
              <p style={{ fontSize: '15px', color: '#6b8cba', lineHeight: '1.8' }}>
                AuditWise AI simplifie le processus d'auto-évaluation ISO 27001:2022 grâce à l'intelligence artificielle.
                Notre objectif est de permettre aux organisations — notamment <strong style={{ color: '#0b1f45' }}>Draexlmaier Group</strong> — d'évaluer
                leur conformité en sécurité de l'information de manière rapide, précise et automatisée.
              </p>
            </div>
          </div>
        </div>

        {/* Fonctionnalités */}
        <h2 style={{ fontFamily: '"Sora", sans-serif', fontSize: '22px', fontWeight: '800', color: '#0b1f45', marginBottom: '20px' }}>
          ✨ Fonctionnalités clés
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} feature={f} />
          ))}
        </div>

        {/* Stack technique */}
        <div style={{ background: 'linear-gradient(135deg, #0b1f45, #1040a0)', borderRadius: '24px', padding: '40px', marginBottom: '32px' }}>
          <h2 style={{ fontFamily: '"Sora", sans-serif', fontSize: '22px', fontWeight: '800', color: 'white', marginBottom: '24px' }}>
            🛠️ Stack Technique
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {STACK.map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{s.icon}</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'white' }}>{s.name}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.cat}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Équipe */}
        <h2 style={{ fontFamily: '"Sora", sans-serif', fontSize: '22px', fontWeight: '800', color: '#0b1f45', marginBottom: '20px' }}>
          👥 Équipe Projet
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
          {TEAM.map((t, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '18px', padding: '28px 24px', border: '1px solid rgba(27,111,216,0.08)', boxShadow: '0 4px 16px rgba(11,31,69,0.06)', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', background: `${t.color}20`, borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px' }}>{t.emoji}</div>
              <div style={{ fontFamily: '"Sora", sans-serif', fontSize: '14px', fontWeight: '800', color: '#0b1f45', marginBottom: '4px' }}>{t.nom}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>{t.role}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ background: 'linear-gradient(135deg, #1b6fd8, #1551a8)', borderRadius: '24px', padding: '48px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🚀</div>
          <h2 style={{ fontFamily: '"Sora", sans-serif', fontSize: '26px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>
            Prêt à auditer votre organisation ?
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginBottom: '28px' }}>
            Commencez votre auto-évaluation ISO 27001:2022 gratuitement dès aujourd'hui.
          </p>
          <button onClick={onSignUp}
            style={{ padding: '14px 36px', background: 'white', color: '#1b6fd8', border: 'none', borderRadius: '12px', fontFamily: '"Sora", sans-serif', fontSize: '15px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
            Créer mon compte →
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  )
}

function FeatureCard({ feature }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: 'white', borderRadius: '18px', padding: '24px', border: `1px solid ${hovered ? feature.color + '40' : 'rgba(27,111,216,0.08)'}`, boxShadow: hovered ? `0 12px 32px ${feature.color}20` : '0 4px 16px rgba(11,31,69,0.06)', transition: 'all 0.3s', transform: hovered ? 'translateY(-4px)' : 'translateY(0)' }}>
      <div style={{ width: '44px', height: '44px', background: feature.color + '15', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '14px' }}>{feature.icon}</div>
      <div style={{ fontFamily: '"Sora", sans-serif', fontSize: '14px', fontWeight: '800', color: '#0b1f45', marginBottom: '8px' }}>{feature.title}</div>
      <div style={{ fontSize: '12px', color: '#6b8cba', lineHeight: '1.6' }}>{feature.desc}</div>
    </div>
  )
}
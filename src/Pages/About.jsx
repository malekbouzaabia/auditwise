import { useState } from 'react'

const CARDS_TOP = [
  {
    icon: '🎯',
    title: 'Notre Mission',
    text: "Nous nous engageons à simplifier le monde complexe de la conformité en matière de sécurité de l'information. Notre application web pilotée par l'IA est conçue pour permettre aux organisations de toutes tailles d'atteindre et de maintenir la conformité aux normes ISO 27001. En intégrant une technologie IA avancée, nous rendons la conformité accessible, compréhensible et gérable.",
  },
  {
    icon: '👥',
    title: 'Qui Sommes-Nous',
    text: "Fondée par une équipe passionnée de professionnels de la cybersécurité et d'experts en IA, IFSentry a toujours été à l'avant-garde des solutions innovantes pour la sécurité de l'information. Avec des décennies d'expérience combinée en cybersécurité, conformité et technologie IA, nous apportons un mélange unique d'expertise.",
  },
  {
    icon: '💻',
    title: 'Notre Technologie',
    text: "Notre plateforme exploite la puissance de l'intelligence artificielle pour automatiser l'évaluation de la conformité ISO 27001. En intégrant des algorithmes d'apprentissage automatique de pointe et le traitement du langage naturel, notre application s'adapte aux besoins spécifiques de chaque utilisateur et s'améliore continuellement.",
  },
]

const CARDS_BOTTOM = [
  {
    icon: '🔒',
    title: 'Notre Engagement Sécurité',
    text: "La sécurité est au cœur de tout ce que nous faisons. Nous veillons à ce que notre application vous aide non seulement à respecter la norme ISO 27001, mais adhère également aux normes les plus élevées de protection des données. Nous employons des mesures de sécurité rigoureuses, notamment le chiffrement de bout en bout et des audits réguliers.",
  },
  {
    icon: '📬',
    title: 'Nous Contacter',
    text: "Vous souhaitez en savoir plus sur la façon dont notre application peut aider votre organisation ? Notre équipe dédiée est prête à répondre à toutes vos questions et à vous accompagner sur la voie d'une conformité simplifiée. Contactez-nous dès aujourd'hui pour planifier une démonstration ou parler à l'un de nos experts.",
  },
]

const STATS = [
  { num: '500+', label: 'Entreprises clientes'  },
  { num: '99%',  label: 'Taux de conformité'    },
  { num: '15+',  label: "Années d'expérience"   },
  { num: '24/7', label: 'Support disponible'    },
]

function Card({ card }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white', borderRadius: '20px', padding: '36px 32px',
        border: `1px solid ${hovered ? 'rgba(27,111,216,0.3)' : 'rgba(27,111,216,0.1)'}`,
        boxShadow: hovered
          ? '0 20px 60px rgba(10,22,40,0.14), 0 4px 20px rgba(27,111,216,0.12)'
          : '0 4px 24px rgba(10,22,40,0.07)',
        transition: 'all 0.3s',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden', cursor: 'default',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: hovered ? 'linear-gradient(90deg, #1b6fd8, #3b9eff)' : 'transparent',
        transition: 'all 0.3s',
      }} />
      <div style={{
        width: '54px', height: '54px', borderRadius: '14px',
        background: hovered ? 'linear-gradient(135deg, #1b6fd8, #3b9eff)' : '#e8f2ff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '26px', marginBottom: '20px', transition: 'all 0.3s',
        boxShadow: hovered ? '0 8px 20px rgba(27,111,216,0.35)' : 'none',
      }}>
        {card.icon}
      </div>
      <h3 style={{
        fontFamily: 'Sora, sans-serif', fontSize: '18px', fontWeight: '800',
        color: '#0b1f45', letterSpacing: '-0.4px', marginBottom: '14px',
      }}>
        {card.title}
      </h3>
      <p style={{ fontSize: '14px', color: '#6b8cba', lineHeight: '1.85' }}>
        {card.text}
      </p>
    </div>
  )
}

export default function About({ onBack, onSignUp }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f0f6ff', fontFamily: 'DM Sans, sans-serif' }}>

      {/* ══ BANNIÈRE HERO ══ */}
      <div style={{
        background: 'linear-gradient(135deg, #0b1f45 0%, #1040a0 55%, #1b6fd8 100%)',
        padding: '60px 60px 110px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div style={{
          position: 'absolute', top: '-120px', right: '-120px',
          width: '550px', height: '550px', borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(59,158,255,0.15) 0%, transparent 70%)',
        }} />

        {/* Bouton retour */}
        <button onClick={onBack} style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px', color: 'white', fontSize: '13px', fontWeight: '600',
          padding: '8px 16px', cursor: 'pointer', marginBottom: '44px',
          fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s', position: 'relative', zIndex: 2,
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          ← Retour à l'accueil
        </button>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(59,158,255,0.2)', border: '1px solid rgba(59,158,255,0.4)',
          borderRadius: '100px', padding: '5px 16px', fontSize: '12px', fontWeight: '700',
          color: '#3b9eff', letterSpacing: '0.8px', textTransform: 'uppercase',
          marginBottom: '18px', position: 'relative', zIndex: 2,
        }}>
          🤖 plateforme d'audit de conformité ISO 27001 
        </div>

        {/* Titre */}
        <h1 style={{
          fontFamily: 'Sora, sans-serif',
          fontSize: 'clamp(36px, 4.5vw, 56px)',
          fontWeight: '800', color: 'white',
          letterSpacing: '-2px', lineHeight: '1.1',
          marginBottom: '16px', position: 'relative', zIndex: 2,
        }}>
          À propos de <span style={{ color: '#3b9eff' }}>nous</span>
        </h1>
        <p style={{
          fontSize: '16px', color: 'rgba(255,255,255,0.7)',
          maxWidth: '480px', lineHeight: '1.75', position: 'relative', zIndex: 2,
        }}>
          Découvrez qui nous sommes, notre mission et la technologie qui propulse AuditWise vers l'excellence.
        </p>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, auto)',
          gap: '16px', marginTop: '52px', width: 'fit-content',
          position: 'relative', zIndex: 2,
        }}>
          {STATS.map(s => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '14px', padding: '16px 24px', textAlign: 'center', minWidth: '130px',
            }}>
              <div style={{
                fontFamily: 'Sora, sans-serif', fontSize: '26px', fontWeight: '800',
                color: 'white', letterSpacing: '-1px', lineHeight: '1',
              }}>{s.num}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', marginTop: '5px', fontWeight: '500' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vague */}
      <div style={{ marginTop: '-2px', lineHeight: 0, background: '#f0f6ff' }}>
        <svg viewBox="0 0 1440 70" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block' }}>
          <path d="M0 0 C480 70 960 70 1440 0 L1440 70 L0 70 Z" fill="#f0f6ff"/>
        </svg>
      </div>

      {/* ══ CARTES ══ */}
      <div style={{ padding: '0 60px 60px', maxWidth: '1300px', margin: '0 auto' }}>

        {/* Titre section */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{
            fontFamily: 'Sora, sans-serif', fontSize: '32px', fontWeight: '800',
            color: '#0b1f45', letterSpacing: '-1px', marginBottom: '10px',
          }}>
            Ce qui nous <span style={{ color: '#1b6fd8' }}>définit</span>
          </h2>
          <p style={{ fontSize: '15px', color: '#6b8cba', maxWidth: '480px', margin: '0 auto', lineHeight: '1.7' }}>
            Notre vision, notre équipe et la technologie au service de votre conformité.
          </p>
        </div>

        {/* 3 cartes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '24px' }}>
          {CARDS_TOP.map(card => <Card key={card.title} card={card} />)}
        </div>

        {/* 2 cartes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {CARDS_BOTTOM.map(card => <Card key={card.title} card={card} />)}
        </div>
      </div>

      {/* ══ BANNIÈRE CTA ══ */}
      <div style={{
        margin: '0 60px 80px',
        background: 'linear-gradient(135deg, #0b1f45 0%, #1b6fd8 100%)',
        borderRadius: '24px', padding: '56px 64px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '40px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: '-80px', top: '-80px',
          width: '350px', height: '350px', borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(59,158,255,0.2) 0%, transparent 70%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontFamily: 'Sora, sans-serif', fontSize: '26px', fontWeight: '800',
            color: 'white', letterSpacing: '-0.8px', marginBottom: '10px',
          }}>
            Prêt à sécuriser votre entreprise ?
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
            Rejoignez des centaines d'entreprises qui font confiance à IFSentry pour leur conformité ISO 27001.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '14px', flexShrink: 0, position: 'relative', zIndex: 1 }}>
          <button onClick={onSignUp} style={{
            padding: '13px 28px', background: 'white', color: '#1b6fd8',
            border: 'none', borderRadius: '10px', fontFamily: 'Sora, sans-serif',
            fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Commencer gratuitement →
          </button>
          <button style={{
            padding: '13px 28px', background: 'transparent', color: 'white',
            border: '1.5px solid rgba(255,255,255,0.35)', borderRadius: '10px',
            fontFamily: 'Sora, sans-serif', fontSize: '14px', fontWeight: '600',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.background = 'transparent' }}
          >
            Nous contacter
          </button>
        </div>
      </div>

    </div>
  )
}
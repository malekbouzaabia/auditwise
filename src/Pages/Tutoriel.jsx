import { useState } from 'react'

const STEPS = [
  {
    num: '01',
    icon: '📝',
    title: "Créer un compte",
    color: '#1b6fd8',
    bg: '#eff6ff',
    desc: "Inscrivez-vous avec votre email @drax.com ou @gmail.com. Un lien de vérification vous sera envoyé par email pour activer votre compte.",
    tips: [
      "Utilisez votre email professionnel @drax.com",
      "Vérifiez vos spams si vous ne recevez pas l'email",
      "Le lien expire après 24 heures",
    ],
    img: '🔐'
  },
  {
    num: '02',
    icon: '🔑',
    title: "Se connecter avec MFA",
    color: '#8b5cf6',
    bg: '#f5f3ff',
    desc: "Connectez-vous avec votre email et mot de passe. Un code MFA à 6 chiffres sera envoyé sur votre email. Entrez ce code pour accéder à l'application.",
    tips: [
      "Le code MFA expire après 10 minutes",
      "Vérifiez votre boite mail après connexion",
      "Ne partagez jamais votre code MFA",
    ],
    img: '📱'
  },
  {
    num: '03',
    icon: '🎯',
    title: "Attendre la campagne",
    color: '#f59e0b',
    bg: '#fffbeb',
    desc: "L'administrateur ouvre des campagnes d'audit sur des périodes définies. Vous recevrez une notification quand une campagne est ouverte. Vous ne pouvez faire qu'un seul audit par campagne.",
    tips: [
      "Une campagne = une période d'audit",
      "1 seul audit par compte par campagne",
      "Le compte à rebours s'affiche avant l'ouverture",
    ],
    img: '📅'
  },
  {
    num: '04',
    icon: '📋',
    title: "Répondre aux questions",
    color: '#22c55e',
    bg: '#f0fff4',
    desc: "Répondez à 106 questions réparties sur 13 domaines ISO 27001:2022. Pour chaque question, répondez par Vrai, Faux ou Partiel selon la situation de votre organisation.",
    tips: [
      "Répondez honnêtement — l'audit est confidentiel",
      "Tapez 'je ne comprends pas' pour obtenir une explication",
      "Votre progression est sauvegardée automatiquement",
    ],
    img: '✅'
  },
  {
    num: '05',
    icon: '💡',
    title: "Utiliser l'assistant",
    color: '#f97316',
    bg: '#fff7ed',
    desc: "Si vous ne comprenez pas une question, tapez 'je ne comprends pas'. Un assistant IA s'ouvrira pour expliquer les termes techniques avec des exemples concrets.",
    tips: [
      "L'assistant explique uniquement les termes de la question",
      "Tapez 'compris' pour revenir à l'audit",
      "Disponible en français et en arabe",
    ],
    img: '🤖'
  },
  {
    num: '06',
    icon: '📄',
    title: "Télécharger le rapport",
    color: '#06b6d4',
    bg: '#ecfeff',
    desc: "Une fois toutes les questions répondues, téléchargez votre rapport PDF. Il contient votre score global, les scores par domaine et des recommandations personnalisées basées sur la norme ISO 27001:2022.",
    tips: [
      "Le rapport est envoyé automatiquement par email",
      "Il contient des recommandations RAG personnalisées",
      "Gardez une copie pour votre dossier de conformité",
    ],
    img: '📊'
  },
]

export default function Tutoriel({ onBack, onSignUp }) {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <div style={{ minHeight: '100vh', background: '#f0f6ff', fontFamily: '"DM Sans", sans-serif' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0b1f45, #1040a0)', padding: '60px 40px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(59,158,255,0.06)' }} />
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: 'white', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginBottom: '32px', fontFamily: '"DM Sans", sans-serif' }}>
            ← Retour
          </button>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(27,111,216,0.3)', border: '1px solid rgba(59,158,255,0.4)', borderRadius: '100px', padding: '6px 16px', marginBottom: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#7ab3f0', letterSpacing: '0.5px' }}>🎓 GUIDE D'UTILISATION</span>
          </div>
          <h1 style={{ fontFamily: '"Sora", sans-serif', fontSize: '44px', fontWeight: '800', color: 'white', lineHeight: '1.1', marginBottom: '16px' }}>
            Comment utiliser<br />
            <span style={{ background: 'linear-gradient(90deg, #3b9eff, #7ab3f0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AuditWise AI</span>
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7', maxWidth: '500px' }}>
            Suivez ce guide étape par étape pour réaliser votre audit ISO 27001:2022 en toute simplicité.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 40px' }}>

        {/* Navigation étapes */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {STEPS.map((s, i) => (
            <button key={i} onClick={() => setActiveStep(i)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '100px', border: `1.5px solid ${activeStep === i ? s.color : 'rgba(27,111,216,0.15)'}`, background: activeStep === i ? s.color : 'white', color: activeStep === i ? 'white' : '#6b8cba', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', fontFamily: '"DM Sans", sans-serif' }}>
              <span>{s.icon}</span>
              {s.num}. {s.title}
            </button>
          ))}
        </div>

        {/* Étape active */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '40px', border: `1px solid ${STEPS[activeStep].color}30`, boxShadow: '0 8px 32px rgba(11,31,69,0.08)', marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
            <div style={{ flexShrink: 0 }}>
              <div style={{ width: '80px', height: '80px', background: STEPS[activeStep].bg, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', border: `2px solid ${STEPS[activeStep].color}30` }}>
                {STEPS[activeStep].img}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ padding: '4px 10px', background: STEPS[activeStep].color + '15', borderRadius: '100px', fontSize: '11px', fontWeight: '800', color: STEPS[activeStep].color, letterSpacing: '0.5px' }}>
                  ÉTAPE {STEPS[activeStep].num}
                </span>
                <h2 style={{ fontFamily: '"Sora", sans-serif', fontSize: '22px', fontWeight: '800', color: '#0b1f45', margin: 0 }}>
                  {STEPS[activeStep].title}
                </h2>
              </div>
              <p style={{ fontSize: '15px', color: '#6b8cba', lineHeight: '1.8', marginBottom: '24px' }}>
                {STEPS[activeStep].desc}
              </p>
              <div style={{ background: STEPS[activeStep].bg, borderRadius: '14px', padding: '16px 20px', border: `1px solid ${STEPS[activeStep].color}20` }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: STEPS[activeStep].color, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  💡 Conseils
                </div>
                {STEPS[activeStep].tips.map((tip, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ color: STEPS[activeStep].color, flexShrink: 0, marginTop: '2px' }}>→</span>
                    <span style={{ fontSize: '13px', color: '#0b1f45', lineHeight: '1.5' }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(27,111,216,0.08)' }}>
            <button onClick={() => setActiveStep(Math.max(0, activeStep - 1))} disabled={activeStep === 0}
              style={{ padding: '10px 20px', background: activeStep === 0 ? '#f0f6ff' : 'white', border: '1.5px solid rgba(27,111,216,0.2)', borderRadius: '10px', color: activeStep === 0 ? '#94a3b8' : '#0b1f45', fontSize: '13px', fontWeight: '700', cursor: activeStep === 0 ? 'not-allowed' : 'pointer', fontFamily: '"DM Sans", sans-serif' }}>
              ← Précédent
            </button>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {STEPS.map((_, i) => (
                <div key={i} onClick={() => setActiveStep(i)} style={{ width: i === activeStep ? '20px' : '6px', height: '6px', borderRadius: '100px', background: i === activeStep ? STEPS[activeStep].color : '#dce8f8', transition: 'all 0.3s', cursor: 'pointer' }} />
              ))}
            </div>
            <button onClick={() => setActiveStep(Math.min(STEPS.length - 1, activeStep + 1))} disabled={activeStep === STEPS.length - 1}
              style={{ padding: '10px 20px', background: activeStep === STEPS.length - 1 ? '#f0f6ff' : STEPS[activeStep].color, border: 'none', borderRadius: '10px', color: activeStep === STEPS.length - 1 ? '#94a3b8' : 'white', fontSize: '13px', fontWeight: '700', cursor: activeStep === STEPS.length - 1 ? 'not-allowed' : 'pointer', fontFamily: '"DM Sans", sans-serif' }}>
              Suivant →
            </button>
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: 'linear-gradient(135deg, #1b6fd8, #1551a8)', borderRadius: '24px', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '14px' }}>🚀</div>
          <h2 style={{ fontFamily: '"Sora", sans-serif', fontSize: '24px', fontWeight: '800', color: 'white', marginBottom: '10px' }}>
            Prêt à commencer votre audit ?
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>
            Créez votre compte et participez à la prochaine campagne d'audit.
          </p>
          <button onClick={onSignUp}
            style={{ padding: '13px 32px', background: 'white', color: '#1b6fd8', border: 'none', borderRadius: '12px', fontFamily: '"Sora", sans-serif', fontSize: '14px', fontWeight: '800', cursor: 'pointer' }}>
            Créer mon compte →
          </button>
        </div>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
    </div>
  )
}
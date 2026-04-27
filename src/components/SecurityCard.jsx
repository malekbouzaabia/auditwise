import { useState, useEffect } from 'react'

const DOMAINS_ISO = [
  { label: 'Gouvernance',        clause: '5.2',  icon: '🏛️' },
  { label: 'Ressources Humaines', clause: '6.3',  icon: '👥' },
  { label: 'Gestion des Actifs',  clause: '5.9',  icon: '📦' },
  { label: 'Controle Acces',      clause: '5.15', icon: '🔐' },
  { label: 'Cryptographie',       clause: '8.24', icon: '🔒' },
  { label: 'Securite Physique',   clause: '7.1',  icon: '🏢' },
  { label: 'Securite Operationnelle', clause: '8.8', icon: '⚙️' },
  { label: 'Reseau',              clause: '8.20', icon: '🌐' },
  { label: 'Developpement',       clause: '8.25', icon: '💻' },
  { label: 'Fournisseurs',        clause: '5.19', icon: '🤝' },
  { label: 'Gestion Incidents',   clause: '5.24', icon: '🚨' },
  { label: 'Continuite',          clause: '5.30', icon: '♻️' },
  { label: 'Conformite',          clause: '5.36', icon: '✅' },
]

const STEPS = [
  { icon: '📝', label: 'Repondez aux questions', desc: '106 questions sur 13 domaines ISO 27001' },
  { icon: '🤖', label: 'IA analyse vos reponses', desc: 'Groq LLaMA 3.3 evalue votre conformite' },
  { icon: '📄', label: 'Recevez votre rapport',   desc: 'PDF detaille avec recommandations RAG' },
]

export default function SecurityCard() {
  const [activeStep, setActiveStep] = useState(0)
  const [activeDomain, setActiveDomain] = useState(null)

  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => (s + 1) % 3), 2500)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* 13 Domaines ISO 27001 */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '28px', border: '1px solid rgba(27,111,216,0.1)', boxShadow: '0 8px 32px rgba(11,31,69,0.08)' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontFamily: '"Sora", sans-serif', fontSize: '15px', fontWeight: '800', color: '#0b1f45' }}>
              13 Domaines ISO 27001:2022
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
              Survolez un domaine pour en savoir plus
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {DOMAINS_ISO.map((d, i) => (
              <div key={i}
                onMouseEnter={() => setActiveDomain(i)}
                onMouseLeave={() => setActiveDomain(null)}
                style={{
                  background: activeDomain === i ? 'linear-gradient(135deg, #1b6fd8, #3b9eff)' : '#f8faff',
                  borderRadius: '12px', padding: '10px 8px', textAlign: 'center',
                  border: `1px solid ${activeDomain === i ? '#1b6fd8' : 'rgba(27,111,216,0.08)'}`,
                  cursor: 'pointer', transition: 'all 0.2s',
                  transform: activeDomain === i ? 'scale(1.05)' : 'scale(1)'
                }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{d.icon}</div>
                <div style={{ fontSize: '9px', fontWeight: '700', color: activeDomain === i ? 'white' : '#0b1f45', lineHeight: '1.3' }}>{d.label}</div>
                <div style={{ fontSize: '8px', color: activeDomain === i ? 'rgba(255,255,255,0.7)' : '#94a3b8', marginTop: '2px' }}>Cl. {d.clause}</div>
              </div>
            ))}
          </div>

          {/* Info domaine survolé */}
          <div style={{ background: activeDomain !== null ? '#eff6ff' : '#f8faff', borderRadius: '12px', padding: '12px 16px', border: '1px solid rgba(27,111,216,0.1)', minHeight: '48px', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {activeDomain !== null ? (
              <>
                <span style={{ fontSize: '22px' }}>{DOMAINS_ISO[activeDomain].icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0b1f45' }}>{DOMAINS_ISO[activeDomain].label}</div>
                  <div style={{ fontSize: '11px', color: '#1b6fd8', fontWeight: '600' }}>Clause {DOMAINS_ISO[activeDomain].clause} — ISO 27001:2022</div>
                </div>
              </>
            ) : (
              <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                Survolez un domaine pour voir les details...
              </div>
            )}
          </div>
        </div>

        {/* Comment ca marche */}
        <div style={{ background: 'linear-gradient(135deg, #0b1f45, #1040a0)', borderRadius: '24px', padding: '28px', border: '1px solid rgba(59,158,255,0.15)', boxShadow: '0 8px 32px rgba(11,31,69,0.2)' }}>
          <div style={{ fontFamily: '"Sora", sans-serif', fontSize: '15px', fontWeight: '800', color: 'white', marginBottom: '4px' }}>
            Comment ca marche ?
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>3 etapes simples</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {STEPS.map((s, i) => (
              <div key={i} onClick={() => setActiveStep(i)}
                style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '14px', borderRadius: '14px', background: activeStep === i ? 'rgba(59,158,255,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${activeStep === i ? 'rgba(59,158,255,0.35)' : 'rgba(255,255,255,0.06)'}`, cursor: 'pointer', transition: 'all 0.3s' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: activeStep === i ? '#1b6fd8' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, transition: 'all 0.3s' }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: activeStep === i ? 'white' : 'rgba(255,255,255,0.6)', marginBottom: '3px' }}>{s.label}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.5' }}>{s.desc}</div>
                </div>
                <div style={{ marginLeft: 'auto', width: '20px', height: '20px', borderRadius: '50%', background: activeStep === i ? '#22c55e' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0, color: 'white' }}>
                  {activeStep === i ? '✓' : (i + 1)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(34,197,94,0.1)', borderRadius: '12px', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>✅</span>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#4ade80' }}>Certifie ISO 27001:2022</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Atteignez la conformite avec AuditWise AI</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
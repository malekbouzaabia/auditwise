import { useState, useEffect } from 'react'

const DOMAINS = [
  { label: 'Gouvernance',       pct: 87, color: '#22c55e' },
  { label: 'Controle acces',    pct: 72, color: '#1b6fd8' },
  { label: 'Cryptographie',     pct: 65, color: '#f59e0b' },
  { label: 'Securite physique', pct: 91, color: '#22c55e' },
  { label: 'Gestion incidents', pct: 54, color: '#ef4444' },
]

const STEPS = [
  { icon: '📝', label: 'Repondez aux questions', desc: '106 questions sur 13 domaines ISO 27001' },
  { icon: '🤖', label: 'IA analyse vos reponses', desc: 'Groq LLaMA 3.3 evalue votre conformite' },
  { icon: '📄', label: 'Recevez votre rapport',   desc: 'PDF detaille avec recommandations RAG' },
]

const STATS = [
  { icon: '📋', label: 'Questions',  value: '106',  color: '#1b6fd8' },
  { icon: '🏛️', label: 'Domaines',   value: '13',   color: '#8b5cf6' },
  { icon: '🤖', label: 'IA Powered', value: 'Groq', color: '#22c55e' },
  { icon: '📄', label: 'Rapport PDF', value: 'Auto', color: '#f59e0b' },
]

export default function SecurityCard() {
  const [activeStep, setActiveStep] = useState(0)
  const [animPct, setAnimPct] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => (s + 1) % 3), 2500)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    let v = 0
    const t = setInterval(() => {
      v += 2
      setAnimPct(Math.min(v, 78))
      if (v >= 78) clearInterval(t)
    }, 20)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Scores par domaine */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '28px', border: '1px solid rgba(27,111,216,0.1)', boxShadow: '0 8px 32px rgba(11,31,69,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <div style={{ fontFamily: '"Sora", sans-serif', fontSize: '15px', fontWeight: '800', color: '#0b1f45' }}>Score de conformite</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Simulation ISO 27001:2022</div>
            </div>
            <div style={{ width: '56px', height: '56px', position: 'relative' }}>
              <svg viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="28" cy="28" r="22" fill="none" stroke="#f0f6ff" strokeWidth="6" />
                <circle cx="28" cy="28" r="22" fill="none" stroke="#1b6fd8" strokeWidth="6"
                  strokeDasharray={`${animPct * 1.38} 138`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.3s' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Sora", sans-serif', fontSize: '13px', fontWeight: '800', color: '#1b6fd8' }}>
                {animPct}%
              </div>
            </div>
          </div>

          {DOMAINS.map((d, i) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '12px', color: '#0b1f45', fontWeight: '600' }}>{d.label}</span>
                <span style={{ fontSize: '12px', fontWeight: '800', color: d.color }}>{d.pct}%</span>
              </div>
              <div style={{ height: '6px', background: '#f0f6ff', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: d.pct + '%', background: d.color, borderRadius: '100px', transition: 'width 1s ease' }} />
              </div>
            </div>
          ))}
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
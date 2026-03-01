const FEATURES = [
  { icon: '⚡', title: 'Gagnez du temps',         desc: "Les évaluations automatisées réduisent l'effort manuel jusqu'à 80%." },
  { icon: '📊', title: 'Meilleure prise de décision', desc: 'Les tableaux de bord en temps réel mettent en évidence les risques prioritaires.' },
  { icon: '✅', title: 'Conformité garantie',      desc: "Restez prêt pour l'audit 24h/24 grâce au suivi continu ISO 27001." },
]

const CHIPS = [
  { bg: '#22c55e', label: 'Statut de conformité', value: '99.2%' },
  { bg: '#3b9eff', label: 'Menaces bloquées',      value: '1 284' },
  { bg: '#f59e0b', label: "Score d'audit",          value: 'A+'   },
]

export default function SecurityCard() {
  return (
    <div
      className="security-card"
    >
      {/* ══ GAUCHE — texte ══ */}
      <div className="card-left">
        <div className="card-tag">🔒 Gestion de la sécurité</div>

        <h2 className="card-title">
          Libérez la puissance de <em>l'IA</em> pour<br />
          une gestion de la sécurité sans effort
        </h2>

        <p className="card-desc">
          Les évaluations automatisées des risques et la surveillance continue
          de la conformité vous aident à anticiper les menaces. Passez moins de
          temps sur les vérifications routinières et concentrez-vous sur
          l'essentiel.
        </p>

        <ul className="feat-list">
          {FEATURES.map(f => (
            <li key={f.title} className="feat-row">
              <div className="feat-icon">{f.icon}</div>
              <div className="feat-text">
                <strong>{f.title}</strong>
                <span>{f.desc}</span>
              </div>
            </li>
          ))}
        </ul>

        <div className="card-cta">
          <button className="card-btn-main">Démarrer l'essai gratuit</button>
          <button className="card-btn-sec">Voir la démo</button>
        </div>
      </div>

      {/* ══ DROITE — image animée ══ */}
      <div className="card-right">
        <div className="card-right-grid" />

        <div className="orb-container">
          <div className="orb-ring animate-ring1" style={{ width: '100%',  height: '100%'  }} />
          <div className="orb-ring animate-ring2" style={{ width: '135%', height: '135%' }} />
          <div className="orb-ring animate-ring3" style={{ width: '165%', height: '165%' }} />
          <div className="orb-core animate-orb">
            <span className="glow-lock" style={{ fontSize: '44px' }}>🔐</span>
          </div>
          <div className="scan-bar animate-scan" />
        </div>

        <div className="chips">
          {CHIPS.map(c => (
            <div key={c.label} className="chip">
              <div className="chip-dot" style={{ background: c.bg, boxShadow: `0 0 8px ${c.bg}99` }} />
              <span className="chip-text">{c.label}</span>
              <span className="chip-val">{c.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
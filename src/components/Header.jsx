import { THEME_DEFINITIONS } from '../themes'

const THEME_KEYS = ['cyber', 'orbital', 'arcane', 'terminal']

export default function Header({ theme, setTheme, totalXP, levelInfo, xpTable }) {
  const nextLevel = xpTable[levelInfo.level] // undefined if max level
  const xpInLevel = totalXP - levelInfo.minXP
  const xpNeeded = nextLevel ? nextLevel.minXP - levelInfo.minXP : 1
  const pct = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100))

  return (
    <header className="header">
      <div className="header-logo">
        CSM<span>HUD</span>
      </div>

      <div className="header-level">
        <div className="header-level-label">
          <span>LVL {levelInfo.level}</span>
          <span className="header-level-name">{levelInfo.title.toUpperCase()}</span>
          <span>{nextLevel ? `${xpInLevel} / ${xpNeeded} XP` : 'MAX LEVEL'}</span>
        </div>
        <div className="xp-bar-track">
          <div
            className="xp-bar-fill"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="header-xp-total">
        TOTAL XP: <span>{totalXP.toLocaleString()}</span>
      </div>

      <div className="header-spacer" />

      <div className="theme-switcher">
        {THEME_KEYS.map(key => (
          <button
            key={key}
            className={`theme-btn ${theme === key ? 'active' : ''}`}
            onClick={() => setTheme(key)}
            title={`Switch to ${THEME_DEFINITIONS[key].name} theme`}
          >
            {THEME_DEFINITIONS[key].name}
          </button>
        ))}
      </div>
    </header>
  )
}

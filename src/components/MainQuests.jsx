import { useState } from 'react'

function getProgressColor(pct) {
  if (pct >= 100) return 'complete'
  if (pct >= 66)  return 'success'
  if (pct >= 33)  return 'warning'
  return 'primary'
}

function KPICard({ kpiKey, kpi, onUpdate, onSettingsChange }) {
  const [editing, setEditing] = useState(false)
  const [tempTarget, setTempTarget] = useState(kpi.target)
  const [tempBobSize, setTempBobSize] = useState(kpi.bobSize)

  const isAdvocates = kpiKey === 'advocates'
  const displayCurrent = isAdvocates
    ? `${kpi.bobSize > 0 ? Math.round((kpi.current / kpi.bobSize) * 100) : 0}%`
    : kpi.current
  const pct = isAdvocates
    ? (kpi.bobSize > 0 ? Math.min(100, Math.round((kpi.current / kpi.bobSize) * 100 / kpi.target * 100)) : 0)
    : Math.min(100, Math.round((kpi.current / kpi.target) * 100))

  const color = getProgressColor(pct)
  const isComplete = pct >= 100

  function saveSettings() {
    const updates = { target: Number(tempTarget) }
    if (isAdvocates) updates.bobSize = Number(tempBobSize)
    onSettingsChange(kpiKey, updates)
    setEditing(false)
  }

  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <div className="kpi-title-row">
          <span className="kpi-icon">{kpi.icon}</span>
          <span className="kpi-name">{kpi.label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="kpi-counter">
            {displayCurrent}
            <span className="kpi-counter-target">
              {' / '}
              {isAdvocates ? `${kpi.target}%` : kpi.target}
            </span>
          </span>
          {isComplete && (
            <span className="kpi-complete-badge">COMPLETE</span>
          )}
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-track">
          <div
            className={`progress-fill progress-fill--${color}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="kpi-controls">
        <button
          className="btn btn--sm btn--danger btn--icon"
          onClick={() => onUpdate(kpiKey, -1)}
          disabled={kpi.current <= 0}
          title="Remove one"
        >
          −
        </button>
        <button
          className="btn btn--sm btn--success btn--icon"
          onClick={() => onUpdate(kpiKey, 1)}
          title={`Log +1 (+${kpi.xpPerUnit} XP)`}
        >
          +
        </button>
        <span className="kpi-xp-tag">+<span>{kpi.xpPerUnit}</span> XP each</span>
        <button
          className="btn btn--sm"
          onClick={() => setEditing(e => !e)}
          title="Edit target"
        >
          {editing ? 'CANCEL' : 'EDIT'}
        </button>
      </div>

      {editing && (
        <div className="kpi-settings-row">
          <label>TARGET</label>
          <input
            type="number"
            value={tempTarget}
            min={1}
            onChange={e => setTempTarget(e.target.value)}
            style={{ width: 70 }}
          />
          {isAdvocates && (
            <>
              <label>BOB SIZE</label>
              <input
                type="number"
                value={tempBobSize}
                min={1}
                onChange={e => setTempBobSize(e.target.value)}
                style={{ width: 70 }}
              />
            </>
          )}
          <button className="btn btn--sm btn--primary" onClick={saveSettings}>
            SAVE
          </button>
        </div>
      )}
    </div>
  )
}

export default function MainQuests({ kpis, updateKPI, updateKPISettings }) {
  const now = new Date()
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const today = weekDays[now.getDay()]
  const weekProgress = Math.round((now.getDay() / 6) * 100)

  return (
    <div className="panel">
      <div className="panel-title">
        ⚔ Active Quest Lines
      </div>

      <div className="week-label">
        WEEK PROGRESS — {today} — {weekProgress}%
      </div>

      {Object.entries(kpis).map(([key, kpi]) => (
        <KPICard
          key={key}
          kpiKey={key}
          kpi={kpi}
          onUpdate={updateKPI}
          onSettingsChange={updateKPISettings}
        />
      ))}
    </div>
  )
}

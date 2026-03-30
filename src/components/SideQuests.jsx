import { useState } from 'react'

const XP_MAP = { high: 100, medium: 50, low: 25 }

function AddQuestForm({ onAdd, onCancel }) {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [priority, setPriority] = useState('medium')

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ title: title.trim(), description: desc.trim(), priority })
    setTitle('')
    setDesc('')
    setPriority('medium')
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <div className="add-form-title">New Side Quest</div>
      <div className="form-row">
        <input
          type="text"
          placeholder="Quest title..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />
      </div>
      <div className="form-row">
        <textarea
          placeholder="Description (optional)..."
          value={desc}
          onChange={e => setDesc(e.target.value)}
          rows={2}
          style={{ minHeight: 48 }}
        />
      </div>
      <div className="form-row">
        <label>Priority</label>
        <select value={priority} onChange={e => setPriority(e.target.value)} style={{ flex: 1 }}>
          <option value="high">HIGH — 100 XP</option>
          <option value="medium">MEDIUM — 50 XP</option>
          <option value="low">LOW — 25 XP</option>
        </select>
      </div>
      <div className="form-row" style={{ justifyContent: 'flex-end', marginTop: 4 }}>
        <button type="button" className="btn btn--sm" onClick={onCancel}>CANCEL</button>
        <button type="submit" className="btn btn--sm btn--primary">ADD QUEST</button>
      </div>
    </form>
  )
}

function QuestCard({ quest, onComplete, onDelete }) {
  const priorityLabels = { high: 'HIGH', medium: 'MED', low: 'LOW' }
  const xp = XP_MAP[quest.priority] || 50

  return (
    <div className={`quest-card ${quest.completed ? 'completed' : ''}`}>
      <div className="quest-header">
        <span className={`quest-priority quest-priority--${quest.priority}`}>
          {priorityLabels[quest.priority]}
        </span>
        <span className="quest-title">{quest.title}</span>
      </div>
      {quest.description && (
        <p className="quest-desc">{quest.description}</p>
      )}
      <div className="quest-footer">
        {quest.completed ? (
          <>
            <span className="quest-xp">+{xp} XP EARNED</span>
            <span className="quest-completed-stamp">COMPLETE</span>
            <button className="btn btn--sm btn--danger" onClick={() => onDelete(quest.id)}>
              CLEAR
            </button>
          </>
        ) : (
          <>
            <span className="quest-xp">+{xp} XP on complete</span>
            <button className="btn btn--sm btn--success" onClick={() => onComplete(quest.id)}>
              COMPLETE
            </button>
            <button className="btn btn--sm btn--danger" onClick={() => onDelete(quest.id)}>
              DROP
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function SideQuests({ quests, addQuest, completeQuest, deleteQuest }) {
  const [showForm, setShowForm] = useState(false)

  const active    = quests.filter(q => !q.completed)
  const completed = quests.filter(q => q.completed)

  function handleAdd(quest) {
    addQuest(quest)
    setShowForm(false)
  }

  return (
    <div className="panel">
      <div className="panel-title">
        ◈ Side Quests
        {active.length > 0 && (
          <span className="count-badge">{active.length}</span>
        )}
      </div>

      {!showForm && (
        <button
          className="btn btn--primary btn--wide"
          onClick={() => setShowForm(true)}
          style={{ marginBottom: 14 }}
        >
          + New Quest
        </button>
      )}

      {showForm && (
        <AddQuestForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />
      )}

      <div className="quest-list">
        {active.length === 0 && completed.length === 0 && (
          <div className="empty-state">
            <span className="empty-state-icon">🗺</span>
            No side quests yet.<br />
            Add tasks that fall outside your main KPIs.
          </div>
        )}

        {active.map(q => (
          <QuestCard
            key={q.id}
            quest={q}
            onComplete={completeQuest}
            onDelete={deleteQuest}
          />
        ))}

        {completed.length > 0 && (
          <>
            <div className="divider" />
            <div style={{ fontSize: 9, letterSpacing: 2, color: 'var(--color-text-dim)', marginBottom: 8, fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
              Completed ({completed.length})
            </div>
            {completed.map(q => (
              <QuestCard
                key={q.id}
                quest={q}
                onComplete={completeQuest}
                onDelete={deleteQuest}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import Header from './components/Header'
import MainQuests from './components/MainQuests'
import SideQuests from './components/SideQuests'
import BookOfBusiness from './components/BookOfBusiness'
import { applyTheme } from './themes'
import './App.css'

export const XP_TABLE = [
  { level: 1, title: 'Recruit',    minXP: 0,     maxXP: 500   },
  { level: 2, title: 'Associate',  minXP: 500,   maxXP: 1200  },
  { level: 3, title: 'Specialist', minXP: 1200,  maxXP: 2500  },
  { level: 4, title: 'Expert',     minXP: 2500,  maxXP: 5000  },
  { level: 5, title: 'Veteran',    minXP: 5000,  maxXP: 9000  },
  { level: 6, title: 'Master',     minXP: 9000,  maxXP: 15000 },
  { level: 7, title: 'Legend',     minXP: 15000, maxXP: Infinity },
]

function getWeekStart() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - d.getDay())
  return d.toISOString()
}

const DEFAULT_STATE = {
  theme: 'cyber',
  totalXP: 0,
  kpis: {
    calls:     { current: 0, target: 20, label: 'Weekly Calls',     icon: '📞', xpPerUnit: 50,  resetWeekly: true  },
    advocates: { current: 0, target: 15, label: 'BOB Advocates',    icon: '⭐', xpPerUnit: 150, resetWeekly: false, bobSize: 20 },
    csqls:     { current: 0, target: 3,  label: 'CSQLs Generated',  icon: '🎯', xpPerUnit: 200, resetWeekly: true  },
  },
  sideQuests: [],
  clients: [],
  weekStart: getWeekStart(),
}

export function getLevelInfo(xp) {
  for (let i = XP_TABLE.length - 1; i >= 0; i--) {
    if (xp >= XP_TABLE[i].minXP) return XP_TABLE[i]
  }
  return XP_TABLE[0]
}

function loadState() {
  try {
    const saved = localStorage.getItem('csm-hud-v1')
    if (!saved) return DEFAULT_STATE
    const parsed = JSON.parse(saved)
    // Weekly reset check
    if (parsed.weekStart !== getWeekStart()) {
      const kpis = { ...parsed.kpis }
      Object.keys(kpis).forEach(k => {
        if (kpis[k].resetWeekly) kpis[k] = { ...kpis[k], current: 0 }
      })
      return { ...parsed, kpis, weekStart: getWeekStart() }
    }
    return parsed
  } catch {
    return DEFAULT_STATE
  }
}

export default function App() {
  const [state, setState] = useState(loadState)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    localStorage.setItem('csm-hud-v1', JSON.stringify(state))
    applyTheme(state.theme)
  }, [state])

  function pushNotification(msg, type = 'xp') {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, msg, type }])
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3200)
  }

  function addXP(amount, label) {
    setState(prev => {
      const oldLevel = getLevelInfo(prev.totalXP)
      const newXP = prev.totalXP + amount
      const newLevel = getLevelInfo(newXP)
      if (newLevel.level > oldLevel.level) {
        setTimeout(() => pushNotification(`LEVEL UP! You are now ${newLevel.title}!`, 'levelup'), 100)
      }
      return { ...prev, totalXP: newXP }
    })
    pushNotification(`+${amount} XP  ${label}`, 'xp')
  }

  function updateKPI(key, delta) {
    setState(prev => {
      const kpi = prev.kpis[key]
      const newVal = Math.max(0, kpi.current + delta)
      return { ...prev, kpis: { ...prev.kpis, [key]: { ...kpi, current: newVal } } }
    })
    if (delta > 0) {
      const kpi = state.kpis[key]
      addXP(kpi.xpPerUnit * delta, kpi.label)
    }
  }

  function updateKPISettings(key, updates) {
    setState(prev => ({
      ...prev,
      kpis: { ...prev.kpis, [key]: { ...prev.kpis[key], ...updates } }
    }))
  }

  function addSideQuest(quest) {
    setState(prev => ({
      ...prev,
      sideQuests: [
        { ...quest, id: Date.now(), completed: false, createdAt: new Date().toISOString() },
        ...prev.sideQuests,
      ]
    }))
  }

  function completeSideQuest(id) {
    const quest = state.sideQuests.find(q => q.id === id)
    if (!quest || quest.completed) return
    const xpMap = { low: 25, medium: 50, high: 100 }
    setState(prev => ({
      ...prev,
      sideQuests: prev.sideQuests.map(q =>
        q.id === id ? { ...q, completed: true, completedAt: new Date().toISOString() } : q
      )
    }))
    addXP(xpMap[quest.priority] || 50, `Side Quest: ${quest.title}`)
  }

  function deleteSideQuest(id) {
    setState(prev => ({ ...prev, sideQuests: prev.sideQuests.filter(q => q.id !== id) }))
  }

  function addClient(client) {
    setState(prev => ({
      ...prev,
      clients: [
        { ...client, id: Date.now(), lastContact: new Date().toISOString() },
        ...prev.clients,
      ]
    }))
  }

  function logClientContact(id) {
    setState(prev => ({
      ...prev,
      clients: prev.clients.map(c =>
        c.id === id ? { ...c, lastContact: new Date().toISOString() } : c
      )
    }))
    addXP(10, 'Client contact logged')
  }

  function toggleClientAdvocate(id) {
    setState(prev => ({
      ...prev,
      clients: prev.clients.map(c =>
        c.id === id ? { ...c, isAdvocate: !c.isAdvocate } : c
      )
    }))
  }

  function deleteClient(id) {
    setState(prev => ({ ...prev, clients: prev.clients.filter(c => c.id !== id) }))
  }

  function setTheme(theme) {
    setState(prev => ({ ...prev, theme }))
  }

  const levelInfo = getLevelInfo(state.totalXP)

  return (
    <div className="app" data-theme={state.theme}>
      <div className="scanline-overlay" />

      <div className="notifications">
        {notifications.map(n => (
          <div key={n.id} className={`notification notification--${n.type}`}>
            {n.msg}
          </div>
        ))}
      </div>

      <Header
        theme={state.theme}
        setTheme={setTheme}
        totalXP={state.totalXP}
        levelInfo={levelInfo}
        xpTable={XP_TABLE}
      />

      <main className="hud-grid">
        <MainQuests
          kpis={state.kpis}
          updateKPI={updateKPI}
          updateKPISettings={updateKPISettings}
        />
        <SideQuests
          quests={state.sideQuests}
          addQuest={addSideQuest}
          completeQuest={completeSideQuest}
          deleteQuest={deleteSideQuest}
        />
        <BookOfBusiness
          clients={state.clients}
          kpiAdvocates={state.kpis.advocates}
          addClient={addClient}
          logContact={logClientContact}
          toggleAdvocate={toggleClientAdvocate}
          deleteClient={deleteClient}
        />
      </main>
    </div>
  )
}

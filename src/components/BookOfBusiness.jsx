import { useState } from 'react'

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

function getHealthStatus(isoString) {
  const days = Math.floor((Date.now() - new Date(isoString).getTime()) / 86400000)
  if (days <= 7)  return { color: 'green', label: 'HEALTHY' }
  if (days <= 14) return { color: 'yellow', label: 'AT RISK' }
  return { color: 'red', label: 'CRITICAL' }
}

function AddClientForm({ onAdd, onCancel }) {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [tier, setTier] = useState('mid-market')
  const [renewalDate, setRenewalDate] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ name: name.trim(), company: company.trim(), tier, renewalDate })
    setName(''); setCompany(''); setTier('mid-market'); setRenewalDate('')
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <div className="add-form-title">Add Client</div>
      <div className="form-row">
        <input
          type="text"
          placeholder="Client / contact name..."
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />
      </div>
      <div className="form-row">
        <input
          type="text"
          placeholder="Company name..."
          value={company}
          onChange={e => setCompany(e.target.value)}
        />
      </div>
      <div className="form-row">
        <label>Tier</label>
        <select value={tier} onChange={e => setTier(e.target.value)} style={{ flex: 1 }}>
          <option value="enterprise">Enterprise</option>
          <option value="mid-market">Mid-Market</option>
          <option value="smb">SMB</option>
        </select>
      </div>
      <div className="form-row">
        <label>Renewal</label>
        <input
          type="date"
          value={renewalDate}
          onChange={e => setRenewalDate(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>
      <div className="form-row" style={{ justifyContent: 'flex-end', marginTop: 4 }}>
        <button type="button" className="btn btn--sm" onClick={onCancel}>CANCEL</button>
        <button type="submit" className="btn btn--sm btn--primary">ADD CLIENT</button>
      </div>
    </form>
  )
}

function getRenewalUrgency(dateStr) {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  const days = Math.floor(diff / 86400000)
  if (days < 0)   return { label: 'EXPIRED',    color: 'var(--color-danger)' }
  if (days <= 30) return { label: `${days}d`,   color: 'var(--color-danger)' }
  if (days <= 90) return { label: `${days}d`,   color: 'var(--color-warning)' }
  return { label: `${days}d`, color: 'var(--color-text-dim)' }
}

const TIER_COLORS = {
  enterprise:  'var(--color-secondary)',
  'mid-market':'var(--color-primary)',
  smb:         'var(--color-text-dim)',
}

function ClientCard({ client, onLogContact, onToggleAdvocate, onDelete }) {
  const health   = getHealthStatus(client.lastContact)
  const renewal  = getRenewalUrgency(client.renewalDate)

  return (
    <div className="client-card">
      <div className="client-header">
        <span className={`client-health-dot client-health-dot--${health.color}`} title={health.label} />
        <span className="client-name">{client.name}</span>
        {client.isAdvocate && (
          <span className="client-advocate-badge">ADVOCATE</span>
        )}
      </div>

      <div className="client-meta">
        <div className="client-contact-info">
          {client.company && (
            <span style={{ color: TIER_COLORS[client.tier], fontSize: 11 }}>
              {client.company}
              <span style={{ color: 'var(--color-text-dim)', marginLeft: 6, fontSize: 9, letterSpacing: 1 }}>
                {client.tier?.toUpperCase()}
              </span>
            </span>
          )}
          <span className={`client-last-contact ${health.color}`}>
            Last contact: {timeAgo(client.lastContact)}
          </span>
        </div>
        {renewal && (
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 9, color: 'var(--color-text-dim)', letterSpacing: 1, display: 'block', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>Renewal</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: renewal.color }}>
              {renewal.label}
            </span>
          </div>
        )}
      </div>

      <div className="client-footer">
        <button
          className="btn btn--sm btn--success"
          onClick={() => onLogContact(client.id)}
          title="Mark as contacted today (+10 XP)"
        >
          LOG CONTACT
        </button>
        <button
          className={`btn btn--sm ${client.isAdvocate ? 'btn--accent' : ''}`}
          onClick={() => onToggleAdvocate(client.id)}
          title="Toggle advocate status"
        >
          {client.isAdvocate ? '★ ADVOCATE' : '☆ ADVOCATE'}
        </button>
        <button
          className="btn btn--sm btn--danger"
          onClick={() => onDelete(client.id)}
          title="Remove client"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default function BookOfBusiness({ clients, kpiAdvocates, addClient, logContact, toggleAdvocate, deleteClient }) {
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')

  const advocates = clients.filter(c => c.isAdvocate).length
  const critical  = clients.filter(c => getHealthStatus(c.lastContact).color === 'red').length
  const atRisk    = clients.filter(c => getHealthStatus(c.lastContact).color === 'yellow').length

  const advocatePct = clients.length > 0
    ? Math.round((advocates / clients.length) * 100)
    : 0

  const filtered = clients.filter(c => {
    if (filter === 'advocates') return c.isAdvocate
    if (filter === 'critical')  return getHealthStatus(c.lastContact).color === 'red'
    if (filter === 'at-risk')   return getHealthStatus(c.lastContact).color === 'yellow'
    return true
  })

  // Sort: critical first, then at-risk, then healthy
  const sorted = [...filtered].sort((a, b) => {
    const order = { red: 0, yellow: 1, green: 2 }
    return order[getHealthStatus(a.lastContact).color] - order[getHealthStatus(b.lastContact).color]
  })

  function handleAdd(client) {
    addClient(client)
    setShowForm(false)
  }

  return (
    <div className="panel">
      <div className="panel-title">
        ◉ Book of Business
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, color: 'var(--color-text-dim)', letterSpacing: 2 }}>
          {clients.length} CLIENTS
        </span>
      </div>

      <div className="bob-stats">
        <div className="stat-box">
          <span className="stat-value" style={{ color: 'var(--color-success)' }}>{advocates}</span>
          <span className="stat-label">Advocates</span>
        </div>
        <div className="stat-box">
          <span className="stat-value" style={{ color: 'var(--color-danger)' }}>{critical}</span>
          <span className="stat-label">Critical</span>
        </div>
        <div className="stat-box">
          <span
            className="stat-value"
            style={{ color: advocatePct >= kpiAdvocates.target ? 'var(--color-success)' : 'var(--color-primary)' }}
          >
            {advocatePct}%
          </span>
          <span className="stat-label">Advocate %</span>
        </div>
      </div>

      {!showForm && (
        <button
          className="btn btn--primary btn--wide"
          onClick={() => setShowForm(true)}
          style={{ marginBottom: 10 }}
        >
          + Add Client
        </button>
      )}

      {showForm && (
        <AddClientForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />
      )}

      {clients.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          {['all', 'critical', 'at-risk', 'advocates'].map(f => (
            <button
              key={f}
              className={`btn btn--sm ${filter === f ? 'btn--primary' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'ALL' : f.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      <div className="client-list">
        {clients.length === 0 && (
          <div className="empty-state">
            <span className="empty-state-icon">👥</span>
            No clients in your book yet.<br />
            Add clients to track communication health.
          </div>
        )}
        {clients.length > 0 && sorted.length === 0 && (
          <div className="empty-state">No clients match this filter.</div>
        )}
        {sorted.map(client => (
          <ClientCard
            key={client.id}
            client={client}
            onLogContact={logContact}
            onToggleAdvocate={toggleAdvocate}
            onDelete={deleteClient}
          />
        ))}
      </div>
    </div>
  )
}

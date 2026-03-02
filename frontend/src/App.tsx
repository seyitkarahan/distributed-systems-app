import { useEffect, useState } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

type Status = 'UP' | 'DOWN' | 'UNKNOWN'

type HealthJson = {
  status?: string
  components?: Record<string, { status?: string }>
}

type HealthCardState = {
  label: string
  path: string
  status: Status
  loading: boolean
  error?: string
}

const initialCards: HealthCardState[] = [
  {
    label: 'Service Health (/api/health)',
    path: '/api/health',
    status: 'UNKNOWN',
    loading: true,
  },
  {
    label: 'Readiness (/actuator/health/readiness)',
    path: '/actuator/health/readiness',
    status: 'UNKNOWN',
    loading: true,
  },
  {
    label: 'Liveness (/actuator/health/liveness)',
    path: '/actuator/health/liveness',
    status: 'UNKNOWN',
    loading: true,
  },
]

function App() {
  const [cards, setCards] = useState<HealthCardState[]>(initialCards)
  const [nodeCount, setNodeCount] = useState<number | null>(null)
  const [nodeError, setNodeError] = useState<string | null>(null)

  useEffect(() => {
    // Health-related calls
    initialCards.forEach((card, index) => {
      const url = `${API_BASE_URL}${card.path}`
      fetch(url)
        .then(async (res) => {
          let body: HealthJson | undefined
          try {
            body = (await res.json()) as HealthJson
          } catch {
            body = undefined
          }

          if (!res.ok) {
            throw new Error(body?.status || `HTTP ${res.status}`)
          }

          let status: Status = 'UNKNOWN'
          const rawStatus = (body?.status || '').toUpperCase()
          if (rawStatus === 'UP') status = 'UP'
          else if (rawStatus === 'DOWN') status = 'DOWN'

          setCards((prev) => {
            const next = [...prev]
            next[index] = {
              ...next[index],
              status,
              loading: false,
              error: undefined,
            }
            return next
          })
        })
        .catch((err: unknown) => {
          setCards((prev) => {
            const next = [...prev]
            next[index] = {
              ...next[index],
              status: 'DOWN',
              loading: false,
              error: err instanceof Error ? err.message : 'Unknown error',
            }
            return next
          })
        })
    })

    // Node count (overview için basit metrik)
    fetch(`${API_BASE_URL}/api/nodes`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as unknown[]
        setNodeCount(Array.isArray(data) ? data.length : 0)
        setNodeError(null)
      })
      .catch((err: unknown) => {
        setNodeError(err instanceof Error ? err.message : 'Unknown error')
        setNodeCount(null)
      })
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Distributed Systems Dashboard</h1>
          <p className="app-subtitle">
            Spring Boot backend ve PostgreSQL için sağlık durumu ve genel görünüm.
          </p>
        </div>
      </header>

      <section className="cards-grid">
        {cards.map((card) => (
          <article key={card.path} className={`card card-status card-status-${card.status.toLowerCase()}`}>
            <h2 className="card-title">{card.label}</h2>
            <div className="card-body">
              {card.loading ? (
                <span className="badge badge-loading">Yükleniyor...</span>
              ) : (
                <span className={`badge badge-${card.status.toLowerCase()}`}>
                  {card.status}
                </span>
              )}
              {card.error && <p className="card-error">{card.error}</p>}
            </div>
          </article>
        ))}

        <article className="card">
          <h2 className="card-title">Node Özeti</h2>
          <div className="card-body">
            {nodeCount !== null ? (
              <p className="metric-value">Toplam node: {nodeCount}</p>
            ) : (
              <p className="metric-muted">Node bilgisi alınamadı.</p>
            )}
            {nodeError && <p className="card-error">{nodeError}</p>}
          </div>
        </article>
      </section>

      <section className="app-footer">
        <p>
          Backend base URL:&nbsp;
          <code>{API_BASE_URL || '(aynı origin)'}</code>
        </p>
      </section>
    </div>
  )
}

export default App

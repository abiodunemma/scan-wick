
import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchBorrowers } from './api'
import {
  formatNaira,
  formatDate,
  formatDateTime,
  topSignal,
  formatStatus,
  formatSeverity,
} from './lib/format'
import type { Borrower, Severity } from './type'
import './App.css'

type SignalFilter = 'All' | Severity | 'None'
type SortOption = 'outstanding' | 'repayment' | 'name'
type Theme = 'light' | 'dark'

const severityOrder: Severity[] = [
  'urgent',
  'act',
  'watch',
  'informational',
]

function getHighestSeverity(borrower: Borrower): Severity | null {
  return severityOrder.find((severity) =>
    borrower.open_signals.some((signal) => signal.severity === severity),
  ) ?? null
}

function App() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [signalFilter, setSignalFilter] = useState<SignalFilter>('All')
  const [sortBy, setSortBy] = useState<SortOption>('outstanding')
  const [theme, setTheme] = useState<Theme>('light')
  const requestId = useRef(0)

  const loadBorrowers = useCallback(async (showLoading = true) => {
    const currentRequest = ++requestId.current

    if (showLoading) setLoading(true)
    setError(false)

    try {
      const response = await fetchBorrowers()

      if (currentRequest !== requestId.current) return

      setBorrowers(response.borrowers)
      setError(false)
    } catch {
      if (currentRequest !== requestId.current) return

      setError(true)
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    void loadBorrowers()

    const interval = window.setInterval(() => {
      void loadBorrowers(false)
    }, 60_000)

    return () => {
      window.clearInterval(interval)
      requestId.current += 1
    }
  }, [loadBorrowers])

  const filteredBorrowers = borrowers
    .filter((borrower) => {
      const matchesSearch = borrower.name
        .toLowerCase()
        .includes(search.trim().toLowerCase())

      const highestSeverity = getHighestSeverity(borrower)

      const matchesSignal =
        signalFilter === 'All' ||
        (signalFilter === 'None' && highestSeverity === null) ||
        highestSeverity === signalFilter

      return matchesSearch && matchesSignal
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      }

      if (sortBy === 'repayment') {
        if (!a.next_repayment_date) return 1
        if (!b.next_repayment_date) return -1
        return a.next_repayment_date.localeCompare(b.next_repayment_date)
      }

      if (a.outstanding_kobo === null) return 1
      if (b.outstanding_kobo === null) return -1
      return b.outstanding_kobo - a.outstanding_kobo
    })

  function clearSearchAndFilter() {
    setSearch('')
    setSignalFilter('All')
  }

  return (
    <div className={`app-shell theme-${theme}`}>
      <nav className="topbar" aria-label="Main navigation">
        <a className="brand" href="#" aria-label="Scanwick home">
          SCANWICK<span>.</span>
        </a>

        <label className="theme-picker">
          <span>Theme:</span>
          <select
            aria-label="Choose theme"
            value={theme}
            onChange={(event) => setTheme(event.target.value as Theme)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
          <span className="select-arrow" aria-hidden="true">⌄</span>
        </label>
      </nav>

      <main className="dashboard">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">PORTFOLIO MONITORING</p>
            <h1>Monitored borrowers</h1>
            <p className="dashboard-description">
              {borrowers.length} borrowers · amounts in naira · times in Lagos
              time (WAT).
            </p>
          </div>
          <button
            type="button"
            className="refresh-button"
            onClick={() => void loadBorrowers()}
            disabled={loading}
          >
            <span aria-hidden="true">↻</span> Refresh
          </button>
        </header>

        <section className="toolbar" aria-label="Borrower controls">
          <div className="toolbar-left">
            <label className="search-box">
              <span aria-hidden="true" className="search-icon">⌕</span>
              <input
                type="search"
                placeholder="Search borrowers"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search borrowers by name"
              />
            </label>

            <label className="control-box">
              <span className="control-label">Signal</span>
              <select
                value={signalFilter}
                onChange={(event) =>
                  setSignalFilter(event.target.value as SignalFilter)
                }
                aria-label="Filter by most serious signal"
              >
                <option value="All">All signals</option>
                <option value="urgent">Urgent</option>
                <option value="act">Act</option>
                <option value="watch">Watch</option>
                <option value="informational">Informational</option>
                <option value="None">None</option>
              </select>
            </label>
          </div>

          <label className="control-box sort-box">
            <span className="control-label">Sort:</span>
            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value as SortOption)
              }
              aria-label="Sort borrowers"
            >
              <option value="outstanding">Outstanding · high to low</option>
              <option value="repayment">Next repayment · earliest first</option>
              <option value="name">Name · A to Z</option>
            </select>
          </label>
        </section>

        {loading && (
          <section className="loading-panel" aria-label="Loading borrowers">
            <p className="loading-label">Loading borrower information…</p>
            <div className="skeleton-table" aria-hidden="true">
              <div className="skeleton-row skeleton-heading">
                {Array.from({ length: 7 }, (_, index) => (
                  <span key={index} />
                ))}
              </div>
              {Array.from({ length: 6 }, (_, index) => (
                <div className="skeleton-row" key={index}>
                  {Array.from({ length: 7 }, (_, cell) => (
                    <span key={cell} />
                  ))}
                </div>
              ))}
            </div>
            <div className="mobile-skeleton" aria-hidden="true">
              {Array.from({ length: 4 }, (_, index) => (
                <div className="skeleton-card" key={index}>
                  <span /><span /><span />
                </div>
              ))}
            </div>
          </section>
        )}

        {!loading && error && (
          <section className="state-panel error-panel" role="alert">
            <div className="state-icon error-icon" aria-hidden="true">!</div>
            <h2>We could not load your<br className="desktop-break" /> borrowers</h2>
            <p>
              Nothing below is current. Check your
              <br className="desktop-break" /> connection and try again.
            </p>
            <button
              type="button"
              className="primary-button"
              onClick={() => void loadBorrowers()}
            >
              Try again <span aria-hidden="true">↗</span>
            </button>
          </section>
        )}

        {!loading && !error && filteredBorrowers.length === 0 && (
          <section className="state-panel empty-panel">
            <div className="state-icon empty-icon" aria-hidden="true">⌕</div>
            <h2>No borrowers match</h2>
            <p>
              Nothing matches “{search || 'your search'}” with the signal
              <br className="desktop-break" /> filter you chose.
            </p>
            <button
              type="button"
              className="primary-button"
              onClick={clearSearchAndFilter}
            >
              Clear search and filter
            </button>
          </section>
        )}

        {!loading && !error && filteredBorrowers.length > 0 && (
          <>
            <div className="results-summary">
              <span>
                Showing <strong>{filteredBorrowers.length}</strong> of{' '}
                <strong>{borrowers.length}</strong> borrowers
              </span>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Borrower</th>
                    <th scope="col">Facility</th>
                    <th scope="col">Outstanding</th>
                    <th scope="col">Next repayment</th>
                    <th scope="col">Last read</th>
                    <th scope="col">Signals</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBorrowers.map((borrower) => {
                    const severity = getHighestSeverity(borrower)

                    return (
                      <tr key={borrower.id}>
                        <td className="borrower-name">{borrower.name}</td>
                        <td>{formatNaira(borrower.facility_amount_kobo)}</td>
                        <td className="money-cell">
                          {formatNaira(borrower.outstanding_kobo)}
                        </td>
                        <td>{formatDate(borrower.next_repayment_date)}</td>
                        <td>{formatDateTime(borrower.last_read_at)}</td>
                        <td>
                          {severity ? (
                            <span className={`badge signal-${severity}`}>
                              {formatSeverity(severity)}
                              <span className="signal-count">
                                {borrower.open_signals.length}
                              </span>
                            </span>
                          ) : (
                            <span className="muted-dash">—</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge status-${borrower.status}`}>
                            <span className="status-dot" aria-hidden="true" />
                            {formatStatus(borrower.status)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="mobile-borrowers">
              {filteredBorrowers.map((borrower) => {
                const severity = getHighestSeverity(borrower)

                return (
                  <article className="borrower-card" key={borrower.id}>
                    <div className="card-heading">
                      <h2>{borrower.name}</h2>
                      <span className={`badge status-${borrower.status}`}>
                        <span className="status-dot" aria-hidden="true" />
                        {formatStatus(borrower.status)}
                      </span>
                    </div>
                    <div className="card-money">
                      <span>Outstanding</span>
                      <strong>{formatNaira(borrower.outstanding_kobo)}</strong>
                    </div>
                    <dl className="card-details">
                      <div>
                        <dt>Facility</dt>
                        <dd>{formatNaira(borrower.facility_amount_kobo)}</dd>
                      </div>
                      <div>
                        <dt>Next repayment</dt>
                        <dd>{formatDate(borrower.next_repayment_date)}</dd>
                      </div>
                      <div>
                        <dt>Last read</dt>
                        <dd>{formatDateTime(borrower.last_read_at)}</dd>
                      </div>
                      <div>
                        <dt>Signals</dt>
                        <dd>
                          {severity ? (
                            <span className={`badge signal-${severity}`}>
                              {formatSeverity(severity)}
                              <span className="signal-count">
                                {borrower.open_signals.length}
                              </span>
                            </span>
                          ) : '—'}
                        </dd>
                      </div>
                    </dl>
                  </article>
                )
              })}
            </div>
          </>
        )}
      </main>
      <footer className="page-footer">SCANWICK · Borrower monitoring</footer>
    </div>
  )
}

export default App


import { useCallback, useEffect, useState } from 'react'
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

function App() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [signalFilter, setSignalFilter] = useState<SignalFilter>('All')

  const loadBorrowers = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)

    setError(null)

    try {
      const response = await fetchBorrowers()
      setBorrowers(response.borrowers)
    } catch {
      setError('We could not load your borrowers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadBorrowers()

    const interval = window.setInterval(() => {
      void loadBorrowers(false)
    }, 60_000)

    return () => window.clearInterval(interval)
  }, [loadBorrowers])

  const filteredBorrowers = borrowers.filter((borrower) => {
    const matchesSearch = borrower.name
      .toLowerCase()
      .includes(search.toLowerCase())

    const highestSeverity = (
      ['urgent', 'act', 'watch', 'informational'] as Severity[]
    ).find((severity) =>
      borrower.open_signals.some((signal) => signal.severity === severity),
    )

    const matchesSignal =
      signalFilter === 'All' ||
      (signalFilter === 'None' && borrower.open_signals.length === 0) ||
      highestSeverity === signalFilter

    return matchesSearch && matchesSignal
  })

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Monitored borrowers</h1>
          <p>Review borrower facilities, repayment information and open signals.</p>
        </div>

        <span className="borrower-count">
          {filteredBorrowers.length} borrowers
        </span>
      </header>

      <section className="toolbar">
        <input
          type="search"
          placeholder="Search borrowers by name..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search borrowers by name"
        />

        <select
          value={signalFilter}
          onChange={(event) => setSignalFilter(event.target.value)}
          aria-label="Filter borrowers by most serious signal"
        >
          <option value="All">All signals</option>
          <option value="urgent">Urgent</option>
          <option value="act">Act</option>
          <option value="watch">Watch</option>
          <option value="informational">Informational</option>
          <option value="None">None</option>
        </select>
      </section>

      {loading && <p role="status">Loading borrowers...</p>}

      {error && (
        <div role="alert" className="error-state">
          <p>{error}</p>
          <button onClick={() => void loadBorrowers()}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Borrower</th>
                <th>Facility</th>
                <th>Outstanding</th>
                <th>Next repayment</th>
                <th>Last read</th>
                <th>Signals</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredBorrowers.length > 0 ? (
                filteredBorrowers.map((borrower) => (
                  <tr key={borrower.id}>
                    <td className="borrower-name">{borrower.name}</td>
                    <td>{formatNaira(borrower.facility_amount_kobo)}</td>
                    <td>{formatNaira(borrower.outstanding_kobo)}</td>
                    <td>{formatDate(borrower.next_repayment_date)}</td>
                    <td>{formatDateTime(borrower.last_read_at)}</td>
                    <td>
                      {borrower.open_signals.length > 0 && (
                        <span
                          className={`risk risk-${borrower.open_signals
                            .reduce<Severity>(
                              (highest, signal) => {
                                const order: Severity[] = [
                                  'urgent',
                                  'act',
                                  'watch',
                                  'informational',
                                ]

                                return order.indexOf(signal.severity) <
                                  order.indexOf(highest)
                                  ? signal.severity
                                  : highest
                              },
                              borrower.open_signals[0].severity,
                            )
                            .toLowerCase()}`}
                        >
                          {topSignal(borrower.open_signals)}
                        </span>
                      )}
                      {borrower.open_signals.length === 0 && '—'}
                    </td>
                    <td>{formatStatus(borrower.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="empty-state">
                    No borrowers match
                    <button
                      type="button"
                      onClick={() => {
                        setSearch('')
                        setSignalFilter('All')
                      }}
                    >
                      Clear
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

export default App

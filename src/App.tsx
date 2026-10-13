
import { useState } from 'react'
import './App.css'

type Borrower = {
  id: number
  name: string
  amount: number
  repaymentDate: string
  risk: 'Low' | 'Medium' | 'High'
}

const sampleBorrowers: Borrower[] = [
  {
    id: 1,
    name: 'Jane Doe',
    amount: 150000,
    repaymentDate: '2026-10-20',
    risk: 'Low',
  },
  {
    id: 2,
    name: 'John Smith',
    amount: 350000,
    repaymentDate: '2026-10-15',
    risk: 'High',
  },
  {
    id: 3,
    name: 'Mary James',
    amount: 220000,
    repaymentDate: '2026-10-25',
    risk: 'Medium',
  },
]

function App() {
  const [borrowers] = useState<Borrower[]>(sampleBorrowers)
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('All')

  const filteredBorrowers = borrowers.filter((borrower) => {
    const matchesSearch = borrower.name
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesRisk =
      riskFilter === 'All' || borrower.risk === riskFilter

    return matchesSearch && matchesRisk
  })

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Borrower Monitoring</h1>
          <p>Monitor borrower repayment information.</p>
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
          value={riskFilter}
          onChange={(event) => setRiskFilter(event.target.value)}
          aria-label="Filter borrowers by risk"
        >
          <option value="All">All risk levels</option>
          <option value="Low">Low risk</option>
          <option value="Medium">Medium risk</option>
          <option value="High">High risk</option>
        </select>
      </section>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Borrower</th>
              <th>Loan Amount</th>
              <th>Repayment Date</th>
              <th>Risk Signal</th>
            </tr>
          </thead>

          <tbody>
            {filteredBorrowers.length > 0 ? (
              filteredBorrowers.map((borrower) => (
                <tr key={borrower.id}>
                  <td className="borrower-name">{borrower.name}</td>

                  <td>
                    {borrower.amount.toLocaleString('en-NG', {
                      style: 'currency',
                      currency: 'NGN',
                      maximumFractionDigits: 0,
                    })}
                  </td>

                  <td>{borrower.repaymentDate}</td>

                  <td>
                    <span
                      className={`risk risk-${borrower.risk.toLowerCase()}`}
                    >
                      {borrower.risk}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="empty-state">
                  No borrowers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}

export default App
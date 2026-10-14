
export type Severity =
  | 'urgent'
  | 'act'
  | 'watch'
  | 'informational'

export type BorrowerStatus =
  | 'connected'
  | 'not_refreshed'
  | 'consent_withdrawn'

export type Borrower = {
  id: string
  name: string
  facility_amount_kobo: number
  outstanding_kobo: number | null
  next_repayment_date: string | null
  last_read_at: string | null
  status: BorrowerStatus
  open_signals: {
    severity: Severity
  }[]
}

export type BorrowersResponse = {
  borrowers: Borrower[]
}
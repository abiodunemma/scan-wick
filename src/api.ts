 
import type { BorrowersResponse } from './type'
import borrowersData from './borrowers.json'

export async function fetchBorrowers(): Promise<BorrowersResponse> {
  const delay = Math.floor(Math.random() * 3000) + 2000

  await new Promise<void>((resolve) => {
    setTimeout(resolve, delay)
  })

  // Simulate an API failure approximately 1 time in 4.
  if (Math.random() < 0.25) {
    throw new Error('We could not load your borrowers')
  }

  return borrowersData
}

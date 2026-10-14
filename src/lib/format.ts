
import type { Severity, BorrowerStatus } from '../type'

export function formatNaira(kobo: number | null): string {
  if (kobo === null) return '—'

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2,
  }).format(kobo / 100)
}

export function formatDate(date: string | null): string {
  if (date === null) return '—'

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Africa/Lagos',
  }).format(new Date(`${date}T00:00:00`))
}

export function formatDateTime(date: string | null): string {
  if (date === null) return 'Not read yet'

  const formatted = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Africa/Lagos',
  }).format(new Date(date))

  return formatted.replace(',', ',')
}

export function formatSeverity(severity: Severity): string {
  return {
    urgent: 'Urgent',
    act: 'Act',
    watch: 'Watch',
    informational: 'Informational',
  }[severity]
}

export function topSignal(
  signals: { severity: Severity }[],
): string {
  if (signals.length === 0) return '—'

  const priority: Severity[] = [
    'urgent',
    'act',
    'watch',
    'informational',
  ]

  const highest = [...signals].sort(
    (a, b) =>
      priority.indexOf(a.severity) - priority.indexOf(b.severity),
  )[0]

  return `${formatSeverity(highest.severity)} · ${signals.length}`
}

export function formatStatus(status: BorrowerStatus): string {
  return {
    connected: 'Connected',
    not_refreshed: 'Not refreshed',
    consent_withdrawn: 'Consent withdrawn',
  }[status]
}


export { cn } from "cn"

export interface FormattedTimeResult {
  relative: string
  exact: string
  full: string
  dateOnly: string
  timeOnly: string
}

export function formatRelativeTime(dateInput?: string | number | Date | null): FormattedTimeResult {
  if (!dateInput) {
    return { relative: 'N/A', exact: 'N/A', full: 'N/A', dateOnly: 'N/A', timeOnly: 'N/A' }
  }

  const date = new Date(dateInput)
  if (isNaN(date.getTime())) {
    return {
      relative: String(dateInput),
      exact: String(dateInput),
      full: String(dateInput),
      dateOnly: String(dateInput),
      timeOnly: '',
    }
  }

  const now = new Date()
  const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000))

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours ? hours : 12
  const formattedHours = String(hours).padStart(2, '0')

  const dateOnly = `${day}/${month}/${year}`
  const timeOnly = `${formattedHours}:${minutes} ${ampm}`
  const exact = `${dateOnly} • ${timeOnly}`

  let relative = ''
  if (diffInSeconds < 10) {
    relative = 'Just now'
  } else if (diffInSeconds < 60) {
    relative = `${diffInSeconds}s ago`
  } else if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60)
    relative = `${mins}m ago`
  } else if (diffInSeconds < 86400) {
    const hrs = Math.floor(diffInSeconds / 3600)
    relative = `${hrs}h ago`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    relative = `${days}d ago`
  } else {
    const months = Math.floor(diffInSeconds / 2592000)
    relative = `${months}mo ago`
  }

  const full = `${relative} (${dateOnly} ${timeOnly})`

  return { relative, exact, full, dateOnly, timeOnly }
}

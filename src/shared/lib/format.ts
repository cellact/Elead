export function formatDate(iso: string): string {
  const date = new Date(iso)

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${iso}`)
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

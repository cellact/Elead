export function createId(prefix: string): string {
  if (prefix.trim() === '') {
    throw new Error('createId requires a non-empty prefix.')
  }

  return `${prefix}_${crypto.randomUUID()}`
}

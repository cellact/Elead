const STORAGE_KEY = 'elead.provider-session.v1'
const SIGNED_IN = 'signed-in'

export function readProviderSession(): boolean {
  const raw = window.sessionStorage.getItem(STORAGE_KEY)

  if (raw === null) {
    return false
  }

  if (raw === SIGNED_IN) {
    return true
  }

  throw new Error(
    `Corrupt provider session in sessionStorage (${STORAGE_KEY}). Clear this key and reload.`,
  )
}

export function writeProviderSession(): void {
  window.sessionStorage.setItem(STORAGE_KEY, SIGNED_IN)
}

export function clearProviderSession(): void {
  window.sessionStorage.removeItem(STORAGE_KEY)
}

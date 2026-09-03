const STORAGE_KEY = 'elead.provider-session.v1'
const LEGACY_SIGNED_IN = 'signed-in'
const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/

export function readProviderSession(): string | null {
  const raw = window.sessionStorage.getItem(STORAGE_KEY)

  if (raw === null) {
    return null
  }

  if (raw === LEGACY_SIGNED_IN) {
    window.sessionStorage.removeItem(STORAGE_KEY)
    return null
  }

  if (!ADDRESS_RE.test(raw)) {
    throw new Error(
      `Corrupt provider session in sessionStorage (${STORAGE_KEY}). Clear this key and reload.`,
    )
  }

  return raw.toLowerCase()
}

export function writeProviderSession(address: string): void {
  if (!ADDRESS_RE.test(address)) {
    throw new Error('Provider session requires a wallet address.')
  }

  window.sessionStorage.setItem(STORAGE_KEY, address.toLowerCase())
}

export function clearProviderSession(): void {
  window.sessionStorage.removeItem(STORAGE_KEY)
}

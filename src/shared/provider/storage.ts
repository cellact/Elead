import type { EleadIdentity } from '@/shared/identity/types'
import {
  emptyProviderAccount,
  type ProviderAccount,
} from '@/shared/provider/types'

export const ACCOUNT_STORAGE_KEY = 'elead.provider-account.v1'

function accountKey(wallet: string): string {
  return `${ACCOUNT_STORAGE_KEY}:${wallet.toLowerCase()}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseIdentity(value: unknown): EleadIdentity | null {
  if (value === null) {
    return null
  }

  if (!isRecord(value)) {
    throw new Error('Inbox identity is not an object.')
  }

  if (typeof value.ensName !== 'string' || value.ensName.trim() === '') {
    throw new Error('Inbox identity is missing ensName.')
  }

  if (
    typeof value.activationUrl !== 'string' ||
    value.activationUrl.trim() === ''
  ) {
    throw new Error('Inbox identity is missing activationUrl.')
  }

  return {
    ensName: value.ensName,
    activationUrl: value.activationUrl,
  }
}

export function parseProviderAccount(raw: string): ProviderAccount {
  const parsed: unknown = JSON.parse(raw)

  if (!isRecord(parsed)) {
    throw new Error('Provider account is not an object.')
  }

  const domain = parsed.domain
  if (domain !== null && typeof domain !== 'string') {
    throw new Error('Provider account has an invalid domain.')
  }

  if (typeof parsed.hasFinishedSetup !== 'boolean') {
    throw new Error('Provider account is missing setup state.')
  }

  if (
    typeof parsed.identitiesPurchased !== 'number' ||
    typeof parsed.identitiesClaimed !== 'number'
  ) {
    throw new Error('Provider account is missing identity counts.')
  }

  if (
    !Number.isInteger(parsed.identitiesPurchased) ||
    !Number.isInteger(parsed.identitiesClaimed) ||
    parsed.identitiesPurchased < 0 ||
    parsed.identitiesClaimed < 0
  ) {
    throw new Error('Provider account has invalid identity counts.')
  }

  return {
    domain,
    inboxIdentity: parseIdentity(parsed.inboxIdentity),
    hasFinishedSetup: parsed.hasFinishedSetup,
    identitiesPurchased: parsed.identitiesPurchased,
    identitiesClaimed: parsed.identitiesClaimed,
  }
}

export function loadProviderAccount(wallet: string): ProviderAccount {
  const key = accountKey(wallet)
  const raw = window.localStorage.getItem(key)

  if (raw === null) {
    return emptyProviderAccount()
  }

  try {
    return parseProviderAccount(raw)
  } catch (error) {
    throw new Error(
      `Corrupt provider account in localStorage (${key}). Clear this key and reload.`,
      { cause: error },
    )
  }
}

export function saveProviderAccount(
  wallet: string,
  account: ProviderAccount,
): void {
  window.localStorage.setItem(accountKey(wallet), JSON.stringify(account))
}

export function clearAllProviderAccounts(): void {
  const keys: string[] = []
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i)
    if (key && key.startsWith(`${ACCOUNT_STORAGE_KEY}:`)) {
      keys.push(key)
    }
  }
  for (const key of keys) {
    window.localStorage.removeItem(key)
  }
}

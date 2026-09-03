import type { EleadIdentity } from '@/shared/identity/types'

export type ProviderAccount = {
  domain: string | null
  inboxIdentity: EleadIdentity | null
  hasFinishedSetup: boolean
  identitiesPurchased: number
  identitiesClaimed: number
}

export function emptyProviderAccount(): ProviderAccount {
  return {
    domain: null,
    inboxIdentity: null,
    hasFinishedSetup: false,
    identitiesPurchased: 0,
    identitiesClaimed: 0,
  }
}

export function isSetupComplete(account: ProviderAccount): boolean {
  return typeof account.domain === 'string' && account.domain.length > 0
}

export function identitiesAvailable(account: ProviderAccount): number {
  if (account.identitiesClaimed > account.identitiesPurchased) {
    throw new Error(
      'Claimed identities exceed purchased identities. The account record is inconsistent.',
    )
  }

  return account.identitiesPurchased - account.identitiesClaimed
}

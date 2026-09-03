import { createContext } from 'react'
import type { EleadIdentity } from '@/shared/identity/types'
import type { ProviderAccount } from '@/shared/provider/types'

export type ProviderStudioValue = {
  isSignedIn: boolean
  wallet: string | null
  account: ProviderAccount
  signIn: (address: string) => void
  signOut: () => void
  saveInbox: (domain: string, inboxIdentity: EleadIdentity) => void
  chooseDomain: (domain: string) => void
  finishSetup: () => void
  purchaseIdentities: (count: number) => void
}

export const ProviderStudioContext = createContext<ProviderStudioValue | null>(
  null,
)

import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { EleadIdentity } from '@/shared/identity/types'
import {
  clearProviderSession,
  readProviderSession,
  writeProviderSession,
} from '@/shared/auth/providerSession'
import {
  ProviderStudioContext,
  type ProviderStudioValue,
} from '@/shared/provider/studio-context'
import { loadProviderAccount, saveProviderAccount } from '@/shared/provider/storage'
import { identitiesAvailable, type ProviderAccount } from '@/shared/provider/types'

export function ProviderStudioProvider({ children }: { children: ReactNode }) {
  const [isSignedIn, setSignedIn] = useState(() => readProviderSession())
  const [account, setAccount] = useState(() => loadProviderAccount())

  const persistAccount = useCallback((next: ProviderAccount) => {
    identitiesAvailable(next)
    saveProviderAccount(next)
    setAccount(next)
  }, [])

  const signIn = useCallback(() => {
    writeProviderSession()
    setSignedIn(true)
  }, [])

  const signOut = useCallback(() => {
    clearProviderSession()
    setSignedIn(false)
  }, [])

  const saveInbox = useCallback(
    (domain: string, inboxIdentity: EleadIdentity) => {
      persistAccount({
        ...account,
        domain,
        inboxIdentity,
      })
    },
    [account, persistAccount],
  )

  const finishSetup = useCallback(() => {
    if (account.domain === null || account.inboxIdentity === null) {
      throw new Error(
        'Cannot enter the studio before the domain and inbox identity are set.',
      )
    }

    persistAccount({
      ...account,
      hasFinishedSetup: true,
    })
  }, [account, persistAccount])

  const purchaseIdentities = useCallback(
    (count: number) => {
      if (!Number.isInteger(count) || count < 1) {
        throw new Error('Purchase count must be a whole number of at least 1.')
      }

      persistAccount({
        ...account,
        identitiesPurchased: account.identitiesPurchased + count,
      })
    },
    [account, persistAccount],
  )

  const value = useMemo<ProviderStudioValue>(
    () => ({
      isSignedIn,
      account,
      signIn,
      signOut,
      saveInbox,
      finishSetup,
      purchaseIdentities,
    }),
    [
      isSignedIn,
      account,
      signIn,
      signOut,
      saveInbox,
      finishSetup,
      purchaseIdentities,
    ],
  )

  return (
    <ProviderStudioContext.Provider value={value}>
      {children}
    </ProviderStudioContext.Provider>
  )
}

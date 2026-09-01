import { ProviderAuthPage } from '@/pages/ProviderAuthPage'
import { ProviderSetupPage } from '@/pages/ProviderSetupPage'
import { ProviderLayout } from '@/ProviderLayout'
import { AppShell } from '@/shared/layout/AppShell/AppShell'
import { ProviderStudioProvider } from '@/shared/provider/ProviderStudioProvider'
import { isSetupComplete } from '@/shared/provider/types'
import { useProviderStudio } from '@/shared/provider/useProviderStudio'

export function ProviderGate() {
  return (
    <ProviderStudioProvider>
      <ProviderGateInner />
    </ProviderStudioProvider>
  )
}

function ProviderGateInner() {
  const { isSignedIn, signIn, account } = useProviderStudio()

  if (!isSignedIn) {
    return (
      <AppShell items={[]}>
        <ProviderAuthPage onContinue={signIn} />
      </AppShell>
    )
  }

  if (!isSetupComplete(account)) {
    return (
      <AppShell items={[]}>
        <ProviderSetupPage />
      </AppShell>
    )
  }

  return <ProviderLayout />
}

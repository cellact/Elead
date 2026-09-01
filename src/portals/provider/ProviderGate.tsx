import { ProviderAuthPage } from '@/portals/provider/pages/ProviderAuthPage'
import { ProviderSetupPage } from '@/portals/provider/pages/ProviderSetupPage'
import { ProviderLayout } from '@/portals/provider/ProviderLayout'
import { marketingNav } from '@/shared/config/site'
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
      <AppShell items={marketingNav} portalLabel="Provider">
        <ProviderAuthPage onContinue={signIn} />
      </AppShell>
    )
  }

  if (!isSetupComplete(account)) {
    return (
      <AppShell items={marketingNav} portalLabel="Provider">
        <ProviderSetupPage />
      </AppShell>
    )
  }

  return <ProviderLayout />
}

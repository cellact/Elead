import { Outlet } from 'react-router-dom'
import { routes } from '@/shared/config/routes'
import { providerNav } from '@/shared/config/site'
import { AppShell } from '@/shared/layout/AppShell/AppShell'

export function ProviderLayout() {
  return (
    <AppShell
      items={providerNav}
      portalLabel="Provider"
      trailing={{ to: routes.user.root, label: 'Clients' }}
    >
      <Outlet />
    </AppShell>
  )
}

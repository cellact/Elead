import { Outlet } from 'react-router-dom'
import { routes } from '@/shared/config/routes'
import { userNav } from '@/shared/config/site'
import { AppShell } from '@/shared/layout/AppShell/AppShell'

export function UserLayout() {
  return (
    <AppShell
      items={userNav}
      portalLabel="Client"
      trailing={{ to: routes.provider.root, label: 'Providers' }}
    >
      <Outlet />
    </AppShell>
  )
}

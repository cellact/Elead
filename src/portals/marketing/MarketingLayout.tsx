import { Outlet } from 'react-router-dom'
import { marketingNav } from '@/shared/config/site'
import { AppShell } from '@/shared/layout/AppShell/AppShell'

export function MarketingLayout() {
  return (
    <AppShell items={marketingNav}>
      <Outlet />
    </AppShell>
  )
}

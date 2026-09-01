import { Outlet } from 'react-router-dom'
import { exampleNav } from '@/config/nav'
import { AppShell } from '@/shared/layout/AppShell/AppShell'

export function UserLayout() {
  return (
    <AppShell items={exampleNav}>
      <Outlet />
    </AppShell>
  )
}

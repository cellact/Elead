import type { ReactNode } from 'react'
import { SiteFooter } from '@/shared/layout/SiteFooter/SiteFooter'
import { SiteHeader } from '@/shared/layout/SiteHeader/SiteHeader'
import type { NavItem } from '@/shared/config/site'
import styles from '@/shared/layout/AppShell/AppShell.module.css'

type AppShellProps = {
  items: readonly NavItem[]
  portalLabel?: string
  trailing?: NavItem
  children: ReactNode
}

export function AppShell({
  items,
  portalLabel,
  trailing,
  children,
}: AppShellProps) {
  return (
    <div className={styles.shell}>
      <SiteHeader items={items} portalLabel={portalLabel} trailing={trailing} />
      {children}
      <SiteFooter />
    </div>
  )
}

import { NavLink, Outlet } from 'react-router-dom'
import { consoleNav } from '@/config/nav'
import { cx } from '@/shared/lib/cx'
import { useProviderStudio } from '@/shared/provider/useProviderStudio'
import { Button } from '@/shared/ui/Button/Button'
import { actionVariant, actionSize } from '@/shared/ui/action/action'
import { Logo } from '@/shared/ui/Logo/Logo'
import { Stack } from '@/shared/ui/Stack/Stack'
import { stackGap } from '@/shared/ui/Stack/stackGap'
import styles from '@/ProviderStudio.module.css'

function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function ProviderLayout() {
  const { account, wallet, signOut } = useProviderStudio()

  return (
    <div className={styles.studio}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Logo />
          {account.domain ? (
            <p className={styles.domain}>{account.domain}.global</p>
          ) : wallet ? (
            <p className={styles.domain}>{shortAddress(wallet)}</p>
          ) : null}
        </div>
        <nav className={styles.nav} aria-label="Elead Console">
          {consoleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cx(styles.link, isActive && styles.active)
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Stack gap={stackGap.sm}>
          <Button
            variant={actionVariant.ghost}
            size={actionSize.sm}
            onClick={signOut}
          >
            Disconnect
          </Button>
        </Stack>
      </aside>
      <div className={styles.main}>
        <Outlet />
      </div>
    </div>
  )
}

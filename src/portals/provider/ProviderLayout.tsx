import { NavLink, Outlet } from 'react-router-dom'
import { providerNav } from '@/shared/config/site'
import { cx } from '@/shared/lib/cx'
import { useProviderStudio } from '@/shared/provider/useProviderStudio'
import { Button } from '@/shared/ui/Button/Button'
import { actionVariant, actionSize } from '@/shared/ui/action/action'
import { Logo } from '@/shared/ui/Logo/Logo'
import { Stack } from '@/shared/ui/Stack/Stack'
import { stackGap } from '@/shared/ui/Stack/stackGap'
import styles from '@/portals/provider/ProviderStudio.module.css'

export function ProviderLayout() {
  const { account, signOut } = useProviderStudio()

  return (
    <div className={styles.studio}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Logo />
          {account.domain ? (
            <p className={styles.domain}>{account.domain}.elead.eth</p>
          ) : null}
        </div>
        <nav className={styles.nav} aria-label="Provider studio">
          {providerNav.map((item) => (
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
            Log out
          </Button>
        </Stack>
      </aside>
      <div className={styles.main}>
        <Outlet />
      </div>
    </div>
  )
}

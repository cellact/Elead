import { NavLink } from 'react-router-dom'
import type { NavItem } from '@/shared/config/site'
import { Container } from '@/shared/ui/Container/Container'
import { Logo } from '@/shared/ui/Logo/Logo'
import { cx } from '@/shared/lib/cx'
import styles from '@/shared/layout/SiteHeader/SiteHeader.module.css'

type SiteHeaderProps = {
  items: readonly NavItem[]
  portalLabel?: string
  trailing?: NavItem
}

export function SiteHeader({ items, portalLabel, trailing }: SiteHeaderProps) {
  return (
    <header className={styles.header}>
      <Container>
        <div className={styles.row}>
          <Logo />
          {portalLabel ? <p className={styles.portal}>{portalLabel}</p> : null}
          {items.length > 0 || trailing ? (
            <nav className={styles.nav} aria-label="Primary">
              {items.map((item) => (
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
              {trailing ? (
                <NavLink to={trailing.to} className={styles.link}>
                  {trailing.label}
                </NavLink>
              ) : null}
            </nav>
          ) : null}
        </div>
      </Container>
    </header>
  )
}

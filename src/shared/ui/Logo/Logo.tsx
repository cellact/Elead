import { Link } from 'react-router-dom'
import { site } from '@/shared/config/site'
import styles from '@/shared/ui/Logo/Logo.module.css'

export function Logo({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className={styles.logo}>
      {site.name}
    </Link>
  )
}

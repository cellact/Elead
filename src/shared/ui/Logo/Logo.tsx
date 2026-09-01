import { Link } from 'react-router-dom'
import { site } from '@/shared/config/site'
import styles from '@/shared/ui/Logo/Logo.module.css'

export function Logo() {
  return (
    <Link to="/" className={styles.logo}>
      <span className={styles.mark} aria-hidden="true" />
      {site.name}
    </Link>
  )
}

import { Outlet } from 'react-router-dom'
import styles from '@/ProviderStudio.module.css'

export function ProviderLayout() {
  return (
    <div className={styles.studio}>
      <Outlet />
    </div>
  )
}

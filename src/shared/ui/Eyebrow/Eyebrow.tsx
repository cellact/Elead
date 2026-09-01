import type { ReactNode } from 'react'
import styles from '@/shared/ui/Eyebrow/Eyebrow.module.css'

type EyebrowProps = {
  children: ReactNode
}

export function Eyebrow({ children }: EyebrowProps) {
  return <p className={styles.eyebrow}>{children}</p>
}

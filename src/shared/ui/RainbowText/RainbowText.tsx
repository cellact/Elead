import type { ReactNode } from 'react'
import styles from '@/shared/ui/RainbowText/RainbowText.module.css'

type RainbowTextProps = {
  children: ReactNode
}

export function RainbowText({ children }: RainbowTextProps) {
  return <span className={styles.rainbow}>{children}</span>
}

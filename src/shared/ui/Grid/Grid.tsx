import type { ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import styles from '@/shared/ui/Grid/Grid.module.css'

type GridProps = {
  columns?: 2 | 3
  children: ReactNode
  className?: string
}

export function Grid({ columns = 2, children, className }: GridProps) {
  return (
    <div
      className={cx(
        styles.grid,
        columns === 2 ? styles.two : styles.three,
        className,
      )}
    >
      {children}
    </div>
  )
}

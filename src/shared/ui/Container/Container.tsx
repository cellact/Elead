import type { ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import styles from '@/shared/ui/Container/Container.module.css'

type ContainerProps = {
  width?: 'wide' | 'narrow'
  children: ReactNode
  className?: string
}

export function Container({
  width = 'wide',
  children,
  className,
}: ContainerProps) {
  return (
    <div className={cx(styles.container, styles[width], className)}>
      {children}
    </div>
  )
}

import type { ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import styles from '@/shared/ui/Stack/Stack.module.css'
import { stackGap, type StackGap } from '@/shared/ui/Stack/stackGap'

type StackProps = {
  gap?: StackGap
  children: ReactNode
  className?: string
}

export function Stack({ gap = stackGap.md, children, className }: StackProps) {
  return (
    <div className={cx(styles.stack, styles[gap], className)}>{children}</div>
  )
}

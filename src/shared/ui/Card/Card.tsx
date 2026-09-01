import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import styles from '@/shared/ui/Card/Card.module.css'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function Card({ className, ...props }: CardProps) {
  return <div className={cx(styles.card, className)} {...props} />
}

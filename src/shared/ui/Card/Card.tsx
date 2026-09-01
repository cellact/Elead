import type { HTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cx } from '@/shared/lib/cx'
import styles from '@/shared/ui/Card/Card.module.css'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function Card({ className, ...props }: CardProps) {
  return <div className={cx(styles.card, className)} {...props} />
}

type CardLinkProps = LinkProps & {
  children: ReactNode
}

export function CardLink({ className, ...props }: CardLinkProps) {
  return (
    <Link className={cx(styles.card, styles.interactive, className)} {...props} />
  )
}

import type { ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import styles from '@/shared/ui/Badge/Badge.module.css'
import { badgeTone, type BadgeTone } from '@/shared/ui/Badge/badgeTone'

type BadgeProps = {
  tone?: BadgeTone
  children: ReactNode
}

export function Badge({ tone = badgeTone.outline, children }: BadgeProps) {
  return <span className={cx(styles.badge, styles[tone])}>{children}</span>
}

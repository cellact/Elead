import type { ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import styles from '@/shared/ui/Cluster/Cluster.module.css'

type ClusterProps = {
  gap?: 'sm' | 'md' | 'lg'
  children: ReactNode
  className?: string
}

export function Cluster({ gap = 'md', children, className }: ClusterProps) {
  return (
    <div className={cx(styles.cluster, styles[gap], className)}>{children}</div>
  )
}

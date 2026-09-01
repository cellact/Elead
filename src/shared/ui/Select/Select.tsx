import type { SelectHTMLAttributes } from 'react'
import { cx } from '@/shared/lib/cx'
import styles from '@/shared/ui/control/control.module.css'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  hasError?: boolean
}

export function Select({ hasError = false, className, ...props }: SelectProps) {
  return (
    <select
      className={cx(
        styles.control,
        styles.select,
        hasError && styles.hasError,
        className,
      )}
      {...props}
    />
  )
}

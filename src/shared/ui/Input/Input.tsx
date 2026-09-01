import type { InputHTMLAttributes } from 'react'
import { cx } from '@/shared/lib/cx'
import styles from '@/shared/ui/control/control.module.css'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean
}

export function Input({ hasError = false, className, ...props }: InputProps) {
  return (
    <input
      className={cx(styles.control, hasError && styles.hasError, className)}
      {...props}
    />
  )
}

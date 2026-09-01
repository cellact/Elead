import type { TextareaHTMLAttributes } from 'react'
import { cx } from '@/shared/lib/cx'
import styles from '@/shared/ui/control/control.module.css'

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  hasError?: boolean
}

export function TextArea({
  hasError = false,
  className,
  ...props
}: TextAreaProps) {
  return (
    <textarea
      className={cx(
        styles.control,
        styles.textarea,
        hasError && styles.hasError,
        className,
      )}
      {...props}
    />
  )
}

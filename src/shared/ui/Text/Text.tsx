import type { ReactNode } from 'react'
import { cx } from '@/shared/lib/cx'
import styles from '@/shared/ui/Text/Text.module.css'
import {
  textSize,
  textTone,
  type TextSize,
  type TextTone,
} from '@/shared/ui/Text/textTokens'

type TextProps = {
  size?: TextSize
  tone?: TextTone
  children: ReactNode
  className?: string
}

export function Text({
  size = textSize.md,
  tone = textTone.ink,
  children,
  className,
}: TextProps) {
  return (
    <p className={cx(styles.text, styles[size], styles[tone], className)}>
      {children}
    </p>
  )
}

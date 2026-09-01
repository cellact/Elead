import type { ReactNode } from 'react'
import { unreachable } from '@/shared/lib/assert'
import { requireCssClass } from '@/shared/lib/css-class'
import { cx } from '@/shared/lib/cx'
import styles from '@/shared/ui/Heading/Heading.module.css'

type HeadingLevel = 1 | 2 | 3

type HeadingProps = {
  level: HeadingLevel
  display?: boolean
  children: ReactNode
  className?: string
}

export function Heading({
  level,
  display = false,
  children,
  className,
}: HeadingProps) {
  const shared = cx(
    styles.heading,
    headingClass(level),
    display && styles.display,
    className,
  )

  if (level === 1) {
    return <h1 className={shared}>{children}</h1>
  }
  if (level === 2) {
    return <h2 className={shared}>{children}</h2>
  }
  if (level === 3) {
    return <h3 className={shared}>{children}</h3>
  }

  return unreachable(level, 'Unsupported heading level')
}

function headingClass(level: HeadingLevel): string {
  if (level === 1) return requireCssClass(styles, 'level1')
  if (level === 2) return requireCssClass(styles, 'level2')
  if (level === 3) return requireCssClass(styles, 'level3')
  return unreachable(level, 'Unsupported heading level')
}

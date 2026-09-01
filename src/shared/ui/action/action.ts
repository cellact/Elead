import { requireCssClass } from '@/shared/lib/css-class'
import { cx } from '@/shared/lib/cx'
import styles from '@/shared/ui/action/action.module.css'

export const actionVariant = {
  primary: 'primary',
  secondary: 'secondary',
  ghost: 'ghost',
  accent: 'accent',
} as const

export const actionSize = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
} as const

export type ActionVariant = (typeof actionVariant)[keyof typeof actionVariant]
export type ActionSize = (typeof actionSize)[keyof typeof actionSize]

export type ActionVisualProps = {
  variant?: ActionVariant
  size?: ActionSize
  fullWidth?: boolean
}

export function actionClassName({
  variant = actionVariant.primary,
  size = actionSize.md,
  fullWidth = false,
  className,
}: ActionVisualProps & { className?: string }): string {
  return cx(
    requireCssClass(styles, 'action'),
    requireCssClass(styles, variant),
    requireCssClass(styles, size),
    fullWidth && requireCssClass(styles, 'fullWidth'),
    className,
  )
}

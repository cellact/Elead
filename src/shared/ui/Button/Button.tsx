import type { ButtonHTMLAttributes } from 'react'
import {
  actionClassName,
  type ActionVisualProps,
} from '@/shared/ui/action/action'

type ButtonProps = ActionVisualProps & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  variant,
  size,
  fullWidth,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={actionClassName({ variant, size, fullWidth, className })}
      {...props}
    />
  )
}

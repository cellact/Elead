import { Link, type LinkProps } from 'react-router-dom'
import {
  actionClassName,
  type ActionVisualProps,
} from '@/shared/ui/action/action'

type LinkButtonProps = ActionVisualProps & LinkProps

export function LinkButton({
  variant,
  size,
  fullWidth,
  className,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={actionClassName({ variant, size, fullWidth, className })}
      {...props}
    />
  )
}

import { cx } from '@/shared/lib/cx'
import styles from '@/shared/ui/Divider/Divider.module.css'

type DividerProps = {
  tone?: 'line' | 'strong' | 'rainbow'
}

export function Divider({ tone = 'line' }: DividerProps) {
  return (
    <hr
      className={cx(
        styles.divider,
        tone === 'strong' && styles.strong,
        tone === 'rainbow' && styles.rainbow,
      )}
    />
  )
}

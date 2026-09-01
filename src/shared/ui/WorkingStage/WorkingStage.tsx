import type { ReactNode } from 'react'
import { Eyebrow } from '@/shared/ui/Eyebrow/Eyebrow'
import { Heading } from '@/shared/ui/Heading/Heading'
import { Text } from '@/shared/ui/Text/Text'
import { textSize, textTone } from '@/shared/ui/Text/textTokens'
import styles from '@/shared/ui/WorkingStage/WorkingStage.module.css'

type WorkingStageProps = {
  label: string
  eyebrow: string
  heading: ReactNode
  body: ReactNode
}

export function WorkingStage({
  label,
  eyebrow,
  heading,
  body,
}: WorkingStageProps) {
  return (
    <div className={styles.stage}>
      <div
        className={styles.status}
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label={label}
      >
        <div className={styles.orbit} aria-hidden="true">
          <span className={styles.ring} />
          <span className={styles.ring} />
          <span className={styles.ring} />
        </div>
        <p className={styles.caption}>Working</p>
      </div>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Heading level={1}>{heading}</Heading>
      <div className={styles.copy}>
        <Text size={textSize.lg} tone={textTone.mute}>
          {body}
        </Text>
      </div>
    </div>
  )
}

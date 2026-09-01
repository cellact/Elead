import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routes } from '@/config/routes'
import { allocateIdentity } from '@/shared/identity/allocateIdentity'
import { Page } from '@/shared/layout/Page/Page'
import { Eyebrow } from '@/shared/ui/Eyebrow/Eyebrow'
import { Heading } from '@/shared/ui/Heading/Heading'
import { RainbowText } from '@/shared/ui/RainbowText/RainbowText'
import { Text } from '@/shared/ui/Text/Text'
import { textSize, textTone } from '@/shared/ui/Text/textTokens'
import styles from '@/pages/AllottingPage.module.css'

const minVisibleMs = 900

export function AllottingPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    const startedAt = Date.now()

    Promise.all([allocateIdentity(), waitRemaining(startedAt, minVisibleMs)])
      .then(([identity]) => {
        if (!cancelled) {
          navigate(routes.contact, { replace: true, state: { identity } })
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause
              : new Error('Could not allot a private line.', { cause }),
          )
        }
      })

    return () => {
      cancelled = true
    }
  }, [navigate])

  if (error) {
    throw error
  }

  return (
    <Page width="narrow">
      <div className={styles.stage}>
        <div
          className={styles.status}
          role="status"
          aria-live="polite"
          aria-busy="true"
          aria-label="Allotting a private line"
        >
          <div className={styles.orbit} aria-hidden="true">
            <span className={styles.ring} />
            <span className={styles.ring} />
            <span className={styles.ring} />
          </div>
          <p className={styles.caption}>Working</p>
        </div>
        <Eyebrow>01 / Access</Eyebrow>
        <Heading level={1}>
          Allotting a <RainbowText>private line</RainbowText>.
        </Heading>
        <div className={styles.copy}>
          <Text size={textSize.lg} tone={textTone.mute}>
            We are preparing an Elead identity for this lead. Next you will get
            a QR code to scan in Arnacon. Nothing personal is collected.
          </Text>
        </div>
      </div>
    </Page>
  )
}

function waitRemaining(startedAt: number, minimumMs: number): Promise<void> {
  const remaining = minimumMs - (Date.now() - startedAt)

  if (remaining <= 0) {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    window.setTimeout(resolve, remaining)
  })
}

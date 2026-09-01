import { Navigate, useLocation } from 'react-router-dom'
import { routes } from '@/config/routes'
import type { ClientIdentity } from '@/shared/identity/types'
import { Page } from '@/shared/layout/Page/Page'
import { Eyebrow } from '@/shared/ui/Eyebrow/Eyebrow'
import { Heading } from '@/shared/ui/Heading/Heading'
import { QrCode } from '@/shared/ui/QrCode/QrCode'
import { Stack } from '@/shared/ui/Stack/Stack'
import { stackGap } from '@/shared/ui/Stack/stackGap'
import { Text } from '@/shared/ui/Text/Text'
import { textSize, textTone } from '@/shared/ui/Text/textTokens'
import styles from '@/pages/ContactPage.module.css'

const steps = [
  {
    number: '01',
    title: 'Open Arnacon',
    copy: 'Open Arnacon on the phone that will hold the Elead identity.',
  },
  {
    number: '02',
    title: 'Scan this QR code',
    copy: 'Use Scan in the app and point it at the square.',
  },
  {
    number: '03',
    title: 'Activate the line in Arnacon',
    copy: 'The app will ask you to turn on this private Elead identity.',
  },
  {
    number: '04',
    title: 'Write what you need',
    copy: 'Send your message from that line. You do not add a phone or email.',
  },
  {
    number: '05',
    title: 'Wait for a reply',
    copy: 'The provider writes back on the same line. That is the whole conversation.',
  },
] as const

export function ContactPage() {
  const location = useLocation()
  const identity = readContactIdentity(location.state)

  if (!identity) {
    return <Navigate to={routes.allotting} replace />
  }

  return (
    <Page>
      <Stack gap={stackGap.md}>
        <Eyebrow>01 / Access</Eyebrow>
        <Heading level={1}>
          Open Arnacon on your phone and scan this code.
        </Heading>
        <Text size={textSize.lg} tone={textTone.mute}>
          This is a private line made for this lead. The
          provider can reach you here — and nowhere else.
        </Text>
      </Stack>

      <div className={styles.split}>
        <Stack gap={stackGap.sm}>
          <Eyebrow>Your Elead identity</Eyebrow>
          <p className={styles.ens}>{identity.ensName}</p>
          <div className={styles.frame}>
            <QrCode
              value={identity.activationUrl}
              label={`Scan to activate ${identity.ensName} in Arnacon`}
            />
          </div>
        </Stack>

        <div className={styles.steps}>
          {steps.map((step) => (
            <Stack key={step.number} gap={stackGap.sm} className={styles.step}>
              <div className={styles.stepHead}>
                <p className={styles.stepNumber}>{step.number} /</p>
                <Heading level={3}>{step.title}</Heading>
              </div>
              <Text tone={textTone.mute}>{step.copy}</Text>
            </Stack>
          ))}
        </div>
      </div>
    </Page>
  )
}

function readContactIdentity(state: unknown): ClientIdentity | null {
  if (state == null) {
    return null
  }

  if (typeof state !== 'object' || !('identity' in state)) {
    throw new Error('Corrupt contact state: identity is missing.')
  }

  const identity = state.identity

  if (typeof identity !== 'object' || identity === null) {
    throw new Error('Corrupt contact state: identity.')
  }

  const ensName =
    'ensName' in identity && typeof identity.ensName === 'string'
      ? identity.ensName.trim()
      : ''
  const activationUrl =
    'activationUrl' in identity && typeof identity.activationUrl === 'string'
      ? identity.activationUrl.trim()
      : ''

  if (ensName === '') {
    throw new Error('Corrupt contact state: ensName.')
  }

  if (activationUrl === '') {
    throw new Error('Corrupt contact state: activationUrl.')
  }

  return { ensName, activationUrl }
}

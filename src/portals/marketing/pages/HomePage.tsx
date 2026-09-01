import { Link } from 'react-router-dom'
import { routes } from '@/shared/config/routes'
import { Page } from '@/shared/layout/Page/Page'
import { Container } from '@/shared/ui/Container/Container'
import { Divider } from '@/shared/ui/Divider/Divider'
import { Eyebrow } from '@/shared/ui/Eyebrow/Eyebrow'
import { Heading } from '@/shared/ui/Heading/Heading'
import { RainbowText } from '@/shared/ui/RainbowText/RainbowText'
import { Stack } from '@/shared/ui/Stack/Stack'
import { stackGap } from '@/shared/ui/Stack/stackGap'
import { Text } from '@/shared/ui/Text/Text'
import { textSize, textTone } from '@/shared/ui/Text/textTokens'
import styles from '@/portals/marketing/pages/HomePage.module.css'

const steps = [
  {
    number: '01',
    title: 'Ask to talk',
    copy: 'You never type a phone number or email. Nothing personal is collected on this site.',
  },
  {
    number: '02',
    title: 'Get a private line',
    copy: 'We allot a line just for this lead and show you a QR code to scan. It is free.',
  },
  {
    number: '03',
    title: 'Write from Arnacon',
    copy: 'Activate the line, send your message, and wait. The provider replies there — without ever seeing your personal contact information.',
  },
] as const

export function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <Container>
          <Stack gap={stackGap.md}>
            <Eyebrow>Leads, kept private</Eyebrow>
            <Heading level={1}>
              Leave a lead.
              <br />
              Remain <RainbowText>anonymous</RainbowText>.
            </Heading>
            <Text size={textSize.lg} tone={textTone.mute}>
              Anyone can ask a service provider for help. You do not have to
              hand over a phone or email that can be stored, shared, or used
              again later.
            </Text>
          </Stack>
        </Container>
      </section>

      <Divider tone="rainbow" />

      <div className={styles.panels}>
        <Link to={routes.user.root} className={styles.panel}>
          <Eyebrow>For clients</Eyebrow>
          <Heading level={2}>Get in touch. Leave nothing personal.</Heading>
          <Text tone={textTone.mute}>
            A private line, a QR code scan, a message in Arnacon. The provider writes
            back on that line.
          </Text>
          <span>Enter the client studio →</span>
        </Link>
        <Link to={routes.provider.root} className={styles.panel}>
          <Eyebrow>For providers</Eyebrow>
          <Heading level={2}>Receive leads, not phone books.</Heading>
          <Text tone={textTone.mute}>
            Clients reach you on an Elead line. You never need to collect their
            personal contact details.
          </Text>
          <span>Enter the provider studio →</span>
        </Link>
      </div>

      <Page>
        <Stack gap={stackGap.md}>
          <Eyebrow>How it works</Eyebrow>
          <Heading level={2}>
            Three steps. No personal <RainbowText>details</RainbowText>.
          </Heading>
        </Stack>
        <div className={styles.steps}>
          {steps.map((step) => (
            <Stack key={step.number} gap={stackGap.sm}>
              <p className={styles.stepNumber}>{step.number}</p>
              <Heading level={3}>{step.title}</Heading>
              <Text tone={textTone.mute}>{step.copy}</Text>
            </Stack>
          ))}
        </div>
      </Page>
    </>
  )
}

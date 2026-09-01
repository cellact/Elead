import { routes } from '@/config/routes'
import { Page } from '@/shared/layout/Page/Page'
import { Container } from '@/shared/ui/Container/Container'
import { Divider } from '@/shared/ui/Divider/Divider'
import { Eyebrow } from '@/shared/ui/Eyebrow/Eyebrow'
import { Heading } from '@/shared/ui/Heading/Heading'
import { LinkButton } from '@/shared/ui/LinkButton/LinkButton'
import { RainbowText } from '@/shared/ui/RainbowText/RainbowText'
import { Stack } from '@/shared/ui/Stack/Stack'
import { stackGap } from '@/shared/ui/Stack/stackGap'
import { Text } from '@/shared/ui/Text/Text'
import { textSize, textTone } from '@/shared/ui/Text/textTokens'
import styles from '@/pages/HomePage.module.css'

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
            <Heading level={1} display>
              Leave a lead.
              <br />
              Remain <RainbowText>anonymous</RainbowText>.
            </Heading>
            <Text size={textSize.lg} tone={textTone.mute}>
              Anyone can ask a service provider for help. You do not have to
              hand over a phone or email that can be stored, shared, or used
              again later.
            </Text>
            <LinkButton to={routes.allotting}>Contact us</LinkButton>
          </Stack>
        </Container>
      </section>

      <Divider />

      <Page>
        <Stack gap={stackGap.md}>
          <Eyebrow>How it works</Eyebrow>
          <Heading level={2}>Three steps. No personal details.</Heading>
        </Stack>
        <div className={styles.steps}>
          {steps.map((step) => (
            <Stack key={step.number} gap={stackGap.sm}>
              <p className={styles.stepNumber}>{step.number} /</p>
              <Heading level={3}>{step.title}</Heading>
              <Text tone={textTone.mute}>{step.copy}</Text>
            </Stack>
          ))}
        </div>
      </Page>
    </>
  )
}

import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { routes } from '@/config/routes'
import { listLinkedDomains } from '@/shared/identity/allocateIdentity'
import { Page } from '@/shared/layout/Page/Page'
import { Container } from '@/shared/ui/Container/Container'
import { Divider } from '@/shared/ui/Divider/Divider'
import { Eyebrow } from '@/shared/ui/Eyebrow/Eyebrow'
import { Field } from '@/shared/ui/Field/Field'
import { Heading } from '@/shared/ui/Heading/Heading'
import { Input } from '@/shared/ui/Input/Input'
import { Button } from '@/shared/ui/Button/Button'
import { RainbowText } from '@/shared/ui/RainbowText/RainbowText'
import { Stack } from '@/shared/ui/Stack/Stack'
import { stackGap } from '@/shared/ui/Stack/stackGap'
import { Text } from '@/shared/ui/Text/Text'
import { textSize, textTone } from '@/shared/ui/Text/textTokens'
import styles from '@/pages/HomePage.module.css'

const steps = [
  {
    number: '01',
    title: 'Pick a provider domain',
    copy: 'Choose which linked 2LD you want a lead under. Demo only — a real site would already know its own domain.',
  },
  {
    number: '02',
    title: 'Get a private line',
    copy: 'The backend creates that identity when you ask. You do not use a pre-bought pool.',
  },
  {
    number: '03',
    title: 'Write from Arnacon',
    copy: 'Activate the line, send your message, and wait. The provider replies there — without ever seeing your personal contact information.',
  },
] as const

export function HomePage() {
  const navigate = useNavigate()
  const [domain, setDomain] = useState('')
  const [linked, setLinked] = useState<string[]>([])
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    let cancelled = false
    listLinkedDomains()
      .then((domains) => {
        if (cancelled) return
        setLinked(domains)
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : String(cause))
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  function onContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = domain.trim().toLowerCase().replace(/\.global$/, '')
    if (!next) {
      setError('Enter a domain to take a lead from.')
      return
    }
    navigate(routes.allotting, { state: { domain: next } })
  }

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
            <form onSubmit={onContact}>
              <Stack gap={stackGap.sm}>
                <Field label="Provider domain" htmlFor="lead-domain" error={error}>
                  <Input
                    id="lead-domain"
                    name="lead-domain"
                    list="linked-domains"
                    autoComplete="off"
                    placeholder="yourstudio"
                    value={domain}
                    hasError={Boolean(error)}
                    onChange={(event) => {
                      setError(undefined)
                      setDomain(event.target.value)
                    }}
                  />
                </Field>
                <datalist id="linked-domains">
                  {linked.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
                <Button type="submit">Contact us</Button>
              </Stack>
            </form>
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

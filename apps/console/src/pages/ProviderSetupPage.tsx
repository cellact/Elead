import { useState, type FormEvent } from 'react'
import { allocateIdentity } from '@/shared/identity/allocateIdentity'
import { Page } from '@/shared/layout/Page/Page'
import { isValidationError } from '@/shared/lib/errors'
import { minVisibleMs, waitRemaining } from '@/shared/lib/waitRemaining'
import { useProviderStudio } from '@/shared/provider/useProviderStudio'
import { requireDomain } from '@/shared/provider/validate'
import { Button } from '@/shared/ui/Button/Button'
import { Card } from '@/shared/ui/Card/Card'
import { Cluster } from '@/shared/ui/Cluster/Cluster'
import { Eyebrow } from '@/shared/ui/Eyebrow/Eyebrow'
import { Field } from '@/shared/ui/Field/Field'
import { Heading } from '@/shared/ui/Heading/Heading'
import { Input } from '@/shared/ui/Input/Input'
import { QrCode } from '@/shared/ui/QrCode/QrCode'
import { RainbowText } from '@/shared/ui/RainbowText/RainbowText'
import { Stack } from '@/shared/ui/Stack/Stack'
import { stackGap } from '@/shared/ui/Stack/stackGap'
import { Text } from '@/shared/ui/Text/Text'
import { textSize, textTone } from '@/shared/ui/Text/textTokens'
import { WorkingStage } from '@/shared/ui/WorkingStage/WorkingStage'
import { actionVariant } from '@/shared/ui/action/action'
import styles from '@/pages/ProviderSetupPage.module.css'

const setupWork = {
  domain: 'domain',
  inbox: 'inbox',
} as const

type SetupWork = (typeof setupWork)[keyof typeof setupWork]

const steps = [
  {
    number: '01',
    title: 'Open Arnacon',
    copy: 'Open Arnacon on the phone that will hold the console inbox.',
  },
  {
    number: '02',
    title: 'Scan this QR code',
    copy: 'Use Scan in the app and point it at the square.',
  },
  {
    number: '03',
    title: 'Activate the inbox',
    copy: 'Turn on this identity. Client leads arrive here.',
  },
] as const

export function ProviderSetupPage() {
  const { account, saveInbox, finishSetup, signOut } = useProviderStudio()
  const [domain, setDomain] = useState(account.domain ?? '')
  const [domainError, setDomainError] = useState<string | undefined>()
  const [work, setWork] = useState<SetupWork | null>(null)

  const inbox = account.inboxIdentity

  async function onPurchaseDomain(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setDomainError(undefined)

    let validDomain: string

    try {
      validDomain = requireDomain(domain)
    } catch (error) {
      if (isValidationError(error)) {
        setDomainError(error.fieldErrors.domain)
        return
      }

      throw error
    }

    const domainStartedAt = Date.now()
    setWork(setupWork.domain)
    await waitRemaining(domainStartedAt, minVisibleMs)

    const inboxStartedAt = Date.now()
    setWork(setupWork.inbox)
    const inboxIdentity = await allocateIdentity('inbox')
    await waitRemaining(inboxStartedAt, minVisibleMs)
    saveInbox(validDomain, inboxIdentity)
  }

  if (inbox && account.domain) {
    return (
      <Page>
        <Cluster>
          <Button variant={actionVariant.ghost} onClick={signOut}>
            Log out
          </Button>
        </Cluster>
        <Stack gap={stackGap.md}>
          <Eyebrow>02 / Inbox</Eyebrow>
          <Heading level={1}>
            Activate your identity to receive leads in{' '}
            <RainbowText>Arnacon</RainbowText>.
          </Heading>
          <Text size={textSize.lg} tone={textTone.mute}>
            Your domain is {account.domain}.elead.eth. This identity is the
            line every client lead arrives on.
          </Text>
          <div className={styles.split}>
            <Stack gap={stackGap.sm}>
              <Eyebrow>Console inbox</Eyebrow>
              <p className={styles.ens}>{inbox.ensName}</p>
              <div className={styles.frame}>
                <QrCode
                  value={inbox.activationUrl}
                  label={`Scan to activate ${inbox.ensName} in Arnacon`}
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
          <Button onClick={finishSetup}>Enter the console</Button>
        </Stack>
      </Page>
    )
  }

  if (work === setupWork.domain) {
    const purchased = domain.trim() || 'yourstudio'

    return (
      <Page width="narrow">
        <WorkingStage
          label="Purchasing your domain"
          eyebrow="01 / Domain"
          heading={
            <>
              Purchasing your <RainbowText>domain</RainbowText>.
            </>
          }
          body={`Claiming ${purchased}.elead.eth. Next you get an inbox identity for client leads.`}
        />
      </Page>
    )
  }

  if (work === setupWork.inbox) {
    return (
      <Page width="narrow">
        <WorkingStage
          label="Allotting your inbox"
          eyebrow="02 / Inbox"
          heading={
            <>
              Allotting your <RainbowText>inbox</RainbowText>.
            </>
          }
          body="Preparing the console identity. Next you will get a QR code to scan in Arnacon."
        />
      </Page>
    )
  }

  return (
    <Page>
      <Cluster>
        <Button variant={actionVariant.ghost} onClick={signOut}>
          Log out
        </Button>
      </Cluster>
      <Stack gap={stackGap.md}>
        <Eyebrow>01 / Domain</Eyebrow>
        <Heading level={1}>
          Choose and purchase your <RainbowText>domain</RainbowText>.
        </Heading>
        <Text size={textSize.lg} tone={textTone.mute}>
          This name is yours on Elead. After you purchase it, you get an
          inbox identity to activate in Arnacon.
        </Text>
        <Card>
          <form onSubmit={onPurchaseDomain} noValidate>
            <Stack gap={stackGap.md}>
              <Field
                label="Domain"
                htmlFor="provider-domain"
                error={domainError}
              >
                <Input
                  id="provider-domain"
                  name="domain"
                  placeholder="yourstudio"
                  value={domain}
                  hasError={Boolean(domainError)}
                  onChange={(event) => setDomain(event.target.value)}
                />
              </Field>
              <Text tone={textTone.mute}>
                You will receive {domain.trim() || 'yourstudio'}.elead.eth
              </Text>
              <Button type="submit">Purchase domain</Button>
            </Stack>
          </form>
        </Card>
      </Stack>
    </Page>
  )
}

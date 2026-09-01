import { useState, type FormEvent } from 'react'
import { Page } from '@/shared/layout/Page/Page'
import { Button } from '@/shared/ui/Button/Button'
import { Card } from '@/shared/ui/Card/Card'
import { Eyebrow } from '@/shared/ui/Eyebrow/Eyebrow'
import { Field } from '@/shared/ui/Field/Field'
import { Heading } from '@/shared/ui/Heading/Heading'
import { Input } from '@/shared/ui/Input/Input'
import { RainbowText } from '@/shared/ui/RainbowText/RainbowText'
import { Stack } from '@/shared/ui/Stack/Stack'
import { stackGap } from '@/shared/ui/Stack/stackGap'
import { Text } from '@/shared/ui/Text/Text'
import { textSize, textTone } from '@/shared/ui/Text/textTokens'
import { actionVariant } from '@/shared/ui/action/action'
import styles from '@/pages/ProviderAuthPage.module.css'

const authMode = {
  signIn: 'signIn',
  register: 'register',
} as const

type AuthMode = (typeof authMode)[keyof typeof authMode]

// const steps = [
//   {
//     number: '01',
//     title: 'Choose a domain',
//     copy: 'Purchase a name on Elead. That is the address clients reach you through.',
//   },
//   {
//     number: '02',
//     title: 'Activate your inbox',
//     copy: 'Scan a QR code in Arnacon. Every lead arrives on that identity.',
//   },
//   {
//     number: '03',
//     title: 'Buy client lines',
//     copy: 'Pregenerated identities wait here until someone asks to talk.',
//   },
// ] as const

type ProviderAuthPageProps = {
  onContinue: () => void
}

export function ProviderAuthPage({ onContinue }: ProviderAuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(authMode.signIn)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const isRegister = mode === authMode.register

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onContinue()
  }

  return (
    <Page>
      <div className={styles.split}>
        <Stack gap={stackGap.md}>
          <Eyebrow>Register or sign in</Eyebrow>
          <Heading level={1}>
            Set up your <RainbowText>account</RainbowText>.
          </Heading>
          <Text size={textSize.lg} tone={textTone.mute}>
            Register or sign in. After that you buy a domain, activate an inbox, 
            and purchase client lines.
          </Text>
          {/* <div className={styles.steps}>
            {steps.map((step) => (
              <div key={step.number} className={styles.step}>
                <div className={styles.stepHead}>
                  <p className={styles.stepNumber}>{step.number} /</p>
                  <Heading level={3}>{step.title}</Heading>
                </div>
                <Text tone={textTone.mute}>{step.copy}</Text>
              </div>
            ))}
          </div> */}
        </Stack>

        <Card>
          <form onSubmit={onSubmit} noValidate>
            <Stack gap={stackGap.md}>
              <Stack gap={stackGap.sm}>
                <Eyebrow>{isRegister ? 'Register' : 'Sign in'}</Eyebrow>
                <Heading level={2}>
                  {isRegister ? 'Create an account' : 'Welcome back'}
                </Heading>
                <Text tone={textTone.mute}>
                  {isRegister
                    ? 'Choose a username and password. The console opens next.'
                    : 'Use the username and password from registration. The console opens next.'}
                </Text>
              </Stack>

              <Field label="Username" htmlFor="provider-username">
                <Input
                  id="provider-username"
                  name="username"
                  autoComplete="username"
                  placeholder="your studio name"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </Field>

              <Field label="Password" htmlFor="provider-password">
                <Input
                  id="provider-password"
                  name="password"
                  type="password"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  placeholder="Your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </Field>

              {isRegister ? (
                <Field
                  label="Confirm password"
                  htmlFor="provider-confirm-password"
                >
                  <Input
                    id="provider-confirm-password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </Field>
              ) : null}

              <div className={styles.formActions}>
                <Button
                  type="button"
                  variant={actionVariant.ghost}
                  onClick={() =>
                    setMode(isRegister ? authMode.signIn : authMode.register)
                  }
                >
                  {isRegister
                    ? 'Already registered? Sign in'
                    : 'New here? Register'}
                </Button>
                <Button type="submit">
                  {isRegister ? 'Register' : 'Sign in'}
                </Button>
              </div>
            </Stack>
          </form>
        </Card>
      </div>
    </Page>
  )
}

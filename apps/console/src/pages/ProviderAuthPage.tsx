import { useState, type FormEvent } from 'react'
import { Page } from '@/shared/layout/Page/Page'
import { minVisibleMs, waitRemaining } from '@/shared/lib/waitRemaining'
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
import { WorkingStage } from '@/shared/ui/WorkingStage/WorkingStage'
import { actionVariant } from '@/shared/ui/action/action'
import styles from '@/pages/ProviderAuthPage.module.css'

const authMode = {
  signIn: 'signIn',
  register: 'register',
} as const

type AuthMode = (typeof authMode)[keyof typeof authMode]

const workingCopy = {
  [authMode.signIn]: {
    label: 'Signing in',
    eyebrow: '01 / Account',
    heading: (
      <>
        Opening your <RainbowText>console</RainbowText>.
      </>
    ),
    body: 'Checking this studio. Next you buy a domain and activate an inbox if you have not already.',
  },
  [authMode.register]: {
    label: 'Creating your account',
    eyebrow: '01 / Account',
    heading: (
      <>
        Creating your <RainbowText>account</RainbowText>.
      </>
    ),
    body: 'Registering this studio. Next you buy a domain and activate an inbox.',
  },
} as const

type ProviderAuthPageProps = {
  onContinue: () => void
}

export function ProviderAuthPage({ onContinue }: ProviderAuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(authMode.signIn)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [workingMode, setWorkingMode] = useState<AuthMode | null>(null)

  const isRegister = mode === authMode.register

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const startedAt = Date.now()
    setWorkingMode(mode)
    await waitRemaining(startedAt, minVisibleMs)
    onContinue()
  }

  if (workingMode) {
    const copy = workingCopy[workingMode]

    return (
      <Page width="narrow">
        <WorkingStage
          label={copy.label}
          eyebrow={copy.eyebrow}
          heading={copy.heading}
          body={copy.body}
        />
      </Page>
    )
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

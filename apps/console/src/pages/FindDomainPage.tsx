import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AddressZero } from '@ethersproject/constants'
import { routes } from '@/config/routes'
import { connectConsoleWallet } from '@/pages/ProviderAuthPage'
import {
  inspectCompleted,
  isWizardComplete,
  get2ld,
  resolveNameOwner,
  sameAddr,
  stashPendingDomain,
} from '@/pages/ProviderSetupPage'
import { Page } from '@/shared/layout/Page/Page'
import { isValidationError } from '@/shared/lib/errors'
import { useProviderStudio } from '@/shared/provider/useProviderStudio'
import { requireDomain } from '@/shared/provider/validate'
import { Button } from '@/shared/ui/Button/Button'
import { Card } from '@/shared/ui/Card/Card'
import { Field } from '@/shared/ui/Field/Field'
import { Heading } from '@/shared/ui/Heading/Heading'
import { Input } from '@/shared/ui/Input/Input'
import { Stack } from '@/shared/ui/Stack/Stack'
import { stackGap } from '@/shared/ui/Stack/stackGap'
import { Text } from '@/shared/ui/Text/Text'
import { textTone } from '@/shared/ui/Text/textTokens'
import styles from '@/pages/ProviderAuthPage.module.css'

export function FindDomainPage() {
  const navigate = useNavigate()
  const { wallet, chooseDomain } = useProviderStudio()
  const [domainInput, setDomainInput] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [ownedBy, setOwnedBy] = useState<string | undefined>()
  const [busy, setBusy] = useState(false)

  async function onFind() {
    setError(undefined)
    setOwnedBy(undefined)
    let label: string
    try {
      label = requireDomain(domainInput)
    } catch (cause) {
      if (isValidationError(cause)) {
        setError(cause.fieldErrors.domain)
        return
      }
      throw cause
    }
    setBusy(true)
    try {
      const session = await connectConsoleWallet()
      if (wallet && session.address.toLowerCase() !== wallet.toLowerCase()) {
        throw new Error(
          `MetaMask is ${session.address}, console session is ${wallet}. Switch account.`,
        )
      }
      const owner = await resolveNameOwner(session, label)
      if (!owner) {
        stashPendingDomain(label, true)
        navigate(routes.setup)
        return
      }
      const slcAddr = await get2ld(session)
      const owns =
        sameAddr(owner, slcAddr) || sameAddr(owner, session.address)
      if (!owns) {
        setOwnedBy(owner)
        return
      }
      const completed = await inspectCompleted(session, label)
      if (isWizardComplete(completed)) {
        chooseDomain(label)
        navigate(routes.studio)
        return
      }
      stashPendingDomain(label, false)
      navigate(routes.setup)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page>
      <div className={styles.chamber}>
        <div className={styles.split}>
          <Heading level={1} display>
            Find domain
          </Heading>
          <Card>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                void onFind()
              }}
              noValidate
            >
              <Stack gap={stackGap.md}>
                <Field label="Domain" htmlFor="find-domain" error={error}>
                  <Input
                    id="find-domain"
                    name="domain"
                    placeholder="yourstudio"
                    value={domainInput}
                    hasError={Boolean(error)}
                    disabled={busy}
                    onChange={(event) => setDomainInput(event.target.value)}
                  />
                </Field>
                <Text tone={textTone.mute}>
                  {(domainInput.trim() || 'yourstudio').toLowerCase()}.global
                </Text>
                {ownedBy ? (
                  <Text>
                    This domain is owned by {ownedBy === AddressZero ? 'nobody' : ownedBy}.
                    Pick another label.
                  </Text>
                ) : null}
                <Button type="submit" disabled={busy}>
                  {busy ? 'Looking up…' : 'Find'}
                </Button>
              </Stack>
            </form>
          </Card>
        </div>
      </div>
    </Page>
  )
}

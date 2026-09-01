import { useState, type FormEvent } from 'react'
import { Page } from '@/shared/layout/Page/Page'
import { isValidationError } from '@/shared/lib/errors'
import { identitiesAvailable } from '@/shared/provider/types'
import { useProviderStudio } from '@/shared/provider/useProviderStudio'
import { requirePurchaseCount } from '@/shared/provider/validate'
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

export function ManagePage() {
  const { account, purchaseIdentities } = useProviderStudio()
  const [count, setCount] = useState('10')
  const [countError, setCountError] = useState<string | undefined>()
  const available = identitiesAvailable(account)

  function onPurchase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCountError(undefined)

    try {
      purchaseIdentities(requirePurchaseCount(count))
    } catch (error) {
      if (isValidationError(error)) {
        setCountError(error.fieldErrors.count)
        return
      }

      throw error
    }
  }

  return (
    <Page>
      <Stack gap={stackGap.md}>
        <Eyebrow>02 / Manage</Eyebrow>
        <Heading level={1}>
          Buy more Elead <RainbowText>identities</RainbowText>.
        </Heading>
        <Text size={textSize.lg} tone={textTone.mute}>
          Each identity is pregenerated for a client lead. You have{' '}
          {account.identitiesPurchased} purchased, {account.identitiesClaimed}{' '}
          in use, and {available} available.
        </Text>
      </Stack>

      <Card>
        <form onSubmit={onPurchase} noValidate>
          <Stack gap={stackGap.md}>
            <Field
              label="How many to purchase"
              htmlFor="identity-count"
              error={countError}
            >
              <Input
                id="identity-count"
                name="count"
                inputMode="numeric"
                value={count}
                hasError={Boolean(countError)}
                onChange={(event) => setCount(event.target.value)}
              />
            </Field>
            <Button type="submit">Purchase identities</Button>
          </Stack>
        </form>
      </Card>
    </Page>
  )
}

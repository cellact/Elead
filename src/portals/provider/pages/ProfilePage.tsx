import { useState, type FormEvent } from 'react'
import { categories } from '@/shared/data/catalog'
import { Page } from '@/shared/layout/Page/Page'
import { isValidationError } from '@/shared/lib/errors'
import { useAppState } from '@/shared/state/useAppState'
import { Button } from '@/shared/ui/Button/Button'
import { Eyebrow } from '@/shared/ui/Eyebrow/Eyebrow'
import { Field } from '@/shared/ui/Field/Field'
import { Heading } from '@/shared/ui/Heading/Heading'
import { Input } from '@/shared/ui/Input/Input'
import { RainbowText } from '@/shared/ui/RainbowText/RainbowText'
import { Select } from '@/shared/ui/Select/Select'
import { Stack } from '@/shared/ui/Stack/Stack'
import { stackGap } from '@/shared/ui/Stack/stackGap'
import { Text } from '@/shared/ui/Text/Text'
import { textTone } from '@/shared/ui/Text/textTokens'
import { TextArea } from '@/shared/ui/TextArea/TextArea'

export function ProfilePage() {
  const { profile, saveProfile } = useAppState()
  const [form, setForm] = useState(profile)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFieldErrors({})
    setSaved(false)

    try {
      saveProfile(form)
      setSaved(true)
    } catch (error) {
      if (isValidationError(error)) {
        setFieldErrors(error.fieldErrors)
        return
      }

      throw error
    }
  }

  return (
    <Page width="narrow">
      <Stack gap={stackGap.md}>
        <Eyebrow>Profile</Eyebrow>
        <Heading level={1}>
          Who is on the <RainbowText>other side</RainbowText>.
        </Heading>
        <Text tone={textTone.mute}>
          Required fields fail in place. The trade list is the same catalog
          clients use.
        </Text>
      </Stack>

      <form onSubmit={onSubmit} noValidate>
        <Stack gap={stackGap.md}>
          <Field label="Name" htmlFor="name" error={fieldErrors.name}>
            <Input
              id="name"
              name="name"
              value={form.name}
              hasError={Boolean(fieldErrors.name)}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </Field>

          <Field label="Trade" htmlFor="trade" error={fieldErrors.trade}>
            <Select
              id="trade"
              name="trade"
              value={form.trade}
              hasError={Boolean(fieldErrors.trade)}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  trade: event.target.value as typeof current.trade,
                }))
              }
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="City" htmlFor="city" error={fieldErrors.city}>
            <Input
              id="city"
              name="city"
              value={form.city}
              hasError={Boolean(fieldErrors.city)}
              onChange={(event) =>
                setForm((current) => ({ ...current, city: event.target.value }))
              }
            />
          </Field>

          <Field label="Bio" htmlFor="bio" error={fieldErrors.bio}>
            <TextArea
              id="bio"
              name="bio"
              value={form.bio}
              hasError={Boolean(fieldErrors.bio)}
              onChange={(event) =>
                setForm((current) => ({ ...current, bio: event.target.value }))
              }
            />
          </Field>

          <Button type="submit">Save profile</Button>
          {saved ? <Text>Saved.</Text> : null}
        </Stack>
      </form>
    </Page>
  )
}

import { Page } from '@/shared/layout/Page/Page'
import { Eyebrow } from '@/shared/ui/Eyebrow/Eyebrow'
import { Heading } from '@/shared/ui/Heading/Heading'
import { RainbowText } from '@/shared/ui/RainbowText/RainbowText'
import { Stack } from '@/shared/ui/Stack/Stack'
import { stackGap } from '@/shared/ui/Stack/stackGap'
import { Text } from '@/shared/ui/Text/Text'
import { textTone } from '@/shared/ui/Text/textTokens'

type ErrorScreenProps = {
  error: Error
}

export function ErrorScreen({ error }: ErrorScreenProps) {
  return (
    <Page width="narrow">
      <Stack gap={stackGap.md}>
        <Eyebrow>Failure</Eyebrow>
        <Heading level={1}>
          Something <RainbowText>broke</RainbowText> out loud.
        </Heading>
        <Text>{error.message}</Text>
        {error.cause instanceof Error ? (
          <Text tone={textTone.mute}>{error.cause.message}</Text>
        ) : null}
      </Stack>
    </Page>
  )
}

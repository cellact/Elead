import { routes } from '@/shared/config/routes'
import { Page } from '@/shared/layout/Page/Page'
import { Eyebrow } from '@/shared/ui/Eyebrow/Eyebrow'
import { Heading } from '@/shared/ui/Heading/Heading'
import { LinkButton } from '@/shared/ui/LinkButton/LinkButton'
import { RainbowText } from '@/shared/ui/RainbowText/RainbowText'
import { Stack } from '@/shared/ui/Stack/Stack'
import { stackGap } from '@/shared/ui/Stack/stackGap'
import { Text } from '@/shared/ui/Text/Text'
import { textTone } from '@/shared/ui/Text/textTokens'

export function NotFoundPage() {
  return (
    <Page width="narrow">
      <Stack gap={stackGap.md}>
        <Eyebrow>404</Eyebrow>
        <Heading level={1}>
          This page is not <RainbowText>here</RainbowText>.
        </Heading>
        <Text tone={textTone.mute}>
          The path does not match a client or provider route.
        </Text>
        <LinkButton to={routes.home}>Back to Elead</LinkButton>
      </Stack>
    </Page>
  )
}

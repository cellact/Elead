import { site } from '@/shared/config/site'
import { Page } from '@/shared/layout/Page/Page'
import { Eyebrow } from '@/shared/ui/Eyebrow/Eyebrow'
import { Heading } from '@/shared/ui/Heading/Heading'
import { LinkButton } from '@/shared/ui/LinkButton/LinkButton'
import { Stack } from '@/shared/ui/Stack/Stack'
import { stackGap } from '@/shared/ui/Stack/stackGap'
import { Text } from '@/shared/ui/Text/Text'
import { textTone } from '@/shared/ui/Text/textTokens'

export function NotFoundPage() {
  return (
    <Page width="narrow">
      <Stack gap={stackGap.md}>
        <Eyebrow>404 / Not found</Eyebrow>
        <Heading level={1}>This page is no longer here.</Heading>
        <Text tone={textTone.mute}>
          The page you are looking for is no longer here or the address has
          changed.
        </Text>
        <LinkButton to="/">Return to {site.name}</LinkButton>
      </Stack>
    </Page>
  )
}

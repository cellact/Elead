import { routes } from '@/config/routes'
import { Page } from '@/shared/layout/Page/Page'
import { identitiesAvailable } from '@/shared/provider/types'
import { useProviderStudio } from '@/shared/provider/useProviderStudio'
import { Card } from '@/shared/ui/Card/Card'
import { Eyebrow } from '@/shared/ui/Eyebrow/Eyebrow'
import { Grid } from '@/shared/ui/Grid/Grid'
import { Heading } from '@/shared/ui/Heading/Heading'
import { LinkButton } from '@/shared/ui/LinkButton/LinkButton'
import { RainbowText } from '@/shared/ui/RainbowText/RainbowText'
import { Stack } from '@/shared/ui/Stack/Stack'
import { stackGap } from '@/shared/ui/Stack/stackGap'
import { Text } from '@/shared/ui/Text/Text'
import { textSize, textTone } from '@/shared/ui/Text/textTokens'
import { actionVariant } from '@/shared/ui/action/action'

export function OverviewPage() {
  const { account } = useProviderStudio()
  const available = identitiesAvailable(account)
  const domain = account.domain
  const inbox = account.inboxIdentity

  if (!domain || !inbox) {
    throw new Error('Overview cannot render before setup is finished.')
  }

  return (
    <Page>
      <Stack gap={stackGap.md}>
        <Eyebrow>01 / Overview</Eyebrow>
        <Heading level={1}>
          Your Elead <RainbowText>identities</RainbowText>.
        </Heading>
        <Text size={textSize.lg} tone={textTone.mute}>
          {domain}.elead.eth · Inbox {inbox.ensName}. Pregenerated lines wait
          for a client to claim one.
        </Text>
        {account.identitiesPurchased === 0 ? (
          <Text tone={textTone.mute}>
            No client lines yet. Purchase identities to allot a private line
            when someone asks to talk.
          </Text>
        ) : null}
      </Stack>

      <Grid columns={3}>
        <Card>
          <Eyebrow>Purchased</Eyebrow>
          <Heading level={3}>{String(account.identitiesPurchased)}</Heading>
          <Text tone={textTone.mute}>Pregenerated and ready to allot.</Text>
        </Card>
        <Card>
          <Eyebrow>In use</Eyebrow>
          <Heading level={3}>{String(account.identitiesClaimed)}</Heading>
          <Text tone={textTone.mute}>Claimed by clients for a lead.</Text>
        </Card>
        <Card>
          <Eyebrow>Available</Eyebrow>
          <Heading level={3}>{String(available)}</Heading>
          <Text tone={textTone.mute}>Still waiting to be claimed.</Text>
        </Card>
      </Grid>

      <LinkButton to={routes.manage} variant={actionVariant.secondary}>
        Purchase more identities
      </LinkButton>
    </Page>
  )
}

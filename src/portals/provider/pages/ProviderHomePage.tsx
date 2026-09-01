import { routes } from '@/shared/config/routes'
import { getCategory } from '@/shared/data/catalog'
import { requestStatus } from '@/shared/data/types'
import { Page } from '@/shared/layout/Page/Page'
import { useAppState } from '@/shared/state/useAppState'
import { Card } from '@/shared/ui/Card/Card'
import { Cluster } from '@/shared/ui/Cluster/Cluster'
import { Divider } from '@/shared/ui/Divider/Divider'
import { Eyebrow } from '@/shared/ui/Eyebrow/Eyebrow'
import { Grid } from '@/shared/ui/Grid/Grid'
import { Heading } from '@/shared/ui/Heading/Heading'
import { LinkButton } from '@/shared/ui/LinkButton/LinkButton'
import { actionVariant } from '@/shared/ui/action/action'
import { RainbowText } from '@/shared/ui/RainbowText/RainbowText'
import { RequestCard } from '@/shared/ui/RequestCard/RequestCard'
import { Stack } from '@/shared/ui/Stack/Stack'
import { stackGap } from '@/shared/ui/Stack/stackGap'
import { Text } from '@/shared/ui/Text/Text'
import { textSize, textTone } from '@/shared/ui/Text/textTokens'

export function ProviderHomePage() {
  const { requests, profile } = useAppState()
  const openCount = requests.filter(
    (request) => request.status === requestStatus.open,
  ).length
  const matchedCount = requests.filter(
    (request) => request.status === requestStatus.matched,
  ).length
  const hasProfile = profile.name.trim() !== ''
  const recent = requests.slice(0, 2)

  return (
    <Page>
      <Stack gap={stackGap.md}>
        <Eyebrow>Provider studio</Eyebrow>
        <Heading level={1}>
          Leads, not <RainbowText>noise</RainbowText>.
        </Heading>
        <Text size={textSize.lg} tone={textTone.mute}>
          {hasProfile
            ? `${profile.name} · ${getCategory(profile.trade).name} · ${profile.city}`
            : 'Set a profile so clients know who is on the other side of a match.'}
        </Text>
        <Cluster>
          <LinkButton to={routes.provider.leads}>Open leads</LinkButton>
          <LinkButton
            to={routes.provider.profile}
            variant={actionVariant.secondary}
          >
            {hasProfile ? 'Edit profile' : 'Create profile'}
          </LinkButton>
        </Cluster>
      </Stack>

      <Grid columns={3}>
        <Card>
          <Eyebrow>Open</Eyebrow>
          <Heading level={2}>{String(openCount)}</Heading>
        </Card>
        <Card>
          <Eyebrow>Matched</Eyebrow>
          <Heading level={2}>{String(matchedCount)}</Heading>
        </Card>
        <Card>
          <Eyebrow>Profile</Eyebrow>
          <Heading level={2}>{hasProfile ? 'Set' : 'Empty'}</Heading>
        </Card>
      </Grid>

      <Divider />

      <Stack gap={stackGap.md}>
        <Eyebrow>Inbox</Eyebrow>
        <Heading level={2}>Latest leads</Heading>
        {recent.length === 0 ? (
          <Text tone={textTone.mute}>No leads yet.</Text>
        ) : (
          recent.map((request) => (
            <RequestCard key={request.id} request={request} showClient />
          ))
        )}
      </Stack>
    </Page>
  )
}

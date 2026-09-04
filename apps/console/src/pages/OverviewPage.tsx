import { useEffect, useState } from 'react'
import { routes } from '@/config/routes'
import { listCreatedLeads, type CreatedLead } from '@/shared/identity/allocateIdentity'
import { Page } from '@/shared/layout/Page/Page'
import { useProviderStudio } from '@/shared/provider/useProviderStudio'
import { Card } from '@/shared/ui/Card/Card'
import { Eyebrow } from '@/shared/ui/Eyebrow/Eyebrow'
import { Grid } from '@/shared/ui/Grid/Grid'
import { Heading } from '@/shared/ui/Heading/Heading'
import { LinkButton } from '@/shared/ui/LinkButton/LinkButton'
import { Stack } from '@/shared/ui/Stack/Stack'
import { stackGap } from '@/shared/ui/Stack/stackGap'
import { Text } from '@/shared/ui/Text/Text'
import { textSize, textTone } from '@/shared/ui/Text/textTokens'
import { actionVariant } from '@/shared/ui/action/action'

function isClaimed(lead: CreatedLead): boolean {
  return lead.status !== 'unclaimed'
}

export function OverviewPage() {
  const { account } = useProviderStudio()
  const domain = account.domain
  const inbox = account.inboxIdentity
  const [leads, setLeads] = useState<CreatedLead[] | null>(null)
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    if (!domain) return
    let cancelled = false
    listCreatedLeads({ domain })
      .then((rows) => {
        if (!cancelled) setLeads(rows)
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : String(cause))
          setLeads([])
        }
      })
    return () => {
      cancelled = true
    }
  }, [domain])

  if (!domain) {
    throw new Error('Overview cannot render before a domain is chosen.')
  }

  const created = leads?.length ?? 0
  const claimed = leads?.filter(isClaimed).length ?? 0
  const open = created - claimed

  return (
    <Page>
      <Stack gap={stackGap.md}>
        <Eyebrow>Overview</Eyebrow>
        <Heading level={1}>Your identities.</Heading>
        <Text size={textSize.lg} tone={textTone.mute}>
          {domain}.global
          {inbox ? ` · Inbox ${inbox.ensName}` : ''}. Lines are created when a
          client asks to talk — you do not pre-buy a pool.
        </Text>
        {error ? <Text tone={textTone.mute}>{error}</Text> : null}
        {leads && created === 0 ? (
          <Text tone={textTone.mute}>
            No client lines yet. They appear here when someone contacts you.
          </Text>
        ) : null}
      </Stack>

      <Grid columns={3}>
        <Card>
          <Eyebrow>Created</Eyebrow>
          <Heading level={3}>{leads ? String(created) : '—'}</Heading>
          <Text tone={textTone.mute}>Identities issued to clients.</Text>
        </Card>
        <Card>
          <Eyebrow>In use</Eyebrow>
          <Heading level={3}>{leads ? String(claimed) : '—'}</Heading>
          <Text tone={textTone.mute}>Claimed or no longer unclaimed.</Text>
        </Card>
        <Card>
          <Eyebrow>Unclaimed</Eyebrow>
          <Heading level={3}>{leads ? String(open) : '—'}</Heading>
          <Text tone={textTone.mute}>Created, not yet activated.</Text>
        </Card>
      </Grid>

      <LinkButton to={routes.manage} variant={actionVariant.secondary}>
        View identities
      </LinkButton>
    </Page>
  )
}

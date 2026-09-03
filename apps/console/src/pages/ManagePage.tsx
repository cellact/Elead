import { useEffect, useState } from 'react'
import { listCreatedLeads, type CreatedLead } from '@/shared/identity/allocateIdentity'
import { Page } from '@/shared/layout/Page/Page'
import { useProviderStudio } from '@/shared/provider/useProviderStudio'
import { Card } from '@/shared/ui/Card/Card'
import { Eyebrow } from '@/shared/ui/Eyebrow/Eyebrow'
import { Heading } from '@/shared/ui/Heading/Heading'
import { RainbowText } from '@/shared/ui/RainbowText/RainbowText'
import { Stack } from '@/shared/ui/Stack/Stack'
import { stackGap } from '@/shared/ui/Stack/stackGap'
import { Text } from '@/shared/ui/Text/Text'
import { textSize, textTone } from '@/shared/ui/Text/textTokens'

export function ManagePage() {
  const { account } = useProviderStudio()
  const domain = account.domain
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

  return (
    <Page>
      <Stack gap={stackGap.md}>
        <Eyebrow>02 / Manage</Eyebrow>
        <Heading level={1}>
          Created Elead <RainbowText>identities</RainbowText>.
        </Heading>
        <Text size={textSize.lg} tone={textTone.mute}>
          These are lines the backend issued when a client asked to talk. There
          is no inventory to purchase.
        </Text>
        {error ? <Text tone={textTone.mute}>{error}</Text> : null}
      </Stack>

      {leads === null ? (
        <Text tone={textTone.mute}>Loading identities…</Text>
      ) : leads.length === 0 ? (
        <Text tone={textTone.mute}>No identities created yet.</Text>
      ) : (
        <Stack gap={stackGap.sm}>
          {leads.map((lead) => (
            <Card key={`${lead.domain}:${lead.label}`}>
              <Eyebrow>{lead.status}</Eyebrow>
              <Heading level={3}>{lead.fullName}</Heading>
              <Text tone={textTone.mute}>
                {lead.label} · {lead.domain} · {lead.createdAt}
              </Text>
            </Card>
          ))}
        </Stack>
      )}
    </Page>
  )
}

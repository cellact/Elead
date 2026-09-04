import { useCallback, useEffect, useState } from 'react'
import {
  generateInboxQR,
  getInboxFeedSummary,
  inboxCreateMessage,
  inboxRoutingMessage,
  listInboxes,
  setInboxRouting,
  type EleadInbox,
  type InboxFeedCounts,
  type InboxList,
} from '@/shared/identity/allocateIdentity'
import { Page } from '@/shared/layout/Page/Page'
import { connectConsoleWallet } from '@/pages/ProviderAuthPage'
import { useProviderStudio } from '@/shared/provider/useProviderStudio'
import { requireDomain } from '@/shared/provider/validate'
import { formatUnknownError, isValidationError } from '@/shared/lib/errors'
import { Button } from '@/shared/ui/Button/Button'
import { Card } from '@/shared/ui/Card/Card'
import { Cluster } from '@/shared/ui/Cluster/Cluster'
import { Eyebrow } from '@/shared/ui/Eyebrow/Eyebrow'
import { Field } from '@/shared/ui/Field/Field'
import { Heading } from '@/shared/ui/Heading/Heading'
import { Input } from '@/shared/ui/Input/Input'
import { QrCode } from '@/shared/ui/QrCode/QrCode'
import { RainbowText } from '@/shared/ui/RainbowText/RainbowText'
import { Stack } from '@/shared/ui/Stack/Stack'
import { stackGap } from '@/shared/ui/Stack/stackGap'
import { Text } from '@/shared/ui/Text/Text'
import { textSize, textTone } from '@/shared/ui/Text/textTokens'

export function InboxPage() {
  const { account, wallet } = useProviderStudio()
  const domain = account.domain
  const [inboxName, setInboxName] = useState('inbox1')
  const [nameError, setNameError] = useState<string | undefined>()
  const [error, setError] = useState<string | undefined>()
  const [status, setStatus] = useState<string | undefined>()
  const [busy, setBusy] = useState(false)
  const [list, setList] = useState<InboxList | null>(null)
  const [summaries, setSummaries] = useState<Record<string, InboxFeedCounts>>(
    {},
  )
  const [issued, setIssued] = useState<{
    url: string
    fullName: string
  } | null>(null)

  const refresh = useCallback(async () => {
    if (!domain) return
    const next = await listInboxes(domain)
    setList(next)
    const rows = next.inboxes || []
    const packed = await Promise.all(
      rows.map(async (inbox) => {
        try {
          const summary = await getInboxFeedSummary({
            domain,
            inbox: inbox.label,
          })
          return [inbox.label, summary.counts] as const
        } catch {
          return [inbox.label, null] as const
        }
      }),
    )
    const nextSummaries: Record<string, InboxFeedCounts> = {}
    for (const [label, counts] of packed) {
      if (counts) nextSummaries[label] = counts
    }
    setSummaries(nextSummaries)
  }, [domain])

  useEffect(() => {
    if (!domain) return
    let cancelled = false
    listInboxes(domain)
      .then(async (next) => {
        if (cancelled) return
        setList(next)
        const packed = await Promise.all(
          (next.inboxes || []).map(async (inbox) => {
            try {
              const summary = await getInboxFeedSummary({
                domain,
                inbox: inbox.label,
              })
              return [inbox.label, summary.counts] as const
            } catch {
              return [inbox.label, null] as const
            }
          }),
        )
        if (cancelled) return
        const nextSummaries: Record<string, InboxFeedCounts> = {}
        for (const [label, counts] of packed) {
          if (counts) nextSummaries[label] = counts
        }
        setSummaries(nextSummaries)
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(formatUnknownError(cause))
        }
      })
    return () => {
      cancelled = true
    }
  }, [domain])

  if (!domain) {
    throw new Error('Inbox cannot render before a domain is chosen.')
  }

  async function signAndCreate() {
    setError(undefined)
    setNameError(undefined)
    setIssued(null)
    let label: string
    try {
      label = requireDomain(inboxName)
    } catch (cause) {
      if (isValidationError(cause)) {
        setNameError(cause.fieldErrors.domain)
        return
      }
      throw cause
    }
    setBusy(true)
    setStatus('Connecting wallet…')
    try {
      const session = await connectConsoleWallet()
      if (wallet && session.address.toLowerCase() !== wallet.toLowerCase()) {
        throw new Error(
          `MetaMask is ${session.address}, console session is ${wallet}. Switch account.`,
        )
      }
      setStatus('Sign the inbox name in MetaMask…')
      const timestamp = Date.now()
      const signature = await session.signer.signMessage(
        inboxCreateMessage(domain, label, timestamp),
      )
      setStatus('Creating the inbox on chain. This can take half a minute…')
      const result = await generateInboxQR({
        domain,
        inboxName: label,
        timestamp,
        signature,
      })
      setIssued({ url: result.url, fullName: result.fullName })
      setStatus('Inbox ready. Scan the QR on the phone that should own it.')
      await refresh()
    } catch (cause: unknown) {
      setError(formatUnknownError(cause))
      setStatus(undefined)
    } finally {
      setBusy(false)
    }
  }

  async function signAndRoute(mode: 'single' | 'group', inbox?: EleadInbox) {
    setError(undefined)
    setBusy(true)
    setStatus('Connecting wallet…')
    try {
      const session = await connectConsoleWallet()
      if (wallet && session.address.toLowerCase() !== wallet.toLowerCase()) {
        throw new Error(
          `MetaMask is ${session.address}, console session is ${wallet}. Switch account.`,
        )
      }
      const inboxLabel = mode === 'group' ? '-' : inbox?.label
      if (mode === 'single' && !inboxLabel) {
        throw new Error('Pick an inbox to receive.')
      }
      setStatus('Sign routing in MetaMask…')
      const timestamp = Date.now()
      const signature = await session.signer.signMessage(
        inboxRoutingMessage(domain, inboxLabel || '-', timestamp),
      )
      setStatus('Saving routing…')
      const next = await setInboxRouting({
        domain,
        mode,
        inboxName: mode === 'single' ? inboxLabel : undefined,
        timestamp,
        signature,
      })
      setList(next)
      setStatus(
        mode === 'group'
          ? 'Leads go to a random claimed inbox.'
          : `Leads go to ${inbox?.fullName}.`,
      )
    } catch (cause: unknown) {
      setError(formatUnknownError(cause))
      setStatus(undefined)
    } finally {
      setBusy(false)
    }
  }

  const receiveMode = list?.receiveMode || 'single'
  const receiveInbox = list?.receiveInbox || null

  return (
    <Page>
      <Stack gap={stackGap.md}>
        <Eyebrow>03 / Inbox</Eyebrow>
        <Heading level={1}>
          Install a provider <RainbowText>inbox</RainbowText>.
        </Heading>
        <Text size={textSize.lg} tone={textTone.mute}>
          Same claim flow as a lead, but the SP wallet must sign the inbox name
          and a timestamp. Scan the QR on the phone that should own{' '}
          {inboxName.trim() || 'inbox'}.{domain}.global.
        </Text>
        {status ? <Text>{status}</Text> : null}
        {error ? <Text tone={textTone.mute}>{error}</Text> : null}
      </Stack>

      <Card>
        <Stack gap={stackGap.md}>
          <Field label="Inbox name" htmlFor="inbox-name" error={nameError}>
            <Input
              id="inbox-name"
              name="inboxName"
              value={inboxName}
              hasError={Boolean(nameError)}
              disabled={busy}
              onChange={(event) => setInboxName(event.target.value)}
            />
          </Field>
          <Text tone={textTone.mute}>
            {(inboxName.trim() || 'inbox1').toLowerCase()}.{domain}.global
          </Text>
          <Cluster>
            <Button type="button" disabled={busy} onClick={() => void signAndCreate()}>
              {busy ? 'Working…' : 'Prompt signature'}
            </Button>
          </Cluster>
          {issued ? (
            <Stack gap={stackGap.sm}>
              <Text>{issued.fullName}</Text>
              <QrCode value={issued.url} label={`Install ${issued.fullName}`} />
            </Stack>
          ) : null}
        </Stack>
      </Card>

      <Stack gap={stackGap.sm}>
        <Heading level={2}>Where leads land</Heading>
        <Text tone={textTone.mute}>
          Single inbox, or random among claimed inboxes. Each change is signed.
        </Text>
        <Card>
          <label>
            <input
              type="radio"
              name="receive-mode"
              checked={receiveMode === 'group'}
              disabled={busy}
              onChange={() => void signAndRoute('group')}
            />{' '}
            Group — random claimed inbox
          </label>
        </Card>
        {(list?.inboxes || []).length === 0 ? (
          <Text tone={textTone.mute}>No inboxes yet.</Text>
        ) : (
          (list?.inboxes || []).map((inbox) => (
            <Card key={inbox.label}>
              <label>
                <input
                  type="radio"
                  name="receive-mode"
                  checked={
                    receiveMode === 'single' && receiveInbox === inbox.label
                  }
                  disabled={busy}
                  onChange={() => void signAndRoute('single', inbox)}
                />{' '}
                {inbox.fullName}
              </label>
              <Text tone={textTone.mute}>
                {inbox.status}
                {inbox.createdAt ? ` · ${inbox.createdAt}` : ''}
                {(() => {
                  const counts = summaries[inbox.label]
                  if (!counts) return ''
                  return ` · pending ${counts.pending} · in progress ${counts.in_progress} · done ${counts.done} · expired ${counts.expired}`
                })()}
              </Text>
            </Card>
          ))
        )}
      </Stack>
    </Page>
  )
}

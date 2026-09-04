import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  generateInboxQR,
  getInboxFeedSummary,
  inboxCreateMessage,
  inboxRoutingMessage,
  listInboxes,
  setInboxActive,
  setInboxRouting,
  type EleadInbox,
  type InboxFeedCounts,
  type InboxList,
  type InboxRegistryStatus,
} from '@/shared/identity/allocateIdentity'
import { Page } from '@/shared/layout/Page/Page'
import { connectConsoleWallet } from '@/pages/ProviderAuthPage'
import { useProviderStudio } from '@/shared/provider/useProviderStudio'
import { formatUnknownError } from '@/shared/lib/errors'
import { Button } from '@/shared/ui/Button/Button'
import { Card } from '@/shared/ui/Card/Card'
import { Cluster } from '@/shared/ui/Cluster/Cluster'
import { Eyebrow } from '@/shared/ui/Eyebrow/Eyebrow'
import { Heading } from '@/shared/ui/Heading/Heading'
import { QrCode } from '@/shared/ui/QrCode/QrCode'
import { Stack } from '@/shared/ui/Stack/Stack'
import { stackGap } from '@/shared/ui/Stack/stackGap'
import { Text } from '@/shared/ui/Text/Text'
import { textSize, textTone } from '@/shared/ui/Text/textTokens'
import { actionVariant } from '@/shared/ui/action/action'
import styles from '@/ProviderStudio.module.css'

function nextInboxLabel(rows: EleadInbox[]): string {
  const taken = new Set(rows.map((row) => row.label.toLowerCase()))
  let n = 1
  while (taken.has(`inbox${n}`)) {
    n += 1
  }
  return `inbox${n}`
}

export function InboxPage() {
  const { account, wallet } = useProviderStudio()
  const domain = account.domain
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

  const inboxes = list?.inboxes || []
  const inboxName = useMemo(() => nextInboxLabel(inboxes), [inboxes])

  const loadSummaries = useCallback(
    async (rows: EleadInbox[]) => {
      if (!domain) return
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
    },
    [domain],
  )

  const refresh = useCallback(async () => {
    if (!domain) return
    const next = await listInboxes(domain)
    setList(next)
    await loadSummaries(next.inboxes || [])
  }, [domain, loadSummaries])

  useEffect(() => {
    if (!domain) return
    let cancelled = false
    listInboxes(domain)
      .then(async (next) => {
        if (cancelled) return
        setList(next)
        await loadSummaries(next.inboxes || [])
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(formatUnknownError(cause))
        }
      })
    return () => {
      cancelled = true
    }
  }, [domain, loadSummaries])

  if (!domain) {
    throw new Error('Inbox cannot render before a domain is chosen.')
  }

  async function withSpWallet() {
    const session = await connectConsoleWallet()
    if (wallet && session.address.toLowerCase() !== wallet.toLowerCase()) {
      throw new Error(
        `MetaMask is ${session.address}, console session is ${wallet}. Switch account.`,
      )
    }
    return session
  }

  async function signAndCreate() {
    setError(undefined)
    setIssued(null)
    const label = inboxName
    setBusy(true)
    setStatus('Connecting wallet…')
    try {
      if (!domain) throw new Error('No domain in session.')
      const session = await withSpWallet()
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
      if (!domain) throw new Error('No domain in session.')
      const session = await withSpWallet()
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

  async function signAndToggle(inbox: EleadInbox) {
    const nextStatus: InboxRegistryStatus =
      inbox.status === 'inactive' ? 'active' : 'inactive'
    setError(undefined)
    setBusy(true)
    setStatus('Connecting wallet…')
    try {
      if (!domain) throw new Error('No domain in session.')
      const session = await withSpWallet()
      setStatus('Sign inbox status in MetaMask…')
      const timestamp = Date.now()
      const signature = await session.signer.signMessage(
        inboxCreateMessage(domain, inbox.label, timestamp),
      )
      setStatus('Writing inboxList…')
      const next = await setInboxActive({
        domain,
        inboxName: inbox.label,
        status: nextStatus,
        timestamp,
        signature,
      })
      setList(next)
      setStatus(`${inbox.fullName} is ${nextStatus}.`)
    } catch (cause: unknown) {
      setError(formatUnknownError(cause))
      setStatus(undefined)
    } finally {
      setBusy(false)
    }
  }

  async function onRefresh() {
    setError(undefined)
    setBusy(true)
    try {
      await refresh()
      setStatus('Swarm counts updated.')
    } catch (cause: unknown) {
      setError(formatUnknownError(cause))
    } finally {
      setBusy(false)
    }
  }

  const receiveMode = list?.receiveMode || 'single'
  const receiveInbox = list?.receiveInbox || null
  const loading = list === null && !error

  return (
    <Page>
      <div className={styles.split}>
        <section className={styles.pane}>
          <Stack gap={stackGap.sm}>
            <Eyebrow>Studio</Eyebrow>
            <Heading level={1}>{domain}.global</Heading>
          </Stack>
          <div className={styles.row}>
            <Heading level={2}>Inboxes</Heading>
            <Button
              type="button"
              variant={actionVariant.secondary}
              disabled={busy}
              onClick={() => void onRefresh()}
            >
              Refresh
            </Button>
          </div>
          {error ? <Text tone={textTone.mute}>{error}</Text> : null}
          {loading ? (
            <Text tone={textTone.mute}>Loading…</Text>
          ) : inboxes.length === 0 ? (
            <Text tone={textTone.mute}>Oops, no inboxes yet.</Text>
          ) : (
            inboxes.map((inbox) => {
              const counts = summaries[inbox.label]
              const registry = inbox.status === 'inactive' ? 'inactive' : 'active'
              const receiving =
                receiveMode === 'single' && receiveInbox === inbox.label
              return (
                <Card key={inbox.label}>
                  <div className={styles.row}>
                    <Heading level={3}>{inbox.fullName}</Heading>
                    <span className={styles.mark}>{registry}</span>
                  </div>
                  <Text tone={textTone.mute}>
                    {counts
                      ? `pending ${counts.pending} · in progress ${counts.in_progress} · done ${counts.done} · expired ${counts.expired}`
                      : 'no Swarm summary'}
                    {receiving ? ' · receiving leads' : ''}
                  </Text>
                  <Cluster>
                    <Button
                      type="button"
                      variant={actionVariant.secondary}
                      disabled={busy}
                      onClick={() => void signAndToggle(inbox)}
                    >
                      Set {registry === 'active' ? 'inactive' : 'active'}
                    </Button>
                    <Button
                      type="button"
                      variant={actionVariant.secondary}
                      disabled={busy}
                      onClick={() => void signAndRoute('single', inbox)}
                    >
                      Receive here
                    </Button>
                  </Cluster>
                </Card>
              )
            })
          )}
          {inboxes.length > 0 ? (
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
          ) : null}
        </section>

        <section className={`${styles.pane} ${styles.create}`}>
          <Card>
            <Stack gap={stackGap.md}>
              <Heading level={2}>Create inbox</Heading>
              <Text size={textSize.lg} tone={textTone.mute}>
                Next in line is assigned automatically.
              </Text>
              <p className={styles.preview}>
                {inboxName}.{domain}.global
              </p>
              {status ? <Text>{status}</Text> : null}
              <Cluster>
                <Button
                  type="button"
                  disabled={busy}
                  onClick={() => void signAndCreate()}
                >
                  {busy ? 'Working…' : 'Create inbox QR'}
                </Button>
              </Cluster>
              {issued ? (
                <Stack gap={stackGap.sm}>
                  <Text>{issued.fullName}</Text>
                  <QrCode
                    value={issued.url}
                    label={`Install ${issued.fullName}`}
                  />
                </Stack>
              ) : null}
            </Stack>
          </Card>
        </section>
      </div>
    </Page>
  )
}

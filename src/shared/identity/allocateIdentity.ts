import { env } from '@/shared/lib/env'
import { formatUnknownError } from '@/shared/lib/errors'
import type { EleadIdentity } from '@/shared/identity/types'

export type CreatedLead = {
  domain: string
  label: string
  status: string
  storeStatus: string
  createdAt: string
  fullName: string
  swarmInbox?: string | null
  swarmUpdatedAt?: string | null
}

const identityKind = {
  lead: 'lead',
  inbox: 'inbox',
} as const

export type IdentityKind = (typeof identityKind)[keyof typeof identityKind]

function apiBase(): string {
  return env.apiUrl.replace(/\/$/, '')
}

async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  })
  const text = await res.text()
  let data: unknown = {}
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = { raw: text }
  }
  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data
        ? formatUnknownError((data as { error: unknown }).error)
        : text || `HTTP ${res.status}`
    throw new Error(message || `HTTP ${res.status}`)
  }
  return data as T
}

/**
 * Inbox identity for the console. Still local until inbox install is wired.
 */
export async function allocateIdentity(
  kind: IdentityKind = identityKind.lead,
): Promise<EleadIdentity> {
  const token = crypto.randomUUID()
  const short = token.slice(0, 8)

  if (short.length === 0) {
    throw new Error('Could not allot a private line. Reload and try again.')
  }

  const ensName = `${kind}-${short}.elead.eth`
  const activationUrl = `https://arnacon.app/activate?ens=${encodeURIComponent(ensName)}`

  return { ensName, activationUrl }
}

export async function allocateLead(domain: string): Promise<EleadIdentity> {
  const result = await api<{ url: string; label: string; domain: string }>(
    '/generateLeadQR',
    {
      method: 'POST',
      body: JSON.stringify({ domain }),
    },
  )

  return {
    ensName: `${result.label}.${result.domain}.global`,
    activationUrl: result.url,
  }
}

export async function linkDomain(
  domain: string,
  spAddress: string,
  extra?: { secondLevelInteractor?: string; semaphoreInteractor?: string },
): Promise<void> {
  await api('/linkDomain', {
    method: 'POST',
    body: JSON.stringify({ domain, spAddress, ...extra }),
  })
}

export async function ensureSemaphore(
  domain: string,
  secondLevelInteractor: string,
): Promise<{ semaphoreInteractor: string; needsGrant: boolean }> {
  return api('/ensureSemaphore', {
    method: 'POST',
    body: JSON.stringify({ domain, secondLevelInteractor }),
  })
}

export type GroupMembersResponse = {
  commitments: string[]
  scope: string
  groupId?: string
  merkleTreeRoot?: string
  memberCount?: string
  domain?: string
}

export async function getGroupMembers(query: {
  label?: string
  domain?: string
}): Promise<GroupMembersResponse> {
  const params = new URLSearchParams()
  if (query.label) params.set('label', query.label)
  if (query.domain) params.set('domain', query.domain)
  return api(`/group-members?${params.toString()}`)
}

export type ActivationProof = {
  merkleTreeDepth: number
  merkleTreeRoot: string
  nullifier: string
  message: string
  scope: string
  points: string[]
}

export type ActivateResponse = {
  label: string
  owner: string
  name: string
  domain?: string
  transactionHash?: string
  clientUrl?: string
}

export async function activateWithProof(body: {
  proof: ActivationProof
  label: string
  web3identity?: string
  owner?: string
  domain?: string
}): Promise<ActivateResponse> {
  return api('/activateWithProof', {
    method: 'POST',
    body: JSON.stringify({ action: 'activateWithProof', ...body }),
  })
}

export async function fetchLinkedDomain(domain: string): Promise<{
  domain: string
  spAddress: string
  semaphoreInteractor?: string | null
  secondLevelInteractor?: string | null
} | null> {
  const result = await api<{
    domains: {
      domain: string
      spAddress: string
      semaphoreInteractor?: string | null
      secondLevelInteractor?: string | null
    }[]
  }>(`/domains?domain=${encodeURIComponent(domain)}`)
  return result.domains.find((row) => row.domain === domain) || result.domains[0] || null
}

export async function listLinkedDomains(sp?: string): Promise<string[]> {
  const query = sp ? `?sp=${encodeURIComponent(sp)}` : ''
  const result = await api<{ domains: { domain: string }[] }>(`/domains${query}`)
  return result.domains.map((row) => row.domain)
}

export async function generateInboxQR(body: {
  domain: string
  inboxName: string
  timestamp: number
  signature: string
}): Promise<{ url: string; label: string; domain: string; fullName: string }> {
  return api('/generateInboxQR', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export type InboxRegistryStatus = 'active' | 'inactive'

export type EleadInbox = {
  label: string
  fullName: string
  status: InboxRegistryStatus
  createdAt?: string
}

export type InboxList = {
  domain: string
  receiveMode: 'single' | 'group'
  receiveInbox: string | null
  inboxes: EleadInbox[]
}

export async function listInboxes(domain: string): Promise<InboxList> {
  return api(`/inboxes?domain=${encodeURIComponent(domain)}`)
}

export async function setInboxActive(body: {
  domain: string
  inboxName: string
  status: InboxRegistryStatus
  timestamp: number
  signature: string
}): Promise<InboxList> {
  return api('/setInboxActive', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function setInboxRouting(body: {
  domain: string
  mode: 'single' | 'group'
  inboxName?: string
  timestamp: number
  signature: string
}): Promise<InboxList> {
  return api('/setInboxRouting', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function inboxCreateMessage(
  domain: string,
  inboxName: string,
  timestamp: number,
): string {
  return `elead-inbox\n${domain}\n${inboxName}\n${timestamp}`
}

export function inboxRoutingMessage(
  domain: string,
  inboxName: string,
  timestamp: number,
): string {
  return `elead-inbox-routing\n${domain}\n${inboxName}\n${timestamp}`
}

export function inboxFeedMessage(
  domain: string,
  inboxLabel: string,
  timestamp: number,
): string {
  return `aegis-inbox-feed\n${domain}\n${inboxLabel}\n${timestamp}`
}

export type InboxFeedCounts = {
  pending: number
  in_progress: number
  done: number
  expired: number
}

export type InboxFeedCase = {
  status: string
  updatedAt: string
}

export type InboxFeedLead = {
  domain: string
  inbox: string
  fullName: string
  lead: string
  status: string | null
  updatedAt: string | null
  found: boolean
}

export type InboxFeedSummary = {
  domain: string
  inbox: string
  fullName: string
  updatedAt: string
  counts: InboxFeedCounts
}

export type InboxFeedRow = {
  label: string
  fullName: string
  updatedAt?: string
  counts: InboxFeedCounts
  cases: Record<string, InboxFeedCase>
  error?: string
}

export async function getInboxFeedLead(query: {
  domain: string
  inbox: string
  lead: string
}): Promise<InboxFeedLead> {
  const params = new URLSearchParams({
    domain: query.domain,
    inbox: query.inbox,
    lead: query.lead,
  })
  return api(`/inboxFeed/lead?${params.toString()}`)
}

export async function getInboxFeedSummary(query: {
  domain: string
  inbox: string
}): Promise<InboxFeedSummary> {
  const params = new URLSearchParams({
    domain: query.domain,
    inbox: query.inbox,
  })
  return api(`/inboxFeed/summary?${params.toString()}`)
}

export async function listInboxFeeds(domain: string): Promise<{
  domain: string
  inboxes: InboxFeedRow[]
}> {
  return api(`/inboxFeeds?domain=${encodeURIComponent(domain)}`)
}

export async function listCreatedLeads(query: {
  domain?: string
  sp?: string
}): Promise<CreatedLead[]> {
  const params = new URLSearchParams()
  if (query.domain) params.set('domain', query.domain)
  if (query.sp) params.set('sp', query.sp)
  const result = await api<{ leads: CreatedLead[] }>(
    `/fetchLeads?${params.toString()}`,
  )
  if (!query.domain) {
    return result.leads
  }
  let feeds: InboxFeedRow[] = []
  try {
    const packed = await listInboxFeeds(query.domain)
    feeds = packed.inboxes || []
  } catch {
    feeds = []
  }
  const byLead = new Map<string, { inbox: string; status: string; updatedAt: string }>()
  for (const inbox of feeds) {
    for (const [lead, row] of Object.entries(inbox.cases || {})) {
      byLead.set(lead, {
        inbox: inbox.label,
        status: row.status,
        updatedAt: row.updatedAt,
      })
    }
  }
  return result.leads.map((lead) => {
    const hit = byLead.get(lead.label)
    if (!hit) {
      return { ...lead, swarmInbox: null, swarmUpdatedAt: null }
    }
    return {
      ...lead,
      status: hit.status || lead.status,
      swarmInbox: hit.inbox,
      swarmUpdatedAt: hit.updatedAt,
    }
  })
}

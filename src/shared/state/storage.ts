import { seedProfile, seedRequests } from '@/shared/data/seed'
import type { ProviderProfile, ServiceRequest } from '@/shared/data/types'
import { requestStatus } from '@/shared/data/types'
import { isCategoryId } from '@/shared/data/catalog'

export const STORAGE_KEY = 'elead.app-state.v1'

export type PersistedState = {
  requests: ServiceRequest[]
  profile: ProviderProfile
}

const statusValues = new Set<string>(Object.values(requestStatus))

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseRequest(value: unknown, index: number): ServiceRequest {
  if (!isRecord(value)) {
    throw new Error(`Request at index ${index} is not an object.`)
  }

  const categoryId = value.categoryId
  const status = value.status

  if (typeof value.id !== 'string' || value.id.trim() === '') {
    throw new Error(`Request at index ${index} is missing id.`)
  }
  if (typeof categoryId !== 'string' || !isCategoryId(categoryId)) {
    throw new Error(`Request ${value.id} has an unknown category.`)
  }
  if (typeof status !== 'string' || !statusValues.has(status)) {
    throw new Error(`Request ${value.id} has an invalid status.`)
  }
  if (typeof value.title !== 'string' || typeof value.details !== 'string') {
    throw new Error(`Request ${value.id} is missing title or details.`)
  }
  if (typeof value.location !== 'string' || typeof value.budget !== 'string') {
    throw new Error(`Request ${value.id} is missing location or budget.`)
  }
  if (typeof value.createdAt !== 'string' || typeof value.clientName !== 'string') {
    throw new Error(`Request ${value.id} is missing createdAt or clientName.`)
  }

  return {
    id: value.id,
    categoryId,
    title: value.title,
    details: value.details,
    location: value.location,
    budget: value.budget,
    status: status as ServiceRequest['status'],
    createdAt: value.createdAt,
    clientName: value.clientName,
  }
}

function parseProfile(value: unknown): ProviderProfile {
  if (!isRecord(value)) {
    throw new Error('Profile is not an object.')
  }

  const trade = value.trade
  if (typeof trade !== 'string' || !isCategoryId(trade)) {
    throw new Error('Profile has an unknown trade.')
  }
  if (typeof value.name !== 'string' || typeof value.city !== 'string') {
    throw new Error('Profile is missing name or city.')
  }
  if (typeof value.bio !== 'string') {
    throw new Error('Profile is missing bio.')
  }

  return {
    name: value.name,
    trade,
    city: value.city,
    bio: value.bio,
  }
}

export function parseState(raw: string): PersistedState {
  const parsed: unknown = JSON.parse(raw)

  if (!isRecord(parsed) || !Array.isArray(parsed.requests)) {
    throw new Error('State must include a requests array.')
  }

  return {
    requests: parsed.requests.map(parseRequest),
    profile: parseProfile(parsed.profile),
  }
}

export function loadState(): PersistedState {
  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (raw === null) {
    return {
      requests: [...seedRequests],
      profile: { ...seedProfile },
    }
  }

  try {
    return parseState(raw)
  } catch (error) {
    throw new Error(
      `Corrupt app state in localStorage (${STORAGE_KEY}). Clear this key and reload.`,
      { cause: error },
    )
  }
}

export function saveState(state: PersistedState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

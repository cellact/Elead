import type { CategoryId } from '@/shared/data/catalog'

export const requestStatus = {
  open: 'open',
  matched: 'matched',
  closed: 'closed',
} as const

export type RequestStatus = (typeof requestStatus)[keyof typeof requestStatus]

export type ServiceRequest = {
  id: string
  categoryId: CategoryId
  title: string
  details: string
  location: string
  budget: string
  status: RequestStatus
  createdAt: string
  clientName: string
}

export type NewRequestInput = {
  categoryId: string
  title: string
  details: string
  location: string
  budget: string
}

export type ProviderProfile = {
  name: string
  trade: CategoryId
  city: string
  bio: string
}

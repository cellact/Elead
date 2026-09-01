import { createContext } from 'react'
import type {
  NewRequestInput,
  ProviderProfile,
  RequestStatus,
  ServiceRequest,
} from '@/shared/data/types'

export type AppStateValue = {
  requests: readonly ServiceRequest[]
  profile: ProviderProfile
  addRequest: (input: NewRequestInput) => ServiceRequest
  setRequestStatus: (requestId: string, status: RequestStatus) => void
  saveProfile: (input: ProviderProfile) => void
}

export const AppStateContext = createContext<AppStateValue | null>(null)

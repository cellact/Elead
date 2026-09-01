import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { getCategory, isCategoryId } from '@/shared/data/catalog'
import type {
  NewRequestInput,
  ProviderProfile,
  RequestStatus,
  ServiceRequest,
} from '@/shared/data/types'
import { createId } from '@/shared/lib/id'
import {
  AppStateContext,
  type AppStateValue,
} from '@/shared/state/app-state-context'
import { loadState, saveState } from '@/shared/state/storage'
import { validateNewRequest, validateProfile } from '@/shared/state/validate'

function persist(next: { requests: ServiceRequest[]; profile: ProviderProfile }) {
  saveState(next)
  return next
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(() => loadState())

  const addRequest = useCallback((input: NewRequestInput): ServiceRequest => {
    const valid = validateNewRequest(input)

    if (!isCategoryId(valid.categoryId)) {
      throw new Error(`Unknown category: ${valid.categoryId}`)
    }

    const request: ServiceRequest = {
      id: createId('req'),
      categoryId: valid.categoryId,
      title: valid.title,
      details: valid.details,
      location: valid.location,
      budget: valid.budget,
      status: 'open',
      createdAt: new Date().toISOString(),
      clientName: 'You',
    }

    setState((current) =>
      persist({
        requests: [request, ...current.requests],
        profile: current.profile,
      }),
    )

    return request
  }, [])

  const setRequestStatus = useCallback(
    (requestId: string, status: RequestStatus) => {
      setState((current) => {
        const exists = current.requests.some((request) => request.id === requestId)

        if (!exists) {
          throw new Error(`No request found for id: ${requestId}`)
        }

        return persist({
          requests: current.requests.map((request) =>
            request.id === requestId ? { ...request, status } : request,
          ),
          profile: current.profile,
        })
      })
    },
    [],
  )

  const saveProfile = useCallback((input: ProviderProfile) => {
    const profile = validateProfile(input)
    getCategory(profile.trade)

    setState((current) => persist({ requests: current.requests, profile }))
  }, [])

  const value = useMemo<AppStateValue>(
    () => ({
      requests: state.requests,
      profile: state.profile,
      addRequest,
      setRequestStatus,
      saveProfile,
    }),
    [state, addRequest, setRequestStatus, saveProfile],
  )

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  )
}

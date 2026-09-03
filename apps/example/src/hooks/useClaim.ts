import { useCallback, useEffect, useRef, useState } from 'react'
import {
  activateWithProof,
  getGroupMembers,
  type ActivateResponse,
} from '@/shared/identity/allocateIdentity'
import { generateActivationProof } from '@/shared/identity/semaphore'

type ClaimErrorKind = 'already_activated' | 'generic'

type ClaimState = {
  status: 'idle' | 'loading' | 'success' | 'error'
  step: number
  data: ActivateResponse | null
  error: string | null
  errorKind: ClaimErrorKind | null
}

const STEP_INTERVAL_MS = 8000

function errorBlob(raw: unknown): string {
  if (raw instanceof Error) {
    return `${raw.name} ${raw.message}`.toLowerCase()
  }
  if (typeof raw === 'string') return raw.toLowerCase()
  try {
    return JSON.stringify(raw ?? '').toLowerCase()
  } catch {
    return String(raw ?? '').toLowerCase()
  }
}

function isAlreadyActivatedError(raw: unknown): boolean {
  const text = errorBlob(raw)
  return (
    text.includes('already_activated') ||
    text.includes('youareusingthesamenullifiertwice') ||
    text.includes('same nullifier') ||
    text.includes('0x208b15e8') ||
    text.includes('208b15e8')
  )
}

export function useClaim() {
  const [state, setState] = useState<ClaimState>({
    status: 'idle',
    step: 0,
    data: null,
    error: null,
    errorKind: null,
  })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearStepInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => clearStepInterval, [clearStepInterval])

  const claim = useCallback(
    async (secret: string, label: string, web3identity: string, owner?: string) => {
      setState({
        status: 'loading',
        step: 1,
        data: null,
        error: null,
        errorKind: null,
      })
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.step < 3) return { ...prev, step: prev.step + 1 }
          return prev
        })
      }, STEP_INTERVAL_MS)

      try {
        const { commitments, scope, merkleTreeRoot } = await getGroupMembers({
          label,
        })
        const proof = await generateActivationProof(
          secret,
          label,
          commitments,
          scope,
          merkleTreeRoot,
        )
        const data = await activateWithProof({
          proof,
          label,
          web3identity,
          owner,
        })
        clearStepInterval()
        setState({
          status: 'success',
          step: 4,
          data,
          error: null,
          errorKind: null,
        })
      } catch (err) {
        clearStepInterval()
        const message = err instanceof Error ? err.message : 'Claim failed'
        const already = isAlreadyActivatedError(err) || isAlreadyActivatedError(message)
        setState({
          status: 'error',
          step: 0,
          data: null,
          error: message,
          errorKind: already ? 'already_activated' : 'generic',
        })
      }
    },
    [clearStepInterval],
  )

  const reset = useCallback(() => {
    clearStepInterval()
    setState({
      status: 'idle',
      step: 0,
      data: null,
      error: null,
      errorKind: null,
    })
  }, [clearStepInterval])

  return { ...state, claim, reset }
}

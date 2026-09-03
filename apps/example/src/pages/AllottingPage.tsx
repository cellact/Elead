import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { routes } from '@/config/routes'
import { allocateLead } from '@/shared/identity/allocateIdentity'
import { Page } from '@/shared/layout/Page/Page'
import { minVisibleMs, waitRemaining } from '@/shared/lib/waitRemaining'
import { RainbowText } from '@/shared/ui/RainbowText/RainbowText'
import { WorkingStage } from '@/shared/ui/WorkingStage/WorkingStage'

function readDomain(state: unknown): string | null {
  if (state == null || typeof state !== 'object' || !('domain' in state)) {
    return null
  }
  const domain = state.domain
  if (typeof domain !== 'string') {
    return null
  }
  const next = domain.trim().toLowerCase().replace(/\.global$/, '')
  return next || null
}

export function AllottingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const domain = readDomain(location.state)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!domain) return
    let cancelled = false
    const startedAt = Date.now()

    Promise.all([allocateLead(domain), waitRemaining(startedAt, minVisibleMs)])
      .then(([identity]) => {
        if (!cancelled) {
          navigate(routes.contact, { replace: true, state: { identity } })
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause
              : new Error('Could not create a private line.', { cause }),
          )
        }
      })

    return () => {
      cancelled = true
    }
  }, [domain, navigate])

  if (!domain) {
    return <Navigate to={routes.home} replace />
  }

  if (error) {
    throw error
  }

  return (
    <Page width="narrow">
      <WorkingStage
        label="Creating a private line"
        eyebrow="01 / Access"
        heading={
          <>
            Creating a <RainbowText>private line</RainbowText>.
          </>
        }
        body={`Issuing an identity under ${domain}.global. Next you will get a QR code to scan in Arnacon.`}
      />
    </Page>
  )
}

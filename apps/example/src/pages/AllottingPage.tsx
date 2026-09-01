import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { routes } from '@/config/routes'
import { allocateIdentity } from '@/shared/identity/allocateIdentity'
import { Page } from '@/shared/layout/Page/Page'
import { minVisibleMs, waitRemaining } from '@/shared/lib/waitRemaining'
import { RainbowText } from '@/shared/ui/RainbowText/RainbowText'
import { WorkingStage } from '@/shared/ui/WorkingStage/WorkingStage'

export function AllottingPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    const startedAt = Date.now()

    Promise.all([allocateIdentity(), waitRemaining(startedAt, minVisibleMs)])
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
              : new Error('Could not allot a private line.', { cause }),
          )
        }
      })

    return () => {
      cancelled = true
    }
  }, [navigate])

  if (error) {
    throw error
  }

  return (
    <Page width="narrow">
      <WorkingStage
        label="Allotting a private line"
        eyebrow="01 / Access"
        heading={
          <>
            Allotting a <RainbowText>private line</RainbowText>.
          </>
        }
        body="We are preparing an Elead identity for this lead. Next you will get a QR code to scan in Arnacon. Nothing personal is collected."
      />
    </Page>
  )
}

import { Navigate, useLocation } from 'react-router-dom'
import { routes } from '@/config/routes'
import { FindDomainPage } from '@/pages/FindDomainPage'
import { LandingPage } from '@/pages/LandingPage'
import { ProviderAuthPage } from '@/pages/ProviderAuthPage'
import { ProviderSetupPage } from '@/pages/ProviderSetupPage'
import { ProviderLayout } from '@/ProviderLayout'
import { isSetupComplete } from '@/shared/provider/types'
import { useProviderStudio } from '@/shared/provider/useProviderStudio'
import { Button } from '@/shared/ui/Button/Button'
import { LinkButton } from '@/shared/ui/LinkButton/LinkButton'
import { actionVariant } from '@/shared/ui/action/action'
import styles from '@/ProviderStudio.module.css'

export function ConsoleDisconnect() {
  const { isSignedIn, signOut } = useProviderStudio()
  const location = useLocation()
  const atHome = location.pathname === routes.home
  if (atHome && !isSignedIn) return null
  return (
    <div className={styles.disconnect}>
      {atHome ? null : (
        <LinkButton
          to={routes.home}
          variant={actionVariant.secondary}
          className={styles.disconnectBtn}
        >
          <svg
            className={styles.disconnectIcon}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to home
        </LinkButton>
      )}
      {isSignedIn ? (
        <Button
          variant={actionVariant.secondary}
          className={styles.disconnectBtn}
          onClick={signOut}
        >
          <svg
            className={styles.disconnectIcon}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Disconnect
        </Button>
      ) : null}
    </div>
  )
}

export function LandingRoute() {
  return <LandingPage />
}

export function ConnectRoute() {
  const { isSignedIn, account } = useProviderStudio()
  if (isSignedIn && isSetupComplete(account)) {
    return <Navigate to={routes.studio} replace />
  }
  if (isSignedIn) {
    return <Navigate to={routes.find} replace />
  }
  return <ProviderAuthPage />
}

export function FindRoute() {
  const { isSignedIn } = useProviderStudio()
  if (!isSignedIn) {
    return <Navigate to={routes.connect} replace />
  }
  return <FindDomainPage />
}

export function SetupRoute() {
  const { isSignedIn, account } = useProviderStudio()
  if (!isSignedIn) {
    return <Navigate to={routes.connect} replace />
  }
  if (isSetupComplete(account)) {
    return <Navigate to={routes.studio} replace />
  }
  return <ProviderSetupPage />
}

export function StudioRoute() {
  const { isSignedIn, account } = useProviderStudio()
  if (!isSignedIn) {
    return <Navigate to={routes.connect} replace />
  }
  if (!isSetupComplete(account)) {
    return <Navigate to={routes.find} replace />
  }
  return <ProviderLayout />
}

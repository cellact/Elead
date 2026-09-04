import { Route, Routes } from 'react-router-dom'
import {
  ConnectRoute,
  ConsoleDisconnect,
  FindRoute,
  LandingRoute,
  SetupRoute,
  StudioRoute,
} from '@/ProviderGate'
import { InboxPage } from '@/pages/InboxPage'
import { ManagePage } from '@/pages/ManagePage'
import { NotFoundPage } from '@/shared/app/NotFoundPage'
import { ProviderStudioProvider } from '@/shared/provider/ProviderStudioProvider'

export function AppRouter() {
  return (
    <ProviderStudioProvider>
      <ConsoleDisconnect />
      <Routes>
        <Route index element={<LandingRoute />} />
        <Route path="connect" element={<ConnectRoute />} />
        <Route path="find" element={<FindRoute />} />
        <Route path="setup" element={<SetupRoute />} />
        <Route element={<StudioRoute />}>
          <Route path="studio" element={<InboxPage />} />
          <Route path="manage" element={<ManagePage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ProviderStudioProvider>
  )
}

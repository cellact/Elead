import { Route, Routes } from 'react-router-dom'
import { ProviderGate } from '@/ProviderGate'
import { InboxPage } from '@/pages/InboxPage'
import { ManagePage } from '@/pages/ManagePage'
import { OverviewPage } from '@/pages/OverviewPage'
import { NotFoundPage } from '@/shared/app/NotFoundPage'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<ProviderGate />}>
        <Route index element={<OverviewPage />} />
        <Route path="manage" element={<ManagePage />} />
        <Route path="inbox" element={<InboxPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

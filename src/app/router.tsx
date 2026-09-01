import { Route, Routes } from 'react-router-dom'
import { NotFoundPage } from '@/app/NotFoundPage'
import { MarketingLayout } from '@/portals/marketing/MarketingLayout'
import { HomePage } from '@/portals/marketing/pages/HomePage'
import { ProviderGate } from '@/portals/provider/ProviderGate'
import { ManagePage } from '@/portals/provider/pages/ManagePage'
import { OverviewPage } from '@/portals/provider/pages/OverviewPage'
import { UserLayout } from '@/portals/user/UserLayout'
import { ContactPage } from '@/portals/user/pages/ContactPage'
import { UserHomePage } from '@/portals/user/pages/UserHomePage'
import { routes } from '@/shared/config/routes'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MarketingLayout />}>
        <Route path={routes.home} element={<HomePage />} />
      </Route>
      <Route path={routes.user.root} element={<UserLayout />}>
        <Route index element={<UserHomePage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path={routes.provider.root} element={<ProviderGate />}>
        <Route index element={<OverviewPage />} />
        <Route path="manage" element={<ManagePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route element={<MarketingLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

import { Route, Routes } from 'react-router-dom'
import { NotFoundPage } from '@/app/NotFoundPage'
import { MarketingLayout } from '@/portals/marketing/MarketingLayout'
import { HomePage } from '@/portals/marketing/pages/HomePage'
import { ProviderLayout } from '@/portals/provider/ProviderLayout'
import { LeadsPage } from '@/portals/provider/pages/LeadsPage'
import { ProfilePage } from '@/portals/provider/pages/ProfilePage'
import { ProviderHomePage } from '@/portals/provider/pages/ProviderHomePage'
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
      <Route path={routes.provider.root} element={<ProviderLayout />}>
        <Route index element={<ProviderHomePage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route element={<MarketingLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

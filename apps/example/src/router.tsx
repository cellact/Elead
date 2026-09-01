import { Route, Routes } from 'react-router-dom'
import { UserLayout } from '@/UserLayout'
import { AllottingPage } from '@/pages/AllottingPage'
import { ContactPage } from '@/pages/ContactPage'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/shared/app/NotFoundPage'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<UserLayout />}>
        <Route index element={<HomePage />} />
        <Route path="allotting" element={<AllottingPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

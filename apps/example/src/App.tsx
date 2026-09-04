import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from '@/router'
import { ErrorBoundary } from '@/shared/app/ErrorBoundary'

const routerBasename =
  import.meta.env.BASE_URL.replace(/\/$/, '') || undefined

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename={routerBasename}>
        <AppRouter />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

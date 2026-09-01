import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from '@/router'
import { ErrorBoundary } from '@/shared/app/ErrorBoundary'

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

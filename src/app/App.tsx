import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from '@/app/router'
import { ErrorBoundary } from '@/app/ErrorBoundary'

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

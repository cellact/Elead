import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from '@/app/router'
import { ErrorBoundary } from '@/app/ErrorBoundary'
import { AppStateProvider } from '@/shared/state/AppState'

export function App() {
  return (
    <ErrorBoundary>
      <AppStateProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AppStateProvider>
    </ErrorBoundary>
  )
}

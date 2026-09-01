import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/App'
import { env } from '@/shared/lib/env'
import '@/styles/global.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root is missing from index.html.')
}

document.title = env.appName

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

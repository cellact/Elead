import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/App'
import { site } from '@/shared/config/site'
import '@/styles/global.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root is missing from index.html.')
}

document.title = site.name

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

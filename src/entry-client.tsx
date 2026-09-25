import { StartClient } from '@tanstack/react-start/client'
import { hydrateRoot, createRoot } from 'react-dom/client'
import { getRouter } from './router'

const router = getRouter()

const rootElement = document.getElementById('root')

if (rootElement && rootElement.innerHTML.trim().length > 0) {
  try {
    hydrateRoot(document, <StartClient router={router} />)
  } catch (err) {
    console.warn('Hydration warning, falling back to client render:', err)
    createRoot(rootElement).render(<StartClient router={router} />)
  }
} else if (rootElement) {
  createRoot(rootElement).render(<StartClient router={router} />)
} else {
  hydrateRoot(document, <StartClient router={router} />)
}



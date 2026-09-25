import { RouterProvider } from '@tanstack/react-router'
import { hydrateRoot, createRoot } from 'react-dom/client'
import { getRouter } from './router'

const router = getRouter()

const rootElement = document.getElementById('root')

if (rootElement && rootElement.innerHTML.trim().length > 0) {
  try {
    hydrateRoot(document, <RouterProvider router={router} />)
  } catch (err) {
    console.warn('Hydration warning, falling back to client render:', err)
    createRoot(rootElement).render(<RouterProvider router={router} />)
  }
} else if (rootElement) {
  createRoot(rootElement).render(<RouterProvider router={router} />)
} else {
  hydrateRoot(document, <RouterProvider router={router} />)
}




import { RouterProvider } from '@tanstack/react-router'
import { createRoot } from 'react-dom/client'
import { getRouter } from './router'
import ErrorBoundary from './components/ErrorBoundary'

// Global window error listener for unhandled exceptions
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('Global Error Intercepted:', event.error || event.message)
  })

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason)
  })
}

const router = getRouter()
const rootElement = document.getElementById('root')

if (rootElement) {
  createRoot(rootElement).render(
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  )
}






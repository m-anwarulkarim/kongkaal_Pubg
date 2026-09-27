import { createFileRoute } from '@tanstack/react-router'
import { AdminDashboard } from './admin'

export const Route = createFileRoute('/admin/$tab')({
  head: () => ({
    meta: [
      { title: 'Admin Portal | KongKaaL Gaming' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: AdminDashboard,
})

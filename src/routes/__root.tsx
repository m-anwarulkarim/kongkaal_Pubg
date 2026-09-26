import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, maximum-scale=5',
      },
      {
        title: 'KongKaaL Gaming - Bangladesh PUBG Mobile Tournament Platform',
      },
      {
        name: 'description',
        content: 'Play, Compete & Win PUBG Mobile Custom Tournaments in Bangladesh. Solo, Duo, Squad matches with instant bKash & Nagad cash prize payouts!',
      },
      {
        name: 'theme-color',
        content: '#07080b',
      },
    ],
    links: [
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'preconnect',
        href: 'https://kwdywkrfcvdogquimdyj.supabase.co',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'preload',
        href: '/kongkaal_hero.webp',
        as: 'image',
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

function NotFound() {
  return (
    <div className="min-h-screen bg-[#07080b] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-500 flex items-center justify-center mb-4 text-2xl font-bold">
        404
      </div>
      <h1 className="font-display text-2xl font-black text-white uppercase mb-2">Page Not Found</h1>
      <p className="text-xs text-gray-400 max-w-sm mb-6">The page you are looking for does not exist or has been moved.</p>
      <a href="/" className="px-5 py-2.5 rounded-xl bg-[#e50914] text-white font-bold text-xs no-underline hover:bg-red-600 transition-colors">
        Return to Home
      </a>
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased bg-[#07080b] text-gray-100 selection:bg-red-600/30 selection:text-red-200 min-h-screen">
        {children}
        <Toaster position="top-center" richColors theme="dark" />
        <Scripts />
      </body>
    </html>
  )
}

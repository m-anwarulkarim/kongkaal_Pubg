import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import BackgroundMusic from '@/components/BackgroundMusic'
import appCss from '../styles.css?url'

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://kongkaal.com/#website',
      'url': 'https://kongkaal.com/',
      'name': 'KongKaaL Gaming',
      'description': 'Bangladesh premier PUBG Mobile tournament platform with instant bKash & Nagad cash prize payouts.',
      'inLanguage': 'en-US',
      'publisher': {
        '@type': 'Organization',
        '@id': 'https://kongkaal.com/#organization',
        'name': 'KongKaaL Gaming',
        'url': 'https://kongkaal.com/',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://kongkaal.com/favicon.svg'
        }
      }
    },
    {
      '@type': 'Organization',
      '@id': 'https://kongkaal.com/#organization',
      'name': 'KongKaaL Gaming',
      'url': 'https://kongkaal.com/',
      'logo': 'https://kongkaal.com/favicon.svg'
    },
    {
      '@type': 'SportsEvent',
      'name': 'KongKaaL PUBG Mobile Championship Bangladesh',
      'description': 'Daily PUBG Mobile custom matches in Erangel, Miramar, and Sanhok for Solo, Duo, and Squad teams in Bangladesh.',
      'sport': 'eSports - PUBG Mobile',
      'location': {
        '@type': 'VirtualLocation',
        'url': 'https://kongkaal.com/'
      },
      'organizer': {
        '@type': 'Organization',
        'name': 'KongKaaL Gaming',
        'url': 'https://kongkaal.com/'
      }
    }
  ]
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5' },
      { title: 'KongKaaL Gaming - Bangladesh PUBG Mobile Tournament Platform' },
      { name: 'description', content: 'Play, Compete & Win PUBG Mobile Custom Tournaments in Bangladesh. Solo, Duo, Squad matches with instant bKash & Nagad cash prize payouts on KongKaaL Gaming!' },
      { name: 'keywords', content: 'KongKaaL, KongKaaL Gaming, PUBG Mobile Bangladesh, PUBG Tournament BD, PUBG Custom Room BD, Play PUBG Win Cash, bKash PUBG Tournament, Nagad Gaming BD, PUBG Mobile Esports BD, Slot Booking PUBG' },
      { name: 'author', content: 'KongKaaL Gaming' },
      { name: 'robots', content: 'index, follow' },
      { name: 'theme-color', content: '#07080b' },
      // Open Graph / Facebook
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'KongKaaL Gaming - Premier PUBG Mobile Tournament Platform in BD' },
      { property: 'og:description', content: 'Compete in daily PUBG Mobile Solo, Duo & Squad custom matches. Win cash prizes with instant bKash & Nagad withdrawal!' },
      { property: 'og:url', content: 'https://kongkaal.com/' },
      { property: 'og:site_name', content: 'KongKaaL Gaming' },
      { property: 'og:image', content: 'https://kongkaal.com/kongkaal_hero.webp' },
      { property: 'og:locale', content: 'en_US' },
      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:domain', content: 'kongkaal.com' },
      { name: 'twitter:url', content: 'https://kongkaal.com/' },
      { name: 'twitter:title', content: 'KongKaaL Gaming - PUBG Mobile Tournaments BD' },
      { name: 'twitter:description', content: 'Compete in daily PUBG Mobile matches & win cash prizes via bKash & Nagad.' },
      { name: 'twitter:image', content: 'https://kongkaal.com/kongkaal_hero.webp' },
    ],
    links: [
      { rel: 'canonical', href: 'https://kongkaal.com/' },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'shortcut icon', href: '/favicon.svg' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'preconnect', href: 'https://kwdywkrfcvdogquimdyj.supabase.co', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: appCss },
      { rel: 'preload', href: '/kongkaal_hero.webp', as: 'image' },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="font-sans antialiased bg-[#07080b] text-gray-100 selection:bg-red-600/30 selection:text-red-200 min-h-screen">
        {children}
        <BackgroundMusic />
        <Toaster position="top-center" richColors theme="dark" />
        <Scripts />
      </body>
    </html>
  )
}


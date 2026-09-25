import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
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
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'preload',
        href: '/kongkaal_hero.jpg',
        as: 'image',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-sans antialiased bg-[#07080b] text-gray-100 selection:bg-red-600/30 selection:text-red-200 min-h-screen">
      <HeadContent />
      {children}
      <Scripts />
    </div>
  )
}

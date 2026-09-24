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
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'PUBG Mobile Custom Tournament - Official BD Esports Arena',
      },
      {
        name: 'description',
        content: 'Join official PUBG Mobile Custom Tournament matches in Bangladesh. Solo, Duo, Squad modes available with guaranteed instant bKash & Nagad prize payouts!',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased bg-[#080b10] text-gray-100 selection:bg-amber-500/30 selection:text-amber-200">
        {children}
        <Scripts />
      </body>
    </html>
  )
}

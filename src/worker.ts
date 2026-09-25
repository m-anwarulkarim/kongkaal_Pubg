// Cloudflare Pages Worker entry for TanStack Start
// @ts-ignore
import server from '../dist/server/server.js'

export default {
  async fetch(request: Request, env: any, ctx: any) {
    try {
      const url = new URL(request.url)

      // 1. Static asset bypass if requested file has extension or is in /assets/
      if (env.ASSETS) {
        if (
          url.pathname.startsWith('/assets/') ||
          url.pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js|json|webp|woff2?|headers)$/i)
        ) {
          const assetRes = await env.ASSETS.fetch(request)
          if (assetRes.status !== 404) {
            return assetRes
          }
        }
      }

      // 2. Render HTML via TanStack Start SSR Server
      // @ts-ignore
      const response = await server.fetch(request, env, ctx)

      // 3. Fallback to /index.html asset if status is 404 or route is dynamic
      if ((!response || response.status === 404) && env.ASSETS) {
        const indexReq = new Request(new URL('/index.html', request.url), request)
        const fallback = await env.ASSETS.fetch(indexReq)
        if (fallback && fallback.status !== 404) return fallback
      }

      return response
    } catch (err: any) {
      if (env.ASSETS) {
        const indexReq = new Request(new URL('/index.html', request.url), request)
        const fallback = await env.ASSETS.fetch(indexReq)
        if (fallback && fallback.status !== 404) return fallback
      }
      return new Response(`KongKaaL Worker Error: ${err.message}`, { status: 500 })
    }
  },
}

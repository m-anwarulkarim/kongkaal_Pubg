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

      // 3. Fallback to asset if status is 404
      if (response.status === 404 && env.ASSETS) {
        const fallback = await env.ASSETS.fetch(request)
        if (fallback.status !== 404) return fallback
      }

      return response
    } catch (err: any) {
      if (env.ASSETS) {
        return env.ASSETS.fetch(request)
      }
      return new Response(`KongKaaL Worker Error: ${err.message}`, { status: 500 })
    }
  },
}

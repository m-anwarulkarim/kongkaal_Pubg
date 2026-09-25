// Cloudflare Pages Worker entry for TanStack Start
// @ts-ignore
import server from '../dist/server/server.js'

// Static file extensions that should NEVER go to SSR
const STATIC_EXT_RE = /\.(jpg|jpeg|png|gif|svg|ico|webp|avif|css|js|json|woff2?|ttf|otf|eot|mp4|webm|pdf|txt|xml|map)$/i

export default {
  async fetch(request: Request, env: any, ctx: any) {
    try {
      const url = new URL(request.url)
      const isStaticAsset =
        url.pathname.startsWith('/assets/') ||
        STATIC_EXT_RE.test(url.pathname)

      // 1. Static assets — serve from ASSETS binding, NEVER fall through to SSR
      if (isStaticAsset && env.ASSETS) {
        const assetRes = await env.ASSETS.fetch(request)
        // Return the asset response regardless (even 404).
        // This prevents SSR from returning HTML for image/css/js URLs.
        return assetRes
      }

      // If it's a static asset request but env.ASSETS is missing, return 404
      if (isStaticAsset) {
        return new Response('Not Found', { status: 404 })
      }

      // 2. Render HTML via TanStack Start SSR Server
      // @ts-ignore
      const response = await server.fetch(request, env, ctx)
      
      return response
    } catch (err: any) {
      console.error('Worker fetch error:', err)
      console.error(err.stack)
      if (env.ASSETS) {
        const indexReq = new Request(new URL('/index.html', request.url), request)
        const fallback = await env.ASSETS.fetch(indexReq)
        if (fallback && fallback.status !== 404) return fallback
      }
      return new Response(`KongKaaL Worker Error: ${err.message}`, { status: 500 })
    }
  },
}

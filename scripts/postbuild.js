import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const clientDir = path.resolve('dist/client')
const assetsDir = path.join(clientDir, 'assets')

console.log('🚀 Running Cloudflare Pages Post-Build Optimizer...')

// 1. Bundle src/worker.ts -> dist/client/_worker.js
try {
  console.log('📦 Bundling Cloudflare Pages Worker (_worker.js)...')
  execSync(
    'npx esbuild src/worker.ts --bundle --outfile=dist/client/_worker.js --format=esm --target=es2022 --platform=neutral --conditions=workerd,worker --main-fields=module,main --external:node:*',
    { stdio: 'inherit' }
  )
  console.log('✅ _worker.js successfully created!')
} catch (err) {
  console.error('⚠️ Warning: Failed to bundle _worker.js:', err)
}

// 2. Scan assets directory for CSS and JS bundles
let cssFile = ''
let jsFiles = []

if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir)
  cssFile = files.find((f) => f.endsWith('.css')) || ''
  
  jsFiles = files.filter((f) => {
    if (!f.endsWith('.js')) return false
    if (f.startsWith('rolldown-runtime') || f.startsWith('runtime')) return true
    if (f.startsWith('vendor-')) return true
    if (f.startsWith('routes-')) return true
    if (f.startsWith('index-')) return true
    return false
  })

  const getOrder = (name) => {
    if (name.startsWith('rolldown-runtime') || name.startsWith('runtime')) return 1
    if (name.startsWith('vendor-react')) return 2
    if (name.startsWith('vendor-')) return 3
    if (name.startsWith('routes-')) return 4
    if (name.startsWith('index-')) return 5
    return 6
  }
  jsFiles.sort((a, b) => getOrder(a) - getOrder(b))
}

const jsScriptTags = jsFiles.map((f) => `<script type="module" src="/assets/${f}"></script>`).join('\n    ')

// 3. Generate dist/client/index.html as SPA fallback
const htmlContent = `<!DOCTYPE html>
<html lang="en" class="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
    <title>KongKaaL Gaming - Bangladesh PUBG Mobile Tournament Platform</title>
    <meta name="description" content="Play, Compete & Win PUBG Mobile Custom Tournaments in Bangladesh. Solo, Duo, Squad matches with instant bKash & Nagad cash prize payouts!" />
    <meta name="theme-color" content="#07080b" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    ${cssFile ? `<link rel="stylesheet" href="/assets/${cssFile}" />` : ''}
    <link rel="preload" href="/kongkaal_hero.jpg" as="image" />
  </head>
  <body class="font-sans antialiased bg-[#07080b] text-gray-100 selection:bg-red-600/30 selection:text-red-200">
    <div id="root"></div>
    ${jsScriptTags}
  </body>
</html>
`

// fs.writeFileSync(path.join(clientDir, 'index.html'), htmlContent, 'utf-8')
console.log('✅ skipped generating index.html fallback to allow SSR!')

// 4. Clean up any invalid _redirects file if present
const redirectsPath = path.join(clientDir, '_redirects')
if (fs.existsSync(redirectsPath)) {
  fs.unlinkSync(redirectsPath)
}

// 5. Generate dist/client/_routes.json for Cloudflare Pages Worker routing
const routesConfig = {
  version: 1,
  include: ['/*'],
  exclude: [
    '/assets/*',
    '/*.jpg',
    '/*.jpeg',
    '/*.png',
    '/*.gif',
    '/*.svg',
    '/*.ico',
    '/*.css',
    '/*.js',
    '/_headers',
    '/_redirects',
  ],
}
fs.writeFileSync(path.join(clientDir, '_routes.json'), JSON.stringify(routesConfig, null, 2), 'utf-8')
console.log('✅ _routes.json created!')

// 6. Generate dist/client/.assetsignore to satisfy Cloudflare Pages asset scanner
fs.writeFileSync(path.join(clientDir, '.assetsignore'), '', 'utf-8')
console.log('✅ .assetsignore created!')

// 7. Create 404.html & admin/index.html fallbacks for direct route requests
// fs.copyFileSync(path.join(clientDir, 'index.html'), path.join(clientDir, '404.html'))
const adminDir = path.join(clientDir, 'admin')
if (!fs.existsSync(adminDir)) {
  fs.mkdirSync(adminDir, { recursive: true })
}
// fs.copyFileSync(path.join(clientDir, 'index.html'), path.join(adminDir, 'index.html'))
console.log('✅ 404.html & admin/index.html fallbacks skipped!')

console.log('🎉 Cloudflare Pages Deployment Package Ready in dist/client!')

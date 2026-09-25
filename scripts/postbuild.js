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
    'npx esbuild src/worker.ts --bundle --outfile=dist/client/_worker.js --format=esm --target=es2022 --main-fields=module,main --external:node:*',
    { stdio: 'inherit' }
  )
  console.log('✅ _worker.js successfully created!')
} catch (err) {
  console.error('⚠️ Warning: Failed to bundle _worker.js:', err)
}

// 2. Scan assets directory for CSS and JS bundles
let cssFile = ''
let indexJsFile = ''
let runtimeJsFile = ''

if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir)
  cssFile = files.find((f) => f.endsWith('.css')) || ''
  indexJsFile = files.find((f) => f.startsWith('index-') && f.endsWith('.js')) || ''
  runtimeJsFile = files.find((f) => f.startsWith('rolldown-runtime-') && f.endsWith('.js')) || ''
}

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
    ${runtimeJsFile ? `<script type="module" src="/assets/${runtimeJsFile}"></script>` : ''}
    ${indexJsFile ? `<script type="module" src="/assets/${indexJsFile}"></script>` : ''}
  </body>
</html>
`

fs.writeFileSync(path.join(clientDir, 'index.html'), htmlContent, 'utf-8')
console.log('✅ index.html fallback successfully created in dist/client/')

// 4. Generate dist/client/_redirects (SPA routing for Cloudflare Pages static)
const redirectsContent = `/*    /index.html   200\n`
fs.writeFileSync(path.join(clientDir, '_redirects'), redirectsContent, 'utf-8')
console.log('✅ _redirects created!')

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

console.log('🎉 Cloudflare Pages Deployment Package Ready in dist/client!')

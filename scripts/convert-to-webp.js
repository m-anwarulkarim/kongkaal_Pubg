import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const publicDir = path.join(__dirname, '..', 'public')

const files = fs.readdirSync(publicDir)

for (const file of files) {
  const ext = path.extname(file).toLowerCase()
  if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
    const filePath = path.join(publicDir, file)
    const baseName = path.basename(file, ext)
    const webpPath = path.join(publicDir, `${baseName}.webp`)

    console.log(`Converting ${file} -> ${baseName}.webp ...`)
    await sharp(filePath)
      .webp({ quality: 85 })
      .toFile(webpPath)
    console.log(`✓ Created ${baseName}.webp`)
  }
}
console.log('All public images converted to webp successfully!')

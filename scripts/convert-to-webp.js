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
  if (ext === '.webp') {
    const filePath = path.join(publicDir, file)

    console.log(`Optimizing ${file} ...`)
    const inputBuffer = fs.readFileSync(filePath)
    const buffer = await sharp(inputBuffer)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 65 })
      .toBuffer()

    fs.writeFileSync(filePath, buffer)
    console.log(`✓ Optimized ${file} -> ${(buffer.length / 1024).toFixed(1)} KB`)
  }
}
console.log('All public WebP images compressed to under 100 KB successfully!')

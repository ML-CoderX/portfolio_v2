import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sharp from 'sharp'

const widths = {
  'hero/character.webp': 1024,
  'hero/ink-spill.webp': 640,
  'work/backdrop.webp': 1440,
  'work/portal-ring.webp': 480,
  'about/portrait.webp': 640,
  'about/eyes-panel.webp': 720,
  'toolkit/shelf.webp': 1152,
  'contact/stage.webp': 1440,
}

export default defineConfig(async ({ isPreview }) => {
  if (!isPreview) {
    await Promise.all(Object.entries(widths).map(async ([file, width]) => {
      const source = new URL('./src/assets/scenes/' + file, import.meta.url)
      const output = new URL('./.scene-art/' + file, import.meta.url)
      await mkdir(new URL('.', output), { recursive: true })
      await sharp(fileURLToPath(source))
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 84 })
        .toFile(fileURLToPath(output))
    }))
  }
  return { plugins: [react()] }
})

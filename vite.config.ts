import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sharp from 'sharp'

import { sceneAssetFiles } from './src/scene-asset-files'

export default defineConfig(async ({ isPreview, isSsrBuild }) => {
  if (!isPreview && !isSsrBuild) {
    await Promise.all(Object.values(sceneAssetFiles).map(async ({ file, width }) => {
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

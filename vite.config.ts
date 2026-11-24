import { createHash, randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, rename } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import sharp from 'sharp'

function sceneArt(): Plugin {
  const cache = fileURLToPath(new URL('./.scene-art/', import.meta.url))
  return {
    name: 'portfolio-scene-art',
    enforce: 'pre',
    async load(id) {
      const match = /^(.*\.webp)\?width=(\d+)&scene-art$/.exec(id)
      if (!match) return

      const [, source, width] = match
      this.addWatchFile(source)
      const input = await readFile(source)
      const digest = createHash('sha256').update(input).digest('hex').slice(0, 16)
      const key = `w${width}-q84-${digest}`
      const name = basename(source)
      const directory = resolve(cache, key)
      const output = resolve(directory, name)
      if (!existsSync(output)) {
        await mkdir(directory, { recursive: true })
        const pending = resolve(directory, randomUUID() + '.webp')
        await sharp(input).resize({ width: Number(width), withoutEnlargement: true }).webp({ quality: 84 }).toFile(pending)
        await rename(pending, output)
      }
      // Let Vite resolve the same public URL in both the client and server builds.
      return `export { default } from ${JSON.stringify('/.scene-art/' + key + '/' + name + '?url')}`
    },
  }
}

export default defineConfig({
  plugins: [sceneArt(), react()],
  optimizeDeps: { entries: ['index.html'] },
})

import { sceneAssetFiles } from './scene-asset-files'

const optimizedAssets = import.meta.glob<string>('../.scene-art/**/*.webp', {
  eager: true, import: 'default', query: '?url',
})

export function sceneImage(name: keyof typeof sceneAssetFiles) {
  const { file } = sceneAssetFiles[name]
  const optimized = optimizedAssets['../.scene-art/' + file]
  if (!optimized) throw new Error('Missing optimized scene artwork: ' + file)
  return optimized
}

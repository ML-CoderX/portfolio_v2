import { lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react'
import { afterPaint } from './after-paint'
import { afterOpening } from './opening-screen'
import { scenes, type SceneId } from './scenes'

const Studio = lazy(() => import('./Workstation').catch(() => ({ default: MissingStudio })))
function MissingStudio({ onFailure }: { onFailure: () => void }) {
  useEffect(onFailure, [onFailure])
  return null
}

export function Scene({ id, className, children }: { id: SceneId; className: string; children: ReactNode }) {
  return <section id={id} className={className} aria-labelledby={id + '-title'} data-scene={id}>
    {id !== 'hero' && scenes[id].layers.length > 0 && <div className="scene-art" aria-hidden="true">
      {scenes[id].layers.map(layer => <img key={layer.name} className={'scene-layer ' + layer.name} src={layer.src} alt="" loading="lazy" />)}
    </div>}
    {children}
  </section>
}

export function WorkSequence() {
  const [load, setLoad] = useState(false)
  const [ready, setReady] = useState(false)
  const [playback] = useState(() => ({ progress: 0 }))
  const onPaint = useCallback(() => setReady(true), [])
  const onFailure = useCallback(() => { setReady(false); setLoad(false) }, [])
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)')
    let cancel = () => {}
    function sync() {
      cancel()
      onFailure()
      if (!reduce.matches && 'WebGL2RenderingContext' in window) {
        cancel = afterOpening(() => afterPaint(() => {
          try {
            const probe = document.createElement('canvas').getContext('webgl2')
            if (!probe) return
            probe.getExtension('WEBGL_lose_context')?.loseContext()
            setLoad(true)
          } catch { onFailure() }
        }, 0))
      }
    }
    sync()
    reduce.addEventListener('change', sync)
    return () => { cancel(); reduce.removeEventListener('change', sync) }
  }, [onFailure])
  useEffect(() => {
    let active = true
    let cleanup: (() => void) | undefined
    const cancel = afterPaint(() => {
      void import('./scene-scroll').then(({ startSceneScroll }) => {
        if (active) cleanup = startSceneScroll(ready, playback)
      }).catch(onFailure)
    }, 0)
    return () => { active = false; cancel(); cleanup?.() }
  }, [ready, playback, onFailure])
  return <>
    <output hidden className="scene-debug" data-scene-debug aria-live="off" />
    {load && <Suspense fallback={null}><Studio playback={playback} onPaint={onPaint} onFailure={onFailure} /></Suspense>}
  </>
}

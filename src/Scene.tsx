import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { afterPaint } from './after-paint'
import { afterOpening } from './opening-screen'
import { ChapterShot } from './SceneShots'
import { chapterTransitions, scenes, shotArtwork, type SceneId, type SceneMode, type ScenePlayback, type TransitionConfig } from './scenes'

type SceneScroll = ReturnType<typeof import('./scene-scroll').startSceneScroll>

const SceneCanvas = lazy(() => import('./Workstation').catch(() => ({ default: MissingCanvas })))

function MissingCanvas({ onFailure }: { onFailure: () => void }) {
  useEffect(onFailure, [onFailure])
  return null
}

export function Scene({ id, className, children }: { id: SceneId; className: string; children: ReactNode }) {
  const entrance = chapterTransitions.find(transition => transition.to === id)
  return <section id={id} className={className} aria-labelledby={id + '-title'} data-scene={id}>
    {entrance && <ChapterShot shot={entrance.shot} />}
    {id !== 'hero' && scenes[id].layers.length > 0 && <SceneArtwork id={id} />}
    {children}
  </section>
}

export function SceneArtwork({ id }: { id: SceneId }) {
  return <div className="scene-art" aria-hidden="true">
    {scenes[id].layers.map(({ name, src }) => <img key={name} className={'scene-layer ' + name} src={src} alt="" loading="lazy" decoding="async" />)}
  </div>
}

function canRenderWebGL() {
  try {
    const context = document.createElement('canvas').getContext('webgl2')
    context?.getExtension('WEBGL_lose_context')?.loseContext()
    return !!context
  } catch {
    return false
  }
}

export function Transition({ config }: { config: TransitionConfig }) {
  const [mode, setMode] = useState<SceneMode>('static')
  const [loadCanvas, setLoadCanvas] = useState(false)
  const [failed, setFailed] = useState(false)
  const wantsCanvas = useRef(false)
  const scroll = useRef<SceneScroll>(null)
  const appliedMode = useRef<SceneMode>('static')
  const playback = useMemo<ScenePlayback>(() => ({
    progress: 0,
    origin: { x: .5, y: .5 },
    orb: { x: .5, y: .5, moved: false },
  }), [])
  const onPaint = useCallback(() => {
    if (wantsCanvas.current) setMode('webgl')
  }, [])
  const onFailure = useCallback(() => {
    if (!wantsCanvas.current) return
    wantsCanvas.current = false
    setFailed(true)
    setMode('static')
    setLoadCanvas(false)
  }, [])

  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)')
    const desktop = matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)')
    let cancel = () => {}
    function sync() {
      cancel()
      wantsCanvas.current = false
      setMode('static')
      setLoadCanvas(false)
      if (reduce.matches || failed || !('WebGL2RenderingContext' in window)) return
      cancel = afterOpening(() => afterPaint(() => {
        if (desktop.matches) {
          wantsCanvas.current = true
          setLoadCanvas(true)
        } else setMode(canRenderWebGL() ? 'css' : 'static')
      }, 0))
    }
    sync()
    reduce.addEventListener('change', sync)
    desktop.addEventListener('change', sync)
    return () => {
      wantsCanvas.current = false
      cancel()
      reduce.removeEventListener('change', sync)
      desktop.removeEventListener('change', sync)
    }
  }, [failed])

  useEffect(() => {
    const root = document.documentElement
    // Keep the reading position when decorative panels above the current chapter enter or leave the layout.
    const anchor = scrollY > 0 ? [...document.querySelectorAll<HTMLElement>('[data-scene]')]
      .find(section => section.getBoundingClientRect().bottom > 100) : undefined
    const top = anchor?.getBoundingClientRect().top
    root.dataset.sceneMode = mode
    if (anchor && top !== undefined) {
      const shift = anchor.getBoundingClientRect().top - top
      if (Math.abs(shift) > 1) window.scrollBy({ top: shift, behavior: 'instant' })
    }
    appliedMode.current = mode
    scroll.current?.setMode(mode)
  }, [mode])

  useEffect(() => () => { delete document.documentElement.dataset.sceneMode }, [])

  useEffect(() => {
    let current = true
    const cancel = afterPaint(() => {
      void import('./scene-scroll').then(({ startSceneScroll }) => {
        if (!current) return
        scroll.current = startSceneScroll(config, playback)
        scroll.current.setMode(appliedMode.current)
      }).catch(() => {})
    }, 0)
    return () => {
      current = false
      cancel()
      scroll.current?.dispose()
      scroll.current = null
    }
  }, [config, playback])

  return <>
    <output hidden className="scene-debug" data-scene-debug aria-live="off" />
    <svg className="ink-bridge" aria-hidden="true"><path data-ink-bridge pathLength="1" /></svg>
    <div className="portal-shot" data-portal-shot aria-hidden="true">
      <img src={shotArtwork.portalRing} alt="" loading="lazy" />
    </div>
    {loadCanvas && <Suspense fallback={null}>
      <SceneCanvas inkTexture={config.inkTexture} heroId={config.from} playback={playback} onPaint={onPaint} onFailure={onFailure} />
    </Suspense>}
  </>
}

import { useEffect, useRef, useState } from 'react'
import { copy } from './content'
import { loadSakuga, type SakugaToggle } from './sakuga-runtime'

function themeMeta() {
  return document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
}

function applyTheme(night: boolean) {
  document.documentElement.dataset.theme = night ? 'night' : 'day'
  const meta = themeMeta()
  const color = night ? meta?.dataset.nightColor : meta?.dataset.dayColor
  if (meta && color) meta.content = color
}

export function ThemeSwitch({ effectsReady, motion }: { effectsReady: boolean; motion: boolean }) {
  const [night, setNight] = useState(false)
  const [painted, setPainted] = useState(false)
  const toggle = useRef<SakugaToggle>(null)
  const transition = useRef<ViewTransition | null>(null)
  const choice = useRef(false)

  useEffect(() => {
    choice.current = document.documentElement.dataset.theme === 'night'
    setNight(choice.current)
    function sync(event: StorageEvent) {
      if (event.key !== themeMeta()?.dataset.storageKey && event.key !== null) return
      choice.current = event.newValue === 'night'
      applyTheme(choice.current)
      setNight(choice.current)
    }
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('storage', sync)
      transition.current?.skipTransition()
    }
  }, [])

  useEffect(() => {
    if (!effectsReady) return
    let active = true
    void loadSakuga('toggle').then(installed => { if (active) setPainted(installed) })
    return () => { active = false }
  }, [effectsReady])

  const showArt = effectsReady && painted
  useEffect(() => {
    if (toggle.current && toggle.current.checked !== night) toggle.current.checked = night
  }, [night, showArt])

  useEffect(() => {
    if (motion) return
    transition.current?.skipTransition()
  }, [motion])

  function flip(button: HTMLButtonElement) {
    const next = !choice.current
    choice.current = next
    setNight(next)
    const storageKey = themeMeta()?.dataset.storageKey
    try { if (storageKey) localStorage.setItem(storageKey, next ? 'night' : 'day') } catch { /* Theme still works for this page. */ }
    transition.current?.skipTransition()
    if (!motion || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      applyTheme(next)
      return
    }

    toggle.current?.flip()
    if (document.startViewTransition && CSS.supports('mask-image', 'url("")') && document.visibilityState === 'visible') {
      const rect = button.getBoundingClientRect()
      const root = document.documentElement
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
      root.style.setProperty('--theme-x', `${x}px`)
      root.style.setProperty('--theme-y', `${y}px`)
      // The solid center of the splash covers the middle half of its SVG.
      root.style.setProperty('--ink-size', `${Math.ceil(radius * 4 + 8)}px`)
      const current = document.startViewTransition(() => applyTheme(choice.current))
      transition.current = current
      void current.finished.catch(() => {}).finally(() => {
        if (transition.current === current) transition.current = null
      })
    } else {
      applyTheme(next)
    }
  }

  return <button className="theme-switch" type="button" role="switch" aria-label={copy.theme.label}
      aria-checked={night} title={night ? copy.theme.night : copy.theme.day}
      onClick={event => flip(event.currentTarget)}>
      <span className="theme-icon" aria-hidden="true">{night ? '☾' : '☀'}</span>
      <span className="theme-toggle-track" aria-hidden="true">
        {showArt
          ? <span className="theme-toggle-art" inert><sakuga-toggle ref={toggle} label={copy.theme.label} /></span>
          : <span className="theme-toggle-fallback" />}
      </span>
    </button>
}

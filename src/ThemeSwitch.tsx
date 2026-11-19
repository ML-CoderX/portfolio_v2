import { useEffect, useRef, useState } from 'react'
import { copy } from './content'
import { loadSakuga, type SakugaToggle } from './sakuga'

const storageKey = 'saad-theme'

function applyTheme(night: boolean) {
  document.documentElement.dataset.theme = night ? 'night' : 'day'
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', night ? '#171321' : '#f6f3ec')
}

export function ThemeSwitch({ effectsReady }: { effectsReady: boolean }) {
  const [night, setNight] = useState(false)
  const [painted, setPainted] = useState(false)
  const toggle = useRef<SakugaToggle>(null)
  const sweep = useRef<HTMLSpanElement>(null)
  const animation = useRef<Animation | null>(null)
  const transition = useRef<ViewTransition | null>(null)
  const choice = useRef(false)

  useEffect(() => {
    choice.current = document.documentElement.dataset.theme === 'night'
    setNight(choice.current)
    function sync(event: StorageEvent) {
      if (event.key !== storageKey && event.key !== null) return
      choice.current = event.newValue === 'night'
      applyTheme(choice.current)
      setNight(choice.current)
    }
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('storage', sync)
      animation.current?.cancel()
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

  function flip(button: HTMLButtonElement) {
    const next = !choice.current
    choice.current = next
    setNight(next)
    try { localStorage.setItem(storageKey, next ? 'night' : 'day') } catch { /* Theme still works for this page. */ }
    animation.current?.cancel()
    transition.current?.skipTransition()
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      applyTheme(next)
      return
    }

    toggle.current?.flip()
    if (document.startViewTransition && document.visibilityState === 'visible') {
      const rect = button.getBoundingClientRect()
      const root = document.documentElement
      root.style.setProperty('--theme-x', `${rect.left + rect.width / 2}px`)
      root.style.setProperty('--theme-y', `${rect.top + rect.height / 2}px`)
      const current = document.startViewTransition(() => applyTheme(choice.current))
      transition.current = current
      void current.finished.catch(() => {}).finally(() => {
        if (transition.current === current) transition.current = null
      })
    } else {
      applyTheme(next)
    }
    animation.current = sweep.current?.animate([
      { opacity: 0, transform: 'translateX(-110%)' },
      { opacity: .43, offset: .42 },
      { opacity: 0, transform: 'translateX(110%)' },
    ], { duration: 380, easing: 'cubic-bezier(.23,1,.32,1)' }) ?? null
  }

  return <>
    <button className="theme-switch" type="button" role="switch" aria-label={copy.theme.label}
      aria-checked={night} title={night ? copy.theme.night : copy.theme.day}
      onClick={event => flip(event.currentTarget)}>
      <span className="theme-icon" aria-hidden="true">{night ? '☾' : '☀'}</span>
      <span className="theme-toggle-track" aria-hidden="true">
        {showArt
          ? <span className="theme-toggle-art" inert><sakuga-toggle ref={toggle} label={copy.theme.label} /></span>
          : <span className="theme-toggle-fallback" />}
      </span>
    </button>
    <span ref={sweep} className="theme-sweep" aria-hidden="true" />
  </>
}

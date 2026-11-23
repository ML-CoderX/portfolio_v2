import { useSyncExternalStore } from 'react'
import { copy } from './content'
import { getSakugaEffects } from './sakuga-runtime'

const preferenceQuery = '(prefers-reduced-motion: reduce)'
const changeEvent = 'portfolio:motionchange'
let choice: 'on' | 'off' | undefined

function savedChoice() {
  try {
    const value = localStorage.getItem(document.documentElement.dataset.motionKey!)
    if (value === 'on' || value === 'off') return value
  } catch { /* Keep the setting available for the current visit. */ }
}

function applyMotion(enabled: boolean) {
  const root = document.documentElement
  const next = enabled ? 'on' : 'off'
  if (root.dataset.motion === next) return
  root.dataset.motion = next
  if (!enabled) {
    getSakugaEffects()?.clearFront?.()
    if (root.hasAttribute('data-opening')) window.dispatchEvent(new Event('opening:complete'))
  }
  window.dispatchEvent(new Event(changeEvent))
}

function subscribe(notify: () => void) {
  const media = matchMedia(preferenceQuery)
  choice ??= savedChoice()
  function sync() { applyMotion(choice ? choice === 'on' : !media.matches) }
  function syncStorage(event: StorageEvent) {
    if (event.key !== null && event.key !== document.documentElement.dataset.motionKey) return
    choice = savedChoice()
    sync()
  }
  window.addEventListener(changeEvent, notify)
  window.addEventListener('storage', syncStorage)
  media.addEventListener('change', sync)
  sync()
  return () => {
    window.removeEventListener(changeEvent, notify)
    window.removeEventListener('storage', syncStorage)
    media.removeEventListener('change', sync)
  }
}

function toggleMotion() {
  choice = document.documentElement.dataset.motion === 'on' ? 'off' : 'on'
  try { localStorage.setItem(document.documentElement.dataset.motionKey!, choice) }
  catch { /* The current page still uses the in-memory choice. */ }
  applyMotion(choice === 'on')
}

export function useMotionPreference() {
  return useSyncExternalStore(subscribe, () => document.documentElement.dataset.motion === 'on', () => undefined)
}

export function MotionSwitch({ enabled }: { enabled: boolean | undefined }) {
  return <button className="motion-switch" type="button" role="switch"
    aria-label={copy.motion.label} aria-checked={enabled ?? true} onClick={toggleMotion}>
    {copy.motion.label} <span aria-hidden="true">{enabled === false ? copy.motion.off : copy.motion.on}</span>
  </button>
}

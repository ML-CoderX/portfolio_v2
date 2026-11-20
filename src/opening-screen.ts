import { useEffect } from 'react'
import { afterPaint } from './enhancements'
import { loadSakuga } from './sakuga'

type SakugaProgress = HTMLElement & { set(value: number, instant?: boolean): void }

export function useOpeningScreen() {
  useEffect(() => {
    const screen = document.getElementById('opening-screen')
    const meter = screen?.querySelector<HTMLElement>('.opening-meter')
    const fallback = meter?.querySelector('progress')
    const sakuga = meter?.querySelector<SakugaProgress>('sakuga-progress')
    if (!meter || !fallback || !sakuga) return

    const reduce = matchMedia('(prefers-reduced-motion: reduce)')
    let enhanced = false
    let componentReady = reduce.matches
    let assetsReady = false
    let active = true
    let upgradeDeadline = 0
    let finishDeadline = 0
    const dismiss = () => window.dispatchEvent(new Event('opening:complete'))

    const finishWhenReady = () => {
      if (!active || !assetsReady || !componentReady) return
      fallback.value = 1
      if (!enhanced || reduce.matches) {
        dismiss()
        return
      }
      sakuga.set(1)
      finishDeadline = window.setTimeout(() => {
        sakuga.set(1, true)
        finishDeadline = window.setTimeout(dismiss, 250)
      }, 800)
    }

    function holdCompletionFrame() {
      clearTimeout(finishDeadline)
      finishDeadline = window.setTimeout(dismiss, 190)
    }

    const finishUpgrade = (installed: boolean) => {
      if (!active || componentReady) return
      clearTimeout(upgradeDeadline)
      componentReady = true
      if (installed && !reduce.matches) {
        enhanced = true
        sakuga.set(fallback.value, true)
        meter.dataset.enhanced = ''
      }
      finishWhenReady()
    }

    sakuga.addEventListener('sakuga:done', holdCompletionFrame)
    fallback.value = .38
    const image = document.querySelector<HTMLImageElement>('.workstation > img')
    void Promise.allSettled([document.fonts?.load('1em "Bebas Neue"'), image?.decode()]).then(() => {
      if (!active) return
      assetsReady = true
      fallback.value = .76
      if (enhanced) sakuga.set(.76)
      finishWhenReady()
    })

    const cancelPaint = componentReady ? () => {} : afterPaint(() => {
      upgradeDeadline = window.setTimeout(() => finishUpgrade(false), 650)
      // Load our shared, canvas-aware Sakuga core before registering progress.
      void loadSakuga('button').then(installed => installed && active && !componentReady && loadSakuga('progress'))
        .then(finishUpgrade)
    }, 0)

    function cleanup() {
      active = false
      cancelPaint()
      clearTimeout(upgradeDeadline)
      clearTimeout(finishDeadline)
      if (enhanced) window.SakugaFX?.clearFront?.()
      sakuga?.removeEventListener('sakuga:done', holdCompletionFrame)
      window.removeEventListener('opening:complete', cleanup)
    }

    window.addEventListener('opening:complete', cleanup, { once: true })
    return cleanup
  }, [])
}

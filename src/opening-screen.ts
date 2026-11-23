import { useEffect } from 'react'
import { afterPaint } from './after-paint'
import { getSakugaEffects, loadSakuga, type SakugaProgress } from './sakuga-runtime'

export function afterOpening(callback: () => () => void) {
  if (!document.documentElement.hasAttribute('data-opening')) return callback()
  let cancel: (() => void) | undefined
  const open = () => { cancel = callback() }
  window.addEventListener('opening:complete', open, { once: true })
  return () => {
    window.removeEventListener('opening:complete', open)
    cancel?.()
  }
}

export function useOpeningScreen(motion: boolean) {
  useEffect(() => {
    if (!motion || !document.documentElement.hasAttribute('data-opening')) return
    const screen = document.getElementById('opening-screen')
    const meter = screen?.querySelector<HTMLElement>('.opening-meter')
    const fallback = meter?.querySelector('progress')
    const sakuga = meter?.querySelector<SakugaProgress>('sakuga-progress')
    if (!meter || !fallback || !sakuga) return

    let enhanced = false
    let componentReady = false
    let assetsReady = false
    let active = true
    let upgradeDeadline = 0
    let finishDeadline = 0
    const dismiss = () => window.dispatchEvent(new Event('opening:complete'))

    const finishWhenReady = () => {
      if (!active || !assetsReady || !componentReady) return
      fallback.value = 1
      if (!enhanced) {
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
      if (installed) {
        enhanced = true
        sakuga.set(fallback.value, true)
        meter.dataset.enhanced = ''
      }
      finishWhenReady()
    }

    sakuga.addEventListener('sakuga:done', holdCompletionFrame)
    fallback.value = .38

    void Promise.allSettled([document.fonts?.load('1em "Bebas Neue"')]).then(() => {
      if (!active) return
      assetsReady = true
      fallback.value = .76
      if (enhanced) sakuga.set(.76)
      finishWhenReady()
    })

    const cancelPaint = afterPaint(() => {
      upgradeDeadline = window.setTimeout(() => finishUpgrade(false), 650)
      void loadSakuga('progress').then(finishUpgrade)
    }, 0)

    function cleanup() {
      active = false
      cancelPaint()
      clearTimeout(upgradeDeadline)
      clearTimeout(finishDeadline)
      if (enhanced) getSakugaEffects()?.clearFront?.()
      sakuga?.removeEventListener('sakuga:done', holdCompletionFrame)
      window.removeEventListener('opening:complete', cleanup)
    }

    window.addEventListener('opening:complete', cleanup, { once: true })
    return cleanup
  }, [motion])
}

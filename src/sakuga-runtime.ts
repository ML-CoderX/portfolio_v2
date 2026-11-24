export type SakugaButton = HTMLElement & { done: () => void; impact: (origin?: HTMLElement) => void }
export type SakugaToast = HTMLElement & { show: (message: string) => void }
export type SakugaToggle = HTMLElement & { checked: boolean; flip: () => void }
export type SakugaProgress = HTMLElement & { set(value: number, instant?: boolean): void }

declare global {
  interface Window {
    SakugaFX?: {
      calm: boolean
      clearFront?: () => void
      setSurfaceConsumer: (consumer: ((canvas: HTMLCanvasElement) => void) | null) => void
    }
  }
}

type Component = 'button' | 'toast' | 'tooltip' | 'toggle' | 'progress'
const loads = new Map<Component, Promise<boolean>>()
function register(component: Component) {
  const previous = loads.get(component)
  if (previous) return previous
  const loading = new Promise<boolean>(resolve => {
    const script = document.createElement('script')
    script.src = '/sakuga-vfx/' + component + '.js'
    script.onload = () => {
      const installed = !!customElements.get('sakuga-' + component)
      if (installed && component === 'button') window.dispatchEvent(new Event('sakuga:ready'))
      resolve(installed)
    }
    script.onerror = () => resolve(false)
    document.head.append(script)
  })
  loads.set(component, loading)
  return loading
}

export async function loadSakuga(component: Component) {
  if (component !== 'button' && !await register('button')) return false
  return register(component)
}

export function getSakugaEffects() {
  return window.SakugaFX
}

export function subscribeToSakugaSurface(consumer: (canvas: HTMLCanvasElement) => void) {
  const connect = () => getSakugaEffects()?.setSurfaceConsumer(consumer)
  connect()
  window.addEventListener('sakuga:ready', connect)
  return () => {
    window.removeEventListener('sakuga:ready', connect)
    getSakugaEffects()?.setSurfaceConsumer(null)
  }
}

import { useEffect, useRef, useState, type DetailedHTMLProps, type HTMLAttributes, type ReactNode } from 'react'
import { copy, profile } from './content'
import { afterPaint } from './enhancements'

type SakugaButton = HTMLElement & { done: () => void; impact: (origin?: HTMLElement) => void }
type SakugaToast = HTMLElement & { show: (message: string) => void }
type Particle = { dead?: boolean }
type Props<T extends HTMLElement> = DetailedHTMLProps<HTMLAttributes<T>, T>
declare module 'react' {
  // JSX custom elements are declared through React's namespace augmentation.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'sakuga-button': Props<SakugaButton> & { variant?: string }
      'sakuga-toast': Props<SakugaToast>
      'sakuga-tooltip': Props<HTMLElement> & { text: string; label: string }
    }
  }
}
declare global {
  interface Window {
    SakugaFX?: {
      persist: (draw: () => void) => Particle
      g: CanvasRenderingContext2D
      calm: boolean
    }
  }
}

type Component = 'button' | 'toast' | 'tooltip'
const loads = new Map<Component, Promise<boolean>>()
function load(component: Component) {
  const previous = loads.get(component)
  if (previous) return previous
  const loading = new Promise<boolean>(resolve => {
    const script = document.createElement('script')
    script.src = '/sakuga-vfx/' + component + '.js'
    script.onload = () => resolve(!!customElements.get('sakuga-' + component))
    script.onerror = () => resolve(false)
    document.head.append(script)
  })
  loads.set(component, loading)
  return loading
}

export function useSakuga() {
  const [ready, setReady] = useState({ button: false, toast: false, tooltip: false })
  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    let cancel = () => {}
    let current = true
    function sync() {
      cancel()
      if (motion.matches) {
        setReady({ button: false, toast: false, tooltip: false })
        return
      }
      function enable(component: Component) {
        void load('button').then(async button => {
          if (current && !motion.matches) setReady(value => ({ ...value, button }))
          if (component === 'button' || motion.matches) return
          const installed = await load(component)
          if (current && !motion.matches) setReady(value => ({ ...value, [component]: installed }))
        })
      }
      let observer: IntersectionObserver | undefined
      const first = afterPaint(() => {
        enable('button')
        observer = new IntersectionObserver(entries => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            observer?.unobserve(entry.target)
            enable(entry.target.id === 'contact' ? 'toast' : 'tooltip')
          }
        }, { rootMargin: '180px 0px' })
        for (const id of ['work', 'contact']) {
          const target = document.getElementById(id)
          if (target) observer.observe(target)
        }
      }, matchMedia('(pointer: coarse)').matches ? 2300 : 500)
      cancel = () => { first(); observer?.disconnect() }
    }
    sync()
    motion.addEventListener('change', sync)
    return () => { current = false; cancel(); motion.removeEventListener('change', sync) }
  }, [])
  return ready
}

export function ActionLink({ href, children, appearance = '', sfx, download }: {
  href: string; children: ReactNode; appearance?: string; sfx: string; download?: boolean
}) {
  // The anchor owns navigation, keyboard focus, and download behavior.
  return <a href={href} download={download} data-link-impact data-sfx={sfx} className={'comic-action ' + appearance}>{children}</a>
}

export function LinkEffects({ ready }: { ready: boolean }) {
  const effect = useRef<SakugaButton>(null)
  useEffect(() => {
    if (!ready) return
    function click(event: MouseEvent) {
      const link = (event.target as Element).closest<HTMLElement>('[data-link-impact]')
      if (link && !window.SakugaFX?.calm) effect.current?.impact(link)
    }
    document.addEventListener('click', click)
    return () => document.removeEventListener('click', click)
  }, [ready])
  return ready ? <div inert aria-hidden="true" className="link-effects"><sakuga-button ref={effect}>{copy.hero.work}</sakuga-button></div> : null
}

export function Chip({ title, hint, enhanced }: { title: string; hint: string; enhanced: boolean }) {
  return enhanced
    ? <sakuga-tooltip className="chip" text={hint} label={title}>{title}</sakuga-tooltip>
    : <span className="chip" title={hint}>{title}</span>
}

export function ContactActions({ enhanced }: { enhanced: ReturnType<typeof useSakuga> }) {
  const email = useRef<HTMLInputElement>(null)
  const button = useRef<SakugaButton>(null)
  const toast = useRef<SakugaToast>(null)
  const [status, setStatus] = useState('')
  const useCustomButton = enhanced.button

  useEffect(() => {
    const element = button.current
    function activate() { email.current?.form?.requestSubmit() }
    element?.addEventListener('click', activate)
    return () => element?.removeEventListener('click', activate)
  }, [useCustomButton])

  async function copyEmail() {
    setStatus('')
    let copied = false
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(profile.email)
        copied = true
      }
    } catch { /* Try the legacy clipboard action below. */ }
    if (!copied && email.current) {
      email.current.focus()
      email.current.select()
      email.current.setSelectionRange(0, profile.email.length)
      try { copied = document.execCommand('copy') } catch { /* Selection stays available. */ }
    }
    if (copied) {
      button.current?.done()
      if (toast.current) toast.current.show(copy.copied)
      else setStatus(copy.copied)
    } else setStatus(copy.copyFailed)
  }

  return <div className="contact-controls">
    <form className="email-box" action={'mailto:' + profile.email} onSubmit={event => { event.preventDefault(); void copyEmail() }}>
      <input aria-label={copy.email} ref={email} readOnly value={profile.email} onFocus={event => event.currentTarget.select()} />
      {useCustomButton
        ? <sakuga-button ref={button} data-sfx={copy.effects.impact}>{copy.copy}</sakuga-button>
        : <button type="submit" className="comic-action pink" data-sfx={copy.effects.impact}>{copy.copy}</button>}
    </form>
    <a className="email-link" href={'mailto:' + profile.email}>{copy.email}</a>
    <p className="copy-status" role="status">{status}</p>
    {enhanced.toast && <sakuga-toast ref={toast} />}
  </div>
}

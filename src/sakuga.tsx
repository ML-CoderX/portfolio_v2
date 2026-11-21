import { useEffect, useRef, useState, type DetailedHTMLProps, type HTMLAttributes, type ReactNode } from 'react'
import { copy } from './content'
import { afterPaint } from './after-paint'
import { getSakugaEffects, loadSakuga, type SakugaButton, type SakugaToast, type SakugaToggle } from './sakuga-runtime'
type Props<T extends HTMLElement> = DetailedHTMLProps<HTMLAttributes<T>, T>
declare module 'react' {
  // JSX custom elements are declared through React's namespace augmentation.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'sakuga-button': Props<SakugaButton> & { variant?: string }
      'sakuga-toast': Props<SakugaToast>
      'sakuga-tooltip': Props<HTMLElement> & { text: string; label: string }
      'sakuga-toggle': Props<SakugaToggle> & { label: string }
    }
  }
}
type SakugaReadiness = { button: boolean; toast: boolean; tooltip: boolean }

export function useSakuga() {
  const [ready, setReady] = useState<SakugaReadiness>({ button: false, toast: false, tooltip: false })
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
      function enable(component: keyof SakugaReadiness) {
        void loadSakuga(component).then(installed => {
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
    const presses = new WeakMap<HTMLElement, Animation>()
    function click(event: MouseEvent) {
      if (event.button !== 0 || !(event.target instanceof Element) || getSakugaEffects()?.calm) return
      const control = event.target.closest<HTMLElement>('[data-link-impact]')
      if (!control) return
      effect.current?.impact(control)
      // The WebGL effects layer sits beneath the sticky header. Animate the control itself as well.
      if (control.closest('.site-header')) {
        presses.get(control)?.cancel()
        presses.set(control, control.animate([
          { scale: '1.04 .86' },
          { scale: '.98 1.07', offset: .46 },
          { scale: '1' },
        ], { duration: 240, easing: 'cubic-bezier(.23,1,.32,1)' }))
      }
    }
    // Capture the position before the mobile menu closes or an anchor starts scrolling.
    document.addEventListener('click', click, true)
    return () => document.removeEventListener('click', click, true)
  }, [ready])
  return ready ? <div inert aria-hidden="true" className="link-effects"><sakuga-button ref={effect}>{copy.hero.work}</sakuga-button></div> : null
}

export function Chip({ title, hint, enhanced }: { title: string; hint: string; enhanced: boolean }) {
  return enhanced
    ? <sakuga-tooltip className="chip" text={hint} label={title}>{title}</sakuga-tooltip>
    : <span className="chip" title={hint}>{title}</span>
}

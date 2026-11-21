import { useEffect } from 'react'
import { afterPaint } from './after-paint'
import { afterOpening } from './opening-screen'
import { getSakugaEffects } from './sakuga-runtime'

export function useEnhancements() {
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    let pointerFrame = 0
    let last = 0
    let cleanup: (() => void) | undefined
    let generation = 0
    let trail: { dead?: boolean } | undefined
    let stamp: HTMLElement | undefined
    let stampTimer = 0
    const particles: { x: number; y: number; born: number }[] = []
    function pointer(event: PointerEvent) {
      if (media.matches || document.hidden || event.pointerType !== 'mouse' || pointerFrame) return
      const now = performance.now()
      if (now - last < 34) return
      last = now
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0
        const fx = getSakugaEffects()
        if (!fx || fx.calm || document.hidden) return
        particles.push({ x: event.clientX, y: event.clientY, born: performance.now() })
        trail ??= fx.persist(() => {
          const context = fx.g
          const time = performance.now()
          while (particles.length && time - particles[0].born >= 230) particles.shift()
          if (!particles.length) {
            if (trail) trail.dead = true
            trail = undefined
          }
          for (const point of particles) {
            context.globalAlpha = (1 - (time - point.born) / 230) * .65
            context.fillStyle = '#ff2e88'
            context.fillRect(point.x + scrollX, point.y + scrollY, 3, 3)
          }
        })
      })
    }

    function click(event: MouseEvent) {
      const target = (event.target as Element).closest<HTMLElement>('[data-sfx]')
      if (media.matches || !target) return
      stamp?.remove()
      clearTimeout(stampTimer)
      stamp = document.createElement('span')
      stamp.className = 'action-sfx'
      stamp.setAttribute('aria-hidden', 'true')
      stamp.textContent = target.dataset.sfx ?? ''
      const rect = target.getBoundingClientRect()
      stamp.style.left = Math.max(55, Math.min(innerWidth - 55, rect.left + rect.width / 2)) + 'px'
      stamp.style.top = Math.max(54, rect.top - 12) + 'px'
      document.body.append(stamp)
      stampTimer = window.setTimeout(() => stamp?.remove(), 430)
    }

    function motion() {
      cleanup?.()
      cleanup = undefined
      const run = ++generation
      if (media.matches) {
        stamp?.remove()
        if (trail) trail.dead = true
        trail = undefined
        particles.length = 0
        return
      }
      const hero = document.getElementById('hero')
      const cancelEntrance = afterOpening(() => afterPaint(() => {
        if (scrollY < 100) hero?.classList.add('hero-entrance')
      }, 70))
      let stopAnimations: (() => void) | undefined
      const observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return
        observer.disconnect()
        void import('./motion').then(({ animatePage }) => {
          if (run === generation) stopAnimations = animatePage()
        }).catch(() => {})
      }, { rootMargin: matchMedia('(pointer: coarse)').matches ? '0px' : '240px 0px' })
      for (const section of document.querySelectorAll('.site-section')) observer.observe(section)
      cleanup = () => {
        cancelEntrance()
        hero?.classList.remove('hero-entrance')
        observer.disconnect()
        stopAnimations?.()
      }
    }
    motion()
    window.addEventListener('pointermove', pointer, { passive: true })
    document.addEventListener('click', click)
    media.addEventListener('change', motion)
    return () => {
      generation++
      cleanup?.()
      if (trail) trail.dead = true
      stamp?.remove()
      clearTimeout(stampTimer)
      cancelAnimationFrame(pointerFrame)
      window.removeEventListener('pointermove', pointer)
      document.removeEventListener('click', click)
      media.removeEventListener('change', motion)
    }
  }, [])
}

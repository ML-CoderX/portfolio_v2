import { useEffect, useState } from 'react'

export function afterPaint(callback: () => void, delay = 500) {
  let timer = 0
  let frame = 0
  let paints: PerformanceObserver | undefined
  function schedule() {
    paints?.disconnect()
    timer = window.setTimeout(callback, delay)
  }
  if (performance.getEntriesByName('first-contentful-paint').length) schedule()
  else if (PerformanceObserver.supportedEntryTypes.includes('paint')) {
    paints = new PerformanceObserver(list => {
      if (list.getEntries().some(entry => entry.name === 'first-contentful-paint')) schedule()
    })
    paints.observe({ type: 'paint', buffered: true })
  } else {
    frame = requestAnimationFrame(() => { frame = requestAnimationFrame(schedule) })
  }
  return () => { paints?.disconnect(); cancelAnimationFrame(frame); clearTimeout(timer) }
}

export function useWorkstation() {
  const [active, setActive] = useState(false)
  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    const touch = matchMedia('(pointer: coarse)')
    const hero = document.getElementById('hero')
    let cancel = () => {}
    function sync() {
      cancel()
      if (motion.matches) setActive(false)
      else if ('WebGL2RenderingContext' in window && hero) {
        const enable = () => {
          if (document.hidden || hero.getBoundingClientRect().bottom < 80) return
          cancel()
          setActive(true)
        }
        const observer = new IntersectionObserver(([entry]) => {
          if (!entry.isIntersecting) return
          clearTimeout(timer)
          timer = window.setTimeout(enable, touch.matches ? 6500 : 1100)
        }, { threshold: .25 })
        let timer = 0
        const art = hero.querySelector('.hero-art')
        const painted = afterPaint(() => {
          observer.observe(hero)
          art?.addEventListener('pointerdown', enable)
        }, 0)
        cancel = () => {
          painted()
          clearTimeout(timer)
          observer.disconnect()
          art?.removeEventListener('pointerdown', enable)
        }
      }
    }
    sync()
    motion.addEventListener('change', sync)
    return () => { cancel(); motion.removeEventListener('change', sync) }
  }, [])
  return [active, setActive] as const
}

export function useEnhancements() {
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const progress = document.querySelector<HTMLElement>('[data-energy]')
    let scrollFrame = 0
    let pointerFrame = 0
    let last = 0
    let cleanup: (() => void) | undefined
    let generation = 0
    let trail: { dead?: boolean } | undefined
    let stamp: HTMLElement | undefined
    let stampTimer = 0
    const particles: { x: number; y: number; born: number }[] = []
    function updateProgress() {
      scrollFrame = 0
      const max = document.documentElement.scrollHeight - innerHeight
      if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0) + ')'
    }
    function scroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateProgress) }

    function pointer(event: PointerEvent) {
      if (media.matches || document.hidden || event.pointerType !== 'mouse' || pointerFrame) return
      const now = performance.now()
      if (now - last < 34) return
      last = now
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0
        const fx = window.SakugaFX
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
      const cancelEntrance = afterPaint(() => {
        if (scrollY < 100) hero?.classList.add('hero-entrance')
      }, 70)
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
    updateProgress()
    motion()
    const size = new ResizeObserver(scroll)
    size.observe(document.body)
    window.addEventListener('scroll', scroll, { passive: true })
    window.addEventListener('pointermove', pointer, { passive: true })
    document.addEventListener('click', click)
    media.addEventListener('change', motion)
    return () => {
      generation++
      cleanup?.()
      if (trail) trail.dead = true
      stamp?.remove()
      clearTimeout(stampTimer)
      size.disconnect()
      cancelAnimationFrame(scrollFrame)
      cancelAnimationFrame(pointerFrame)
      window.removeEventListener('scroll', scroll)
      window.removeEventListener('pointermove', pointer)
      document.removeEventListener('click', click)
      media.removeEventListener('change', motion)
    }
  }, [])
}

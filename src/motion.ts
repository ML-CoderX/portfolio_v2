import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function animatePage() {
  gsap.registerPlugin(ScrollTrigger)
  const context = gsap.context(() => {
    if (scrollY < 100) {
      const entrance = gsap.timeline()
      entrance.from('.hero h1', { scale: .87, rotate: -3, duration: .42, ease: 'back.out(2.4)' })
        .fromTo('.impact', { opacity: .9, scale: .65 }, { opacity: 0, scale: 1.4, duration: .28 }, 0)
        .fromTo('.speed-lines', { opacity: .45 }, { opacity: .18, duration: .32 }, 0)
        .to('.hero-copy', { x: 2, duration: .04, yoyo: true, repeat: 3, clearProps: 'transform' }, .12)
        .from('[data-stamp]', { scale: .82, opacity: .1, duration: .33, stagger: .06, ease: 'back.out(2)' }, .12)
      gsap.set('.terminal', { className: 'terminal is-typing' })
    }
    for (const selector of ['[data-heading]', '[data-reveal]', '[data-exp]']) {
      const isBar = selector === '[data-exp]'
      const isHeading = selector === '[data-heading]'
      const targets = gsap.utils.toArray<HTMLElement>(selector).filter(el => el.getBoundingClientRect().top > innerHeight)
      gsap.set(targets, isBar ? { scaleX: 0 } : { y: isHeading ? 18 : 16, scale: .98 })
      ScrollTrigger.batch(targets, {
        start: 'top 96%',
        once: true,
        onEnter: batch => context.add(() => {
          gsap.to(batch, isBar
            ? { scaleX: 1, duration: .32, stagger: .05 }
            : { y: 0, scale: 1, duration: .34, stagger: .065, ease: 'back.out(1.4)', clearProps: 'transform' })
        }),
      })
    }
  })
  return () => context.revert()
}

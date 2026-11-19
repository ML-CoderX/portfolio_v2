import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function animatePage() {
  gsap.registerPlugin(ScrollTrigger)
  const context = gsap.context(() => {
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

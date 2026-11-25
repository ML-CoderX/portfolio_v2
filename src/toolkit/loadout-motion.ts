import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function animateLoadout(panel: HTMLElement, played: { current: boolean }) {
  gsap.registerPlugin(ScrollTrigger)
  let visible = false
  let complete = played.current
  let intro: gsap.core.Timeline | undefined
  const nodes = panel.querySelectorAll('.loadout-node-label')
  const lines = panel.querySelectorAll('.loadout-line')

  function begin() {
    if (played.current || intro) return
    played.current = true
    gsap.set(lines, { strokeDasharray: '1 1', strokeDashoffset: 1 })
    intro = gsap.timeline({
      paused: true,
      onComplete: () => {
        complete = true
        gsap.set(nodes, { clearProps: 'opacity,visibility,transform' })
        gsap.set(lines, { clearProps: 'strokeDasharray,strokeDashoffset' })
        sync()
      },
    })
      .fromTo(nodes, { autoAlpha: 0, scale: .84 }, { autoAlpha: 1, scale: 1, duration: .32, stagger: .026, ease: 'back.out(1.6)' })
      .to(lines, { strokeDashoffset: 0, duration: .58, stagger: .022, ease: 'power2.out' }, .25)
    sync()
  }

  function sync() {
    const running = visible && !document.hidden
    panel.toggleAttribute('data-loadout-pulses', complete)
    panel.toggleAttribute('data-loadout-running', complete && running)
    if (intro) {
      if (running) {
        intro.play()
      } else intro.pause()
    }
  }

  const context = gsap.context(() => undefined, panel)
  const trigger = !complete && ScrollTrigger.create({
    trigger: panel,
    start: 'top 70%',
    once: true,
    onEnter: begin,
  })
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    const availableHeight = Math.min(entry.boundingClientRect.height, entry.rootBounds?.height ?? innerHeight)
    if (entry.intersectionRect.height >= availableHeight * .3) begin()
    sync()
  }, { threshold: [0, .3] })
  visibility.observe(panel)
  document.addEventListener('visibilitychange', sync)
  sync()

  return () => {
    if (trigger) trigger.kill()
    context.revert()
    visibility.disconnect()
    document.removeEventListener('visibilitychange', sync)
    panel.removeAttribute('data-loadout-pulses')
    panel.removeAttribute('data-loadout-running')
  }
}

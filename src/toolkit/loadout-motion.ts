import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function animateLoadout(panel: HTMLElement, played: { current: boolean }) {
  gsap.registerPlugin(ScrollTrigger)
  let visible = false
  let complete = played.current
  let intro: gsap.core.Timeline | undefined
  const nodes = panel.querySelectorAll('.loadout-node-label')
  const traces = panel.querySelectorAll('.loadout-trace')

  function begin() {
    if (played.current || intro) return
    played.current = true
    intro = gsap.timeline({
      paused: true,
      onComplete: () => {
        complete = true
        sync()
      },
    })
      .fromTo(nodes, { scale: .94 }, { scale: 1, duration: .32, stagger: .026, ease: 'back.out(1.6)' })
      .fromTo(traces, { strokeDasharray: '1 1', strokeDashoffset: 1, opacity: .65 },
        { strokeDashoffset: 0, duration: .58, stagger: .022, ease: 'power2.out' }, .25)
      .to(traces, { opacity: 0, duration: .2 })
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

  const trigger = !complete && ScrollTrigger.create({
    trigger: panel,
    start: () => `top+=${Math.min(panel.offsetHeight, innerHeight) * .3} bottom`,
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
    intro?.revert()
    visibility.disconnect()
    document.removeEventListener('visibilitychange', sync)
    panel.removeAttribute('data-loadout-pulses')
    panel.removeAttribute('data-loadout-running')
  }
}

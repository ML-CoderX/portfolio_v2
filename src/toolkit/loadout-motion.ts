import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function animateLoadout(panel: HTMLElement, played: { current: boolean }) {
  gsap.registerPlugin(ScrollTrigger)
  let visible = false
  let eligible = false
  let complete = played.current
  let intro: gsap.core.Timeline | undefined

  function sync() {
    const running = visible && !document.hidden
    panel.toggleAttribute('data-loadout-pulses', complete)
    panel.toggleAttribute('data-loadout-running', complete && running)
    if (intro && (eligible || played.current)) {
      if (running) {
        played.current = true
        intro.play()
      } else intro.pause()
    }
  }

  const context = gsap.context(() => {
    if (complete) return
    const nodes = panel.querySelectorAll('.loadout-node-label')
    const lines = panel.querySelectorAll('.loadout-line')
    gsap.set(lines, { strokeDasharray: '1 1', strokeDashoffset: 1 })
    intro = gsap.timeline({ paused: true, onComplete: () => { complete = true; sync() } })
      .from(nodes, { autoAlpha: 0, scale: .84, duration: .32, stagger: .026, ease: 'back.out(1.6)' }, 0)
      .to(lines, { strokeDashoffset: 0, duration: .58, stagger: .022, ease: 'power2.out' }, .25)
      .set(lines, { clearProps: 'strokeDasharray,strokeDashoffset' })
  }, panel)

  const trigger = !complete && ScrollTrigger.create({
    trigger: panel,
    start: () => `top+=${panel.offsetHeight * .3} bottom`,
    end: () => `bottom-=${panel.offsetHeight * .3} top`,
    onToggle: self => { eligible = self.isActive; sync() },
  })
  if (trigger) eligible = trigger.isActive
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    sync()
  })
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

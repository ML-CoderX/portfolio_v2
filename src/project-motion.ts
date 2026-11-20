import gsap from 'gsap'

export function startProjectMotion(mode: string | undefined) {
  const panels: { art: HTMLElement; timeline: gsap.core.Timeline }[] = []
  if (mode !== 'css' && mode !== 'webgl') return { draw: () => {}, stop: () => {} }
  const context = gsap.context(() => {
    document.querySelectorAll<HTMLElement>('[data-project-art]').forEach(art => {
      const timeline = gsap.timeline({ paused: true })
      panels.push({ art, timeline })
      if (mode === 'css') {
        timeline.fromTo(art, { opacity: .65, clipPath: 'inset(0 0 12% 0)' },
          { opacity: 1, clipPath: 'inset(0 0 0% 0)', ease: 'none' })
        return
      }
      timeline.fromTo(art.querySelectorAll('[data-art-layer="background"]'), { y: 6 }, { y: 0, ease: 'none' }, 0)
      timeline.fromTo(art.querySelectorAll('[data-art-layer="middle"]'), { y: 12 }, { y: 0, ease: 'none' }, 0)
      timeline.fromTo(art.querySelectorAll('[data-art-layer="foreground"]'), { y: 24 }, { y: 0, ease: 'none' }, 0)
      const actions = {
        lens: { x: -48, rotation: -8 }, leaf: { rotation: -9 },
        scan: { scale: 1.18, opacity: .25 }, receipt: { x: -55, rotation: -12 },
        model: { x: -30, rotation: -8 }, review: { x: -90, rotation: -15 },
      }
      for (const [name, from] of Object.entries(actions)) {
        const layer = art.querySelector(`[data-art-action="${name}"]`)
        if (layer) timeline.fromTo(layer, { ...from, transformOrigin: '50% 70%' },
          { x: 0, rotation: 0, scale: 1, opacity: 1, ease: 'none' }, 0)
      }
    })
  })
  return {
    draw() {
      for (const { art, timeline } of panels) {
        // Layout coordinates stay stable while the parent card snaps into view.
        let top = 0
        let element: HTMLElement | null = art
        while (element) {
          top += element.offsetTop
          element = element.offsetParent as HTMLElement | null
        }
        const progress = gsap.utils.clamp(0, 1, (scrollY + innerHeight * .9 - top) / (innerHeight * .35))
        timeline.progress(progress)
      }
    },
    stop: () => context.revert(),
  }
}

import gsap from 'gsap'
import type { SceneMode } from '../scenes'

export function startProjectMotion(mode: SceneMode) {
  const panels: { art: HTMLElement; timeline: gsap.core.Timeline }[] = []
  if (mode === 'static') return { draw: () => {}, stop: () => {} }
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
      for (const layer of art.querySelectorAll<SVGElement>('[data-art-action]')) {
        const { artX, artRotation, artScale, artOpacity } = layer.dataset
        timeline.fromTo(layer, {
          x: Number(artX ?? 0), rotation: Number(artRotation ?? 0),
          scale: Number(artScale ?? 1), opacity: Number(artOpacity ?? 1),
          transformOrigin: '50% 70%',
        }, { x: 0, rotation: 0, scale: 1, opacity: 1, ease: 'none' }, 0)
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

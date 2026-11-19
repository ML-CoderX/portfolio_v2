import { reachEnd } from './scenes'

export function phase(progress: number, start: number, end: number) {
  const value = Math.min(1, Math.max(0, (progress - start) / (end - start)))
  return value * value * (3 - 2 * value)
}

export function prepareReach() {
  const shot = document.querySelector<HTMLElement>('[data-reach-shot]')
  const portal = document.querySelector<HTMLElement>('[data-portal-shot]')
  const arm = shot?.querySelector('[data-reach-arm]')
  const index = shot?.querySelector('[data-reach-index]')
  const thumb = shot?.querySelector('[data-reach-thumb]')
  let previous = -1

  return (progress: number) => {
    if (progress === previous) return
    previous = progress
    const travel = phase(progress, 0, reachEnd)
    const grip = phase(progress, .17, reachEnd)
    const alpha = phase(progress, 0, .09) * (1 - phase(progress, reachEnd, .48))
    shot?.style.setProperty('opacity', String(alpha))
    arm?.setAttribute('transform', `translate(${(1 - travel) * 318 - 6} ${(1 - travel) * 42 - 5})`)
    index?.setAttribute('transform', `rotate(${(1 - grip) * 12 - 3} 291 174)`)
    thumb?.setAttribute('transform', `rotate(${grip * 13 - 7} 306 233)`)
    if (portal) {
      portal.style.opacity = String(phase(progress, .54, .67) * (1 - phase(progress, .74, .96)))
      portal.style.transform = `translate(-50%, -50%) scale(${.42 + phase(progress, .53, .96) * 2.05})`
    }
  }
}

export function prepareShot(shot: HTMLElement) {
  const eye = shot.querySelector<HTMLElement>('.eye-panel')
  const shutter = shot.querySelector<HTMLElement>('.ink-shutter')
  const jar = shot.querySelector('[data-pour-jar]')
  const jarFill = shot.querySelector('[data-jar-fill]')
  const hand = shot.querySelector('[data-pour-hand]')
  const stream = shot.querySelectorAll<SVGPathElement>('[data-pour-stream]')
  const guide = stream[0]
  const fill = shot.querySelector('[data-pour-fill]')
  const splash = shot.querySelector('[data-pour-splash]')
  const drop = shot.querySelector('[data-pour-drop]')
  const leftCurtain = shot.querySelector<HTMLElement>('.curtain--left')
  const rightCurtain = shot.querySelector<HTMLElement>('.curtain--right')
  let streamLength: number | undefined
  let previous = -1

  return (progress: number) => {
    if (progress === previous) return
    previous = progress
    if (eye && shutter) {
      const reveal = phase(progress, .13, .67)
      const retreat = phase(progress, .64, 1)
      shutter.style.transform = `translateY(${-110 * reveal}%)`
      eye.style.transform = `scale(${1.13 - .30 * retreat})`
    }
    if (jar) {
      const lift = phase(progress, .18, .46) * (1 - phase(progress, .77, .99))
      const tilt = phase(progress, .24, .46) * (1 - phase(progress, .70, .9))
      const lead = phase(progress, .46, .58)
      const tail = phase(progress, .7, .84)
      const level = phase(progress, .57, .81)
      jar.setAttribute('transform', `translate(${240 + lift * 60} ${246 - lift * 77}) rotate(${63 * tilt})`)
      jarFill?.setAttribute('transform', `translate(0 ${level * 34}) rotate(${-63 * tilt})`)
      hand?.setAttribute('opacity', String(phase(progress, .08, .18) * (1 - phase(progress, .95, 1))))
      for (const path of stream) {
        path.style.strokeDasharray = `${Math.max(0, lead - tail)} 2`
        path.style.strokeDashoffset = String(-tail)
        path.style.opacity = lead > tail ? '1' : '0'
      }
      fill?.setAttribute('rx', String(54 * level))
      fill?.setAttribute('ry', String(10 * level))
      splash?.setAttribute('opacity', String(phase(progress, .55, .65) * (1 - phase(progress, .75, .87))))
      if (drop && guide) {
        const opacity = phase(progress, .73, .77) * (1 - phase(progress, .85, .87))
        drop.setAttribute('opacity', String(opacity))
        if (opacity > 0) {
          streamLength ??= guide.getTotalLength()
          const dropPoint = guide.getPointAtLength(phase(progress, .72, .87) * streamLength)
          drop.setAttribute('cx', String(dropPoint.x))
          drop.setAttribute('cy', String(dropPoint.y))
        }
      }
    }
    if (leftCurtain && rightCurtain) {
      const open = phase(progress, .16, .91)
      leftCurtain.style.transform = `translateX(${-96 * open}%)`
      rightCurtain.style.transform = `translateX(${96 * open}%)`
    }
  }
}

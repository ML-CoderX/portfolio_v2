export function phase(progress: number, start: number, end: number) {
  const value = Math.min(1, Math.max(0, (progress - start) / (end - start)))
  return value * value * (3 - 2 * value)
}

export function preparePortal(portal: HTMLElement | null) {
  let previous = -1

  return (progress: number) => {
    if (progress === previous) return
    previous = progress
    if (portal) {
      portal.style.opacity = String(phase(progress, .54, .67) * (1 - phase(progress, .74, .96)))
      portal.style.transform = `translate(-50%, -50%) scale(${.42 + phase(progress, .53, .96) * 2.05})`
    }
  }
}
export function prepareShot(shot: HTMLElement) {
  const shutter = shot.querySelector<HTMLElement>('.ink-shutter')
  const eyes = shot.querySelectorAll('[data-eye-gaze]')
  let previous = -1

  return (progress: number) => {
    if (progress === previous) return
    previous = progress
    if (shutter) {
      shutter.style.transform = `translateY(${-110 * phase(progress, .04, .3)}%)`
      const gaze = 17 * phase(progress, .18, .38) - 34 * phase(progress, .42, .68) + 17 * phase(progress, .73, .95)
      for (const eye of eyes) eye.setAttribute('transform', `translate(${gaze} 0)`)
    }
    if (shot.dataset.chapterShot === 'curtains') {
      const open = phase(progress, .16, .89)
      shot.style.setProperty('--curtain-travel', `${open * 100}%`)
    }
  }
}

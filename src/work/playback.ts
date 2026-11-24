export type StudioPlayback = { progress: number; invalidate?: () => void }
export const restoreProjectEvent = 'studio:restore-project'

export const studioTiming = {
  screenVisible: .19,
  lidOpen: .2,
  lastProjectEnd: .85,
} as const

function beatLength(projectCount: number) {
  return (studioTiming.lastProjectEnd - studioTiming.lidOpen) / projectCount
}

// The final slide (index projectCount) is the GitHub link.
export function slideAtProgress(progress: number, projectCount: number) {
  const position = projectCount ? Math.max(0, (progress - studioTiming.lidOpen) / beatLength(projectCount)) : 0
  const page = Math.floor(position)
  const fraction = position - page
  const blend = Math.max(0, Math.min(1, (fraction - .74) / .26))
  const offset = Math.min(projectCount, page + blend * blend * (3 - 2 * blend))
  const index = progress < studioTiming.screenVisible ? -1 : Math.round(offset)
  // Read down a tall card during its hold, leaving both ends still before the horizontal cut.
  const read = index === page && page < projectCount ? Math.max(0, Math.min(1, (fraction - .16) / .5)) : 0
  return { offset, index, read }
}

export function progressForSlide(index: number, projectCount: number) {
  if (index === projectCount) return studioTiming.lastProjectEnd + .025
  return studioTiming.lidOpen + index * beatLength(projectCount) + Math.min(.025, beatLength(projectCount) / 2)
}

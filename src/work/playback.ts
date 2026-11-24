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
export function slideOffset(progress: number, projectCount: number) {
  if (!projectCount) return 0
  const position = Math.max(0, (progress - studioTiming.lidOpen) / beatLength(projectCount))
  const index = Math.floor(position)
  const blend = Math.max(0, Math.min(1, (position - index - .74) / .26))
  return Math.min(projectCount, index + blend * blend * (3 - 2 * blend))
}

export function progressForSlide(index: number, projectCount: number) {
  if (index === projectCount) return studioTiming.lastProjectEnd + .025
  return studioTiming.lidOpen + index * beatLength(projectCount) + Math.min(.025, beatLength(projectCount) / 2)
}

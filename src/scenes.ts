import character from '../.scene-art/hero/character.webp'
import inkSpill from '../.scene-art/hero/ink-spill.webp'
import backdrop from '../.scene-art/work/backdrop.webp'
import portalRing from '../.scene-art/work/portal-ring.webp'
import portrait from '../.scene-art/about/portrait.webp'
import eyesPanel from '../.scene-art/about/eyes-panel.webp'
import shelf from '../.scene-art/toolkit/shelf.webp'
import stage from '../.scene-art/contact/stage.webp'

type Layer = { name: string; src: string }

export const scenes = {
  hero: { chapter: '01', layers: [
    { name: 'hero-character', src: character },
  ] },
  work: { chapter: '02', layers: [
    { name: 'work-backdrop', src: backdrop },
    { name: 'work-portal', src: portalRing },
  ] },
  about: { chapter: '03', layers: [
    { name: 'about-portrait', src: portrait },
    { name: 'about-eyes', src: eyesPanel },
  ] },
  toolkit: { chapter: '04', layers: [{ name: 'toolkit-shelf', src: shelf }] },
  contact: { chapter: '05', layers: [{ name: 'contact-stage', src: stage }] },
} satisfies Record<string, { chapter: string; layers: Layer[] }>

export type SceneId = keyof typeof scenes
export type SceneMode = 'static' | 'css' | 'webgl'

export type TransitionConfig = {
  from: SceneId
  to: SceneId
  start: string
  end: string
  shader: { kind: 'ink-spill'; texture: string }
  mobile: 'clip-fade'
}

export const heroToWork: TransitionConfig = {
  from: 'hero',
  to: 'work',
  start: 'clamp(top 85%)',
  end: 'top 25%',
  shader: { kind: 'ink-spill', texture: inkSpill },
  mobile: 'clip-fade',
}

export const chapterTransitions = [
  { from: 'work', to: 'about', shot: 'eyes', start: 'top 92%', end: 'bottom 46%' },
  { from: 'about', to: 'toolkit', shot: 'pour', start: 'top 92%', end: 'bottom 46%' },
  { from: 'toolkit', to: 'contact', shot: 'curtains', start: 'top 92%', end: 'bottom 46%' },
] as const satisfies readonly {
  from: SceneId; to: SceneId; shot: string; start: string; end: string
}[]

export const reachTarget = { x: .575, y: .225 }
export const reachEnd = .36

export const shotArtwork = { eyesPanel, portalRing, shelf, stage }

export type ScenePlayback = {
  progress: number
  origin: { x: number; y: number }
  orb: { x: number; y: number; moved: boolean }
  invalidate?: () => void
}

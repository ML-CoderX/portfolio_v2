import { sceneImage } from './scene-art'

const portalRing = sceneImage('portalRing')

type Layer = { name: string; src: string }

export const scenes = {
  hero: { chapter: '01', layers: [
    { name: 'hero-character', src: sceneImage('character') },
  ] },
  work: { chapter: '02', layers: [
    { name: 'work-backdrop', src: sceneImage('workBackdrop') },
    { name: 'work-portal', src: portalRing },
  ] },
  about: { chapter: '03', layers: [] },
  toolkit: { chapter: '04', layers: [{ name: 'toolkit-shelf', src: sceneImage('toolkitShelf') }] },
  contact: { chapter: '05', layers: [{ name: 'contact-stage', src: sceneImage('contactStage') }] },
} satisfies Record<string, { chapter: string; layers: Layer[] }>

export type SceneId = keyof typeof scenes
export type SceneMode = 'static' | 'css' | 'webgl'

export type TransitionConfig = {
  from: SceneId
  to: SceneId
  start: string
  end: string
  inkTexture: string
}

export const heroToWork: TransitionConfig = {
  from: 'hero',
  to: 'work',
  start: 'clamp(top 85%)',
  end: 'top 25%',
  inkTexture: sceneImage('inkSpill'),
}

export const chapterTransitions = [
  { from: 'work', to: 'about', shot: 'eyes', trigger: 'shot', start: 'top 88%', end: 'bottom 33%' },
  { from: 'toolkit', to: 'contact', shot: 'curtains', trigger: 'section', start: 'top 92%', end: 'top 25%' },
] as const satisfies readonly {
  from: SceneId; to: SceneId; shot: string; trigger: 'shot' | 'section'; start: string; end: string
}[]

export const shotArtwork = { eyesPanel: sceneImage('eyesPanel'), portalRing }

export type ScenePlayback = {
  progress: number
  origin: { x: number; y: number }
  orb: { x: number; y: number; moved: boolean }
  invalidate?: () => void
}

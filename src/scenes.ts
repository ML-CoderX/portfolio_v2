export const sceneChapters = {
  hero: '01',
  work: '02',
  about: '03',
  toolkit: '04',
  contact: '05',
} as const

export type SceneId = keyof typeof sceneChapters

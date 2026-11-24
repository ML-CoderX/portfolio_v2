import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { startNativeScroll } from './native-scroll'
import { copy, projects } from './content'
import { sceneChapters, type SceneId } from './scenes'
import { progressForSlide, restoreProjectEvent, slideOffset, studioTiming, type StudioPlayback } from './work/playback'

export function startSceneScroll(enhanced: boolean, playback: StudioPlayback) {
  const root = document.documentElement
  const work = document.getElementById('work')!
  const stage = work.querySelector<HTMLElement>('.studio-stage')!
  const screen = stage.querySelector<HTMLElement>('.studio-screen')!
  const track = stage.querySelector<HTMLElement>('.project-grid')!
  const cards = Array.from(track.children) as HTMLElement[]
  const dots = Array.from(stage.querySelectorAll<HTMLButtonElement>('[data-beat]'))
  const debug = document.querySelector<HTMLOutputElement>('[data-scene-debug]')!
  const chip = document.querySelector<HTMLElement>('[data-active-chapter]')!
  const energy = document.querySelector<HTMLElement>('[data-energy]')!
  const sections = [...document.querySelectorAll<HTMLElement>('[data-scene]')]
  const header = document.querySelector<HTMLElement>('.site-header')!
  const clickedHash = document.getElementById(location.hash.slice(1))
  const hashVisible = clickedHash && Math.abs(clickedHash.getBoundingClientRect().top) < 140
  const followingSection = enhanced && work.getBoundingClientRect().bottom <= header.offsetHeight
    ? sections.find(section => section.getBoundingClientRect().bottom > header.offsetHeight) : undefined
  const followingTop = followingSection?.getBoundingClientRect().top
  debug.hidden = !new URLSearchParams(location.search).has('debug')
  root.toggleAttribute('data-studio', enhanced)
  if (enhanced && hashVisible) clickedHash.scrollIntoView({ behavior: 'instant' })
  else if (followingSection && followingTop !== undefined) {
    window.scrollBy({ top: followingSection.getBoundingClientRect().top - followingTop, behavior: 'instant' })
  }

  const scroll = startNativeScroll()
  let beat = -2
  function update() {
    const p = playback.progress
    const offset = slideOffset(p, projects.length)
    const current = p < studioTiming.screenVisible ? -1 : Math.round(offset)
    if (enhanced) {
      track.style.transform = 'translate3d(' + (-100 * offset) + '%,0,0)'
      if (current !== beat) {
        cards.forEach((card, i) => { card.inert = i !== current })
        dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === current)))
        stage.dataset.cards = String(current >= 0)
        beat = current
      }
    }
    const max = root.scrollHeight - innerHeight
    energy.style.transform = 'scaleX(' + (max ? scrollY / max : 0) + ')'
    const active = scrollY >= max - 2 ? 'contact' : sections.filter(s => s.getBoundingClientRect().top <= header.offsetHeight + 34).at(-1)?.id as SceneId || 'hero'
    chip.dataset.chapter = 'CH.' + sceneChapters[active]
    chip.textContent = copy.ready.replace('CH.01', chip.dataset.chapter)
    if (!debug.hidden) debug.value = active + ' · ' + Math.round(p * 100) + '% · ' + (enhanced ? projects[current]?.title ?? (current < 0 ? 'Lid opening' : copy.allWork) : 'Static grid')
  }
  function scrub(trigger: ScrollTrigger) {
    playback.progress = trigger.progress
    update()
    playback.invalidate?.()
  }
  const trigger = enhanced ? ScrollTrigger.create({ trigger: work, start: 'top top', end: 'bottom bottom',
    onUpdate: scrub, onRefresh: scrub }) : undefined
  function go(index: number) {
    if (!trigger) return
    const progress = progressForSlide(index, projects.length)
    scroll.jumpTo(trigger.start + (trigger.end - trigger.start) * progress)
  }
  function select(event: MouseEvent) {
    const target = (event.target as Element).closest<HTMLButtonElement>('[data-beat]')
    if (target) go(Number(target.dataset.beat))
  }
  function restoreProject(event: Event) {
    if (!trigger || !(event.target instanceof HTMLElement)) return
    const index = cards.findIndex(card => card.contains(event.target as HTMLElement))
    if (index < 0) return
    ScrollTrigger.update()
    if (beat !== index) go(index)
  }
  let touch: Touch | undefined
  function begin(event: TouchEvent) { touch = event.touches[0] }
  function swipe(event: TouchEvent) {
    if (!touch || beat < 0 || document.querySelector('dialog[open]')) return
    const dx = event.changedTouches[0].clientX - touch.clientX
    const dy = event.changedTouches[0].clientY - touch.clientY
    if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy) * 1.4) go(Math.max(0, Math.min(projects.length, beat - Math.sign(dx))))
    touch = undefined
  }
  stage.addEventListener('click', select)
  stage.addEventListener(restoreProjectEvent, restoreProject)
  stage.addEventListener('touchstart', begin, { passive: true })
  stage.addEventListener('touchend', swipe, { passive: true })
  window.addEventListener('scroll', update, { passive: true })
  update()
  return () => {
    const section = enhanced && sections.find(section => section.getBoundingClientRect().bottom > header.offsetHeight)
    const sectionTop = section ? section.getBoundingClientRect().top : 0
    const project = section === work && sectionTop <= header.offsetHeight && beat >= 0
      ? cards[Math.min(beat, projects.length - 1)] : undefined
    trigger?.kill()
    scroll.dispose()
    stage.removeEventListener('click', select)
    stage.removeEventListener(restoreProjectEvent, restoreProject)
    stage.removeEventListener('touchstart', begin)
    stage.removeEventListener('touchend', swipe)
    window.removeEventListener('scroll', update)
    root.removeAttribute('data-studio')
    track.style.removeProperty('transform')
    for (const property of ['width', 'height', 'transform']) screen.style.removeProperty(property)
    cards.forEach(card => { card.inert = false })
    delete stage.dataset.cards
    delete chip.dataset.chapter
    chip.textContent = copy.ready
    energy.style.removeProperty('transform')
    playback.progress = 0
    if (project) project.scrollIntoView({ behavior: 'instant', block: 'start' })
    else if (section && section !== work) {
      const shift = section.getBoundingClientRect().top - sectionTop
      if (Math.abs(shift) > 1) window.scrollBy({ top: shift, behavior: 'instant' })
    }
  }
}

import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { startNativeScroll } from './native-scroll'
import { copy, projects } from './content'
import { sceneChapters, type SceneId } from './scenes'
import { progressForSlide, restoreProjectEvent, slideAtProgress, type StudioPlayback } from './work/playback'

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
  let readFraction = 0
  let chapter: SceneId | undefined
  function revealCardContent(keepFocusVisible = false) {
    const card = cards[beat]
    if (!card) return
    let top = readFraction * (card.scrollHeight - card.clientHeight)
    const focused = document.activeElement
    if (keepFocusVisible && focused instanceof HTMLElement && card.contains(focused)) {
      const rect = focused.getBoundingClientRect()
      const focusTop = card.scrollTop + rect.top - card.getBoundingClientRect().top
      top = Math.max(focusTop + rect.height - card.clientHeight, Math.min(top, focusTop))
    }
    card.scrollTop = top
  }
  const screenResize = enhanced ? new ResizeObserver(() => revealCardContent(true)) : undefined
  screenResize?.observe(screen)
  function update() {
    const p = playback.progress
    const { offset, index: current, read } = slideAtProgress(p, projects.length)
    if (enhanced) {
      track.style.transform = 'translate3d(' + (-100 * offset) + '%,0,0)'
      const changed = current !== beat
      if (changed) {
        cards.forEach((card, i) => { card.inert = i !== current })
        dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === current)))
        stage.dataset.cards = String(current >= 0)
        beat = current
      }
      if (changed || read !== readFraction) {
        readFraction = read
        revealCardContent()
      }
    }
    const max = root.scrollHeight - innerHeight
    energy.style.transform = 'scaleX(' + (max ? scrollY / max : 0) + ')'
    const active = scrollY >= max - 2 ? 'contact' : sections.filter(s => s.getBoundingClientRect().top <= header.offsetHeight + 34).at(-1)?.id as SceneId || 'hero'
    if (chapter !== active) {
      chapter = active
      chip.dataset.chapter = 'CH.' + sceneChapters[active]
      chip.textContent = copy.ready.replace('CH.01', chip.dataset.chapter)
    }
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
  function begin(event: TouchEvent) { touch = event.touches.length === 1 ? event.touches[0] : undefined }
  function swipe(event: TouchEvent) {
    if (!touch || event.touches.length || beat < 0 || document.querySelector('dialog[open]')) return
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
    screenResize?.disconnect()
    scroll.dispose()
    stage.removeEventListener('click', select)
    stage.removeEventListener(restoreProjectEvent, restoreProject)
    stage.removeEventListener('touchstart', begin)
    stage.removeEventListener('touchend', swipe)
    window.removeEventListener('scroll', update)
    root.removeAttribute('data-studio')
    track.style.removeProperty('transform')
    for (const property of ['width', 'height', 'transform']) screen.style.removeProperty(property)
    cards.forEach(card => { card.inert = false; card.scrollTop = 0 })
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

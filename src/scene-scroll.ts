import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { copy, projects } from './content'
import { scenes, type SceneId } from './scenes'

export type StudioPlayback = { progress: number }
const beatStart = .2
const beatLength = .65 / projects.length

export function startSceneScroll(enhanced: boolean, playback: StudioPlayback) {
  gsap.registerPlugin(ScrollTrigger)
  const root = document.documentElement
  const work = document.getElementById('work')!
  const stage = work.querySelector<HTMLElement>('.studio-stage')!
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
  debug.hidden = !new URLSearchParams(location.search).has('debug')
  root.toggleAttribute('data-studio', enhanced)
  if (enhanced && hashVisible) clickedHash.scrollIntoView({ behavior: 'instant' })

  const reduce = matchMedia('(prefers-reduced-motion: reduce)')
  const lenis = new Lenis({ smoothWheel: !reduce.matches, syncTouch: false, anchors: false,
    prevent: element => !!element.closest('dialog,[data-lenis-prevent]') })
  const tick = (seconds: number) => lenis.raf(seconds * 1000)
  gsap.ticker.add(tick)
  lenis.on('scroll', ScrollTrigger.update)
  function syncMotion() { lenis.options.smoothWheel = !reduce.matches }
  reduce.addEventListener('change', syncMotion)
  function lock() {
    if (document.querySelector('dialog[open]')) lenis.stop()
    else if (lenis.isStopped) lenis.start()
  }
  const modal = new MutationObserver(lock)
  modal.observe(document.body, { attributes: true, attributeFilter: ['open'], subtree: true })
  lock()
  let beat = -2
  function update() {
    const p = playback.progress
    const unit = Math.max(0, (p - beatStart) / beatLength)
    const base = Math.min(projects.length, Math.floor(unit))
    const slide = gsap.utils.clamp(0, 1, (unit - base - .74) / .26)
    const offset = Math.min(projects.length, base + slide * slide * (3 - 2 * slide))
    const current = p < .19 ? -1 : Math.round(offset)
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
    chip.dataset.chapter = 'CH.' + scenes[active].chapter
    chip.textContent = copy.ready.replace('CH.01', chip.dataset.chapter)
    if (!debug.hidden) debug.value = active + ' · ' + Math.round(p * 100) + '% · ' + (enhanced ? projects[current]?.title ?? (current < 0 ? 'Lid opening' : copy.allWork) : 'Static grid')
  }
  const trigger = enhanced ? ScrollTrigger.create({ trigger: work, start: 'top top', end: 'bottom bottom',
    onUpdate: self => { playback.progress = self.progress; update() },
    onRefresh: self => { playback.progress = self.progress; update() } }) : undefined
  function go(index: number) {
    if (trigger) lenis.scrollTo(trigger.start + (trigger.end - trigger.start) * (beatStart + beatLength * index + .025), { immediate: true })
  }
  function select(event: MouseEvent) {
    const target = (event.target as Element).closest<HTMLButtonElement>('[data-beat]')
    if (target) go(Number(target.dataset.beat))
  }
  let touch: Touch | undefined
  function begin(event: TouchEvent) { touch = event.touches[0] }
  function swipe(event: TouchEvent) {
    if (!touch || beat < 0 || document.querySelector('dialog[open]')) return
    const dx = event.changedTouches[0].clientX - touch.clientX
    const dy = event.changedTouches[0].clientY - touch.clientY
    if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy) * 1.4) go(gsap.utils.clamp(0, projects.length, beat - Math.sign(dx)))
    touch = undefined
  }
  function interrupt(event: KeyboardEvent) {
    if (['Home','End','PageDown','PageUp','ArrowUp','ArrowDown',' '].includes(event.key) && lenis.isScrolling === 'smooth') {
      lenis.stop()
      lenis.start()
    }
  }
  function anchor(event: MouseEvent) {
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]')
    if (!link || event.defaultPrevented || event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    const target = document.getElementById(link.hash.slice(1))
    if (!target || link.classList.contains('skip')) return
    event.preventDefault()
    if (location.hash !== link.hash) history.pushState(null, '', link.hash)
    target.tabIndex = -1
    target.focus({ preventScroll: true })
    const padding = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0
    const destination = scrollY + target.getBoundingClientRect().top - padding
    lenis.scrollTo(destination, { duration: .5, immediate: reduce.matches })
  }
  stage.addEventListener('click', select)
  stage.addEventListener('touchstart', begin, { passive: true })
  stage.addEventListener('touchend', swipe, { passive: true })
  window.addEventListener('keydown', interrupt)
  document.addEventListener('click', anchor)
  window.addEventListener('scroll', update, { passive: true })
  update()
  return () => {
    trigger?.kill()
    modal.disconnect()
    reduce.removeEventListener('change', syncMotion)
    gsap.ticker.remove(tick)
    lenis.destroy()
    stage.removeEventListener('click', select)
    stage.removeEventListener('touchstart', begin)
    stage.removeEventListener('touchend', swipe)
    window.removeEventListener('keydown', interrupt)
    document.removeEventListener('click', anchor)
    window.removeEventListener('scroll', update)
    root.removeAttribute('data-studio')
    track.style.removeProperty('transform')
    cards.forEach(card => { card.inert = false })
    playback.progress = 0
  }
}

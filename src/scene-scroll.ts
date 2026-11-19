import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { chapterTransitions, scenes, type SceneId, type ScenePlayback, type TransitionConfig } from './scenes'
import { preparePortal, prepareShot } from './shot-motion'

const nativeScrollKeys = new Set(['Home', 'End', 'PageUp', 'PageDown', 'ArrowUp', 'ArrowDown', ' '])

export function startSceneScroll(config: TransitionConfig, playback: ScenePlayback) {
  gsap.registerPlugin(ScrollTrigger)
  const root = document.documentElement
  const energy = document.querySelector<HTMLElement>('[data-energy]')
  const debug = document.querySelector<HTMLOutputElement>('[data-scene-debug]')
  const chip = document.querySelector<HTMLElement>('[data-active-chapter]')
  const initialChip = chip?.textContent ?? ''
  const header = document.querySelector<HTMLElement>('.site-header')
  const artwork = document.querySelector('.workstation')
  const destination = document.getElementById(config.to)
  const drawPortal = preparePortal()
  const chapters = chapterTransitions.flatMap(chapter => {
    const shot = document.querySelector<HTMLElement>(`[data-chapter-shot="${chapter.shot}"]`)
    const section = document.getElementById(chapter.to)
    return shot && section ? [{ chapter, shot, section, draw: prepareShot(shot), trigger: undefined as ScrollTrigger | undefined }] : []
  })
  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-scene]'))
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  let lenis: Lenis | undefined
  let trigger: ScrollTrigger | undefined
  let frame = 0
  let active: SceneId = config.from

  function reveal(section: HTMLElement, progress: number) {
    section.style.setProperty('--scene-clip', `${(1 - progress) * 65}%`)
    section.style.setProperty('--scene-fade', String(.12 + progress * .88))
  }

  function update() {
    frame = 0
    const max = root.scrollHeight - innerHeight
    const overall = max > 0 ? gsap.utils.clamp(0, 1, scrollY / max) : 0
    const scrollPadding = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0
    const boundary = Math.max((header?.offsetHeight ?? 0) + 12, scrollPadding + 2)
    let next: SceneId = config.from
    for (const section of sections) {
      if (section.getBoundingClientRect().top > boundary) break
      next = section.dataset.scene as SceneId
    }
    // The final section can be shorter than the viewport on a direct hash or End.
    const lastScene = sections.at(-1)?.dataset.scene as SceneId | undefined
    if (lastScene && max > 0 && scrollY >= max - 2) next = lastScene
    const progress = trigger?.progress ?? 0
    if (progress > 0 && playback.progress === 0) {
      const rect = artwork?.getBoundingClientRect()
      playback.origin.x = playback.orb.moved ? playback.orb.x : rect ? gsap.utils.clamp(0, 1, (rect.left + rect.width / 2) / innerWidth) : .5
      playback.origin.y = playback.orb.moved ? playback.orb.y : rect ? gsap.utils.clamp(0, 1, (rect.top + rect.height / 2) / innerHeight) : .5
    }
    if (playback.progress !== progress || next === config.from || active === config.from) playback.invalidate?.()
    playback.progress = progress
    const desktop = root.dataset.sceneMode === 'webgl'
    if (desktop) drawPortal(progress)
    root.toggleAttribute('data-ink-spill', progress > 0 && progress < 1)
    if (energy) energy.style.transform = `scaleX(${overall})`
    if (destination && root.dataset.sceneMode === 'css') reveal(destination, progress)
    let currentShot = ''
    for (const { chapter, draw, section, trigger } of chapters) {
      if (!trigger) continue
      if (desktop) draw(trigger.progress)
      else reveal(section, trigger.progress)
      if (trigger.isActive) currentShot = ` · ${chapter.from} → ${chapter.to} ${Math.round(trigger.progress * 100)}%`
    }
    if (next !== active || root.dataset.activeScene === undefined) {
      active = next
      root.dataset.activeScene = active
      if (chip) {
        chip.dataset.chapter = 'CH.' + scenes[active].chapter
        chip.textContent = initialChip.replace('CH.01', chip.dataset.chapter)
      }
    }
    if (debug && !debug.hidden) debug.value = `${active.toUpperCase()} · ${Math.round(overall * 100)}%${currentShot || ` · ${config.from} → ${config.to} ${Math.round(progress * 100)}%`}`
  }

  function schedule() { if (!frame) frame = requestAnimationFrame(update) }
  function tick(seconds: number) { lenis?.raf(seconds * 1000) }
  function syncScroll() { ScrollTrigger.update(); schedule() }
  function stopAnchor() {
    if (lenis?.isScrolling !== 'smooth') return
    lenis.stop()
    lenis.start()
  }
  function nativeScroll() {
    // Scrollbar drags can scroll the page without dispatching a pointer event.
    if (lenis?.isScrolling === 'smooth' && Math.abs(lenis.animatedScroll - scrollY) > 3) stopAnchor()
    schedule()
  }
  function keydown(event: KeyboardEvent) {
    if (nativeScrollKeys.has(event.key)) stopAnchor()
  }

  function followAnchor(event: MouseEvent) {
    if (!lenis || event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]')
    if (!link || link.hasAttribute('download') || link.target || link.classList.contains('skip')) return
    const target = document.getElementById(link.hash.slice(1))
    if (!target) return
    event.preventDefault()
    if (location.hash !== link.hash) history.pushState(null, '', link.hash)
    if (!target.hasAttribute('tabindex')) target.tabIndex = -1
    target.focus({ preventScroll: true })
    lenis.scrollTo(target, { duration: .55 })
  }

  function configure() {
    trigger?.kill()
    trigger = undefined
    for (const chapter of chapters) {
      chapter.trigger?.kill()
      chapter.trigger = undefined
    }
    lenis?.destroy()
    lenis = undefined
    gsap.ticker.remove(tick)
    const mode = root.dataset.sceneMode
    if (!reduced.matches && mode !== 'static' && mode !== undefined && destination) {
      lenis = new Lenis({ autoRaf: false, smoothWheel: false, syncTouch: false, anchors: false })
      gsap.ticker.add(tick)
      lenis.on('scroll', syncScroll)
      trigger = ScrollTrigger.create({
        trigger: destination,
        start: config.start,
        end: config.end,
        onUpdate: schedule,
        onRefresh: schedule,
      })
      for (const entry of chapters) {
        const desktop = mode === 'webgl'
        entry.trigger = ScrollTrigger.create({
          trigger: desktop && entry.chapter.shot === 'eyes' ? entry.shot : entry.section,
          start: desktop ? entry.chapter.start : 'clamp(top 85%)',
          end: desktop ? `clamp(${entry.chapter.end})` : 'clamp(top 25%)',
          onUpdate: schedule,
          onRefresh: schedule,
        })
      }
    }
    schedule()
  }

  if (debug) debug.hidden = !new URLSearchParams(location.search).has('debug')
  reduced.addEventListener('change', configure)
  window.addEventListener('scene:mode', configure)
  const resize = new ResizeObserver(schedule)
  resize.observe(document.body)
  window.addEventListener('scroll', nativeScroll, { passive: true })
  window.addEventListener('resize', schedule, { passive: true })
  window.addEventListener('wheel', stopAnchor, { passive: true })
  window.addEventListener('touchstart', stopAnchor, { passive: true })
  window.addEventListener('pointerdown', stopAnchor, { passive: true })
  window.addEventListener('popstate', stopAnchor)
  window.addEventListener('keydown', keydown)
  document.addEventListener('click', followAnchor)
  configure()

  return () => {
    cancelAnimationFrame(frame)
    reduced.removeEventListener('change', configure)
    window.removeEventListener('scene:mode', configure)
    resize.disconnect()
    window.removeEventListener('scroll', nativeScroll)
    window.removeEventListener('resize', schedule)
    window.removeEventListener('wheel', stopAnchor)
    window.removeEventListener('touchstart', stopAnchor)
    window.removeEventListener('pointerdown', stopAnchor)
    window.removeEventListener('popstate', stopAnchor)
    window.removeEventListener('keydown', keydown)
    document.removeEventListener('click', followAnchor)
    gsap.ticker.remove(tick)
    trigger?.kill()
    for (const { trigger, section } of chapters) {
      trigger?.kill()
      section.style.removeProperty('--scene-clip')
      section.style.removeProperty('--scene-fade')
    }
    lenis?.destroy()
    delete root.dataset.activeScene
    root.removeAttribute('data-ink-spill')
    destination?.style.removeProperty('--scene-clip')
    destination?.style.removeProperty('--scene-fade')
    if (chip) { delete chip.dataset.chapter; chip.textContent = initialChip }
    if (debug) debug.hidden = true
  }
}

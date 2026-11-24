import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

export function startNativeScroll() {
  gsap.registerPlugin(ScrollTrigger)
  const lenis = new Lenis({
    smoothWheel: false, syncTouch: false, anchors: false,
    prevent: element => !!element.closest('dialog,[data-lenis-prevent]'),
  })
  const tick = (seconds: number) => lenis.raf(seconds * 1000)
  gsap.ticker.add(tick)
  lenis.on('scroll', ScrollTrigger.update)

  function syncDialogLock() {
    if (document.querySelector('dialog[open]')) lenis.stop()
    else if (lenis.isStopped) lenis.start()
  }
  const modal = new MutationObserver(syncDialogLock)
  modal.observe(document.body, { attributes: true, attributeFilter: ['open'], subtree: true })
  syncDialogLock()

  function interrupt(event: KeyboardEvent) {
    if (['Home','End','PageDown','PageUp','ArrowUp','ArrowDown',' '].includes(event.key) && lenis.isScrolling === 'smooth') {
      lenis.stop()
      lenis.start()
    }
  }
  function anchor(event: MouseEvent) {
    const link = event.target instanceof Element && event.target.closest<HTMLAnchorElement>('a[href^="#"]')
    if (!link || event.defaultPrevented || event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    const target = document.getElementById(link.hash.slice(1))
    if (!target || link.classList.contains('skip')) return
    event.preventDefault()
    if (location.hash !== link.hash) history.pushState(null, '', link.hash)
    target.tabIndex = -1
    target.focus({ preventScroll: true })
    const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
    lenis.scrollTo(scrollY + target.getBoundingClientRect().top - padding, { duration: .5 })
  }
  window.addEventListener('keydown', interrupt)
  document.addEventListener('click', anchor)
  return {
    jumpTo(position: number) {
      syncDialogLock()
      lenis.scrollTo(position, { immediate: true })
      ScrollTrigger.update()
    },
    dispose() {
      window.removeEventListener('keydown', interrupt)
      document.removeEventListener('click', anchor)
      modal.disconnect()
      gsap.ticker.remove(tick)
      lenis.destroy()
    },
  }
}

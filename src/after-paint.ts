export function afterPaint(callback: () => void, delay = 500) {
  let timer = 0
  let frame = 0
  let paints: PerformanceObserver | undefined
  function schedule() {
    paints?.disconnect()
    timer = window.setTimeout(callback, delay)
  }
  if (performance.getEntriesByName('first-contentful-paint').length) schedule()
  else if (typeof PerformanceObserver !== 'undefined' && PerformanceObserver.supportedEntryTypes.includes('paint')) {
    paints = new PerformanceObserver(list => {
      if (list.getEntries().some(entry => entry.name === 'first-contentful-paint')) schedule()
    })
    paints.observe({ type: 'paint', buffered: true })
  } else {
    frame = requestAnimationFrame(() => { frame = requestAnimationFrame(schedule) })
  }
  return () => { paints?.disconnect(); cancelAnimationFrame(frame); clearTimeout(timer) }
}

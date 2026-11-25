import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium, devices, firefox, webkit } from '@playwright/test'


const baseURL = process.env.QA_URL || 'http://127.0.0.1:4173'
const runners = {
  chrome: [chromium, { channel: 'chrome', ignoreDefaultArgs: ['--hide-scrollbars'], args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] }],
  firefox: [firefox, {}],
  webkit: [webkit, {}],
}
const openingOnly = process.argv.includes('--opening-only')
const targets = process.argv.slice(2).filter(flag => flag !== '--opening-only')
const names = targets.length ? targets : Object.keys(runners)
await mkdir('qa', { recursive: true })

async function selectBeat(page, index) {
  await page.locator('[data-beat="' + index + '"]').click()
  await page.waitForFunction(i => document.querySelector('[data-beat="' + i + '"]').getAttribute('aria-current') === 'true', index)
}

async function verifyScrollOverLaptop(browser) {
  const page = await browser.newPage({ viewport: { width: 390, height: 740 }, hasTouch: true })
  try {
    await page.goto(baseURL)
    await page.waitForFunction(() => document.documentElement.hasAttribute('data-studio'))
    await selectBeat(page, 0)
    const first = page.locator('#work article').first()
    await page.waitForFunction(() => {
      const card = document.querySelector('#work article')
      return card.scrollHeight > card.clientHeight && card.clientHeight > 0
    })
    const bounds = await first.boundingBox()
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
    const start = await page.evaluate(() => scrollY)
    await page.mouse.wheel(0, 80)
    await page.waitForFunction(top => scrollY > top + 40 && document.querySelector('#work article').scrollTop > 0, start)
    const forward = await page.evaluate(() => scrollY)
    await page.mouse.wheel(0, -80)
    await page.waitForFunction(top => scrollY < top - 40, forward)
    const touch = await page.context().newCDPSession(page)
    const x = Math.round(bounds.x + bounds.width / 2)
    const y = Math.round(bounds.y + bounds.height / 2)
    const beforeSwipe = await page.evaluate(() => scrollY)
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
    for (const distance of [25, 50, 75, 100]) {
      await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - distance }] })
    }
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await page.waitForFunction(top => scrollY > top + 30, beforeSwipe)
    await touch.detach()
    await page.mouse.wheel(0, 5000)
    await page.waitForFunction(() => document.querySelector('#about').getBoundingClientRect().top < innerHeight)
    await selectBeat(page, 0)
    await first.getByRole('link', { name: /GitHub/ }).focus()
    const beforeResize = await first.evaluate(card => card.clientWidth)
    await page.setViewportSize({ width: 360, height: 740 })
    await page.waitForFunction(width => document.querySelector('#work article').clientWidth < width, beforeResize)
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    assert.ok(await first.evaluate(card => {
      const link = document.activeElement.getBoundingClientRect()
      const bounds = card.getBoundingClientRect()
      return link.top >= bounds.top - 1 && link.bottom <= bounds.bottom + 1
    }), 'Keyboard focus must reveal the link in a tall card')
  } finally {
    await page.close()
  }
}

async function verifyEyeScroll(page) {
  async function seek(progress, direction) {
    await page.locator('[data-chapter-shot="eyes"]').evaluate((panel, fraction) => {
      const header = document.querySelector('.site-header')
      const { top, height } = panel.getBoundingClientRect()
      const start = scrollY + top - innerHeight * .9
      const end = scrollY + top + height - header.offsetHeight
      scrollTo({ top: start + (end - start) * fraction, behavior: 'instant' })
    }, progress)
    await page.waitForFunction(sign => [...document.querySelectorAll('[data-eye-gaze]')].every(eye =>
      new DOMMatrixReadOnly(eye.getAttribute('transform') || undefined).m41 * sign > 15), direction)
  }

  await seek(.34, -1)
  await seek(.69, 1)
  await seek(.34, -1)
  await page.waitForTimeout(200)
  const gaze = await page.locator('[data-eye-gaze]').first().evaluate(eye =>
    new DOMMatrixReadOnly(eye.getAttribute('transform') || undefined).m41)
  assert.ok(gaze < -15, 'The eyes must hold their position when the page stops')
}

async function verifyScenes(page) {
  await page.locator('.hero a[href="#work"]').first().click()
  await page.waitForFunction(() => location.hash === '#work' && Math.abs(document.getElementById('work').getBoundingClientRect().top - parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)) < 3).catch(async error => { throw new Error('Work anchor ' + JSON.stringify(await page.evaluate(() => [location.hash,scrollY,document.getElementById('work').getBoundingClientRect().top,getComputedStyle(document.documentElement).scrollPaddingTop])), { cause: error }) })
  for (const index of [0, 1, 2, 3, 4, 3, 2, 1, 0]) await selectBeat(page, index)
  assert.equal(await page.locator('.studio-final a').getAttribute('href'), 'https://github.com/ML-CoderX')
  await verifyEyeScroll(page)
  await page.locator('.r3f-layer canvas').evaluate(canvas => canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true })))
  await page.waitForFunction(() => !document.documentElement.hasAttribute('data-studio'))
  assert.equal(await page.locator('#work article:not([inert])').count(), 4)
}
async function verifyTheme(page, name) {
  await page.goto(baseURL)
  const theme = page.getByRole('switch', { name: 'Night mode' })
  await page.locator('.theme-toggle-art sakuga-toggle').waitFor()
  assert.equal(await theme.getAttribute('aria-checked'), 'false')
  assert.equal(await theme.count(), 1)
  await theme.press('Space')
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'night')
  assert.equal(await theme.getAttribute('aria-checked'), 'true')
  assert.equal(await page.locator('sakuga-toggle').evaluate(toggle => toggle.checked), true)
  const paperColor = await page.locator('.project').first().evaluate(card => {
    const surface = !card.closest('[data-studio]') ? card
      : card.querySelector(matchMedia('(max-width: 900px)').matches ? '.project-page' : '.project-caption')
    return getComputedStyle(surface).backgroundColor
  })
  assert.equal(paperColor, 'rgb(38, 32, 49)')
  assert.equal(await page.locator('meta[name="theme-color"]').getAttribute('content'), '#171321')
  await page.reload()
  await page.waitForFunction(() => document.querySelector('.theme-switch').getAttribute('aria-checked') === 'true')
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'night')
  if (name === 'chrome-desktop') await page.screenshot({ path: 'qa/night-mode.png', fullPage: false })
  await theme.click()
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'day')
  assert.equal(await theme.getAttribute('aria-checked'), 'false')
}

async function verifyMotionSwitch(page) {
  const motion = page.getByRole('switch', { name: 'Motion', exact: true })
  await page.locator('.r3f-layer canvas').waitFor()
  await motion.press('Space')
  await page.locator('.r3f-layer').waitFor({ state: 'detached' })
  assert.equal(await motion.getAttribute('aria-checked'), 'false')
  assert.equal(await page.locator('#work article:not([inert])').count(), 4)
  assert.equal(await page.locator('.studio-screen').evaluate(node => node.style.width), '')
  const requests = []
  const record = request => requests.push(request.url())
  page.on('request', record)
  await page.reload()
  await motion.waitFor()
  await page.waitForFunction(() => document.querySelector('.motion-switch').getAttribute('aria-checked') === 'false')
  assert.equal(await page.locator('#opening-screen').isVisible(), false)
  assert.ok(!requests.some(url => /Workstation-|scene-scroll-|sakuga-vfx/.test(url)))
  page.off('request', record)
  await motion.press('Space')
  await page.waitForFunction(() => document.documentElement.hasAttribute('data-studio'))
  assert.equal(await motion.getAttribute('aria-checked'), 'true')
}

async function interact(browser, name, options = {}) {
  const page = await browser.newPage(options)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  const responses = []
  page.on('response', response => responses.push(response.url()))
  await page.goto(new URL('?debug', baseURL).href, { waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { level: 1, name: 'Saad AR' }).waitFor()
  await page.waitForFunction(() => !!customElements.get('sakuga-button'))
  await page.waitForFunction(() => document.documentElement.hasAttribute('data-studio'))
  const resources = await page.evaluate(() => ({
    paint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
    enhancements: performance.getEntriesByType('resource')
      .filter(entry => entry.name.includes('/sakuga-vfx/') || entry.name.includes('/Workstation-'))
      .map(entry => entry.startTime),
  }))
  if (resources.paint) assert.ok(resources.enhancements.every(time => time > resources.paint))
  assert.equal(await page.locator('#work article').count(), 4)
  assert.equal(await page.locator('#about figure.character > *').count(), 1)
  assert.match(await page.locator('#about figure.character > img').getAttribute('src'), /portrait-/)
  assert.ok(await page.locator('html').evaluate(element => element.scrollWidth <= element.clientWidth), 'Horizontal overflow')
  assert.ok(responses.some(url => url.includes('/sakuga-vfx/button.js')))
  await page.screenshot({ path: 'qa/' + name + '.png', fullPage: false })
  const dossier = page.getByRole('button', { name: 'Open dossier · Cashlio' })
  await selectBeat(page, 2)
  await dossier.click()
  await page.waitForFunction(() => !!customElements.get('sakuga-tooltip'))
  const dialog = page.getByRole('dialog')
  await dialog.getByText('Architecture blueprint').waitFor()
  assert.equal(await page.locator('html').evaluate(element => getComputedStyle(element).overflow), 'hidden')
  for (let index = 0; index < 4; index++) await page.keyboard.press('Tab')
  assert.ok(await dialog.evaluate(element => element.contains(document.activeElement)))
  await page.keyboard.press('Escape')
  await dialog.waitFor({ state: 'hidden' })
  await page.waitForFunction(() => document.activeElement?.textContent.includes('Open dossier') && document.activeElement.closest('article')?.textContent.includes('Cashlio')).catch(async e => { throw new Error(JSON.stringify(await page.evaluate(() => [scrollY,document.activeElement.tagName,document.activeElement.textContent.slice(0,40),document.querySelector('[data-scene-debug]').value])),{cause:e}) })
  assert.notEqual(await page.locator('html').evaluate(element => getComputedStyle(element).overflow), 'hidden')
  await selectBeat(page, 3)
  await page.getByRole('button', { name: 'Open dossier · DocuAI' }).click()
  await dialog.getByText('Run the prediction model').waitFor()
  await page.mouse.click(3, 3)
  await dialog.waitFor({ state: 'hidden' })
  await selectBeat(page, 2)
  const chip = page.getByRole('button', { name: 'Angular', exact: true })
  if (options.hasTouch) await chip.tap()
  else await chip.focus()
  const tip = page.locator('sakuga-tooltip[data-open]').getByRole('tooltip')
  await tip.waitFor()
  await page.waitForFunction(() => {
    const tooltip = document.querySelector('sakuga-tooltip[data-open]')?.shadowRoot?.querySelector('[role="tooltip"]')
    const rect = tooltip?.getBoundingClientRect()
    return rect && rect.width > 100 && rect.left >= 0 && rect.right <= innerWidth
  })
  await page.keyboard.press('Escape')
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
    writeText: async value => { window.__copiedEmail = value },
  } }))
  await page.locator('#contact').scrollIntoViewIfNeeded()
  await page.waitForFunction(() => !!customElements.get('sakuga-toast'))
  await page.locator('sakuga-button').getByRole('button', { name: 'Copy', exact: true }).click()
  await page.getByText('Email copied!', { exact: true }).waitFor()
  assert.equal(await page.evaluate(() => window.__copiedEmail), 'rsaadt3@gmail.com')
  assert.ok(await page.locator('.r3f-layer canvas, canvas.sakuga-fx').count() <= 1)
  await verifyScenes(page)
  await verifyTheme(page, name)
  await verifyMotionSwitch(page)
  assert.deepEqual(errors, [])
  await page.close()
}

async function fallbacks(browser) {
  const passive = await browser.newPage({ javaScriptEnabled: false })
  await passive.goto(baseURL)
  await passive.getByRole('heading', { name: 'Saad AR', level: 1 }).waitFor()
  await passive.locator('#opening-screen').waitFor({ state: 'hidden' })
  await passive.getByText('Open dossier', { exact: true }).first().click()
  await passive.getByText('Select a profile', { exact: true }).waitFor()
  assert.equal(await passive.locator('#work article').count(), 4)
  await passive.close()

  const reduced = await browser.newPage({ reducedMotion: 'reduce' })
  const requests = []
  reduced.on('request', request => requests.push(request.url()))
  await reduced.goto(baseURL)
  await reduced.locator('#opening-screen').waitFor({ state: 'hidden' })
  await reduced.waitForFunction(() => document.querySelector('.motion-switch').getAttribute('aria-checked') === 'false')
  await reduced.getByRole('button', { name: 'Open dossier · Cashlio' }).waitFor()
  await reduced.locator('.closed-fallback').waitFor()
  assert.equal(await reduced.locator('canvas').count(), 0)
  await reduced.locator('#about .about-eyes img').waitFor({ state: 'visible' })
  assert.equal(await reduced.locator('.eye-gaze-overlay').isVisible(), false)
  await reduced.locator('#contact .contact-stage').waitFor({ state: 'visible' })
  assert.ok(!requests.some(url => url.includes('/sakuga-vfx/') || url.includes('/Workstation-')))
  await reduced.getByRole('switch', { name: 'Night mode' }).click()
  assert.equal(await reduced.locator('html').getAttribute('data-theme'), 'night')
  assert.equal(await reduced.locator('sakuga-toggle').count(), 0)
  await reduced.close()

  const blocked = await browser.newPage()
  await blocked.route('**/sakuga-vfx/**', route => route.abort())
  await blocked.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type.startsWith('webgl') ? null : get.call(this, type, ...args)
    }
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async () => { throw new Error('Denied') },
    } })
    document.execCommand = () => false
  })
  await blocked.goto(baseURL)
  await blocked.locator('#opening-screen').waitFor({ state: 'detached' })

  await blocked.locator('.closed-fallback').waitFor()
  await blocked.locator('.r3f-layer').waitFor({ state: 'detached' })
  await blocked.getByRole('button', { name: 'Copy', exact: true }).click()
  await blocked.getByText('Email selected. Use your device’s copy command.').waitFor()
  await blocked.getByRole('switch', { name: 'Night mode' }).click()
  await blocked.waitForFunction(() => document.documentElement.dataset.theme === 'night')
  await blocked.locator('canvas').waitFor({ state: 'detached' })
  await blocked.close()
}

async function verifyOpeningScreen(browser, name) {
  const page = await browser.newPage()
  let releaseImage
  const delay = new Promise(resolve => { releaseImage = resolve })
  await page.route('**/fonts/bebas-neue-latin-400-normal.woff2', async route => {
    await delay
    await route.continue()
  })
  try {
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' })
    const opening = page.locator('#opening-screen')
    await opening.waitFor({ state: 'visible' })
    await opening.getByRole('progressbar', { name: 'Portfolio loading progress' }).waitFor()
    assert.equal(await page.locator('.hero-entrance, .r3f-layer').count(), 0)
    releaseImage()
    await opening.waitFor({ state: 'detached' })
    await page.locator('.closed-fallback').waitFor({ state: 'attached' })
  } finally {
    releaseImage()
    await page.close()
  }

  const noApp = await browser.newPage()
  try {
    await noApp.route('**/assets/index-*.js', route => route.abort())
    await noApp.goto(baseURL, { waitUntil: 'domcontentloaded' })
    await noApp.getByRole('progressbar', { name: 'Portfolio loading progress' }).waitFor()
    await noApp.keyboard.press('Tab')
    await noApp.locator('#opening-screen').waitFor({ state: 'detached' })
  } finally {
    await noApp.close()
  }
}

for (const name of names) {
  const [engine, options] = runners[name]
  let browser
  try {
    browser = await engine.launch(options)
    if (openingOnly || name === 'chrome') await verifyOpeningScreen(browser, name)
    if (openingOnly) {
      await fallbacks(browser)
      console.log(name + ' ' + browser.version() + ' opening screen passed')
      continue
    }
    await interact(browser, name + '-desktop', { viewport: { width: 1440, height: 900 } })
    if (name === 'chrome') await verifyScrollOverLaptop(browser)
    await fallbacks(browser)
    if (name !== 'firefox') {
      await interact(browser, name + '-mobile', { ...devices[name === 'chrome' ? 'Pixel 7' : 'iPhone 15'] })
    }
    console.log(name + ' ' + browser.version() + ' passed')
  } catch (error) {
    console.error(name, error)
    process.exitCode = 1
  } finally {
    await browser?.close()
  }
}

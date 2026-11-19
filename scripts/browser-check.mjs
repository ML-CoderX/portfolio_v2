import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium, devices, firefox, webkit } from '@playwright/test'
import sharp from 'sharp'

const baseURL = process.env.QA_URL || 'http://127.0.0.1:4173'
const runners = {
  chrome: [chromium, { channel: 'chrome', ignoreDefaultArgs: ['--hide-scrollbars'], args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] }],
  firefox: [firefox, {}],
  webkit: [webkit, {}],
}
const targets = process.argv.slice(2)
const names = targets.length ? targets : Object.keys(runners)
await mkdir('qa', { recursive: true })

function screenPixel(screenshot, left, top) {
  return sharp(screenshot).extract({ left, top, width: 1, height: 1 }).removeAlpha().raw().toBuffer()
}

async function verifyChapterShots(page, name, mode) {
  const shots = page.locator('[data-chapter-shot]')
  if (mode !== 'webgl') {
    assert.equal(await shots.filter({ visible: true }).count(), 0)
    return
  }
  async function atShot(shot, progress) {
    await page.evaluate(({ shot, progress }) => {
      const rect = document.querySelector(`[data-chapter-shot="${shot}"]`).getBoundingClientRect()
      const start = rect.top + scrollY - innerHeight * .92
      const end = rect.bottom + scrollY - innerHeight * .46
      scrollTo({ top: start + (end - start) * progress, behavior: 'instant' })
    }, { shot, progress })
    const destination = { eyes: 'about', pour: 'toolkit', curtains: 'contact' }[shot]
    await page.waitForFunction(({ destination, progress }) => {
      const match = document.querySelector('[data-scene-debug]').value.match(new RegExp(destination + ' (\\d+)%$'))
      return match && Math.abs(Number(match[1]) - progress * 100) <= 2
    }, { destination, progress })
  }
  const shutter = page.locator('.ink-shutter')
  const jar = page.locator('[data-pour-jar]')
  const stream = page.locator('[data-pour-stream]').first()
  const curtain = page.locator('.curtain--left')
  await atShot('eyes', .82)
  assert.match(await shutter.evaluate(element => element.style.transform), /-110%/)
  if (name === 'chrome-desktop') await page.screenshot({ path: 'qa/scene-eyes.png' })
  await atShot('eyes', .1)
  assert.match(await shutter.evaluate(element => element.style.transform), /translateY\(0%\)/)
  await atShot('pour', .62)
  assert.match(await jar.getAttribute('transform'), /rotate\(63\)/)
  assert.equal(await stream.evaluate(element => getComputedStyle(element).opacity), '1')
  if (name === 'chrome-desktop') await page.screenshot({ path: 'qa/scene-pour.png' })
  await atShot('pour', .22)
  assert.equal(await stream.evaluate(element => getComputedStyle(element).opacity), '0')
  await atShot('curtains', .73)
  assert.ok(await curtain.evaluate(element => parseFloat(element.style.transform.slice(11)) < -65))
  if (name === 'chrome-desktop') await page.screenshot({ path: 'qa/scene-curtains.png' })
  await atShot('curtains', .10)
  assert.match(await curtain.evaluate(element => element.style.transform), /translateX\(0%\)/)
}

async function verifyScenes(page, name, touch) {
  const debug = page.locator('[data-scene-debug]')
  await debug.waitFor()
  const settleScroll = () => page.evaluate(() => new Promise(resolve => {
    let position = scrollY
    let changed = performance.now()
    function settle(now) {
      if (scrollY !== position) { position = scrollY; changed = now }
      if (now - changed >= 160) resolve(position)
      else requestAnimationFrame(settle)
    }
    requestAnimationFrame(settle)
  }))
  const atProgress = async progress => {
    await page.evaluate(value => {
      const workTop = document.querySelector('#work').getBoundingClientRect().top + scrollY
      const start = Math.max(0, workTop - innerHeight * .85)
      const end = workTop - innerHeight * .25
      scrollTo({ top: start + (end - start) * value, behavior: 'instant' })
    }, progress)
    await page.waitForFunction(value => {
      const match = document.querySelector('[data-scene-debug]').value.match(/work (\d+)%$/)
      return match && Math.abs(Number(match[1]) - value * 100) <= 2
    }, progress)
  }

  const mode = await page.locator('html').getAttribute('data-scene-mode')
  if (touch) assert.notEqual(mode, 'webgl')
  if (name === 'chrome-mobile') assert.equal(mode, 'css')
  if (mode === 'webgl' || mode === 'css') {
    await atProgress(.2)
    if (mode === 'webgl') {
      const firstGrip = await page.locator('[data-reach-index]').getAttribute('transform')
      await atProgress(.35)
      assert.notEqual(await page.locator('[data-reach-index]').getAttribute('transform'), firstGrip)
      assert.equal(await page.locator('[data-reach-shot]').evaluate(element => getComputedStyle(element).opacity), '1')
      if (name === 'chrome-desktop') await page.screenshot({ path: 'qa/scene-reach.png' })
    }
    await atProgress(.5)
    if (name === 'chrome-desktop') {
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      const screenshot = await page.screenshot({ path: 'qa/hero-work-midpoint.png' })
      const [red, green, blue] = await screenPixel(screenshot, 8, 110)
      assert.ok(Math.max(green, blue) < 160 && green < Math.max(red, 25), 'Ink did not cover the artwork at midpoint')
    }
    await atProgress(.85)
    await atProgress(.2)
    if (touch) {
      const artwork = page.locator('#work .scene-art')
      assert.match(await artwork.evaluate(element => getComputedStyle(element).clipPath), /inset/)
    } else {
      const viewport = page.viewportSize()
      await page.setViewportSize({ width: viewport.width, height: viewport.height - 90 })
      await atProgress(.5)
      await page.setViewportSize(viewport)
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.locator('.r3f-layer').waitFor({ state: 'detached' })
      assert.equal(await page.locator('.workstation > img').evaluate(element => getComputedStyle(element).opacity), '1')
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await page.waitForFunction(previous => document.documentElement.dataset.sceneMode === previous, mode)
    }
  }
  await verifyChapterShots(page, name, mode)

  if (!touch) {
    await page.evaluate(() => document.activeElement.blur())
    await page.keyboard.press('Home')
    await page.waitForFunction(() => scrollY === 0)
    const gutter = await page.evaluate(() => innerWidth - document.documentElement.clientWidth)
    if (gutter > 0 && name === 'chrome-desktop') {
      const thumb = await page.evaluate(() => innerHeight ** 2 / document.documentElement.scrollHeight)
      const x = page.viewportSize().width - gutter / 2
      await page.mouse.move(x, thumb / 2)
      await page.mouse.down()
      await page.mouse.move(x, thumb / 2 + 120, { steps: 8 })
      await page.mouse.up()
      await page.waitForFunction(() => scrollY > 0)
      await page.keyboard.press('Home')
      await page.waitForFunction(() => scrollY === 0)
      console.log('Native scrollbar drag passed')
    }
    await page.mouse.move(140, 160)
    await page.mouse.wheel(0, 120)
    await page.waitForFunction(() => scrollY >= 100)
    await settleScroll()
    await page.keyboard.press('PageDown')
    await page.waitForFunction(() => scrollY > innerHeight / 2)
    const pageDown = await settleScroll()
    await page.keyboard.press('PageUp')
    await page.waitForFunction(previous => scrollY < previous - 100, pageDown)
    await settleScroll()
    await page.keyboard.press('End')
    await page.waitForFunction(() => scrollY >= document.documentElement.scrollHeight - innerHeight - 2)
    await page.waitForFunction(() => document.documentElement.dataset.activeScene === 'contact')
    await settleScroll()
    await page.keyboard.press('Home')
    await page.waitForFunction(() => scrollY === 0)
    await page.locator('.hero a[href="#work"]').first().click()
    await page.waitForFunction(() => location.hash === '#work' && Math.abs(document.querySelector('#work').getBoundingClientRect().top - parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)) < 3)
    assert.equal(await page.evaluate(() => document.activeElement.id), 'work')
    await page.waitForFunction(() => document.querySelector('[data-active-chapter]').dataset.chapter === 'CH.02')
    await page.goBack()
    await page.waitForFunction(() => !location.hash && scrollY < 3)
    await page.goForward()
    await page.waitForFunction(() => location.hash === '#work' && scrollY > 0)
    if (mode === 'webgl') {
      await page.locator('.r3f-layer canvas').evaluate(canvas => canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true })))
      await page.waitForFunction(() => document.documentElement.dataset.sceneMode === 'static')
      await page.locator('.r3f-layer').waitFor({ state: 'detached' })
      assert.equal(await page.locator('.workstation > img').evaluate(element => getComputedStyle(element).opacity), '1')
    }
    await page.goto(new URL('?debug#contact', baseURL).href)
    await page.waitForFunction(() => document.documentElement.dataset.activeScene === 'contact')
  }
}

async function interact(browser, name, options = {}) {
  const page = await browser.newPage(options)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  const responses = []
  page.on('response', response => responses.push(response.url()))
  await page.goto(new URL('?debug', baseURL).href)
  await page.getByRole('heading', { level: 1, name: 'Saad AR' }).waitFor()
  await page.waitForFunction(() => !!customElements.get('sakuga-button'))
  if (name === 'chrome-desktop') {
    await page.waitForFunction(() => document.documentElement.dataset.sceneMode === 'webgl', undefined, { timeout: 12000 })
    await page.mouse.move(800, 215)
    await page.waitForTimeout(750)
    assert.ok(Math.max(...await screenPixel(await page.screenshot(), 800, 215)) < 80, 'Orb should follow the cursor')
    await page.mouse.move(850, 275)
    await page.waitForTimeout(750)
    const moved = await page.screenshot({ path: 'qa/hero-orb.png' })
    assert.ok(Math.max(...await screenPixel(moved, 850, 275)) < 80 && Math.max(...await screenPixel(moved, 800, 215)) > 120, 'Orb should leave the previous point')
  }
  const resources = await page.evaluate(() => ({
    paint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
    enhancements: performance.getEntriesByType('resource')
      .filter(entry => entry.name.includes('/sakuga-vfx/') || entry.name.includes('/Workstation-'))
      .map(entry => entry.startTime),
  }))
  if (resources.paint) assert.ok(resources.enhancements.every(time => time > resources.paint))
  assert.equal(await page.locator('article').count(), 4)
  assert.ok(await page.locator('html').evaluate(element => element.scrollWidth <= element.clientWidth), 'Horizontal overflow')
  assert.ok(responses.some(url => url.includes('/sakuga-vfx/button.js')))
  await page.screenshot({ path: 'qa/' + name + '.png', fullPage: true })
  const dossier = page.getByRole('button', { name: 'Open dossier · Cashlio' })
  await dossier.click()
  await page.waitForFunction(() => !!customElements.get('sakuga-tooltip'))
  const dialog = page.getByRole('dialog')
  await dialog.getByText('Architecture blueprint').waitFor()
  assert.equal(await page.locator('html').evaluate(element => getComputedStyle(element).overflow), 'hidden')
  for (let index = 0; index < 4; index++) await page.keyboard.press('Tab')
  assert.ok(await dialog.evaluate(element => element.contains(document.activeElement)))
  await page.keyboard.press('Escape')
  await dialog.waitFor({ state: 'hidden' })
  assert.ok(await dossier.evaluate(element => element === document.activeElement))
  assert.notEqual(await page.locator('html').evaluate(element => getComputedStyle(element).overflow), 'hidden')
  await page.getByRole('button', { name: 'Open dossier · DocuAI' }).click()
  await dialog.getByText('Run the prediction model').waitFor()
  await page.mouse.click(3, 3)
  await dialog.waitFor({ state: 'hidden' })
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
  await verifyScenes(page, name, options.hasTouch)
  assert.deepEqual(errors, [])
  await page.close()
}

async function fallbacks(browser) {
  const passive = await browser.newPage({ javaScriptEnabled: false })
  await passive.goto(baseURL)
  await passive.getByRole('heading', { name: 'Saad AR', level: 1 }).waitFor()
  await passive.getByText('Open dossier', { exact: true }).first().click()
  await passive.getByText('Select a profile', { exact: true }).waitFor()
  assert.equal(await passive.locator('main article').count(), 4)
  await passive.close()

  const reduced = await browser.newPage({ reducedMotion: 'reduce' })
  const requests = []
  reduced.on('request', request => requests.push(request.url()))
  await reduced.goto(baseURL)
  await reduced.getByRole('button', { name: 'Open dossier · Cashlio' }).waitFor()
  await reduced.locator('.workstation > img').waitFor()
  assert.equal(await reduced.locator('canvas').count(), 0)
  assert.equal(await reduced.locator('[data-chapter-shot]').filter({ visible: true }).count(), 0)
  assert.ok(!requests.some(url => url.includes('/sakuga-vfx/') || url.includes('/Workstation-')))
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
  if (await blocked.evaluate(() => 'WebGL2RenderingContext' in window)) {
    await blocked.waitForFunction(() => performance.getEntriesByType('resource').some(entry => entry.name.includes('/Workstation-')))
  }
  await blocked.locator('.workstation > img').waitFor()
  await blocked.locator('.r3f-layer').waitFor({ state: 'detached' })
  await blocked.getByRole('button', { name: 'Copy', exact: true }).click()
  await blocked.getByText('Email selected. Use your device’s copy command.').waitFor()
  await blocked.locator('canvas').waitFor({ state: 'detached' })
  await blocked.close()
}

for (const name of names) {
  const [engine, options] = runners[name]
  let browser
  try {
    browser = await engine.launch(options)
    await interact(browser, name + '-desktop', { viewport: { width: 1440, height: 900 } })
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

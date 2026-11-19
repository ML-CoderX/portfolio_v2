import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium, devices, firefox, webkit } from '@playwright/test'

const baseURL = process.env.QA_URL || 'http://127.0.0.1:4173'
const runners = {
  chrome: [chromium, { channel: 'chrome', args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] }],
  firefox: [firefox, {}],
  webkit: [webkit, {}],
}
const targets = process.argv.slice(2)
const names = targets.length ? targets : Object.keys(runners)
await mkdir('qa', { recursive: true })

async function interact(browser, name, options = {}) {
  const page = await browser.newPage(options)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  const responses = []
  page.on('response', response => responses.push(response.url()))
  await page.goto(baseURL)
  await page.getByRole('heading', { level: 1, name: 'Saad AR' }).waitFor()
  await page.waitForFunction(() => !!customElements.get('sakuga-button'))
  if (name === 'chrome-desktop') {
    await page.locator('.workstation img.model-painted').waitFor({ state: 'attached', timeout: 12000 })
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
  assert.equal(await page.evaluate(() => window.__copiedEmail), 'saad.ar.dev@gmail.com')
  assert.ok(await page.locator('canvas.sakuga-fx').count() <= 1)
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
  await reduced.locator('.workstation img').waitFor()
  assert.equal(await reduced.locator('canvas').count(), 0)
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
  await blocked.locator('.workstation img').waitFor()
  await blocked.getByRole('button', { name: 'Copy', exact: true }).click()
  await blocked.getByText('Email selected. Use your device’s copy command.').waitFor()
  assert.equal(await blocked.locator('canvas').count(), 0)
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

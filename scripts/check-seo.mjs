import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { load } from 'cheerio'
import sharp from 'sharp'

const read = file => readFile(new URL('../dist/' + file, import.meta.url))
const $ = load(await read('index.html'))
const canonical = 'https://saadar.dev/'
assert.ok($('title').text().trim(), 'Missing title')
assert.ok($('meta[name="description"]').attr('content')?.trim(), 'Missing description')
assert.equal($('link[rel="canonical"]').attr('href'), canonical, 'Invalid canonical')
assert.equal($('html').attr('lang'), 'en', 'Missing language')
assert.equal($('h1').length, 1, 'Expected one h1')
assert.ok($('h1').text().trim(), 'Empty h1')
assert.equal($('main section[id]').length, 5, 'Expected five prerendered sections')
assert.deepEqual($('#work article h3').toArray().map(heading => $(heading).text()), [
  'Digital Safety Hub',
  'Agro AI Advisory Platform',
  'Cashlio — Personal Finance App',
  'DocuAI — Clinical Support Prototype',
])
assert.equal($('#work article:has(h3:contains("Agro AI Advisory Platform")) a[href^="https://github.com/"]').attr('href'),
  'https://github.com/ML-CoderX/agro_ai')
assert.equal($('#work article:has(h3:contains("Digital Safety Hub")) a[href^="https://github.com/"]').attr('href'),
  'https://github.com/mdd700155-cloud/-digital-safety-hub')
assert.equal($('details.dossier-disclosure').length, 2, 'Expected two static dossiers')
assert.equal($('a[href="/Saad_Resume.pdf"]').length, 2, 'Expected both résumé links')
assert.equal($('a[href="/Saad_Resume.pdf"][download]').length, 1, 'Expected one résumé download link')
for (const field of ['og:title','og:description','og:url','og:image','og:image:alt']) {
  assert.ok($('meta[property="' + field + '"]').attr('content'), 'Missing ' + field)
}
const schema = JSON.parse($('script[type="application/ld+json"]').text())
assert.equal(schema['@type'], 'ProfilePage')
assert.equal(schema.mainEntity['@type'], 'Person')
assert.equal(schema.url, canonical)
assert.equal(schema.mainEntity.url, canonical)
assert.ok(schema.mainEntity.name)
assert.ok($('meta[name="twitter:card"]').attr('content'))
assert.equal($('a[href="#"]').length, 0, 'Found a placeholder href')
const { width, height } = await sharp(await read('og.png')).metadata()
assert.deepEqual([width, height], [1200, 630])
for (const file of ['robots.txt','sitemap.xml','404.html','Saad_Resume.pdf','favicon.svg','apple-touch-icon.png']) assert.ok((await read(file)).length, 'Missing ' + file)
assert.deepEqual(await read('Saad_Resume.pdf'), await readFile(new URL('../public/Saad_Resume.pdf', import.meta.url)), 'Expected the supplied résumé in the build')
console.log('SEO and prerender checks passed.')

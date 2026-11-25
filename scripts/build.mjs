import { readFile, writeFile } from 'node:fs/promises'
import { build } from 'vite'
import sharp from 'sharp'

await build()
await build({ build: { ssr: 'src/prerender.tsx', outDir: '.ssr', emptyOutDir: true, copyPublicDir: false } })
const { render, copy, profile } = await import('../.ssr/prerender.js')
const dst = new URL('../dist/', import.meta.url)
const path = file => new URL(file, dst)
await readFile(path(profile.resume.replace(/^\//, '')))
const text = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;')
const tag = (key, value, kind = 'name') => '<meta ' + kind + '="' + key + '" content="' + text(value) + '">'
const og = (key, value) => tag('og:' + key, value, 'property')
const twitter = (key, value) => tag('twitter:' + key, value)
const socialImage = { file: 'og.png', width: 1200, height: 630 }
const image = new URL(socialImage.file, profile.url).href
const person = {
  '@type': 'Person', '@id': profile.url + '#person', name: profile.name,
  url: profile.url, jobTitle: profile.employment.role, sameAs: profile.socials.map(link => link.href),
  ...(profile.employment.company && { worksFor: { '@type': 'Organization', name: profile.employment.company } }),
}
const schema = {
  '@context': 'https://schema.org', '@type': 'ProfilePage',
  url: profile.url, name: profile.title, description: profile.description, mainEntity: person,
}
const head = [
  '<title>' + text(profile.title) + '</title>', tag('description', profile.description),
  '<link rel="canonical" href="' + profile.url + '">',
  '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
  '<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">',
  '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
  '<link rel="preload" href="/fonts/bebas-neue-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>',
  og('type', 'website'), og('site_name', profile.name), og('locale', 'en_US'),
  og('url', profile.url), og('title', profile.title), og('description', profile.description),
  og('image', image), og('image:type', 'image/png'), og('image:width', String(socialImage.width)), og('image:height', String(socialImage.height)), og('image:alt', profile.ogAlt),
  twitter('card', 'summary_large_image'), twitter('title', profile.title), twitter('description', profile.description),
  twitter('image', image), twitter('image:alt', profile.ogAlt),
  '<script type="application/ld+json">' + JSON.stringify(schema).replaceAll('<', '\\u003c') + '</script>',
].join('\n')
const html = await readFile(path('index.html'), 'utf8')
if (!html.includes('<!--head-->') || !html.includes('<!--app-->')) throw new Error('Missing build template markers')
await writeFile(path('index.html'), html.replace('<!--head-->', () => head).replace('<!--app-->', () => render()))
await writeFile(path('robots.txt'), 'User-agent: *\nAllow: /\nSitemap: ' + new URL('sitemap.xml', profile.url).href + '\n')
await writeFile(path('sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>' + profile.url + '</loc></url></urlset>\n')
await writeFile(path('404.html'), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${text(copy.notFound)} | ${text(profile.name)}</title><link rel="icon" href="/favicon.svg"><style>body{background:#f6f3ec;color:#0b0b12;font:18px system-ui;padding:2rem}main{background:white;border:3px solid;padding:1.5rem;max-width:32rem;box-shadow:6px 6px #0b0b12}a{color:#431cbd}a:focus-visible{outline:3px solid #0b0b12;outline-offset:4px}</style><main><h1>${text(copy.notFound)}</h1><p>${text(copy.missing)}</p><a href="/">${text(copy.home)}</a></main></html>`)

const icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M8 8h49v49H8z" fill="#0b0b12"/><path d="M4 4h48v48H4z" fill="#ff2e88" stroke="#0b0b12" stroke-width="4"/><path d="m14 37 6-20h4l6 20m-13-7h10m7 7V17h6q7 0 7 6t-6 6h-7m7 0 6 8" fill="none" stroke="#0b0b12" stroke-width="3.2"/></svg>'
await writeFile(path('favicon.svg'), icon)
const laptop = (await readFile(new URL('./assets/social-workstation.svg', import.meta.url), 'utf8')).replace('<svg ', '<svg x="570" y="123" width="580" height="360" ')
const social = `<svg width="${socialImage.width}" height="${socialImage.height}" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="paper" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#0b0b12" opacity=".18"/></pattern></defs><path fill="#f6f3ec" d="M0 0h1200v630H0z"/><path fill="url(#paper)" d="M0 0h1200v630H0z"/><path fill="#0b0b12" d="M42 42h1134v564H42z"/><path fill="#f6f3ec" stroke="#0b0b12" stroke-width="5" d="M30 30h1134v564H30z"/><path fill="url(#paper)" d="M32 32h1130v560H32z"/><path fill="#fde400" stroke="#0b0b12" stroke-width="4" d="M75 110h498v53H75z"/><text x="92" y="146" fill="#0b0b12" font-family="Courier New, monospace" font-size="20" font-weight="bold">${text(copy.hero.chapter)}</text><text x="76" y="323" fill="#0b0b12" font-family="Arial, sans-serif" font-stretch="condensed" font-weight="900" font-size="112">${text(profile.first.toUpperCase())} <tspan fill="#ff2e88" stroke="#0b0b12" stroke-width="3">${text(profile.last)}</tspan></text><path fill="#0b0b12" d="M74 369h540v50H74z"/><text x="92" y="403" fill="#fff" font-family="Arial, sans-serif" font-size="25" font-weight="bold">${text(profile.role)}</text><text x="77" y="510" fill="#0b0b12" font-family="Courier New, monospace" font-size="23">${new URL(profile.url).host}</text>${laptop}</svg>`
await Promise.all([
  sharp(Buffer.from(icon)).resize(32, 32).png().toBuffer().then(bytes => writeFile(path('favicon-32.png'), bytes)),
  sharp(Buffer.from(icon)).resize(180, 180).png().toBuffer().then(bytes => writeFile(path('apple-touch-icon.png'), bytes)),
  sharp(Buffer.from(social)).png().toBuffer().then(bytes => writeFile(path(socialImage.file), bytes)),
])

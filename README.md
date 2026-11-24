# Saad AR portfolio

A prerendered comic-book portfolio for [saadar.dev](https://saadar.dev/). It presents Digital Safety Hub, Agro AI Advisory Platform, Cashlio, and DocuAI. The same React project cards appear inside the animated laptop and in the static Work grid.

## Run locally

Use Node.js 22.19 or later and npm. Run these commands from the repository root.

```sh
npm ci
npm run dev
```

Open the local address Vite prints, normally `http://localhost:5173`. The site runs locally using the checked-in artwork, résumé, fonts, studio textures, and Sakuga scripts. Email opens the visitor’s mail app.

## Edit the portfolio

| To change | Edit |
| --- | --- |
| Name, contact address, social links, résumé URL, page title and description | [src/content.ts](src/content.ts), under `profile` and the GitHub profile constant |
| Hero, About, timeline, toolkit, labels, projects and dossiers | [src/content.ts](src/content.ts), under `copy`, `timeline`, `toolkit`, and `projects` |
| Résumé PDF | Replace [public/Saad_Resume.pdf](public/Saad_Resume.pdf). The navigation and Contact actions use it. |
| Section composition and navigation | [src/App.tsx](src/App.tsx) and [src/Navigation.tsx](src/Navigation.tsx) |
| Project cards, drawings and accessible dialogs | [src/work/](src/work/). A project’s stable `id` selects its illustration. The array order determines the grid, laptop slides and navigation dots. Set `repo` or `demo` only for a real URL. Add `dossier` for an expandable case study. |
| Theme colors, layout, mobile breakpoints and focus styles | [src/style.css](src/style.css). [tailwind.config.cjs](tailwind.config.cjs) contains the original Stitch tokens. |
| Manga artwork | [src/assets/scenes/](src/assets/scenes/). [src/scene-art.ts](src/scene-art.ts) selects the eye panel, portrait, cityscape and curtain artwork and sets their build widths. Vite resizes these with Sharp. |
| Matte-black laptop and posters | [src/Workstation.tsx](src/Workstation.tsx) controls the model, materials, lighting and camera. [src/LaptopDeck.tsx](src/LaptopDeck.tsx) draws the keyboard and vents. Update `public/laptop-closed-day.webp` and `public/laptop-closed-night.webp` when changing the closed model. |
| Search metadata and social preview | [scripts/build.mjs](scripts/build.mjs) uses the profile values to generate the metadata. [scripts/assets/social-workstation.svg](scripts/assets/social-workstation.svg) is the illustration for the share card. |

Contact currently uses **rsaadt3@gmail.com**. Cashlio and DocuAI include dossiers. If the featured projects, email, or domain change intentionally, update the corresponding expectations in [scripts/check-seo.mjs](scripts/check-seo.mjs). The [content audit](CONTENT-AUDIT.md) records how the original export’s sample metrics and placeholder links were handled.

## How scrolling and motion work

The Hero and Work share one lazy React Three Fiber canvas. The closed laptop opens as Work pins. The four project cards advance across the screen, followed by a GitHub link and the handoff to About. At narrow widths, vertical page travel also reveals the lower part of tall cards. Swiping horizontally or choosing a dot selects a project directly.

- [src/native-scroll.ts](src/native-scroll.ts) connects Lenis to GSAP and ScrollTrigger. Wheel and touch scrolling stay native. Internal anchors support keyboard navigation, and opening a dossier locks background scrolling.
- [src/scene-scroll.ts](src/scene-scroll.ts) maps document scroll to the pinned Work scene, dots, active card, and chapter indicator. [src/work/playback.ts](src/work/playback.ts) defines lid opening, card reading, and slide transitions. Open `/?debug` with Motion On to inspect the active chapter, progress and beat.
- The floating **Motion** switch saves `saad-motion`. A first visit follows the device’s reduced-motion setting. With motion off, visitors get the closed laptop poster, static Work grid, and still eye and curtain artwork. The Work grid also serves as the WebGL fallback.
- The header **Day/Night** switch saves `saad-theme`. Changing theme updates the active laptop’s lighting and screen glow. With JavaScript disabled, the prerendered chapters, project links, native dossier disclosures, résumé and email link remain available.
- [src/SceneShots.tsx](src/SceneShots.tsx) handles the About eyes and Contact curtain. [src/opening-screen.ts](src/opening-screen.ts) enhances the native loading meter. Tab or Escape dismisses the opening screen.
- The [Sakuga VFX components](https://github.com/finktheartist/sakuga-vfx) are vendored under [public/sakuga-vfx/](public/sakuga-vfx/) with their MIT license. Local integration lazy-loads components and shares effects with the 3D canvas. Preserve those changes when updating the vendor files. [AGENTS.md](AGENTS.md) lists the animation references used for development.

## Verify the production build

```sh
npm run type-check
npm run lint
npm run build
npm run check:seo
npm run preview -- --port 4173 --strictPort
```

Open `http://localhost:4173`. The build creates the client bundles and renders React into `dist/index.html`; the browser hydrates that HTML. The SEO check examines that file, its structured data, project links, résumé, and generated assets. Run it after rebuilding.

For browser checks, leave the production preview running and use a second terminal.

```sh
node scripts/browser-check.mjs chrome
npx playwright install firefox webkit
node scripts/browser-check.mjs firefox webkit
```

The Chrome runner uses an installed Google Chrome. Set `QA_URL` to test a different preview address. The checks cover navigation, scroll direction over tall laptop cards, theme and motion preferences, keyboard access to dossiers, clipboard fallbacks and the static page. Screenshots go to `qa/`. WebKit and mobile emulation are useful for regression checks; device-specific touch behavior still needs a physical phone.

## Deploy

Serve the **contents of `dist/`** at the domain root over HTTPS. On a static host, use `npm ci && npm run build && npm run check:seo` as the build command and `dist` as the publish directory. Configure missing paths to return the generated `404.html` with HTTP status 404.

The output includes canonical, Open Graph and Twitter metadata, Person and ProfilePage JSON-LD, a 1200 × 630 share image, favicons, `robots.txt`, and `sitemap.xml`. Cache hashed files under `assets/` long-term. Allow the homepage, résumé, posters and other stable URLs to revalidate after a release. The `.ssr/` build, `.scene-art/` cache and local `qa/` artifacts are development files.

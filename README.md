# Saad AR portfolio

A standalone manga portfolio for [saadar.dev](https://saadar.dev/) with day and night palettes. It uses Vite, React, TypeScript, build-time Tailwind, GSAP, and React Three Fiber.

## Run locally

Use Node 22.19 or newer and npm.

    npm ci
    npm run dev
    npm run type-check
    npm run lint
    npm run build
    npm run check:seo
    npm run preview

The build renders the shared React page into dist/index.html, then generates the social card, favicons, sitemap, robots file, and static 404. The client hydrates the HTML. The chapters, projects, email link, and dossier disclosures are available with JavaScript disabled.

## Edit the site

- Edit src/content.ts for copy, project descriptions, milestones, dossiers, toolkit, accessible labels, metadata, and URLs. Missing URLs leave their controls hidden.
- The header and Contact section use public/Saad_Resume.pdf. Replace that file when you update the résumé.
- The page is composed in src/App.tsx. Project cards, art, and dossiers live in src/work/. The Stitch Tailwind tokens are in tailwind.config.cjs, and layout and motion styles are in src/style.css.
- The closed Hero laptop and the Work studio share one lazy R3F renderer in src/Workstation.tsx. The procedural metal shell reflects a self-hosted studio panorama in public/studio-environment.jpg.
- Work occupies six viewport heights, with five viewport heights of pinned travel. src/scene-scroll.ts maps Lenis and native scrolling to the lid, project beats, progress dots, and final GitHub card. Add ?debug to inspect progress and the active beat.
- src/ThemeSwitch.tsx stores the visitor’s day or night choice locally. The header uses the MIT-licensed Sakuga toggle artwork with a native switch control. Theme colors live in src/style.css.
- The opening screen lives in index.html. src/opening-screen.ts advances the Sakuga progress bar after hydration and the first-screen assets, with a native meter fallback and a startup deadline.
- Touch visitors can swipe through the laptop screen. Reduced motion, renderer failure, and disabled JavaScript use the prerendered four-project grid.
- The shadcn registry files are in public/sakuga-vfx with their MIT license. Local changes share the front canvas for bursts and pointer trails, suspend the shared clock while hidden, let CTA effects originate at anchors, and reposition tooltips near viewport edges.

## Deploy and verify

Publish the contents of dist/ to the root of https://saadar.dev/ after building and running the SEO check. Configure the host to serve 404.html with an HTTP 404 for unknown paths. Cache hashed assets, and allow HTML, résumé, sitemap, and social card files to revalidate.

To reproduce the browser checks, run the production preview on port 4173, install the test engines with npx playwright install firefox webkit, then run node scripts/browser-check.mjs. The checker also uses installed Chrome. Set QA_URL to override the preview URL. Captures go to the ignored qa/ directory.

See [CONTENT-AUDIT.md](CONTENT-AUDIT.md) for the benchmark removals and placeholder destinations.

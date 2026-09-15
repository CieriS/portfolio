# Samuele Cieri — Portfolio

[Italiano](README.md) · **English** · [Français](README.fr.md)

Personal portfolio of **Samuele Cieri**, a Software Developer transitioning to Data Engineering. It is a minimal Single Page Application built with Next.js: the layout is locked to `100dvh`, views swap without reloading the page, and a 3D particle field keeps running in the background. Every view still has its own prerendered, indexable URL, in English and Italian.

The `next-migration` branch replaces the previous PHP site, which is kept in [`legacy/`](legacy/).

## Contents

- [Features](#features)
- [Stack](#stack)
- [Requirements](#requirements)
- [Quick start](#quick-start)
- [npm scripts](#npm-scripts)
- [Environment variables](#environment-variables)
- [Views and URLs](#views-and-urls)
- [Navigation and interaction](#navigation-and-interaction)
- [Architecture](#architecture)
- [SEO](#seo)
- [Accessibility](#accessibility)
- [Text selection](#text-selection)
- [Data and content](#data-and-content)
- [Extending the project](#extending-the-project)
- [Project structure](#project-structure)
- [Code quality](#code-quality)
- [Deploying to Vercel](#deploying-to-vercel)
- [Legacy site](#legacy-site)
- [Troubleshooting](#troubleshooting)
- [Contact](#contact)
- [License](#license)

## Features

- **SPA with real URLs**: each view is a static page (SSG) with its own content and metadata. After the first load, view changes happen on the client without a reload, updating the URL and title through the History API.
- **Bilingual (EN/IT)**: translated slugs, automatic language detection and an instant language switch that keeps the view, the canvas and the state.
- **Persistent 3D scene**: a 5,376-point grid (three.js) that changes shape and camera angle for each view and reacts to the pointer. It loads on the client only and adapts to the device's performance.
- **Light, dark or automatic theme** with next-themes, with no flash on load.
- **Considered motion**: a CSS intro on first paint (before hydration), then Framer Motion for view transitions, line masks and the animated navigation underline.
- **Complete SEO**: canonical, hreflang, Open Graph with images per language and view, JSON-LD, sitemap, robots, manifest and 301 redirects from the old PHP URLs.
- **Accessibility**: real links, a single `h1` per URL, ARIA attributes, visible focus, and `prefers-reduced-motion` honoured in CSS, in Framer Motion and in the 3D scene.
- **Centralised content** in a single typed JSON file: a missing key or a structural mismatch between EN and IT fails the build.

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, React Server Components, SSG) · React 19 |
| Language | TypeScript 6 (`strict`) |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) · next-themes (light / dark / system) |
| Typography | Geist · Geist Mono · Instrument Serif (`next/font/google`) |
| Motion | Framer Motion (`AnimatePresence`, `layoutId`, `MotionConfig`, mask reveal) |
| 3D | three · @react-three/fiber · @react-three/drei (lazy, client-only) |
| State | Zustand (per-instance view store via context + transient scene store) |
| i18n | next-intl (`/en`, `/it`, language detection via `proxy.ts`, client-side language switch) |
| Data | `data/portfolio.json` (single source: content, UI strings, SEO metadata) |
| Quality | ESLint 9 (`eslint-config-next`: core-web-vitals + typescript) · `tsc --noEmit` |
| Hosting | Vercel |

`@playwright/test` is already listed in devDependencies, but no test suite is configured yet.

## Requirements

- **Node.js ≥ 20.9.0** (`engines` field in `package.json`)
- **npm** (the repository ships a `package-lock.json`)

## Quick start

```bash
git clone https://github.com/CieriS/portfolio.git
cd portfolio
git checkout next-migration
npm install
npm run dev
```

The site runs at http://localhost:3000. The root `/` redirects to `/en` or `/it` based on the browser language.

To try it on a phone on the same network, open the *Network* address printed by `npm run dev` (for example `http://192.168.1.69:3000`). The hosts `192.168.*.*`, `10.*` and `*.local` are already allowed by `allowedDevOrigins` in `next.config.ts`; without that entry the page renders but never hydrates.

## npm scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server with hot reload at http://localhost:3000 |
| `npm run build` | Production build: prerenders pages, Open Graph images, sitemap and robots |
| `npm start` | Serves the production build locally |
| `npm run lint` | ESLint across the project (`legacy/` and build output excluded) |
| `npm run typecheck` | Generates route types (`next typegen`) and type-checks with `tsc --noEmit` |

Before pushing, it is worth running `npm run lint`, `npm run typecheck` and `npm run build`.

## Environment variables

No variable is required: the project works locally without any configuration.

| Variable | Purpose |
| --- | --- |
| `SITE_URL` | Optional. Canonical origin for canonical URLs, hreflang, sitemap, Open Graph and JSON-LD; trailing slashes are stripped. Only needed with a custom domain. When missing, the Vercel production URL (`VERCEL_PROJECT_PRODUCTION_URL`) is used, and `http://localhost:3000` locally. |
| `GOOGLE_SITE_VERIFICATION` | Optional. Google Search Console verification token, published as a meta tag. |
| `VERCEL_PROJECT_PRODUCTION_URL` | Set by Vercel. Used when `SITE_URL` is missing. |
| `VERCEL_ENV` | Set by Vercel. Only `production` is indexable: previews get `noindex` and a `robots.txt` with `Disallow: /`. Outside Vercel, where the variable does not exist, the site is indexable. |

Locally you can create a `.env.local` file, which Git already ignores:

```bash
SITE_URL=https://www.example.com
GOOGLE_SITE_VERIFICATION=your-token
```

## Views and URLs

| # | View (ID) | EN | IT | Content |
| --- | --- | --- | --- | --- |
| 01 | Index (`hero`) | `/en` | `/it` | Large-format name, role, introduction and a call to explore. |
| 02 | Identity (`identity`) | `/en/identity` | `/it/identita` | Mission statement, four engineering principles and contacts (GitHub, LinkedIn, GitLab). |
| 03 | Execution (`timeline`) | `/en/execution` | `/it/esecuzione` | Two-lane timeline (industry and academic path) on a shared time axis, with a live uptime counter and phases with their stack. |
| 04 | Systems (`projects`) | `/en/systems` | `/it/sistemi` | Projects in an accordion: summary, layered architecture, link to Data Engineering and repository link. |
| 05 | Optimization (`discipline`) | `/en/optimization` | `/it/ottimizzazione` | The method beyond code: a calisthenics programme (metrics and sessions) and sound mechanics (acoustic guitar, lossless formats, audio pipeline). |

Every URL is prerendered with its own content. An address that matches no view shows a localised, non-indexable 404 page.

## Navigation and interaction

- **Bottom links** (`01`–`05`): real `<a href>` elements, so middle-click, "open in new tab" and crawlers all work. A primary click swaps the view in place.
- **Keyboard**: `1`–`5` jump to a view, `←` and `→` cycle through them. Keys are ignored while a modifier is held or when focus is in a text field.
- **Touch**: a horizontal swipe (over 70 px and mostly horizontal) moves to the previous or next view.
- **Arrows and counter** in the footer on medium and large screens.
- **History**: every view change calls `pushState`, so the browser's back and forward buttons work. The document title follows the active view.
- **Language**: the EN / IT switch replaces the URL with the translated slug (`replaceState`), updates `lang` and the title, and stores the `NEXT_LOCALE` cookie for one year, without navigating. The canvas and the active view stay intact.
- **Language detection**: on `/` and on unprefixed paths, `proxy.ts` (the next-intl middleware) picks the language from the `NEXT_LOCALE` cookie or the `Accept-Language` header. The default language is English and the prefix is always present.
- **Theme**: the button cycles Auto → Light → Dark; the icon is half-filled, empty or full respectively.
- **Scene**: the pointer nudges the camera and "heats up" nearby nodes. The effect fades out when the pointer leaves the window.

## Architecture

### Rendering and routing

- The layout and pages use `generateStaticParams`: every language × view combination is generated at build time.
- `app/[locale]/page.tsx` (index) and `app/[locale]/[view]/page.tsx` (inner views) both render `components/seo/PortfolioPage.tsx`, a Server Component that injects the JSON-LD and starts the app on the requested view.
- `lib/views.ts` is the single source for IDs, localised slugs and URL ↔ view conversion.
- Both languages are sent to the client (`getPortfolioBundle`), so switching language needs no navigation.

### Shell

- `AppRoot` owns the current language and the next-intl provider.
- `AppShell` composes the header (name, role, language, theme), the active view and the footer (navigation, arrows, counter).
- `AnimatePresence mode="wait"`, keyed by `view:language`, drives the transitions. `ViewFrame` is each view's scroll container, with faded edges and a hidden scrollbar.
- `useViewNavigation` handles keyboard and swipe; `useViewUrlSync` keeps URL, history, title and scene mode in step.

### State

- **`store/viewStore.tsx`**: a Zustand store created per instance and shared through React context. The initial view comes from the URL, and a module-level singleton would leak state between concurrent server renders.
- **`store/useSceneStore.ts`**: global scene store (mode, palette, pointer). The pointer is mutated in place and read inside `useFrame` via `getState()`, so mouse movement never re-renders React.

### 3D scene

- `SceneLayer` lives in the layout, above every view swap, and is never unmounted.
- `DataField` is loaded with `next/dynamic` and `ssr: false`: three.js never reaches the server bundle.
- `DataGrid` draws a 96 × 56 point grid; every fifth row carries moving "data packets".
- Each view has a mode in `components/scene/modes.ts` (amplitude, frequency, speed, flow, pointer radius and force, presence, camera position). On a view change the parameters ease smoothly to the new values.
- `PerformanceMonitor` drops the device pixel ratio to 1 when the frame rate falls and raises it back up to 1.75 when it recovers.
- With `prefers-reduced-motion: reduce` the canvas switches to `frameloop="demand"` and repaints only when the view or theme changes.
- The palette follows the resolved theme (light or dark).

### Motion

- On first paint the entrances are pure CSS (`.intro-line` and `.intro-fade` under `html:not([data-booted])`). Content is therefore never stuck hidden while waiting for hydration, and the index title, the LCP element, starts painting right away.
- On the first view or language change, `markBooted()` hands control over to Framer Motion.
- `MotionConfig reducedMotion="user"` honours the system preference.

### Theme and typography

- CSS tokens in `app/globals.css` (`--paper`, `--ink`, `--muted`, `--line`, `--accent`), redefined under `.dark` and exposed to Tailwind v4 with `@theme inline`.
- Custom utilities: `px-frame`, `no-scrollbar`, `fade-edges`, `link-underline`, `bg-dashed`.
- Fonts loaded with `next/font` and `display: swap`: Geist for body text, Geist Mono for labels, italic Instrument Serif for emphasised words.

## SEO

- **Per-view metadata** (`lib/seo.ts`): title, description, canonical, hreflang (`en`, `it`, `x-default`), Open Graph `profile` and a `summary_large_image` Twitter card. For the index, `x-default` points to `/`, which detects the language; for the other views it points to the English version.
- **Open Graph images** at 1200 × 630, generated at build time for every language and view (`opengraph-image.tsx`, `lib/og.tsx`), featuring the legacy site's icon.
- **JSON-LD** `@graph` (`lib/structuredData.ts`): `WebSite`, `Person` (with `knowsAbout` and `sameAs`), `ProfilePage`, `BreadcrumbList` on inner views and an `ItemList` of `SoftwareSourceCode` on the projects view.
- **`sitemap.xml`** with hreflang alternates, **`robots.txt`**, **`manifest.webmanifest`**, plus a favicon and icons derived from the legacy `iconRed.ico`.
- **Controlled indexing**: only production is indexable (see [Environment variables](#environment-variables)).
- **Page structure**: a single `h1` per URL, real links in the navigation, `rel="me"` on social profiles, `X-Powered-By` header disabled.
- **301 redirects** from the old PHP URLs:

| Old URL | Destination |
| --- | --- |
| `/index.php` | `/` |
| `/error` | `/` |
| `/projDev/*` | `/it/sistemi` |
| `/projProd/*` | `/it/sistemi` |

After the first deploy: Google Search Console → add a URL-prefix property → submit `/sitemap.xml`.

## Accessibility

- Navigation through real links, with `aria-current="page"` on the active view; each view is a `section` with an `aria-label`.
- The projects accordion uses `aria-expanded` and `aria-controls`; buttons and controls have localised labels.
- Focus is always visible (`:focus-visible`), the `lang` attribute updates on language change, and the language switch links carry `hreflang`.
- Decorative elements (canvas, arrows, indices) are marked `aria-hidden`.
- Reduced motion is honoured at three levels: CSS intro, Framer Motion and the scene's frame loop.

## Text selection

Selection is disabled on interface chrome only: navigation, buttons, header and footer, labels, indices, display titles and the canvas. There, a selection is always accidental (double-clicks, swipes). Body text, descriptions and contacts remain selectable, and `Cmd/Ctrl+A` is not intercepted: blocking them would not protect the content (it is in the HTML and in search results) and would hurt accessibility and usability.

## Data and content

All content lives in [`data/portfolio.json`](data/portfolio.json), imported and typed in `lib/portfolio.ts`.

```
shared                  language-independent data
├── name, handle
├── contacts[]          id, label, handle, url
├── timeline            threadA (industry), threadB (academic): dates, phases, stack
├── projects[]          id, name, repo, stack, layers
└── discipline          biological (metrics, sessions) · acoustic (formats, pipeline)
locales.en | locales.it
├── ui                  next-intl messages: meta (SEO), notFound, nav, theme, locale, shell
├── hero
├── identity
├── timeline
├── projects            items[id]: summary, bridge, layers
└── discipline
```

- `shared` holds language-independent data (links, dates, stack, metrics); `locales.en|it` holds the copy.
- Each language's `ui` block is used as next-intl messages and also contains the per-view SEO title and description (`ui.meta.views`).
- Copy is linked to shared data by `id` (for example `shared.projects[].id` → `locales.*.projects.items[id]`).
- `*Emphasis` fields name the word rendered in italic serif and must appear in the text they refer to.
- Dates use ISO `YYYY-MM-DD` and are displayed as `DD.MM.YYYY`.
- The JSON is assigned to explicit types: a missing or renamed key, or a different structure between EN and IT, fails `npm run typecheck` and the build.

Fields that accept `null` (shown as `—`): `timeline.threadA.organization`, `timeline.threadB.start`, `timeline.threadB.institution`, `projects[].repo`, `discipline.biological.heightCm`, `discipline.biological.weightKg`. When `repo` is `null`, the project link points to the GitHub profile; when a lane's start date is `null`, the lane is drawn dashed.

## Extending the project

### Adding a project

1. Add an entry to `shared.projects` with `id`, `name`, `repo` (or `null`), `stack` and `layers` (`id`, `tech`).
2. In **both** languages, add `projects.items[<id>]` with `summary`, `bridge` and `layers` (one description per layer `id`).
3. If needed, update the title and description in `ui.meta.views.projects`.

The view and the `ItemList` JSON-LD update automatically.

### Adding a contact

Add `{ id, label, handle, url }` to `shared.contacts`: it appears in the Identity view and in the JSON-LD `sameAs` field.

### Adding a view

1. `lib/views.ts`: add the ID to `VIEW_IDS` and its slug for each language in `VIEW_SLUGS`.
2. `components/scene/modes.ts`: add the scene mode to `SCENE_MODES`.
3. `components/views/`: create the component and register it in `RENDER` in `components/shell/AppShell.tsx`.
4. `data/portfolio.json`: add `ui.nav.<id>`, `ui.meta.views.<id>` and the view's copy in every language.

Pages, Open Graph images, sitemap, navigation and number shortcuts all derive from `VIEW_IDS` (shortcuts cover up to 9 views).

### Adding a language

1. `i18n/routing.ts`: add the code to `locales`.
2. `lib/views.ts`: add the slugs to `VIEW_SLUGS` and the code to the check in `viewFromPath`, currently limited to `en` and `it`.
3. `lib/seo.ts`: add the Open Graph locale to `OG_LOCALE` (for example `fr: 'fr_FR'`).
4. `data/portfolio.json`: add `locales.<code>` with the same structure as `en`, plus the new language's label in every language's `ui.locale`.

TypeScript flags any step you miss, because all these maps are typed on `Locale`.

## Project structure

```
.
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx               html, fonts, theme, persistent SceneLayer, base metadata
│   │   ├── page.tsx                 Index view
│   │   ├── not-found.tsx            localised 404 page
│   │   ├── opengraph-image.tsx      Open Graph image for the index
│   │   └── [view]/
│   │       ├── page.tsx             inner views (localised slugs)
│   │       └── opengraph-image.tsx  per-view Open Graph image
│   ├── globals.css                  colour tokens, Tailwind utilities, CSS intro
│   ├── sitemap.ts · robots.ts · manifest.ts
│   └── favicon.ico · icon.png · apple-icon.png
├── components/
│   ├── motion/       ViewFrame (view container), Reveal (variants, line mask, intro)
│   ├── providers/    ThemeProvider (next-themes)
│   ├── scene/        SceneLayer → DataField (Canvas, lazy) → DataGrid (useFrame) · modes
│   ├── seo/          PortfolioPage (JSON-LD + app)
│   ├── shell/        AppRoot, AppShell, NavBar, ViewLink, LocaleSwitch, ThemeToggle,
│   │                 useViewNavigation, useViewUrlSync
│   └── views/        HeroView, IdentityView, TimelineView, ProjectsView, DisciplineView, atoms
├── data/
│   └── portfolio.json               EN/IT content, UI strings, SEO metadata
├── i18n/             routing.ts (languages) · request.ts (next-intl messages)
├── lib/              views, portfolio, seo, site, structuredData, og, format, hooks, cn
├── store/            viewStore (per instance) · useSceneStore (scene, transient)
├── legacy/           previous PHP site (not served)
├── proxy.ts          language detection (next-intl middleware)
├── next.config.ts    next-intl plugin, 301 redirects, allowed dev origins
├── eslint.config.mjs · postcss.config.mjs · tsconfig.json
└── package.json
```

## Code quality

- TypeScript in `strict` mode, with the `@/*` alias mapped to the project root.
- ESLint with Next.js's `core-web-vitals` and `typescript` configurations.
- `npm run typecheck` first runs `next typegen`, which generates the global route types (`PageProps`, `LayoutProps`).
- `legacy/` is excluded from TypeScript and ESLint.
- `reactStrictMode` is on, and Next's dev indicator is off because it would sit on top of the navigation.

## Deploying to Vercel

1. Push the branch to GitHub: `git push -u origin next-migration`.
2. On vercel.com → **Add New → Project** → import `CieriS/portfolio`. Next.js is detected automatically (build `npm run build`, install `npm install`).
3. **Settings → Git → Production Branch**: `next-migration` (or `development` after merging).
4. Optional variables in **Settings → Environment Variables**: `GOOGLE_SITE_VERIFICATION` and `SITE_URL` (custom domain only).
5. Deploy: the site is live at `https://<project>.vercel.app`. Every push to the production branch redeploys automatically; other branches and PRs produce non-indexable previews.

Alternatively, from the terminal: `npx vercel login`, then `npx vercel` (preview) and `npx vercel --prod` (production).

### Local production build

```bash
npm run build
npm start
```

## Legacy site

`legacy/` holds the previous portfolio, hosted on Altervista: PHP and MySQL, HTML, CSS and JavaScript, Font Awesome 6.4 and a collection of projects in `projDev/`. Its original README is [`legacy/readMe.md`](legacy/readMe.md).

- Next.js does not serve it: the project has no `public/` folder, so no file in `legacy/` is reachable from the published site.
- It is excluded from lint and type-checking.
- Its main URLs are 301-redirected (see [SEO](#seo)).
- `legacy/.htaccess` 301-redirects the whole Altervista domain to Vercel, preserving the path: replace `<progetto>.vercel.app` with the production URL and upload the file to the Altervista site root.
- The new site's icons derive from `legacy/img/icon/iconRed.ico`.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| On another device the page renders but ignores clicks and keys | The host is not in `allowedDevOrigins` (`next.config.ts`): add it and restart `npm run dev`. |
| Canonical URLs and sitemap point to `localhost` in production | Set `SITE_URL`, or deploy on Vercel, which provides `VERCEL_PROJECT_PRODUCTION_URL`. |
| Type errors on `PageProps` or `LayoutProps` | Run `npm run typecheck`: `next typegen` regenerates the route types. |
| The build fails after editing `portfolio.json` | Check that the key exists in both languages and that the value matches the types in `lib/portfolio.ts`. |
| A preview deployment does not show up on Google | That is intended: only `VERCEL_ENV=production` is indexable. |

## Contact

- GitHub: [@CieriS](https://github.com/CieriS/)
- LinkedIn: [in/samuelecieri](https://www.linkedin.com/in/samuelecieri/)
- GitLab: [@CieriS](https://gitlab.com/CieriS/)

## License

The repository does not include a license: code and content remain the author's property (all rights reserved). Font Awesome Free, in `legacy/`, is distributed under its own license ([`LICENSE.txt`](legacy/fontawesome-free-6.4.0-web/LICENSE.txt)).

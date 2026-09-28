# Samuele Cieri — Portfolio

[Italiano](README.md) · **English** · [Français](README.fr.md)

Personal portfolio of **Samuele Cieri**, a Software Developer transitioning to Data Engineering. It is a minimal Single Page Application built with Next.js: the layout is locked to `100dvh`, views swap without reloading the page, and a 3D particle field keeps running in the background. Every view still has its own prerendered, indexable URL, in English, Italian and French.

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
- **Trilingual (EN/IT/FR)**: translated slugs, automatic language detection and an instant language switch that keeps the view, the canvas and the state.
- **Persistent 3D scene**: a 5,376-point grid (three.js) that changes shape and camera angle for each view and reacts to the pointer. It loads on the client only and adapts to the device's performance.
- **Light, dark or automatic theme** with next-themes, with no flash on load.
- **Considered motion**: a CSS intro on first paint (before hydration), then Framer Motion for view transitions, line masks and the animated navigation underline.
- **Complete SEO**: canonical, hreflang, Open Graph with images per language and view, JSON-LD, sitemap, robots, manifest and 301 redirects from the old PHP URLs.
- **Accessibility**: real links, a single `h1` per URL, ARIA attributes, visible focus, and `prefers-reduced-motion` honoured in CSS, in Framer Motion and in the 3D scene.
- **Centralised, validated content**: one shared JSON file plus one per language, checked by types, a zod schema and cross-checks — inconsistent content fails the build.

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
| i18n | next-intl (`/en`, `/it`, `/fr`, language detection via `proxy.ts`, client-side language switch) |
| Data | `data/shared.json` + `data/locales/*.json` (single source: content, UI strings, SEO metadata), validated with zod |
| Quality | ESLint 9 (`eslint-config-next`: core-web-vitals + typescript) · Prettier · `tsc --noEmit` · Vitest · Playwright |
| Hosting | Vercel |

End-to-end tests run with Playwright on Chromium, WebKit and a mobile profile, against the production build. Unit tests use Vitest. GitHub Actions runs formatting, lint, typecheck, unit tests, build and end-to-end tests on every pull request.

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
| `npm run format` | Formats the project with Prettier (`.prettierrc.json`, with Tailwind class sorting) |
| `npm run format:check` | Checks formatting without writing, as CI does |
| `npm run typecheck` | Generates route types (`next typegen`) and type-checks with `tsc --noEmit` |
| `npm run test:unit` | Vitest unit tests for the pure logic (`lib/**/*.test.ts`), in under a second |
| `npm test` | Playwright end-to-end suite; builds and starts the production server itself |
| `npm run test:ui` | The same suite in Playwright's interactive mode |

Before pushing, it is worth running `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run test:unit` and `npm test` — the same commands CI runs.

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

| # | View (ID) | EN | IT | FR | Content |
| --- | --- | --- | --- | --- | --- |
| 01 | Index (`hero`) | `/en` | `/it` | `/fr` | Large-format name, role, introduction and a call to explore. |
| 02 | Identity (`identity`) | `/en/identity` | `/it/identita` | `/fr/identite` | Mission statement, four engineering principles and contacts (GitHub, LinkedIn, GitLab). |
| 03 | Execution (`timeline`) | `/en/execution` | `/it/esecuzione` | `/fr/execution` | Two-lane timeline (industry and academic path) on a shared time axis, with a live uptime counter and phases with their stack. |
| 04 | Systems (`projects`) | `/en/systems` | `/it/sistemi` | `/fr/systemes` | Projects in an accordion: summary, engineering decisions, layered architecture, link to Data Engineering and repository link (or a link to the contacts when the code is private). |
| 05 | Optimization (`discipline`) | `/en/optimization` | `/it/ottimizzazione` | `/fr/optimisation` | The method beyond code: a calisthenics programme (metrics and sessions) and sound mechanics (acoustic guitar, lossless formats, audio pipeline). |

Every URL is prerendered with its own content. An address that matches no view shows a localised, non-indexable 404 page.

## Navigation and interaction

- **Bottom links** (`01`–`05`): real `<a href>` elements, so middle-click, "open in new tab" and crawlers all work. A primary click swaps the view in place.
- **Keyboard**: `1`–`5` jump to a view, `←` and `→` cycle through them. Keys are ignored while a modifier is held or when focus is in a text field.
- **Touch**: a horizontal swipe (over 70 px and mostly horizontal) moves to the previous or next view.
- **Arrows and counter** in the footer on medium and large screens.
- **History**: every view change calls `pushState`, so the browser's back and forward buttons work. The document title follows the active view.
- **Language**: the EN / IT / FR switch replaces the URL with the translated slug (`replaceState`), updates `lang` and the title, and stores the `NEXT_LOCALE` cookie for one year, without navigating. The canvas and the active view stay intact.
- **Language detection**: on `/` and on unprefixed paths, `proxy.ts` (the next-intl middleware) picks the language from the `NEXT_LOCALE` cookie or the `Accept-Language` header. The default language is English and the prefix is always present.
- **Theme**: the button cycles Auto → Light → Dark; the icon is half-filled, empty or full respectively.
- **Scene**: the pointer nudges the camera and "heats up" nearby nodes. The effect fades out when the pointer leaves the window.

## Architecture

### Rendering and routing

- The layout and pages use `generateStaticParams`: every language × view combination is generated at build time.
- `app/[locale]/page.tsx` (index) and `app/[locale]/[view]/page.tsx` (inner views) both render `components/seo/PortfolioPage.tsx`, a Server Component that injects the JSON-LD and starts the app on the requested view.
- `lib/routes.ts` is the single source for locales, IDs, localised slugs and URL ↔ view conversion. It depends on neither Next nor next-intl, so the Playwright suite imports the same module instead of keeping a copy.
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

- **Per-view metadata** (`lib/seo.ts`): title, description, canonical, hreflang (`en`, `it`, `fr`, `x-default`), Open Graph `profile` and a `summary_large_image` Twitter card. For the index, `x-default` points to `/`, which detects the language; for the other views it points to the English version.
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

Content lives in [`data/shared.json`](data/shared.json) and in one file per language under [`data/locales/`](data/locales/), loaded by `lib/portfolio.ts`.

```
data/shared.json        language-independent data
├── name, handle
├── contacts[]          id, label, handle, url
├── timeline.threads[]  lanes: id, kind (work | education), entity, segments[], phases
├── projects[]          id, name, source, stack, layers
└── discipline          biological (metrics, sessions) · acoustic (formats, pipeline)
data/locales/<language>.json   en · it · fr
├── ui                  next-intl messages: meta (SEO), notFound, nav, theme, locale, shell
├── hero
├── identity
├── timeline
├── projects            items[id]: summary, bridge, highlights, layers
└── discipline
```

- `shared.json` holds language-independent data (links, dates, stack, metrics); `locales/<language>.json` holds the copy.
- Each language's `ui` block is used as next-intl messages and also contains the per-view SEO title and description (`ui.meta.views`).
- Copy is linked to shared data by `id` (for example `shared.projects[].id` → `projects.items[id]` in every language).
- `*Emphasis` fields name the word rendered in italic serif and must appear in the text they refer to.
- Dates use ISO `YYYY-MM-DD` and are displayed as `DD.MM.YYYY`.
- Content goes through three checks before prerendering, and any failure fails the build:
  1. **types**: every language is assigned to the shape of `en.json`, so a missing or renamed key fails `npm run typecheck`;
  2. **schema** (`lib/content/schema.ts`): `shared.json` is parsed with zod (enums, real ISO dates, segments ending after they start, URLs, the `source` union); the domain types are inferred from the schema;
  3. **cross-checks** (`lib/content/validate.ts`): every thread, phase, project and layer id has copy in every language, every language has its `ui.locale` label, and every `*Emphasis` occurs in its text. All problems are listed at once, with their path.

Fields that accept `null` (shown as `—`): `timeline.threads[].entity`, `discipline.biological.heightCm`, `discipline.biological.weightKg`. `projects[].source` is either `{ "visibility": "public", "url": "…" }` (repository link, also published as `codeRepository` in the JSON-LD) or `{ "visibility": "private" }`: the code is not linked and the project points to the Identity view, where a walkthrough can be requested. An unknown visibility or a public project without a `url` fails the build.

### Timeline lanes

A lane is a sequence of `segments`, not a single interval: `{ "start": "YYYY-MM-DD", "end": null }`, with `end: null` for the segment still running. More than one segment leaves a gap on the axis, and the active periods are also spelled out in text in the lane's detail. Lanes and columns derive from the array, so adding a third one needs no code change.

`kind` is either `work` or `education` and drives the JSON-LD: `work` lanes feed `worksFor` and `knowsAbout`, `education` lanes feed `alumniOf`. Any other value fails the build. The headline uptime follows the first `work` lane and sums active time only, excluding interruptions.

Each phase takes an optional `start`. Without it, phases are spread over the lane's active time and step over the gaps; with it, the phase is anchored to that date.

## Extending the project

### Adding a project

1. Add an entry to `shared.projects` with `id`, `name`, `source` (public with a `url`, or private), `stack` and `layers` (`id`, `tech`).
2. In **both** languages, add `projects.items[<id>]` with `summary`, `bridge`, `highlights` (the list of engineering decisions) and `layers` (one description per layer `id`).
3. If needed, update the title and description in `ui.meta.views.projects`.

The view and the `ItemList` JSON-LD update automatically.

### Adding a contact

Add `{ id, label, handle, url }` to `shared.contacts`: it appears in the Identity view and in the JSON-LD `sameAs` field.

### Adding a view

1. `lib/routes.ts`: add the ID to `VIEW_IDS` and its slug for each language in `VIEW_SLUGS`.
2. `components/scene/modes.ts`: add the scene mode to `SCENE_MODES`.
3. `components/views/`: create the component and register it in `RENDER` in `components/shell/AppShell.tsx`.
4. `data/locales/*.json`: add `ui.nav.<id>`, `ui.meta.views.<id>` and the view's copy in every language.

Pages, Open Graph images, sitemap, navigation and number shortcuts all derive from `VIEW_IDS` (shortcuts cover up to 9 views).

### Adding a language

1. `lib/routes.ts`: add the code to `LOCALES` and the slugs to `VIEW_SLUGS`. `i18n/routing.ts`, `viewFromPath` and the E2E suite read from here and need no edit.
2. `lib/seo.ts`: add the Open Graph locale to `OG_LOCALE` (for example `pt: 'pt_PT'`).
3. `data/locales/<code>.json`: create it with the same structure as `en.json`, import it in `lib/portfolio.ts` and `e2e/content.ts`, and add the new language's label to every language's `ui.locale`.

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
│   ├── shared.json                  language-independent data
│   └── locales/                     en.json · it.json · fr.json: copy, UI strings, SEO metadata
├── i18n/             routing.ts (languages) · request.ts (next-intl messages)
├── lib/              routes, views, portfolio, timeline, seo, site, structuredData, og, format, hooks, cn
│   └── content/      schema (zod) · validate (cross-checks)
├── store/            viewStore (per instance) · useSceneStore (scene, transient)
├── e2e/              Playwright suite · helpers.ts (locales, views, waits)
├── .github/workflows/ci.yml   lint, typecheck, build and tests on every PR
├── legacy/           previous PHP site (not served)
├── proxy.ts          language detection (next-intl middleware)
├── next.config.ts    next-intl plugin, 301 redirects, allowed dev origins
├── eslint.config.mjs · postcss.config.mjs · tsconfig.json · playwright.config.ts
└── package.json
```

## Code quality

- TypeScript in `strict` mode, with the `@/*` alias mapped to the project root.
- Prettier for TypeScript, JSON, CSS and YAML (Markdown is excluded so tables and trees keep their alignment). Formatting-only commits go in `.git-blame-ignore-revs`; to use it locally: `git config blame.ignoreRevsFile .git-blame-ignore-revs`.
- ESLint with Next.js's `core-web-vitals` and `typescript` configurations.
- `npm run typecheck` first runs `next typegen`, which generates the global route types (`PageProps`, `LayoutProps`).
- Vitest unit tests next to the modules (`lib/**/*.test.ts`): slugs and URLs, timeline arithmetic (segments, gaps, phases, axis), formatting, the content schema and cross-checks, including the real files.
- End-to-end tests in `e2e/` with Playwright, run against the production build on Chromium, WebKit and a mobile profile. They cover every language's URLs and metadata, navigation and history, the language switch, SEO, security headers, accessibility (axe) and the site's resilience to a WebGL failure.
- CI in `.github/workflows/ci.yml`: formatting, lint, typecheck, unit tests, build and end-to-end tests on every pull request.
- Dependabot (`.github/dependabot.yml`) opens one grouped weekly PR against `development` for npm dependencies and one for GitHub Actions.
- `.mailmap` folds the early commits signed with a hostname-derived email into one identity, without rewriting history.
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
| The build fails after a content edit | The message lists every problem with its path (for example `it.projects.items.app.layers has no copy for "api"`). `npm run test:unit` shows it in under a second. |
| A preview deployment does not show up on Google | That is intended: only `VERCEL_ENV=production` is indexable. |

## Contact

- GitHub: [@CieriS](https://github.com/CieriS/)
- LinkedIn: [in/samuelecieri](https://www.linkedin.com/in/samuelecieri/)
- GitLab: [@CieriS](https://gitlab.com/CieriS/)

## License

Code and content are the author's property, all rights reserved: see [`LICENSE`](LICENSE). Font Awesome Free, in `legacy/`, is distributed under its own license ([`LICENSE.txt`](legacy/fontawesome-free-6.4.0-web/LICENSE.txt)).

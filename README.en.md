# Samuele Cieri — Portfolio

[Italiano](README.md) · **English** · [Français](README.fr.md)

Personal portfolio of **Samuele Cieri**, a Software Developer transitioning to Data Engineering. It is a minimal Single Page Application built with Next.js: the layout is locked to `100dvh`, views swap without reloading the page, and a 3D particle field keeps running in the background. Every view still has its own prerendered, indexable URL, in English, Italian, French and German.

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
- [Workflow](#workflow)
- [Deploying to Vercel](#deploying-to-vercel)
- [Previous site](#previous-site)
- [Troubleshooting](#troubleshooting)
- [Contact](#contact)
- [License](#license)

## Features

- **SPA with real URLs**: each view is a static page (SSG) with its own content and metadata. After the first load, view changes happen on the client without a reload, updating the URL and title through the History API.
- **Four languages (EN/IT/FR/DE)**: translated slugs, automatic language detection and an instant language switch that keeps the view, the canvas and the state.
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

- **Node.js ≥ 22.12.0** (required by Vitest) (`engines` field in `package.json`)
- **npm** (the repository ships a `package-lock.json`)

## Quick start

```bash
git clone https://github.com/CieriS/portfolio.git
cd portfolio
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
| `npm run lint` | ESLint across the project (build output excluded) |
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
| `GOOGLE_SITE_VERIFICATION` | Optional. Google Search Console verification token, published as a meta tag. Accepts the bare token or the whole `<meta>` tag copied from Search Console (`lib/verification.ts` extracts the token); any other value fails the build. The site is static: a change to the variable only takes effect after a new deploy. |
| `VERCEL_PROJECT_PRODUCTION_URL` | Set by Vercel. Used when `SITE_URL` is missing. |
| `VERCEL_ENV` | Set by Vercel. Only `production` is indexable: previews get `noindex` and a `robots.txt` with `Disallow: /`. Outside Vercel, where the variable does not exist, the site is indexable. |

Locally you can create a `.env.local` file, which Git already ignores:

```bash
SITE_URL=https://www.example.com
GOOGLE_SITE_VERIFICATION=your-token
```

## Views and URLs

| # | View (ID) | EN | IT | FR | DE | Content |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | Index (`hero`) | `/en` | `/it` | `/fr` | `/de` | Large-format name, role, introduction, a paragraph naming employer, studies, stack and projects (the facts a search engine should read on the home page itself) and a call to explore. |
| 02 | Identity (`identity`) | `/en/identity` | `/it/identita` | `/fr/identite` | `/de/identitaet` | A title that is the first sentence of the mission statement (the rest is its subtitle), four engineering principles and contacts (GitHub, LinkedIn, GitLab). |
| 03 | Execution (`timeline`) | `/en/execution` | `/it/esecuzione` | `/fr/execution` | `/de/ausfuehrung` | Three-lane timeline (industry, academic path and self-directed Data Engineering study) on a shared time axis, with a live uptime counter and phases with their stack. |
| 04 | Systems (`projects`) | `/en/systems` | `/it/sistemi` | `/fr/systemes` | `/de/systeme` | Projects in an accordion, all collapsed when the view opens: summary, engineering decisions, layered architecture, link to Data Engineering and repository link (or a link to the contacts when the code is private). Currently: yourFinance (private) and aria-er (public). |
| 05 | Optimization (`discipline`) | `/en/optimization` | `/it/ottimizzazione` | `/fr/optimisation` | `/de/optimierung` | Training and music beyond the code: strength and power (method, metrics, weekly plan) and music and video production (acoustic guitar, software, workflow). |

Every URL is prerendered with its own content. An address that matches no view shows a localised, non-indexable 404 page.

## Navigation and interaction

- **Bottom links** (`01`–`05`): real `<a href>` elements, so middle-click, "open in new tab" and crawlers all work. A primary click swaps the view in place. Next to the active item sits the everyday word for that view ("Execution · Experience"), which is also part of every link's accessible name.
- **Keyboard**: `1`–`5` jump to a view, `←` and `→` cycle through them. Keys are ignored while a modifier is held or when focus is in a text field.
- **Touch**: a horizontal swipe (over 70 px and mostly horizontal) moves to the previous or next view.
- **Arrows and counter** in the footer on medium and large screens.
- **History**: every view change calls `pushState`, so the browser's back and forward buttons work. The document title follows the active view.
- **Language**: the header shows only the active language; the trigger opens an animated menu (`listbox`) listing every language by its native name, usable with mouse, touch and keyboard (arrows, Home/End, Enter/Space, Esc, outside click; focus returns to the trigger). Picking a language replaces the URL with the translated slug (`replaceState`), updates `lang` and the title, and stores the `NEXT_LOCALE` cookie for one year, without navigating. The canvas and the active view stay intact.
- **Language detection**: on `/` and on unprefixed paths, `proxy.ts` (the next-intl middleware) picks the language from the `NEXT_LOCALE` cookie or the `Accept-Language` header. The default language is English and the prefix is always present.
- **Theme**: the button cycles Auto → Light → Dark; the icon is half-filled, empty or full respectively.
- **Scene**: the pointer nudges the camera and "heats up" nearby nodes. The effect fades out when the pointer leaves the window.

## Architecture

### Rendering and routing

- The layout and pages use `generateStaticParams`: every language × view combination is generated at build time.
- `app/[locale]/page.tsx` (index) and `app/[locale]/[view]/page.tsx` (inner views) both render `components/seo/PortfolioPage.tsx`, a Server Component that injects the JSON-LD and starts the app on the requested view.
- `lib/routes.ts` is the single source for locales, IDs, localised slugs and URL ↔ view conversion. It depends on neither Next nor next-intl, so the Playwright suite imports the same module instead of keeping a copy.
- All languages are sent to the client (`getPortfolioBundle`), so switching language needs no navigation.

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
- The palette follows the resolved theme (light or dark) and carries the point size too: in the light theme the point is darker and about 25% larger, because dark points on a bright ground look thinner than light points on a dark one at the same contrast. On the inner views, where the field is dimmed to keep the text readable, the light theme keeps more of it (`presenceScale`), or it would all but vanish on the cream paper.

### Motion

- On first paint the entrances are pure CSS (`.intro-line` and `.intro-fade` under `html:not([data-booted])`). Content is therefore never stuck hidden while waiting for hydration, and the index title, the LCP element, starts painting right away.
- On the first view or language change, `markBooted()` hands control over to Framer Motion.
- `MotionConfig reducedMotion="user"` honours the system preference.

### Theme and typography

- CSS tokens in `app/globals.css` (`--paper`, `--ink`, `--muted`, `--line`, `--accent`), redefined under `.dark` and exposed to Tailwind v4 with `@theme inline`.
- The light theme is a cream paper (`#ede7db`), not display white: less glare, and the point field behind the content stays readable.
- `lib/theme.ts` repeats paper and ink for whatever cannot read custom properties (WebGL scene, `theme-color`, manifest, Open Graph images). `lib/theme.test.ts` fails when CSS and TypeScript drift apart, when text drops below AA/AAA contrast, or when the scene points become invisible or stronger than text.
- Custom utilities: `px-frame`, `no-scrollbar`, `fade-edges`, `link-underline`, `bg-dashed`.
- Fonts loaded with `next/font` and `display: swap`: Geist for body text, Geist Mono for labels, italic Instrument Serif for emphasised words.

## SEO

- **Per-view metadata** (`lib/seo.ts`): title, description, canonical, hreflang (`en`, `it`, `fr`, `de`, `x-default`), Open Graph `profile` and a `summary_large_image` Twitter card. For the index, `x-default` points to `/`, which detects the language; for the other views it points to the English version.
- **Open Graph images** at 1200 × 630, generated at build time for every language and view (`opengraph-image.tsx`, `lib/og.tsx`), featuring the site's long-standing icon.
- **JSON-LD** `@graph` (`lib/structuredData.ts`): `WebSite`, `Person` (with `alternateName`, `address`, `knowsAbout` and `sameAs`; `url` is the site root in every language), `ProfilePage`, `BreadcrumbList` on inner views and an `ItemList` of `SoftwareSourceCode` on the projects view.
- **`sitemap.xml`** with hreflang alternates, **`robots.txt`**, **`manifest.webmanifest`**, plus a favicon and icons derived from the previous site's icon.
- **Controlled indexing**: only production is indexable (see [Environment variables](#environment-variables)). The `robots` meta is set per page, not in the layout, so the 404 carries only Next's `noindex`.
- **Project content always in the HTML**: collapsed accordion panels stay mounted (zero height, `inert`), so every project's copy and repository link is in the prerendered page without any interaction.
- **Page structure**: a single `h1` per URL, real links in the navigation, `rel="me"` on social profiles, `X-Powered-By` header disabled.
- **301 redirects** from the old PHP URLs:

| Old URL | Destination |
| --- | --- |
| `/index.php` | `/` |
| `/error` | `/` |
| `/projDev/*` | `/it/sistemi` |
| `/projProd/*` | `/it/sistemi` |

### Google Search Console

1. Add a "URL prefix" property and pick the HTML tag verification.
2. Set `GOOGLE_SITE_VERIFICATION` on Vercel (token or whole tag) and **redeploy**: the variable is read at build time. Check the result with `curl -s https://<site>/en | grep google-site-verification`, then press "Verify".
3. Under "Sitemaps" submit `sitemap.xml`. On a new property the status "Couldn't fetch" with an empty "Last read" only means Google has not read it yet: it can take a couple of days.
4. Manual indexing requests are limited to a few per day. Spend them on the URLs with a language (`/en`, `/it`, `/en/systems`, …): the root `/` answers with a redirect and is never indexed as a page.

With a custom domain, prefer a "Domain" property verified through DNS.

## Accessibility

- Navigation through real links, with `aria-current="page"` on the active view; each view is a `section` with an `aria-label`.
- The projects accordion uses `aria-expanded` and `aria-controls`; collapsed panels are `inert`, out of reach for focus and assistive technology; buttons and controls have localised labels.
- Focus is always visible (`:focus-visible`), the `lang` attribute updates on language change; the language menu exposes `aria-haspopup="listbox"`, `aria-expanded` and `aria-selected`, and each option carries its own `lang`.
- Decorative elements (canvas, arrows, indices) are marked `aria-hidden`.
- Reduced motion is honoured at three levels: CSS intro, Framer Motion and the scene's frame loop.

## Text selection

Selection is disabled on interface chrome only: navigation, buttons, header and footer, labels, indices, display titles and the canvas. There, a selection is always accidental (double-clicks, swipes). Body text, descriptions and contacts remain selectable, and `Cmd/Ctrl+A` is not intercepted: blocking them would not protect the content (it is in the HTML and in search results) and would hurt accessibility and usability.

## Data and content

Content lives in [`data/shared.json`](data/shared.json) and in one file per language under [`data/locales/`](data/locales/), loaded by `lib/portfolio.ts`.

```
data/shared.json        language-independent data
├── name, handle, alternateNames, address
├── contacts[]          id, label, handle, url
├── timeline.threads[]  lanes: id, kind (work | education), entity, segments[], phases
├── projects[]          id, name, source, stack, layers
└── discipline          biological (metrics, sessions) · acoustic (formats, pipeline)
data/locales/<language>.json   en · it · fr · de
├── ui                  next-intl messages: meta (SEO), notFound, nav, navPlain, theme, locale, shell
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

`alternateNames` (other spellings and handles the same person is searched by) and `address` (`locality` and `country`, a two-letter ISO code) feed the `alternateName` and `address` of the JSON-LD `Person`; an invalid country code fails the build.

Fields that accept `null` (shown as `—`): `discipline.biological.heightCm`, `discipline.biological.weightKg`. `timeline.threads[].entity` accepts `null` too: the lane then shows its `entityLabel` alone (e.g. "Self-directed study") and stays out of `worksFor` / `alumniOf`. `projects[].source` is either `{ "visibility": "public", "url": "…" }` (repository link, also published as `codeRepository` in the JSON-LD) or `{ "visibility": "private" }`: the code is not linked and the project points to the Identity view, where a walkthrough can be requested. An unknown visibility or a public project without a `url` fails the build.

### Timeline lanes

A lane is a sequence of `segments`, not a single interval: `{ "start": "YYYY-MM-DD", "end": null }`, with `end: null` for the segment still running. More than one segment leaves a gap on the axis, and the active periods are also spelled out in text in the lane's detail. Lanes and columns derive from the array, so adding a third one needs no code change.

`kind` is either `work` or `education` and drives the JSON-LD: `work` lanes feed `worksFor` and `knowsAbout`, `education` lanes feed `alumniOf`. Any other value fails the build. The headline uptime follows the first `work` lane and sums active time only, excluding interruptions.

Each phase takes an optional `start`. Without it, phases are spread over the lane's active time and step over the gaps; with it, the phase is anchored to that date. When the phase labels have no room on the axis (a young lane: less than 12% of the axis between one label and the next, or the edge), the row stays empty and the phases are read in the detail only: `phaseMarksFit` in `lib/timeline.ts` decides.

## Extending the project

### Adding a project

1. Add an entry to `shared.projects` with `id`, `name`, `source` (public with a `url`, or private), `stack` and `layers` (`id`, `tech`).
2. In **every** language, add `projects.items[<id>]` with `summary`, `bridge`, `highlights` (the list of engineering decisions) and `layers` (one description per layer `id`).
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

1. `lib/routes.ts`: add the code to `LOCALES`, its native name to `LOCALE_NAMES` and the slugs to `VIEW_SLUGS`. The language menu is generated from here. `i18n/routing.ts`, `viewFromPath` and the E2E suite read from here and need no edit.
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
│   └── locales/                     en.json · it.json · fr.json · de.json: copy, UI strings, SEO metadata
├── i18n/             routing.ts (languages) · request.ts (next-intl messages)
├── lib/              routes, views, portfolio, timeline, seo, site, verification, structuredData, theme, og, format, hooks, cn
│   └── content/      schema (zod) · validate (cross-checks)
├── store/            viewStore (per instance) · useSceneStore (scene, transient)
├── e2e/              Playwright suite · helpers.ts (locales, views, waits)
├── .github/workflows/ci.yml   lint, typecheck, build and tests on every PR
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
- CI in `.github/workflows/ci.yml`: formatting, lint, typecheck, unit tests, build and end-to-end tests on every pull request and on every push to `development`. Its two jobs are required checks for merging (see [Workflow](#workflow)).
- **Performance budget** (`lighthouserc.json`): a third CI job runs Lighthouse three times, in mobile emulation, on the home, timeline and projects pages of the production build, and fails when the median leaves the thresholds: accessibility and SEO at 100, best practices ≥ 95, LCP ≤ 4 s, CLS ≤ 0.02, page weight ≤ 820 KB. The performance score (≥ 80) and TBT (≤ 500 ms) are reported as warnings only: they depend on the runner's speed, which changes from one run to the next (TBT from 360 to 750 ms on the same code), and as errors they would fail CI at random. The thresholds capture the current state on the CI runners, which are slower than a laptop and have no GPU (the WebGL scene costs more there), with a small margin: they exist to stop regressions and should be tightened with every improvement. Locally: `npm run build && npx @lhci/cli@0.15.1 autorun`.
- Dependabot (`.github/dependabot.yml`) opens one grouped weekly PR against `development` for npm dependencies and one for GitHub Actions. Major bumps of `eslint` and `typescript` are ignored until `eslint-config-next` supports them.
- `.mailmap` folds the early commits signed with a hostname-derived email into one identity, without rewriting history.
- Source maps are published in production too (`productionBrowserSourceMaps`): the repository is public, so they expose nothing new and keep stack traces and performance audits readable. The browser fetches them only with devtools open.
- `reactStrictMode` is on, and Next's dev indicator is off because it would sit on top of the navigation.

## Workflow

`development` is the production branch and it is protected: changes reach it only through a pull request.

1. One branch per piece of work, created from `development`: `features/<descriptive-name>`.
2. Before pushing, locally: `npm run format:check && npm run lint && npm run typecheck && npm run test:unit && npm test`.
3. Push the branch and open a pull request against `development`. The PR triggers CI (the same commands) and a non-indexable preview deployment on Vercel.
4. Merging requires both CI checks to pass, and it is the production deployment. "Create a merge commit" is used, so the history keeps the branch's commits.
5. The branch is deleted after the merge.

Issues and pull requests are written in English; commit messages in Italian.

## Deploying to Vercel

1. On vercel.com → **Add New → Project** → import `CieriS/portfolio`. Next.js is detected automatically (build `npm run build`, install `npm install`).
2. **Settings → Git → Production Branch**: `development`.
3. Optional variables in **Settings → Environment Variables**: `GOOGLE_SITE_VERIFICATION` and `SITE_URL` (custom domain only).
4. The site is live at `https://<project>.vercel.app`. Every merge into `development` is deployed automatically; other branches and PRs produce non-indexable previews.

Alternatively, from the terminal: `npx vercel login`, then `npx vercel` (preview) and `npx vercel --prod` (production).

### Local production build

```bash
npm run build
npm start
```

## Previous site

The portfolio used to be a PHP and MySQL site hosted on Altervista. Its code is no longer in this repository (it remains in the git history); what is left of that site today:

- the 301 redirects from its main URLs to the new views (see [SEO](#seo));
- the icon, from which this site's favicon and icons derive.

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

Code and content are the author's property, all rights reserved: see [`LICENSE`](LICENSE).

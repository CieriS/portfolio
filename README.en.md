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
- [Readable by AI agents](#readable-by-ai-agents)
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
- **Five languages (EN/IT/FR/DE/ES)**: translated slugs, automatic language detection and an instant language switch that keeps the view, the canvas and the state.
- **Persistent 3D scene**: a 5,376-point grid (WebGL) that changes shape and camera angle for each view and reacts to the pointer. It loads on the client only and adapts to the device's performance.
- **Light, dark or automatic theme** with next-themes, with no flash on load.
- **Considered motion**: a CSS intro on first paint (before hydration), then Framer Motion for view transitions, line masks and the animated navigation underline.
- **Complete SEO**: canonical, hreflang, Open Graph with images per language and view, JSON-LD, sitemap, robots, manifest and 301 redirects from the old PHP URLs.
- **Accessibility**: real links, a single `h1` per URL, ARIA attributes, visible focus, and `prefers-reduced-motion` honoured in CSS, in Framer Motion and in the 3D scene.
- **Centralised, validated content**: one shared JSON file plus one per language, checked by types, a zod schema and cross-checks — inconsistent content fails the build.
- **CV on request**: the PDF is generated on every download from the same content as the site, with the private contact details read from environment variables. It is not public: visitors leave an email address and receive a signed, expiring link; the owner downloads it at once with a password.
- **Case studies**: yourFinance and aria-er have a page of their own below the projects view (`/en/systems/yourfinance`, `/en/systems/ariaer`): problem, constraints, architecture, decisions, measures and screenshots. yourFinance's code stays private and its page never links to it; aria-er's page leads to its public repository and compares its results with ARPAE's figures.
  The measures table, wider than the screen at 320 px, scrolls on its own inside a named region reachable by keyboard; the page never scrolls sideways in any language (#146).

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, React Server Components, SSG) · React 19 |
| Language | TypeScript 6 (`strict`) |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) · next-themes (light / dark / system) |
| Typography | Geist · Geist Mono · Instrument Serif (`next/font/google`) |
| Motion | Framer Motion (`AnimatePresence`, `layoutId`, `MotionConfig`, mask reveal) |
| 3D | plain WebGL, no library (lazy, client-only) |
| State | Zustand (per-instance view store via context + transient scene store) |
| i18n | next-intl (`/en`, `/it`, `/fr`, language detection via `proxy.ts`, client-side language switch) |
| Data | `data/shared.json` + `data/locales/*.json` (single source: content, UI strings, SEO metadata), validated with zod |
| Quality | ESLint 9 (`eslint-config-next`: core-web-vitals + typescript) · Prettier · `tsc --noEmit` · Vitest · Playwright |
| PDF | pdf-lib (CV generated on request, server only) |
| Hosting | Vercel |

End-to-end tests run with Playwright on Chromium, WebKit and a mobile profile, against the production build. Unit tests use Vitest. GitHub Actions runs formatting, lint, typecheck, unit tests, build and end-to-end tests on every pull request.

## Requirements

- **Node.js ≥ 22.18.0** (`engines` field in `package.json`; `.nvmrc` names the major version CI uses, `nvm use`)
- **npm** (the repository ships a `package-lock.json`)

## Quick start

```bash
git clone https://github.com/CieriS/portfolio.git
cd portfolio
npm install
npm run dev
```

The site runs at http://localhost:3000. The root `/` redirects to one of the five languages (`/en`, `/it`, `/fr`, `/de`, `/es`) based on the browser language, to English when none matches.

Before the first `npm test`, install Playwright's browsers: `npx playwright install` (on Linux `npx playwright install --with-deps`).

To try it on a phone on the same network, open the *Network* address printed by `npm run dev` (for example `http://192.168.1.69:3000`). The hosts `192.168.*.*`, `10.*` and `*.local` are already allowed by `allowedDevOrigins` in `next.config.ts`; without that entry the page renders but never hydrates.

## npm scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server with hot reload at http://localhost:3000 |
| `npm run build` | Production build: prerenders pages, Open Graph images, sitemap and robots |
| `npm start` | Serves the production build locally |
| `npm run lint` | ESLint across the project (build output and Playwright reports excluded) |
| `npm run format` | Formats the project with Prettier (`.prettierrc.json`, with Tailwind class sorting) |
| `npm run format:check` | Checks formatting without writing, as CI does |
| `npm run typecheck` | Generates route types (`next typegen`) and type-checks with `tsc --noEmit` |
| `npm run test:unit` | Vitest unit tests for the pure logic (`lib/**/*.test.ts`), in under a second |
| `npm test` | Playwright end-to-end suite; builds and starts the production server itself |
| `npm run test:smoke` | Playwright smoke tests against a deployed site: `SMOKE_BASE_URL` (the deployment URL), `SMOKE_ENV` (`production` or `preview`), `SMOKE_SITE_URL` (the deployment's `SITE_URL`, defaults to the base) |
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
| `CV_ADMIN_PASSWORD` | Optional. The owner's password: downloads the CV with no further step. At least 16 characters, otherwise the password download stays off (the server log says so). |
| `CV_LINK_SECRET` | Optional. Secret (at least 32 characters, e.g. `openssl rand -base64 48`) that signs the links sent by email. Changing it invalidates every link already sent. |
| `RESEND_API_KEY` · `CV_MAIL_FROM` | Optional. [Resend](https://resend.com) API key and verified sender (e.g. `Samuele Cieri <cv@domain.com>`). Needed together with `CV_LINK_SECRET`: with only some of the three, email links stay off. |
| `CV_NOTIFY_EMAIL` | Optional. Address that receives a notice on every CV request, with the requester's email. |
| `CV_EMAIL` · `CV_PHONE` | Optional. Contact details printed in the PDF only: they are why the CV is not public, and they are not in the repository. |

The CV variables are read by the `/api/cv` route when the server starts, not at build time: the static pages never contain them. Without any of them the site works and the form answers "not available".

Locally, copy `.env.example` to `.env.local` (which Git already ignores) and keep only the variables you need (invented values):

```bash
SITE_URL=https://www.example.com
GOOGLE_SITE_VERIFICATION=example-verification-token
# CV on request: leave them out and the form answers "not available"
CV_ADMIN_PASSWORD=at-least-16-characters
CV_LINK_SECRET=at-least-32-characters-from-openssl-rand
RESEND_API_KEY=re_example
CV_MAIL_FROM=Example Name <cv@example.com>
CV_NOTIFY_EMAIL=owner@example.com
CV_EMAIL=name@example.com
CV_PHONE=+00 000 000 0000
```

## Views and URLs

| # | View (ID) | EN | IT | FR | DE | ES | Content |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | Index (`hero`) | `/en` | `/it` | `/fr` | `/de` | `/es` | Large-format name, role, the role I am looking for (Data Engineer, full remote), introduction, a paragraph naming employer, studies, stack and projects (the facts a search engine should read on the home page itself) and two calls to action under the role: "See the projects" (Systems view) and "Contact" (the contact section). |
| 02 | Identity (`identity`) | `/en/identity` | `/it/identita` | `/fr/identite` | `/de/identitaet` | `/es/identidad` | A title that says what the view holds ("How I work, and where to reach me.", #139), a subtitle on how I choose tools, four engineering principles, each with evidence from yourFinance or aria-er (#105), and contacts (`#contacts`, with the role I am looking for and the fastest channel), in this order: Curriculum, LinkedIn, GitHub, Instagram, GitHub Sponsors. On phones each row's detail (handle, "PDF · on request") sits under its name. |
| 03 | Execution (`timeline`) | `/en/execution` | `/it/esecuzione` | `/fr/execution` | `/de/ausfuehrung` | `/es/ejecucion` | Three-lane timeline (industry, academic path and self-directed Data Engineering study) on a shared time axis, with a live counter of the time at Tas and phases with their stack. |
| 04 | Systems (`projects`) | `/en/systems` | `/it/sistemi` | `/fr/systemes` | `/de/systeme` | `/es/sistemas` | Projects in an accordion, all collapsed when the view opens but each with one line saying what it is (`teaser`); opened, it shows the summary, engineering decisions, layered architecture, what it shows for data engineering, the case study when there is one and the repository link (or a link to the contacts, "demo on request", when the code is private). Currently: yourFinance (private) and aria-er (public). |
| — | ~~Optimization~~ (removed) | `/en/optimization` | `/it/ottimizzazione` | `/fr/optimisation` | `/de/optimierung` | `/es/optimizacion` | Training and music: view removed in issue #50. The old URLs redirect permanently (308) to the identity view of the same locale, also when written in another language (`/it/optimization` → `/it/identita`; `RETIRED_VIEW_SLUGS` in `lib/routes.ts`); training and guitar stay as one line in Identity ("Outside work"). The view's last state (code, copy in five languages, scene) is kept in the git tag `vista-ottimizzazione`: `git checkout vista-ottimizzazione` to look at it, `git diff vista-ottimizzazione -- data components lib` to start again from there. |

Every URL is prerendered with its own content. An address that matches no view shows a localised, non-indexable 404 page.

Below the Systems view there is one more page for the projects that have a case study: `/en/systems/yourfinance`, `/it/sistemi/yourfinance`, `/fr/systemes/yourfinance`, `/de/systeme/yourfinance`. It is a document with real links, not a sixth view: it is reached from the open project in the accordion, and leaving it is a navigation. The link back to the projects view sits in the header, which does not scroll with the page, as well as at the end.

## Navigation and interaction

- **Bottom links** (`01`–`05`): real `<a href>` elements, so middle-click, "open in new tab" and crawlers all work. A primary click swaps the view in place. On desktop the everyday word for the active view sits next to it ("Execution · Experience"); below `md` every item shows its number and everyday word ("03 Experience"), without the system name. The everyday word is also part of every link's accessible name: the name comes from the link's own text (the index is hidden from screen readers, on desktop the everyday word of inactive items is there for them only, on phones the system name is), so what is read matches what is shown.
- **Contacts from everywhere**: the home's "Contact" link, a private project's code link and the end of every case study lead to `/en/identity#contacts` (`contactsPath`, `lib/routes.ts`). Inside the app `ViewLink` with a `fragment` writes the address and swaps the view in place; the Identity view reads the fragment, scrolls the section into view and gives it keyboard focus.
- **Touch targets**: site name, language, theme and menu items are at least 44 × 44 px (`min-h-11`): the hit area grows, not the type. On screens without hover (`@media (hover: none)`) the home's "Move the cursor" hint is not shown.
- **Projects from the home**: in the home paragraph the project names are links (`ProjectLink`, derived from `shared.projects` with `splitByNames`). They lead to the case study when there is one, otherwise to the projects view with the panel already open: the address is `/en/systems#<id>`, which also works pasted or shared. Without a fragment, or with a malformed one, every project starts collapsed. A language switch keeps the fragment and the open panel; Back and Forward across a language switch lose no history entry.
- **Keyboard**: `1`–`4` jump to a view while focus is in the view menu (at the bottom; elsewhere a digit does nothing, so a number dictated by speech input does not change page: WCAG 2.1.4, #121), `←` and `→` cycle through them. Keys are ignored while a modifier is held or when focus is in a text field.
- **Touch**: a horizontal swipe (over 70 px and mostly horizontal) moves to the previous or next view.
- **Trackpad**: a sideways two-finger scroll does not go back or forward in the history (`overscroll-behavior: none` on the root), because it fired by accident while scrolling a view. This holds in Chromium and Firefox; Safari handles that gesture itself and may ignore the rule. Browser buttons and keyboard shortcuts are unchanged.
- **Arrows and counter** in the footer on medium and large screens.
- **Scroll indicator**: scrollbars are hidden, so a view taller than the screen shows a thin line on the right edge with a thumb that follows the scroll. It appears only where there is content below the fold (measured with `ResizeObserver`; geometry in `lib/scroll.ts`) and is hidden from assistive technology.
- **Short screens and high zoom** (#141, WCAG 1.4.10): below 30rem of height (the `short:` variant in `app/globals.css`: 200% zoom on 1280×720, phones in landscape) header and menu are no longer fixed but scroll with the page, and the view fills the screen; the view's scroll chains to the page once it reaches the end. Reading area of the identity view before → after, with the page at the top: 320×256 143 → 199 px, 320×180 67 → 123, 640×360 247 → 303, 844×390 261 → 325. Above that height nothing changes.
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
- The copy of the two error pages lives in `data/errors.json` and is read through `lib/errorCopy.ts`: error pages are client components, and reading it from the content module used to ship the zod schema and all four locale files to the browser (about 100 KB compressed on every page). A test (`lib/errorCopy.test.ts`, with `lib/importGraph.ts`) follows the imports of every client component through all local modules and fails if it reaches `lib/portfolio.ts`, `lib/content/*` or `zod` at runtime, even through another module; the message shows the chain (e.g. `LiveResults.tsx → lib/liveResults.ts → zod`).

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
- `DataField` is loaded with `next/dynamic` and `ssr: false` and draws with plain WebGL (`components/scene/fieldRenderer.ts`): one program, two static buffers, a single draw call. Up to 2.4 the scene ran on three.js and react-three-fiber: ~230 KB gzip and a long start-up task, nearly all of the desktop Total Blocking Time (issue #64). ACES tone mapping and the sRGB conversion are three's, copied into the shader, so the colours did not change.
- The grid has 96 × 56 points; every fifth row carries moving "data packets".
- The grid is uploaded to the GPU once (`lib/sceneField.ts`). Each point's height, the ripple around the pointer, the packets and the colour are computed by the vertex shader (`components/scene/fieldShader.ts`); on every frame `stepSim` (`lib/sceneSim.ts`, pure and tested, with the camera maths in `lib/sceneMath.ts`) eases the parameters and hands the shader a dozen numbers, whatever the point count. The wave and flow phases arrive already wrapped into their period, because numbers on the GPU are 32-bit.
- Each view has a mode in `lib/sceneModes.ts` (amplitude, frequency, speed, flow, pointer radius and force, presence, camera position). On a view change the parameters ease smoothly to the new values.
- `lib/sceneMonitor.ts` (same thresholds as the drei `PerformanceMonitor` it replaces) drops the device pixel ratio to 1 when the frame rate falls and raises it back up to 1.75 when it recovers.
- With `prefers-reduced-motion: reduce` the canvas has no frame loop and repaints only when the view or theme changes. The same holds with the pause button in the header (`MotionToggle`, #142, WCAG 2.2.2): a two-state button (`aria-pressed`) that stops the scene and hides the decorative loops (timeline packets, pulses) through `data-motion="paused"` on `<html>`; the choice is kept in `localStorage` (`lib/motionPreference.ts`) across views and reloads. While still (reduced motion or paused) the timeline counter updates once a minute instead of every second (#143).
- The palette follows the resolved theme (light or dark) and carries the point size too: in the light theme the point is darker and about 25% larger, because dark points on a bright ground look thinner than light points on a dark one at the same contrast. On the inner views, where the field is dimmed to keep the text readable, the light theme keeps more of it (`presenceScale`), or it would all but vanish on the cream paper.

### Motion

- On first paint the entrances are pure CSS (`.intro-line` and `.intro-fade` under `html:not([data-booted])`). Content is therefore never stuck hidden while waiting for hydration, and the index title, the LCP element, starts painting right away.
- On the first view or language change, `markBooted()` hands control over to Framer Motion.
- `MotionConfig reducedMotion="user"` honours the system preference.

### Theme and typography

- CSS tokens in `app/globals.css` (`--paper`, `--ink`, `--muted`, `--line`, `--accent`), redefined under `.dark` and exposed to Tailwind v4 with `@theme inline`.
- Type roles, in the same `@theme inline` (#97): `text-display` (the name on the home page), `text-title` (the single `h1` of views, case studies and error pages), `text-heading` (project names), `text-subheading` (contact rows), `text-lede` (the case study subtitle), `text-body` (15 px), `text-small` (13 px), `text-label` (mono labels: 12 px below `md`, 11 px above; no text below 12 px on a phone) and `text-emphasis` (serif italic inside a heading). The large roles carry line height and tracking; headings keep three tracking values (`tracking-display`, `tracking-tight`, `tracking-snug`) plus `tracking-label`. Vertical gaps between blocks (#145): `mt-head` (after `SectionHead`), `mt-section` (Identity's sections), `mt-subsection` (later sections of a view or case study), with the `md` values in the `--gap-*` variables. `lib/designTokens.test.ts` fails if a `text-[…]`, `tracking-[…]` or `leading-[…]` class or a hand-written large margin comes back in `components/` or `app/`; `e2e/typography.spec.ts` checks that no text drops below 12 px at 375 px and that the timeline phase labels stay on screen at 375, 768 and 1440 px in every locale (the last one aligns right when it would not fit).
- The accent has a 2.52:1 contrast on the light paper: dots, lines and fills only, never text in the light theme (#100). `lib/designTokens.test.ts` fails on `text-accent`, `fill-accent` or `color: var(--accent)` in components; a `dark:` variant is allowed (6.34:1 on the dark paper).
- Round icon (#144): `components/ui/RoundIcon.tsx` (`RoundIcon` for the icon inside a link, `roundIcon()` for a button that is the icon itself), with two sizes (`sm` 36 px in the footer, `md` 40 px elsewhere), an `active` state (open panel) and a hover kind (`fill` or `border`). No client code, so server pages use it too; `lib/designTokens.test.ts` fails if the pattern is written by hand again.
- External links (#148): always `↗` (contacts, project releases and code, public code and data in the case studies), with no hover rotation; `→` stays for internal links. The only exception is a link inside a sentence. The test checks every `target="_blank"`. The stale-data notice of the live results is ink in the light theme and accent in the dark one.
- The light theme is a cream paper (`#ede7db`), not display white: less glare, and the point field behind the content stays readable.
- `lib/theme.ts` repeats paper, ink, muted text and accent for whatever cannot read custom properties (WebGL scene, `theme-color`, manifest, Open Graph images, `app/global-error.tsx`); `inkAlpha` gives the ink at an opacity, for hairlines and borders. A test fails if `global-error.tsx` or `lib/og.tsx` writes a colour of its own. `lib/theme.test.ts` fails when CSS and TypeScript drift apart, when text drops below AA/AAA contrast, or when the scene points become invisible or stronger than text.
- Custom utilities: `px-frame`, `no-scrollbar`, `fade-edges`, `link-underline`, `bg-dashed`.
- Fonts loaded with `next/font` and `display: swap`: Geist for body text, Geist Mono for labels, italic Instrument Serif for emphasised words.

### CV on request

- `app/api/cv/route.ts` is the only part rendered per request: everything else stays prerendered. It is a thin adapter: it reads the configuration, calls `lib/cv/service.ts` and maps the outcome to an HTTP response.
- `lib/cv/service.ts` holds the two rules, free of HTTP and PDF: right password → PDF; valid email → signed link sent to that address (plus a notice to the owner). A hidden honeypot field stops bots without telling them.
- `lib/cv/token.ts`: the link carries only language and expiry (24 hours, `lib/cv/common.ts`), signed with HMAC-SHA256. No database is needed, and a tampered or expired link is refused. The requester's email is **not** in the link (#65): the token is signed, not encrypted, and the URL ends up in Vercel's logs and in browser history. Links sent earlier, which contained it, keep working until they expire. When a delivery fails, the error written to the logs has the address masked (`withoutAddress` in `lib/cv/service.ts`). **If what the CV collects or who it is sent to changes, the privacy notice must change too.** Passwords are compared in constant time.
- `lib/cv/document.ts` builds the CV as plain data from `data/shared.json` and the chosen language; `lib/cv/pdf.ts` lays it out on A4 with the standard fonts (no font file to ship). PDF and email copy live in `data/cv.json`, outside the locale files that reach the browser.
- In the form, the password field has a button to show or hide it: the comparison is exact, so a space pasted by mistake gets it refused. Switching method hides it again.
- The form does not use the browser's validation (`noValidate`): its generic message is in the browser's language, not the page's. `checkCvInput` (`lib/cv/common.ts`) checks the field before sending and the page says what is missing in its own words (no address, something that does not look like an email, no password), marks the field with `aria-invalid` and moves focus back to it.
- On focus the line under the field turns ink and doubles to 2 px (#147): a change of shape, not only of colour, like the outline of the other controls.
- The CV adds what the site does not show, from `data/cv-profile.json` (`lib/cv/profile.ts`): grouped skills, spoken languages with their level and which profiles to list. Certifications live in `shared.json`, where the site reads them too (the "Method" phase of the Tas thread and `Person.hasCredential` in the JSON-LD): one source, so the two cannot drift apart. Sections run skills, experience, education, certifications, projects, languages; the data-processing consent closes the page. It stays single-column and image-free so that applicant tracking systems (ATS) read it in order: the only colour is on the section titles. Course names are translated through `terms` in `data/cv.json`; a test fails when a technology from work or projects is missing from the skills.
- `lib/cv/mailer.ts` is the outbound port for email, with an adapter for Resend's REST API over `fetch` (no SDK). Sending by SMS would be another adapter.
- Before reading the body, `guardCvPost` (`lib/cv/guard.ts`) refuses a POST that is not JSON (415) and one whose `Origin` is neither the site nor the address the request was sent to (403): a `text/plain` or form request skips the CORS preflight, so without this check any page could make its visitors' browsers send a CV email. Previews and localhost work because the request's own origin counts too; a request without `Origin` (not from a browser) goes through.
- Outcomes in the form (`statusFromCode` in `lib/cv/common.ts`): 502 means the provider refused the email, and the message points to LinkedIn instead of asking to retry; 429 is the rate limit and asks to wait a few minutes.
- Rate limit: no shared state in the code. A Vercel Firewall rate-limiting rule on `POST /api/cv` provides it: **5 requests per IP every 10 minutes**, answered with 429. The owner password must be long because the code does not count attempts.

### Case studies

- `app/[locale]/[view]/[study]/page.tsx` prerenders the page only under the slug of the projects view and only for the ids in `CASE_STUDY_IDS` (`lib/routes.ts`); anything else is a 404. A view segment in another language (`/it/systems/ariaer`) is not a 404 but a 308 redirect to the right one (`localizedPath`, applied by `proxy.ts`): `/systems/ariaer`, with no language, therefore opens the case study in the browser language and is the address to use outside the site.
- `components/case-study/CaseStudyPage.tsx` is a server component: all the text is in the HTML and the page does not load the animation library. It uses the text primitives of `components/ui/text.tsx`, shared with the views.
- The case study header uses the shell's language menu (`LocaleSwitch`, through `CaseStudyLocaleSwitch`, #98): picking a language opens the same case study in that language (a real navigation, plus the `NEXT_LOCALE` cookie). The menu opens with a CSS animation rather than Framer Motion, so the server page does not load the library. The site name stays on phones too; below `sm` the back link is the arrow alone, with the full accessible name. An E2E test checks that name, back link, language and theme fit the header at 320 and 375 px.
- The content lives in `data/case-studies/<id>.json` (structure plus copy in every language), outside the locale files that reach the browser. `lib/caseStudy.ts` validates it with zod and cross-checks: an id with no copy in one language, an empty `alt` or a description over 160 characters fails the build.
- **Live results** (optional, `live` field of the JSON): a client component (`components/case-study/LiveResults.tsx`) reads the export the project publishes (aria-er: a daily JSON on GitHub Pages) and draws SVG charts in the site's colours. The logic is pure in `lib/liveResults.ts` (hand-written contract guards, no zod: in the browser zod weighed 38 KB gzip and its `Function('')` probe broke the CSP; chart series; data older than 48 hours); the allowed origins are in `DATA_ORIGINS` (`lib/dataOrigins.ts`), from which `next.config.ts` builds `connect-src`. If the export does not answer, the page stays whole with a message. The E2E tests stub the export with `page.route`.
- Screenshots are static imports (`lib/caseStudyImages.ts`) served by `next/image`. For a private project they must come **from the demo profile only**; aria-er's come from its own dashboard, on public data.
- Each page has a canonical, hreflang, an Open Graph image, a sitemap entry and a `TechArticle` JSON-LD with a `BreadcrumbList`. For a private project `codeRepository` is never emitted, and an E2E test checks that the page holds no link to the repository. For a public project the closing link leads to the repository (`data-source="public"`) and the JSON-LD has `codeRepository`. Every case study ends with a link to the contacts: for a private project it is the code link, for a public one a second link (`access.contact`, in every language or in none: `findCaseStudyIssues` checks it).

## SEO

- **Per-view metadata** (`lib/seo.ts`): title, description, canonical, hreflang (`en`, `it`, `fr`, `de`, `es`, `x-default`), Open Graph `profile` and a `summary_large_image` Twitter card. For the index, `x-default` points to `/`, which detects the language; for the other views it points to the English version.
- **Open Graph images** at 1200 × 630, generated at build time for every language and view (`opengraph-image.tsx`, `lib/og.tsx`), featuring the site's long-standing icon. The icon is a 56 px copy (`lib/og-icon.png`, about 3 KB), the size it is drawn at: regenerate it from `app/icon.png` if the icon changes.
- Metadata and JSON-LD have unit tests for every locale and page (`lib/seo.test.ts`, `lib/structuredData.test.ts`): canonical, complete hreflang, robots (including `noindex` on previews), graph types and links between nodes.
- **JSON-LD** `@graph` (`lib/structuredData.ts`): `WebSite`, `Person` (with `alternateName`, `address`, `knowsAbout` and `sameAs`; `url` is the site root in every language), `ProfilePage`, `BreadcrumbList` on inner views and an `ItemList` of `SoftwareSourceCode` on the projects view.
- **`sitemap.xml`** with hreflang alternates and a `lastmod` per page (the date of its data, as `dateModified`), **`robots.txt`**, **`manifest.webmanifest`**, plus a favicon and icons derived from the previous site's icon.
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

- **One indexed host**: of the project's three `*.vercel.app` hosts (`cieri`, `cierisamuele`, `samuelecieri`, listed in `lib/aliases.ts`) only the one in `SITE_URL` is served; the others answer with a permanent redirect (308) to the same path on `SITE_URL`. The canonical tag alone was not enough: Google had indexed an alias. The hosts are listed one by one in `lib/aliases.ts`, so previews, localhost and the test server are never caught. A new alias added on Vercel must be added there too.

### Google Search Console

1. Add a "URL prefix" property and pick the HTML tag verification.
2. Set `GOOGLE_SITE_VERIFICATION` on Vercel (token or whole tag) and **redeploy**: the variable is read at build time. Check the result with `curl -s https://<site>/en | grep google-site-verification`, then press "Verify".
3. Under "Sitemaps" submit `sitemap.xml`. On a new property the status "Couldn't fetch" with an empty "Last read" only means Google has not read it yet: it can take a couple of days.
4. Manual indexing requests are limited to a few per day. Spend them on the URLs with a language (`/en`, `/it`, `/en/systems`, …): the root `/` answers with a redirect and is never indexed as a page.

With a custom domain, prefer a "Domain" property verified through DNS.

## Readable by AI agents

Assistants and coding agents often read a site through a fetch tool, not a browser. Next to the HTML and the JSON-LD the site serves files written for them, all generated at build from `data/` by pure renderers in `lib/agents/` (tested with Vitest), so they cannot drift from the pages:

| File | What it is | Headers |
| --- | --- | --- |
| `/llms.txt` | entry point in the [llms.txt](https://llmstxt.org/) format: summary, pages, projects, contacts, other languages | `text/plain`, indexable in production |
| `<page URL>.md` (`/en.md`, `/it/identita.md`, `/en/systems/yourfinance.md`) | each view and case study in every language as Markdown, linked from its page with `<link rel="alternate" type="text/markdown">` | `text/markdown`, `noindex` |
| `/llms-full.txt`, `/<locale>/llms-full.txt` | the whole site in one file: the Markdown pages joined, nothing written only there (budget 60 KB) | `text/plain`, `noindex` |

- Paths come from `lib/routes.ts` through `lib/agents/paths.ts`. `<page>.md` and `/<locale>/llms-full.txt` would match the page routes, so `next.config.ts` rewrites each address (one literal rule per file) to the internal route handlers under `app/agents/`; `proxy.ts` skips them. They are not in the sitemap.
- **A new field shown on a page must also be rendered in Markdown**: `lib/agents/markdown.test.ts` walks every string of the view's copy and fails if the Markdown omits one (the few exceptions, such as the scene hint, are listed in the test with their reason).
- Never in these files: e-mail addresses, phone numbers or environment values (the CV is "on request through the form"), nor a repository link for a private project (tested).
- The JSON-LD carries `dateModified` (the last commit that touched the page's data files, `lib/lastModified.ts`; the same date is `lastmod` in the sitemap) and `seeks` on `Person` (the role in `shared.seeks`, which every locale's `hero.seeking` must name).
- How to check what assistants answer about the site, and the results: [`docs/ai-agents.md`](docs/ai-agents.md).
- **`robots.txt`** (`lib/agents/crawlers.ts`, #175): every AI crawler is allowed, written out by group (search, fetch on a user's request, training) from one tested list; `/api/` is closed to every agent; previews are `Disallow: /`.

## Accessibility

- Navigation through real links, with `aria-current="page"` on the active view; each view is a `section` with an `aria-label`.
- The projects accordion uses `aria-expanded` and `aria-controls`; collapsed panels are `inert`, out of reach for focus and assistive technology; buttons and controls have localised labels.
- Focus is always visible (`:focus-visible`), the `lang` attribute updates on language change; the language menu exposes `aria-haspopup="listbox"`, `aria-expanded` and `aria-selected`, and each option carries its own `lang`.
- Decorative elements (canvas, arrows, indices) are marked `aria-hidden`.
- Reduced motion is honoured at three levels: CSS intro, Framer Motion and the scene's frame loop; without that setting, the pause button stops the scene and the decorative loops.

## Text selection

Selection is disabled on interface chrome only: navigation, buttons, header and footer, labels, indices, display titles and the canvas. There, a selection is always accidental (double-clicks, swipes). Body text, descriptions and contacts remain selectable, and `Cmd/Ctrl+A` is not intercepted: blocking them would not protect the content (it is in the HTML and in search results) and would hurt accessibility and usability.

## Data and content

Content lives in [`data/shared.json`](data/shared.json) and in one file per language under [`data/locales/`](data/locales/), loaded by `lib/portfolio.ts`.

```
data/shared.json        language-independent data
├── name, handle, alternateNames, address
├── knowsLanguage[]     languages I speak (JSON-LD), not the site's languages
├── contacts[]          id, label, handle, url
├── certifications[]    id, name, issuer, entity, issued, expires, url (CV, "Method" phase, hasCredential)
├── sponsor             label, url (GitHub Sponsors: kept out of contacts, so not in sameAs or the CV)
├── timeline.threads[]  lanes: id, kind (work | education), entity, segments[], phases
└── projects[]          id, name, source, stack, layers
data/locales/<language>.json   en · it · fr · de
├── ui                  next-intl messages: meta (SEO), notFound, nav, navPlain, theme, locale, shell
├── hero
├── identity
├── timeline
└── projects            items[id]: teaser, summary, bridge, highlights, layers
```

- `shared.json` holds language-independent data (links, dates, stack, metrics); `locales/<language>.json` holds the copy.
- Each language's `ui` block is used as next-intl messages and also contains the per-view SEO title and description (`ui.meta.views`).
- Copy is linked to shared data by `id` (for example `shared.projects[].id` → `projects.items[id]` in every language).
- **Copy tone** (#20, #103, #106): first person, things called by their name, no operating-system metaphors (processes, threads, uptime, bridges), only facts present in the data; every language written in that language. Spelling: "frontend" as one word; "Data Engineering" capitalised as the name of the role or the path, lowercase as a discipline inside a sentence; no Oxford comma in English. `lib/content/content.test.ts` fails if the removed metaphors come back in the rewritten strings.
- `*Emphasis` fields name the word rendered in italic serif and must appear in the text they refer to.
- Dates use ISO `YYYY-MM-DD` and are displayed as `DD.MM.YYYY`.
- Content goes through four checks before prerendering, and any failure fails the build:
  1. **types**: every language is assigned to the shape of `en.json`, so a missing or renamed key fails `npm run typecheck`;
  2. **schema** (`lib/content/schema.ts`): `shared.json` is parsed with zod (enums, real ISO dates, segments ending after they start, URLs, the `source` union); the domain types are inferred from the schema;
  3. **copy values** (`lib/content/copy.ts`): every language is parsed with zod against the shape of `en.json` (same keys, same lists, same `{…}` placeholders); no empty text or stray whitespace at the edges, meta descriptions ≤ 160 characters, titles ≤ 65 as the tab shows them (with the site name), no text of 60 characters or more identical to English (untranslated);
  4. **cross-checks** (`lib/content/validate.ts`): every thread, phase, project and layer id has copy in every language, every language has its `ui.locale` label, and every `*Emphasis` occurs in its text. All problems are listed at once, with their path.

`alternateNames` (other spellings and handles the same person is searched by) and `address` (`locality` and `country`, a two-letter ISO code) feed the `alternateName` and `address` of the JSON-LD `Person`; an invalid country code fails the build.

Fields that accept `null` (shown as `—`): `timeline.threads[].entity` accepts `null` too: the lane then shows its `entityLabel` alone (e.g. "Self-directed study") and stays out of `worksFor` / `alumniOf`. `projects[].source` is either `{ "visibility": "public", "url": "…" }` (repository link, also published as `codeRepository` in the JSON-LD) or `{ "visibility": "private" }`: the code is not linked and the project points to the Identity view, where a walkthrough can be requested. An unknown visibility or a public project without a `url` fails the build.

### Timeline lanes

A lane is a sequence of `segments`, not a single interval: `{ "start": "YYYY-MM-DD", "end": null }`, with `end: null` for the segment still running. More than one segment leaves a gap on the axis, and the active periods are also spelled out in text in the lane's detail. Lanes and columns derive from the array, so adding a third one needs no code change.

`kind` is either `work` or `education` and drives the JSON-LD: `work` lanes feed `worksFor` and `knowsAbout`, `education` lanes feed `alumniOf`. Any other value fails the build. The headline counter ("Time at Tas") follows the first `work` lane and sums active time only, excluding interruptions. Its label names the employer in each language: a new `work` lane needs a new `timeline.labels.uptime` too.

Each phase takes an optional `start`. Without it, phases are spread over the lane's active time and step over the gaps; with it, the phase is anchored to that date. When the phase labels have no room on the axis (a young lane: less than 12% of the axis between one label and the next, or the edge), the row stays empty and the phases are read in the detail only: `phaseMarksFit` in `lib/timeline.ts` decides.

## Extending the project

### Adding a project

1. Add an entry to `shared.projects` with `id`, `name`, `source` (public with a `url`, or private), `stack` and `layers` (`id`, `tech`). `version` is optional (`0.9.0`, no `v`): it shows in the project panel, in the CV and in the JSON-LD, and for a public project it links to the tag's page on GitHub. Together with `released` (the publication date) it is kept up to date by a workflow: see [Project versions](#project-versions).
2. In **every** language, add `projects.items[<id>]` with `teaser` (one line shown while the project is closed, at most 80 characters and not repeated in the `summary`), `summary`, `bridge`, `highlights` (the list of engineering decisions) and `layers` (one description per layer `id`).
3. If needed, update the title and description in `ui.meta.views.projects`.

The view and the `ItemList` JSON-LD update automatically.

### Adding a case study

1. Add the project id to `CASE_STUDY_IDS` in `lib/routes.ts`.
2. Create `data/case-studies/<id>.json` after `yourfinance.json` and import it in `lib/caseStudy.ts`.
3. Put the screenshots in `data/case-studies/<id>/` and import them in `lib/caseStudyImages.ts`, under the same keys as `screens`.

The accordion link, sitemap, metadata and Open Graph image follow on their own; TypeScript points at whatever is left to touch.

### Project versions

`version` and `released` of each project in `data/shared.json` follow the projects' own releases, without typing them by hand.

- `.github/workflows/versions.yml` runs every day, and on demand from the Actions tab. `scripts/sync-versions.mjs` reads the latest release of every project that states a version and, when it is newer, rewrites the two lines; the logic is in `lib/versions.ts`, pure and tested.
- The workflow never writes to `development`: it opens a pull request from the `features/versioni-dei-progetti` branch (or updates the one already open), with the `semver:patch` label and the lowest open milestone (none when no milestone is open), so the release notes do not file it under "Other". The checks run as for any other and merging stays a decision.
- Pre-releases count; drafts do not. It never goes back: an equal or older version is ignored.
- If a check fails in that pull request, some copy depends on the version (for example the aria-er entry, which until 1.0.0 must say what is missing): fix the copy in that branch, then merge.
- A public project is looked up in the repository of its `source.url`. A private one has no address in the data, on purpose: its repository comes from the `VERSION_SOURCES` secret and appears neither in the files nor in the logs; a test fails if the name ends up in a file.

Configuration, once, in **Settings → Secrets and variables → Actions**:

| Secret | Value |
| --- | --- |
| `VERSIONS_TOKEN` | A fine-grained personal access token limited to **this** repository. Permissions: **Contents** and **Pull requests**, read and write. |
| `VERSION_SOURCES_TOKEN` | Only for private projects: a second fine-grained token, limited to their repositories, with **Contents** read-only. Two tokens because a fine-grained token gives the same permissions on every repository it includes: a single one could also have written to the private projects. |
| `VERSION_SOURCES` | Only for private projects: `{"<project id>":"owner/repository"}`. |

A personal token is needed, not the workflow's own: a pull request opened with `GITHUB_TOKEN` starts no other workflow, so the required checks would never run. The token expires: when it does the workflow fails with a message that says so, and it has to be regenerated. Without the secret the workflow stops at once with a clear error.

### Adding a contact

Add `{ id, label, handle, url }` to `shared.contacts`: it appears in the Identity view, in the order of the array (after the Curriculum), and in the JSON-LD `sameAs` field.

### Adding a view

1. `lib/routes.ts`: add the ID to `VIEW_IDS` and its slug for each language in `VIEW_SLUGS`.
2. `lib/sceneModes.ts`: add the scene mode to `SCENE_MODES`.
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
│   │       ├── opengraph-image.tsx  per-view Open Graph image
│   │       └── [study]/             case study of a project (page + Open Graph image)
│   ├── api/cv/route.ts              CV download (the only dynamic route)
│   ├── llms.txt/route.ts            entry point for AI agents
│   ├── agents/                      Markdown pages and llms-full.txt (reached through rewrites)
│   ├── globals.css                  colour, type and spacing tokens, Tailwind utilities, CSS intro
│   ├── sitemap.ts · robots.ts · manifest.ts
│   └── favicon.ico · icon.png · apple-icon.png
├── components/
│   ├── motion/       ViewFrame (view container), Reveal (variants, line mask, intro)
│   ├── providers/    ThemeProvider (next-themes)
│   ├── scene/        SceneLayer → DataField (lazy) → fieldRenderer (WebGL) · fieldShader
│   ├── case-study/   CaseStudyPage (server component), CaseStudyLocaleSwitch, LiveResults, SceneMode
│   ├── seo/          PortfolioPage (JSON-LD + app)
│   ├── shell/        AppRoot, AppShell, NavBar, ViewLink, LocaleSwitch, ThemeToggle,
│   │                 useViewNavigation, useViewUrlSync
│   ├── ui/           text (Meta, Emphasis), RoundIcon: primitives with no client code
│   └── views/        HeroView, IdentityView, TimelineView, ProjectsView, CvRequest, atoms
├── data/
│   ├── shared.json                  language-independent data
│   ├── cv.json                      CV PDF and email copy (server only)
│   ├── cv-profile.json              CV skills and languages (server only)
│   ├── case-studies/                one JSON per case study + a folder with its screenshots (server only)
│   └── locales/                     en.json · it.json · fr.json · de.json: copy, UI strings, SEO metadata
├── i18n/             routing.ts (languages) · request.ts (next-intl messages)
├── lib/              routes, views, portfolio, timeline, scroll, seo, site, verification, errorCopy, structuredData, theme, og, caseStudy, caseStudyImages, liveResults, dataOrigins, importGraph, sceneField, projects, versions, format, hooks, cn
│   ├── agents/       paths, markdown, llmsTxt, fullText, render, crawlers (files for AI agents)
│   ├── content/      schema (zod) · validate (cross-checks)
│   └── cv/           service, token, config, document, pdf, mailer, copy, profile, common (CV on request)
├── store/            viewStore (per instance) · useSceneStore (scene, transient)
├── docs/audit-2026-10/   design audit and copy review (2026-10-24), with screenshots: source of issues #95–#102 and later
├── e2e/              Playwright suite · helpers.ts (locales, views, waits)
├── .github/workflows/ci.yml   lint, typecheck, build and tests on every PR
├── .github/workflows/versions.yml   project versions kept in step with their releases (automatic PR)
├── .github/workflows/smoke.yml   smoke tests on every Vercel deployment (previews and production)
├── scripts/          sync-versions.mjs (used by the versions workflow)
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
- CI in `.github/workflows/ci.yml`: formatting, lint, typecheck, unit tests, build and end-to-end tests on every pull request and on every push to `development`. Its three jobs (this one, the end-to-end tests and the performance budget) are required checks for merging (see [Workflow](#workflow)).
- **Visual regression** (`e2e/visual.spec.ts`): ten reference screenshots in `e2e/__screenshots__/` (the four views in the light theme, two in the dark theme, two on a phone, plus a case study header on desktop and on a phone) compared on every run. To be repeatable they pin the clock and hide the WebGL scene. They are valid for Chromium on Linux, that is for CI: locally on macOS the tests are skipped, as they would fail on antialiasing alone. After an intended visual change CI fails, regenerates the references on the same runner and publishes them as the `visual-references` artifact: `gh run download <id> -n visual-references -D e2e/__screenshots__`, review the images and commit them.
- **Performance budget** (`lighthouserc.json`): a third CI job runs Lighthouse three times, in mobile emulation, on the home, timeline and projects pages and one case study (`/en/systems/ariaer`) of the production build, and fails when the median leaves the thresholds: accessibility and SEO at 100, best practices ≥ 95, LCP ≤ 4 s, CLS ≤ 0.02, page weight ≤ 450 KB (700 before three.js was removed). The performance score (≥ 80) and TBT (≤ 300 ms) are reported as warnings only: they depend on the runner's speed, which changes from one run to the next (TBT from 360 to 750 ms on the same code), and as errors they would fail CI at random. The thresholds capture the current state on the CI runners, which are slower than a laptop and have no GPU (the WebGL scene costs more there), with a small margin: they exist to stop regressions and should be tightened with every improvement. Locally: `npm run build && npx @lhci/cli@0.15.1 autorun`.
- Dependabot (`.github/dependabot.yml`) opens one grouped weekly PR against `development` for npm dependencies and one for GitHub Actions. Major bumps of `eslint` and `typescript` are ignored until `eslint-config-next` supports them.
- Releases: one milestone per version; every PR carries a `semver:major|minor|patch` label, and `.github/release.yml` groups the generated release notes by label. `version` in `package.json` changes only in the release PR.
- GitHub Actions are pinned to a commit SHA, with the version in a comment (`uses: actions/checkout@<sha> # v7.0.1`): a tag can be moved, a SHA cannot. Dependabot reads the comment and keeps proposing updates; `lib/ci.test.ts` fails if a workflow goes back to a tag or a branch.
- `.mailmap` folds the early commits signed with a hostname-derived email into one identity, without rewriting history.
- Source maps are published in production too (`productionBrowserSourceMaps`): the repository is public, so they expose nothing new and keep stack traces and performance audits readable. The browser fetches them only with devtools open.
- `reactStrictMode` is on, and Next's dev indicator is off because it would sit on top of the navigation.

## Workflow

`development` is the production branch and it is protected: changes reach it only through a pull request.

1. One branch per piece of work, created from `development`: `features/<descriptive-name>`.
2. Before pushing, locally: `npm run format:check && npm run lint && npm run typecheck && npm run test:unit && npm test`.
3. Push the branch and open a pull request against `development`. The PR triggers CI (the same commands) and a non-indexable preview deployment on Vercel.
4. Merging requires all three CI checks to pass, and it is the production deployment. "Create a merge commit" is used, so the history keeps the branch's commits.
5. The branch is deleted after the merge.

Issues and pull requests are written in English; commit messages in Italian.

## Deploying to Vercel

1. On vercel.com → **Add New → Project** → import `CieriS/portfolio`. Next.js is detected automatically (build `npm run build`, install `npm install`).
2. **Settings → Git → Production Branch**: `development`.
3. Optional variables in **Settings → Environment Variables**: `GOOGLE_SITE_VERIFICATION` and `SITE_URL` (custom domain only). For the CV: `CV_ADMIN_PASSWORD`, `CV_LINK_SECRET`, `RESEND_API_KEY`, `CV_MAIL_FROM`, `CV_NOTIFY_EMAIL`, `CV_EMAIL`, `CV_PHONE` (see [Environment variables](#environment-variables)).
4. The site is live at `https://<project>.vercel.app`. Every merge into `development` is deployed automatically; other branches and PRs produce non-indexable previews.

After every successful deployment Vercel reports it to GitHub, and `.github/workflows/smoke.yml` runs `npm run test:smoke` against the deployed URL with that commit's code: every page (200, hydration without errors, canonical, the environment's `robots`), the root redirect, 404, headers, `robots.txt` and the sitemap, the CV endpoint (in production a forged token must get 403: 503 means the variables are missing on Vercel) and, in production only, the 308 of the other aliases. The expectations per environment live in `lib/smoke.ts`. It is not a required check: production is checked after the merge.

Alternatively, from the terminal: `npx vercel login`, then `npx vercel` (preview) and `npx vercel --prod` (production).

### Rolling back

Merging into `development` is the production deploy, and the smoke suite that runs after it blocks nothing. Roll back when:

- the smoke suite on the production deploy is red;
- the home page or `/api/cv` answers 5xx;
- the CSP blocks hydration (the page shows but nothing responds, CSP errors in the console).

Steps:

1. **Vercel Instant Rollback**: project → **Deployments**, the previous production deployment → **⋯** menu → **Instant Rollback** (or `npx vercel rollback <url-or-id>`). Traffic goes back to the previous deployment within seconds, with no rebuild. On the Hobby plan only the immediately previous production deployment is available.
2. After a rollback Vercel stops assigning the production domains to new deployments: until it is undone, a later merge does not reach production either.
3. **Revert through a PR**: `development` accepts no direct pushes, so `git revert -m 1 <merge-commit>` on a `features/revert-<name>` branch, a PR to `development`, merged with green CI.
4. Once the deployment of the revert (or of the fix) is ready, promote it: **Promote to Production** on the deployment, or `npx vercel promote <url-or-id>`. Promoting undoes the rollback and turns automatic domain assignment back on.
5. Run the smoke suite on production again: `SMOKE_BASE_URL=https://cieri.vercel.app SMOKE_ENV=production npm run test:smoke`.

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

## Git hooks

`.githooks/pre-push` runs before every push: a secret scan of the outgoing commits (gitleaks, or its Docker image when the binary is missing), then the fast checks (`format:check`, `lint`, `typecheck`, `test:unit`). `npm install` enables it (`prepare` script); skip it once with `git push --no-verify`. On CI, `.github/workflows/secret-scan.yml` runs gitleaks over the whole history of every branch and tag. The fake secret of the CV test is declared in `.gitleaksignore`.

## License

Code and content are the author's property, all rights reserved: see [`LICENSE`](LICENSE).

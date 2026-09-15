# Samuele Cieri — Portfolio

**Italiano** · [English](README.en.md) · [Français](README.fr.md)

Portfolio personale di **Samuele Cieri**, Software Developer in transizione verso la Data Engineering. È una Single Page Application minimalista costruita con Next.js: il layout è bloccato a `100dvh`, le viste cambiano senza ricaricare la pagina e un campo di particelle 3D resta attivo in background. Ogni vista ha comunque un URL proprio, pre-renderizzato e indicizzabile, in inglese e in italiano.

Il branch `next-migration` sostituisce il precedente sito PHP, conservato in [`legacy/`](legacy/).

## Indice

- [Caratteristiche](#caratteristiche)
- [Stack](#stack)
- [Requisiti](#requisiti)
- [Avvio rapido](#avvio-rapido)
- [Script npm](#script-npm)
- [Variabili d'ambiente](#variabili-dambiente)
- [Viste e URL](#viste-e-url)
- [Navigazione e interazione](#navigazione-e-interazione)
- [Architettura](#architettura)
- [SEO](#seo)
- [Accessibilità](#accessibilità)
- [Selezione del testo](#selezione-del-testo)
- [Dati e contenuti](#dati-e-contenuti)
- [Estendere il progetto](#estendere-il-progetto)
- [Struttura del progetto](#struttura-del-progetto)
- [Qualità del codice](#qualità-del-codice)
- [Deploy su Vercel](#deploy-su-vercel)
- [Sito legacy](#sito-legacy)
- [Risoluzione dei problemi](#risoluzione-dei-problemi)
- [Contatti](#contatti)
- [Licenza](#licenza)

## Caratteristiche

- **SPA con URL reali**: ogni vista è una pagina statica (SSG) con contenuti e metadata propri. Dopo il primo caricamento il cambio vista avviene sul client, senza ricaricare, e aggiorna URL e titolo con la History API.
- **Bilingue (EN/IT)**: slug tradotti, rilevamento automatico della lingua e cambio lingua istantaneo che conserva vista, canvas e stato.
- **Scena 3D persistente**: una griglia di 5.376 punti (three.js) che cambia forma e inquadratura a ogni vista e reagisce al puntatore. Viene caricata solo sul client e si adatta alle prestazioni del dispositivo.
- **Tema chiaro, scuro o automatico** con next-themes, senza flash al caricamento.
- **Animazioni curate**: intro in CSS al primo paint (prima dell'idratazione), poi Framer Motion per le transizioni tra viste, le line mask e la sottolineatura animata della navigazione.
- **SEO completa**: canonical, hreflang, Open Graph con immagini per lingua e vista, JSON-LD, sitemap, robots, manifest e redirect 301 dai vecchi URL PHP.
- **Accessibilità**: link reali, un solo `h1` per URL, attributi ARIA, focus visibile e rispetto di `prefers-reduced-motion` in CSS, in Framer Motion e nella scena 3D.
- **Contenuti centralizzati** in un unico file JSON tipizzato: una chiave mancante o una differenza di struttura tra EN e IT fa fallire la build.

## Stack

| Layer | Tecnologia |
| --- | --- |
| Framework | Next.js 16 (App Router, React Server Components, SSG) · React 19 |
| Linguaggio | TypeScript 6 (`strict`) |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) · next-themes (light / dark / system) |
| Tipografia | Geist · Geist Mono · Instrument Serif (`next/font/google`) |
| Motion | Framer Motion (`AnimatePresence`, `layoutId`, `MotionConfig`, mask reveal) |
| 3D | three · @react-three/fiber · @react-three/drei (lazy, solo client) |
| Stato | Zustand (store della vista per istanza via context + store della scena transiente) |
| i18n | next-intl (`/en`, `/it`, rilevamento lingua via `proxy.ts`, cambio lingua lato client) |
| Dati | `data/portfolio.json` (unica sorgente: contenuti, stringhe UI, metadata SEO) |
| Qualità | ESLint 9 (`eslint-config-next`: core-web-vitals + typescript) · `tsc --noEmit` |
| Hosting | Vercel |

`@playwright/test` è già tra le devDependencies, ma non c'è ancora una suite di test configurata.

## Requisiti

- **Node.js ≥ 20.9.0** (campo `engines` di `package.json`)
- **npm** (il repository include `package-lock.json`)

## Avvio rapido

```bash
git clone https://github.com/CieriS/portfolio.git
cd portfolio
git checkout next-migration
npm install
npm run dev
```

Il sito è su http://localhost:3000. La radice `/` reindirizza a `/en` o a `/it` in base alla lingua del browser.

Per provarlo da smartphone sulla stessa rete, apri l'indirizzo *Network* stampato da `npm run dev` (per esempio `http://192.168.1.69:3000`). Gli host `192.168.*.*`, `10.*` e `*.local` sono già ammessi da `allowedDevOrigins` in `next.config.ts`: senza questa voce la pagina viene mostrata ma non si idrata.

## Script npm

| Comando | Descrizione |
| --- | --- |
| `npm run dev` | Server di sviluppo con hot reload su http://localhost:3000 |
| `npm run build` | Build di produzione: pre-renderizza pagine, immagini Open Graph, sitemap e robots |
| `npm start` | Avvia la build di produzione in locale |
| `npm run lint` | ESLint su tutto il progetto (esclusi `legacy/` e gli output di build) |
| `npm run typecheck` | Genera i tipi delle route (`next typegen`) e verifica i tipi con `tsc --noEmit` |

Prima di una push conviene eseguire `npm run lint`, `npm run typecheck` e `npm run build`.

## Variabili d'ambiente

Nessuna variabile è obbligatoria: in locale il progetto funziona senza configurazione.

| Variabile | Uso |
| --- | --- |
| `SITE_URL` | Opzionale. Origine canonica per canonical, hreflang, sitemap, Open Graph e JSON-LD; gli slash finali vengono rimossi. Serve solo con un dominio personalizzato. Se assente si usa l'URL di produzione Vercel (`VERCEL_PROJECT_PRODUCTION_URL`), in locale `http://localhost:3000`. |
| `GOOGLE_SITE_VERIFICATION` | Opzionale. Token di verifica di Google Search Console, pubblicato come meta tag. |
| `VERCEL_PROJECT_PRODUCTION_URL` | Impostata da Vercel. Usata quando `SITE_URL` manca. |
| `VERCEL_ENV` | Impostata da Vercel. Solo `production` è indicizzabile: le anteprime ricevono `noindex` e un `robots.txt` con `Disallow: /`. Fuori da Vercel, dove la variabile non esiste, il sito è indicizzabile. |

In locale puoi creare un file `.env.local`, già escluso da Git:

```bash
SITE_URL=https://www.example.com
GOOGLE_SITE_VERIFICATION=il-tuo-token
```

## Viste e URL

| # | Vista (ID) | EN | IT | Contenuto |
| --- | --- | --- | --- | --- |
| 01 | Indice (`hero`) | `/en` | `/it` | Nome in grande formato, ruolo, presentazione e invito a esplorare. |
| 02 | Identità (`identity`) | `/en/identity` | `/it/identita` | Dichiarazione d'intenti, quattro principi di ingegneria e contatti (GitHub, LinkedIn, GitLab). |
| 03 | Esecuzione (`timeline`) | `/en/execution` | `/it/esecuzione` | Timeline a due corsie (industria e percorso accademico) su un asse temporale condiviso, con uptime in tempo reale e fasi con il relativo stack. |
| 04 | Sistemi (`projects`) | `/en/systems` | `/it/sistemi` | Progetti in un accordion: sintesi, architettura a livelli, legame con la Data Engineering e link al repository. |
| 05 | Ottimizzazione (`discipline`) | `/en/optimization` | `/it/ottimizzazione` | Il metodo oltre il codice: programma di calisthenics (metriche e sessioni) e meccanica del suono (chitarra acustica, formati lossless, pipeline audio). |

Ogni URL è pre-renderizzato con i propri contenuti. Un indirizzo che non corrisponde a nessuna vista mostra una pagina 404 localizzata e non indicizzabile.

## Navigazione e interazione

- **Link in basso** (`01`–`05`): sono veri `<a href>`, quindi funzionano anche con il clic centrale, con "apri in nuova scheda" e per i crawler. Il clic principale cambia vista sul posto.
- **Tastiera**: `1`–`5` saltano a una vista, `←` e `→` scorrono in modo circolare. I tasti vengono ignorati se è premuto un modificatore o se il focus è in un campo di testo.
- **Touch**: uno swipe orizzontale (oltre 70 px e prevalentemente orizzontale) passa alla vista precedente o successiva.
- **Frecce e contatore** nel footer, su schermi medi e grandi.
- **Cronologia**: ogni cambio vista esegue `pushState`, quindi avanti e indietro del browser funzionano. Il titolo del documento segue la vista attiva.
- **Lingua**: il selettore EN / IT sostituisce l'URL con lo slug tradotto (`replaceState`), aggiorna `lang` e titolo e salva il cookie `NEXT_LOCALE` per un anno, senza navigare. Canvas e vista attiva restano intatti.
- **Rilevamento lingua**: su `/` e sui percorsi senza prefisso, `proxy.ts` (middleware di next-intl) sceglie la lingua dal cookie `NEXT_LOCALE` o dall'header `Accept-Language`. La lingua predefinita è l'inglese e il prefisso è sempre presente.
- **Tema**: il pulsante alterna Auto → Chiaro → Scuro; l'icona è rispettivamente piena a metà, vuota o piena.
- **Scena**: il puntatore sposta leggermente la camera e "scalda" i nodi vicini. L'effetto si spegne quando il puntatore esce dalla finestra.

## Architettura

### Rendering e routing

- Layout e pagine usano `generateStaticParams`: tutte le combinazioni lingua × vista vengono generate in build.
- `app/[locale]/page.tsx` (indice) e `app/[locale]/[view]/page.tsx` (viste interne) convergono in `components/seo/PortfolioPage.tsx`, un Server Component che inserisce il JSON-LD e avvia l'app sulla vista richiesta.
- `lib/views.ts` è la fonte unica di ID, slug localizzati e conversioni URL ↔ vista.
- Entrambe le lingue vengono inviate al client (`getPortfolioBundle`), così il cambio lingua non richiede una navigazione.

### Shell

- `AppRoot` gestisce la lingua corrente e il provider di next-intl.
- `AppShell` compone l'header (nome, ruolo, lingua, tema), la vista attiva e il footer (navigazione, frecce, contatore).
- `AnimatePresence mode="wait"`, con chiave `vista:lingua`, gestisce le transizioni. `ViewFrame` è il contenitore scrollabile di ogni vista, con bordi sfumati e scrollbar nascosta.
- `useViewNavigation` gestisce tastiera e swipe; `useViewUrlSync` sincronizza URL, cronologia, titolo e modalità della scena.

### Stato

- **`store/viewStore.tsx`**: store Zustand creato per ogni istanza e condiviso via React context. La vista iniziale arriva dall'URL, e un singleton a livello di modulo condividerebbe lo stato tra render concorrenti sul server.
- **`store/useSceneStore.ts`**: store globale della scena (modalità, palette, puntatore). Il puntatore viene modificato sul posto e letto in `useFrame` con `getState()`, quindi il movimento del mouse non provoca re-render di React.

### Scena 3D

- `SceneLayer` vive nel layout, sopra ogni cambio vista, e non viene mai smontato.
- `DataField` è caricato con `next/dynamic` e `ssr: false`: three.js non entra mai nel bundle server.
- `DataGrid` disegna una griglia di 96 × 56 punti; una riga ogni cinque trasporta "pacchetti di dati" in movimento.
- Ogni vista ha una modalità in `components/scene/modes.ts` (ampiezza, frequenza, velocità, flusso, raggio e forza del puntatore, presenza, posizione della camera). Al cambio vista i parametri vengono interpolati in modo graduale.
- `PerformanceMonitor` riduce il device pixel ratio a 1 quando il frame rate cala e lo riporta fino a 1,75 quando migliora.
- Con `prefers-reduced-motion: reduce` il canvas passa a `frameloop="demand"` e ridisegna solo quando cambiano vista o tema.
- La palette segue il tema risolto (chiaro o scuro).

### Motion

- Al primo paint le entrate sono in CSS (`.intro-line` e `.intro-fade` sotto `html:not([data-booted])`). Così i contenuti non restano nascosti in attesa dell'idratazione e il titolo dell'indice, elemento LCP, inizia subito a comparire.
- Al primo cambio di vista o di lingua, `markBooted()` passa il controllo a Framer Motion.
- `MotionConfig reducedMotion="user"` rispetta le preferenze di sistema.

### Tema e tipografia

- Token CSS in `app/globals.css` (`--paper`, `--ink`, `--muted`, `--line`, `--accent`), ridefiniti sotto `.dark` ed esposti a Tailwind v4 con `@theme inline`.
- Utility personalizzate: `px-frame`, `no-scrollbar`, `fade-edges`, `link-underline`, `bg-dashed`.
- Font caricati con `next/font` e `display: swap`: Geist per il testo, Geist Mono per le etichette, Instrument Serif corsivo per le parole in enfasi.

## SEO

- **Metadata per vista** (`lib/seo.ts`): title, description, canonical, hreflang (`en`, `it`, `x-default`), Open Graph di tipo `profile` e Twitter card `summary_large_image`. Per l'indice `x-default` punta a `/`, che rileva la lingua; per le altre viste punta alla versione inglese.
- **Immagini Open Graph** 1200 × 630 generate in build per ogni lingua e vista (`opengraph-image.tsx`, `lib/og.tsx`), con l'icona del sito legacy.
- **JSON-LD** `@graph` (`lib/structuredData.ts`): `WebSite`, `Person` (con `knowsAbout` e `sameAs`), `ProfilePage`, `BreadcrumbList` nelle viste interne e `ItemList` di `SoftwareSourceCode` nella vista dei progetti.
- **`sitemap.xml`** con alternate hreflang, **`robots.txt`**, **`manifest.webmanifest`**, favicon e icone ricavate dall'icona legacy `iconRed.ico`.
- **Indicizzazione controllata**: solo la produzione è indicizzabile (vedi [Variabili d'ambiente](#variabili-dambiente)).
- **Struttura della pagina**: un solo `h1` per URL, link reali nella navigazione, `rel="me"` sui profili social, header `X-Powered-By` disattivato.
- **Redirect 301** dai vecchi URL PHP:

| Vecchio URL | Destinazione |
| --- | --- |
| `/index.php` | `/` |
| `/error` | `/` |
| `/projDev/*` | `/it/sistemi` |
| `/projProd/*` | `/it/sistemi` |

Dopo il primo deploy: Google Search Console → aggiungi la proprietà URL → invia `/sitemap.xml`.

## Accessibilità

- Navigazione con link reali e `aria-current="page"` sulla vista attiva; ogni vista è una `section` con `aria-label`.
- Accordion dei progetti con `aria-expanded` e `aria-controls`; pulsanti e controlli con etichette localizzate.
- Focus sempre visibile (`:focus-visible`), attributo `lang` aggiornato al cambio lingua, `hreflang` sui link del selettore di lingua.
- Elementi decorativi (canvas, frecce, indici) marcati con `aria-hidden`.
- Movimento ridotto rispettato su tre livelli: intro CSS, Framer Motion e frame loop della scena.

## Selezione del testo

La selezione è disabilitata solo sull'interfaccia: navigazione, bottoni, header e footer, etichette, indici, titoli display e canvas. Lì una selezione è sempre accidentale (doppio clic, swipe). Testi, descrizioni e contatti restano selezionabili e `Cmd/Ctrl+A` non viene intercettato: bloccarli non protegge il contenuto (è nell'HTML e nei risultati di ricerca) e peggiorerebbe accessibilità e usabilità.

## Dati e contenuti

Tutti i contenuti stanno in [`data/portfolio.json`](data/portfolio.json), importato e tipizzato in `lib/portfolio.ts`.

```
shared                  dati indipendenti dalla lingua
├── name, handle
├── contacts[]          id, label, handle, url
├── timeline            threadA (industria), threadB (accademico): date, fasi, stack
├── projects[]          id, name, repo, stack, layers
└── discipline          biological (metriche, sessioni) · acoustic (formati, pipeline)
locales.en | locales.it
├── ui                  messages di next-intl: meta (SEO), notFound, nav, theme, locale, shell
├── hero
├── identity
├── timeline
├── projects            items[id]: summary, bridge, layers
└── discipline
```

- `shared` contiene i dati indipendenti dalla lingua (link, date, stack, metriche); `locales.en|it` contiene il copy.
- Il blocco `ui` di ogni lingua è usato come messages di next-intl e contiene anche title e description SEO per vista (`ui.meta.views`).
- Il copy è collegato ai dati condivisi tramite `id` (per esempio `shared.projects[].id` → `locales.*.projects.items[id]`).
- I campi `*Emphasis` indicano la parola resa in corsivo serif e devono comparire nel testo a cui si riferiscono.
- Le date sono in formato ISO `YYYY-MM-DD` e vengono mostrate come `DD.MM.YYYY`.
- Il JSON è assegnato a tipi espliciti: una chiave mancante o rinominata, o una struttura diversa tra EN e IT, fa fallire `npm run typecheck` e la build.

Campi che accettano `null` (mostrati come `—`): `timeline.threadA.organization`, `timeline.threadB.start`, `timeline.threadB.institution`, `projects[].repo`, `discipline.biological.heightCm`, `discipline.biological.weightKg`. Se `repo` è `null`, il link del progetto punta al profilo GitHub; se la data di inizio di una corsia è `null`, la corsia viene disegnata tratteggiata.

## Estendere il progetto

### Aggiungere un progetto

1. Aggiungi un elemento a `shared.projects` con `id`, `name`, `repo` (o `null`), `stack` e `layers` (`id`, `tech`).
2. In **entrambe** le lingue aggiungi `projects.items[<id>]` con `summary`, `bridge` e `layers` (una descrizione per ogni `id` di livello).
3. Se necessario, aggiorna title e description in `ui.meta.views.projects`.

La vista e il JSON-LD `ItemList` si aggiornano automaticamente.

### Aggiungere un contatto

Aggiungi `{ id, label, handle, url }` a `shared.contacts`: il contatto compare nella vista Identità e nel campo `sameAs` del JSON-LD.

### Aggiungere una vista

1. `lib/views.ts`: aggiungi l'ID a `VIEW_IDS` e lo slug di ogni lingua in `VIEW_SLUGS`.
2. `components/scene/modes.ts`: aggiungi la modalità della scena in `SCENE_MODES`.
3. `components/views/`: crea il componente e registralo in `RENDER` in `components/shell/AppShell.tsx`.
4. `data/portfolio.json`: aggiungi `ui.nav.<id>`, `ui.meta.views.<id>` e il copy della vista in ogni lingua.

Pagine, immagini Open Graph, sitemap, navigazione e scorciatoie numeriche derivano da `VIEW_IDS` (le scorciatoie coprono fino a 9 viste).

### Aggiungere una lingua

1. `i18n/routing.ts`: aggiungi il codice a `locales`.
2. `lib/views.ts`: aggiungi gli slug in `VIEW_SLUGS` e il codice nel controllo di `viewFromPath`, oggi limitato a `en` e `it`.
3. `lib/seo.ts`: aggiungi il locale Open Graph in `OG_LOCALE` (per esempio `fr: 'fr_FR'`).
4. `data/portfolio.json`: aggiungi `locales.<codice>` con la stessa struttura di `en` e l'etichetta della nuova lingua in `ui.locale` di ogni lingua.

TypeScript segnala ogni punto dimenticato, perché tutte queste mappe sono tipizzate su `Locale`.

## Struttura del progetto

```
.
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx               html, font, tema, SceneLayer persistente, metadata di base
│   │   ├── page.tsx                 vista Indice
│   │   ├── not-found.tsx            pagina 404 localizzata
│   │   ├── opengraph-image.tsx      immagine Open Graph dell'indice
│   │   └── [view]/
│   │       ├── page.tsx             viste interne (slug localizzati)
│   │       └── opengraph-image.tsx  immagine Open Graph per vista
│   ├── globals.css                  token di colore, utility Tailwind, intro CSS
│   ├── sitemap.ts · robots.ts · manifest.ts
│   └── favicon.ico · icon.png · apple-icon.png
├── components/
│   ├── motion/       ViewFrame (contenitore della vista), Reveal (varianti, line mask, intro)
│   ├── providers/    ThemeProvider (next-themes)
│   ├── scene/        SceneLayer → DataField (Canvas, lazy) → DataGrid (useFrame) · modes
│   ├── seo/          PortfolioPage (JSON-LD + app)
│   ├── shell/        AppRoot, AppShell, NavBar, ViewLink, LocaleSwitch, ThemeToggle,
│   │                 useViewNavigation, useViewUrlSync
│   └── views/        HeroView, IdentityView, TimelineView, ProjectsView, DisciplineView, atoms
├── data/
│   └── portfolio.json               contenuti EN/IT, stringhe UI, metadata SEO
├── i18n/             routing.ts (lingue) · request.ts (messages di next-intl)
├── lib/              views, portfolio, seo, site, structuredData, og, format, hooks, cn
├── store/            viewStore (per istanza) · useSceneStore (scena, transiente)
├── legacy/           sito PHP precedente (non servito)
├── proxy.ts          rilevamento lingua (middleware di next-intl)
├── next.config.ts    plugin next-intl, redirect 301, origini ammesse in sviluppo
├── eslint.config.mjs · postcss.config.mjs · tsconfig.json
└── package.json
```

## Qualità del codice

- TypeScript in modalità `strict`, con alias `@/*` sulla radice del progetto.
- ESLint con le configurazioni `core-web-vitals` e `typescript` di Next.js.
- `npm run typecheck` esegue prima `next typegen`, che genera i tipi globali delle route (`PageProps`, `LayoutProps`).
- `legacy/` è escluso da TypeScript e da ESLint.
- `reactStrictMode` attivo e indicatore di sviluppo di Next disattivato, perché si sovrapporrebbe alla navigazione.

## Deploy su Vercel

1. Pubblica il branch su GitHub: `git push -u origin next-migration`.
2. Su vercel.com → **Add New → Project** → importa `CieriS/portfolio`. Il framework Next.js viene rilevato automaticamente (build `npm run build`, install `npm install`).
3. **Settings → Git → Production Branch**: `next-migration` (oppure `development` dopo il merge).
4. Variabili opzionali in **Settings → Environment Variables**: `GOOGLE_SITE_VERIFICATION` e `SITE_URL` (solo con un dominio personalizzato).
5. Deploy: il sito è su `https://<progetto>.vercel.app`. Ogni push sul branch di produzione viene distribuita automaticamente; gli altri branch e le PR generano anteprime non indicizzabili.

In alternativa, da terminale: `npx vercel login`, poi `npx vercel` (anteprima) e `npx vercel --prod` (produzione).

### Build di produzione in locale

```bash
npm run build
npm start
```

## Sito legacy

`legacy/` contiene il portfolio precedente, pubblicato su Altervista: PHP e MySQL, HTML, CSS e JavaScript, Font Awesome 6.4 e una raccolta di progetti in `projDev/`. Il README originale è in [`legacy/readMe.md`](legacy/readMe.md).

- Non viene servito da Next.js: il progetto non ha una cartella `public/`, quindi nessun file di `legacy/` è raggiungibile dal sito pubblicato.
- È escluso da lint e typecheck.
- I suoi URL principali sono reindirizzati con 301 (vedi [SEO](#seo)).
- Le icone del nuovo sito derivano da `legacy/img/icon/iconRed.ico`.

## Risoluzione dei problemi

| Problema | Soluzione |
| --- | --- |
| Da un altro dispositivo la pagina compare ma non risponde a clic e tastiera | L'host non è in `allowedDevOrigins` (`next.config.ts`): aggiungilo e riavvia `npm run dev`. |
| Canonical e sitemap puntano a `localhost` in produzione | Imposta `SITE_URL` oppure pubblica su Vercel, che fornisce `VERCEL_PROJECT_PRODUCTION_URL`. |
| Errori di tipo su `PageProps` o `LayoutProps` | Esegui `npm run typecheck`: `next typegen` rigenera i tipi delle route. |
| La build fallisce dopo una modifica a `portfolio.json` | Verifica che la chiave esista in entrambe le lingue e che il valore rispetti i tipi di `lib/portfolio.ts`. |
| Un deploy di anteprima non compare su Google | È voluto: solo `VERCEL_ENV=production` è indicizzabile. |

## Contatti

- GitHub: [@CieriS](https://github.com/CieriS/)
- LinkedIn: [in/samuelecieri](https://www.linkedin.com/in/samuelecieri/)
- GitLab: [@CieriS](https://gitlab.com/CieriS/)

## Licenza

Il repository non include una licenza: codice e contenuti restano di proprietà dell'autore (tutti i diritti riservati). Font Awesome Free, in `legacy/`, è distribuito con la propria licenza ([`LICENSE.txt`](legacy/fontawesome-free-6.4.0-web/LICENSE.txt)).

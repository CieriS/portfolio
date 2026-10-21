# Samuele Cieri — Portfolio

**Italiano** · [English](README.en.md) · [Français](README.fr.md)

Portfolio personale di **Samuele Cieri**, Software Developer in transizione verso la Data Engineering. È una Single Page Application minimalista costruita con Next.js: il layout è bloccato a `100dvh`, le viste cambiano senza ricaricare la pagina e un campo di particelle 3D resta attivo in background. Ogni vista ha comunque un URL proprio, pre-renderizzato e indicizzabile, in inglese, italiano, francese e tedesco.

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
- [Flusso di lavoro](#flusso-di-lavoro)
- [Deploy su Vercel](#deploy-su-vercel)
- [Sito precedente](#sito-precedente)
- [Risoluzione dei problemi](#risoluzione-dei-problemi)
- [Contatti](#contatti)
- [Licenza](#licenza)

## Caratteristiche

- **SPA con URL reali**: ogni vista è una pagina statica (SSG) con contenuti e metadata propri. Dopo il primo caricamento il cambio vista avviene sul client, senza ricaricare, e aggiorna URL e titolo con la History API.
- **Cinque lingue (EN/IT/FR/DE/ES)**: slug tradotti, rilevamento automatico della lingua e cambio lingua istantaneo che conserva vista, canvas e stato.
- **Scena 3D persistente**: una griglia di 5.376 punti (WebGL) che cambia forma e inquadratura a ogni vista e reagisce al puntatore. Viene caricata solo sul client e si adatta alle prestazioni del dispositivo.
- **Tema chiaro, scuro o automatico** con next-themes, senza flash al caricamento.
- **Animazioni curate**: intro in CSS al primo paint (prima dell'idratazione), poi Framer Motion per le transizioni tra viste, le line mask e la sottolineatura animata della navigazione.
- **SEO completa**: canonical, hreflang, Open Graph con immagini per lingua e vista, JSON-LD, sitemap, robots, manifest e redirect 301 dai vecchi URL PHP.
- **Accessibilità**: link reali, un solo `h1` per URL, attributi ARIA, focus visibile e rispetto di `prefers-reduced-motion` in CSS, in Framer Motion e nella scena 3D.
- **Contenuti centralizzati e validati**: un file JSON condiviso più uno per lingua, controllati da tipi, schema zod e verifiche incrociate: un contenuto incoerente fa fallire la build.
- **CV su richiesta**: il PDF viene generato a ogni download dagli stessi contenuti del sito, con i recapiti privati letti da variabili d'ambiente. Non è pubblico: chi visita lascia un'email e riceve un link firmato e a scadenza; il proprietario lo scarica subito con una password.
- **Casi di studio**: yourFinance e aria-er hanno una pagina propria sotto la vista dei progetti (`/it/sistemi/yourfinance`, `/it/sistemi/ariaer`): problema, vincoli, architettura, scelte, misure e schermate. Il codice di yourFinance resta privato e la sua pagina non lo collega mai; quella di aria-er porta al repository pubblico e confronta i suoi risultati con i dati ARPAE.

## Stack

| Layer | Tecnologia |
| --- | --- |
| Framework | Next.js 16 (App Router, React Server Components, SSG) · React 19 |
| Linguaggio | TypeScript 6 (`strict`) |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) · next-themes (light / dark / system) |
| Tipografia | Geist · Geist Mono · Instrument Serif (`next/font/google`) |
| Motion | Framer Motion (`AnimatePresence`, `layoutId`, `MotionConfig`, mask reveal) |
| 3D | WebGL senza librerie (lazy, solo client) |
| Stato | Zustand (store della vista per istanza via context + store della scena transiente) |
| i18n | next-intl (`/en`, `/it`, `/fr`, rilevamento lingua via `proxy.ts`, cambio lingua lato client) |
| Dati | `data/shared.json` + `data/locales/*.json` (unica sorgente: contenuti, stringhe UI, metadata SEO), validati con zod |
| Qualità | ESLint 9 (`eslint-config-next`: core-web-vitals + typescript) · Prettier · `tsc --noEmit` · Vitest · Playwright |
| PDF | pdf-lib (CV generato su richiesta, solo lato server) |
| Hosting | Vercel |

I test end-to-end girano con Playwright su Chromium, WebKit e un profilo mobile, sulla build di produzione. I test unitari usano Vitest. La CI di GitHub Actions esegue formattazione, lint, typecheck, test unitari, build e test end-to-end su ogni pull request.

## Requisiti

- **Node.js ≥ 22.12.0** (richiesto da Vitest) (campo `engines` di `package.json`)
- **npm** (il repository include `package-lock.json`)

## Avvio rapido

```bash
git clone https://github.com/CieriS/portfolio.git
cd portfolio
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
| `npm run lint` | ESLint su tutto il progetto (esclusi gli output di build) |
| `npm run format` | Formatta il progetto con Prettier (`.prettierrc.json`, con ordinamento delle classi Tailwind) |
| `npm run format:check` | Verifica la formattazione senza modificare i file, come in CI |
| `npm run typecheck` | Genera i tipi delle route (`next typegen`) e verifica i tipi con `tsc --noEmit` |
| `npm run test:unit` | Test unitari Vitest della logica pura (`lib/**/*.test.ts`), in meno di un secondo |
| `npm test` | Suite end-to-end Playwright; costruisce e avvia da sé la build di produzione |
| `npm run test:smoke` | Smoke test Playwright su un sito già distribuito: `SMOKE_BASE_URL` (URL del deploy), `SMOKE_ENV` (`production` o `preview`), `SMOKE_SITE_URL` (il `SITE_URL` del deploy, per difetto la base) |
| `npm run test:ui` | Stessa suite nella modalità interattiva di Playwright |

Prima di una push conviene eseguire `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run test:unit` e `npm test`. Sono gli stessi comandi della CI.

## Variabili d'ambiente

Nessuna variabile è obbligatoria: in locale il progetto funziona senza configurazione.

| Variabile | Uso |
| --- | --- |
| `SITE_URL` | Opzionale. Origine canonica per canonical, hreflang, sitemap, Open Graph e JSON-LD; gli slash finali vengono rimossi. Serve solo con un dominio personalizzato. Se assente si usa l'URL di produzione Vercel (`VERCEL_PROJECT_PRODUCTION_URL`), in locale `http://localhost:3000`. |
| `GOOGLE_SITE_VERIFICATION` | Opzionale. Token di verifica di Google Search Console, pubblicato come meta tag. Accetta il solo token oppure l'intero tag `<meta>` copiato da Search Console (il token viene estratto da `lib/verification.ts`); qualsiasi altro valore fa fallire la build. Il sito è statico: una modifica alla variabile ha effetto solo dopo un nuovo deploy. |
| `VERCEL_PROJECT_PRODUCTION_URL` | Impostata da Vercel. Usata quando `SITE_URL` manca. |
| `VERCEL_ENV` | Impostata da Vercel. Solo `production` è indicizzabile: le anteprime ricevono `noindex` e un `robots.txt` con `Disallow: /`. Fuori da Vercel, dove la variabile non esiste, il sito è indicizzabile. |
| `CV_ADMIN_PASSWORD` | Opzionale. Password del proprietario: scarica il CV senza altri passaggi. Almeno 16 caratteri, altrimenti il download con password resta spento (lo dice il log del server). |
| `CV_LINK_SECRET` | Opzionale. Segreto (almeno 32 caratteri, es. `openssl rand -base64 48`) che firma i link mandati per email. Cambiarlo invalida tutti i link già inviati. |
| `RESEND_API_KEY` · `CV_MAIL_FROM` | Opzionali. Chiave di [Resend](https://resend.com) e mittente verificato (es. `Samuele Cieri <cv@dominio.it>`). Servono insieme a `CV_LINK_SECRET`: con uno solo dei tre i link via email restano spenti. |
| `CV_NOTIFY_EMAIL` | Opzionale. Indirizzo che riceve un avviso a ogni richiesta del CV, con l'email di chi l'ha chiesto. |
| `CV_EMAIL` · `CV_PHONE` | Opzionali. Recapiti stampati solo nel PDF: sono il motivo per cui il CV non è pubblico e non stanno nel repository. |

Le variabili del CV sono lette dalla route `/api/cv` all'avvio del server, non in build: le pagine statiche non le contengono. Senza nessuna di esse il sito funziona e il modulo risponde "non disponibile".

In locale puoi creare un file `.env.local`, già escluso da Git:

```bash
SITE_URL=https://www.example.com
GOOGLE_SITE_VERIFICATION=il-tuo-token
```

## Viste e URL

| # | Vista (ID) | EN | IT | FR | DE | ES | Contenuto |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | Indice (`hero`) | `/en` | `/it` | `/fr` | `/de` | `/es` | Nome in grande formato, ruolo, presentazione, un paragrafo con datore di lavoro, studi, stack e progetti (i fatti che un motore di ricerca deve leggere già nella home) e invito a esplorare. |
| 02 | Identità (`identity`) | `/en/identity` | `/it/identita` | `/fr/identite` | `/de/identitaet` | `/es/identidad` | Titolo che è la prima frase della dichiarazione d'intenti (il resto ne è il sottotitolo), quattro principi di ingegneria e contatti (GitHub, LinkedIn, Instagram) e il link per sostenermi su GitHub Sponsors. |
| 03 | Esecuzione (`timeline`) | `/en/execution` | `/it/esecuzione` | `/fr/execution` | `/de/ausfuehrung` | `/es/ejecucion` | Timeline a tre corsie (industria, percorso accademico e studio autonomo del Data Engineering) su un asse temporale condiviso, con uptime in tempo reale e fasi con il relativo stack. |
| 04 | Sistemi (`projects`) | `/en/systems` | `/it/sistemi` | `/fr/systemes` | `/de/systeme` | `/es/sistemas` | Progetti in un accordion, tutti chiusi all'apertura della vista: sintesi, scelte di ingegneria, architettura a livelli, legame con la Data Engineering e link al repository (o ai contatti, se il codice è privato). Oggi: yourFinance (privato) e aria-er (pubblico). |
| 05 | Ottimizzazione (`discipline`) | `/en/optimization` | `/it/ottimizzazione` | `/fr/optimisation` | `/de/optimierung` | `/es/optimizacion` | Allenamento e musica oltre il codice: forza ed esplosività (metodo, metriche, programma settimanale) e produzione di musica e video (chitarra acustica, software, fasi di lavoro). |

Ogni URL è pre-renderizzato con i propri contenuti. Un indirizzo che non corrisponde a nessuna vista mostra una pagina 404 localizzata e non indicizzabile.

Sotto la vista Sistemi c'è una pagina in più per i progetti che hanno un caso di studio: `/en/systems/yourfinance`, `/it/sistemi/yourfinance`, `/fr/systemes/yourfinance`, `/de/systeme/yourfinance`. È un documento con link veri, non una sesta vista: ci si arriva dal progetto aperto nell'accordion e uscirne è una navigazione. Il link per tornare alla vista dei progetti sta nell'intestazione, che non scorre con la pagina, oltre che in fondo.

## Navigazione e interazione

- **Link in basso** (`01`–`05`): sono veri `<a href>`, quindi funzionano anche con il clic centrale, con "apri in nuova scheda" e per i crawler. Il clic principale cambia vista sul posto. Accanto alla voce attiva compare la parola di uso comune per quella vista ("Esecuzione · Esperienza"), che fa parte anche del nome accessibile di ogni link: il nome viene dal testo del link (l'indice è nascosto ai lettori di schermo, la parola comune delle voci non attive è solo per loro), così ciò che si legge coincide con ciò che si vede.
- **Progetti dalla home**: nel paragrafo della home i nomi dei progetti sono link (`ProjectLink`, ricavati da `shared.projects` con `splitByNames`). Portano al caso di studio se esiste, altrimenti alla vista dei progetti con il pannello già aperto: l'indirizzo è `/it/sistemi#<id>`, che funziona anche incollato o condiviso. Senza frammento i progetti partono tutti chiusi.
- **Tastiera**: `1`–`5` saltano a una vista, `←` e `→` scorrono in modo circolare. I tasti vengono ignorati se è premuto un modificatore o se il focus è in un campo di testo.
- **Touch**: uno swipe orizzontale (oltre 70 px e prevalentemente orizzontale) passa alla vista precedente o successiva.
- **Trackpad**: lo scorrimento laterale a due dita non fa tornare indietro né andare avanti nella cronologia (`overscroll-behavior: none` sulla radice), perché partiva per sbaglio mentre si scorreva una vista. Vale per Chromium e Firefox; Safari gestisce quel gesto per conto suo e può ignorare la regola. Pulsanti del browser e scorciatoie da tastiera restano invariati.
- **Frecce e contatore** nel footer, su schermi medi e grandi.
- **Indicatore di scorrimento**: le scrollbar sono nascoste, quindi una vista più alta dello schermo mostra sul bordo destro una linea sottile con un cursore che segue lo scorrimento. Compare solo dove c'è contenuto sotto la piega (misurato con `ResizeObserver`; geometria in `lib/scroll.ts`) ed è nascosto alle tecnologie assistive.
- **Cronologia**: ogni cambio vista esegue `pushState`, quindi avanti e indietro del browser funzionano. Il titolo del documento segue la vista attiva.
- **Lingua**: l'header mostra solo la lingua attiva; il pulsante apre un menu animato (`listbox`) con tutte le lingue, ciascuna col proprio nome nativo, usabile con mouse, touch e tastiera (frecce, Home/End, Invio/Spazio, Esc, clic fuori; il focus torna al pulsante). Scegliere una lingua sostituisce l'URL con lo slug tradotto (`replaceState`), aggiorna `lang` e titolo e salva il cookie `NEXT_LOCALE` per un anno, senza navigare. Canvas e vista attiva restano intatti.
- **Rilevamento lingua**: su `/` e sui percorsi senza prefisso, `proxy.ts` (middleware di next-intl) sceglie la lingua dal cookie `NEXT_LOCALE` o dall'header `Accept-Language`. La lingua predefinita è l'inglese e il prefisso è sempre presente.
- **Tema**: il pulsante alterna Auto → Chiaro → Scuro; l'icona è rispettivamente piena a metà, vuota o piena.
- **Scena**: il puntatore sposta leggermente la camera e "scalda" i nodi vicini. L'effetto si spegne quando il puntatore esce dalla finestra.

## Architettura

### Rendering e routing

- Layout e pagine usano `generateStaticParams`: tutte le combinazioni lingua × vista vengono generate in build.
- `app/[locale]/page.tsx` (indice) e `app/[locale]/[view]/page.tsx` (viste interne) convergono in `components/seo/PortfolioPage.tsx`, un Server Component che inserisce il JSON-LD e avvia l'app sulla vista richiesta.
- `lib/routes.ts` è la fonte unica di lingue, ID, slug localizzati e conversioni URL ↔ vista. Non dipende da Next né da next-intl, così la suite Playwright importa lo stesso modulo e non ne tiene una copia.
- Tutte le lingue vengono inviate al client (`getPortfolioBundle`), così il cambio lingua non richiede una navigazione.
- I testi delle due pagine di errore stanno in `data/errors.json` e si leggono con `lib/errorCopy.ts`: le pagine di errore sono componenti client, e leggerli dal modulo dei contenuti portava nel browser lo schema zod e i quattro file di lingua (circa 100 KB compressi su ogni pagina). Un test fallisce se un componente client importa a runtime `lib/portfolio.ts`, `lib/content/*` o `zod`.

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
- `DataField` è caricato con `next/dynamic` e `ssr: false` e disegna con WebGL senza librerie (`components/scene/fieldRenderer.ts`): un programma, due buffer statici e una sola chiamata di disegno. Fino alla 2.4 la scena usava three.js e react-three-fiber: ~230 KB gzip e un task lungo all'avvio, la causa quasi intera del Total Blocking Time su desktop (issue #64). Tone mapping ACES e conversione sRGB sono quelli di three, copiati nello shader, così i colori non sono cambiati.
- La griglia ha 96 × 56 punti; una riga ogni cinque trasporta "pacchetti di dati" in movimento.
- La griglia è caricata sulla GPU una volta sola (`lib/sceneField.ts`). Altezza, onda attorno al puntatore, pacchetti e colore di ogni punto li calcola il vertex shader (`components/scene/fieldShader.ts`); a ogni frame `stepSim` (`lib/sceneSim.ts`, logica pura e testata, con la camera di `lib/sceneMath.ts`) interpola i parametri e passa allo shader una dozzina di numeri, qualunque sia il numero di punti. Le fasi di onda e flusso arrivano già riportate entro il loro periodo, perché sulla GPU i numeri sono a 32 bit.
- Ogni vista ha una modalità in `lib/sceneModes.ts` (ampiezza, frequenza, velocità, flusso, raggio e forza del puntatore, presenza, posizione della camera). Al cambio vista i parametri vengono interpolati in modo graduale.
- `lib/sceneMonitor.ts` (stesse soglie del `PerformanceMonitor` di drei che sostituisce) riduce il device pixel ratio a 1 quando il frame rate cala e lo riporta fino a 1,75 quando migliora.
- Con `prefers-reduced-motion: reduce` il canvas non ha un ciclo di frame e ridisegna solo quando cambiano vista o tema.
- La palette segue il tema risolto (chiaro o scuro) e porta con sé anche la dimensione dei punti: nel tema chiaro il punto è più scuro e più grande del 25% circa, perché punti scuri su fondo chiaro appaiono più sottili di punti chiari su fondo scuro a parità di contrasto. Nelle viste interne, dove il campo è attenuato per lasciar leggere il testo, il tema chiaro ne conserva di più (`presenceScale`), altrimenti sulla carta panna quasi sparirebbe.

### Motion

- Al primo paint le entrate sono in CSS (`.intro-line` e `.intro-fade` sotto `html:not([data-booted])`). Così i contenuti non restano nascosti in attesa dell'idratazione e il titolo dell'indice, elemento LCP, inizia subito a comparire.
- Al primo cambio di vista o di lingua, `markBooted()` passa il controllo a Framer Motion.
- `MotionConfig reducedMotion="user"` rispetta le preferenze di sistema.

### Tema e tipografia

- Token CSS in `app/globals.css` (`--paper`, `--ink`, `--muted`, `--line`, `--accent`), ridefiniti sotto `.dark` ed esposti a Tailwind v4 con `@theme inline`.
- Il tema chiaro è una carta color panna (`#ede7db`), non un bianco da schermo: meno abbagliante, e lascia leggere il campo di punti sullo sfondo.
- `lib/theme.ts` ripete carta e inchiostro per ciò che non può leggere le custom property (scena WebGL, `theme-color`, manifest, immagini Open Graph). `lib/theme.test.ts` fa fallire i test se CSS e TypeScript divergono, se il testo scende sotto i contrasti AA/AAA o se i punti della scena diventano invisibili o più forti del testo.
- Utility personalizzate: `px-frame`, `no-scrollbar`, `fade-edges`, `link-underline`, `bg-dashed`.
- Font caricati con `next/font` e `display: swap`: Geist per il testo, Geist Mono per le etichette, Instrument Serif corsivo per le parole in enfasi.

### CV su richiesta

- `app/api/cv/route.ts` è l'unica parte resa a ogni richiesta: tutto il resto resta prerenderizzato. È un adattatore sottile: legge la configurazione, chiama `lib/cv/service.ts` e traduce l'esito in una risposta HTTP.
- `lib/cv/service.ts` contiene le due regole, senza HTTP né PDF: password corretta → PDF; email valida → link firmato inviato a quell'indirizzo (e avviso al proprietario). Un campo nascosto (honeypot) ferma i bot senza farglielo capire.
- `lib/cv/token.ts`: il link porta con sé email, lingua e scadenza (24 ore, `lib/cv/common.ts`), firmati con HMAC-SHA256. Non serve un database e un link modificato o scaduto viene rifiutato. Le password si confrontano a tempo costante.
- `lib/cv/document.ts` costruisce il CV come dati puri da `data/shared.json` e dalla lingua scelta; `lib/cv/pdf.ts` lo impagina in A4 con i font standard (nessun file di font da distribuire). I testi del PDF e dell'email stanno in `data/cv.json`, fuori dai file di lingua che arrivano al browser.
- Nel modulo, il campo della password ha un pulsante per mostrarla o nasconderla: il confronto è esatto, quindi uno spazio incollato per sbaglio la fa rifiutare. Cambiando metodo torna nascosta.
- Il modulo non usa la validazione del browser (`noValidate`): il suo messaggio generico è nella lingua del browser, non in quella della pagina. `checkCvInput` (`lib/cv/common.ts`) controlla il campo prima dell'invio e la pagina spiega cosa manca con parole sue (indirizzo assente, indirizzo che non sembra un'email, password assente), segna il campo con `aria-invalid` e ci riporta il focus.
- Il CV aggiunge ciò che il sito non mostra, da `data/cv-profile.json` (`lib/cv/profile.ts`): competenze raggruppate, lingue parlate con il livello e quali profili elencare. Le certificazioni stanno in `shared.json`, dove le legge anche il sito (fase "Metodo" della corsia Tas e `Person.hasCredential` nel JSON-LD): una sola fonte, nessun disallineamento possibile. L'ordine delle sezioni è competenze, esperienza, formazione, certificazioni, progetti, lingue; in fondo c'è l'autorizzazione al trattamento dei dati. Resta a una colonna e senza immagini, perché i sistemi di selezione automatica (ATS) lo leggano in ordine: l'unico colore è quello dei titoli di sezione. I nomi degli esami sono tradotti tramite `terms` in `data/cv.json`; un test fallisce se una tecnologia del lavoro o dei progetti manca dalle competenze.
- `lib/cv/mailer.ts` è la porta di uscita per l'email, con un adattatore per l'API REST di Resend via `fetch` (nessun SDK). Un invio via SMS sarebbe un altro adattatore.
- Limiti noti: non c'è un limite di richieste per indirizzo, perché servirebbe uno stato condiviso; su Vercel si imposta una regola di rate limiting del Firewall su `/api/cv`. La password del proprietario deve essere lunga proprio perché i tentativi non sono contati.

### Casi di studio

- `app/[locale]/[view]/[study]/page.tsx` prerenderizza la pagina solo sotto lo slug della vista dei progetti e solo per gli id in `CASE_STUDY_IDS` (`lib/routes.ts`); il resto è un 404. Un segmento di vista in un'altra lingua (`/it/systems/ariaer`) non è un 404 ma un redirect 308 a quello giusto (`localizedPath`, applicato da `proxy.ts`): così `/systems/ariaer`, senza lingua, apre il caso di studio nella lingua del browser ed è l'indirizzo da usare fuori dal sito.
- `components/case-study/CaseStudyPage.tsx` è un componente server: tutto il testo è nell'HTML e la pagina non carica la libreria delle animazioni. Usa le primitive di testo di `components/ui/text.tsx`, condivise con le viste.
- I contenuti stanno in `data/case-studies/<id>.json` (struttura più testi in ogni lingua), fuori dai file di lingua che arrivano al browser. `lib/caseStudy.ts` li valida con zod e con verifiche incrociate: un id senza testo in una lingua, un `alt` vuoto o una description oltre 160 caratteri fanno fallire la build.
- **Risultati dal vivo** (facoltativi, campo `live` del JSON): un componente client (`components/case-study/LiveResults.tsx`) legge l'export che il progetto pubblica (aria-er: JSON giornaliero su GitHub Pages) e disegna i grafici in SVG con i colori del sito. La logica è pura in `lib/liveResults.ts` (schema del contratto, serie dei grafici, dati vecchi oltre 48 ore); le origini permesse stanno in `DATA_ORIGINS`, da cui `next.config.ts` ricava `connect-src`. Se l'export non risponde, la pagina resta intera con un messaggio. I test E2E simulano l'export con `page.route`.
- Le schermate sono import statici (`lib/caseStudyImages.ts`) serviti da `next/image`. Per un progetto privato vanno prese **solo dal profilo demo**; per aria-er vengono dalla sua dashboard, su dati pubblici.
- Ogni pagina ha canonical, hreflang, immagine Open Graph, voce nella sitemap e un JSON-LD `TechArticle` con `BreadcrumbList`. Per un progetto privato `codeRepository` non viene mai emesso, e un test E2E verifica che la pagina non contenga link al repository. Per un progetto pubblico il link in fondo porta al repository (`data-source="public"`) e il JSON-LD ha `codeRepository`.

## SEO

- **Metadata per vista** (`lib/seo.ts`): title, description, canonical, hreflang (`en`, `it`, `fr`, `de`, `x-default`), Open Graph di tipo `profile` e Twitter card `summary_large_image`. Per l'indice `x-default` punta a `/`, che rileva la lingua; per le altre viste punta alla versione inglese.
- **Immagini Open Graph** 1200 × 630 generate in build per ogni lingua e vista (`opengraph-image.tsx`, `lib/og.tsx`), con l'icona storica del sito. L'icona è una copia a 56 px (`lib/og-icon.png`, circa 3 KB), la misura a cui viene disegnata: va rigenerata da `app/icon.png` se l'icona cambia.
- **JSON-LD** `@graph` (`lib/structuredData.ts`): `WebSite`, `Person` (con `alternateName`, `address`, `knowsAbout` e `sameAs`; `url` è la radice del sito in ogni lingua), `ProfilePage`, `BreadcrumbList` nelle viste interne e `ItemList` di `SoftwareSourceCode` nella vista dei progetti.
- **`sitemap.xml`** con alternate hreflang, **`robots.txt`**, **`manifest.webmanifest`**, favicon e icone ricavate dall'icona del sito precedente.
- **Indicizzazione controllata**: solo la produzione è indicizzabile (vedi [Variabili d'ambiente](#variabili-dambiente)). Il meta `robots` è impostato per pagina, non nel layout, così la 404 porta solo il `noindex` di Next.
- **Contenuto dei progetti sempre nell'HTML**: i pannelli chiusi dell'accordion restano montati (altezza zero, `inert`), quindi testi e link al repository di ogni progetto sono nella pagina prerenderizzata anche senza interazione.
- **Struttura della pagina**: un solo `h1` per URL, link reali nella navigazione, `rel="me"` sui profili social, header `X-Powered-By` disattivato.
- **Redirect 301** dai vecchi URL PHP:

| Vecchio URL | Destinazione |
| --- | --- |
| `/index.php` | `/` |
| `/error` | `/` |
| `/projDev/*` | `/it/sistemi` |
| `/projProd/*` | `/it/sistemi` |

- **Un solo host indicizzato**: dei tre host `*.vercel.app` del progetto (`cieri`, `cierisamuele`, `samuelecieri`, elenco in `lib/aliases.ts`) risponde solo quello di `SITE_URL`; gli altri rispondono con un redirect permanente (308) allo stesso percorso su `SITE_URL`. Il canonical da solo non bastava: Google aveva indicizzato un alias. Gli host sono elencati uno per uno in `lib/aliases.ts`, così le anteprime, localhost e il server dei test non vengono toccati. Un alias nuovo aggiunto su Vercel va aggiunto anche lì.

### Google Search Console

1. Aggiungi una proprietà di tipo "Prefisso URL" e scegli la verifica con tag HTML.
2. Imposta `GOOGLE_SITE_VERIFICATION` su Vercel (token o tag intero) e **rifai il deploy**: la variabile è letta in build. Controlla il risultato con `curl -s https://<sito>/en | grep google-site-verification`, poi premi "Verifica".
3. In "Sitemap" invia `sitemap.xml`. Su una proprietà nuova lo stato "Impossibile recuperare" con "Ultima lettura" vuota significa solo che Google non l'ha ancora letta: può volerci un paio di giorni.
4. Le richieste manuali di indicizzazione sono poche al giorno. Vanno fatte sulle URL con la lingua (`/en`, `/it`, `/en/systems`, …): la radice `/` risponde con un redirect e non viene indicizzata come pagina.

Con un dominio personale conviene una proprietà di tipo "Dominio", verificata via DNS.

## Accessibilità

- Navigazione con link reali e `aria-current="page"` sulla vista attiva; ogni vista è una `section` con `aria-label`.
- Accordion dei progetti con `aria-expanded` e `aria-controls`; i pannelli chiusi sono `inert`, fuori dal focus e dalle tecnologie assistive; pulsanti e controlli con etichette localizzate.
- Focus sempre visibile (`:focus-visible`), attributo `lang` aggiornato al cambio lingua; il menu delle lingue espone `aria-haspopup="listbox"`, `aria-expanded` e `aria-selected`, e ogni opzione ha il proprio `lang`.
- Elementi decorativi (canvas, frecce, indici) marcati con `aria-hidden`.
- Movimento ridotto rispettato su tre livelli: intro CSS, Framer Motion e frame loop della scena.

## Selezione del testo

La selezione è disabilitata solo sull'interfaccia: navigazione, bottoni, header e footer, etichette, indici, titoli display e canvas. Lì una selezione è sempre accidentale (doppio clic, swipe). Testi, descrizioni e contatti restano selezionabili e `Cmd/Ctrl+A` non viene intercettato: bloccarli non protegge il contenuto (è nell'HTML e nei risultati di ricerca) e peggiorerebbe accessibilità e usabilità.

## Dati e contenuti

I contenuti stanno in [`data/shared.json`](data/shared.json) e in un file per lingua in [`data/locales/`](data/locales/), caricati da `lib/portfolio.ts`.

```
data/shared.json        dati indipendenti dalla lingua
├── name, handle, alternateNames, address
├── knowsLanguage[]     lingue che parlo (JSON-LD), non le lingue del sito
├── contacts[]          id, label, handle, url
├── certifications[]    id, name, issuer, entity, issued, expires, url (CV, fase "Metodo", hasCredential)
├── sponsor             label, url (GitHub Sponsors: fuori da contacts, quindi niente sameAs né CV)
├── timeline.threads[]  corsie: id, kind (work | education), entity, segments[], fasi
├── projects[]          id, name, source, stack, layers
└── discipline          biological (metriche, sessioni) · acoustic (formati, pipeline)
data/locales/<lingua>.json   en · it · fr · de
├── ui                  messages di next-intl: meta (SEO), notFound, nav, navPlain, theme, locale, shell
├── hero
├── identity
├── timeline
├── projects            items[id]: summary, bridge, highlights, layers
└── discipline
```

- `shared.json` contiene i dati indipendenti dalla lingua (link, date, stack, metriche); `locales/<lingua>.json` contiene il copy.
- Il blocco `ui` di ogni lingua è usato come messages di next-intl e contiene anche title e description SEO per vista (`ui.meta.views`).
- Il copy è collegato ai dati condivisi tramite `id` (per esempio `shared.projects[].id` → `projects.items[id]` di ogni lingua).
- I campi `*Emphasis` indicano la parola resa in corsivo serif e devono comparire nel testo a cui si riferiscono.
- Le date sono in formato ISO `YYYY-MM-DD` e vengono mostrate come `DD.MM.YYYY`.
- I contenuti passano quattro controlli prima del prerender, e ogni errore fa fallire la build:
  1. **tipi**: ogni lingua è assegnata alla forma di `en.json`, quindi una chiave mancante o rinominata fa fallire `npm run typecheck`;
  2. **schema** (`lib/content/schema.ts`): `shared.json` è validato con zod (enum, date ISO esistenti, segmenti che finiscono dopo l'inizio, URL, unione `source`); i tipi del dominio sono derivati dallo schema;
  3. **valori dei testi** (`lib/content/copy.ts`): ogni lingua è validata con zod contro la forma di `en.json` (stesse chiavi, stesse liste, stessi segnaposto `{…}`); nessun testo vuoto o con spazi ai bordi, meta description ≤ 160 caratteri, titoli ≤ 65 come li mostra la scheda (con il nome del sito), nessun testo di 60 caratteri o più identico all'inglese (non tradotto);
  4. **verifiche incrociate** (`lib/content/validate.ts`): ogni id di corsia, fase, progetto e livello ha il suo copy in ogni lingua, ogni lingua ha l'etichetta in `ui.locale` e ogni `*Emphasis` compare nel suo testo. Tutti i problemi vengono elencati insieme, con il percorso.

`alternateNames` (altre grafie e handle con cui la stessa persona viene cercata) e `address` (`locality` e `country`, codice ISO a due lettere) alimentano `alternateName` e `address` del `Person` nel JSON-LD; un codice paese non valido fa fallire la build.

Campi che accettano `null` (mostrati come `—`): `discipline.biological.heightCm`, `discipline.biological.weightKg`. Anche `timeline.threads[].entity` accetta `null`: la corsia mostra allora solo la sua `entityLabel` (es. "Studio autonomo") e resta fuori da `worksFor` / `alumniOf`. `projects[].source` vale `{ "visibility": "public", "url": "…" }` (link al repository, pubblicato anche come `codeRepository` nel JSON-LD) oppure `{ "visibility": "private" }`: il codice non viene linkato e il progetto rimanda alla vista Identità, da cui chiedere una demo. Una visibilità sconosciuta o un progetto pubblico senza `url` fa fallire la build.

### Corsie della timeline

Una corsia è una sequenza di `segments`, non un intervallo unico: `{ "start": "YYYY-MM-DD", "end": null }` con `end: null` per il segmento ancora in corso. Più segmenti producono un vuoto sull'asse, e le date dei periodi attivi vengono scritte anche in chiaro nel dettaglio della corsia. Corsie e colonne derivano dall'array, quindi aggiungerne una terza non richiede modifiche al codice.

Il campo `kind` vale `work` o `education` e guida il JSON-LD: le corsie `work` alimentano `worksFor` e `knowsAbout`, quelle `education` alimentano `alumniOf`. Un valore diverso fa fallire la build. L'uptime in alto segue la prima corsia `work` e somma solo il tempo attivo, escludendo le interruzioni.

Ogni fase accetta uno `start` facoltativo. Senza, le fasi sono distribuite sul tempo attivo della corsia e scavalcano i vuoti; con uno `start`, la fase viene ancorata a quella data. Se sull'asse le etichette delle fasi non hanno spazio (corsia giovane: meno del 12% dell'asse fra un'etichetta e la successiva, o il bordo), la riga resta vuota e le fasi si leggono solo nel dettaglio: lo decide `phaseMarksFit` in `lib/timeline.ts`.

## Estendere il progetto

### Aggiungere un progetto

1. Aggiungi un elemento a `shared.projects` con `id`, `name`, `source` (pubblico con `url` o privato), `stack` e `layers` (`id`, `tech`). `version` è facoltativo (`0.9.0`, senza `v`): compare nel pannello del progetto, nel CV e nel JSON-LD, e per un progetto pubblico porta alla pagina del tag su GitHub. Insieme a `released` (la data di pubblicazione) lo tiene aggiornato un workflow: vedi [Versioni dei progetti](#versioni-dei-progetti).
2. In **ogni** lingua aggiungi `projects.items[<id>]` con `summary`, `bridge`, `highlights` (elenco delle scelte di ingegneria) e `layers` (una descrizione per ogni `id` di livello).
3. Se necessario, aggiorna title e description in `ui.meta.views.projects`.

La vista e il JSON-LD `ItemList` si aggiornano automaticamente.

### Aggiungere un caso di studio

1. Aggiungi l'id del progetto a `CASE_STUDY_IDS` in `lib/routes.ts`.
2. Crea `data/case-studies/<id>.json` sul modello di `yourfinance.json` e importalo in `lib/caseStudy.ts`.
3. Metti le schermate in `data/case-studies/<id>/` e importale in `lib/caseStudyImages.ts`, con le stesse chiavi di `screens`.

Link dall'accordion, sitemap, metadata e immagine Open Graph seguono da soli; TypeScript segnala i punti rimasti da toccare.

### Versioni dei progetti

`version` e `released` di ogni progetto in `data/shared.json` seguono le release dei progetti stessi, senza scriverle a mano.

- `.github/workflows/versions.yml` gira ogni giorno, e a richiesta dalla scheda Actions. `scripts/sync-versions.mjs` legge l'ultima release di ogni progetto che dichiara una versione e, se è più recente, riscrive le due righe; la logica è in `lib/versions.ts`, pura e testata.
- Il workflow non scrive mai su `development`: apre una pull request dal branch `features/versioni-dei-progetti` (o aggiorna quella già aperta), i controlli girano come per ogni altra e il merge resta una decisione.
- Contano anche le pre-release; le bozze no. Non si torna mai indietro: una versione uguale o più vecchia viene ignorata.
- Se nella pull request un controllo fallisce, un testo dipende dalla versione (per esempio la scheda di aria-er, che fino alla 1.0.0 deve dire cosa manca): si corregge il testo in quel branch e poi si unisce.
- Un progetto pubblico è cercato nel repository del suo `source.url`. Uno privato non ha indirizzo nei dati, di proposito: il suo repository arriva dal secret `VERSION_SOURCES` e non compare né nei file né nei log; un test fallisce se il nome finisce in un file.

Configurazione, una volta sola, in **Settings → Secrets and variables → Actions**:

| Secret | Valore |
| --- | --- |
| `VERSIONS_TOKEN` | Token personale *fine-grained* limitato a **questo** repository. Permessi: **Contents** e **Pull requests** in lettura e scrittura. |
| `VERSION_SOURCES_TOKEN` | Solo per i progetti privati: un secondo token *fine-grained*, limitato ai loro repository, con **Contents** in sola lettura. Sono due token perché un token *fine-grained* dà gli stessi permessi su tutti i repository che include: uno solo avrebbe potuto scrivere anche nei progetti privati. |
| `VERSION_SOURCES` | Solo per i progetti privati: `{"<id del progetto>":"proprietario/repository"}`. |

Serve un token personale e non quello del workflow: una pull request aperta con `GITHUB_TOKEN` non fa partire altri workflow, quindi i controlli obbligatori non girerebbero mai. Il token scade: quando succede il workflow fallisce con un messaggio che lo dice, e va rigenerato. Senza il secret il workflow si ferma subito con un errore chiaro.

### Aggiungere un contatto

Aggiungi `{ id, label, handle, url }` a `shared.contacts`: il contatto compare nella vista Identità e nel campo `sameAs` del JSON-LD.

### Aggiungere una vista

1. `lib/routes.ts`: aggiungi l'ID a `VIEW_IDS` e lo slug di ogni lingua in `VIEW_SLUGS`.
2. `lib/sceneModes.ts`: aggiungi la modalità della scena in `SCENE_MODES`.
3. `components/views/`: crea il componente e registralo in `RENDER` in `components/shell/AppShell.tsx`.
4. `data/locales/*.json`: aggiungi `ui.nav.<id>`, `ui.meta.views.<id>` e il copy della vista in ogni lingua.

Pagine, immagini Open Graph, sitemap, navigazione e scorciatoie numeriche derivano da `VIEW_IDS` (le scorciatoie coprono fino a 9 viste).

### Aggiungere una lingua

1. `lib/routes.ts`: aggiungi il codice a `LOCALES`, il nome nativo in `LOCALE_NAMES` e gli slug in `VIEW_SLUGS`. Il menu delle lingue si genera da qui. `i18n/routing.ts`, `viewFromPath` e la suite E2E leggono da qui e non vanno toccati.
2. `lib/seo.ts`: aggiungi il locale Open Graph in `OG_LOCALE` (per esempio `pt: 'pt_PT'`).
3. `data/locales/<codice>.json`: crea il file con la stessa struttura di `en.json`, importalo in `lib/portfolio.ts` e in `e2e/content.ts`, e aggiungi l'etichetta della nuova lingua in `ui.locale` di ogni lingua.

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
│   │       ├── opengraph-image.tsx  immagine Open Graph per vista
│   │       └── [study]/             caso di studio di un progetto (pagina + immagine Open Graph)
│   ├── api/cv/route.ts              download del CV (unica route dinamica)
│   ├── globals.css                  token di colore, utility Tailwind, intro CSS
│   ├── sitemap.ts · robots.ts · manifest.ts
│   └── favicon.ico · icon.png · apple-icon.png
├── components/
│   ├── motion/       ViewFrame (contenitore della vista), Reveal (varianti, line mask, intro)
│   ├── providers/    ThemeProvider (next-themes)
│   ├── scene/        SceneLayer → DataField (lazy) → fieldRenderer (WebGL) · fieldShader
│   ├── case-study/   CaseStudyPage (componente server), SceneMode
│   ├── seo/          PortfolioPage (JSON-LD + app)
│   ├── shell/        AppRoot, AppShell, NavBar, ViewLink, LocaleSwitch, ThemeToggle,
│   │                 useViewNavigation, useViewUrlSync
│   ├── ui/           text (Meta, Emphasis: primitive senza codice client)
│   └── views/        HeroView, IdentityView, TimelineView, ProjectsView, DisciplineView, CvRequest, atoms
├── data/
│   ├── shared.json                  dati indipendenti dalla lingua
│   ├── cv.json                      testi del PDF e dell'email del CV (solo server)
│   ├── cv-profile.json              competenze e lingue del CV (solo server)
│   ├── case-studies/                un JSON per caso di studio + cartella con le schermate (solo server)
│   └── locales/                     en.json · it.json · fr.json · de.json: copy, stringhe UI, metadata SEO
├── i18n/             routing.ts (lingue) · request.ts (messages di next-intl)
├── lib/              routes, views, portfolio, timeline, scroll, seo, site, verification, errorCopy, structuredData, theme, og, caseStudy, caseStudyImages, sceneField, projects, versions, format, hooks, cn
│   ├── content/      schema (zod) · validate (verifiche incrociate)
│   └── cv/           service, token, config, document, pdf, mailer, copy, profile, common (CV su richiesta)
├── store/            viewStore (per istanza) · useSceneStore (scena, transiente)
├── e2e/              suite Playwright · helpers.ts (lingue, viste, attese)
├── .github/workflows/ci.yml   lint, typecheck, build e test su ogni PR
├── .github/workflows/versions.yml   versioni dei progetti allineate alle loro release (PR automatica)
├── .github/workflows/smoke.yml   smoke test su ogni deploy di Vercel (anteprime e produzione)
├── scripts/          sync-versions.mjs (usato dal workflow delle versioni)
├── proxy.ts          rilevamento lingua (middleware di next-intl)
├── next.config.ts    plugin next-intl, redirect 301, origini ammesse in sviluppo
├── eslint.config.mjs · postcss.config.mjs · tsconfig.json · playwright.config.ts
└── package.json
```

## Qualità del codice

- TypeScript in modalità `strict`, con alias `@/*` sulla radice del progetto.
- Prettier per TypeScript, JSON, CSS e YAML (i Markdown sono esclusi per non riallineare tabelle e alberi). I commit di sola formattazione vanno elencati in `.git-blame-ignore-revs`; per usarlo in locale: `git config blame.ignoreRevsFile .git-blame-ignore-revs`.
- ESLint con le configurazioni `core-web-vitals` e `typescript` di Next.js.
- `npm run typecheck` esegue prima `next typegen`, che genera i tipi globali delle route (`PageProps`, `LayoutProps`).
- Test unitari con Vitest accanto ai moduli (`lib/**/*.test.ts`): slug e URL, aritmetica della timeline (segmenti, vuoti, fasi, asse), formattazione, schema e verifiche dei contenuti, inclusi i file reali.
- Test end-to-end in `e2e/` con Playwright, eseguiti sulla build di produzione su Chromium, WebKit e un profilo mobile. Coprono URL e metadata di ogni lingua, navigazione e cronologia, cambio lingua, SEO, header di sicurezza, accessibilità (axe) e la tenuta del sito a un fallimento WebGL.
- CI in `.github/workflows/ci.yml`: formattazione, lint, typecheck, test unitari, build e test end-to-end su ogni pull request e a ogni push su `development`. I suoi tre job (questo, i test end-to-end e il budget di prestazioni) sono controlli obbligatori per il merge (vedi [Flusso di lavoro](#flusso-di-lavoro)).
- **Regressione visiva** (`e2e/visual.spec.ts`): nove screenshot di riferimento in `e2e/__screenshots__/` (le cinque viste nel tema chiaro, due nel tema scuro, due su telefono) confrontati a ogni esecuzione. Per essere ripetibili fermano l'orologio e nascondono la scena WebGL. Valgono per Chromium su Linux, cioè per la CI: in locale su macOS i test sono saltati, perché fallirebbero per il solo antialiasing. Dopo una modifica visiva voluta la CI fallisce, rigenera i riferimenti sullo stesso runner e li pubblica nell'artefatto `visual-references`: `gh run download <id> -n visual-references -D e2e/__screenshots__`, si guardano le immagini e si committano.
- **Budget di prestazioni** (`lighthouserc.json`): un terzo job della CI esegue Lighthouse tre volte, in emulazione mobile, su home, timeline e progetti della build di produzione e fallisce se la mediana esce dalle soglie: accessibilità e SEO a 100, buone pratiche ≥ 95, LCP ≤ 4 s, CLS ≤ 0,02, peso della pagina ≤ 450 KB (era 700 prima di togliere three.js). Punteggio di prestazioni (≥ 80) e TBT (≤ 300 ms) sono solo segnalati: dipendono dalla potenza del runner, che cambia da un'esecuzione all'altra (TBT da 360 a 750 ms sullo stesso codice), e come errori farebbero fallire la CI a caso. Le soglie fotografano lo stato attuale sui runner della CI, più lenti di un portatile e senza GPU (lì la scena WebGL pesa di più), con un piccolo margine: servono a bloccare i regressi e vanno strette a ogni miglioramento. In locale: `npm run build && npx @lhci/cli@0.15.1 autorun`.
- Dependabot (`.github/dependabot.yml`) apre ogni settimana una PR raggruppata verso `development` per le dipendenze npm e una per le GitHub Actions. Le major di `eslint` e `typescript` sono ignorate finché `eslint-config-next` non le supporta.
- Rilasci: una milestone per versione; ogni PR ha un'etichetta `semver:major|minor|patch`, e `.github/release.yml` raggruppa per etichetta le note generate della release. `version` in `package.json` si alza solo nella PR di rilascio.
- Le GitHub Actions sono fissate allo SHA del commit, con la versione in un commento (`uses: actions/checkout@<sha> # v7.0.1`): un tag può essere spostato, uno SHA no. Dependabot legge il commento e continua a proporre gli aggiornamenti; `lib/ci.test.ts` fallisce se un workflow torna a puntare a un tag o a un branch.
- `.mailmap` unifica sotto un'unica identità i commit iniziali firmati con l'email generata dal nome host, senza riscrivere la cronologia.
- Source map pubblicate anche in produzione (`productionBrowserSourceMaps`): il repository è pubblico, quindi non espongono nulla di nuovo e rendono leggibili stack trace e audit di prestazioni. Il browser le scarica solo con gli strumenti di sviluppo aperti.
- `reactStrictMode` attivo e indicatore di sviluppo di Next disattivato, perché si sovrapporrebbe alla navigazione.

## Flusso di lavoro

`development` è il branch di produzione ed è protetto: ci si arriva solo con una pull request.

1. Un branch per ogni lavoro, creato da `development`: `features/<nome-parlante>`.
2. Prima del push, in locale: `npm run format:check && npm run lint && npm run typecheck && npm run test:unit && npm test`.
3. Push del branch e pull request verso `development`. La PR fa partire la CI (gli stessi comandi) e un deploy di anteprima su Vercel, non indicizzabile.
4. Il merge è possibile solo con i tre controlli della CI verdi, ed è il deploy in produzione. Si usa "Create a merge commit", così la cronologia conserva i commit del branch.
5. Dopo il merge il branch viene cancellato.

Le issue e le pull request sono in inglese; i messaggi di commit in italiano.

## Deploy su Vercel

1. Su vercel.com → **Add New → Project** → importa `CieriS/portfolio`. Il framework Next.js viene rilevato automaticamente (build `npm run build`, install `npm install`).
2. **Settings → Git → Production Branch**: `development`.
3. Variabili opzionali in **Settings → Environment Variables**: `GOOGLE_SITE_VERIFICATION` e `SITE_URL` (solo con un dominio personalizzato). Per il CV: `CV_ADMIN_PASSWORD`, `CV_LINK_SECRET`, `RESEND_API_KEY`, `CV_MAIL_FROM`, `CV_NOTIFY_EMAIL`, `CV_EMAIL`, `CV_PHONE` (vedi [Variabili d'ambiente](#variabili-dambiente)).
4. Il sito è su `https://<progetto>.vercel.app`. Ogni merge su `development` viene distribuito automaticamente; gli altri branch e le PR generano anteprime non indicizzabili.

Dopo ogni deploy riuscito Vercel lo segnala a GitHub, e `.github/workflows/smoke.yml` lancia `npm run test:smoke` sull'URL distribuito, con il codice di quel commit: tutte le pagine (200, idratazione senza errori, canonical, `robots` dell'ambiente), redirect della radice, 404, intestazioni, `robots.txt` e sitemap, endpoint del CV (in produzione un token falso deve dare 403: 503 vuol dire variabili mancanti su Vercel) e, solo in produzione, il 308 degli altri alias. Le attese per ambiente stanno in `lib/smoke.ts`. Non è un controllo obbligatorio: la produzione si verifica dopo il merge.

In alternativa, da terminale: `npx vercel login`, poi `npx vercel` (anteprima) e `npx vercel --prod` (produzione).

### Build di produzione in locale

```bash
npm run build
npm start
```

## Sito precedente

In precedenza il portfolio era un sito PHP e MySQL pubblicato su Altervista. Il suo codice non è più in questo repository (resta nella cronologia git); di quel sito oggi restano:

- i redirect 301 dei suoi URL principali verso le viste nuove (vedi [SEO](#seo));
- l'icona, da cui derivano favicon e icone di questo sito.

## Risoluzione dei problemi

| Problema | Soluzione |
| --- | --- |
| Da un altro dispositivo la pagina compare ma non risponde a clic e tastiera | L'host non è in `allowedDevOrigins` (`next.config.ts`): aggiungilo e riavvia `npm run dev`. |
| Canonical e sitemap puntano a `localhost` in produzione | Imposta `SITE_URL` oppure pubblica su Vercel, che fornisce `VERCEL_PROJECT_PRODUCTION_URL`. |
| Errori di tipo su `PageProps` o `LayoutProps` | Esegui `npm run typecheck`: `next typegen` rigenera i tipi delle route. |
| La build fallisce dopo una modifica ai contenuti | Il messaggio elenca ogni problema con il suo percorso (per esempio `it.projects.items.app.layers has no copy for "api"`). `npm run test:unit` lo mostra in meno di un secondo. |
| Un deploy di anteprima non compare su Google | È voluto: solo `VERCEL_ENV=production` è indicizzabile. |

## Contatti

- GitHub: [@CieriS](https://github.com/CieriS/)
- LinkedIn: [in/samuelecieri](https://www.linkedin.com/in/samuelecieri/)

## Hook di git

`.githooks/pre-push` parte prima di ogni push: cerca segreti nei commit in uscita (gitleaks, o la sua immagine Docker se manca il binario) e poi lancia i controlli veloci (`format:check`, `lint`, `typecheck`, `test:unit`). Si attiva con `npm install` (script `prepare`); per saltarlo una volta: `git push --no-verify`. Sulla CI, `.github/workflows/secret-scan.yml` controlla con gitleaks tutta la cronologia di ogni branch e tag. Il segreto finto del test del CV è dichiarato in `.gitleaksignore`.

## Licenza

Codice e contenuti sono di proprietà dell'autore, tutti i diritti riservati: vedi [`LICENSE`](LICENSE).

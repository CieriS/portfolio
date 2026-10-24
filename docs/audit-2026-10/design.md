# Audit di design: cieri.vercel.app

Data: 2026-10-24. Fonti: il sito di produzione (`https://cieri.vercel.app`, release `v2.6.0`), navigato con
Playwright (Chromium), e il codice di questo repository. Nessun file del sito è stato modificato.

Copertura:
- **4 viste + 2 casi di studio** (home, Identità, Esecuzione, Sistemi, yourFinance, aria-er);
- **5 lingue** (en, it, fr, de, es): 30 pagine controllate a script su tre viewport (375, 768, 1440), per un totale di 90 caricamenti;
- **screenshot** delle 6 pagine inglesi a 3 viewport, tema chiaro e scuro (lo scuro a 375 e 1440), prima schermata e pagina intera: 60 file, più 7 di stati interattivi, in [`design-audit-screenshots/`](screenshots/).

Il layout è bloccato a `100dvh` e la vista scorre dentro `main > section`, quindi la "pagina intera" è stata
ottenuta allungando il viewport all'altezza del contenuto.

## Sintesi

1. Il sito ha un'identità visiva vera e non sembra un template: due soli colori di testo, tre famiglie di caratteri, un'unica scena di punti, il nome a tutta pagina in sans più serif corsivo ([home](screenshots/home-d1440-light-fold.webp)).
2. La palette è disciplinata e i contrasti reggono in entrambi i temi (testo 14,2:1 e 16,5:1, testo attenuato 5,1:1 e 5,8:1).
3. Il punto debole è la **scala piccola**: oltre metà del testo misurato a 1440 px è mono a 11 px maiuscolo spaziato (193 elementi su 502), con casi a 10 e 9 px. Su mobile funziona da decorazione ma pesa sulla lettura.
4. Il responsive regge, nessuno scroll orizzontale su 90 caricamenti. Su mobile però la navigazione si riduce a numeri senza nome, i bersagli touch sono quasi tutti sotto i 44 px e la vista Sistemi mostra solo due righe chiuse su uno schermo vuoto.
5. Il design system esiste nei colori, ma non nella tipografia né nelle spaziature: 152 valori scritti a mano nelle classi (47 distinti), 9 diverse spaziature negative per i titoli e 5 dimensioni display con `clamp()` diverse.

## Problemi

| # | Problema | Dove | Gravità | Fix proposto |
|---|---|---|---|---|
| 1 | Navigazione mobile fatta di soli numeri: "02 03 04" senza nome, solo la voce attiva ha un'etichetta. Chi non conosce l'ordine non sa dove porta "03". | tutte le viste, 375 px ([home](screenshots/home-m375-light-fold.webp), [Sistemi](screenshots/systems-m375-light-full.webp)); `components/shell/NavBar.tsx:19` | alta | Su mobile mostrare la parola chiara (`ui.navPlain`: Home, Chi sono, Esperienza, Progetti) per tutte e quattro le voci; c'è spazio, perché le voci sono passate da 5 a 4. |
| 2 | Bersagli touch sotto i 44 × 44 px: voci della navigazione 13 × 33, selettore della lingua 16 × 30 per voce nei casi di studio e 21–28 × 36 nel menu, nome del sito 95 × 23, interruttore del tema 76 × 36, link `yourFinance`/`aria-er` nel testo 84 × 19 e 45 × 19. | 375 px, tutte le pagine (misurato a script) | alta | Area cliccabile minima di 44 px con `min-h-11`/padding verticale sulle voci della navigazione, sulla lingua e sul tema; i link nel testo possono restare, ma con interlinea che li separa. |
| 3 | Sistemi su mobile: due righe chiuse e poi ~350 px di schermo vuoto prima della navigazione. Il contenuto più importante per un recruiter (i progetti) è nascosto dietro due "+". | [Sistemi 375](screenshots/systems-m375-light-full.webp) | alta | Mostrare sotto ogni nome una riga di `summary` anche da chiuso (il testo è già nell'HTML, il pannello è solo `inert`). Lasciare chiusi i dettagli, come scelto. |
| 4 | Testo mono a 11 px maiuscolo con `tracking-[0.14em]` usato per 193 elementi su 502 a 1440 px, comprese etichette che portano informazione (date, "Organization: Tas", "Started", stack). Ci sono anche 10 px (stack dei grafici live) e 9 px (freccia della lingua). | `components/ui/text.tsx:14` (`Meta`), `components/case-study/LiveResults.tsx:122`, `components/shell/LocaleSwitch.tsx:106`; [Esecuzione 375](screenshots/execution-m375-light-full.webp) | media | Portare `Meta` a 12 px su mobile e lasciare 11 px solo alle etichette decorative (numeri di sezione); stack e date a 12–13 px. Contrasto e colore restano. |
| 5 | La scena di punti passa dietro il testo di lettura: nella home i punti attraversano il paragrafo, sotto "Explore" e sotto i link. | [home 1440 chiaro](screenshots/home-d1440-light-fold.webp), [caso di studio](screenshots/cs-yourfinance-d1440-light-fold.webp) | media | Una velatura di `--paper` (es. 70–80%) solo dietro i blocchi di testo lunghi, oppure abbassare `presence` della scena nelle zone di testo. |
| 6 | Su mobile la sfumatura in fondo alla vista copre l'invito "Explore": l'elemento ha opacità 1 e colore pieno, ma sta a 746 px su 812, dentro la sfumatura sopra la navigazione, e appare spento. | [home 375](screenshots/home-m375-light-fold.webp) (misurato: opacità 1, `bottom` 746) | media | Spazio sotto l'ultimo blocco della home pari all'altezza della sfumatura, oppure l'invito sopra il paragrafo su mobile. |
| 7 | Il suggerimento "Move the cursor — every node is a unit of computation" compare anche su telefono, dove non c'è cursore. | [home 375](screenshots/home-m375-light-fold.webp); `components/views/HeroView.tsx:28` | bassa | Nasconderlo con `@media (hover: none)` o un testo diverso per il tocco. Oggi nessun componente usa `hover:`/`pointer:` come query. |
| 8 | Due selettori della lingua diversi: menu a tendina "EN ▾" nelle viste, cinque sigle in fila nei casi di studio. Su mobile il caso di studio perde anche il nome del sito. | [caso di studio 1440](screenshots/cs-yourfinance-d1440-light-fold.webp), [aria-er 375](screenshots/cs-ariaer-m375-light-fold.webp), [home](screenshots/home-d1440-light-fold.webp) | media | Usare lo stesso componente in entrambe le testate; sul caso di studio tenere il nome, accorciando "Back to Systems" a freccia + etichetta accessibile. |
| 9 | Ordine di lettura e ordine di Tab diversi nella home: "Explore" sta in alto a destra (y 581) ma riceve il focus dopo i link del paragrafo (y 717–741). | home, 1440 (sequenza Tab misurata) | bassa | Mettere l'invito prima del paragrafo nel DOM e posizionarlo con la griglia, o spostarlo visivamente dopo il testo. |
| 10 | La vista Esecuzione su mobile è lunga 3631 px: tre corsie e tre blocchi di testo uno sotto l'altro, con lo stack in mono 11 px a fine di ogni fase. | [Esecuzione 375](screenshots/execution-m375-light-full.webp) | media | Su mobile mostrare una corsia alla volta (schede Industria/Accademico/Indipendente) o comprimere le fasi a titolo + stack. |
| 11 | Etichetta di fase che sborda di 4 px a 768 px in spagnolo ("Ejecución"): lo `span` assoluto finisce a 772 px. Nessuno scroll orizzontale, perché è tagliato, ma il testo è troncato. | `/es/ejecucion` a 768 px; `components/views/TimelineView.tsx:234` | bassa | Ancorare a destra l'ultima etichetta della corsia (`right-0` quando supera l'asse) o permettere l'a capo. |
| 12 | Nove spaziature negative diverse per i titoli (da `-0.01em` a `-0.06em`) e cinque `clamp()` display distinti, scritti nei componenti. È la parte del sistema non governata da token. | `components/ui/text.tsx:25,33`, `HeroView.tsx:17,21`, `IdentityView.tsx:28,73`, `TimelineView.tsx:58`, `ProjectsView.tsx:97`, `CaseStudyPage.tsx:115`, `app/[locale]/error.tsx:23` | media | Tre ruoli display in `@theme` (`--text-display`, `--text-title`, `--text-heading` con tracking e interlinea propri) e sostituire i valori arbitrari. |
| 13 | `text-[15px]` ripetuto 36 volte e `text-[13px]` 6 volte invece di una scala: il corpo del sito vive fuori dalla scala di Tailwind (14/16). | `components/shell/AppShell.tsx:58` e seguenti (conteggio sui `.tsx`) | bassa | Token `--text-body: 15px` e `--text-small: 13px` in `@theme`, così il valore cambia in un punto. |
| 14 | Le etichette mono hanno `select-none`: date, organizzazione e stack non si possono copiare. | `components/ui/text.tsx:14` | bassa | Togliere `select-none` da `Meta`, lasciarlo solo sui numeri decorativi. |
| 15 | L'arancione d'accento (`#ff5b1f`) ha contrasto 2,52:1 sulla carta chiara. Oggi è usato solo per punti e indicatori ("Running"), non per testo, quindi va bene; diventerebbe un problema se lo si usasse per testo o link. | `app/globals.css:11` | bassa | Annotarlo come regola: accento mai per testo nel tema chiaro (nel tema scuro fa 6,34:1). |

## Cosa funziona (con le prove)

- **Prima impressione.** In cinque secondi si legge il nome, in grande, e "Software Developer — Data Engineering" in testata. Poi "Software Developer / Transitioning to Data Engineering" e un paragrafo con Tas, Angular, Rust, PostgreSQL e i due progetti linkati ([home](screenshots/home-d1440-light-fold.webp)). La personalità è editoriale e tecnica: carta calda, nero morbido, mono per i dati, serif corsivo per l'enfasi.
- **Colore.** 2 colori di testo, 4 sfondi, 1 accento in tutto il DOM misurato. Ogni coppia testo/sfondo reale supera AA:

  | Tema | Coppia | Contrasto |
  |---|---|---|
  | chiaro | ink su paper | 14,24:1 |
  | chiaro | muted su paper | 5,09:1 |
  | scuro | ink su paper | 16,5:1 |
  | scuro | muted su paper | 5,77:1 |

  I due temi hanno lo stesso carattere ([chiaro](screenshots/home-d1440-light-fold.webp), [scuro](screenshots/home-d1440-dark-fold.webp)).
- **Tipografia.** Tre famiglie con ruoli chiari: Geist per il testo (260 elementi), Geist Mono per etichette e dati (236), Instrument Serif solo per l'enfasi (6). Tre pesi in tutto (400, 500, 300). Il corpo a 15 px con interlinea 1,5–1,6 e righe di circa 60 caratteri è leggibile ([caso di studio](screenshots/cs-yourfinance-d1440-light-fold.webp)).
- **Coerenza dei componenti.** Tutte le viste interne aprono con la stessa testata "(0n) NOME" e lo stesso titolo ([Identità 768](screenshots/identity-t768-light-fold.webp), [Sistemi](screenshots/systems-m375-light-full.webp)). C'è un solo raggio (pillola, per i bottoni tondi) e nessuna ombra.
- **Accessibilità.**
  - Focus visibile su ogni elemento raggiunto con Tab: contorno pieno di 1 px con 4 px di distanza ([focus](screenshots/focus-home-tab5-d1440-light.webp)).
  - Il link per saltare al contenuto è il primo elemento.
  - Un solo `h1` per pagina in 90 caricamenti su 90.
  - Nessuna immagine senza `alt`.
- **Movimento.** Con `prefers-reduced-motion: reduce` la scena resta ferma (canvas identico dopo 2 s) e non resta nessuna animazione CSS in corso. 8 punti del codice gestiscono il movimento ridotto.
- **Responsive.** Nessuno scroll orizzontale su 90 caricamenti (5 lingue × 6 pagine × 3 viewport). Il nome nella home scala da 375 a 1440 senza a capo forzati.

## Inventario dei token

**Colori** (da `app/globals.css`, ripetuti in `lib/theme.ts` e verificati da un test):

| Token | Chiaro | Scuro | Uso misurato |
|---|---|---|---|
| `--paper` | `#ede7db` | `#0b0b0b` | sfondo |
| `--ink` | `#1b1916` | `#ecebe7` | testo principale (216 elementi) |
| `--muted` | `#646057` | `#8c8b86` | testo secondario (286) |
| `--line` | ink al 14% | ink al 14% | bordi |
| `--accent` | `#ff5b1f` | `#ff5b1f` | indicatori (14 sfondi) |

Nessun colore fuori dai token nel DOM: la parte più solida del sistema.

**Caratteri**: Geist, Geist Mono, Instrument Serif; pesi 300, 400, 500.

**Dimensioni del testo misurate** (1440 px, pagine inglesi): **18 valori distinti**.
- 11 px (193 elementi) · 15 px (148) · 13 px (53) · 14 px (33) · 18 px (18) · 10 px (17) · 20 px (11) · 30 px · 40 px · 9 px (4);
- più i valori display calcolati da `clamp()`: 57,6 · 80,64 · 92,16 · 99,53 px.
- ⚠️ 9 e 10 px sono sotto la soglia di leggibilità; 13, 14 e 15 px convivono per ruoli simili (testo secondario).

**Interlinea**: **21 valori distinti**, conseguenza delle dimensioni libere.

**Spaziatura delle lettere**: **15 valori distinti**.
- Positivi: `0.14em` sulle etichette mono e `0.04em`.
- ⚠️ Negativi, solo per i titoli: −0.01, −0.015, −0.025, −0.03, −0.04, −0.045, −0.05, −0.06 em. Sono otto valori per lo stesso ruolo.

**Valori scritti a mano nelle classi**: **152 occorrenze, 47 distinti**. I più frequenti:
- `text-[15px]` ×36
- `text-[11px]` ×31
- `tracking-[0.14em]` ×17
- `text-[13px]` ×6
- `bg-[length:100%_1px]` ×5

**Raggi**: 1 (pillola). **Ombre**: 0.

**Breakpoint**: quasi tutto su `md:` (111 usi), poi `sm:` (11), `lg:` (1) e un `min-[400px]` isolato (`NavBar.tsx:19`). È di fatto un sito a due layout, mobile e da 768 in su.

**Spaziatura del layout**: `--frame: clamp(1rem, 2.4vw, 2.25rem)` per i margini laterali, coerente ovunque. Gli intervalli verticali tra sezioni usano la scala di Tailwind (`mt-24`, `md:mt-36`) senza un token di ritmo.

## I 3 interventi con il miglior rapporto impatto/sforzo

1. **Navigazione e bersagli touch su mobile** (problemi 1 e 2). È qualche classe in `NavBar`, `LocaleSwitch` e `ThemeToggle`. Su telefono, dove arriva chi apre il link da LinkedIn, oggi non si capisce dove porta la navigazione e i comandi sono piccoli. Sforzo: un'ora, più i riferimenti visivi da rigenerare.
2. **Un riassunto visibile nella vista Sistemi** (problema 3). Una riga di `summary` sotto ogni nome di progetto, anche da chiuso. Il testo esiste già e i pannelli restano chiusi, come hai scelto. Trasforma la vista più importante per un recruiter da due righe vuote a due progetti leggibili. Sforzo: un componente e un test.
3. **Scala tipografica in token** (problemi 4, 12 e 13). Ruoli `display`, `title`, `heading`, `body`, `small`, `label` in `@theme`, con `label` a 12 px su mobile. Assorbe 9 valori di spaziatura e circa 80 dimensioni scritte a mano, e risolve la leggibilità delle etichette. Sforzo medio: tocca molti file, ma ogni modifica è meccanica e i riferimenti visivi la controllano.

## Screenshot

Nomi: `<pagina>-<viewport>-<tema>-<fold|full>.png`, con viewport `m375`, `t768`, `d1440`. Il tema scuro è solo a 375 e 1440.

- Home: [1440 chiaro](screenshots/home-d1440-light-fold.webp) · [1440 scuro](screenshots/home-d1440-dark-fold.webp) · [768](screenshots/home-t768-light-fold.webp) · [375](screenshots/home-m375-light-fold.webp) · [375 scuro](screenshots/home-m375-dark-fold.webp)
- Identità: [1440](screenshots/identity-d1440-light-full.webp) · [768](screenshots/identity-t768-light-fold.webp) · [375](screenshots/identity-m375-light-full.webp) · [375 scuro](screenshots/identity-m375-dark-full.webp)
- Esecuzione: [1440](screenshots/execution-d1440-light-full.webp) · [768](screenshots/execution-t768-light-full.webp) · [375](screenshots/execution-m375-light-full.webp) · [1440 scuro](screenshots/execution-d1440-dark-full.webp)
- Sistemi: [1440](screenshots/systems-d1440-light-full.webp) · [768](screenshots/systems-t768-light-full.webp) · [375](screenshots/systems-m375-light-full.webp) · [375 scuro](screenshots/systems-m375-dark-full.webp)
- Caso di studio yourFinance: [1440](screenshots/cs-yourfinance-d1440-light-full.webp) · [768](screenshots/cs-yourfinance-t768-light-full.webp) · [375](screenshots/cs-yourfinance-m375-light-full.webp) · [1440 scuro](screenshots/cs-yourfinance-d1440-dark-full.webp)
- Caso di studio aria-er: [1440](screenshots/cs-ariaer-d1440-light-full.webp) · [768](screenshots/cs-ariaer-t768-light-full.webp) · [375](screenshots/cs-ariaer-m375-light-fold.webp) · [375 scuro](screenshots/cs-ariaer-m375-dark-full.webp)
- Stati: [focus 1º Tab](screenshots/focus-home-tab1-d1440-light.webp) · [focus 5º](screenshots/focus-home-tab5-d1440-light.webp) · [focus 9º](screenshots/focus-home-tab9-d1440-light.webp) · [hover riga progetto](screenshots/hover-systems-row-d1440-light.webp) · [progetto aperto 1440](screenshots/open-systems-row-d1440-light.webp) · [progetto aperto 375](screenshots/open-systems-row-m375-light.webp) · [menu lingua 375](screenshots/locale-menu-m375-light.webp)

## Issue aperte (2026-10-24)

| Problemi | Issue | Milestone |
|---|---|---|
| 1, 2, 6, 7 | #95 menu e bersagli touch su mobile | 2.7.0 |
| 3 | #96 riassunto sotto i progetti chiusi | 2.7.0 |
| 4, 11, 12, 13, 14 | #97 scala tipografica in token | 2.8.0 |
| 8 | #98 un solo selettore di lingua | 2.8.0 |
| 9 | #99 ordine di Tab della home | 2.8.0 |
| 15 | #100 l'accento mai come testo (test) | 2.8.0 |
| 5 | #101 da valutare: scena dietro il testo | 2.10.0 |
| 10 | #102 da valutare: Esecuzione più corta su mobile | 2.10.0 |

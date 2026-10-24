# Revisione del copy: cieri.vercel.app

Data: 2026-10-24. Analisi parallela a [design.md](design.md). Nessun file del sito è stato modificato.

**Cosa ho letto**:
- il copy inglese delle quattro viste, i meta e la testata (`data/locales/en.json`);
- i titoli dei due casi di studio, dagli screenshot dell'audit.

L'inglese è la versione che legge un recruiter internazionale. Le altre lingue ricalcano la stessa struttura, quindi i problemi di messaggio valgono anche per loro; vanno corrette lingua per lingua, non traducendo.

**Riferimento di voce**: le regole già fissate in `CLAUDE.md` ("Tono del copy", issue #20):
- preciso ma non strano;
- le cose chiamate con il loro nome, in prima persona;
- **niente metafore ingegneristiche forzate**;
- solo fatti presenti nei dati o confermati.

I nomi di sistema del menu (Index, Identity, Execution, Systems) sono una tua scelta da non riproporre e restano fuori da questa revisione.

## Sintesi

- **Allineamento**: buono dove il testo descrive lavoro vero, debole dove fa scena.
- **Punti di forza**:
  - i casi di studio aprono con una tesi verificabile ("The database *guarantees* the balances.", "The numbers *match* ARPAE's.");
  - le liste di decisioni dei progetti sono concrete e difendibili in un colloquio (RLS per connessione, outbox transazionale, SCD Type 2, test di qualità dei dati).
- **Cosa migliorare per primo**: le metafore da sistema operativo che le tue regole escludono.
  - Una dice il falso: "None blocks the others", mentre la corsia accademica è stata sospesa due anni proprio per il lavoro.
  - Al sito manca anche una cosa che un recruiter cerca subito: che ruolo cerchi e se sei disponibile.

## Problemi

| # | Problema | Dove | Gravità | Proposta |
|---|---|---|---|---|
| 1 | "Three concurrent processes sharing one clock. **None blocks the others.**" È falso rispetto ai dati: la corsia accademica dice "Suspended from 2023 to late 2024 to concentrate on full-time work". Il lavoro ha bloccato lo studio. | `timeline.subtitle` | alta | Togliere l'affermazione o dire il vero (vedi sotto). |
| 2 | Nessun messaggio su che cosa cerchi: né il ruolo, né la disponibilità, né la modalità (remoto, Bologna). Per un recruiter è la prima domanda. Il sito dice "Transitioning to Data Engineering", ma non se vuoi un ruolo da Data Engineer, junior o ibrido, adesso o più avanti. | home, Identità | alta | **Deciso il 2026-10-24**: cerco un ruolo da Data Engineer, full remote. Da dire in home e in Identità, in ogni lingua. |
| 3 | Metafore forzate, che le tue regole escludono: "every node is a unit of computation" (suggerimento della home); "Multi-thread execution", "Uptime 1704d" (timeline); "Projects built as bridges toward Data Engineering" e l'etichetta "Data bridge" (progetti). | `hero.hint`, `timeline.title/subtitle/labels.uptime`, `projects.subtitle`, `projects.labels.bridge` | media | Dire la cosa: "Work, university and self-study, side by side"; "What it shows for Data Engineering" al posto di "Data bridge". |
| 4 | "Software Developer — Data Engineering" in testata e "Software Developer & Data Engineering" nel titolo SEO della home si leggono come due ruoli attuali. Il percorso di data engineering è iniziato a febbraio 2026 ed è studio autonomo con due progetti. | `shell.role`, `meta.views.hero.title` | media | "Software Developer, moving into Data Engineering", coerente con `hero.transition` e con la meta description, che lo dicono già bene. |
| 5 | Affermazioni assolute non dimostrabili: "**never** by habit or taste"; "What does not move the objective is removed"; "deterministic performance" per Rust. Un intervistatore può chiedere un esempio di ognuna. | `identity.subtitle`, `identity.principles[0]`, `timeline...systems.body` | media | Ammorbidire con fatti: "I choose languages and tools for what they do for the project", e per Rust "memory safety without a garbage collector", che è vero e verificabile. |
| 6 | I principi di Identità sono astratti ("Instrumental rationality", "Engineering before ornament"). Solo il quarto, "Flat control flow… at most two levels of nesting", è concreto. Nessuno rimanda a dove lo si vede applicato. | `identity.principles` | media | Ogni principio con una prova di una riga che rimanda ai progetti (es. "Data as ground truth → aria-er checks its marts against ARPAE's published figures"). |
| 7 | "pipelines that move data **with intent**": suona bene ma non dice niente. | `hero.lead` | bassa | "…and pipelines that load, test and publish data". |
| 8 | Incoerenze di forma: "Frontend" e "front-end team"; "Data Engineering" maiuscolo in un punto e "a pure data engineering project" minuscolo in un altro; virgola di Oxford sì in `hero.lead` e no in `hero.detail` e nei meta. | `timeline.threads.industry`, `projects.items.ariaer.bridge`, `hero.*`, `meta.*` | bassa | Una scelta per ciascuna cosa ("frontend", "data engineering" minuscolo come disciplina, virgola di Oxford sì o no), da mettere tra le regole del tono. |
| 9 | "Private source — walkthrough on request": scritto prima del caso di studio. Oggi yourFinance ha una pagina che spiega com'è fatto, e la frase la sottovaluta. | `projects.labels.private` | bassa | "Private code — see the case study, demo on request". |
| 10 | "Support my work" (GitHub Sponsors) tra i contatti di un sito che serve alle candidature: per un recruiter è un segnale ambiguo. | `identity.sponsor` | bassa | **Deciso il 2026-10-24**: per ora resta com'è. |

## Testi riscritti (inglese, solo proposta)

**1. `timeline.subtitle`**
- Prima: "Three concurrent processes sharing one clock. None blocks the others."
- Dopo: "Work, university and self-study, side by side since 2021. University paused for two years while I worked full time."

**3. `projects.subtitle` e `projects.labels.bridge`**
- Prima: "Projects built as bridges toward Data Engineering." / "Data bridge"
- Dopo: "Two projects I built to learn data engineering on real data." / "What it shows for data engineering"

**4. `shell.role` e `meta.views.hero.title`**
- Prima: "Software Developer — Data Engineering" / "Samuele Cieri — Software Developer & Data Engineering"
- Dopo: "Software Developer, moving into Data Engineering" / "Samuele Cieri — Software Developer moving into Data Engineering" (63 caratteri: il titolo della home non riceve il suffisso col nome del sito, quindi resta sotto i 65 del controllo).

**5. `identity.subtitle`**
- Prima: "Every language, schema and abstraction is chosen for its measurable contribution to an objective — never by habit or taste."
- Dopo: "I choose languages, schemas and abstractions for what they do for the project, and I can say why for each one."

**7. `hero.lead`**
- Prima: "Building the path from interfaces to systems: typed backends, relational storage, and pipelines that move data with intent."
- Dopo: "From interfaces to systems: typed backends, relational storage and pipelines that load, test and publish data."

## Controlli legali e di conformità

- **Marchi**: "Certified ScrumMaster" e "Scrum Alliance" sono scritti correttamente.
- **Affermazioni sui risultati**: "results identical to DuckDB" (aria-er) e i conteggi di superamenti confrontati con ARPAE sono sostenuti dal caso di studio, quindi vanno bene.
- **Dati personali**: il link del CV contiene l'email di chi lo chiede (#91, non pianificata). L'informativa (#65) deve dirlo esplicitamente.
- **Nessuna testimonianza, confronto con concorrenti o affermazione finanziaria**: niente da segnalare.

## Che cosa decidere

- Punto 2: deciso (Data Engineer, full remote). Punto 10: resta.
- Le correzioni sono nelle issue della milestone 2.7.0, da fare in tutte e cinque le lingue, scritte in lingua.

## Issue aperte (2026-10-24)

| Punti | Issue | Milestone |
|---|---|---|
| 1, 3 | #103 metafore forzate e frase falsa sulla timeline | 2.7.0 |
| 2, 4 | #104 ruolo cercato (Data Engineer, full remote) e testata | 2.7.0 |
| 5, 6, 7 | #105 principi con prove, niente affermazioni assolute | 2.7.0 |
| 8, 9 | #106 grafia coerente ed etichetta del codice privato | 2.7.0 |
| 10 | nessuna: "Support my work" resta (decisione del 2026-10-24) | — |

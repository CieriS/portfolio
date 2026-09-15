# Samuele Cieri — Portfolio

[Italiano](README.md) · [English](README.en.md) · **Français**

Portfolio personnel de **Samuele Cieri**, Software Developer en reconversion vers la Data Engineering. C'est une Single Page Application minimaliste construite avec Next.js : la mise en page est fixée à `100dvh`, les vues changent sans recharger la page et un champ de particules 3D reste actif en arrière-plan. Chaque vue possède malgré tout sa propre URL, pré-rendue et indexable, en anglais et en italien.

Le site est disponible en anglais et en italien ; ce README existe aussi en français.

La branche `next-migration` remplace l'ancien site PHP, conservé dans [`legacy/`](legacy/).

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Démarrage rapide](#démarrage-rapide)
- [Scripts npm](#scripts-npm)
- [Variables d'environnement](#variables-denvironnement)
- [Vues et URL](#vues-et-url)
- [Navigation et interactions](#navigation-et-interactions)
- [Architecture](#architecture)
- [SEO](#seo)
- [Accessibilité](#accessibilité)
- [Sélection du texte](#sélection-du-texte)
- [Données et contenus](#données-et-contenus)
- [Étendre le projet](#étendre-le-projet)
- [Structure du projet](#structure-du-projet)
- [Qualité du code](#qualité-du-code)
- [Déploiement sur Vercel](#déploiement-sur-vercel)
- [Site legacy](#site-legacy)
- [Dépannage](#dépannage)
- [Contacts](#contacts)
- [Licence](#licence)

## Fonctionnalités

- **SPA avec de vraies URL** : chaque vue est une page statique (SSG) avec son propre contenu et ses propres métadonnées. Après le premier chargement, le changement de vue se fait côté client, sans rechargement, et met à jour l'URL et le titre via l'History API.
- **Bilingue (EN/IT)** : slugs traduits, détection automatique de la langue et changement de langue instantané qui conserve la vue, le canvas et l'état.
- **Scène 3D persistante** : une grille de 5 376 points (three.js) qui change de forme et de cadrage à chaque vue et réagit au pointeur. Elle est chargée uniquement côté client et s'adapte aux performances de l'appareil.
- **Thème clair, sombre ou automatique** avec next-themes, sans flash au chargement.
- **Animations soignées** : intro en CSS au premier affichage (avant l'hydratation), puis Framer Motion pour les transitions entre vues, les line masks et le soulignement animé de la navigation.
- **SEO complet** : canonical, hreflang, Open Graph avec images par langue et par vue, JSON-LD, sitemap, robots, manifest et redirections 301 depuis les anciennes URL PHP.
- **Accessibilité** : vrais liens, un seul `h1` par URL, attributs ARIA, focus visible et respect de `prefers-reduced-motion` en CSS, dans Framer Motion et dans la scène 3D.
- **Contenus centralisés** dans un seul fichier JSON typé : une clé manquante ou une différence de structure entre EN et IT fait échouer le build.

## Stack technique

| Couche | Technologie |
| --- | --- |
| Framework | Next.js 16 (App Router, React Server Components, SSG) · React 19 |
| Langage | TypeScript 6 (`strict`) |
| Styles | Tailwind CSS v4 (`@tailwindcss/postcss`) · next-themes (light / dark / system) |
| Typographie | Geist · Geist Mono · Instrument Serif (`next/font/google`) |
| Animations | Framer Motion (`AnimatePresence`, `layoutId`, `MotionConfig`, mask reveal) |
| 3D | three · @react-three/fiber · @react-three/drei (lazy, côté client uniquement) |
| État | Zustand (store de vue par instance via context + store de scène transitoire) |
| i18n | next-intl (`/en`, `/it`, détection de la langue via `proxy.ts`, changement de langue côté client) |
| Données | `data/portfolio.json` (source unique : contenus, textes de l'interface, métadonnées SEO) |
| Qualité | ESLint 9 (`eslint-config-next` : core-web-vitals + typescript) · `tsc --noEmit` |
| Hébergement | Vercel |

`@playwright/test` figure déjà dans les devDependencies, mais aucune suite de tests n'est encore configurée.

## Prérequis

- **Node.js ≥ 20.9.0** (champ `engines` de `package.json`)
- **npm** (le dépôt contient `package-lock.json`)

## Démarrage rapide

```bash
git clone https://github.com/CieriS/portfolio.git
cd portfolio
git checkout next-migration
npm install
npm run dev
```

Le site tourne sur http://localhost:3000. La racine `/` redirige vers `/en` ou `/it` selon la langue du navigateur.

Pour le tester sur un smartphone connecté au même réseau, ouvrez l'adresse *Network* affichée par `npm run dev` (par exemple `http://192.168.1.69:3000`). Les hôtes `192.168.*.*`, `10.*` et `*.local` sont déjà autorisés par `allowedDevOrigins` dans `next.config.ts` ; sans cette entrée, la page s'affiche mais ne s'hydrate jamais.

## Scripts npm

| Commande | Description |
| --- | --- |
| `npm run dev` | Serveur de développement avec rechargement à chaud sur http://localhost:3000 |
| `npm run build` | Build de production : pré-rend les pages, les images Open Graph, le sitemap et robots |
| `npm start` | Lance le build de production en local |
| `npm run lint` | ESLint sur l'ensemble du projet (hors `legacy/` et fichiers de build) |
| `npm run typecheck` | Génère les types des routes (`next typegen`) et vérifie les types avec `tsc --noEmit` |

Avant un push, il est conseillé d'exécuter `npm run lint`, `npm run typecheck` et `npm run build`.

## Variables d'environnement

Aucune variable n'est obligatoire : en local, le projet fonctionne sans configuration.

| Variable | Rôle |
| --- | --- |
| `SITE_URL` | Facultative. Origine canonique pour les canonical, hreflang, sitemap, Open Graph et JSON-LD ; les slashs finaux sont supprimés. Utile uniquement avec un domaine personnalisé. En son absence, l'URL de production Vercel (`VERCEL_PROJECT_PRODUCTION_URL`) est utilisée, et `http://localhost:3000` en local. |
| `GOOGLE_SITE_VERIFICATION` | Facultative. Jeton de validation Google Search Console, publié sous forme de balise meta. |
| `VERCEL_PROJECT_PRODUCTION_URL` | Définie par Vercel. Utilisée quand `SITE_URL` est absente. |
| `VERCEL_ENV` | Définie par Vercel. Seul `production` est indexable : les prévisualisations reçoivent `noindex` et un `robots.txt` avec `Disallow: /`. Hors de Vercel, où la variable n'existe pas, le site est indexable. |

En local, vous pouvez créer un fichier `.env.local`, déjà ignoré par Git :

```bash
SITE_URL=https://www.example.com
GOOGLE_SITE_VERIFICATION=votre-jeton
```

## Vues et URL

| # | Vue (ID) | EN | IT | Contenu |
| --- | --- | --- | --- | --- |
| 01 | Index (`hero`) | `/en` | `/it` | Nom en très grand format, rôle, présentation et invitation à explorer. |
| 02 | Identity / Identità (`identity`) | `/en/identity` | `/it/identita` | Déclaration d'intention, quatre principes d'ingénierie et contacts (GitHub, LinkedIn, GitLab). |
| 03 | Execution / Esecuzione (`timeline`) | `/en/execution` | `/it/esecuzione` | Frise chronologique à deux couloirs (industrie et parcours universitaire) sur un axe temporel commun, avec un compteur d'uptime en temps réel et des phases accompagnées de leur stack. |
| 04 | Systems / Sistemi (`projects`) | `/en/systems` | `/it/sistemi` | Projets présentés en accordéon : résumé, architecture en couches, lien avec la Data Engineering et lien vers le dépôt. |
| 05 | Optimization / Ottimizzazione (`discipline`) | `/en/optimization` | `/it/ottimizzazione` | La méthode au-delà du code : programme de callisthénie (mesures et séances) et mécanique du son (guitare acoustique, formats sans perte, pipeline audio). |

Chaque URL est pré-rendue avec son propre contenu. Une adresse qui ne correspond à aucune vue affiche une page 404 localisée et non indexable.

## Navigation et interactions

- **Liens en bas de page** (`01`–`05`) : ce sont de vrais `<a href>`, donc le clic du milieu, « ouvrir dans un nouvel onglet » et les robots d'indexation fonctionnent. Le clic principal change la vue sur place.
- **Clavier** : `1`–`5` accèdent directement à une vue, `←` et `→` les parcourent en boucle. Les touches sont ignorées si une touche de modification est enfoncée ou si le focus est dans un champ de saisie.
- **Tactile** : un balayage horizontal (plus de 70 px et majoritairement horizontal) passe à la vue précédente ou suivante.
- **Flèches et compteur** dans le pied de page, sur les écrans moyens et grands.
- **Historique** : chaque changement de vue appelle `pushState`, donc les boutons précédent et suivant du navigateur fonctionnent. Le titre du document suit la vue active.
- **Langue** : le sélecteur EN / IT remplace l'URL par le slug traduit (`replaceState`), met à jour `lang` et le titre, et enregistre le cookie `NEXT_LOCALE` pour un an, sans navigation. Le canvas et la vue active restent intacts.
- **Détection de la langue** : sur `/` et sur les chemins sans préfixe, `proxy.ts` (le middleware next-intl) choisit la langue d'après le cookie `NEXT_LOCALE` ou l'en-tête `Accept-Language`. La langue par défaut est l'anglais et le préfixe est toujours présent.
- **Thème** : le bouton alterne Auto → Clair → Sombre ; l'icône est respectivement à moitié pleine, vide ou pleine.
- **Scène** : le pointeur déplace légèrement la caméra et « réchauffe » les nœuds voisins. L'effet s'estompe lorsque le pointeur quitte la fenêtre.

## Architecture

### Rendu et routage

- Le layout et les pages utilisent `generateStaticParams` : toutes les combinaisons langue × vue sont générées au build.
- `app/[locale]/page.tsx` (index) et `app/[locale]/[view]/page.tsx` (vues internes) rendent tous deux `components/seo/PortfolioPage.tsx`, un Server Component qui injecte le JSON-LD et démarre l'application sur la vue demandée.
- `lib/views.ts` est la source unique des ID, des slugs localisés et des conversions URL ↔ vue.
- Les deux langues sont envoyées au client (`getPortfolioBundle`) : le changement de langue ne nécessite donc aucune navigation.

### Shell

- `AppRoot` gère la langue courante et le provider next-intl.
- `AppShell` assemble l'en-tête (nom, rôle, langue, thème), la vue active et le pied de page (navigation, flèches, compteur).
- `AnimatePresence mode="wait"`, avec la clé `vue:langue`, pilote les transitions. `ViewFrame` est le conteneur défilant de chaque vue, avec des bords estompés et une barre de défilement masquée.
- `useViewNavigation` gère le clavier et le balayage ; `useViewUrlSync` synchronise l'URL, l'historique, le titre et le mode de la scène.

### État

- **`store/viewStore.tsx`** : store Zustand créé pour chaque instance et partagé via React context. La vue initiale vient de l'URL, et un singleton au niveau du module partagerait l'état entre des rendus serveur concurrents.
- **`store/useSceneStore.ts`** : store global de la scène (mode, palette, pointeur). Le pointeur est modifié sur place et lu dans `useFrame` via `getState()`, si bien que le mouvement de la souris ne provoque jamais de re-rendu React.

### Scène 3D

- `SceneLayer` vit dans le layout, au-dessus de chaque changement de vue, et n'est jamais démonté.
- `DataField` est chargé avec `next/dynamic` et `ssr: false` : three.js n'entre jamais dans le bundle serveur.
- `DataGrid` dessine une grille de 96 × 56 points ; une ligne sur cinq transporte des « paquets de données » en mouvement.
- Chaque vue possède un mode dans `components/scene/modes.ts` (amplitude, fréquence, vitesse, flux, rayon et force du pointeur, présence, position de la caméra). Lors d'un changement de vue, les paramètres évoluent progressivement vers les nouvelles valeurs.
- `PerformanceMonitor` ramène le device pixel ratio à 1 lorsque la fréquence d'images baisse et le remonte jusqu'à 1,75 lorsqu'elle s'améliore.
- Avec `prefers-reduced-motion: reduce`, le canvas passe en `frameloop="demand"` et ne se redessine que lorsque la vue ou le thème change.
- La palette suit le thème résolu (clair ou sombre).

### Animations

- Au premier affichage, les entrées sont en CSS pur (`.intro-line` et `.intro-fade` sous `html:not([data-booted])`). Le contenu ne reste donc jamais masqué en attendant l'hydratation, et le titre de l'index, élément LCP, commence à s'afficher immédiatement.
- Au premier changement de vue ou de langue, `markBooted()` passe la main à Framer Motion.
- `MotionConfig reducedMotion="user"` respecte les préférences du système.

### Thème et typographie

- Tokens CSS dans `app/globals.css` (`--paper`, `--ink`, `--muted`, `--line`, `--accent`), redéfinis sous `.dark` et exposés à Tailwind v4 via `@theme inline`.
- Utilitaires personnalisés : `px-frame`, `no-scrollbar`, `fade-edges`, `link-underline`, `bg-dashed`.
- Polices chargées avec `next/font` et `display: swap` : Geist pour le texte, Geist Mono pour les étiquettes, Instrument Serif en italique pour les mots mis en valeur.

## SEO

- **Métadonnées par vue** (`lib/seo.ts`) : title, description, canonical, hreflang (`en`, `it`, `x-default`), Open Graph de type `profile` et Twitter card `summary_large_image`. Pour l'index, `x-default` pointe vers `/`, qui détecte la langue ; pour les autres vues, il pointe vers la version anglaise.
- **Images Open Graph** en 1200 × 630, générées au build pour chaque langue et chaque vue (`opengraph-image.tsx`, `lib/og.tsx`), avec l'icône de l'ancien site.
- **JSON-LD** `@graph` (`lib/structuredData.ts`) : `WebSite`, `Person` (avec `knowsAbout` et `sameAs`), `ProfilePage`, `BreadcrumbList` sur les vues internes et `ItemList` de `SoftwareSourceCode` sur la vue des projets.
- **`sitemap.xml`** avec alternatives hreflang, **`robots.txt`**, **`manifest.webmanifest`**, ainsi qu'un favicon et des icônes dérivés de l'icône legacy `iconRed.ico`.
- **Indexation maîtrisée** : seule la production est indexable (voir [Variables d'environnement](#variables-denvironnement)).
- **Structure des pages** : un seul `h1` par URL, de vrais liens dans la navigation, `rel="me"` sur les profils sociaux, en-tête `X-Powered-By` désactivé.
- **Redirections 301** depuis les anciennes URL PHP :

| Ancienne URL | Destination |
| --- | --- |
| `/index.php` | `/` |
| `/error` | `/` |
| `/projDev/*` | `/it/sistemi` |
| `/projProd/*` | `/it/sistemi` |

Après le premier déploiement : Google Search Console → ajouter une propriété de type préfixe d'URL → envoyer `/sitemap.xml`.

## Accessibilité

- Navigation par de vrais liens, avec `aria-current="page"` sur la vue active ; chaque vue est une `section` dotée d'un `aria-label`.
- L'accordéon des projets utilise `aria-expanded` et `aria-controls` ; les boutons et contrôles ont des libellés localisés.
- Focus toujours visible (`:focus-visible`), attribut `lang` mis à jour lors du changement de langue, `hreflang` sur les liens du sélecteur de langue.
- Éléments décoratifs (canvas, flèches, index) marqués `aria-hidden`.
- Réduction des animations respectée à trois niveaux : intro CSS, Framer Motion et boucle de rendu de la scène.

## Sélection du texte

La sélection n'est désactivée que sur les éléments d'interface : navigation, boutons, en-tête et pied de page, étiquettes, index, grands titres et canvas. À ces endroits, une sélection est toujours accidentelle (double clic, balayage). Les textes, descriptions et contacts restent sélectionnables et `Cmd/Ctrl+A` n'est pas intercepté : les bloquer ne protégerait pas le contenu (il figure dans le HTML et dans les résultats de recherche) et nuirait à l'accessibilité comme à l'ergonomie.

## Données et contenus

Tous les contenus se trouvent dans [`data/portfolio.json`](data/portfolio.json), importé et typé dans `lib/portfolio.ts`.

```
shared                  données indépendantes de la langue
├── name, handle
├── contacts[]          id, label, handle, url
├── timeline            threadA (industrie), threadB (université) : dates, phases, stack
├── projects[]          id, name, repo, stack, layers
└── discipline          biological (mesures, séances) · acoustic (formats, pipeline)
locales.en | locales.it
├── ui                  messages next-intl : meta (SEO), notFound, nav, theme, locale, shell
├── hero
├── identity
├── timeline
├── projects            items[id] : summary, bridge, layers
└── discipline
```

- `shared` contient les données indépendantes de la langue (liens, dates, stack, mesures) ; `locales.en|it` contient les textes.
- Le bloc `ui` de chaque langue sert de messages next-intl et contient aussi le title et la description SEO de chaque vue (`ui.meta.views`).
- Les textes sont reliés aux données partagées par `id` (par exemple `shared.projects[].id` → `locales.*.projects.items[id]`).
- Les champs `*Emphasis` désignent le mot affiché en serif italique et doivent figurer dans le texte auquel ils se rapportent.
- Les dates sont au format ISO `YYYY-MM-DD` et s'affichent sous la forme `DD.MM.YYYY`.
- Le JSON est affecté à des types explicites : une clé manquante ou renommée, ou une structure différente entre EN et IT, fait échouer `npm run typecheck` et le build.

Champs acceptant `null` (affichés `—`) : `timeline.threadA.organization`, `timeline.threadB.start`, `timeline.threadB.institution`, `projects[].repo`, `discipline.biological.heightCm`, `discipline.biological.weightKg`. Si `repo` vaut `null`, le lien du projet pointe vers le profil GitHub ; si la date de début d'un couloir vaut `null`, le couloir est dessiné en pointillés.

## Étendre le projet

### Ajouter un projet

1. Ajoutez une entrée à `shared.projects` avec `id`, `name`, `repo` (ou `null`), `stack` et `layers` (`id`, `tech`).
2. Dans **les deux** langues, ajoutez `projects.items[<id>]` avec `summary`, `bridge` et `layers` (une description par `id` de couche).
3. Si nécessaire, mettez à jour le title et la description dans `ui.meta.views.projects`.

La vue et le JSON-LD `ItemList` se mettent à jour automatiquement.

### Ajouter un contact

Ajoutez `{ id, label, handle, url }` à `shared.contacts` : le contact apparaît dans la vue Identity et dans le champ `sameAs` du JSON-LD.

### Ajouter une vue

1. `lib/views.ts` : ajoutez l'ID à `VIEW_IDS` et son slug pour chaque langue dans `VIEW_SLUGS`.
2. `components/scene/modes.ts` : ajoutez le mode de la scène dans `SCENE_MODES`.
3. `components/views/` : créez le composant et enregistrez-le dans `RENDER` de `components/shell/AppShell.tsx`.
4. `data/portfolio.json` : ajoutez `ui.nav.<id>`, `ui.meta.views.<id>` et les textes de la vue dans chaque langue.

Les pages, les images Open Graph, le sitemap, la navigation et les raccourcis numériques découlent tous de `VIEW_IDS` (les raccourcis couvrent jusqu'à 9 vues).

### Ajouter une langue

1. `i18n/routing.ts` : ajoutez le code à `locales`.
2. `lib/views.ts` : ajoutez les slugs dans `VIEW_SLUGS` et le code dans la vérification de `viewFromPath`, aujourd'hui limitée à `en` et `it`.
3. `lib/seo.ts` : ajoutez la locale Open Graph dans `OG_LOCALE` (par exemple `fr: 'fr_FR'`).
4. `data/portfolio.json` : ajoutez `locales.<code>` avec la même structure que `en`, ainsi que le libellé de la nouvelle langue dans `ui.locale` de chaque langue.

TypeScript signale chaque étape oubliée, car toutes ces tables sont typées sur `Locale`.

## Structure du projet

```
.
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx               html, polices, thème, SceneLayer persistant, métadonnées de base
│   │   ├── page.tsx                 vue Index
│   │   ├── not-found.tsx            page 404 localisée
│   │   ├── opengraph-image.tsx      image Open Graph de l'index
│   │   └── [view]/
│   │       ├── page.tsx             vues internes (slugs localisés)
│   │       └── opengraph-image.tsx  image Open Graph par vue
│   ├── globals.css                  tokens de couleur, utilitaires Tailwind, intro CSS
│   ├── sitemap.ts · robots.ts · manifest.ts
│   └── favicon.ico · icon.png · apple-icon.png
├── components/
│   ├── motion/       ViewFrame (conteneur de vue), Reveal (variantes, line mask, intro)
│   ├── providers/    ThemeProvider (next-themes)
│   ├── scene/        SceneLayer → DataField (Canvas, lazy) → DataGrid (useFrame) · modes
│   ├── seo/          PortfolioPage (JSON-LD + application)
│   ├── shell/        AppRoot, AppShell, NavBar, ViewLink, LocaleSwitch, ThemeToggle,
│   │                 useViewNavigation, useViewUrlSync
│   └── views/        HeroView, IdentityView, TimelineView, ProjectsView, DisciplineView, atoms
├── data/
│   └── portfolio.json               contenus EN/IT, textes de l'interface, métadonnées SEO
├── i18n/             routing.ts (langues) · request.ts (messages next-intl)
├── lib/              views, portfolio, seo, site, structuredData, og, format, hooks, cn
├── store/            viewStore (par instance) · useSceneStore (scène, transitoire)
├── legacy/           ancien site PHP (non servi)
├── proxy.ts          détection de la langue (middleware next-intl)
├── next.config.ts    plugin next-intl, redirections 301, origines autorisées en développement
├── eslint.config.mjs · postcss.config.mjs · tsconfig.json
└── package.json
```

## Qualité du code

- TypeScript en mode `strict`, avec l'alias `@/*` pointant vers la racine du projet.
- ESLint avec les configurations `core-web-vitals` et `typescript` de Next.js.
- `npm run typecheck` exécute d'abord `next typegen`, qui génère les types globaux des routes (`PageProps`, `LayoutProps`).
- `legacy/` est exclu de TypeScript et d'ESLint.
- `reactStrictMode` est activé, et l'indicateur de développement de Next est désactivé car il recouvrirait la navigation.

## Déploiement sur Vercel

1. Publiez la branche sur GitHub : `git push -u origin next-migration`.
2. Sur vercel.com → **Add New → Project** → importez `CieriS/portfolio`. Next.js est détecté automatiquement (build `npm run build`, installation `npm install`).
3. **Settings → Git → Production Branch** : `next-migration` (ou `development` après la fusion).
4. Variables facultatives dans **Settings → Environment Variables** : `GOOGLE_SITE_VERIFICATION` et `SITE_URL` (uniquement avec un domaine personnalisé).
5. Déploiement : le site est en ligne sur `https://<projet>.vercel.app`. Chaque push sur la branche de production est redéployé automatiquement ; les autres branches et les PR génèrent des prévisualisations non indexables.

Sinon, depuis le terminal : `npx vercel login`, puis `npx vercel` (prévisualisation) et `npx vercel --prod` (production).

### Build de production en local

```bash
npm run build
npm start
```

## Site legacy

`legacy/` contient l'ancien portfolio, hébergé sur Altervista : PHP et MySQL, HTML, CSS et JavaScript, Font Awesome 6.4 et une collection de projets dans `projDev/`. Son README d'origine se trouve dans [`legacy/readMe.md`](legacy/readMe.md).

- Next.js ne le sert pas : le projet n'a pas de dossier `public/`, donc aucun fichier de `legacy/` n'est accessible depuis le site publié.
- Il est exclu du lint et de la vérification des types.
- Ses principales URL sont redirigées en 301 (voir [SEO](#seo)).
- `legacy/.htaccess` redirige en 301 tout le domaine Altervista vers Vercel en conservant le chemin : remplacez `<progetto>.vercel.app` par l'URL de production et déposez le fichier à la racine du site Altervista.
- Les icônes du nouveau site dérivent de `legacy/img/icon/iconRed.ico`.

## Dépannage

| Problème | Solution |
| --- | --- |
| Sur un autre appareil, la page s'affiche mais ne réagit ni aux clics ni au clavier | L'hôte n'est pas dans `allowedDevOrigins` (`next.config.ts`) : ajoutez-le et relancez `npm run dev`. |
| Les canonical et le sitemap pointent vers `localhost` en production | Définissez `SITE_URL`, ou déployez sur Vercel, qui fournit `VERCEL_PROJECT_PRODUCTION_URL`. |
| Erreurs de type sur `PageProps` ou `LayoutProps` | Lancez `npm run typecheck` : `next typegen` régénère les types des routes. |
| Le build échoue après une modification de `portfolio.json` | Vérifiez que la clé existe dans les deux langues et que la valeur respecte les types de `lib/portfolio.ts`. |
| Un déploiement de prévisualisation n'apparaît pas sur Google | C'est voulu : seul `VERCEL_ENV=production` est indexable. |

## Contacts

- GitHub : [@CieriS](https://github.com/CieriS/)
- LinkedIn : [in/samuelecieri](https://www.linkedin.com/in/samuelecieri/)
- GitLab : [@CieriS](https://gitlab.com/CieriS/)

## Licence

Le dépôt n'inclut pas de licence : le code et les contenus restent la propriété de l'auteur (tous droits réservés). Font Awesome Free, dans `legacy/`, est distribué sous sa propre licence ([`LICENSE.txt`](legacy/fontawesome-free-6.4.0-web/LICENSE.txt)).

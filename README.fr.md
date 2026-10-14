# Samuele Cieri — Portfolio

[Italiano](README.md) · [English](README.en.md) · **Français**

Portfolio personnel de **Samuele Cieri**, Software Developer en reconversion vers la Data Engineering. C'est une Single Page Application minimaliste construite avec Next.js : la mise en page est fixée à `100dvh`, les vues changent sans recharger la page et un champ de particules 3D reste actif en arrière-plan. Chaque vue possède malgré tout sa propre URL, pré-rendue et indexable, en anglais, en italien et en français.

Le site est disponible en anglais, en italien, en français et en allemand.

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
- [Méthode de travail](#méthode-de-travail)
- [Déploiement sur Vercel](#déploiement-sur-vercel)
- [Ancien site](#ancien-site)
- [Dépannage](#dépannage)
- [Contacts](#contacts)
- [Licence](#licence)

## Fonctionnalités

- **SPA avec de vraies URL** : chaque vue est une page statique (SSG) avec son propre contenu et ses propres métadonnées. Après le premier chargement, le changement de vue se fait côté client, sans rechargement, et met à jour l'URL et le titre via l'History API.
- **Quatre langues (EN/IT/FR/DE)** : slugs traduits, détection automatique de la langue et changement de langue instantané qui conserve la vue, le canvas et l'état.
- **Scène 3D persistante** : une grille de 5 376 points (three.js) qui change de forme et de cadrage à chaque vue et réagit au pointeur. Elle est chargée uniquement côté client et s'adapte aux performances de l'appareil.
- **Thème clair, sombre ou automatique** avec next-themes, sans flash au chargement.
- **Animations soignées** : intro en CSS au premier affichage (avant l'hydratation), puis Framer Motion pour les transitions entre vues, les line masks et le soulignement animé de la navigation.
- **SEO complet** : canonical, hreflang, Open Graph avec images par langue et par vue, JSON-LD, sitemap, robots, manifest et redirections 301 depuis les anciennes URL PHP.
- **Accessibilité** : vrais liens, un seul `h1` par URL, attributs ARIA, focus visible et respect de `prefers-reduced-motion` en CSS, dans Framer Motion et dans la scène 3D.
- **Contenus centralisés et validés** : un fichier JSON partagé plus un par langue, contrôlés par les types, un schéma zod et des contrôles croisés — un contenu incohérent fait échouer le build.
- **CV sur demande** : le PDF est généré à chaque téléchargement à partir des mêmes contenus que le site, avec les coordonnées privées lues dans des variables d'environnement. Il n'est pas public : le visiteur laisse une adresse e-mail et reçoit un lien signé qui expire ; le propriétaire le télécharge tout de suite avec un mot de passe.
- **Étude de cas** : yourFinance a sa propre page sous la vue des projets (`/fr/systemes/yourfinance`) : problème, contraintes, architecture, choix, mesures et captures d'écran avec des données de démonstration. Le code reste privé et la page n'y renvoie jamais.

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
| i18n | next-intl (`/en`, `/it`, `/fr`, détection de la langue via `proxy.ts`, changement de langue côté client) |
| Données | `data/shared.json` + `data/locales/*.json` (source unique : contenus, textes de l'interface, métadonnées SEO), validés avec zod |
| Qualité | ESLint 9 (`eslint-config-next` : core-web-vitals + typescript) · Prettier · `tsc --noEmit` · Vitest · Playwright |
| PDF | pdf-lib (CV généré sur demande, côté serveur uniquement) |
| Hébergement | Vercel |

Les tests end-to-end tournent avec Playwright sur Chromium, WebKit et un profil mobile, contre le build de production. Les tests unitaires utilisent Vitest. GitHub Actions exécute formatage, lint, typecheck, tests unitaires, build et tests end-to-end sur chaque pull request.

## Prérequis

- **Node.js ≥ 22.12.0** (requis par Vitest) (champ `engines` de `package.json`)
- **npm** (le dépôt contient `package-lock.json`)

## Démarrage rapide

```bash
git clone https://github.com/CieriS/portfolio.git
cd portfolio
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
| `npm run lint` | ESLint sur l'ensemble du projet (hors fichiers de build) |
| `npm run format` | Formate le projet avec Prettier (`.prettierrc.json`, avec tri des classes Tailwind) |
| `npm run format:check` | Vérifie le formatage sans modifier les fichiers, comme la CI |
| `npm run typecheck` | Génère les types des routes (`next typegen`) et vérifie les types avec `tsc --noEmit` |
| `npm run test:unit` | Tests unitaires Vitest de la logique pure (`lib/**/*.test.ts`), en moins d'une seconde |
| `npm test` | Suite end-to-end Playwright ; construit et démarre lui-même le serveur de production |
| `npm run test:ui` | La même suite dans le mode interactif de Playwright |

Avant un push, il est conseillé d'exécuter `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run test:unit` et `npm test` — les mêmes commandes que la CI.

## Variables d'environnement

Aucune variable n'est obligatoire : en local, le projet fonctionne sans configuration.

| Variable | Rôle |
| --- | --- |
| `SITE_URL` | Facultative. Origine canonique pour les canonical, hreflang, sitemap, Open Graph et JSON-LD ; les slashs finaux sont supprimés. Utile uniquement avec un domaine personnalisé. En son absence, l'URL de production Vercel (`VERCEL_PROJECT_PRODUCTION_URL`) est utilisée, et `http://localhost:3000` en local. |
| `GOOGLE_SITE_VERIFICATION` | Facultative. Jeton de validation Google Search Console, publié sous forme de balise meta. Accepte le jeton seul ou la balise `<meta>` entière copiée depuis la Search Console (`lib/verification.ts` en extrait le jeton) ; toute autre valeur fait échouer le build. Le site est statique : une modification de la variable ne prend effet qu'après un nouveau déploiement. |
| `VERCEL_PROJECT_PRODUCTION_URL` | Définie par Vercel. Utilisée quand `SITE_URL` est absente. |
| `VERCEL_ENV` | Définie par Vercel. Seul `production` est indexable : les prévisualisations reçoivent `noindex` et un `robots.txt` avec `Disallow: /`. Hors de Vercel, où la variable n'existe pas, le site est indexable. |
| `CV_ADMIN_PASSWORD` | Facultative. Mot de passe du propriétaire : télécharge le CV sans autre étape. Au moins 16 caractères, sinon le téléchargement par mot de passe reste désactivé (le journal du serveur l'indique). |
| `CV_LINK_SECRET` | Facultative. Secret (au moins 32 caractères, p. ex. `openssl rand -base64 48`) qui signe les liens envoyés par e-mail. Le changer invalide tous les liens déjà envoyés. |
| `RESEND_API_KEY` · `CV_MAIL_FROM` | Facultatives. Clé d'API [Resend](https://resend.com) et expéditeur vérifié (p. ex. `Samuele Cieri <cv@domaine.fr>`). À fournir avec `CV_LINK_SECRET` : s'il en manque une des trois, les liens par e-mail restent désactivés. |
| `CV_NOTIFY_EMAIL` | Facultative. Adresse qui reçoit un avis à chaque demande de CV, avec l'e-mail du demandeur. |
| `CV_EMAIL` · `CV_PHONE` | Facultatives. Coordonnées imprimées uniquement dans le PDF : c'est pour elles que le CV n'est pas public, et elles ne sont pas dans le dépôt. |

Les variables du CV sont lues par la route `/api/cv` au démarrage du serveur, pas au build : les pages statiques ne les contiennent jamais. Sans aucune d'elles, le site fonctionne et le formulaire répond « indisponible ».

En local, vous pouvez créer un fichier `.env.local`, déjà ignoré par Git :

```bash
SITE_URL=https://www.example.com
GOOGLE_SITE_VERIFICATION=votre-jeton
```

## Vues et URL

| # | Vue (ID) | EN | IT | FR | DE | Contenu |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | Index (`hero`) | `/en` | `/it` | `/fr` | `/de` | Nom en très grand format, rôle, présentation, un paragraphe citant employeur, études, stack et projets (les faits qu'un moteur de recherche doit lire dès la page d'accueil) et invitation à explorer. |
| 02 | Identité (`identity`) | `/en/identity` | `/it/identita` | `/fr/identite` | `/de/identitaet` | Un titre qui est la première phrase de la déclaration d'intention (le reste en est le sous-titre), quatre principes d'ingénierie et contacts (GitHub, LinkedIn, Instagram). |
| 03 | Exécution (`timeline`) | `/en/execution` | `/it/esecuzione` | `/fr/execution` | `/de/ausfuehrung` | Frise chronologique à trois couloirs (industrie, parcours universitaire et étude en autonomie du Data Engineering) sur un axe temporel commun, avec un compteur d'uptime en temps réel et des phases accompagnées de leur stack. |
| 04 | Systèmes (`projects`) | `/en/systems` | `/it/sistemi` | `/fr/systemes` | `/de/systeme` | Projets présentés en accordéon, tous fermés à l'ouverture de la vue : résumé, choix d'ingénierie, architecture en couches, lien avec la Data Engineering et lien vers le dépôt (ou vers les contacts si le code est privé). Actuellement : yourFinance (privé) et aria-er (public). |
| 05 | Optimisation (`discipline`) | `/en/optimization` | `/it/ottimizzazione` | `/fr/optimisation` | `/de/optimierung` | Entraînement et musique au-delà du code : force et explosivité (méthode, mesures, programme hebdomadaire) et production de musique et de vidéo (guitare acoustique, logiciels, étapes). |

Chaque URL est pré-rendue avec son propre contenu. Une adresse qui ne correspond à aucune vue affiche une page 404 localisée et non indexable.

Sous la vue Systèmes, il y a une page de plus pour les projets qui ont une étude de cas : `/en/systems/yourfinance`, `/it/sistemi/yourfinance`, `/fr/systemes/yourfinance`, `/de/systeme/yourfinance`. C'est un document avec de vrais liens, pas une sixième vue : on y arrive depuis le projet ouvert dans l'accordéon, et en sortir est une navigation. Le lien de retour vers la vue des projets se trouve dans l'en-tête, qui ne défile pas avec la page, ainsi qu'à la fin.

## Navigation et interactions

- **Liens en bas de page** (`01`–`05`) : ce sont de vrais `<a href>`, donc le clic du milieu, « ouvrir dans un nouvel onglet » et les robots d'indexation fonctionnent. Le clic principal change la vue sur place. À côté de l'entrée active figure le mot courant pour cette vue (« Exécution · Expérience »), qui fait aussi partie du nom accessible de chaque lien.
- **Projets depuis l'accueil** : dans le paragraphe de l'accueil, les noms des projets sont des liens (`ProjectLink`, dérivés de `shared.projects` avec `splitByNames`). Ils mènent à l'étude de cas quand elle existe, sinon à la vue des projets avec le panneau déjà ouvert : l'adresse est `/fr/systemes#<id>`, qui fonctionne aussi collée ou partagée. Sans fragment, tous les projets démarrent fermés.
- **Clavier** : `1`–`5` accèdent directement à une vue, `←` et `→` les parcourent en boucle. Les touches sont ignorées si une touche de modification est enfoncée ou si le focus est dans un champ de saisie.
- **Tactile** : un balayage horizontal (plus de 70 px et majoritairement horizontal) passe à la vue précédente ou suivante.
- **Trackpad** : le défilement latéral à deux doigts ne fait ni reculer ni avancer dans l'historique (`overscroll-behavior: none` sur la racine), car il se déclenchait par erreur pendant le défilement d'une vue. Valable dans Chromium et Firefox ; Safari gère ce geste lui-même et peut ignorer la règle. Les boutons du navigateur et les raccourcis clavier ne changent pas.
- **Flèches et compteur** dans le pied de page, sur les écrans moyens et grands.
- **Indicateur de défilement** : les barres de défilement sont masquées ; une vue plus haute que l'écran affiche donc sur le bord droit une fine ligne dont le curseur suit le défilement. Il n'apparaît que s'il y a du contenu sous la ligne de flottaison (mesuré avec `ResizeObserver` ; géométrie dans `lib/scroll.ts`) et il est masqué aux technologies d'assistance.
- **Historique** : chaque changement de vue appelle `pushState`, donc les boutons précédent et suivant du navigateur fonctionnent. Le titre du document suit la vue active.
- **Langue** : l'en-tête n'affiche que la langue active ; le bouton ouvre un menu animé (`listbox`) listant chaque langue par son nom natif, utilisable à la souris, au toucher et au clavier (flèches, Début/Fin, Entrée/Espace, Échap, clic à l'extérieur ; le focus revient au bouton). Choisir une langue remplace l'URL par le slug traduit (`replaceState`), met à jour `lang` et le titre, et enregistre le cookie `NEXT_LOCALE` pour un an, sans navigation. Le canvas et la vue active restent intacts.
- **Détection de la langue** : sur `/` et sur les chemins sans préfixe, `proxy.ts` (le middleware next-intl) choisit la langue d'après le cookie `NEXT_LOCALE` ou l'en-tête `Accept-Language`. La langue par défaut est l'anglais et le préfixe est toujours présent.
- **Thème** : le bouton alterne Auto → Clair → Sombre ; l'icône est respectivement à moitié pleine, vide ou pleine.
- **Scène** : le pointeur déplace légèrement la caméra et « réchauffe » les nœuds voisins. L'effet s'estompe lorsque le pointeur quitte la fenêtre.

## Architecture

### Rendu et routage

- Le layout et les pages utilisent `generateStaticParams` : toutes les combinaisons langue × vue sont générées au build.
- `app/[locale]/page.tsx` (index) et `app/[locale]/[view]/page.tsx` (vues internes) rendent tous deux `components/seo/PortfolioPage.tsx`, un Server Component qui injecte le JSON-LD et démarre l'application sur la vue demandée.
- `lib/routes.ts` est la source unique des langues, des ID, des slugs localisés et des conversions URL ↔ vue. Il ne dépend ni de Next ni de next-intl : la suite Playwright importe le même module au lieu d'en garder une copie.
- Toutes les langues sont envoyées au client (`getPortfolioBundle`) : le changement de langue ne nécessite donc aucune navigation.
- Les textes des deux pages d'erreur se trouvent dans `data/errors.json` et se lisent via `lib/errorCopy.ts` : les pages d'erreur sont des composants client, et les lire depuis le module de contenu envoyait au navigateur le schéma zod et les quatre fichiers de langue (environ 100 Ko compressés sur chaque page). Un test échoue si un composant client importe à l'exécution `lib/portfolio.ts`, `lib/content/*` ou `zod`.

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
- La grille est envoyée au GPU une seule fois (`lib/sceneField.ts`). La hauteur de chaque point, l'onde autour du pointeur, les paquets et la couleur sont calculés par le vertex shader (`components/scene/fieldShader.ts`) ; à chaque image, `useFrame` interpole les paramètres et transmet au shader une douzaine de nombres, quel que soit le nombre de points. Les phases de l'onde et du flux arrivent déjà ramenées dans leur période, car les nombres du GPU sont sur 32 bits.
- Chaque vue possède un mode dans `components/scene/modes.ts` (amplitude, fréquence, vitesse, flux, rayon et force du pointeur, présence, position de la caméra). Lors d'un changement de vue, les paramètres évoluent progressivement vers les nouvelles valeurs.
- `PerformanceMonitor` ramène le device pixel ratio à 1 lorsque la fréquence d'images baisse et le remonte jusqu'à 1,75 lorsqu'elle s'améliore.
- Avec `prefers-reduced-motion: reduce`, le canvas passe en `frameloop="demand"` et ne se redessine que lorsque la vue ou le thème change.
- La palette suit le thème résolu (clair ou sombre) et porte aussi la taille des points : en thème clair le point est plus foncé et environ 25 % plus grand, car des points sombres sur fond clair paraissent plus fins que des points clairs sur fond sombre à contraste égal. Sur les vues internes, où le champ est atténué pour laisser lire le texte, le thème clair en conserve davantage (`presenceScale`), sans quoi il disparaîtrait presque sur le papier crème.

### Animations

- Au premier affichage, les entrées sont en CSS pur (`.intro-line` et `.intro-fade` sous `html:not([data-booted])`). Le contenu ne reste donc jamais masqué en attendant l'hydratation, et le titre de l'index, élément LCP, commence à s'afficher immédiatement.
- Au premier changement de vue ou de langue, `markBooted()` passe la main à Framer Motion.
- `MotionConfig reducedMotion="user"` respecte les préférences du système.

### Thème et typographie

- Tokens CSS dans `app/globals.css` (`--paper`, `--ink`, `--muted`, `--line`, `--accent`), redéfinis sous `.dark` et exposés à Tailwind v4 via `@theme inline`.
- Le thème clair est un papier crème (`#ede7db`), pas un blanc d'écran : moins éblouissant, et le champ de points derrière le contenu reste lisible.
- `lib/theme.ts` répète papier et encre pour ce qui ne peut pas lire les custom properties (scène WebGL, `theme-color`, manifest, images Open Graph). `lib/theme.test.ts` échoue si CSS et TypeScript divergent, si le texte passe sous les contrastes AA/AAA ou si les points de la scène deviennent invisibles ou plus forts que le texte.
- Utilitaires personnalisés : `px-frame`, `no-scrollbar`, `fade-edges`, `link-underline`, `bg-dashed`.
- Polices chargées avec `next/font` et `display: swap` : Geist pour le texte, Geist Mono pour les étiquettes, Instrument Serif en italique pour les mots mis en valeur.

### CV sur demande

- `app/api/cv/route.ts` est la seule partie rendue à chaque requête : tout le reste reste prérendu. C'est un adaptateur mince : il lit la configuration, appelle `lib/cv/service.ts` et traduit le résultat en réponse HTTP.
- `lib/cv/service.ts` contient les deux règles, sans HTTP ni PDF : bon mot de passe → PDF ; e-mail valide → lien signé envoyé à cette adresse (et avis au propriétaire). Un champ caché (honeypot) arrête les robots sans le leur faire savoir.
- `lib/cv/token.ts` : le lien transporte e-mail, langue et expiration (24 heures, `lib/cv/common.ts`), signés en HMAC-SHA256. Aucune base de données n'est nécessaire, et un lien modifié ou expiré est refusé. Les mots de passe sont comparés en temps constant.
- `lib/cv/document.ts` construit le CV en données pures à partir de `data/shared.json` et de la langue choisie ; `lib/cv/pdf.ts` le met en page en A4 avec les polices standard (aucun fichier de police à distribuer). Les textes du PDF et de l'e-mail sont dans `data/cv.json`, hors des fichiers de langue envoyés au navigateur.
- Dans le formulaire, le champ du mot de passe a un bouton pour l'afficher ou le masquer : la comparaison est exacte, donc une espace collée par erreur le fait refuser. Changer de méthode le masque à nouveau.
- Le formulaire n'utilise pas la validation du navigateur (`noValidate`) : son message générique est dans la langue du navigateur, pas dans celle de la page. `checkCvInput` (`lib/cv/common.ts`) vérifie le champ avant l'envoi et la page dit ce qui manque avec ses propres mots (adresse absente, adresse qui ne ressemble pas à un e-mail, mot de passe absent), marque le champ avec `aria-invalid` et y ramène le focus.
- Le CV ajoute ce que le site ne montre pas, à partir de `data/cv-profile.json` (`lib/cv/profile.ts`) : compétences regroupées, langues parlées avec leur niveau, certifications et profils à citer. Les sections se suivent ainsi : compétences, expérience, formation, certifications, projets, langues ; le consentement au traitement des données ferme la page. Il reste sur une colonne et sans image, pour que les logiciels de tri des candidatures (ATS) le lisent dans l'ordre : la seule couleur est celle des titres de section. Les noms des cours sont traduits via `terms` dans `data/cv.json` ; un test échoue si une technologie du travail ou des projets manque aux compétences.
- `lib/cv/mailer.ts` est le port de sortie pour l'e-mail, avec un adaptateur pour l'API REST de Resend via `fetch` (sans SDK). Un envoi par SMS serait un autre adaptateur.
- Limites connues : pas de limite de requêtes par adresse, car il faudrait un état partagé ; sur Vercel, on configure une règle de rate limiting du Firewall sur `/api/cv`. Le mot de passe du propriétaire doit être long justement parce que les tentatives ne sont pas comptées.

### Études de cas

- `app/[locale]/[view]/[study]/page.tsx` pré-rend la page uniquement sous le slug de la vue des projets et uniquement pour les identifiants de `CASE_STUDY_IDS` (`lib/routes.ts`) ; le reste est une 404.
- `components/case-study/CaseStudyPage.tsx` est un composant serveur : tout le texte est dans le HTML et la page ne charge pas la bibliothèque d'animation. Il utilise les primitives de texte de `components/ui/text.tsx`, partagées avec les vues.
- Les contenus sont dans `data/case-studies/<id>.json` (structure et textes dans les quatre langues), hors des fichiers de langue envoyés au navigateur. `lib/caseStudy.ts` les valide avec zod et des contrôles croisés : un identifiant sans texte dans une langue, un `alt` vide ou une description de plus de 160 caractères font échouer le build.
- Les captures d'écran sont des imports statiques (`lib/caseStudyImages.ts`) servis par `next/image`. Elles doivent provenir **uniquement du profil de démonstration**.
- Chaque page a son canonical, ses hreflang, son image Open Graph, son entrée dans le sitemap et un JSON-LD `TechArticle` avec `BreadcrumbList`. Pour un projet privé, `codeRepository` n'est jamais émis, et un test E2E vérifie que la page ne contient aucun lien vers le dépôt.

## SEO

- **Métadonnées par vue** (`lib/seo.ts`) : title, description, canonical, hreflang (`en`, `it`, `fr`, `de`, `x-default`), Open Graph de type `profile` et Twitter card `summary_large_image`. Pour l'index, `x-default` pointe vers `/`, qui détecte la langue ; pour les autres vues, il pointe vers la version anglaise.
- **Images Open Graph** en 1200 × 630, générées au build pour chaque langue et chaque vue (`opengraph-image.tsx`, `lib/og.tsx`), avec l'icône de l'ancien site. L'icône est une copie de 56 px (`lib/og-icon.png`, environ 3 Ko), la taille à laquelle elle est dessinée : il faut la régénérer à partir de `app/icon.png` si l'icône change.
- **JSON-LD** `@graph` (`lib/structuredData.ts`) : `WebSite`, `Person` (avec `alternateName`, `address`, `knowsAbout` et `sameAs` ; `url` est la racine du site dans toutes les langues), `ProfilePage`, `BreadcrumbList` sur les vues internes et `ItemList` de `SoftwareSourceCode` sur la vue des projets.
- **`sitemap.xml`** avec alternatives hreflang, **`robots.txt`**, **`manifest.webmanifest`**, ainsi qu'un favicon et des icônes dérivés de l'icône de l'ancien site.
- **Indexation maîtrisée** : seule la production est indexable (voir [Variables d'environnement](#variables-denvironnement)). La balise `robots` est définie par page, pas dans le layout : la 404 ne porte donc que le `noindex` de Next.
- **Contenu des projets toujours dans le HTML** : les panneaux fermés de l'accordéon restent montés (hauteur nulle, `inert`), donc les textes et le lien vers le dépôt de chaque projet sont dans la page prérendue sans aucune interaction.
- **Structure des pages** : un seul `h1` par URL, de vrais liens dans la navigation, `rel="me"` sur les profils sociaux, en-tête `X-Powered-By` désactivé.
- **Redirections 301** depuis les anciennes URL PHP :

| Ancienne URL | Destination |
| --- | --- |
| `/index.php` | `/` |
| `/error` | `/` |
| `/projDev/*` | `/it/sistemi` |
| `/projProd/*` | `/it/sistemi` |

- **Un seul hôte indexé** : les autres alias `*.vercel.app` du projet (`cieri`, `samuelecieri`) répondent par une redirection permanente (308) vers le même chemin sur `SITE_URL`. La balise canonical seule ne suffisait pas : Google avait indexé un alias. Les hôtes sont listés un par un dans `lib/aliases.ts`, pour ne jamais toucher les aperçus, localhost ni le serveur de test. Un nouvel alias ajouté sur Vercel doit aussi être ajouté là.

### Google Search Console

1. Ajoutez une propriété de type « Préfixe d'URL » et choisissez la validation par balise HTML.
2. Définissez `GOOGLE_SITE_VERIFICATION` sur Vercel (jeton ou balise entière) et **redéployez** : la variable est lue au build. Vérifiez le résultat avec `curl -s https://<site>/en | grep google-site-verification`, puis cliquez sur « Valider ».
3. Dans « Sitemaps », envoyez `sitemap.xml`. Sur une propriété neuve, l'état « Impossible de récupérer » avec « Dernière lecture » vide signifie seulement que Google ne l'a pas encore lu : cela peut prendre quelques jours.
4. Les demandes d'indexation manuelles sont limitées à quelques-unes par jour. Réservez-les aux URL avec la langue (`/en`, `/it`, `/en/systems`, …) : la racine `/` répond par une redirection et n'est jamais indexée comme page.

Avec un domaine personnalisé, préférez une propriété de type « Domaine », validée par DNS.

## Accessibilité

- Navigation par de vrais liens, avec `aria-current="page"` sur la vue active ; chaque vue est une `section` dotée d'un `aria-label`.
- L'accordéon des projets utilise `aria-expanded` et `aria-controls` ; les panneaux fermés sont `inert`, hors du focus et des technologies d'assistance ; les boutons et contrôles ont des libellés localisés.
- Focus toujours visible (`:focus-visible`), attribut `lang` mis à jour lors du changement de langue ; le menu des langues expose `aria-haspopup="listbox"`, `aria-expanded` et `aria-selected`, et chaque option porte son propre `lang`.
- Éléments décoratifs (canvas, flèches, index) marqués `aria-hidden`.
- Réduction des animations respectée à trois niveaux : intro CSS, Framer Motion et boucle de rendu de la scène.

## Sélection du texte

La sélection n'est désactivée que sur les éléments d'interface : navigation, boutons, en-tête et pied de page, étiquettes, index, grands titres et canvas. À ces endroits, une sélection est toujours accidentelle (double clic, balayage). Les textes, descriptions et contacts restent sélectionnables et `Cmd/Ctrl+A` n'est pas intercepté : les bloquer ne protégerait pas le contenu (il figure dans le HTML et dans les résultats de recherche) et nuirait à l'accessibilité comme à l'ergonomie.

## Données et contenus

Les contenus se trouvent dans [`data/shared.json`](data/shared.json) et dans un fichier par langue sous [`data/locales/`](data/locales/), chargés par `lib/portfolio.ts`.

```
data/shared.json        données indépendantes de la langue
├── name, handle, alternateNames, address
├── contacts[]          id, label, handle, url
├── timeline.threads[]  couloirs : id, kind (work | education), entity, segments[], phases
├── projects[]          id, name, source, stack, layers
└── discipline          biological (mesures, séances) · acoustic (formats, pipeline)
data/locales/<langue>.json   en · it · fr · de
├── ui                  messages next-intl : meta (SEO), notFound, nav, navPlain, theme, locale, shell
├── hero
├── identity
├── timeline
├── projects            items[id] : summary, bridge, highlights, layers
└── discipline
```

- `shared.json` contient les données indépendantes de la langue (liens, dates, stack, mesures) ; `locales/<langue>.json` contient les textes.
- Le bloc `ui` de chaque langue sert de messages next-intl et contient aussi le title et la description SEO de chaque vue (`ui.meta.views`).
- Les textes sont reliés aux données partagées par `id` (par exemple `shared.projects[].id` → `projects.items[id]` de chaque langue).
- Les champs `*Emphasis` désignent le mot affiché en serif italique et doivent figurer dans le texte auquel ils se rapportent.
- Les dates sont au format ISO `YYYY-MM-DD` et s'affichent sous la forme `DD.MM.YYYY`.
- Les contenus passent trois contrôles avant le prérendu, et toute erreur fait échouer le build :
  1. **types** : chaque langue est affectée à la forme de `en.json`, donc une clé manquante ou renommée fait échouer `npm run typecheck` ;
  2. **schéma** (`lib/content/schema.ts`) : `shared.json` est validé avec zod (enums, dates ISO existantes, segments qui finissent après leur début, URL, union `source`) ; les types du domaine sont dérivés du schéma ;
  3. **contrôles croisés** (`lib/content/validate.ts`) : chaque id de couloir, phase, projet et couche a ses textes dans chaque langue, chaque langue a son libellé dans `ui.locale` et chaque `*Emphasis` apparaît dans son texte. Tous les problèmes sont listés ensemble, avec leur chemin.

`alternateNames` (autres graphies et identifiants sous lesquels la même personne est recherchée) et `address` (`locality` et `country`, code ISO à deux lettres) alimentent `alternateName` et `address` du `Person` dans le JSON-LD ; un code pays invalide fait échouer le build.

Champs acceptant `null` (affichés `—`) : `discipline.biological.heightCm`, `discipline.biological.weightKg`. `timeline.threads[].entity` accepte aussi `null` : le couloir affiche alors seulement son `entityLabel` (ex. « Étude en autonomie ») et reste hors de `worksFor` / `alumniOf`. `projects[].source` vaut `{ "visibility": "public", "url": "…" }` (lien vers le dépôt, publié aussi comme `codeRepository` dans le JSON-LD) ou `{ "visibility": "private" }` : le code n'est pas lié et le projet renvoie à la vue Identité, où demander une démo. Une visibilité inconnue ou un projet public sans `url` fait échouer le build.

### Couloirs de la frise

Un couloir est une suite de `segments`, pas un intervalle unique : `{ "start": "YYYY-MM-DD", "end": null }`, avec `end: null` pour le segment encore en cours. Plusieurs segments laissent un vide sur l'axe, et les périodes d'activité sont aussi écrites en toutes lettres dans le détail du couloir. Les couloirs et les colonnes découlent du tableau : en ajouter un troisième ne demande aucune modification de code.

`kind` vaut `work` ou `education` et pilote le JSON-LD : les couloirs `work` alimentent `worksFor` et `knowsAbout`, ceux `education` alimentent `alumniOf`. Toute autre valeur fait échouer le build. L'uptime en haut suit le premier couloir `work` et ne additionne que le temps actif, interruptions exclues.

Chaque phase accepte un `start` facultatif. Sans lui, les phases sont réparties sur le temps actif du couloir et enjambent les vides ; avec lui, la phase est ancrée à cette date. Quand les étiquettes des phases n'ont pas la place sur l'axe (couloir récent : moins de 12 % de l'axe entre une étiquette et la suivante, ou le bord), la ligne reste vide et les phases ne se lisent que dans le détail : c'est `phaseMarksFit`, dans `lib/timeline.ts`, qui en décide.

## Étendre le projet

### Ajouter un projet

1. Ajoutez une entrée à `shared.projects` avec `id`, `name`, `source` (public avec `url`, ou privé), `stack` et `layers` (`id`, `tech`). `version` est facultatif (`0.9.0`, sans `v`) : il apparaît dans le panneau du projet, dans le CV et dans le JSON-LD, et pour un projet public il mène à la page du tag sur GitHub. Avec `released` (la date de publication), il est tenu à jour par un workflow : voir [Versions des projets](#versions-des-projets).
2. Dans **chaque** langue, ajoutez `projects.items[<id>]` avec `summary`, `bridge`, `highlights` (liste des choix d'ingénierie) et `layers` (une description par `id` de couche).
3. Si nécessaire, mettez à jour le title et la description dans `ui.meta.views.projects`.

La vue et le JSON-LD `ItemList` se mettent à jour automatiquement.

### Ajouter une étude de cas

1. Ajoutez l'identifiant du projet à `CASE_STUDY_IDS` dans `lib/routes.ts`.
2. Créez `data/case-studies/<id>.json` sur le modèle de `yourfinance.json` et importez-le dans `lib/caseStudy.ts`.
3. Placez les captures d'écran dans `data/case-studies/<id>/` et importez-les dans `lib/caseStudyImages.ts`, avec les mêmes clés que `screens`.

Le lien dans l'accordéon, le sitemap, les métadonnées et l'image Open Graph suivent d'eux-mêmes ; TypeScript signale ce qu'il reste à modifier.

### Versions des projets

`version` et `released` de chaque projet dans `data/shared.json` suivent les versions publiées par les projets eux-mêmes, sans les saisir à la main.

- `.github/workflows/versions.yml` s'exécute chaque jour, et à la demande depuis l'onglet Actions. `scripts/sync-versions.mjs` lit la dernière version publiée de chaque projet qui en déclare une et, si elle est plus récente, réécrit les deux lignes ; la logique est dans `lib/versions.ts`, pure et testée.
- Le workflow n'écrit jamais sur `development` : il ouvre une pull request depuis la branche `features/versioni-dei-progetti` (ou met à jour celle déjà ouverte), les contrôles s'exécutent comme pour les autres et la fusion reste une décision.
- Les préversions comptent ; les brouillons non. On ne revient jamais en arrière : une version égale ou plus ancienne est ignorée.
- Si un contrôle échoue dans cette pull request, un texte dépend de la version (par exemple la fiche d'aria-er, qui jusqu'à la 1.0.0 doit dire ce qui manque) : on corrige le texte dans cette branche, puis on fusionne.
- Un projet public est cherché dans le dépôt de son `source.url`. Un projet privé n'a pas d'adresse dans les données, volontairement : son dépôt vient du secret `VERSION_SOURCES` et n'apparaît ni dans les fichiers ni dans les journaux ; un test échoue si son nom se retrouve dans un fichier.

Configuration, une seule fois, dans **Settings → Secrets and variables → Actions** :

| Secret | Valeur |
| --- | --- |
| `VERSIONS_TOKEN` | Jeton personnel *fine-grained* limité à **ce** dépôt. Autorisations : **Contents** et **Pull requests** en lecture et écriture. |
| `VERSION_SOURCES_TOKEN` | Uniquement pour les projets privés : un second jeton *fine-grained*, limité à leurs dépôts, avec **Contents** en lecture seule. Deux jetons parce qu'un jeton *fine-grained* donne les mêmes autorisations sur tous les dépôts qu'il inclut : un seul aurait pu écrire aussi dans les projets privés. |
| `VERSION_SOURCES` | Uniquement pour les projets privés : `{"<id du projet>":"propriétaire/dépôt"}`. |

Il faut un jeton personnel et non celui du workflow : une pull request ouverte avec `GITHUB_TOKEN` ne déclenche aucun autre workflow, donc les contrôles obligatoires ne s'exécuteraient jamais. Le jeton expire : le workflow échoue alors avec un message qui le dit, et il faut le régénérer. Sans le secret, le workflow s'arrête aussitôt avec une erreur claire.

### Ajouter un contact

Ajoutez `{ id, label, handle, url }` à `shared.contacts` : le contact apparaît dans la vue Identity et dans le champ `sameAs` du JSON-LD.

### Ajouter une vue

1. `lib/routes.ts` : ajoutez l'ID à `VIEW_IDS` et son slug pour chaque langue dans `VIEW_SLUGS`.
2. `components/scene/modes.ts` : ajoutez le mode de la scène dans `SCENE_MODES`.
3. `components/views/` : créez le composant et enregistrez-le dans `RENDER` de `components/shell/AppShell.tsx`.
4. `data/locales/*.json` : ajoutez `ui.nav.<id>`, `ui.meta.views.<id>` et les textes de la vue dans chaque langue.

Les pages, les images Open Graph, le sitemap, la navigation et les raccourcis numériques découlent tous de `VIEW_IDS` (les raccourcis couvrent jusqu'à 9 vues).

### Ajouter une langue

1. `lib/routes.ts` : ajoutez le code à `LOCALES`, son nom natif dans `LOCALE_NAMES` et les slugs dans `VIEW_SLUGS`. Le menu des langues est généré à partir d'ici. `i18n/routing.ts`, `viewFromPath` et la suite E2E lisent ici et n'ont pas besoin d'être modifiés.
2. `lib/seo.ts` : ajoutez la locale Open Graph dans `OG_LOCALE` (par exemple `pt: 'pt_PT'`).
3. `data/locales/<code>.json` : créez-le avec la même structure que `en.json`, importez-le dans `lib/portfolio.ts` et `e2e/content.ts`, et ajoutez le libellé de la nouvelle langue dans `ui.locale` de chaque langue.

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
│   │       ├── opengraph-image.tsx  image Open Graph par vue
│   │       └── [study]/             étude de cas d'un projet (page + image Open Graph)
│   ├── api/cv/route.ts              téléchargement du CV (seule route dynamique)
│   ├── globals.css                  tokens de couleur, utilitaires Tailwind, intro CSS
│   ├── sitemap.ts · robots.ts · manifest.ts
│   └── favicon.ico · icon.png · apple-icon.png
├── components/
│   ├── motion/       ViewFrame (conteneur de vue), Reveal (variantes, line mask, intro)
│   ├── providers/    ThemeProvider (next-themes)
│   ├── scene/        SceneLayer → DataField (Canvas, lazy) → DataGrid (useFrame) · fieldShader · modes
│   ├── case-study/   CaseStudyPage (composant serveur), SceneMode
│   ├── seo/          PortfolioPage (JSON-LD + application)
│   ├── shell/        AppRoot, AppShell, NavBar, ViewLink, LocaleSwitch, ThemeToggle,
│   │                 useViewNavigation, useViewUrlSync
│   ├── ui/           text (Meta, Emphasis : primitives sans code client)
│   └── views/        HeroView, IdentityView, TimelineView, ProjectsView, DisciplineView, CvRequest, atoms
├── data/
│   ├── shared.json                  données indépendantes de la langue
│   ├── cv.json                      textes du PDF et de l'e-mail du CV (serveur uniquement)
│   ├── cv-profile.json              compétences, langues et certifications du CV (serveur uniquement)
│   ├── case-studies/                un JSON par étude de cas + un dossier avec ses captures d'écran (serveur uniquement)
│   └── locales/                     en.json · it.json · fr.json · de.json : textes, interface, métadonnées SEO
├── i18n/             routing.ts (langues) · request.ts (messages next-intl)
├── lib/              routes, views, portfolio, timeline, scroll, seo, site, verification, errorCopy, structuredData, theme, og, caseStudy, caseStudyImages, sceneField, projects, versions, format, hooks, cn
│   ├── content/      schema (zod) · validate (contrôles croisés)
│   └── cv/           service, token, config, document, pdf, mailer, copy, profile, common (CV sur demande)
├── store/            viewStore (par instance) · useSceneStore (scène, transitoire)
├── e2e/              suite Playwright · helpers.ts (langues, vues, attentes)
├── .github/workflows/ci.yml   lint, typecheck, build et tests sur chaque PR
├── .github/workflows/versions.yml   versions des projets alignées sur leurs publications (PR automatique)
├── scripts/          sync-versions.mjs (utilisé par le workflow des versions)
├── proxy.ts          détection de la langue (middleware next-intl)
├── next.config.ts    plugin next-intl, redirections 301, origines autorisées en développement
├── eslint.config.mjs · postcss.config.mjs · tsconfig.json · playwright.config.ts
└── package.json
```

## Qualité du code

- TypeScript en mode `strict`, avec l'alias `@/*` pointant vers la racine du projet.
- Prettier pour TypeScript, JSON, CSS et YAML (le Markdown est exclu pour garder l'alignement des tableaux et arbres). Les commits de pur formatage vont dans `.git-blame-ignore-revs` ; pour l'utiliser en local : `git config blame.ignoreRevsFile .git-blame-ignore-revs`.
- ESLint avec les configurations `core-web-vitals` et `typescript` de Next.js.
- `npm run typecheck` exécute d'abord `next typegen`, qui génère les types globaux des routes (`PageProps`, `LayoutProps`).
- Tests unitaires Vitest à côté des modules (`lib/**/*.test.ts`) : slugs et URL, arithmétique de la timeline (segments, interruptions, phases, axe), formatage, schéma et contrôles des contenus, fichiers réels compris.
- Tests end-to-end dans `e2e/` avec Playwright, exécutés contre le build de production sur Chromium, WebKit et un profil mobile. Ils couvrent les URL et métadonnées de chaque langue, la navigation et l'historique, le changement de langue, le SEO, les en-têtes de sécurité, l'accessibilité (axe) et la résistance du site à une panne WebGL.
- CI dans `.github/workflows/ci.yml` : formatage, lint, typecheck, tests unitaires, build et tests end-to-end sur chaque pull request et à chaque push sur `development`. Ses trois jobs (celui-ci, les tests end-to-end et le budget de performance) sont des contrôles obligatoires pour la fusion (voir [Méthode de travail](#méthode-de-travail)).
- **Régression visuelle** (`e2e/visual.spec.ts`) : neuf captures de référence dans `e2e/__screenshots__/` (les cinq vues en thème clair, deux en thème sombre, deux sur téléphone) comparées à chaque exécution. Pour être reproductibles, elles figent l'horloge et masquent la scène WebGL. Elles valent pour Chromium sous Linux, donc pour la CI : en local sous macOS les tests sont ignorés, car ils échoueraient sur le seul anticrénelage. Après un changement visuel voulu, la CI échoue, régénère les références sur le même runner et les publie dans l'artefact `visual-references` : `gh run download <id> -n visual-references -D e2e/__screenshots__`, on vérifie les images et on les committe.
- **Budget de performance** (`lighthouserc.json`) : un troisième job de la CI lance Lighthouse trois fois, en émulation mobile, sur l'accueil, la timeline et les projets du build de production, et échoue si la médiane sort des seuils : accessibilité et SEO à 100, bonnes pratiques ≥ 95, LCP ≤ 4 s, CLS ≤ 0,02, poids de page ≤ 700 Ko. Le score de performance (≥ 80) et le TBT (≤ 500 ms) ne donnent lieu qu'à un avertissement : ils dépendent de la puissance du runner, qui change d'une exécution à l'autre (TBT de 360 à 750 ms sur le même code), et en erreur ils feraient échouer la CI au hasard. Les seuils reflètent l'état actuel sur les runners de la CI, plus lents qu'un portable et sans GPU (la scène WebGL y coûte davantage), avec une petite marge : ils servent à bloquer les régressions et doivent être resserrés à chaque amélioration. En local : `npm run build && npx @lhci/cli@0.15.1 autorun`.
- Dependabot (`.github/dependabot.yml`) ouvre chaque semaine une PR groupée vers `development` pour les dépendances npm et une pour les GitHub Actions. Les versions majeures d’`eslint` et de `typescript` sont ignorées tant que `eslint-config-next` ne les prend pas en charge.
- Les GitHub Actions sont épinglées au SHA du commit, avec la version en commentaire (`uses: actions/checkout@<sha> # v7.0.1`) : un tag peut être déplacé, pas un SHA. Dependabot lit le commentaire et continue de proposer les mises à jour ; `lib/ci.test.ts` échoue si un workflow revient à un tag ou à une branche.
- `.mailmap` regroupe sous une seule identité les premiers commits signés avec l'email dérivé du nom d'hôte, sans réécrire l'historique.
- Les source maps sont publiées en production aussi (`productionBrowserSourceMaps`) : le dépôt est public, elles n'exposent donc rien de nouveau et gardent lisibles les traces d'erreur et les audits de performance. Le navigateur ne les télécharge qu'avec les outils de développement ouverts.
- `reactStrictMode` est activé, et l'indicateur de développement de Next est désactivé car il recouvrirait la navigation.

## Méthode de travail

`development` est la branche de production et elle est protégée : on n'y arrive que par une pull request.

1. Une branche par tâche, créée depuis `development` : `features/<nom-explicite>`.
2. Avant le push, en local : `npm run format:check && npm run lint && npm run typecheck && npm run test:unit && npm test`.
3. Push de la branche et pull request vers `development`. La PR déclenche la CI (les mêmes commandes) et un déploiement de prévisualisation sur Vercel, non indexable.
4. La fusion n'est possible que si les trois contrôles de la CI passent, et elle constitue le déploiement en production. On utilise « Create a merge commit », afin que l'historique conserve les commits de la branche.
5. La branche est supprimée après la fusion.

Les issues et les pull requests sont rédigées en anglais ; les messages de commit en italien.

## Déploiement sur Vercel

1. Sur vercel.com → **Add New → Project** → importez `CieriS/portfolio`. Next.js est détecté automatiquement (build `npm run build`, installation `npm install`).
2. **Settings → Git → Production Branch** : `development`.
3. Variables facultatives dans **Settings → Environment Variables** : `GOOGLE_SITE_VERIFICATION` et `SITE_URL` (uniquement avec un domaine personnalisé). Pour le CV : `CV_ADMIN_PASSWORD`, `CV_LINK_SECRET`, `RESEND_API_KEY`, `CV_MAIL_FROM`, `CV_NOTIFY_EMAIL`, `CV_EMAIL`, `CV_PHONE` (voir [Variables d'environnement](#variables-denvironnement)).
4. Le site est en ligne sur `https://<projet>.vercel.app`. Chaque fusion dans `development` est déployée automatiquement ; les autres branches et les PR génèrent des prévisualisations non indexables.

Sinon, depuis le terminal : `npx vercel login`, puis `npx vercel` (prévisualisation) et `npx vercel --prod` (production).

### Build de production en local

```bash
npm run build
npm start
```

## Ancien site

Le portfolio était auparavant un site PHP et MySQL hébergé sur Altervista. Son code n'est plus dans ce dépôt (il reste dans l'historique git) ; il en subsiste aujourd'hui :

- les redirections 301 de ses URL principales vers les nouvelles vues (voir [SEO](#seo)) ;
- l'icône, dont dérivent le favicon et les icônes de ce site.

## Dépannage

| Problème | Solution |
| --- | --- |
| Sur un autre appareil, la page s'affiche mais ne réagit ni aux clics ni au clavier | L'hôte n'est pas dans `allowedDevOrigins` (`next.config.ts`) : ajoutez-le et relancez `npm run dev`. |
| Les canonical et le sitemap pointent vers `localhost` en production | Définissez `SITE_URL`, ou déployez sur Vercel, qui fournit `VERCEL_PROJECT_PRODUCTION_URL`. |
| Erreurs de type sur `PageProps` ou `LayoutProps` | Lancez `npm run typecheck` : `next typegen` régénère les types des routes. |
| Le build échoue après une modification des contenus | Le message liste chaque problème avec son chemin (par exemple `it.projects.items.app.layers has no copy for "api"`). `npm run test:unit` l'affiche en moins d'une seconde. |
| Un déploiement de prévisualisation n'apparaît pas sur Google | C'est voulu : seul `VERCEL_ENV=production` est indexable. |

## Contacts

- GitHub : [@CieriS](https://github.com/CieriS/)
- LinkedIn : [in/samuelecieri](https://www.linkedin.com/in/samuelecieri/)

## Licence

Le code et les contenus sont la propriété de l'auteur, tous droits réservés : voir [`LICENSE`](LICENSE).

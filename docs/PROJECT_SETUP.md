# LaMinga — Guide de démarrage du projet (v2)

Document technique interne. Cette v2 ajoute : une **décision d'architecture de rendu** tranchée, une **étape migration & redirections 301** (préservation du référencement), un **outillage scindé en « essentiel » vs « maintenance »**, et des **versions épinglées**. Le scaffolding se fait en séquentiel pour partir sur de bonnes bases ; les features suivantes pourront être parallélisées avec Conductor.

---

## Décision d'architecture (à lire avant tout)

**Rendu : statique en production + environnement SSR séparé pour la preview.** C'est la pratique de référence 2026 pour Astro + Storyblok :

- **Production = SSG (statique).** Build pré-rendu, servi en HTML pur. Rapide, sûr, idéal SEO/GEO. Utilise le **token Public**, branche `main`.
- **Preview = SSR.** Un déploiement séparé qui rend le contenu **`draft`** à la volée pour que l'éditeur visuel Storyblok montre les modifications instantanément. Utilise le **token Preview**, sur une branche dédiée (ex. `preview`), via le rendu à la demande de l'adaptateur Netlify.
- **Mise à jour du contenu** : à la publication dans Storyblok, un **webhook** appelle un **Build Hook Netlify** qui régénère le site de prod. Pas de rebuild permanent, pas de SSR en prod.

Pourquoi pas tout en SSR ? Parce qu'une vitrine n'a aucun besoin de rendu serveur permanent : le statique est plus rapide, moins cher, mieux référencé, et plus difficile à casser. Le SSR est réservé à l'usage interne de preview.

### Stack épinglée (juin 2026)

| Élément | Version cible | Note |
|---|---|---|
| Node | **22 LTS** (`>=22.12`) | requis par Astro 6 |
| Astro | **^6.0** | sorti mars 2026 ; **API CSP native**, Fonts API |
| @storyblok/astro | **^9.0** | compatible Astro 6 |
| @astrojs/netlify | compatible Astro 6 | installé via `astro add`, puis verrouillé |
| @astrojs/sitemap | compatible Astro 6 | idem |
| Gestionnaire | **pnpm** (via corepack) | |

**Le vrai épinglage = le lockfile.** Installer en versions exactes (`pnpm config set save-exact true`), committer `pnpm-lock.yaml`, fixer Node via `.nvmrc` + `engines`. Les montées de version se feront de façon contrôlée (Dependabot/Renovate), pas au hasard d'un `install`.

---

## Partie 1 — Comptes à créer (au nom de LaMinga)

Principe inchangé : **comptes créés avec un email LaMinga**, toi invité comme collaborateur ; trousseau partagé (1Password/Bitwarden) pour centraliser les accès.

### 1. Storyblok
1. Compte sur storyblok.com avec l'email LaMinga, **région EU** (RGPD).
2. Espace `LaMinga`. Plan **Community** gratuit + **1 siège** éditeur si 2 personnes éditent.
3. T'inviter : *Settings → Collaborators*.
4. **À récupérer** : **Preview token** (preview SSR) et **Public token** (prod SSG) — *Settings → Access Tokens*. Les valeurs réelles sont stockées dans le gestionnaire de mots de passe partagé (jamais dans le dépôt) et injectées via `.env` en local / variables d'environnement Netlify par contexte.
5. Le **webhook de publication** sera branché à l'étape déploiement.

### 2. GitHub
1. Compte/organisation au nom de LaMinga, **dépôt privé** `laminga-website`.
2. T'ajouter en collaborateur (droits d'écriture).
3. Activer **Dependabot** et le **secret scanning** : *Settings → Code security*.

### 3. Netlify
1. Compte Netlify (email LaMinga), plan **Free** (commercial autorisé), connecté via GitHub.
2. Prévoir **deux contextes** : *production* (branche `main`, SSG) et *branch deploy* `preview` (SSR).
3. Un **Build Hook** sera créé pour le webhook Storyblok (étape déploiement).

### 4. Nom de domaine & préparation de la migration
1. Récupérer les accès au **registrar** et à la **zone DNS** (compte LaMinga).
2. **Ne pas couper l'ancien WordPress** tant que le nouveau site n'est pas validé et les redirections en place.
3. **Inventorier les URLs existantes** dès maintenant : `ancien-site/sitemap.xml`, export WordPress, et l'export des pages indexées depuis **Google Search Console**. Cette liste servira aux redirections 301.

### 5. (Optionnel) Annexes
- **Google Search Console** (compte LaMinga) — indispensable pour suivre la migration.
- **Analytics RGPD** (Plausible/Matomo) — sans bandeau cookies lourd.

> ✅ Avant de coder : 2 tokens Storyblok, dépôt privé GitHub, Netlify lié (2 contextes prévus), accès DNS, **liste des anciennes URLs récupérée**.

---

## Partie 2 — Initialisation

**Méthode : socle en séquentiel** (Prompts 1→5, dépendants, dans un seul workspace Conductor, avec **revue du diff entre chaque** — une erreur de socle se propage). **Une fois la base saine et committée, les features (pages, blocs, déclinaisons) se parallélisent avec Conductor.**

Chaque prompt installe, configure **et** commite en commit conventionnel.

> Place d'abord ce guide dans le dépôt (`docs/PROJECT_SETUP.md`) : il sert de spec et de contexte global à l'agent.

### Prompt d'amorçage (à coller en tête de session Conductor)

Ce prompt cadre l'agent pour un scaffolding rapide **et** sûr : il borne le périmètre, impose l'ordre séquentiel et les gates, et encadre l'usage des sous-agents.

```
Tu vas initialiser le socle technique du projet LaMinga. Lis d'abord le guide complet
dans docs/PROJECT_SETUP.md : stack, décisions d'architecture, étapes attendues.
C'est la source de vérité.

PÉRIMÈTRE
- Réalise UNIQUEMENT le "LOT ESSENTIEL" (Prompts 1 à 10 : scaffolding → docs).
- N'implémente PAS le lot "Maintenance / Pro" (CI/Lighthouse, gitleaks, commitizen,
  auto-merge, tests) sauf demande explicite de ma part.

MÉTHODE
- Procède SÉQUENTIELLEMENT, dans l'ordre des prompts ; chaque étape dépend de la précédente.
- Crée une todo qui reflète les étapes du guide et tiens-la à jour.
- Après CHAQUE étape : `pnpm build` doit passer, puis commit conventionnel (comme indiqué).
- ARRÊTE-TOI et attends ma validation après l'étape 1 (scaffolding) et après l'étape 7
  (déploiement). Ce sont mes points de contrôle : ne les franchis pas sans mon accord.

SOUS-AGENTS
- Délègue à des sous-agents UNIQUEMENT pour : des recherches/lectures (ex. vérifier une
  version compatible) ou des fichiers INDÉPENDANTS (les deux CLAUDE.md, README, table de
  redirections).
- JAMAIS de sous-agents en parallèle pour éditer les fichiers racine partagés
  (package.json, astro.config, eslint.config, netlify.toml, pnpm-lock.yaml) : ces éditions
  restent séquentielles dans la session principale.

VERSIONS & QUALITÉ
- Épingle les versions exactes (save-exact) et committe pnpm-lock.yaml.
- Respecte la stack : Node 22, Astro 6, @storyblok/astro 9.
- Si une version est incompatible ou si une commande échoue de façon inattendue,
  STOPPE et demande-moi — n'improvise pas de contournement.

RAPPELS D'ARCHITECTURE
- Prod = SSG (token Public, 'published'). Preview = SSR (token Preview, 'draft').
- Aucun secret en dur ; variables via astro:env.
- Conventional Commits ; ne contourne jamais les hooks (`--no-verify` interdit).

Commence par lire le guide, propose-moi ta todo, puis attaque l'étape 1.
```

> Une fois le socle validé et mergé, change de mode : ouvre un worktree Conductor **par feature**, une PR chacune (cf. annexe sur les branches et la promotion).

---

### LOT ESSENTIEL — requis pour livrer un site sain

#### Prompt 1 — Scaffolding Astro 6 + Storyblok (SSG prod / SSR preview)

```
Initialise un projet Astro 6 en TypeScript strict à la racine du dépôt (pnpm, versions exactes).

- Node 22 : ajoute .nvmrc (22) et "engines" (node >=22.12) ; active corepack/pnpm.
- Configure save-exact et committe pnpm-lock.yaml.
- Ajoute l'intégration @storyblok/astro (^9) via `pnpm astro add` :
  région EU, bridge activé, accessToken lu depuis une variable d'environnement (jamais en dur).
- Ajoute l'adaptateur @astrojs/netlify (compatible Astro 6) et @astrojs/sitemap.
- Mode de rendu : output statique par défaut (SSG). Prépare un rendu À LA DEMANDE
  pour la/les route(s) de preview uniquement (prerender = false sur la route preview),
  de sorte que la prod reste 100% statique et que la preview rende le contenu 'draft'.
- Variables typées via astro:env :
  STORYBLOK_PUBLIC_TOKEN, STORYBLOK_PREVIEW_TOKEN, PUBLIC_SITE_URL, STORYBLOK_VERSION (draft|published).
  La logique : token Public + version 'published' en prod ; token Preview + version 'draft' en preview.
- Crée .env.example, ajoute .env au .gitignore, un bloc de démo "Page" enregistré globalement.
- Vérifie que `pnpm build` passe.

Commit : "chore: scaffold astro 6 + storyblok (ssg prod / ssr preview)".
```

#### Prompt 2 — Qualité de code (ESLint, Prettier, EditorConfig)

```
Ajoute la qualité de code.
- ESLint flat config (eslint.config.js) : typescript-eslint (recommended), eslint-plugin-astro,
  eslint-plugin-jsx-a11y.
- Prettier + prettier-plugin-astro (.prettierrc, .prettierignore), compatible ESLint (pas de conflit de format).
- .editorconfig (UTF-8, LF, 2 espaces).
- Scripts : lint, lint:fix, format, format:check, typecheck (astro check).
- Corrige le code existant pour passer lint + typecheck.
Commit : "chore: add eslint, prettier and editorconfig".
```

#### Prompt 3 — Hooks Git essentiels (Husky + lint-staged + commitlint)

```
Mets en place les garde-fous Git essentiels.
- Husky v9 (`npx husky init`).
- lint-staged (.lintstagedrc.json) : ESLint --fix + Prettier --write sur les fichiers stagés.
- Hook pre-commit : lint-staged.
- commitlint (@commitlint/cli + @commitlint/config-conventional, commitlint.config.js) ; hook commit-msg.
- Documente la convention (feat, fix, docs, chore, style, refactor, perf, test, ci) dans le README.
Commit : "chore: add husky, lint-staged and commitlint".
```

#### Prompt 4 — Sécurité de base

```
Ajoute les garde-fous de sécurité essentiels.
- Vérifie qu'aucun secret n'est exposé côté client (seuls les PUBLIC_* le sont via astro:env).
- Active l'API CSP native d'Astro 6 pour générer une Content-Security-Policy par hash.
  IMPORTANT : autoriser le bridge de l'éditeur visuel Storyblok (app.storyblok.com / frame-ancestors)
  UNIQUEMENT dans le contexte preview, afin de ne pas casser l'iframe d'édition.
- netlify.toml : en-têtes complémentaires (X-Frame-Options en prod, X-Content-Type-Options,
  Referrer-Policy, Strict-Transport-Security, Permissions-Policy).
- .github/dependabot.yml : mises à jour npm hebdomadaires.
- Script "audit" (pnpm audit).
Commit : "chore: add baseline security (csp, headers, dependabot)".
```

#### Prompt 5 — Modèle de contenu (blocs Storyblok)

```
Crée le modèle de contenu en blocs/types Storyblok (src/storyblok), enregistrés globalement.
Langue : FR uniquement — ne configure PAS d'i18n.
Structure cible (cf. maquette LaMinga) :
- Project (fiche projet) : titre, typologie (sélection unique via datasource "Typologie"),
  données projet (année, localisation, maître d'ouvrage, équipe, crédits…), visuels
  (galerie d'images, affichage carrousel OU scroll latéral/vertical), lien "projet similaire"
  (relation vers un autre Project).
- ProjectList (page Projets) : grille des projets groupée et filtrée par typologie (Typologie 1–4).
- AtelierPage : intro, compétences, clients (richtext) + liste de membres (bloc TeamMember répétable).
- TeamMember : nom, photo (+ rôle/bio optionnels).
- HomePage : grille de projets (sélection mise en avant ou tous).
- Réglages globaux : liens réseaux sociaux (header + footer) et infos footer (adresse, mentions légales).
- Datasource "Typologie" alimentant le filtre (jamais de valeurs en dur).
- Gabarits de pages Astro (accueil, projets, projet, atelier) + routes dynamiques des fiches projet
  sous src/pages/projets/.
- Données mock si besoin pour que `pnpm build` passe.
Commit : "feat: add storyblok content model and page templates".
```

#### Prompt 6 — Migration & redirections 301 (préserver le référencement)

```
Mets en place la migration SEO depuis l'ancien WordPress.
- À partir de la liste des anciennes URLs (sitemap WP + export Search Console fournis dans /migration/old-urls.csv),
  établis une table de correspondance ancienne URL -> nouvelle URL.
- Implémente des redirections 301 permanentes (fichier `public/_redirects` Netlify et/ou netlify.toml),
  couvrant : pages projets, page atelier, et toute URL de média qui change.
- Toute ancienne URL sans équivalent : rediriger vers la page la plus proche (jamais une 404 brute).
- Vérifie l'unicité des balises canoniques et la cohérence des métadonnées (title/description) par page.
- Génère le sitemap.xml et le robots.txt ; prépare une note pour soumettre le nouveau sitemap
  dans Search Console et surveiller les 404 après la bascule.
- Ajoute un petit script de test qui vérifie que chaque ancienne URL renvoie bien un 301 vers une 200.
Commit : "feat: add 301 redirects and seo migration from wordpress".
```

#### Prompt 7 — Déploiement (prod SSG + preview SSR + webhook)

```
Configure le déploiement Netlify et la mécanique de contenu.
- Contexte production (branche main) : build SSG, variables token Public + version 'published'.
- Branch deploy 'preview' : build SSR, variables token Preview + version 'draft'.
- Définis les variables d'environnement par contexte dans netlify.toml / l'UI Netlify.
- Crée un Build Hook Netlify (prod) et documente le branchement du webhook Storyblok
  (événement "story published" -> Build Hook) dans le README.
- Documente la configuration du domaine de preview dans Storyblok (Settings > Visual Editor)
  pointant vers l'URL de l'environnement SSR.
- Recette : build prod OK, preview affiche bien le draft, l'édition visuelle fonctionne.
Commit : "ci: configure netlify ssg prod, ssr preview and storyblok webhook".
```

#### Prompt 8 — CLAUDE.md (mémoire Claude Code)

À faire une fois la stack stable. Court et à fort signal (≈ 60–100 lignes), commandes en priorité, sans « personnalité », sans ce que Claude déduit seul ; à élaguer dans le temps.

```
Crée un CLAUDE.md racine, concis et à fort signal (60–100 lignes), bonnes pratiques 2026 :
- commandes réelles vérifiées dans package.json (dev, build, lint, format, typecheck, audit) ;
- stack, structure des dossiers, conventions de commit, règles Storyblok (enregistrement des blocs),
  décision de rendu (SSG prod / SSR preview), politique images/perf/accessibilité, liste "à ne pas faire".
N'inclus pas ce que Claude apprend seul en une session.
Commit : "docs: add CLAUDE.md for claude code".
```

CLAUDE.md de départ (prêt à coller) :

```markdown
# CLAUDE.md — Site LaMinga

Vitrine d'agence d'archi. Astro 6 + Storyblok (headless), déployé sur Netlify.
Prod = statique (SSG). Preview = SSR (contenu draft) pour l'éditeur visuel.
Éditeurs non-techniques : autonomie d'édition et performance priment.

## Commandes (pnpm)
- `pnpm dev` — développement
- `pnpm build` — build de prod (doit TOUJOURS passer avant un commit)
- `pnpm preview` — prévisualiser le build
- `pnpm lint` / `pnpm lint:fix` — ESLint
- `pnpm format` / `pnpm format:check` — Prettier
- `pnpm typecheck` — astro check
- `pnpm audit` — audit des dépendances

## Stack (versions verrouillées par pnpm-lock.yaml)
- Node 22, Astro 6, TypeScript strict
- @storyblok/astro 9 (région EU, bridge activé)
- Adaptateur @astrojs/netlify, @astrojs/sitemap
- Variables via astro:env — JAMAIS de secret en dur

## Rendu
- Prod (main) : SSG, token Public, version 'published'
- Preview (branche preview) : SSR (prerender=false sur la route preview), token Preview, version 'draft'
- Publication Storyblok -> webhook -> Build Hook Netlify -> rebuild prod

## Structure
- `src/storyblok/` — un composant par bloc (prop `blok`) — voir `src/storyblok/CLAUDE.md`
- `src/layouts/`, `src/components/`, `src/pages/`
- Pages : accueil, projets, projet (`src/pages/projets/`), atelier

## Contenu (Storyblok)
- Langue : **FR uniquement** (pas d'i18n)
- Types : Project, ProjectList, AtelierPage, TeamMember, HomePage + réglages globaux (réseaux sociaux, footer)
- Filtre unique : **Typologie** (datasource, pas de valeurs en dur)
- "Projet similaire" = relation entre deux Project
- Nav : Logo · Projets · Atelier · Réseaux Sociaux

## Conventions
- Conventional Commits ; hooks Husky actifs ; `--no-verify` interdit
- Avant commit : lint + typecheck + build doivent passer
- Composant Astro statique par défaut ; `client:*` seulement si réellement interactif
- Images via le service Storyblok ; respecter eslint-plugin-jsx-a11y

## À ne pas faire
- Committer un `.env` ou un token
- Mettre la prod en SSR (la prod reste statique)
- Casser les redirections 301 héritées de l'ancien site
```

#### Prompt 9 — CLAUDE.md imbriqué pour les blocs Storyblok

```
Crée src/storyblok/CLAUDE.md (chargé seulement dans ce dossier), concis et spécifique :
- storyblokEditable(blok) obligatoire sur l'élément racine de chaque composant ;
- enregistrement de tout nouveau bloc dans `components` d'astro.config ;
- requêtes version 'draft' (preview) vs 'published' (prod) ;
- richtext via renderRichText (jamais de HTML brut) ;
- service d'images Storyblok (/m/{w}x{h}/...) format auto ;
- datasource "Typologie" pour le filtre des projets (pas de valeurs en dur) ;
- "projet similaire" = champ de relation entre Project ;
- régénérer les types TS après changement de schéma ;
- hydratation Astro (client:visible/idle) seulement si interactif.
Vérifie que le root CLAUDE.md pointe vers ce fichier.
Commit : "docs: add nested CLAUDE.md for storyblok blocks".
```

#### Prompt 10 — Documentation

```
Rédige README.md (stack, prérequis, env via .env.example, scripts, rendu SSG/SSR, déploiement, webhook),
CONTRIBUTING.md (workflow Git, conventions) et docs/back-office.md (guide création d'une fiche projet pour LaMinga).
Commit : "docs: add readme, contributing and back-office guide".
```

---

### LOT MAINTENANCE / PRO — à ajouter SEULEMENT si contrat de suivi

Ces garde-fous sont excellents, mais ils supposent **quelqu'un pour les faire vivre**. Un client non-technique ne traitera ni les PR Dependabot ni un rapport Lighthouse. À n'ajouter que si tu gardes une relation de maintenance — sinon ils alourdissent sans bénéfice.

- **CI complète + Lighthouse CI** : GitHub Actions (lint, format, typecheck, build) + budget perf (Performance/A11y/SEO ≥ 95) qui fait échouer la PR. *Prompt : "ci: add github actions with lighthouse budget".*
- **gitleaks en pre-commit** : bloque tout commit de secret. *Prompt : "chore: add gitleaks pre-commit secret scan".*
- **commitizen** : assistant interactif de rédaction des commits. *Prompt : "chore: add commitizen".*
- **Dependabot auto-merge mineur/patch** : pour ne pas laisser s'accumuler des PR que personne ne lit. *Prompt : "ci: auto-merge minor and patch dependency updates".*
- **Tests Vitest + Playwright** (+ leur propre CLAUDE.md de dossier) : utile si le site gagne en logique. *Prompt : "test: set up vitest and playwright".*

---

## Récapitulatif des dépendances

| Catégorie | Essentiel | Maintenance / Pro |
|---|---|---|
| Framework | `astro`@6, `@storyblok/astro`@9, `@astrojs/netlify`, `@astrojs/sitemap` | — |
| Langage | `typescript` strict, `astro check` | — |
| Lint / format | `eslint`, `typescript-eslint`, `eslint-plugin-astro`, `eslint-plugin-jsx-a11y`, `prettier`, `prettier-plugin-astro` | — |
| Git hooks | `husky`, `lint-staged`, `@commitlint/cli`, `@commitlint/config-conventional` | `commitizen` |
| Sécurité | API CSP Astro 6, en-têtes `netlify.toml`, Dependabot, `pnpm audit` | `gitleaks`, auto-merge Dependabot |
| SEO / migration | redirections 301, sitemap, robots, canonicals | — |
| CI / tests | — | GitHub Actions + Lighthouse CI, `vitest`, `playwright` |

## Checklist finale

- [ ] `pnpm install && pnpm build` passe ; `pnpm-lock.yaml` committé
- [ ] `pnpm lint`, `pnpm format:check`, `pnpm typecheck` sans erreur
- [ ] Un commit non conforme est rejeté par commitlint
- [ ] **Prod statique** déployée depuis `main` ; **preview SSR** affiche le draft ; éditeur visuel OK
- [ ] Webhook Storyblok → Build Hook Netlify fonctionnel (publier régénère la prod)
- [ ] **Redirections 301 en place** : chaque ancienne URL renvoie un 301 vers une page 200
- [ ] Nouveau sitemap soumis dans Search Console ; surveillance des 404 prévue
- [ ] Tokens en variables d'env par contexte (Public/prod, Preview/preview), jamais commités
- [ ] CSP : prod verrouillée, bridge Storyblok autorisé en preview uniquement
- [ ] `CLAUDE.md` racine + `src/storyblok/CLAUDE.md` présents, concis, à jour
- [ ] Ancien WordPress conservé jusqu'à validation complète de la bascule

---

## Annexe — Environnements, branches et promotion

### Les deux axes (à ne pas confondre)

Deux choses s'appellent « preview » dans cette stack, sur deux axes **indépendants** :

- **Axe contenu (Storyblok)** : `draft` ⟶ `published`. État du *contenu*, contrôlé par les éditeurs.
- **Axe code (Git / Netlify)** : preview deploy ⟶ production deploy. Version du *code* déployée, contrôlée par toi.

L'environnement **SSR de preview** sert uniquement à l'**axe contenu** (montrer le `draft` aux éditeurs). Les **Deploy Previews** de branches servent à l'**axe code** (revue de tes features). Ce sont deux mécaniques distinctes qui ne se croisent pas.

```
AXE CONTENU (Storyblok)          AXE CODE (Netlify)
draft ──éditeur publie──▶ published   feature branch ──PR──▶ main
   │                          │            │                  │
   ▼                          ▼            ▼                  ▼
 Preview SSR              Prod SSG     Deploy Preview      Prod SSG
 (token Preview,         (token Public  (URL unique         (site public)
  draft, protégé)         published)     par PR)
```

### Prod vs Preview (contenu)

| | Production | Preview Storyblok |
|---|---|---|
| Rendu | Statique (SSG) | SSR (à la demande) |
| Contenu | `published` | `draft` |
| Token | Public | Preview |
| Branche | `main` | branche dédiée (ex. `preview`) |
| Accès | Public | **Protégé (mot de passe Netlify)** |
| Rôle | Site public | Éditeurs voient leurs brouillons en direct |

### Voir une feature déployée (équivalent Vercel)

- **Deploy Previews** : chaque **PR** ⟶ build automatique à une URL unique (`deploy-preview-42--laminga.netlify.app`). Équivalent exact des preview deployments Vercel.
- **Branch Deploys** : chaque branche poussée ⟶ URL stable (`feature-x--laminga.netlify.app`).

Tu reviewes ta feature sur cette URL déployée, puis tu merges.

### Workflow de déploiement retenu

**Décision validée : `main` = production, auto-publish activé.**

- Les features se développent en branches ⟶ chaque PR génère un **Deploy Preview** (URL dédiée) pour la revue.
- La **promotion = le merge de la PR** sur `main` (porte de contrôle = revue + CI verte).
- Le **contenu des éditeurs** se publie automatiquement en prod via le webhook Storyblok — leur autonomie est préservée.
- **Filet de sécurité** : en cas de problème, rollback Netlify en un clic (historique des déploiements).

> Pourquoi pas de bouton « promotion manuelle » à la Vercel ? Parce que la prod est régénérée par **deux** sources — merge de code **et** publication de contenu. Un verrou global gèlerait aussi les publications des éditeurs et casserait leur autonomie. La revue de PR joue déjà le rôle de porte de contrôle pour le code.

### Bonnes pratiques

- Une feature = une branche = une PR = un Deploy Preview ; valide toujours sur l'URL déployée.
- Protège `main` : revue de PR + CI verte obligatoires avant merge (c'est ta vraie porte de promotion).
- Garde l'auto-publish du contenu en prod ; appuie-toi sur le rollback instantané plutôt que sur un verrou.
- Sépare les deux preview : Deploy Preview = revue de code (build comme la prod) ; SSR Storyblok = revue de contenu (draft).
- Protège l'environnement SSR de preview (mot de passe) pour ne pas exposer les brouillons.
- `[skip ci]` / `[skip netlify]` dans un commit/titre de PR pour éviter un build inutile.
- Besoin de stager du **contenu** (pas seulement du code) ? Utilise les **Pipelines Storyblok**.

---

*Versions vérifiées juin 2026 : Astro 6 (Node 22+), @storyblok/astro v9. Le lockfile fait foi ; adapter au moment de l'init.*
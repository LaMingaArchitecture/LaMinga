# Déploiement — LaMinga

**Deux sites Netlify**, alimentés par le **même dépôt** et **la même branche `main`**, différenciés
par les **variables d'environnement de chaque site** (UI Netlify). La preview reflète donc toujours
le code de `main`, avec le contenu `draft` — aucune branche `preview` à maintenir.

|                            | Production (site A)              | Preview (site B)                        |
| -------------------------- | -------------------------------- | --------------------------------------- |
| URL                        | `laminga.netlify.app`            | `preview-laminga.netlify.app`           |
| Branche de production      | `main`                           | `main` (même branche)                   |
| Rendu                      | Statique (SSG)                   | SSG + SSR à la demande pour `/preview/` |
| `STORYBLOK_VERSION`        | `published`                      | `draft`                                 |
| Token (UI Netlify, secret) | `STORYBLOK_PUBLIC_TOKEN`         | `STORYBLOK_PREVIEW_TOKEN`               |
| Bridge éditeur visuel      | désactivé                        | activé                                  |
| Cadrage (iframe)           | refusé (`X-Frame-Options: DENY`) | `app.storyblok.com` autorisé            |
| Accès                      | public                           | **protégé (Edge Function Basic-Auth)**  |

> ⚠️ Le site B construit `main` comme contexte **production** : son `CONTEXT` Netlify vaut
> `production`. Tout ce qui distingue les deux sites passe donc par **`STORYBLOK_VERSION`** (et non
> par `CONTEXT`) — c'est le commutateur unique utilisé par `astro.config.mjs`,
> `scripts/generate-headers.mjs` et l'edge function `preview-auth`.

## 1. Variables d'environnement (UI Netlify, par site)

Les valeurs par site vivent dans l'UI Netlify, **jamais dans `netlify.toml`** (dont les valeurs
écraseraient l'UI et forceraient la même valeur sur les deux sites). Les tokens sont des secrets,
jamais commités.

- **Site A — production** : `STORYBLOK_VERSION=published`, `STORYBLOK_PUBLIC_TOKEN`,
  `PUBLIC_SITE_URL=https://laminga.netlify.app`.
- **Site B — preview** : `STORYBLOK_VERSION=draft`, `STORYBLOK_PREVIEW_TOKEN`,
  `PREVIEW_BASIC_AUTH=<user:password>` (un secret **long et aléatoire** — le gate n'a pas de
  limite de tentatives), `PUBLIC_SITE_URL=https://preview-laminga.netlify.app`.

## 2. Créer le second site (preview)

À faire dans l'UI (non réalisable depuis le dépôt) :

1. **Netlify → Add new project → Import from Git** : sélectionner **le même dépôt** que la prod.
2. **Build & deploy → Continuous deployment → Branches** : régler la branche de production sur **`main`**.
3. Renseigner les variables d'environnement du site B (cf. §1).
4. **Désactiver les Deploy Previews** du site B (Build & deploy → Branches and deploy contexts →
   Deploy Previews → _Don't build_) : le site preview n'a besoin de builder que `main` ; la revue de
   code se fait sur les Deploy Previews du site de **prod**. Évite des builds et des checks CI inutiles.
5. Le gate d'accès (edge function `preview-auth`, déclaré dans `netlify.toml` et
   `netlify/edge-functions/`) s'active tout seul sur le site B (`STORYBLOK_VERSION=draft`) et reste
   inerte sur la prod.

## 3. Build hook + webhook de publication (prod uniquement)

1. **Site A → Build & deploy → Build hooks** : créer un hook `storyblok-publish` ciblant `main`.
   Copier l'URL (`https://api.netlify.com/build_hooks/…`).
2. **Storyblok → Settings → Webhooks** : sur l'événement **Story published / unpublished**, coller
   l'URL du build hook. Publier régénère alors la prod (SSG). Le site B n'a pas besoin de rebuild de
   contenu : sa route `/preview/` récupère le `draft` en direct (SSR).

## 4. Éditeur visuel (preview)

1. **Storyblok → Settings → Visual Editor** : régler le _Location (default environment)_ sur l'URL
   du site B suivie de `/preview/`, soit `https://preview-laminga.netlify.app/preview/`.
2. **Authentification** : la première fois, ouvrir l'URL du site B dans un onglet classique pour
   s'authentifier (Basic-Auth) ; l'iframe de l'éditeur fonctionne ensuite (identifiants en cache).

## 5. Développement local

- `pnpm dev` — contenu `published` (token Public), port 4321.
- `pnpm dev:preview` — contenu `draft` + bridge (token Preview), port 4322.

Les deux peuvent tourner simultanément. `STORYBLOK_VERSION` n'est pas figé dans `.env` : c'est le
script qui choisit la version (cf. `.env.example`).

## 6. Recette (à valider après mise en ligne)

- [ ] Build de prod OK ; les pages de contenu sont bien pré-rendues (HTML statique).
- [ ] Site B : toute URL non authentifiée → `401` (pages statiques comprises) ; authentifiée → OK.
- [ ] Site B **sans** `PREVIEW_BASIC_AUTH` renseigné → toute URL renvoie `503` (fail-closed, aucun draft servi).
- [ ] Site B : `/preview/<slug>` rend le `draft` à la demande (SSR).
- [ ] L'éditeur visuel Storyblok affiche le site B et reflète les modifications en direct.
- [ ] Publier une story déclenche un rebuild de la prod (build hook) et le contenu apparaît.
- [ ] En prod, `/preview/...` renvoie 404 (la prod reste statique).
- [ ] En-têtes : prod refuse le cadrage ; preview autorise `app.storyblok.com`.

## Coût (plan Free, modèle à crédits)

Chaque merge sur `main` déclenche **deux production deploys** (site A + site B) ≈ **30 crédits** sur
les **300 crédits/mois** (plafond strict, sans dépassement). Acceptable pour des merges peu
fréquents ; les Deploy Previews de PR et les branch deploys ne sont pas comptés.

## Promotion du code

Une feature = une branche = une PR = un Deploy Preview. La promotion = le merge sur `main` (revue +
CI), qui redéploie **les deux** sites depuis `main`. Le contenu des éditeurs se publie
automatiquement via le webhook. En cas de souci : rollback Netlify en un clic.

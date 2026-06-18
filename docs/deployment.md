# Déploiement — LaMinga

Deux environnements Netlify, alimentés par le **même dépôt**, différenciés par les
variables d'environnement de chaque contexte.

|                            | Production                       | Preview                                      |
| -------------------------- | -------------------------------- | -------------------------------------------- |
| Contexte Netlify           | `production` (branche `main`)    | branch deploy `preview`                      |
| Rendu                      | Statique (SSG)                   | À la demande (SSR) pour la route `/preview/` |
| `STORYBLOK_VERSION`        | `published`                      | `draft`                                      |
| Token (UI Netlify, secret) | `STORYBLOK_PUBLIC_TOKEN`         | `STORYBLOK_PREVIEW_TOKEN`                    |
| Bridge éditeur visuel      | désactivé                        | activé                                       |
| Cadrage (iframe)           | refusé (`X-Frame-Options: DENY`) | `app.storyblok.com` autorisé                 |
| Accès                      | public                           | **protégé par mot de passe**                 |

## 1. Variables d'environnement (UI Netlify)

`netlify.toml` définit `STORYBLOK_VERSION` et `PUBLIC_SITE_URL` par contexte. Les **tokens
restent des secrets de l'UI Netlify**, jamais commités :

- Contexte _production_ : `STORYBLOK_PUBLIC_TOKEN`
- Contexte _preview_ (scope = branch deploy `preview`) : `STORYBLOK_PREVIEW_TOKEN`

Mettre `PUBLIC_SITE_URL` à jour dans `netlify.toml` avec les URLs réelles (domaine de prod,
URL du deploy de preview).

## 2. Build hook + webhook de publication

À faire dans l'UI (non réalisable depuis le dépôt) :

1. **Netlify → Site configuration → Build & deploy → Build hooks** : créer un hook
   `storyblok-publish` ciblant la branche `main`. Copier l'URL (`https://api.netlify.com/build_hooks/…`).
2. **Storyblok → Settings → Webhooks** : sur l'événement **Story published / unpublished**,
   coller l'URL du build hook. Publier un contenu régénère alors la prod (SSG).

## 3. Éditeur visuel (preview SSR)

1. **Storyblok → Settings → Visual Editor** : régler le _Location (default environment)_ sur
   l'URL de l'environnement de preview suivie de `/preview/`, par ex.
   `https://preview--laminga.netlify.app/preview/`.
2. **Netlify** : protéger le deploy `preview` par mot de passe (Site configuration →
   Access & security → Visitor access) pour ne pas exposer les brouillons.

## 4. Recette (à valider après mise en ligne)

- [ ] Build de prod OK ; les pages de contenu sont bien pré-rendues (HTML statique).
- [ ] Le deploy `preview` rend la route `/preview/<slug>` à la demande et affiche le `draft`.
- [ ] L'éditeur visuel Storyblok affiche le site et reflète les modifications en direct.
- [ ] Publier une story déclenche un rebuild de la prod (build hook) et le contenu apparaît.
- [ ] En prod, `/preview/...` renvoie 404 (la prod reste statique).
- [ ] En-têtes : prod refuse le cadrage ; preview autorise `app.storyblok.com`.

## Promotion du code

Une feature = une branche = une PR = un Deploy Preview. La promotion = le merge sur `main`
(revue + CI). Le contenu des éditeurs se publie automatiquement via le webhook. En cas de
souci : rollback Netlify en un clic.

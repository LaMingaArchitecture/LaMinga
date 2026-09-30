# Serveur MCP Storyblok — mise en place (développeurs)

Le serveur MCP officiel de Storyblok permet à un assistant IA (Claude Code, Claude Desktop…) de lire
et de modifier le contenu de l'espace LaMinga via la Management API. Référence :
<https://www.storyblok.com/docs/tooling/mcp-server/setup>.

> Toute **publication** d'une story déclenche le webhook → build hook Netlify → rebuild de la prod
> (cf. [`deployment.md`](deployment.md)). Toujours relire la modification avant de publier.

## 1. Déclarer le serveur (portée projet, OAuth)

Depuis la racine du dépôt :

```bash
claude mcp add --scope local --transport http Storyblok https://mcp.storyblok.com/mcp
```

- **`--scope local`** : le serveur n'est actif que dans ce dépôt, sans toucher la configuration
  globale ni les autres projets clients. La config est écrite dans `~/.claude.json` (rien n'est
  committé).
- **Endpoint** : `https://mcp.storyblok.com/mcp`. L'ancien endpoint `mcp.labs.storyblok.com` est
  obsolète et répond `401 Unauthorized`.
- **Authentification : OAuth.** Ne pas coller de _Personal Access Token_ dans un en-tête
  `Authorization` : il serait stocké en clair dans `~/.claude.json`.

Vérifier : `claude mcp get Storyblok` → `Status: ! Needs authentication`.

## 2. Se connecter — depuis un terminal

```bash
cd <chemin>/LaMinga && claude
```

Puis dans la session : `/mcp` → **Storyblok** → se connecter dans le navigateur → n'autoriser que
l'espace **LaMinga** → `/exit`.

Vérifier : `claude mcp get Storyblok` → `Status: ✔ Connected`.

## Pièges connus

| Symptôme                                                                            | Cause                                                                                                                            | Solution                                                                                 |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `invalid_redirect_uri … must be a loopback URL` au moment de la connexion           | La connexion lancée depuis l'app **Claude Desktop** (onglet Code, `/mcp`) n'utilise pas une URL de retour acceptée par Storyblok | Se connecter depuis un **terminal** (étape 2), qui utilise `http://localhost`            |
| `401 Unauthorized` sur tous les appels                                              | Ancien endpoint `labs` ou token personnel expiré/révoqué                                                                         | Supprimer l'ancienne entrée (`claude mcp remove Storyblok -s user`) et refaire l'étape 1 |
| Serveur `✔ Connected` en terminal mais toujours `401` dans une session déjà ouverte | La session garde la connexion chargée à son démarrage                                                                            | Ouvrir une **nouvelle session** interactive                                              |
| Outils Storyblok absents avec `claude -p` (mode non interactif)                     | Le serveur OAuth n'est pas chargé en mode headless                                                                               | Utiliser une session interactive `claude`                                                |

Alternative à l'étape 1 pour Claude Desktop / claude.ai : installer Storyblok comme **connecteur**
(Réglages → Personnaliser → Connecteurs → **+** → Parcourir → Storyblok → Connecter). La connexion
passe alors par l'URL de retour hébergée par Anthropic, mais le connecteur vaut pour tout le compte,
pas seulement pour ce dépôt.

## Utilisation

- La région de l'espace est **EU**.
- Déroulé attendu de l'assistant : `search` → `describe` → exécution (lecture seule d'abord).
- Mise à jour des médias d'un projet : [`procedure-medias.md`](procedure-medias.md).
- Accorder uniquement l'espace LaMinga et les permissions nécessaires.
- Si un token personnel a été exposé (terminal, capture, commit) : le **révoquer** dans Storyblok
  (Mon compte → Personal access tokens).

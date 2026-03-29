<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="500" alt="Stillpoint" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/stillpoint/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/stillpoint/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/mcp-tool-shop-org/stillpoint/actions/workflows/pages.yml"><img src="https://github.com/mcp-tool-shop-org/stillpoint/actions/workflows/pages.yml/badge.svg" alt="Site" /></a>
  <a href="https://github.com/mcp-tool-shop-org/stillpoint/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" /></a>
  <a href="https://mcp-tool-shop-org.github.io/stillpoint/"><img src="https://img.shields.io/badge/Landing_Page-live-blue" alt="Landing Page" /></a>
</p>

Mixeur de sons d'ambiance pour favoriser la concentration et la régulation du système nerveux. 50 sons superposés répartis en 10 catégories, avec contrôle du volume de chaque couche et gestion de l'acheminement audio vers les périphériques.

Fonctionne grâce à [sonic-core](https://github.com/mcp-tool-shop-org/sonic-core) et [sonic-runtime](https://github.com/mcp-tool-shop-org/sonic-runtime).

## Architecture

```
┌──────────────────────────────┐
│  Tauri / Browser             │  ← window chrome
│  React + Vite (port 5177)   │
└──────────┬───────────────────┘
           │ REST + SSE
┌──────────▼───────────────────┐
│  Node.js server (port 3456)  │  ← sonic-core integration
│  Express + SidecarBackend    │
└──────────┬───────────────────┘
           │ ndjson-stdio-v1
┌──────────▼───────────────────┐
│  sonic-runtime (C# NativeAOT)│  ← real audio via OpenAL Soft
└──────────────────────────────┘
```

## Fonctionnalités

- **50 sons d'ambiance** répartis dans 10 catégories (pluie, eau, océan, vent, feu, nuit, bruit, bourdonnement, tonalité, mécanique).
- **Sons personnalisés** : ajoutez vos propres fichiers WAV dans un dossier et ils apparaîtront dans le mélangeur.
- **Mélangeur multicouche** : ajoutez plusieurs sons simultanément avec un volume indépendant.
- **Navigateur de catégories** : sélection de sons organisée par catégories déroulantes.
- **Volume par couche** : curseurs de plage avec ajustement en temps réel.
- **Mute par couche** : mettez en sourdine les couches individuelles sans les supprimer.
- **Volume principal** : contrôle global qui ajuste toutes les couches simultanément.
- **Fonction fondu (in/out)** : transitions douces lors de l'ajout ou de la suppression de couches.
- **Routage des périphériques** : sélection du périphérique de sortie audio ; configuration via l'interface utilisateur ou `POST /device`.
- **Minuteur de veille** : arrêt automatique de la lecture après une durée configurable.
- **Présets enregistrés** : enregistrez et chargez des mélanges nommés (couches + volumes).
- **Barre d'état système** : minimisez l'application dans la barre d'état ; la lecture continue en arrière-plan.
- **Synchronisation en temps réel** : mises à jour de l'état basées sur SSE.
- **Application de bureau Tauri** : fenêtre native via Tauri v2.

## Configuration du développement

```bash
# Prerequisites: Node 20+, sonic-runtime binary

git clone https://github.com/mcp-tool-shop-org/stillpoint
cd stillpoint
npm install

# Terminal 1: server
SONIC_RUNTIME_PATH=/path/to/SonicRuntime.exe \
  npx tsx packages/server/src/bin.ts

# Terminal 2: UI
npm run dev --workspace=@stillpoint/ui
```

Sur Windows, configurez d'abord la variable d'environnement.

```bash
set SONIC_RUNTIME_PATH=C:\path\to\SonicRuntime.exe
npx tsx packages/server/src/bin.ts
```

Ouvrez `http://localhost:5177` — sélectionnez une catégorie, ajoutez des sons, ajustez les volumes.

Le serveur utilise par défaut le port 3456. Remplacez-le avec la variable d'environnement `PORT`.

## Sons personnalisés

Déposez n'importe quel fichier `.wav` dans le répertoire des sons personnalisés et il apparaîtra automatiquement dans une catégorie "Personnalisés" – aucun redémarrage du serveur n'est nécessaire.

Emplacement par défaut : dossier `custom/` à côté du répertoire des fichiers WAV d'ambiance. Vous pouvez modifier cet emplacement en utilisant la variable `STILLPOINT_CUSTOM_PATH`.

Les noms de fichiers deviennent les noms d'affichage : `my-rain.wav` → **My Rain**.

## Packages

| Package | Objectif |
|---------|---------|
| `@stillpoint/server` | API Express + gestion du moteur sonic-core. |
| `@stillpoint/ui` | Interface utilisateur du mixeur React (Vite). |
| `@stillpoint/desktop` | Coquille de fenêtre native Tauri v2. |

## Variables d'environnement

| Variable | Valeur par défaut | Description |
|----------|---------|-------------|
| `SONIC_RUNTIME_PATH` | (chemins de secours) | Chemin vers le fichier binaire de sonic-runtime. |
| `AMBIENT_WAVS_PATH` | `./ambient-wavs` | Répertoire contenant les fichiers WAV d'ambiance. |
| `STILLPOINT_CUSTOM_PATH` | `<AMBIENT_WAVS_PATH>/../custom` | Répertoire pour les fichiers WAV personnalisés fournis par l'utilisateur. |
| `PORT` | `3456` | Port du serveur. |

## Processus de publication

1. Mettez à jour la version dans `package.json` (racine), `packages/server/package.json`, `packages/ui/package.json` et `apps/desktop/package.json`.
2. Mettez à jour `CHANGELOG.md` : déplacez les éléments "Non publiés" vers un en-tête de version daté.
3. Exécutez `npm test` pour vérifier que tous les tests passent.
4. Validez, ajoutez une étiquette `vX.Y.Z`, envoyez les modifications.
5. Créez une publication GitHub à partir de l'étiquette.

## Licence

MIT — voir [LICENSE](LICENSE).

---

Créé par [MCP Tool Shop](https://mcp-tool-shop.github.io/)

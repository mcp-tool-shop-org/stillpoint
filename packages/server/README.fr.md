<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="400" alt="Stillpoint" />
</p>

# @stillpoint/server

Serveur de mixage audio basé sur Express, qui gère les couches sonores, la sélection des périphériques et la lecture via sonic-core. Il envoie des mises à jour d'état en temps réel à tous les clients connectés via SSE.

## API

| Méthode | Chemin | Fonction |
|--------|------|---------|
| GET | `/api/sounds` | Catalogue complet avec catégories (intégrées + personnalisées) |
| GET | `/api/devices` | Périphériques de sortie audio disponibles |
| GET | `/api/state` | État actuel du mixeur |
| POST | `/api/layers/add` | Ajouter une couche sonore |
| POST | `/api/layers/remove` | Supprimer une couche |
| POST | `/api/layers/volume` | Définir le volume d'une couche (0.0–1.0) |
| POST | `/api/stop-all` | Arrêter toutes les couches |
| GET | `/api/events` | Flux SSE des modifications d'état |

## Sons personnalisés

Déposez des fichiers `.wav` dans le répertoire des sons personnalisés. Ils apparaîtront automatiquement dans une catégorie "Personnalisée". Définissez la variable `STILLPOINT_CUSTOM_PATH` ou utilisez le dossier par défaut `custom/` à côté du répertoire des fichiers WAV ambiants.

## Démarrage

```bash
SONIC_RUNTIME_PATH=/path/to/SonicRuntime.exe \
  npx tsx src/bin.ts
```

Le serveur démarre sur le port 3456.

## Licence

MIT — voir [LICENSE](../../LICENSE).

---

Fait partie de [Stillpoint](https://github.com/mcp-tool-shop-org/stillpoint) · Créé par [MCP Tool Shop](https://mcp-tool-shop.github.io/)

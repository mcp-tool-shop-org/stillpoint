<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="400" alt="Stillpoint" />
</p>

# @stillpoint/ui

Interface de mixage React pour Stillpoint. Se connecte au serveur via REST et SSE, et affiche un mixeur audio en couches avec contrôle du volume par couche, navigation par catégorie et sélection de périphérique.

## Composants

- **SoundPicker** : deux menus déroulants en cascade : catégorie, puis son.
- **LayerStrip** : barre par couche, avec nom, étiquette de catégorie, curseur de volume et bouton de suppression.
- **DeviceSelect** : menu déroulant pour la sélection du périphérique de sortie audio.
- **ErrorBanner** : affiche les erreurs du serveur.

## Gestion de l'état

Le hook `useRegulator` gère tout l'état via une seule connexion `EventSource` à `/api/events`. Les modifications de volume sont soumises à un délai de 50 ms avec des mises à jour optimistes de l'interface utilisateur.

## Exécution

```bash
npm run dev --workspace=@stillpoint/ui
```

S'ouvre sur `http://localhost:5177`. Nécessite un serveur en cours d'exécution sur le port 3456.

## Licence

MIT — voir [LICENSE](../../LICENSE).

---

Fait partie de [Stillpoint](https://github.com/mcp-tool-shop-org/stillpoint) · Créé par [MCP Tool Shop](https://mcp-tool-shop.github.io/)

<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="400" alt="Stillpoint" />
</p>

# @stillpoint/desktop

Un wrapper pour bureau Tauri v2 qui intègre le mixeur Stillpoint dans une application Windows native. Connecte l'interface utilisateur React au serveur Node.js situé sur localhost.

## Fonctionnalités

- Fenêtre native (700x500, taille minimale 500x400)
- Cibles d'installation NSIS et MSI
- CSP (Content Security Policy) verrouillé aux connexions localhost uniquement.

## Exécution

```bash
cd apps/desktop
npm run tauri dev
```

Nécessite un serveur en cours d'exécution sur le port 3456 et un serveur de développement de l'interface utilisateur sur le port 5177.

## Licence

MIT — voir [LICENSE](../../LICENSE).

---

Fait partie de [Stillpoint](https://github.com/mcp-tool-shop-org/stillpoint) · Créé par [MCP Tool Shop](https://mcp-tool-shop.github.io/)

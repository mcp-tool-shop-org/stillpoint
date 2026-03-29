<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="400" alt="Stillpoint" />
</p>

# @stillpoint/desktop

Wrapper desktop per Tauri v2 che include il mixer Stillpoint in un'applicazione nativa per Windows. Connette l'interfaccia utente React al server Node.js in locale.

## Caratteristiche

- Finestra nativa (700x500, dimensioni minime 500x400)
- Supporto per gli installer NSIS e MSI
- CSP limitato alle connessioni solo a localhost

## Esecuzione

```bash
cd apps/desktop
npm run tauri dev
```

Richiede un server in esecuzione sulla porta 3456 e un server di sviluppo dell'interfaccia utente sulla porta 5177.

## Licenza

MIT — vedere [LICENSE](../../LICENSE).

---

Parte di [Stillpoint](https://github.com/mcp-tool-shop-org/stillpoint) · Creato da [MCP Tool Shop](https://mcp-tool-shop.github.io/)

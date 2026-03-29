<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="400" alt="Stillpoint" />
</p>

# @stillpoint/desktop

Tauri v2 desktop wrapper that bundles the Stillpoint mixer into a native Windows application. Connects the React frontend to the Node.js server on localhost.

## Features

- Native window (700x500, min 500x400)
- NSIS and MSI installer targets
- CSP locked to localhost connections only

## Run

```bash
cd apps/desktop
npm run tauri dev
```

Requires the server running on port 3456 and the UI dev server on port 5177.

## License

MIT — see [LICENSE](../../LICENSE).

---

Part of [Stillpoint](https://github.com/mcp-tool-shop-org/stillpoint) · Built by [MCP Tool Shop](https://mcp-tool-shop.github.io/)

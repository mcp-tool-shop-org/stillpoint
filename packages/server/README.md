<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="400" alt="Stillpoint" />
</p>

# @stillpoint/server

Express-based audio mixer server that manages sound layers, device selection, and playback via sonic-core. Pushes real-time state updates to all connected clients over SSE.

## API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/sounds` | Full catalog with categories (built-in + custom) |
| GET | `/api/devices` | Available audio output devices |
| GET | `/api/state` | Current mixer state |
| POST | `/api/layers/add` | Add a sound layer |
| POST | `/api/layers/remove` | Remove a layer |
| POST | `/api/layers/volume` | Set layer volume (0.0–1.0) |
| POST | `/api/stop-all` | Stop all layers |
| GET | `/api/events` | SSE stream of state changes |

## Custom sounds

Drop `.wav` files into the custom sounds directory. They appear in a "Custom" category automatically. Set `STILLPOINT_CUSTOM_PATH` or use the default `custom/` folder next to the ambient WAVs directory.

## Run

```bash
SONIC_RUNTIME_PATH=/path/to/SonicRuntime.exe \
  npx tsx src/bin.ts
```

Server starts on port 3456.

## License

MIT — see [LICENSE](../../LICENSE).

---

Part of [Stillpoint](https://github.com/mcp-tool-shop-org/stillpoint) · Built by [MCP Tool Shop](https://mcp-tool-shop.github.io/)

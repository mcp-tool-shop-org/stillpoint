<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="400" alt="Stillpoint" />
</p>

# @stillpoint/ui

React mixer interface for Stillpoint. Connects to the server via REST and SSE, displaying a layered sound mixer with per-layer volume control, category browsing, and device selection.

## Components

- **SoundPicker** — two cascading dropdowns: category then sound
- **LayerStrip** — per-layer strip with name, category label, volume fader, and remove button
- **DeviceSelect** — audio output device dropdown
- **ErrorBanner** — displays server errors

## State management

The `useRegulator` hook manages all state through a single `EventSource` connection to `/api/events`. Volume changes are debounced at 50ms with optimistic UI updates.

## Run

```bash
npm run dev --workspace=@stillpoint/ui
```

Opens on `http://localhost:5177`. Requires the server running on port 3456.

## License

MIT — see [LICENSE](../../LICENSE).

---

Part of [Stillpoint](https://github.com/mcp-tool-shop-org/stillpoint) · Built by [MCP Tool Shop](https://mcp-tool-shop.github.io/)

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/stillpoint/readme.png" width="400" alt="Stillpoint" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/stillpoint/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/stillpoint/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/mcp-tool-shop-org/stillpoint/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" /></a>
  <a href="https://mcp-tool-shop-org.github.io/stillpoint/"><img src="https://img.shields.io/badge/Landing_Page-live-blue" alt="Landing Page" /></a>
</p>

Ambient sound mixer for focus and nervous system regulation. 50 layered sounds across 10 categories with per-layer volume control and device routing.

Powered by [sonic-core](https://github.com/mcp-tool-shop-org/sonic-core) and [sonic-runtime](https://github.com/mcp-tool-shop-org/sonic-runtime).

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

## Features

- **50 ambient sounds** across 10 categories (rain, water, ocean, wind, fire, night, noise, drone, tone, mechanical)
- **Layered mixer** — add multiple sounds simultaneously with independent volume
- **Category browser** — dropdown-organized sound picker
- **Per-layer volume** — range sliders with real-time adjustment
- **Device routing** — select audio output device
- **Real-time sync** — SSE-powered state updates
- **Tauri desktop** — native window via Tauri v2

## Dev Setup

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

Open `http://localhost:5177` — pick a category, add sounds, adjust volumes.

## Packages

| Package | Purpose |
|---------|---------|
| `@stillpoint/server` | Express API + sonic-core engine management |
| `@stillpoint/ui` | React mixer UI (Vite) |
| `@stillpoint/desktop` | Tauri v2 native window shell |

## License

MIT — see [LICENSE](LICENSE).

---

Built by [MCP Tool Shop](https://mcp-tool-shop.github.io/)

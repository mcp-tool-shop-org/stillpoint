<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
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
- **Custom sounds** — drop your own WAV files into a folder and they appear in the mixer
- **Layered mixer** — add multiple sounds simultaneously with independent volume
- **Category browser** — dropdown-organized sound picker
- **Per-layer volume** — range sliders with real-time adjustment
- **Per-layer mute** — silence individual layers without removing them
- **Master volume** — global control that scales all layers at once
- **Fade in/out** — smooth transitions when adding or removing layers
- **Device routing** — audio output device selector; set via UI or `POST /device`
- **Sleep timer** — auto-stop playback after a configurable duration
- **Saved presets** — save and load named mixes (layers + volumes)
- **System tray** — minimize to tray; playback continues in the background
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

On Windows, set the environment variable first:

```bash
set SONIC_RUNTIME_PATH=C:\path\to\SonicRuntime.exe
npx tsx packages/server/src/bin.ts
```

Open `http://localhost:5177` — pick a category, add sounds, adjust volumes.

The server defaults to port 3456. Override with the `PORT` environment variable.

## Custom Sounds

Drop any `.wav` file into the custom sounds directory and it appears in a "Custom" category automatically — no server restart needed.

Default location: `custom/` folder next to the ambient WAVs directory. Override with `STILLPOINT_CUSTOM_PATH`.

Filenames become display names: `my-rain.wav` → **My Rain**.

## Packages

| Package | Purpose |
|---------|---------|
| `@stillpoint/server` | Express API + sonic-core engine management |
| `@stillpoint/ui` | React mixer UI (Vite) |
| `@stillpoint/desktop` | Tauri v2 native window shell |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SONIC_RUNTIME_PATH` | (fallback paths) | Path to sonic-runtime binary |
| `AMBIENT_WAVS_PATH` | `./ambient-wavs` | Directory containing ambient WAV files |
| `STILLPOINT_CUSTOM_PATH` | `<AMBIENT_WAVS_PATH>/../custom` | Directory for user-provided custom WAV files |
| `PORT` | `3456` | Server port |

## Release Process

1. Bump version in `package.json` (root), `packages/server/package.json`, `packages/ui/package.json`, and `apps/desktop/package.json`
2. Update `CHANGELOG.md` — move Unreleased items to a dated version header
3. Run `npm test` to verify all tests pass
4. Commit, tag `vX.Y.Z`, push
5. Create a GitHub Release from the tag

## License

MIT — see [LICENSE](LICENSE).

---

Built by [MCP Tool Shop](https://mcp-tool-shop.github.io/)

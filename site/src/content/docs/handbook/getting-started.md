---
title: Getting Started
description: Install Stillpoint and run your first ambient mix.
sidebar:
  order: 1
---

## Prerequisites

- **Node.js 20+** — for the server and UI dev server
- **sonic-runtime binary** — the NativeAOT audio engine ([build instructions](https://github.com/mcp-tool-shop-org/sonic-runtime))
- **Ambient WAV files** — 50 loop-friendly sounds (see asset setup below)

## Clone and install

```bash
git clone https://github.com/mcp-tool-shop-org/stillpoint
cd stillpoint
npm install
```

This installs dependencies for all three packages (server, UI, desktop).

## Asset setup

Stillpoint expects ambient WAV files at the path set by `AMBIENT_WAVS_PATH` (defaults to `F:/AI/ambient-wavs/output`). Each sound references a file like `heavy-rain.wav`, `fireplace.wav`, etc.

## Run the server

```bash
SONIC_RUNTIME_PATH=/path/to/SonicRuntime.exe \
  npx tsx packages/server/src/bin.ts
```

The server starts on port 3456. You'll see:
```
[stillpoint] runtime connected: sonic-runtime v0.5.0 (ndjson-stdio-v1)
[stillpoint] server listening on http://localhost:3456
```

## Run the UI

In a second terminal:

```bash
npm run dev --workspace=@stillpoint/ui
```

Open `http://localhost:5177`. You'll see the Stillpoint mixer with a category dropdown and sound picker.

## First mix

1. Select a category from the first dropdown (e.g., "Rain")
2. Select a sound from the second dropdown (e.g., "Heavy Rain")
3. The sound starts playing immediately as a new layer
4. Add more sounds — they play simultaneously
5. Adjust each layer's volume with the slider
6. Click × to remove a layer, or "Stop All" to clear everything

## Tauri desktop (optional)

For a native window experience:

```bash
cd apps/desktop
npm run tauri dev
```

This opens Stillpoint in a native Tauri window pointing at `http://localhost:5177`.

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

Stillpoint expects ambient WAV files at the path set by `AMBIENT_WAVS_PATH` (defaults to `./ambient-wavs`). Each sound references a file like `heavy-rain.wav`, `fireplace.wav`, etc. Place your WAV files in the `ambient-wavs` folder at the project root, or set `AMBIENT_WAVS_PATH` to point anywhere on your system.

## Run the server

On macOS / Linux:

```bash
SONIC_RUNTIME_PATH=/path/to/SonicRuntime.exe \
  npx tsx packages/server/src/bin.ts
```

On Windows:

```bash
set SONIC_RUNTIME_PATH=C:\path\to\SonicRuntime.exe
npx tsx packages/server/src/bin.ts
```

The server starts on port 3456 (override with `PORT` env var). You'll see:
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

If this is your first time, the mixer shows three quick-start buttons — **Rain + Fire**, **Focus**, and **Beach**. Click one to load a starter mix immediately, then adjust volumes to taste.

To build a mix from scratch:

1. Select a category from the first dropdown (e.g., "Rain")
2. Select a sound from the second dropdown (e.g., "Heavy Rain")
3. The sound starts playing immediately as a new layer
4. Add more sounds — they play simultaneously (up to 8 layers)
5. Adjust each layer's volume with the slider, or use the master volume fader to scale everything at once
6. Click **M** to mute a layer without removing it, or **×** to remove it entirely
7. Click "Stop All" (or press **Space** / **Esc**) to clear everything

## Tauri desktop (optional)

For a native window experience:

```bash
cd apps/desktop
npm run tauri dev
```

This opens Stillpoint in a native Tauri window pointing at `http://localhost:5177`. The desktop build adds system tray support — closing the window hides it to the tray rather than quitting, so your mix keeps playing. Right-click the tray icon for **Show**, **Hide**, and **Quit** options.

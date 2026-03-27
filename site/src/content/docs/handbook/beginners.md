---
title: Beginner's Guide
description: New to Stillpoint? Start here for a step-by-step introduction.
sidebar:
  order: 99
---

## What is Stillpoint?

Stillpoint is a local ambient sound mixer that layers multiple sounds on top of each other for focus, relaxation, or background atmosphere. Think of it as a personal sound environment you control entirely on your own machine — no accounts, no cloud, no subscriptions.

You pick sounds from a catalog of 50 ambient loops (rain, ocean, fire, noise, drones, and more), stack as many as you want, and adjust each layer's volume independently.

## Who is it for?

- People who use ambient sound to concentrate while working or studying
- Anyone who finds background noise helpful for nervous system regulation
- Developers exploring the sonic-core audio platform
- Users who want a local-first, privacy-respecting sound mixer

Stillpoint is not a music player, not a therapy app, and not a DAW. It plays looping ambient sounds — nothing more.

## Prerequisites

Before you begin, make sure you have:

1. **Node.js 20 or later** — download from [nodejs.org](https://nodejs.org/)
2. **sonic-runtime binary** — the C# NativeAOT audio engine that does the actual playback. Build it from the [sonic-runtime repo](https://github.com/mcp-tool-shop-org/sonic-runtime) or use a pre-built binary.
3. **Ambient WAV files** — Stillpoint ships a catalog of 50 sound IDs, but it needs the corresponding WAV files on disk. Set the `AMBIENT_WAVS_PATH` environment variable to point to your WAV directory, or place them at the default path.

## Installation

```bash
git clone https://github.com/mcp-tool-shop-org/stillpoint
cd stillpoint
npm install
```

This installs all three workspace packages: the server (`@stillpoint/server`), the React UI (`@stillpoint/ui`), and the Tauri desktop shell (`@stillpoint/desktop`).

## First steps

Stillpoint requires two processes running in separate terminals.

**Terminal 1 — Start the server:**

```bash
SONIC_RUNTIME_PATH=/path/to/SonicRuntime.exe npx tsx packages/server/src/bin.ts
```

Replace `/path/to/SonicRuntime.exe` with the actual path to your sonic-runtime binary. On Windows, set the environment variable first or use:

```bash
set SONIC_RUNTIME_PATH=C:\path\to\SonicRuntime.exe
npx tsx packages/server/src/bin.ts
```

The server starts on port 3456. If the runtime connects successfully, you will see a log line confirming the connection.

**Terminal 2 — Start the UI:**

```bash
npm run dev --workspace=@stillpoint/ui
```

Open `http://localhost:5177` in your browser.

**Build your first mix:**

1. Select a category from the first dropdown (e.g., Rain)
2. Pick a sound from the second dropdown (e.g., Heavy Rain) — it starts playing immediately
3. Repeat to add more layers — all sounds play simultaneously
4. Drag any layer's volume slider to adjust its level
5. Click the x button on a layer to remove it, or press Stop All to clear everything

## Common tasks

### Adding custom sounds

Drop any `.wav` file into your custom sounds directory. Stillpoint scans this directory on every catalog request — no restart needed. Files appear under a "Custom" category.

Set the directory with `STILLPOINT_CUSTOM_PATH`, or use the default location: a `custom/` folder next to your ambient WAVs directory.

Filenames are converted to display names automatically: `my-rain.wav` becomes **My Rain**, `office-hum.wav` becomes **Office Hum**.

### Running without audio (NullBackend)

If you do not have the sonic-runtime binary, Stillpoint falls back to a NullBackend. The UI loads normally and you can explore the mixer interface, but no audio plays. An error banner at the top of the page indicates the runtime is missing.

### Using the Tauri desktop window

For a native window (no browser tab), run the Tauri dev command from a third terminal:

```bash
cd apps/desktop
npm run tauri dev
```

This opens Stillpoint in a native Tauri v2 window pointing at `http://localhost:5177`. The server and UI dev server must already be running.

### Changing the server port

Set the `PORT` environment variable before starting the server:

```bash
PORT=4000 npx tsx packages/server/src/bin.ts
```

## Troubleshooting

**"Audio engine not found" error banner**
The server cannot locate the sonic-runtime binary. Set `SONIC_RUNTIME_PATH` to the full path of your `SonicRuntime.exe` file.

**No sound plays but no error shown**
Check that your `AMBIENT_WAVS_PATH` points to a directory containing the expected WAV files (e.g., `heavy-rain.wav`, `fireplace.wav`). Each sound ID maps to a file named `{id}.wav`.

**"Audio engine stopped unexpectedly" error**
The sonic-runtime process crashed. Stillpoint attempts automatic restart. If the error persists, check the runtime's stderr output for details.

**UI shows "Pick a category" but dropdowns are empty**
The server is not running or the UI cannot reach it. Verify the server is listening on port 3456 and that no firewall is blocking localhost connections.

**Custom sounds do not appear**
Ensure your WAV files are in the correct directory and have the `.wav` extension (case-insensitive). Verify the path with `STILLPOINT_CUSTOM_PATH` or check that the default `custom/` folder exists next to your ambient WAVs directory.

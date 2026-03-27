---
title: Architecture
description: Three-process model, SSE state sync, and server design.
sidebar:
  order: 3
---

## Three-process model

Stillpoint runs as three cooperating processes:

```
┌──────────────────────────────┐
│  Tauri / Browser             │  window chrome
│  React + Vite (port 5177)   │
└──────────┬───────────────────┘
           │ REST + SSE
┌──────────▼───────────────────┐
│  Node.js server (port 3456)  │  sonic-core integration
│  Express + SidecarBackend    │
└──────────┬───────────────────┘
           │ ndjson-stdio-v1
┌──────────▼───────────────────┐
│  sonic-runtime (C# NativeAOT)│  real audio via OpenAL Soft
└──────────────────────────────┘
```

### Why three processes?

- **Tauri/Browser** — pure presentation layer. No audio logic, no state management beyond what SSE provides.
- **Node.js server** — owns the sonic-core SidecarBackend and SonicEngine. Manages multi-layer state, exposes REST API, and pushes updates via SSE.
- **sonic-runtime** — handles actual audio through OpenAL Soft. NativeAOT binary, no JIT, sub-millisecond response.

This keeps each layer focused: TypeScript for control flow, C# for audio, Rust for window chrome.

## Server design

### State management

The server maintains a `RegulatorState` object:

- `layers[]` — active sound layers, each with soundId, playbackId, and volume
- `deviceId` — currently selected output device
- `error` — current error state (if any)

State changes emit events via Node.js EventEmitter. The SSE endpoint subscribes and pushes the full state to all connected clients.

### Engine manager

`engine-manager.ts` follows the same pattern as sonic-core's service binary:

1. Resolve runtime path (SONIC_RUNTIME_PATH env → known fallback paths)
2. Create SidecarBackend with lifecycle hooks (onExit, onRestart, onEvent)
3. Wire `playback_ended` events to remove finished layers from state
4. Create SonicEngine with the backend
5. Fall back to NullBackend if runtime is unavailable

### NullBackend fallback

If the sonic-runtime binary is missing or fails to start, the engine manager falls back to `NullBackend` from sonic-core. This allows the server and UI to start normally for development and testing — the mixer interface works, but no audio is produced. An error banner in the UI indicates the runtime is unavailable.

### Graceful shutdown

The server process listens for `SIGINT` and `SIGTERM`. On shutdown, it closes the Express server and disposes the engine (which tears down the sonic-runtime sidecar process). This prevents orphaned runtime processes.

### REST API

All endpoints are under `/api`:

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/sounds` | Full catalog with categories |
| GET | `/devices` | Available output devices |
| GET | `/state` | Current mixer state |
| POST | `/layers/add` | Add a new layer |
| POST | `/layers/remove` | Remove a layer |
| POST | `/layers/volume` | Set layer volume |
| POST | `/stop-all` | Stop all layers |
| GET | `/events` | SSE stream |

### SSE (Server-Sent Events)

The `/api/events` endpoint maintains a persistent connection. On connect, it sends the current state immediately. On every state change, it pushes a `data:` message with the full `MixerState` JSON. Messages use the default SSE event type (no named `event:` field), so they arrive via the `onmessage` handler on the client.

## UI architecture

### useRegulator hook

The single `useRegulator()` hook manages all state:

- Opens `EventSource` to `/api/events` for real-time state
- Loads the sound catalog and device list on mount
- Provides debounced per-layer volume updates (50ms)
- Exposes: `state`, `catalog`, `devices`, `addLayer`, `removeLayer`, `setLayerVolume`, `stopAll`

### Components

- **SoundPicker** — two cascading dropdowns: category → sound
- **LayerStrip** — one per active layer: name, category, volume slider, remove button
- **DeviceSelect** — dropdown of available audio devices (display-only in the current build; device switching is wired but not yet connected to the engine)
- **ErrorBanner** — displays server errors with code and message (runtime crashed, file not found, etc.)

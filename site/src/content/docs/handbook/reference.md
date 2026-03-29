---
title: API Reference
description: REST API endpoints, environment variables, and sound catalog details.
sidebar:
  order: 4
---

## REST API

All endpoints are served by the Express server on port 3456. The Vite dev server proxies `/api` requests.

### Error responses

All endpoints return errors as JSON with an `error` field:

```json
{ "error": "description of the problem" }
```

Common HTTP status codes:

| Status | Meaning |
|--------|---------|
| 400 | Missing or invalid parameter (e.g., no `soundId` or `level` out of range) |
| 404 | Sound ID not found in catalog |
| 409 | Sound is already playing (duplicate layer), or MAX_LAYERS (8) reached |
| 429 | Rate limit exceeded (120 mutations per 10 seconds) |
| 500 | Engine or runtime error |

### Rate limiting

Mutation endpoints (POST, DELETE) are rate-limited to **120 requests per 10-second window** per IP. If the limit is exceeded the server returns `429` with `{ "error": "rate limit exceeded" }`. Read-only endpoints (GET) are not rate-limited.

### Layer limit

At most **8 layers** can be active simultaneously. Adding a ninth layer returns `409`.

---

### GET /api/health

Returns server health and runtime status.

```json
{
  "status": "ok",
  "backendMode": "sonic-runtime"
}
```

`backendMode` is `"sonic-runtime"` when the NativeAOT engine is connected, or `"mock"` when running in fallback mode.

---

### GET /api/sounds

Returns the full sound catalog.

```json
{
  "categories": ["Rain", "Water", "Ocean", ...],
  "sounds": [
    { "id": "heavy-rain", "name": "Heavy Rain", "category": "Rain" },
    ...
  ],
  "grouped": {
    "Rain": [{ "id": "heavy-rain", "name": "Heavy Rain", "category": "Rain" }, ...],
    ...
  }
}
```

---

### POST /api/sounds/reload

Hot-reloads the custom sounds directory (re-scans files and re-reads `_meta.json`). No request body needed. Returns the updated catalog.

```json
{
  "categories": ["Rain", ..., "Custom"],
  "sounds": [...],
  "grouped": { ... }
}
```

Use this after adding or removing files from the custom directory without restarting the server.

---

### GET /api/devices

Returns available audio output devices.

```json
[
  { "device_id": "default", "name": "Speakers (Realtek)", "is_default": true },
  { "device_id": "hdmi-1", "name": "HDMI Audio", "is_default": false }
]
```

---

### POST /api/device

Set the active audio output device and re-route all currently playing layers to it.

```json
{ "deviceId": "hdmi-1" }
```

Returns: `{ "ok": true }`

All active layers are moved to the new device immediately. New layers added after this call also use the selected device.

---

### GET /api/state

Returns current mixer state.

```json
{
  "layers": [
    { "soundId": "heavy-rain", "playbackId": "abc123", "volume": 0.7 },
    { "soundId": "fireplace", "playbackId": "def456", "volume": 0.4 }
  ],
  "deviceId": "default",
  "masterVolume": 1.0,
  "timer": null,
  "error": null
}
```

`timer` is `null` when no timer is active, or an object `{ "endsAt": "<ISO timestamp>", "remainingMs": 1740000 }` when a timer is running.

`masterVolume` is 0.0–1.0 (default `1.0`).

---

### POST /api/layers/add

Add a new sound layer.

```json
{ "soundId": "heavy-rain", "volume": 0.5, "fadeMs": 1000 }
```

`fadeMs` is optional. When provided, the layer fades in from silence to the target volume over the specified duration in milliseconds.

Returns: `{ "playbackId": "abc123" }`

The server loads the WAV asset, starts looping playback via sonic-core, and adds the layer to state.

---

### POST /api/layers/remove

Remove a layer and stop its playback.

```json
{ "playbackId": "abc123", "fadeMs": 800 }
```

`fadeMs` is optional. When provided, the layer fades out over the specified duration before stopping.

---

### POST /api/layers/volume

Set a layer's volume.

```json
{ "playbackId": "abc123", "level": 0.7 }
```

Level is 0.0–1.0.

---

### POST /api/volume/master

Set the master (global) volume. Scales the output of all layers simultaneously.

```json
{ "level": 0.8 }
```

Level is 0.0–1.0. Returns: `{ "ok": true }`

---

### POST /api/stop-all

Stop all active layers. No request body needed.

---

### GET /api/timer

Get the current timer state.

```json
{
  "active": true,
  "endsAt": "2026-03-29T23:30:00.000Z",
  "remainingMs": 1740000
}
```

Returns `{ "active": false }` when no timer is running.

---

### POST /api/timer

Start a sleep timer. When the timer expires, all layers stop automatically.

```json
{ "durationMs": 1800000 }
```

Common durations: 900000 (15m), 1800000 (30m), 3600000 (1h), 7200000 (2h).

Returns: `{ "endsAt": "<ISO timestamp>" }`

Starting a new timer while one is active replaces the existing timer.

---

### DELETE /api/timer

Cancel the active timer. The mix keeps playing. Returns `{ "ok": true }`.

---

### GET /api/presets

List all saved presets.

```json
[
  {
    "id": "evening-wind-down",
    "name": "Evening Wind Down",
    "layers": [
      { "soundId": "heavy-rain", "volume": 0.6 },
      { "soundId": "fireplace", "volume": 0.3 }
    ],
    "createdAt": "2026-03-28T20:00:00.000Z"
  }
]
```

---

### POST /api/presets

Save the current mix as a named preset.

```json
{ "name": "Evening Wind Down" }
```

Returns the new preset object including its generated `id`.

---

### POST /api/presets/:id/load

Load a saved preset. The current mix is stopped and replaced with the preset's layers.

No request body needed. Returns: `{ "ok": true }`

---

### DELETE /api/presets/:id

Delete a saved preset. Returns: `{ "ok": true }`

---

### GET /api/events

SSE endpoint. Sends `data:` messages with full `MixerState` JSON on every state change (default event type, no named `event:` field). First message is the current state on connect.

---

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SONIC_RUNTIME_PATH` | (fallback paths) | Path to sonic-runtime binary |
| `AMBIENT_WAVS_PATH` | `./ambient-wavs` | Directory containing ambient WAV files |
| `STILLPOINT_CUSTOM_PATH` | `<AMBIENT_WAVS_PATH>/../custom` | Directory for user-provided custom WAV files |
| `STILLPOINT_DATA_PATH` | `./data` | Directory where presets and other persistent data are stored |
| `STILLPOINT_CORS_ORIGINS` | `http://localhost:5177` | Comma-separated list of allowed CORS origins |
| `PORT` | `3456` | Server port |
| `VITE_API_BASE` | `http://localhost:3456` | API base URL used by the Vite UI (set at build time) |

### STILLPOINT_CORS_ORIGINS

By default the server only accepts requests from `http://localhost:5177`. To allow additional origins (for example, a remote dashboard or a second UI port), set this variable to a comma-separated list:

```bash
STILLPOINT_CORS_ORIGINS=http://localhost:5177,https://my-stillpoint.example.com
```

### VITE_API_BASE

The UI uses `VITE_API_BASE` to know where the server lives. Override it if the server is not on localhost or is running on a non-standard port:

```bash
VITE_API_BASE=http://192.168.1.100:3456 npm run build --workspace=@stillpoint/ui
```

---

## Sound asset format

Each sound references a WAV file at `${AMBIENT_WAVS_PATH}/${sound.id}.wav`:

- Format: WAV (PCM)
- Sample rate: 44,100 Hz
- Channels: Mono
- Duration: 60 seconds
- Loop-friendly: designed for seamless repetition

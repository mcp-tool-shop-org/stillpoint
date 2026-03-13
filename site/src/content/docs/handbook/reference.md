---
title: API Reference
description: REST API endpoints and sound catalog details.
sidebar:
  order: 4
---

## REST API

All endpoints are served by the Express server on port 3456. The Vite dev server proxies `/api` requests.

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

### GET /api/devices

Returns available audio output devices.

```json
[
  { "device_id": "default", "name": "Speakers (Realtek)", "is_default": true },
  { "device_id": "hdmi-1", "name": "HDMI Audio", "is_default": false }
]
```

### GET /api/state

Returns current mixer state.

```json
{
  "layers": [
    { "soundId": "heavy-rain", "playbackId": "abc123", "volume": 0.7 },
    { "soundId": "fireplace", "playbackId": "def456", "volume": 0.4 }
  ],
  "deviceId": null,
  "error": null
}
```

### POST /api/layers/add

Add a new sound layer.

```json
{ "soundId": "heavy-rain", "volume": 0.5 }
```

Returns: `{ "playbackId": "abc123" }`

The server loads the WAV asset, starts looping playback via sonic-core, and adds the layer to state.

### POST /api/layers/remove

Remove a layer and stop its playback.

```json
{ "playbackId": "abc123" }
```

### POST /api/layers/volume

Set a layer's volume.

```json
{ "playbackId": "abc123", "level": 0.7 }
```

Level is 0.0–1.0.

### POST /api/stop-all

Stop all active layers. No request body needed.

### GET /api/events

SSE endpoint. Sends `event: state` with full `MixerState` JSON on every state change. First message is the current state on connect.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SONIC_RUNTIME_PATH` | (fallback paths) | Path to sonic-runtime binary |
| `AMBIENT_WAVS_PATH` | `F:/AI/ambient-wavs/output` | Directory containing ambient WAV files |
| `PORT` | `3456` | Server port |

## Sound asset format

Each sound references a WAV file at `${AMBIENT_WAVS_PATH}/${sound.id}.wav`:

- Format: WAV (PCM)
- Sample rate: 44,100 Hz
- Channels: Mono
- Duration: 60 seconds
- Loop-friendly: designed for seamless repetition

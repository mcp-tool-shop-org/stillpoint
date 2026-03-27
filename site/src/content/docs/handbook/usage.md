---
title: Usage Guide
description: Using the mixer UI — adding sounds, controlling volume, and routing audio.
sidebar:
  order: 2
---

## The mixer

Stillpoint presents a layered mixer interface. Each sound you add becomes a "layer strip" with its own volume slider.

### Adding sounds

The toolbar has two dropdowns:

1. **Category** — filters the sound list (Rain, Water, Ocean, Wind, Fire, Night, Noise, Drone, Tone, Mechanical)
2. **Sound** — shows sounds in the selected category. Pick one to add it as a new layer.

Sounds that are already playing show "(playing)" and are disabled in the dropdown.

### Layer strips

Each active sound appears as a horizontal strip with:

- **Name** — the sound name (e.g., "Heavy Rain")
- **Category** — small label showing the category
- **Volume slider** — 0–100%, adjusts in real-time
- **Volume display** — current percentage
- **Remove button** (×) — stops and removes this layer

### Volume control

Drag any layer's slider to adjust its volume. Changes are applied immediately with a 50ms debounce to avoid flooding the server. The UI updates optimistically — you see the change before the server confirms.

### Stop All

When at least one layer is playing, a "Stop All" button appears in the toolbar. This stops every active layer at once.

## Device routing

The device dropdown (in the toolbar) shows all available audio output devices. In the current build, device selection is display-only — audio plays through the system default device. Full device routing is planned for a future release.

## Sound catalog

Stillpoint includes 50 ambient sounds across 10 categories:

| Category | Count | Sounds |
|----------|-------|--------|
| Rain | 7 | Heavy Rain, Light Rain, Drizzle, Rain on Roof, Rain in Forest, Thunderstorm, Distant Thunder |
| Water | 5 | Brook, River, Waterfall, Forest Stream, Cave Drips |
| Ocean | 5 | Ocean, Deep Ocean, Bay, Distant Shore, Rocky Coast |
| Wind | 4 | Gentle Wind, Cold Wind, Mountain Wind, Warm Breeze |
| Fire | 2 | Fireplace, Campfire |
| Night | 3 | Night Field, Still Night, Summer Night |
| Noise | 7 | White Noise, Pink Noise, Brown Noise, Dark Brown, Brown Surge, Static, Tape Hiss |
| Drone | 6 | Deep Drone, Warm Drone, High Drone, Fifth Drone, Deep Pad, Airy Pad |
| Tone | 6 | Singing Bowl, Bell, Organ, Glass, Shimmer, Hollow Pipe |
| Mechanical | 5 | Air Conditioner, Desk Fan, Floor Fan, Heartbeat, Pulse Beat |

Each sound is a 60-second, 44.1kHz mono WAV file designed for seamless looping.

## Custom sounds

You can add your own WAV files to the mixer. Drop any `.wav` file into the custom sounds directory and it appears in a "Custom" category automatically — no server restart needed.

### Custom sounds directory

Set `STILLPOINT_CUSTOM_PATH` to point to your directory, or use the default location: a `custom` folder next to the ambient WAVs directory.

```
ambient-wavs/
  output/         ← built-in sounds
  custom/         ← your WAV files go here
    my-rain.wav
    office-hum.wav
```

### Naming

Filenames become display names via kebab-to-title conversion:

| File | Display name |
|------|-------------|
| `my-rain.wav` | My Rain |
| `office-hum.wav` | Office Hum |
| `singing-bowl-low.wav` | Singing Bowl Low |

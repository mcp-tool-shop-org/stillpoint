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

The device dropdown (in the toolbar) shows all available audio output devices. Select a different device to route audio there.

## Sound catalog

Stillpoint includes 50 ambient sounds across 10 categories:

| Category | Sounds |
|----------|--------|
| Rain | Heavy Rain, Light Rain, Rain on Leaves, Rain on Tin Roof, Thunderstorm |
| Water | Brook, River, Waterfall, Dripping, Fountain |
| Ocean | Deep Ocean, Waves, Shore, Underwater, Harbor |
| Wind | Gentle Breeze, Strong Wind, Wind Chimes, Rustling Leaves, Howling Wind |
| Fire | Fireplace, Campfire, Crackling, Embers, Torch |
| Night | Cricket Field, Frogs, Owl, Night Forest, Night Field |
| Noise | White Noise, Pink Noise, Brown Noise, Grey Noise, Violet Noise |
| Drone | Low Drone, Mid Drone, High Drone, Binaural, Singing Bowl |
| Tone | Organ, Pad, Hum, Chant, Bell |
| Mechanical | Fan, Train, Clock, Engine, Washing Machine |

Each sound is a 60-second, 44.1kHz mono WAV file designed for seamless looping.

---
title: Usage Guide
description: Using the mixer UI — adding sounds, controlling volume, routing audio, presets, and more.
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

Up to **8 layers** can be active simultaneously. The add button is disabled once you reach the limit.

### Starter mixes

When no layers are active, the mixer shows three quick-start buttons in the empty state:

- **Rain + Fire** — pairs Heavy Rain with a Fireplace for a classic cozy mix
- **Focus** — Brown Noise plus a Warm Drone for deep concentration
- **Beach** — Ocean with a gentle Warm Breeze layer

Click any of these to load the mix immediately. You can then adjust volumes or add more layers.

### Layer strips

Each active sound appears as a horizontal strip with:

- **Name** — the sound name (e.g., "Heavy Rain")
- **Category** — small label showing the category
- **Volume slider** — 0–100%, adjusts in real-time
- **Volume display** — current percentage
- **Mute button** (M) — silences this layer without removing it (see [Muting layers](#muting-layers))
- **Remove button** (×) — stops and removes this layer

### Master volume

A master volume fader sits above the layer strips. It applies a global gain multiplier to all layers at once. If you want to dim everything without changing individual layer balances, drag master volume down rather than adjusting each strip. The master level persists across preset loads.

### Volume control

Drag any layer's slider to adjust its volume. Changes are applied immediately with a 100ms debounce to avoid flooding the server. The UI updates optimistically — you see the change before the server confirms.

### Muting layers

Each layer strip has an **M** (mute) button between the volume fader and the remove button. Clicking it:

- Instantly silences the layer (volume sent to the server drops to 0)
- Saves the previous volume level so it can be restored
- Turns the button blue to indicate the muted state

Click M again to un-mute and restore the saved volume.

Muting is not the same as removing — the sound stays in the mix and continues looping at zero gain, ready to fade back in.

### Stop All

When at least one layer is playing, a "Stop All" button appears in the toolbar. This stops every active layer at once. You can also press **Space** or **Esc** from anywhere in the app (see [Keyboard shortcuts](#keyboard-shortcuts)).

## Master volume

The master volume fader (above the layer strips) scales the output of all layers simultaneously. It is independent of per-layer volumes — pulling master to 50% halves the overall output without moving any individual slider. The server applies this as a post-mix gain.

## Sleep timer

The sleep timer automatically stops all playback after a set duration, useful for falling asleep to ambient sound without leaving the app running all night.

### Starting a timer

Timer buttons appear in the toolbar: **15m**, **30m**, **1h**, **2h**. Click one to start a countdown. Once active, a countdown display replaces the buttons showing the remaining time (e.g., `29:47`).

### Cancelling a timer

Click the **×** next to the countdown to cancel it. The mix keeps playing.

### What happens at zero

When the timer reaches zero, all layers stop — the same as pressing Stop All. The timer is then cleared.

## Presets

Presets let you save and restore named mixes. A preset captures the current set of layers and their individual volumes (not the master volume).

### Saving a preset

1. Set up a mix you want to keep
2. Click **Save preset** in the toolbar (or the save icon)
3. Enter a name — something descriptive like "Evening Wind Down" or "Deep Work"
4. Click Save

### Loading a preset

Open the presets panel and click a preset name to load it. The current mix is replaced with the saved layers (the server stops current layers and starts the saved ones).

### Deleting a preset

In the presets panel, click the trash icon next to a preset to delete it. There is no undo.

### Preset storage

Presets are stored as JSON files in the data directory (configured via `STILLPOINT_DATA_PATH`). They persist across restarts.

## Device routing

The device dropdown (in the toolbar) shows all available audio output devices. Selecting a device re-routes all currently active layers to the chosen output immediately — no restart needed.

The selected device is remembered and applied when new layers are added.

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Stop all layers |
| `Esc` | Stop all layers |

These work from anywhere in the UI without needing to click a button first.

## System tray

On the Tauri desktop build, Stillpoint minimizes to the system tray instead of closing:

- **Closing the window** (× button) hides the window — the mixer keeps playing in the tray
- **Minimizing** also sends the app to the tray
- **Tray menu** provides three options: **Show** (bring the window back), **Hide** (hide the window), **Quit** (exit the app and stop playback)
- **Double-clicking** the tray icon shows or hides the window

This lets you leave a mix running while keeping your taskbar uncluttered.

## Connection indicator

A small colored dot appears in the header:

- **Green** — the UI is connected to the server via SSE and receiving state updates
- **Red** — the connection is lost (server not running, or network issue)

If the dot turns red, check that the server is still running on port 3456.

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
    _meta.json    ← optional metadata overrides
```

### Naming

Filenames become display names via kebab-to-title conversion:

| File | Display name |
|------|-------------|
| `my-rain.wav` | My Rain |
| `office-hum.wav` | Office Hum |
| `singing-bowl-low.wav` | Singing Bowl Low |

### Metadata overrides (_meta.json)

For finer control over how your custom sounds appear, create a `_meta.json` file in the custom directory:

```json
{
  "my-rain": {
    "name": "Monsoon",
    "category": "Rain"
  },
  "office-hum": {
    "name": "Server Room",
    "category": "Noise"
  }
}
```

Keys are the filename without extension. You can override `name`, `category`, or both. Sounds without an entry use the default kebab-to-title name and the "Custom" category.

To reload custom sounds and metadata without restarting the server, use `POST /api/sounds/reload`.

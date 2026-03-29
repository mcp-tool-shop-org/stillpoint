---
title: Handbook
description: Complete guide to using and developing Stillpoint.
sidebar:
  order: 0
---

Welcome to the Stillpoint handbook. This is the complete guide to using the ambient sound mixer and understanding how it works under the hood.

**New here?** Start with the [Beginner's Guide](/stillpoint/handbook/beginners/) for a step-by-step introduction.

## What's inside

- **[Beginner's Guide](/stillpoint/handbook/beginners/)** — New to Stillpoint? Start here
- **[Getting Started](/stillpoint/handbook/getting-started/)** — Install, set up, and run your first mix
- **[Usage](/stillpoint/handbook/usage/)** — Mixer UI, master volume, muting, sleep timer, presets, device routing, system tray, keyboard shortcuts, and custom sounds
- **[Architecture](/stillpoint/handbook/architecture/)** — Three-process model, SSE, and server design
- **[API Reference](/stillpoint/handbook/reference/)** — REST endpoints, environment variables, and sound catalog

## What Stillpoint is

Stillpoint is an ambient sound mixer for focus and nervous system regulation. It lets you layer multiple ambient sounds — rain, fire, ocean, brown noise, and more — with independent volume control per layer.

Key features:

- **50 built-in sounds** across 10 categories, plus custom WAV support
- **Master volume** — global gain fader that scales all layers at once
- **Per-layer mute** — silence a layer without removing it
- **Sleep timer** — auto-stop after 15m, 30m, 1h, or 2h
- **Presets** — save and restore named mixes
- **Device routing** — send audio to any output device
- **System tray** — keep the app running in the background (Tauri desktop)
- **Starter mixes** — quick-start buttons for common ambient combinations
- **REST API** — full programmatic control via HTTP

It's the first consumer application built on [sonic-core](https://github.com/mcp-tool-shop-org/sonic-core) and [sonic-runtime](https://github.com/mcp-tool-shop-org/sonic-runtime), proving the platform is useful to an actual person.

## What Stillpoint is not

- Not a music player or streaming service
- Not a therapy tool (no sessions, profiles, or treatment protocols)
- Not a DAW or audio editor
- No cloud services — everything runs locally

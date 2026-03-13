# Changelog

## v0.1.0

- Initial release: ambient sound mixer powered by sonic-core
- **Layered mixer** — add multiple sounds with independent volume control
- **50 ambient sounds** across 10 categories (rain, water, ocean, wind, fire, night, noise, drone, tone, mechanical)
- **Category browser** — dropdown-organized sound picker with "playing" indicators
- **Per-layer volume** — range sliders with debounced real-time adjustment
- **Device routing** — audio output device selection
- **SSE state sync** — real-time state updates from server to UI
- **Tauri desktop** — native window shell via Tauri v2
- Express server with REST API + SSE events
- sonic-core SidecarBackend integration (SonicEngine + auto-restart)

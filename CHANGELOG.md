# Changelog

## [1.1.0] - 2026-03-29

### Added
- **POST /device** — REST endpoint to set audio output device programmatically
- **Master volume** — global volume control that scales all layers simultaneously
- **Sleep timer** — auto-stop playback after a configurable duration
- **Saved presets** — save and load named mixes (layer set + volumes)
- **Fade in/out** — smooth volume transitions when adding or removing layers
- **Per-layer mute** — toggle individual layers silent without removing them
- **System tray** — minimize to tray; app continues playing in the background
- **Catalog cache** — sound catalog is cached on first load; subsequent opens are instant
- **Device re-routing** — switch audio output device while playback is live without stopping layers
- **Keyboard shortcuts** — global hotkeys for play/pause, mute-all, and preset cycling
- **Playback indicators** — active layers are highlighted in the catalog browser while playing
- **Rate limit increase** — SSE event throughput raised; rapid layer changes no longer queue up
- **Custom sound metadata** — custom WAV files expose duration and file size via catalog API
- **Starter mixes** — bundled preset mixes ship with the app for instant first-use experience
- **Window title** — Tauri window title reflects current preset name when a preset is loaded
- **Ghost layer cleanup** — removing a sound that failed to start no longer leaves a ghost entry in the layer list
- **Cargo dependabot** — monthly Rust dependency updates for `apps/desktop/src-tauri`

### Changed
- **CI: site PR build gate** — `pages.yml` now runs the build job on pull requests targeting `site/**`; deploy step is skipped on PRs and only runs on push to main
- **CI: site paths added** — `ci.yml` paths filter now includes `site/**` so site changes trigger the main CI pipeline

## [1.0.1] - 2026-03-25

### Added
- Version alignment test suite (3 tests)

### Changed
- SHA-pin CI workflow actions (checkout, setup-node, upload-pages-artifact, deploy-pages) for supply chain security
- CHANGELOG reformatted to Keep a Changelog standard

## [1.0.0] - 2026-02-27

### Changed
- Promoted to v1.0.0 — production-stable release

## [0.1.0] - 2026-02-20

### Added
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

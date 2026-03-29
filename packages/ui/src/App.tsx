import { useMemo } from "react";
import { useRegulator } from "./hooks/useRegulator.js";
import { SoundPicker } from "./components/SoundPicker.js";
import { LayerStrip } from "./components/LayerStrip.js";
import { DeviceSelect } from "./components/DeviceSelect.js";
import { ErrorBanner } from "./components/ErrorBanner.js";
import "./app.css";

const TIMER_OPTIONS: { label: string; seconds: number }[] = [
  { label: "15m", seconds: 15 * 60 },
  { label: "30m", seconds: 30 * 60 },
  { label: "1h",  seconds: 60 * 60 },
  { label: "2h",  seconds: 120 * 60 },
];

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function App() {
  const {
    state,
    catalog,
    catalogLoading,
    connected,
    stopping,
    devices,
    presets,
    timerDisplay,
    addLayer,
    removeLayer,
    setLayerVolume,
    toggleMute,
    isMuted,
    stopAll,
    setDevice,
    setMasterVolume,
    savePreset,
    loadPreset,
    deletePreset,
    setTimer,
    cancelTimer,
  } = useRegulator();

  const activeSoundIds = useMemo(
    () => new Set(state.layers.map((l) => l.soundId)),
    [state.layers],
  );

  const soundMap = useMemo(() => {
    const m = new Map<string, (typeof catalog.sounds)[0]>();
    for (const s of catalog.sounds) m.set(s.id, s);
    return m;
  }, [catalog.sounds]);

  return (
    <div className="stillpoint">
      <header className="header">
        <h1>Stillpoint</h1>
        <span
          className="connection-dot"
          data-connected={connected}
          title={connected ? "Connected" : "Disconnected"}
          aria-label={connected ? "Server connected" : "Server disconnected"}
        />
      </header>

      <ErrorBanner error={state.error} />

      <main className="main">
        <div className="mixer">
          <div className="mixer-toolbar">
            {catalogLoading ? (
              <span className="catalog-loading">Loading sounds…</span>
            ) : (
              <SoundPicker
                catalog={catalog}
                activeSoundIds={activeSoundIds}
                onAdd={addLayer}
              />
            )}

            <div className="toolbar-right">
              <DeviceSelect
                devices={devices}
                currentDeviceId={state.deviceId}
                onChange={setDevice}
              />
              {state.layers.length > 0 && (
                <button
                  className="stop-all-btn"
                  onClick={stopAll}
                  disabled={stopping}
                >
                  {stopping ? "Stopping…" : "Stop All"}
                </button>
              )}
            </div>
          </div>

          {/* FT-FE-004: Sleep timer */}
          <div className="sleep-timer">
            <span className="sleep-timer-label">Sleep</span>
            {timerDisplay !== null ? (
              <>
                <span className="sleep-timer-countdown">{formatCountdown(timerDisplay)}</span>
                <button className="sleep-timer-cancel" onClick={cancelTimer}>Cancel</button>
              </>
            ) : (
              TIMER_OPTIONS.map((opt) => (
                <button
                  key={opt.seconds}
                  className="sleep-timer-btn"
                  onClick={() => setTimer(opt.seconds)}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>

          {/* FT-FE-001: Master volume */}
          <div className="master-volume">
            <label className="master-volume-label" htmlFor="master-vol">Master</label>
            <input
              id="master-vol"
              type="range"
              className="master-volume-fader"
              min={0}
              max={100}
              value={Math.round((state.masterVolume ?? 1) * 100)}
              onChange={(e) => setMasterVolume(Number(e.target.value) / 100)}
              aria-label="Master volume"
            />
            <span className="master-volume-display">
              {Math.round((state.masterVolume ?? 1) * 100)}%
            </span>
          </div>

          {/* FT-FE-003: Presets */}
          <div className="presets">
            <button className="presets-save-btn" onClick={savePreset}>Save Mix</button>
            {presets.length > 0 && (
              <div className="presets-list">
                {presets.map((p) => (
                  <span key={p.id} className="preset-chip">
                    <button
                      className="preset-chip-name"
                      onClick={() => loadPreset(p.id)}
                      title={`Load "${p.name}"`}
                    >
                      {p.name}
                    </button>
                    <button
                      className="preset-chip-delete"
                      onClick={() => deletePreset(p.id)}
                      title={`Delete "${p.name}"`}
                      aria-label={`Delete preset ${p.name}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="layers">
            {state.layers.length === 0 ? (
              <div className="empty-state">
                Pick a category, then add sounds to build your mix.
              </div>
            ) : (
              state.layers.map((layer) => (
                <LayerStrip
                  key={layer.playbackId}
                  sound={soundMap.get(layer.soundId)}
                  playbackId={layer.playbackId}
                  volume={layer.volume}
                  muted={isMuted(layer.playbackId)}
                  catalogLoaded={!catalogLoading}
                  onVolumeChange={setLayerVolume}
                  onMute={toggleMute}
                  onRemove={removeLayer}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

import { useMemo } from "react";
import { useRegulator } from "./hooks/useRegulator.js";
import { SoundPicker } from "./components/SoundPicker.js";
import { LayerStrip } from "./components/LayerStrip.js";
import { DeviceSelect } from "./components/DeviceSelect.js";
import { ErrorBanner } from "./components/ErrorBanner.js";
import "./app.css";

export function App() {
  const {
    state,
    catalog,
    catalogLoading,
    connected,
    stopping,
    devices,
    addLayer,
    removeLayer,
    setLayerVolume,
    stopAll,
    setDevice,
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
                  catalogLoaded={!catalogLoading}
                  onVolumeChange={setLayerVolume}
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

import { useRegulator } from "./hooks/useRegulator.js";
import { PresetGrid } from "./components/PresetGrid.js";
import { NowPlaying } from "./components/NowPlaying.js";
import { ErrorBanner } from "./components/ErrorBanner.js";
import "./app.css";

export function App() {
  const { state, presets, devices, play, stop, setVolume, refreshDevices } =
    useRegulator();

  const activePreset = presets.find((p) => p.id === state.currentPresetId);
  const isPlaying = state.status === "playing";

  const handlePresetClick = (presetId: string) => {
    if (state.currentPresetId === presetId && isPlaying) {
      stop();
    } else {
      play(presetId);
    }
  };

  const handleDeviceChange = (deviceId: string | null) => {
    // If currently playing, replay on the new device
    if (state.currentPresetId && isPlaying) {
      play(state.currentPresetId);
    }
  };

  return (
    <div className="stillpoint">
      <header className="header">
        <h1>Stillpoint</h1>
      </header>

      <ErrorBanner error={state.error} />

      <main className="main">
        <PresetGrid
          presets={presets}
          activePresetId={state.currentPresetId}
          onSelect={handlePresetClick}
        />
      </main>

      {isPlaying && (
        <footer className="footer">
          <NowPlaying
            preset={activePreset}
            volume={state.volume}
            devices={devices}
            currentDeviceId={state.deviceId}
            onStop={stop}
            onVolumeChange={setVolume}
            onDeviceChange={handleDeviceChange}
          />
        </footer>
      )}
    </div>
  );
}

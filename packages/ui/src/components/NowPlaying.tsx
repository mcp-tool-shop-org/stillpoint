import type { AmbientPreset, DeviceInfo } from "../lib/api.js";
import { DeviceSelect } from "./DeviceSelect.js";

interface Props {
  preset: AmbientPreset | undefined;
  volume: number;
  devices: DeviceInfo[];
  currentDeviceId: string | null;
  onStop: () => void;
  onVolumeChange: (level: number) => void;
  onDeviceChange: (deviceId: string | null) => void;
}

export function NowPlaying({
  preset,
  volume,
  devices,
  currentDeviceId,
  onStop,
  onVolumeChange,
  onDeviceChange,
}: Props) {
  if (!preset) return null;

  return (
    <div className="now-playing">
      <div className="now-playing-info">
        <span className="now-playing-icon">{preset.icon}</span>
        <span className="now-playing-name">{preset.name}</span>
      </div>

      <div className="now-playing-controls">
        <DeviceSelect
          devices={devices}
          currentDeviceId={currentDeviceId}
          onChange={onDeviceChange}
        />

        <div className="volume-control">
          <label htmlFor="volume">Vol</label>
          <input
            id="volume"
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
          />
          <span className="volume-value">{Math.round(volume * 100)}%</span>
        </div>

        <button className="stop-btn" onClick={onStop} title="Stop playback">
          Stop
        </button>
      </div>
    </div>
  );
}

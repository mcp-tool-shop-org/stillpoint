import type { AmbientSound } from "../lib/api.js";

interface Props {
  sound: AmbientSound | undefined;
  playbackId: string;
  volume: number;
  onVolumeChange: (playbackId: string, level: number) => void;
  onRemove: (playbackId: string) => void;
}

export function LayerStrip({
  sound,
  playbackId,
  volume,
  onVolumeChange,
  onRemove,
}: Props) {
  return (
    <div className="layer-strip">
      <div className="layer-info">
        <span className="layer-name">{sound?.name ?? "Unknown"}</span>
        <span className="layer-category">{sound?.category ?? '—'}</span>
      </div>

      <input
        type="range"
        className="layer-fader"
        min={0}
        max={100}
        value={Math.round(volume * 100)}
        onChange={(e) =>
          onVolumeChange(playbackId, Number(e.target.value) / 100)
        }
        title={`${Math.round(volume * 100)}%`}
        aria-label={`Volume for ${sound?.name ?? 'layer'}`}
      />

      <span className="layer-volume">{Math.round(volume * 100)}%</span>

      <button
        className="layer-remove"
        onClick={() => onRemove(playbackId)}
        title="Remove layer"
        aria-label={`Remove ${sound?.name ?? 'layer'}`}
      >
        ×
      </button>
    </div>
  );
}

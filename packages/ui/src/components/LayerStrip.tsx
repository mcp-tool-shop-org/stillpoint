import type { AmbientSound } from "../lib/api.js";

interface Props {
  sound: AmbientSound | undefined;
  playbackId: string;
  volume: number;
  muted: boolean;
  catalogLoaded: boolean;
  onVolumeChange: (playbackId: string, level: number) => void;
  onMute: (playbackId: string, currentVolume: number) => void;
  onRemove: (playbackId: string) => void;
}

export function LayerStrip({
  sound,
  playbackId,
  volume,
  muted,
  catalogLoaded,
  onVolumeChange,
  onMute,
  onRemove,
}: Props) {
  // Sound not found after catalog has loaded — show degraded mini-state
  if (!sound && catalogLoaded) {
    return (
      <div className="layer-strip layer-strip--missing">
        <div className="layer-info">
          <span className="layer-name layer-name--missing">Sound not found</span>
          <span className="layer-category">unavailable</span>
        </div>
        <button
          className="layer-remove"
          onClick={() => onRemove(playbackId)}
          title="Remove layer"
          aria-label="Remove unavailable layer"
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <div className="layer-strip">
      <div className="layer-info">
        <span className="layer-name">
          {sound?.name ?? "…"}
          <span
            className={`layer-playing-dot${muted ? " layer-playing-dot--muted" : ""}`}
            aria-hidden="true"
          />
        </span>
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
        className={`layer-mute${muted ? " layer-mute--muted" : ""}`}
        onClick={() => onMute(playbackId, volume)}
        title={muted ? "Unmute" : "Mute"}
        aria-label={muted ? `Unmute ${sound?.name ?? 'layer'}` : `Mute ${sound?.name ?? 'layer'}`}
        aria-pressed={muted}
      >
        M
      </button>

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

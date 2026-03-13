import type { AmbientPreset } from "../lib/api.js";

interface Props {
  presets: AmbientPreset[];
  activePresetId: string | null;
  onSelect: (presetId: string) => void;
  disabled?: boolean;
}

export function PresetGrid({ presets, activePresetId, onSelect, disabled }: Props) {
  return (
    <div className="preset-grid">
      {presets.map((p) => (
        <button
          key={p.id}
          className={`preset-card ${p.id === activePresetId ? "active" : ""}`}
          onClick={() => onSelect(p.id)}
          disabled={disabled}
          title={p.description}
        >
          <span className="preset-icon">{p.icon}</span>
          <span className="preset-name">{p.name}</span>
          <span className="preset-desc">{p.description}</span>
        </button>
      ))}
    </div>
  );
}

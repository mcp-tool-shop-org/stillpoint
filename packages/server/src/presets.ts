/**
 * Ambient sound presets.
 *
 * Each preset maps to a WAV file in the ambient-wavs output directory.
 * The asset_ref is constructed at runtime from AMBIENT_WAVS_PATH.
 */

export interface AmbientPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
}

export const DEFAULT_PRESETS: AmbientPreset[] = [
  {
    id: "heavy-rain",
    name: "Heavy Rain",
    description: "Steady downpour",
    category: "Rain",
    icon: "🌧️",
  },
  {
    id: "fireplace",
    name: "Fireplace",
    description: "Crackling hearth",
    category: "Fire",
    icon: "🔥",
  },
  {
    id: "deep-ocean",
    name: "Deep Ocean",
    description: "Submerged depths",
    category: "Ocean",
    icon: "🌊",
  },
  {
    id: "brown-noise",
    name: "Brown Noise",
    description: "Deep broadband noise",
    category: "Noise",
    icon: "🔈",
  },
  {
    id: "night-field",
    name: "Night Field",
    description: "Crickets and night ambiance",
    category: "Night",
    icon: "🌙",
  },
];

/**
 * Resolve the ambient WAVs directory.
 * Priority: AMBIENT_WAVS_PATH env var → default path.
 */
export function getWavsPath(): string {
  return (
    process.env.AMBIENT_WAVS_PATH ?? "F:/AI/ambient-wavs/output"
  );
}

/**
 * Build a file:// asset_ref for a preset.
 */
export function presetAssetRef(preset: AmbientPreset): string {
  const base = getWavsPath().replace(/\\/g, "/");
  return `file:///${base}/${preset.id}.wav`;
}

/**
 * Find a preset by ID. Returns undefined if not found.
 */
export function findPreset(id: string): AmbientPreset | undefined {
  return DEFAULT_PRESETS.find((p) => p.id === id);
}

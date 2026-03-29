/**
 * Ambient sound catalog for Stillpoint.
 *
 * Built-in sounds from ambient-wavs, plus user-provided custom WAVs.
 * Each sound maps to a WAV file — built-ins from AMBIENT_WAVS_PATH,
 * custom sounds from STILLPOINT_CUSTOM_PATH.
 */

import { readdirSync, existsSync } from "node:fs";

const log = (msg: string) => process.stderr.write(`[stillpoint] ${msg}\n`);

export interface AmbientSound {
  id: string;
  name: string;
  category: string;
}

export const CATEGORIES = [
  "Rain",
  "Water",
  "Ocean",
  "Wind",
  "Fire",
  "Night",
  "Noise",
  "Drone",
  "Tone",
  "Mechanical",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const SOUNDS: AmbientSound[] = [
  // Rain
  { id: "heavy-rain", name: "Heavy Rain", category: "Rain" },
  { id: "light-rain", name: "Light Rain", category: "Rain" },
  { id: "drizzle", name: "Drizzle", category: "Rain" },
  { id: "rain-on-roof", name: "Rain on Roof", category: "Rain" },
  { id: "rain-in-forest", name: "Rain in Forest", category: "Rain" },
  { id: "thunderstorm", name: "Thunderstorm", category: "Rain" },
  { id: "distant-thunder", name: "Distant Thunder", category: "Rain" },

  // Water
  { id: "brook", name: "Brook", category: "Water" },
  { id: "river", name: "River", category: "Water" },
  { id: "waterfall", name: "Waterfall", category: "Water" },
  { id: "forest-stream", name: "Forest Stream", category: "Water" },
  { id: "cave-drips", name: "Cave Drips", category: "Water" },

  // Ocean
  { id: "ocean", name: "Ocean", category: "Ocean" },
  { id: "deep-ocean", name: "Deep Ocean", category: "Ocean" },
  { id: "bay", name: "Bay", category: "Ocean" },
  { id: "distant-shore", name: "Distant Shore", category: "Ocean" },
  { id: "rocky-coast", name: "Rocky Coast", category: "Ocean" },

  // Wind
  { id: "gentle-wind", name: "Gentle Wind", category: "Wind" },
  { id: "cold-wind", name: "Cold Wind", category: "Wind" },
  { id: "mountain-wind", name: "Mountain Wind", category: "Wind" },
  { id: "warm-breeze", name: "Warm Breeze", category: "Wind" },

  // Fire
  { id: "fireplace", name: "Fireplace", category: "Fire" },
  { id: "campfire", name: "Campfire", category: "Fire" },

  // Night
  { id: "night-field", name: "Night Field", category: "Night" },
  { id: "still-night", name: "Still Night", category: "Night" },
  { id: "summer-night", name: "Summer Night", category: "Night" },

  // Noise
  { id: "white-noise", name: "White Noise", category: "Noise" },
  { id: "pink-noise", name: "Pink Noise", category: "Noise" },
  { id: "brown-noise", name: "Brown Noise", category: "Noise" },
  { id: "dark-brown", name: "Dark Brown", category: "Noise" },
  { id: "brown-surge", name: "Brown Surge", category: "Noise" },
  { id: "static", name: "Static", category: "Noise" },
  { id: "tape-hiss", name: "Tape Hiss", category: "Noise" },

  // Drone
  { id: "deep-drone", name: "Deep Drone", category: "Drone" },
  { id: "warm-drone", name: "Warm Drone", category: "Drone" },
  { id: "high-drone", name: "High Drone", category: "Drone" },
  { id: "fifth-drone", name: "Fifth Drone", category: "Drone" },
  { id: "deep-pad", name: "Deep Pad", category: "Drone" },
  { id: "airy-pad", name: "Airy Pad", category: "Drone" },

  // Tone
  { id: "singing-bowl", name: "Singing Bowl", category: "Tone" },
  { id: "bell", name: "Bell", category: "Tone" },
  { id: "organ", name: "Organ", category: "Tone" },
  { id: "glass", name: "Glass", category: "Tone" },
  { id: "shimmer", name: "Shimmer", category: "Tone" },
  { id: "hollow-pipe", name: "Hollow Pipe", category: "Tone" },

  // Mechanical
  { id: "air-conditioner", name: "Air Conditioner", category: "Mechanical" },
  { id: "desk-fan", name: "Desk Fan", category: "Mechanical" },
  { id: "floor-fan", name: "Floor Fan", category: "Mechanical" },
  { id: "heartbeat", name: "Heartbeat", category: "Mechanical" },
  { id: "pulse-beat", name: "Pulse Beat", category: "Mechanical" },
];

/** Resolve the ambient WAVs directory. */
export function getWavsPath(): string {
  const resolved = process.env.AMBIENT_WAVS_PATH ?? "./ambient-wavs";
  if (!process.env.AMBIENT_WAVS_PATH) {
    log("AMBIENT_WAVS_PATH not set, using ./ambient-wavs");
  }
  if (!existsSync(resolved)) {
    log(`Warning: ambient WAVs directory not found at "${resolved}". Audio playback will fail until AMBIENT_WAVS_PATH points to a valid directory.`);
  }
  return resolved;
}

/** Resolve the custom sounds directory. */
export function getCustomPath(): string {
  if (process.env.STILLPOINT_CUSTOM_PATH) return process.env.STILLPOINT_CUSTOM_PATH;
  const wavsPath = getWavsPath();
  return `${wavsPath}/../custom`.replace(/\\/g, "/");
}

/** Convert kebab-case filename to Title Case display name. */
function kebabToTitle(kebab: string): string {
  return kebab.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Scan the custom sounds directory for WAV files. */
export function scanCustomSounds(): AmbientSound[] {
  const dir = getCustomPath();
  if (!existsSync(dir)) return [];
  try {
    const mapped = readdirSync(dir)
      .filter((f) => f.toLowerCase().endsWith(".wav"))
      .sort()
      .map((f) => {
        const stem = f.replace(/\.wav$/i, "");
        return { id: `custom:${stem}`, name: kebabToTitle(stem), category: "Custom" };
      });
    const seen = new Set<string>();
    const deduped: AmbientSound[] = [];
    for (const sound of mapped) {
      if (seen.has(sound.id)) {
        log(`Warning: custom sound ID collision "${sound.id}" — skipping duplicate`);
      } else {
        seen.add(sound.id);
        deduped.push(sound);
      }
    }
    return deduped;
  } catch (err) {
    log(`Failed to scan custom sounds directory "${dir}": ${err instanceof Error ? err.message : err}`);
    return [];
  }
}

/** Build a file:// asset_ref for a sound. */
export function soundAssetRef(sound: AmbientSound): string {
  if (sound.id.startsWith("custom:")) {
    const filename = sound.id.slice("custom:".length);
    if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
      throw new Error(`Invalid custom sound id: ${sound.id}`);
    }
    const base = getCustomPath().replace(/\\/g, "/");
    return `file:///${base}/${filename}.wav`;
  }
  const base = getWavsPath().replace(/\\/g, "/");
  return `file:///${base}/${sound.id}.wav`;
}

/** Find a sound by ID (searches built-in and custom). */
export function findSound(id: string): AmbientSound | undefined {
  const builtin = SOUNDS.find((s) => s.id === id);
  if (builtin) return builtin;
  if (id.startsWith("custom:")) {
    return scanCustomSounds().find((s) => s.id === id);
  }
  return undefined;
}

/** Build the full catalog (built-in + custom). */
export function buildCatalog(): {
  categories: string[];
  sounds: AmbientSound[];
  grouped: Record<string, AmbientSound[]>;
} {
  const custom = scanCustomSounds();
  const allSounds = [...SOUNDS, ...custom];
  const cats: string[] =
    custom.length > 0 ? [...CATEGORIES, "Custom"] : [...CATEGORIES];
  const grouped: Record<string, AmbientSound[]> = {};
  for (const cat of cats) {
    grouped[cat] = allSounds.filter((s) => s.category === cat);
  }
  return { categories: cats, sounds: allSounds, grouped };
}

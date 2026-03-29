/**
 * Preset persistence for Stillpoint.
 *
 * Presets are stored as JSON in a configurable data directory.
 * The data path defaults to the parent of the custom sounds directory.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import type { Preset } from "./state.js";
import { getCustomPath } from "./presets.js";

export type { Preset };

const log = (msg: string) => process.stderr.write(`[stillpoint] ${msg}\n`);

function getDataPath(): string {
  if (process.env.STILLPOINT_DATA_PATH) return process.env.STILLPOINT_DATA_PATH;
  // Parent of the custom sounds directory
  const customPath = getCustomPath().replace(/\\/g, "/");
  const parts = customPath.split("/");
  parts.pop();
  return parts.join("/");
}

function getPresetsFile(): string {
  return `${getDataPath()}/presets.json`;
}

function readAll(): Preset[] {
  const file = getPresetsFile();
  if (!existsSync(file)) return [];
  try {
    const raw = readFileSync(file, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Preset[];
  } catch (err) {
    log(`Failed to read presets file "${file}": ${err instanceof Error ? err.message : err}`);
    return [];
  }
}

function writeAll(presets: Preset[]): void {
  const file = getPresetsFile();
  const dir = getDataPath();
  try {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(file, JSON.stringify(presets, null, 2), "utf-8");
  } catch (err) {
    log(`Failed to write presets file "${file}": ${err instanceof Error ? err.message : err}`);
    throw err;
  }
}

/** List all saved presets. */
export function list(): Preset[] {
  return readAll();
}

/** Save the current mix as a named preset. Returns the new preset. */
export function save(name: string, layers: { soundId: string; volume: number }[]): Preset {
  const presets = readAll();
  const preset: Preset = {
    id: randomUUID(),
    name,
    layers: layers.map(l => ({ soundId: l.soundId, volume: l.volume })),
  };
  presets.push(preset);
  writeAll(presets);
  return preset;
}

/** Load a preset by ID. Returns undefined if not found. */
export function load(id: string): Preset | undefined {
  const presets = readAll();
  return presets.find(p => p.id === id);
}

/** Remove a preset by ID. Returns true if removed, false if not found. */
export function remove(id: string): boolean {
  const presets = readAll();
  const idx = presets.findIndex(p => p.id === id);
  if (idx === -1) return false;
  presets.splice(idx, 1);
  writeAll(presets);
  return true;
}

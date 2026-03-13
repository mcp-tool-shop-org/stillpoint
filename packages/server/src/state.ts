/**
 * Application state for Stillpoint.
 *
 * Single source of truth for current playback, volume, device, and errors.
 * Emits change events for SSE broadcast.
 */
import { EventEmitter } from "node:events";

export interface AppState {
  status: "idle" | "playing" | "error";
  currentPresetId: string | null;
  currentPlaybackId: string | null;
  volume: number;
  deviceId: string | null;
  error: { code: string; message: string } | null;
}

const INITIAL_STATE: AppState = {
  status: "idle",
  currentPresetId: null,
  currentPlaybackId: null,
  volume: 0.5,
  deviceId: null,
  error: null,
};

export class RegulatorState extends EventEmitter {
  #state: AppState = { ...INITIAL_STATE };

  get current(): Readonly<AppState> {
    return { ...this.#state };
  }

  update(patch: Partial<AppState>): void {
    Object.assign(this.#state, patch);
    // Clear error when transitioning to non-error state
    if (patch.status && patch.status !== "error" && !patch.error) {
      this.#state.error = null;
    }
    this.emit("change", this.current);
  }

  setPlaying(presetId: string, playbackId: string): void {
    this.update({
      status: "playing",
      currentPresetId: presetId,
      currentPlaybackId: playbackId,
      error: null,
    });
  }

  setIdle(): void {
    this.update({
      status: "idle",
      currentPresetId: null,
      currentPlaybackId: null,
    });
  }

  setError(code: string, message: string): void {
    this.update({
      status: "error",
      error: { code, message },
    });
  }

  setVolume(level: number): void {
    this.update({ volume: Math.max(0, Math.min(1, level)) });
  }

  setDevice(deviceId: string | null): void {
    this.update({ deviceId });
  }

  clearError(): void {
    if (this.#state.error) {
      this.update({ error: null });
    }
  }
}

/**
 * Application state for Stillpoint — layered mixer model.
 *
 * Multiple sounds can play simultaneously, each as a "layer"
 * with independent volume control. Emits change events for SSE broadcast.
 */
import { EventEmitter } from "node:events";

export interface Layer {
  soundId: string;
  playbackId: string;
  volume: number;
}

export interface MixerState {
  layers: Layer[];
  deviceId: string | null;
  error: { code: string; message: string } | null;
}

export class RegulatorState extends EventEmitter {
  #state: MixerState = { layers: [], deviceId: null, error: null };

  get current(): Readonly<MixerState> {
    return { ...this.#state, layers: [...this.#state.layers] };
  }

  #emit(): void {
    this.emit("change", this.current);
  }

  addLayer(soundId: string, playbackId: string, volume: number): void {
    this.#state.layers.push({ soundId, playbackId, volume });
    this.#state.error = null;
    this.#emit();
  }

  removeLayer(playbackId: string): void {
    this.#state.layers = this.#state.layers.filter(
      (l) => l.playbackId !== playbackId,
    );
    this.#emit();
  }

  removeLayerBySound(soundId: string): Layer | undefined {
    const idx = this.#state.layers.findIndex((l) => l.soundId === soundId);
    if (idx === -1) return undefined;
    const [removed] = this.#state.layers.splice(idx, 1);
    this.#emit();
    return removed;
  }

  setLayerVolume(playbackId: string, volume: number): void {
    const layer = this.#state.layers.find((l) => l.playbackId === playbackId);
    if (layer) {
      layer.volume = Math.max(0, Math.min(1, volume));
      this.#emit();
    }
  }

  hasSound(soundId: string): boolean {
    return this.#state.layers.some((l) => l.soundId === soundId);
  }

  clearAllLayers(): void {
    this.#state.layers = [];
    this.#emit();
  }

  setDevice(deviceId: string | null): void {
    this.#state.deviceId = deviceId;
    this.#emit();
  }

  setError(code: string, message: string): void {
    this.#state.error = { code, message };
    this.#emit();
  }

  clearError(): void {
    if (this.#state.error) {
      this.#state.error = null;
      this.#emit();
    }
  }
}

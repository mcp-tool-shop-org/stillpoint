const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export interface Layer {
  soundId: string;
  playbackId: string;
  volume: number;
}

export interface TimerState {
  durationSeconds: number;
  remainingSeconds: number;
  active: boolean;
}

export interface Preset {
  id: string;
  name: string;
  layers: { soundId: string; volume: number }[];
}

export interface MixerState {
  layers: Layer[];
  deviceId: string | null;
  masterVolume: number;
  timer: TimerState | null;
  error: { code: string; message: string } | null;
}

export interface AmbientSound {
  id: string;
  name: string;
  category: string;
}

export interface SoundCatalog {
  categories: string[];
  sounds: AmbientSound[];
  grouped: Record<string, AmbientSound[]>;
}

export interface DeviceInfo {
  device_id: string;
  name: string;
  is_default: boolean;
}

async function post(path: string, body?: object): Promise<unknown> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error: string }).error);
  }
  return res.json();
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(res.statusText || `HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  getSounds: async () => {
    const data = await get<SoundCatalog>("/sounds");
    if (!data || !Array.isArray(data.sounds)) throw new Error("Unexpected catalog shape");
    return data;
  },
  getDevices: async () => {
    const data = await get<DeviceInfo[]>("/devices");
    if (!Array.isArray(data)) throw new Error("Unexpected devices shape");
    return data;
  },
  getState: () => get<MixerState>("/state"),
  addLayer: (soundId: string, volume?: number) =>
    post("/layers/add", { soundId, volume }) as Promise<{ playbackId: string }>,
  removeLayer: (playbackId: string) =>
    post("/layers/remove", { playbackId }),
  setLayerVolume: (playbackId: string, level: number) =>
    post("/layers/volume", { playbackId, level }),
  stopAll: () => post("/stop-all"),
  setDevice: (deviceId: string | null) => post("/device", { deviceId }),
  setMasterVolume: (level: number) => post("/volume/master", { level }),
  getPresets: () => get<Preset[]>("/presets"),
  savePreset: (name: string) => post("/presets", { name }) as Promise<Preset>,
  loadPreset: (id: string) => post(`/presets/${id}/load`),
  deletePreset: (id: string) => post(`/presets/${id}/delete`),
  setTimer: (seconds: number) => post("/timer", { seconds }),
  cancelTimer: () => post("/timer/cancel"),
};

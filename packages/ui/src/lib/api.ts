const BASE = "/api";

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
  const res = await fetch(`${BASE}${path}`, {
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
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(res.statusText);
  return res.json() as Promise<T>;
}

export const api = {
  getSounds: () => get<SoundCatalog>("/sounds"),
  getDevices: () => get<DeviceInfo[]>("/devices"),
  getState: () => get<MixerState>("/state"),
  addLayer: (soundId: string, volume?: number) =>
    post("/layers/add", { soundId, volume }) as Promise<{ playbackId: string }>,
  removeLayer: (playbackId: string) =>
    post("/layers/remove", { playbackId }),
  setLayerVolume: (playbackId: string, level: number) =>
    post("/layers/volume", { playbackId, level }),
  stopAll: () => post("/stop-all"),
  setDevice: (deviceId: string | null) => post("/device", { deviceId }),
};

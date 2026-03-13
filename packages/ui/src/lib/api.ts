const BASE = "/api";

export interface AppState {
  status: "idle" | "playing" | "error";
  currentPresetId: string | null;
  currentPlaybackId: string | null;
  volume: number;
  deviceId: string | null;
  error: { code: string; message: string } | null;
}

export interface AmbientPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
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
  getPresets: () => get<AmbientPreset[]>("/presets"),
  getDevices: () => get<DeviceInfo[]>("/devices"),
  getState: () => get<AppState>("/state"),
  play: (presetId: string, deviceId?: string) =>
    post("/play", { presetId, deviceId }),
  stop: () => post("/stop"),
  setVolume: (level: number) => post("/volume", { level }),
};

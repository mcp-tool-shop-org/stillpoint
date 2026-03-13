import { useState, useEffect, useCallback, useRef } from "react";
import { api, type AppState, type AmbientPreset, type DeviceInfo } from "../lib/api.js";

const INITIAL_STATE: AppState = {
  status: "idle",
  currentPresetId: null,
  currentPlaybackId: null,
  volume: 0.5,
  deviceId: null,
  error: null,
};

export function useRegulator() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [presets, setPresets] = useState<AmbientPreset[]>([]);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const volumeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // SSE connection for real-time state
  useEffect(() => {
    const es = new EventSource("/api/events");

    es.onmessage = (e) => {
      try {
        setState(JSON.parse(e.data));
      } catch {
        // Ignore parse errors
      }
    };

    es.onerror = () => {
      // EventSource auto-reconnects
    };

    return () => es.close();
  }, []);

  // Load presets + devices on mount
  useEffect(() => {
    api.getPresets().then(setPresets).catch(() => {});
    api.getDevices().then(setDevices).catch(() => {});
  }, []);

  const play = useCallback(
    async (presetId: string) => {
      try {
        await api.play(presetId, state.deviceId ?? undefined);
      } catch {
        // Error comes through SSE
      }
    },
    [state.deviceId],
  );

  const stop = useCallback(async () => {
    try {
      await api.stop();
    } catch {
      // Error comes through SSE
    }
  }, []);

  const setVolume = useCallback((level: number) => {
    // Optimistic local update
    setState((s) => ({ ...s, volume: level }));

    // Debounce the server call
    clearTimeout(volumeTimer.current);
    volumeTimer.current = setTimeout(() => {
      api.setVolume(level).catch(() => {});
    }, 50);
  }, []);

  const refreshDevices = useCallback(async () => {
    try {
      const d = await api.getDevices();
      setDevices(d);
    } catch {
      // Non-critical
    }
  }, []);

  return {
    state,
    presets,
    devices,
    play,
    stop,
    setVolume,
    refreshDevices,
  };
}

import { useState, useEffect, useCallback, useRef } from "react";
import {
  api,
  type MixerState,
  type SoundCatalog,
  type DeviceInfo,
} from "../lib/api.js";

const INITIAL_STATE: MixerState = {
  layers: [],
  deviceId: null,
  error: null,
};

const EMPTY_CATALOG: SoundCatalog = {
  categories: [],
  sounds: [],
  grouped: {},
};

export function useRegulator() {
  const [state, setState] = useState<MixerState>(INITIAL_STATE);
  const [catalog, setCatalog] = useState<SoundCatalog>(EMPTY_CATALOG);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const volumeTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

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
      setState(s => ({ ...s, error: { code: 'connection_lost', message: 'Lost connection to server. Retrying...' } }));
    };
    return () => {
      es.close();
      for (const timer of volumeTimers.current.values()) clearTimeout(timer);
      volumeTimers.current.clear();
    };
  }, []);

  // Load catalog + devices on mount
  useEffect(() => {
    api.getSounds().then(setCatalog).catch(() => {
      setState(s => ({ ...s, error: { code: 'catalog_failed', message: 'Could not load sounds — is the server running?' } }));
    });
    api.getDevices().then(setDevices).catch(() => {
      setState(s => ({ ...s, error: { code: 'devices_failed', message: 'Could not load audio devices — is the server running?' } }));
    });
  }, []);

  const addLayer = useCallback(async (soundId: string) => {
    try {
      await api.addLayer(soundId, 0.5);
    } catch {
      // Error comes through SSE
    }
  }, []);

  const removeLayer = useCallback(async (playbackId: string) => {
    try {
      await api.removeLayer(playbackId);
    } catch {
      // Error comes through SSE
    }
  }, []);

  const setLayerVolume = useCallback(
    (playbackId: string, level: number) => {
      // Optimistic local update
      setState((s) => ({
        ...s,
        layers: s.layers.map((l) =>
          l.playbackId === playbackId ? { ...l, volume: level } : l,
        ),
      }));

      // Debounce the server call
      const timers = volumeTimers.current;
      const existing = timers.get(playbackId);
      if (existing) clearTimeout(existing);
      timers.set(
        playbackId,
        setTimeout(() => {
          api.setLayerVolume(playbackId, level).catch(() => {});
          timers.delete(playbackId);
        }, 100),
      );
    },
    [],
  );

  const stopAll = useCallback(async () => {
    try {
      await api.stopAll();
    } catch {
      // Error comes through SSE
    }
  }, []);

  const setDevice = useCallback(async (deviceId: string | null) => {
    try {
      await api.setDevice(deviceId);
    } catch {
      // Silently ignore — server endpoint may not exist yet
    }
  }, []);

  return {
    state,
    catalog,
    devices,
    addLayer,
    removeLayer,
    setLayerVolume,
    stopAll,
    setDevice,
  };
}

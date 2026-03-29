import { useState, useEffect, useCallback, useRef } from "react";
import {
  api,
  type MixerState,
  type SoundCatalog,
  type DeviceInfo,
  type Preset,
} from "../lib/api.js";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

const INITIAL_STATE: MixerState = {
  layers: [],
  deviceId: null,
  masterVolume: 1,
  timer: null,
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
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [timerDisplay, setTimerDisplay] = useState<number | null>(null);
  const muteMap = useRef<Map<string, number>>(new Map());
  const masterVolumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const volumeTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  // SSE connection for real-time state
  useEffect(() => {
    const es = new EventSource(`${API_BASE}/events`);
    es.onmessage = (e) => {
      setConnected(true);
      try {
        setState(JSON.parse(e.data));
      } catch {
        // Ignore parse errors
      }
    };
    es.onerror = () => {
      setConnected(false);
      setState(s => ({ ...s, error: { code: 'connection_lost', message: 'Lost connection to server. Retrying...' } }));
    };
    return () => {
      es.close();
      for (const timer of volumeTimers.current.values()) clearTimeout(timer);
      volumeTimers.current.clear();
      if (masterVolumeTimer.current) clearTimeout(masterVolumeTimer.current);
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, []);

  // Load catalog + devices on mount
  useEffect(() => {
    api.getSounds().then((data) => {
      setCatalog(data);
      setCatalogLoading(false);
    }).catch(() => {
      setCatalogLoading(false);
      setState(s => ({ ...s, error: { code: 'catalog_failed', message: 'Could not load sounds — is the server running?' } }));
    });
    api.getDevices().then(setDevices).catch(() => {
      setState(s => ({ ...s, error: { code: 'devices_failed', message: 'Could not load audio devices — is the server running?' } }));
    });
    api.getPresets().then(setPresets).catch(() => {
      // Non-fatal — presets may not be implemented yet
    });
  }, []);

  // Sync local countdown from SSE timer state
  useEffect(() => {
    if (state.timer?.active) {
      setTimerDisplay(state.timer.remainingSeconds);
      if (timerInterval.current) clearInterval(timerInterval.current);
      timerInterval.current = setInterval(() => {
        setTimerDisplay((prev) => {
          if (prev === null || prev <= 1) {
            if (timerInterval.current) clearInterval(timerInterval.current);
            timerInterval.current = null;
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerInterval.current) clearInterval(timerInterval.current);
      timerInterval.current = null;
      setTimerDisplay(null);
    }
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [state.timer?.active, state.timer?.remainingSeconds]);

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
      // Capture previous volume before optimistic update
      let prevVolume = level;
      setState((s) => {
        const existing = s.layers.find((l) => l.playbackId === playbackId);
        if (existing) prevVolume = existing.volume;
        return {
          ...s,
          layers: s.layers.map((l) =>
            l.playbackId === playbackId ? { ...l, volume: level } : l,
          ),
        };
      });

      // Debounce the server call
      const timers = volumeTimers.current;
      const existingTimer = timers.get(playbackId);
      if (existingTimer) clearTimeout(existingTimer);
      timers.set(
        playbackId,
        setTimeout(() => {
          api.setLayerVolume(playbackId, level).catch(() => {
            setState((s) => ({
              ...s,
              layers: s.layers.map((l) =>
                l.playbackId === playbackId ? { ...l, volume: prevVolume } : l,
              ),
            }));
          });
          timers.delete(playbackId);
        }, 100),
      );
    },
    [],
  );

  const stopAll = useCallback(async () => {
    setStopping(true);
    try {
      await api.stopAll();
    } catch {
      // Error comes through SSE
    } finally {
      setStopping(false);
    }
  }, []);

  const setDevice = useCallback(async (deviceId: string | null) => {
    try {
      await api.setDevice(deviceId);
    } catch {
      setState(s => ({ ...s, error: { code: 'device_failed', message: 'Could not switch audio device' } }));
    }
  }, []);

  const setMasterVolume = useCallback((level: number) => {
    // Optimistic update
    setState((s) => ({ ...s, masterVolume: level }));
    if (masterVolumeTimer.current) clearTimeout(masterVolumeTimer.current);
    masterVolumeTimer.current = setTimeout(() => {
      api.setMasterVolume(level).catch(() => {
        // Silently fail — SSE will correct state
      });
      masterVolumeTimer.current = null;
    }, 100);
  }, []);

  const toggleMute = useCallback(
    (playbackId: string, currentVolume: number) => {
      const muted = muteMap.current.has(playbackId);
      if (muted) {
        // Unmute — restore previous volume
        const prev = muteMap.current.get(playbackId) ?? 0.5;
        muteMap.current.delete(playbackId);
        setLayerVolume(playbackId, prev);
      } else {
        // Mute — save current volume and set to 0
        muteMap.current.set(playbackId, currentVolume);
        setLayerVolume(playbackId, 0);
      }
    },
    [setLayerVolume],
  );

  const isMuted = useCallback(
    (playbackId: string) => muteMap.current.has(playbackId),
    [],
  );

  const savePreset = useCallback(async () => {
    const name = window.prompt("Save mix as:");
    if (!name || !name.trim()) return;
    try {
      const preset = await api.savePreset(name.trim());
      setPresets((ps) => [...ps, preset]);
    } catch {
      setState(s => ({ ...s, error: { code: 'preset_save_failed', message: 'Could not save preset' } }));
    }
  }, []);

  const loadPreset = useCallback(async (id: string) => {
    try {
      await api.loadPreset(id);
    } catch {
      setState(s => ({ ...s, error: { code: 'preset_load_failed', message: 'Could not load preset' } }));
    }
  }, []);

  const deletePreset = useCallback(async (id: string) => {
    try {
      await api.deletePreset(id);
      setPresets((ps) => ps.filter((p) => p.id !== id));
    } catch {
      setState(s => ({ ...s, error: { code: 'preset_delete_failed', message: 'Could not delete preset' } }));
    }
  }, []);

  const setTimer = useCallback(async (seconds: number) => {
    try {
      await api.setTimer(seconds);
    } catch {
      setState(s => ({ ...s, error: { code: 'timer_failed', message: 'Could not set sleep timer' } }));
    }
  }, []);

  const cancelTimer = useCallback(async () => {
    try {
      await api.cancelTimer();
    } catch {
      setState(s => ({ ...s, error: { code: 'timer_cancel_failed', message: 'Could not cancel sleep timer' } }));
    }
  }, []);

  return {
    state,
    catalog,
    catalogLoading,
    connected,
    stopping,
    devices,
    presets,
    timerDisplay,
    addLayer,
    removeLayer,
    setLayerVolume,
    toggleMute,
    isMuted,
    stopAll,
    setDevice,
    setMasterVolume,
    savePreset,
    loadPreset,
    deletePreset,
    setTimer,
    cancelTimer,
  };
}

import { Router, type Request, type Response } from "express";
import type { SonicEngine } from "@sonic-core/engine";
import type { Source } from "@sonic-core/types";
import type { RegulatorState } from "../state.js";
import { MAX_LAYERS } from "../state.js";
import {
  findSound,
  soundAssetRef,
  buildCatalog,
} from "../presets.js";
import * as presetStore from "../preset-store.js";

const PLAY_TIMEOUT = 10_000;

export function apiRouter(
  engine: SonicEngine,
  state: RegulatorState,
): Router {
  const router = Router();
  const inFlight = new Set<string>();

  // Sleep timer handle — stored in closure so DELETE /timer can cancel it
  let timerHandle: ReturnType<typeof setTimeout> | null = null;

  // Simple sliding-window rate limiter for mutation endpoints (F-A-013)
  const mutationTimestamps: number[] = [];
  const RATE_LIMIT_MAX = 30;
  const RATE_LIMIT_WINDOW_MS = 10_000;

  function checkRateLimit(res: Response): boolean {
    const now = Date.now();
    // Evict timestamps outside the window
    while (mutationTimestamps.length > 0 && mutationTimestamps[0] < now - RATE_LIMIT_WINDOW_MS) {
      mutationTimestamps.shift();
    }
    if (mutationTimestamps.length >= RATE_LIMIT_MAX) {
      process.stderr.write('[stillpoint] rate limit hit\n');
      res.status(429).json({ error: "Too many requests — slow down" });
      return false;
    }
    mutationTimestamps.push(now);
    return true;
  }

  /** Full sound catalog grouped by category. */
  router.get("/sounds", (_req: Request, res: Response) => {
    res.json(buildCatalog());
  });

  router.get("/devices", async (_req: Request, res: Response) => {
    try {
      const devices = await engine.get_devices();
      res.json(devices);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to list devices' });
    }
  });

  // FT-S-001: Set audio output device
  router.post("/device", async (req: Request, res: Response) => {
    if (!checkRateLimit(res)) return;
    const { deviceId } = req.body as { deviceId?: unknown };
    if (deviceId !== null && typeof deviceId !== "string") {
      res.status(400).json({ error: "deviceId must be a string or null" });
      return;
    }
    state.setDevice(typeof deviceId === "string" ? deviceId : null);
    process.stderr.write(`[stillpoint] device: ${deviceId ?? 'default'}\n`);
    res.json({ ok: true });
  });

  router.get("/state", (_req: Request, res: Response) => {
    res.json(state.current);
  });

  /** Add a sound layer to the mix. */
  router.post("/layers/add", async (req: Request, res: Response) => {
    if (!checkRateLimit(res)) return;

    const { soundId, volume, fadeMs } = req.body as {
      soundId?: unknown;
      volume?: unknown;
      fadeMs?: unknown;
    };

    if (!soundId || typeof soundId !== "string") {
      res.status(400).json({ error: "soundId is required" });
      return;
    }

    const layerVolumeParsed = typeof volume === "number" ? volume : undefined;
    const fadeDuration = typeof fadeMs === "number" && fadeMs > 0 ? fadeMs : 0;

    process.stderr.write(`[stillpoint] add: ${soundId}\n`);

    if (state.hasSound(soundId) || inFlight.has(soundId)) {
      res.status(409).json({ error: `${soundId} is already playing` });
      return;
    }

    if (state.current.layers.length >= MAX_LAYERS) {
      res.status(409).json({ error: `Maximum ${MAX_LAYERS} layers — remove one first` });
      return;
    }

    const sound = findSound(soundId);
    if (!sound) {
      res.status(404).json({ error: `Unknown sound: ${soundId}` });
      return;
    }

    const layerVolume = typeof layerVolumeParsed === "number" ? Math.max(0, Math.min(1, layerVolumeParsed)) : 0.5;
    const masterVolume = state.current.masterVolume;
    // FT-S-004: start at 0 if fading in, otherwise apply master volume
    const initialVolume = fadeDuration > 0 ? 0 : layerVolume * masterVolume;

    inFlight.add(soundId);
    try {
      const source: Source = {
        kind: "asset",
        asset_ref: soundAssetRef(sound),
      };

      const playbackId = await Promise.race([
        engine.play(source, {
          loop: true,
          initial_volume: initialVolume,
          output_device_id: state.current.deviceId ?? undefined,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('play timeout')), PLAY_TIMEOUT),
        ),
      ]);

      state.addLayer(soundId, playbackId, layerVolume);
      state.clearError();

      // FT-S-004: fade in — linear ramp from 0 to target over fadeDuration ms
      if (fadeDuration > 0) {
        const STEP_MS = 50;
        const steps = Math.max(1, Math.round(fadeDuration / STEP_MS));
        let step = 0;
        const interval = setInterval(() => {
          step++;
          const fraction = Math.min(step / steps, 1);
          const vol = layerVolume * masterVolume * fraction;
          engine.set_volume(playbackId, vol).catch(() => {/* layer may have been removed */});
          if (step >= steps) clearInterval(interval);
        }, STEP_MS);
      }

      res.json({ playbackId });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      state.setError("play_failed", msg);
      res.status(500).json({ error: msg });
    } finally {
      inFlight.delete(soundId);
    }
  });

  /** Remove a layer by playbackId. */
  router.post("/layers/remove", async (req: Request, res: Response) => {
    if (!checkRateLimit(res)) return;

    const { playbackId, fadeMs } = req.body as { playbackId?: unknown; fadeMs?: unknown };

    if (!playbackId || typeof playbackId !== "string") {
      res.status(400).json({ error: "playbackId is required" });
      return;
    }

    process.stderr.write(`[stillpoint] remove: ${playbackId}\n`);

    // F-A-006: reject unknown playbackId instead of silently succeeding
    const layer = state.current.layers.find(l => l.playbackId === playbackId);
    if (!layer) {
      res.status(404).json({ error: "Layer not found" });
      return;
    }

    const fadeDuration = typeof fadeMs === "number" && fadeMs > 0 ? fadeMs : 0;

    if (fadeDuration > 0) {
      // FT-S-004: fade out — linear ramp from current volume to 0, then stop
      const startVolume = layer.volume * state.current.masterVolume;
      const STEP_MS = 50;
      const steps = Math.max(1, Math.round(fadeDuration / STEP_MS));
      let step = 0;
      res.json({ ok: true }); // respond immediately; fade happens in background
      const interval = setInterval(async () => {
        step++;
        const fraction = Math.max(0, 1 - step / steps);
        const vol = startVolume * fraction;
        try {
          await engine.set_volume(playbackId, vol);
        } catch {
          // layer may have already stopped
        }
        if (step >= steps) {
          clearInterval(interval);
          try {
            await engine.stop(playbackId);
          } catch (err) {
            process.stderr.write(`[stillpoint] remove stop failed: ${err}\n`);
          }
          state.removeLayer(playbackId);
        }
      }, STEP_MS);
    } else {
      try {
        await engine.stop(playbackId);
      } catch (err) {
        process.stderr.write(`[stillpoint] remove stop failed: ${err}\n`);
        // Already stopped
      }
      state.removeLayer(playbackId);
      res.json({ ok: true });
    }
  });

  /** Set volume for a specific layer. */
  router.post("/layers/volume", async (req: Request, res: Response) => {
    if (!checkRateLimit(res)) return;

    const { playbackId, level } = req.body as {
      playbackId?: unknown;
      level?: unknown;
    };

    // F-A-004: typeof check on playbackId; F-A-005: Number.isFinite rejects NaN/Infinity
    if (
      !playbackId ||
      typeof playbackId !== "string" ||
      !Number.isFinite(level) ||
      (level as number) < 0 ||
      (level as number) > 1
    ) {
      res.status(400).json({ error: "playbackId and level (0-1) required" });
      return;
    }

    const safeLevel = level as number;

    process.stderr.write(`[stillpoint] volume: ${playbackId} → ${safeLevel}\n`);

    // PH-B-001: check state before calling engine to avoid TOCTOU
    if (!state.current.layers.some(l => l.playbackId === playbackId)) {
      res.status(404).json({ error: 'Layer not found' });
      return;
    }

    // FT-S-003: scale by master volume when setting layer volume
    const scaledLevel = safeLevel * state.current.masterVolume;

    try {
      await engine.set_volume(playbackId, scaledLevel);
    } catch (err) {
      process.stderr.write(`[stillpoint] set_volume failed: ${err}\n`);
      res.status(500).json({ error: "Failed to set volume" });
      return;
    }

    state.setLayerVolume(playbackId, safeLevel);
    res.json({ ok: true });
  });

  /** Stop all layers. */
  router.post("/stop-all", async (_req: Request, res: Response) => {
    if (!checkRateLimit(res)) return;

    const { layers } = state.current;
    process.stderr.write(`[stillpoint] stop-all (${layers.length} layers)\n`);
    // F-A-008: stop all layers in parallel
    const results = await Promise.allSettled(layers.map(l => engine.stop(l.playbackId)));
    const failed = results.filter(r => r.status === 'rejected');
    if (failed.length) {
      process.stderr.write(`[stillpoint] stop-all: ${failed.length} layer(s) failed to stop\n`);
    }
    state.clearAllLayers();
    res.json({ ok: true });
  });

  // FT-S-003: Master volume
  router.post("/volume/master", async (req: Request, res: Response) => {
    if (!checkRateLimit(res)) return;
    const { level } = req.body as { level?: unknown };
    if (!Number.isFinite(level) || (level as number) < 0 || (level as number) > 1) {
      res.status(400).json({ error: "level (0-1) required" });
      return;
    }
    const safeLevel = level as number;
    process.stderr.write(`[stillpoint] master volume: ${safeLevel}\n`);
    state.setMasterVolume(safeLevel);
    // Scale all active layers
    const { layers } = state.current;
    await Promise.allSettled(
      layers.map(l => engine.set_volume(l.playbackId, l.volume * safeLevel))
    );
    res.json({ ok: true });
  });

  // FT-S-005: Sleep timer

  /** Helper: stop-all logic used by timer */
  async function stopAllLayers() {
    const { layers } = state.current;
    await Promise.allSettled(layers.map(l => engine.stop(l.playbackId)));
    state.clearAllLayers();
  }

  router.post("/timer", async (req: Request, res: Response) => {
    if (!checkRateLimit(res)) return;
    const { minutes } = req.body as { minutes?: unknown };
    if (!Number.isFinite(minutes) || (minutes as number) <= 0 || (minutes as number) > 480) {
      res.status(400).json({ error: "minutes must be between 1 and 480" });
      return;
    }
    const safeMinutes = minutes as number;
    // Cancel any existing timer
    if (timerHandle !== null) {
      clearTimeout(timerHandle);
      timerHandle = null;
    }
    state.setTimer(safeMinutes);
    const ms = safeMinutes * 60_000;
    timerHandle = setTimeout(async () => {
      timerHandle = null;
      state.clearTimer();
      process.stderr.write(`[stillpoint] sleep timer fired — stopping all\n`);
      await stopAllLayers();
    }, ms);
    res.json({ endTime: state.current.timer?.endTime });
  });

  router.delete("/timer", async (_req: Request, res: Response) => {
    if (timerHandle !== null) {
      clearTimeout(timerHandle);
      timerHandle = null;
    }
    state.clearTimer();
    process.stderr.write(`[stillpoint] sleep timer cancelled\n`);
    res.json({ ok: true });
  });

  router.get("/timer", (_req: Request, res: Response) => {
    res.json(state.current.timer ?? { endTime: null });
  });

  // FT-S-002: Saved presets

  router.get("/presets", (_req: Request, res: Response) => {
    try {
      res.json(presetStore.list());
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : "Failed to list presets" });
    }
  });

  router.post("/presets", async (req: Request, res: Response) => {
    if (!checkRateLimit(res)) return;
    const { name } = req.body as { name?: unknown };
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      res.status(400).json({ error: "name is required" });
      return;
    }
    const { layers } = state.current;
    try {
      const preset = presetStore.save(name.trim(), layers.map(l => ({ soundId: l.soundId, volume: l.volume })));
      process.stderr.write(`[stillpoint] preset saved: "${preset.name}" (${preset.id})\n`);
      res.json(preset);
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : "Failed to save preset" });
    }
  });

  router.post("/presets/:id/load", async (req: Request, res: Response) => {
    if (!checkRateLimit(res)) return;
    const { id } = req.params;
    const preset = presetStore.load(id);
    if (!preset) {
      res.status(404).json({ error: "Preset not found" });
      return;
    }
    // Stop all current layers
    const { layers } = state.current;
    await Promise.allSettled(layers.map(l => engine.stop(l.playbackId)));
    state.clearAllLayers();
    // Replay preset layers
    const failures: string[] = [];
    for (const entry of preset.layers) {
      const sound = findSound(entry.soundId);
      if (!sound) {
        failures.push(entry.soundId);
        continue;
      }
      const masterVolume = state.current.masterVolume;
      try {
        const source: Source = { kind: "asset", asset_ref: soundAssetRef(sound) };
        const playbackId = await engine.play(source, {
          loop: true,
          initial_volume: entry.volume * masterVolume,
          output_device_id: state.current.deviceId ?? undefined,
        });
        state.addLayer(entry.soundId, playbackId, entry.volume);
      } catch (err) {
        failures.push(entry.soundId);
        process.stderr.write(`[stillpoint] preset load failed for ${entry.soundId}: ${err}\n`);
      }
    }
    process.stderr.write(`[stillpoint] preset loaded: "${preset.name}" (${preset.layers.length - failures.length}/${preset.layers.length} layers)\n`);
    res.json({ ok: true, preset, failures });
  });

  router.delete("/presets/:id", async (req: Request, res: Response) => {
    if (!checkRateLimit(res)) return;
    const { id } = req.params;
    try {
      const removed = presetStore.remove(id);
      if (!removed) {
        res.status(404).json({ error: "Preset not found" });
        return;
      }
      process.stderr.write(`[stillpoint] preset removed: ${id}\n`);
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : "Failed to remove preset" });
    }
  });

  return router;
}

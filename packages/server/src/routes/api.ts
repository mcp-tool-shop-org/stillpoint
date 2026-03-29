import { Router, type Request, type Response } from "express";
import type { SonicEngine } from "@sonic-core/engine";
import type { Source } from "@sonic-core/types";
import type { RegulatorState } from "../state.js";
import {
  findSound,
  soundAssetRef,
  buildCatalog,
} from "../presets.js";

export function apiRouter(
  engine: SonicEngine,
  state: RegulatorState,
): Router {
  const router = Router();
  const inFlight = new Set<string>();

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
      res.status(500).json({ error: String(err) });
    }
  });

  router.get("/state", (_req: Request, res: Response) => {
    res.json(state.current);
  });

  /** Add a sound layer to the mix. */
  router.post("/layers/add", async (req: Request, res: Response) => {
    if (!checkRateLimit(res)) return;

    const { soundId, volume } = req.body as {
      soundId?: unknown;
      volume?: unknown;
    };

    if (!soundId || typeof soundId !== "string") {
      res.status(400).json({ error: "soundId is required" });
      return;
    }

    const layerVolumeParsed = typeof volume === "number" ? volume : undefined;

    if (state.hasSound(soundId) || inFlight.has(soundId)) {
      res.status(409).json({ error: `${soundId} is already playing` });
      return;
    }

    const sound = findSound(soundId);
    if (!sound) {
      res.status(404).json({ error: `Unknown sound: ${soundId}` });
      return;
    }

    const layerVolume = typeof layerVolumeParsed === "number" ? Math.max(0, Math.min(1, layerVolumeParsed)) : 0.5;

    inFlight.add(soundId);
    try {
      const source: Source = {
        kind: "asset",
        asset_ref: soundAssetRef(sound),
      };

      const playbackId = await engine.play(source, {
        loop: true,
        initial_volume: layerVolume,
        output_device_id: state.current.deviceId ?? undefined,
      });

      state.addLayer(soundId, playbackId, layerVolume);
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

    const { playbackId } = req.body as { playbackId?: unknown };

    if (!playbackId || typeof playbackId !== "string") {
      res.status(400).json({ error: "playbackId is required" });
      return;
    }

    // F-A-006: reject unknown playbackId instead of silently succeeding
    if (!state.current.layers.some(l => l.playbackId === playbackId)) {
      res.status(404).json({ error: "Layer not found" });
      return;
    }

    try {
      await engine.stop(playbackId);
    } catch {
      // Already stopped
    }
    state.removeLayer(playbackId);
    res.json({ ok: true });
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

    // F-A-007: call engine first so state only updates on success
    try {
      await engine.set_volume(playbackId, safeLevel);
    } catch (err) {
      // Playback may have ended — log but continue
      console.error("[api] set_volume failed:", err);
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
    // F-A-008: stop all layers in parallel
    await Promise.allSettled(layers.map(l => engine.stop(l.playbackId)));
    state.clearAllLayers();
    res.json({ ok: true });
  });

  return router;
}

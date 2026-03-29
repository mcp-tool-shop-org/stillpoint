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
    const { soundId, volume } = req.body as {
      soundId?: string;
      volume?: number;
    };

    if (!soundId) {
      res.status(400).json({ error: "soundId is required" });
      return;
    }

    if (state.hasSound(soundId) || inFlight.has(soundId)) {
      res.status(409).json({ error: `${soundId} is already playing` });
      return;
    }

    const sound = findSound(soundId);
    if (!sound) {
      res.status(404).json({ error: `Unknown sound: ${soundId}` });
      return;
    }

    const layerVolume = typeof volume === "number" ? Math.max(0, Math.min(1, volume)) : 0.5;

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
    const { playbackId } = req.body as { playbackId?: string };

    if (!playbackId) {
      res.status(400).json({ error: "playbackId is required" });
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
    const { playbackId, level } = req.body as {
      playbackId?: string;
      level?: number;
    };

    if (!playbackId || typeof level !== "number" || level < 0 || level > 1) {
      res.status(400).json({ error: "playbackId and level (0-1) required" });
      return;
    }

    state.setLayerVolume(playbackId, level);

    try {
      await engine.set_volume(playbackId, level);
    } catch {
      // Playback may have ended
    }

    res.json({ ok: true });
  });

  /** Stop all layers. */
  router.post("/stop-all", async (_req: Request, res: Response) => {
    const { layers } = state.current;
    for (const layer of layers) {
      try {
        await engine.stop(layer.playbackId);
      } catch {
        // Already stopped
      }
    }
    state.clearAllLayers();
    res.json({ ok: true });
  });

  return router;
}

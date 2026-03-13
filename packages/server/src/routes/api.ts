import { Router, type Request, type Response } from "express";
import type { SonicEngine } from "@sonic-core/engine";
import type { Source } from "@sonic-core/types";
import type { RegulatorState } from "../state.js";
import { DEFAULT_PRESETS, findPreset, presetAssetRef } from "../presets.js";

export function apiRouter(
  engine: SonicEngine,
  state: RegulatorState,
): Router {
  const router = Router();

  router.get("/presets", (_req: Request, res: Response) => {
    res.json(DEFAULT_PRESETS);
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

  router.post("/play", async (req: Request, res: Response) => {
    const { presetId, deviceId } = req.body as {
      presetId?: string;
      deviceId?: string;
    };

    if (!presetId) {
      res.status(400).json({ error: "presetId is required" });
      return;
    }

    const preset = findPreset(presetId);
    if (!preset) {
      res.status(404).json({ error: `Unknown preset: ${presetId}` });
      return;
    }

    try {
      // Stop current playback if any
      const { currentPlaybackId } = state.current;
      if (currentPlaybackId) {
        try {
          await engine.stop(currentPlaybackId);
        } catch {
          // Already stopped — fine
        }
      }

      const source: Source = {
        kind: "asset",
        asset_ref: presetAssetRef(preset),
      };

      const effectiveDevice = deviceId ?? state.current.deviceId ?? undefined;

      const playbackId = await engine.play(source, {
        loop: true,
        initial_volume: state.current.volume,
        output_device_id: effectiveDevice,
      });

      if (deviceId) {
        state.setDevice(deviceId);
      }
      state.setPlaying(presetId, playbackId);

      res.json({ playbackId });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      state.setError("play_failed", msg);
      res.status(500).json({ error: msg });
    }
  });

  router.post("/stop", async (_req: Request, res: Response) => {
    const { currentPlaybackId } = state.current;
    if (!currentPlaybackId) {
      res.json({ ok: true });
      return;
    }

    try {
      await engine.stop(currentPlaybackId);
      state.setIdle();
      res.json({ ok: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      state.setError("stop_failed", msg);
      res.status(500).json({ error: msg });
    }
  });

  router.post("/volume", async (req: Request, res: Response) => {
    const { level } = req.body as { level?: number };
    if (typeof level !== "number" || level < 0 || level > 1) {
      res.status(400).json({ error: "level must be a number between 0 and 1" });
      return;
    }

    state.setVolume(level);

    const { currentPlaybackId } = state.current;
    if (currentPlaybackId) {
      try {
        await engine.set_volume(currentPlaybackId, level);
      } catch {
        // Playback may have ended — volume state is still saved
      }
    }

    res.json({ ok: true });
  });

  return router;
}

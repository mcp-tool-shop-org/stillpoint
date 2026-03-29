import express from "express";
import cors from "cors";
import type { SonicEngine } from "@sonic-core/engine";
import type { RegulatorState } from "./state.js";
import { apiRouter } from "./routes/api.js";
import { eventsRouter } from "./routes/events.js";

const DEFAULT_ORIGINS = [
  'http://localhost:3456',
  'http://localhost:5177',
  'http://127.0.0.1:3456',
  'http://127.0.0.1:5177',
  'tauri://localhost',
];

function getAllowedOrigins(): string[] {
  const extra = process.env.STILLPOINT_CORS_ORIGINS;
  if (!extra) return DEFAULT_ORIGINS;
  const parsed = extra.split(',').map((o) => o.trim()).filter(Boolean);
  return [...DEFAULT_ORIGINS, ...parsed];
}

export function createServer(
  engine: SonicEngine,
  state: RegulatorState,
  backendMode: 'sidecar' | 'null' = 'null',
) {
  const app = express();

  app.use(cors({ origin: getAllowedOrigins() }));
  app.use(express.json({ limit: '4kb' }));

  app.get("/health", (_req, res) => {
    const current = state.current;
    res.json({
      ok: true,
      uptime: process.uptime(),
      layers: current.layers.length,
      error: current.error,
      backendMode,
    });
  });

  // /api is the current (v1) surface — versioning is a documentation concern at this stage.
  // If a /api/v2 is needed later, mount a second router here alongside this one.
  app.use("/api", apiRouter(engine, state));
  app.use("/api", eventsRouter(state));

  return app;
}

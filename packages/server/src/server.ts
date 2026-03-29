import express from "express";
import cors from "cors";
import type { SonicEngine } from "@sonic-core/engine";
import type { RegulatorState } from "./state.js";
import { apiRouter } from "./routes/api.js";
import { eventsRouter } from "./routes/events.js";

export function createServer(engine: SonicEngine, state: RegulatorState) {
  const app = express();

  app.use(cors({ origin: ['http://localhost:3456', 'http://localhost:5177', 'http://127.0.0.1:3456', 'http://127.0.0.1:5177', 'tauri://localhost'] }));
  app.use(express.json({ limit: '4kb' }));

  app.use("/api", apiRouter(engine, state));
  app.use("/api", eventsRouter(state));

  return app;
}

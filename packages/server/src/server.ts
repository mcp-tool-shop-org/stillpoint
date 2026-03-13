import express from "express";
import cors from "cors";
import type { SonicEngine } from "@sonic-core/engine";
import type { RegulatorState } from "./state.js";
import { apiRouter } from "./routes/api.js";
import { eventsRouter } from "./routes/events.js";

export function createServer(engine: SonicEngine, state: RegulatorState) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api", apiRouter(engine, state));
  app.use("/api", eventsRouter(state));

  return app;
}

#!/usr/bin/env node

import { createServer } from "./server.js";
import { createEngineManager } from "./engine-manager.js";
import { RegulatorState } from "./state.js";

const PORT = parseInt(process.env.PORT ?? "3456", 10);
const log = (msg: string) => process.stderr.write(`[stillpoint] ${msg}\n`);

const state = new RegulatorState();
const { engine, dispose } = await createEngineManager(state);
const app = createServer(engine, state);

const server = app.listen(PORT, () => {
  log(`server listening on http://localhost:${PORT}`);
});

// Graceful shutdown
let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  log("shutting down...");
  server.close();
  dispose();
}

process.on("SIGINT", () => {
  shutdown();
  process.exit(0);
});
process.on("SIGTERM", () => {
  shutdown();
  process.exit(0);
});

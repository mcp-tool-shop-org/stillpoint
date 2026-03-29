#!/usr/bin/env node

import { createServer } from "./server.js";
import { createEngineManager } from "./engine-manager.js";
import { RegulatorState } from "./state.js";

const PORT = parseInt(process.env.PORT ?? "3456", 10);
const log = (msg: string) => process.stderr.write(`[stillpoint] ${msg}\n`);

if (!Number.isFinite(PORT) || PORT < 1 || PORT > 65535) {
  log(`Invalid PORT: ${process.env.PORT}`);
  process.exit(1);
}

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
  const timer = setTimeout(() => {
    log("shutdown timeout — forcing exit");
    process.exit(1);
  }, 5000);
  timer.unref();
  server.close(() => {
    dispose();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

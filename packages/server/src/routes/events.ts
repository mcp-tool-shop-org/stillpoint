import { Router, type Request, type Response } from "express";
import type { RegulatorState } from "../state.js";

export function eventsRouter(state: RegulatorState): Router {
  const router = Router();
  let sseConnections = 0;
  const MAX_SSE = 10;

  router.get("/events", (_req: Request, res: Response) => {
    if (sseConnections >= MAX_SSE) {
      process.stderr.write('[stillpoint] SSE connection limit reached\n');
      res.status(503).json({ error: "Too many SSE connections" });
      return;
    }
    sseConnections++;
    process.stderr.write(`[stillpoint] SSE connected (${sseConnections}/${MAX_SSE})\n`);

    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.status(200).flushHeaders();

    res.write(`data: ${JSON.stringify(state.current)}\n\n`);

    const onChange = (s: unknown) => {
      try {
        res.write(`data: ${JSON.stringify(s)}\n\n`);
      } catch {
        // Serialization error — skip this event to avoid breaking the stream
      }
    };

    state.on("change", onChange);

    const heartbeat = setInterval(() => res.write(": heartbeat\n\n"), 25_000);

    let closed = false;
    _req.on("close", () => {
      if (closed) return;
      closed = true;
      state.off("change", onChange);
      clearInterval(heartbeat);
      sseConnections--;
      process.stderr.write(`[stillpoint] SSE disconnected (${sseConnections}/${MAX_SSE})\n`);
    });
  });

  return router;
}

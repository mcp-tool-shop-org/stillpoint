import { Router, type Request, type Response } from "express";
import type { RegulatorState } from "../state.js";

export function eventsRouter(state: RegulatorState): Router {
  const router = Router();
  let sseConnections = 0;
  const MAX_SSE = 10;

  router.get("/events", (_req: Request, res: Response) => {
    if (sseConnections >= MAX_SSE) {
      res.status(503).json({ error: "Too many SSE connections" });
      return;
    }
    sseConnections++;

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    res.write(`data: ${JSON.stringify(state.current)}\n\n`);

    const onChange = (s: unknown) => {
      res.write(`data: ${JSON.stringify(s)}\n\n`);
    };

    state.on("change", onChange);

    const heartbeat = setInterval(() => res.write(": heartbeat\n\n"), 25_000);

    _req.on("close", () => {
      state.off("change", onChange);
      clearInterval(heartbeat);
      sseConnections--;
    });
  });

  return router;
}

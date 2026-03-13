import { Router, type Request, type Response } from "express";
import type { RegulatorState } from "../state.js";

export function eventsRouter(state: RegulatorState): Router {
  const router = Router();

  router.get("/events", (_req: Request, res: Response) => {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    // Send current state immediately
    res.write(`data: ${JSON.stringify(state.current)}\n\n`);

    const onChange = (s: unknown) => {
      res.write(`data: ${JSON.stringify(s)}\n\n`);
    };

    state.on("change", onChange);

    _req.on("close", () => {
      state.off("change", onChange);
    });
  });

  return router;
}

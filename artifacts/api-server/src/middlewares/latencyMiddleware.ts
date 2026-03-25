import type { Request, Response, NextFunction } from "express";
import { recordLatency } from "../routes/health";

export function latencyMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    // Don't count SSE streams (they inflate latency to seconds)
    if (!res.getHeader("Content-Type")?.toString().includes("text/event-stream")) {
      recordLatency(ms);
    }
  });
  next();
}

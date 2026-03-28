import { Router, type IRouter } from "express";
import healthRouter from "./health";
import orchestratorRouter from "./orchestrator";
import agricultureRouter from "./agriculture";
import financeRouter from "./finance";
import healthcareRouter from "./healthcare";
import governanceRouter from "./governance";
import indiastackRouter from "./indiastack";
import architectureRouter from "./architecture";
import openaiRouter from "./openai";
import authRouter from "./auth";
import agentsRouter from "./agents";
import paymentsRouter from "./payments";
import analyticsRouter from "./analytics";
import invoicesRouter from "./invoices";
import activityRouter from "./activity";
import weatherRouter from "./weather";
import { db } from "@workspace/db";
import { activitiesTable } from "@workspace/db/schema";

const router: IRouter = Router();

router.use((req, _res, next) => {
  if (req.method === "POST" && !req.path.includes("/activity/") && !req.path.includes("/health")) {
    const sector = req.path.split("/")[1] || "System";
    const action = req.path.replace(/^\//, "").replace(/\//g, "_");
    db.insert(activitiesTable).values({
      userId: (req as any).user?.id || null,
      action: action.slice(0, 100),
      sector: sector.charAt(0).toUpperCase() + sector.slice(1),
      details: { method: req.method, path: req.path },
      ipAddress: (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.ip || null,
      userAgent: req.headers["user-agent"] || null,
    }).catch(() => {});
  }
  next();
});

router.use(healthRouter);
router.use(authRouter);
router.use("/orchestrator", orchestratorRouter);
router.use("/agents", agentsRouter);
router.use("/agriculture", agricultureRouter);
router.use("/finance", financeRouter);
router.use("/healthcare", healthcareRouter);
router.use("/governance", governanceRouter);
router.use("/indiastack", indiastackRouter);
router.use("/architecture", architectureRouter);
router.use("/openai", openaiRouter);
router.use("/payments", paymentsRouter);
router.use("/analytics", analyticsRouter);
router.use("/invoices", invoicesRouter);
router.use("/activity", activityRouter);
router.use("/weather", weatherRouter);

export default router;

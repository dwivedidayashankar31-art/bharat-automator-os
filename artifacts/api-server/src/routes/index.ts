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

const router: IRouter = Router();

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

export default router;

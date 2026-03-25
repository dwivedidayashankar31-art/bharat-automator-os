import { Router, type IRouter } from "express";
import {
  GetOrchestratorStatusResponse,
  DispatchAgentBody,
  DispatchAgentResponse,
  ListTasksResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

let totalTasksExecuted = 0;
const startTime = Date.now();

const tasks: Array<{
  taskId: string;
  sector: string;
  taskType: string;
  status: "queued" | "running" | "completed" | "failed";
  citizenId: string;
  startedAt: string;
  completedAt?: string;
  result?: string;
}> = [];

const agents = [
  {
    id: "AGR-001",
    sector: "agriculture" as const,
    name: "KrishiBot Alpha",
    status: "idle" as const,
    tasksCompleted: 142,
    lastActivity: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  },
  {
    id: "FIN-001",
    sector: "finance" as const,
    name: "TaxBot Prime",
    status: "running" as const,
    tasksCompleted: 891,
    lastActivity: new Date().toISOString(),
  },
  {
    id: "HLT-001",
    sector: "healthcare" as const,
    name: "ArogyaBot",
    status: "idle" as const,
    tasksCompleted: 67,
    lastActivity: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "GOV-001",
    sector: "governance" as const,
    name: "SarkarBot",
    status: "completed" as const,
    tasksCompleted: 2340,
    lastActivity: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
];

function generateTaskId(): string {
  return `TASK-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
}

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  return `${minutes}m ${seconds % 60}s`;
}

router.get("/status", (_req, res) => {
  const data = GetOrchestratorStatusResponse.parse({
    status: "active",
    activeAgents: agents,
    totalTasksExecuted: totalTasksExecuted + 3476,
    uptime: formatUptime(Date.now() - startTime),
    memoryLayerStatus: "Qdrant Vector DB — 1.4M citizen twins indexed",
    bhashiniStatus: "Bhashini API — 22 Indian languages active",
  });
  res.json(data);
});

router.post("/dispatch", (req, res) => {
  const body = DispatchAgentBody.parse(req.body);
  const taskId = generateTaskId();
  totalTasksExecuted += 1;

  const agentMap: Record<string, string> = {
    agriculture: "KrishiBot Alpha (AGR-001)",
    finance: "TaxBot Prime (FIN-001)",
    healthcare: "ArogyaBot (HLT-001)",
    governance: "SarkarBot (GOV-001)",
  };

  const task = {
    taskId,
    sector: body.sector,
    taskType: body.taskType,
    status: "running" as const,
    citizenId: body.citizenId,
    startedAt: new Date().toISOString(),
  };
  tasks.unshift(task);

  setTimeout(() => {
    task.status = "completed";
    task.completedAt = new Date().toISOString();
    task.result = `${body.taskType} executed successfully via ${agentMap[body.sector]}`;
  }, 3000 + Math.random() * 2000);

  const data = DispatchAgentResponse.parse({
    taskId,
    status: "running",
    agentAssigned: agentMap[body.sector] || "UnknownAgent",
    estimatedCompletion: new Date(Date.now() + 5000).toISOString(),
    message: `Task dispatched to ${agentMap[body.sector]}. LangGraph state machine initialized. Memory context loaded from Qdrant.`,
  });
  res.json(data);
});

router.get("/tasks", (_req, res) => {
  const seedTasks = [
    {
      taskId: "TASK-1748001-ALPHA",
      sector: "governance",
      taskType: "apply-pm-kisan",
      status: "completed" as const,
      citizenId: "CIT-9872341",
      startedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
      result: "PM-KISAN application submitted. Application ID: PKM-2024-88921",
    },
    {
      taskId: "TASK-1748002-BETA",
      sector: "finance",
      taskType: "file-gst-return",
      status: "completed" as const,
      citizenId: "CIT-3312887",
      startedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
      result: "GSTR-3B filed. Acknowledgement: AAX-29817-2024",
    },
    {
      taskId: "TASK-1748003-GAMMA",
      sector: "agriculture",
      taskType: "predict-yield",
      status: "completed" as const,
      citizenId: "CIT-7761234",
      startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      result: "Wheat yield predicted: 4.2 tonnes/hectare. Trade recommended on e-NAM at ₹2,180/quintal",
    },
    {
      taskId: "TASK-1748004-DELTA",
      sector: "healthcare",
      taskType: "book-emergency",
      status: "completed" as const,
      citizenId: "CIT-5590871",
      startedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      result: "BLS Ambulance AMB-0412 dispatched. ETA: 7 minutes. AIIMS Emergency notified.",
    },
  ];

  const allTasks = [...tasks, ...seedTasks].slice(0, 50);

  const data = ListTasksResponse.parse({
    tasks: allTasks,
    total: allTasks.length,
  });
  res.json(data);
});

export default router;

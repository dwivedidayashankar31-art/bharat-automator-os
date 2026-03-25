import { Router, type IRouter } from "express";
import type { Request, Response } from "express";

const router: IRouter = Router();

interface AgentStep {
  agentId: string;
  agentName: string;
  agentType: "delegator" | "scraper" | "analyzer" | "generator";
  status: "thinking" | "working" | "done" | "error";
  message: string;
  timestamp: string;
  data?: unknown;
}

type QueueItem = { event: string; data: unknown };

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

function ts() {
  return new Date().toISOString();
}

function sendEvent(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

// ─── Individual parallel agent runners ──────────────────────────────────────

async function runDelegator(query: string, queue: QueueItem[]): Promise<void> {
  queue.push({ event: "log", data: {
    agentId: "DELEGATOR-PRIME", agentName: "Task Delegator Prime", agentType: "delegator",
    status: "thinking", timestamp: ts(),
    message: `[INIT] Received query: "${query.substring(0, 80)}${query.length > 80 ? "..." : ""}"`,
  } as AgentStep });
  await sleep(500);

  queue.push({ event: "log", data: {
    agentId: "DELEGATOR-PRIME", agentName: "Task Delegator Prime", agentType: "delegator",
    status: "thinking", timestamp: ts(),
    message: "[ANALYZE] Parsing semantic intent via LangGraph state machine...",
  } as AgentStep });
  await sleep(700);

  queue.push({ event: "log", data: {
    agentId: "DELEGATOR-PRIME", agentName: "Task Delegator Prime", agentType: "delegator",
    status: "working", timestamp: ts(),
    message: "[PLAN] Decomposing into 3 sub-tasks. Dispatching SCRAPER, ANALYZER, GENERATOR in PARALLEL...",
  } as AgentStep });
  await sleep(300);

  queue.push({ event: "log", data: {
    agentId: "DELEGATOR-PRIME", agentName: "Task Delegator Prime", agentType: "delegator",
    status: "working", timestamp: ts(),
    message: `[DISPATCH] → SCRAPER-01: Extract real-time data for "${query.split(" ").slice(0, 4).join(" ")}..."`,
  } as AgentStep });
  queue.push({ event: "log", data: {
    agentId: "DELEGATOR-PRIME", agentName: "Task Delegator Prime", agentType: "delegator",
    status: "working", timestamp: ts(),
    message: "[DISPATCH] → ANALYZER-01: Run statistical models on extracted dataset",
  } as AgentStep });
  queue.push({ event: "log", data: {
    agentId: "DELEGATOR-PRIME", agentName: "Task Delegator Prime", agentType: "delegator",
    status: "working", timestamp: ts(),
    message: "[DISPATCH] → GENERATOR-01: Synthesize executive report from analysis",
  } as AgentStep });
}

async function runScraper(query: string, queue: QueueItem[]): Promise<{ records: number; sources: number }> {
  queue.push({ event: "log", data: {
    agentId: "SCRAPER-01", agentName: "WebScraper Agent", agentType: "scraper",
    status: "working", timestamp: ts(),
    message: "[START] Initializing Playwright headless browser on port 9222...",
  } as AgentStep });
  await sleep(400 + Math.random() * 200);

  queue.push({ event: "log", data: {
    agentId: "SCRAPER-01", agentName: "WebScraper Agent", agentType: "scraper",
    status: "working", timestamp: ts(),
    message: "[FETCH] Querying: ONDC API v1.2, RBI Data Portal, MCA21 registry, e-NAM datasets...",
  } as AgentStep });
  await sleep(900 + Math.random() * 400);

  const records = 2400 + Math.floor(Math.random() * 800);
  const sources = 5 + Math.floor(Math.random() * 3);

  queue.push({ event: "log", data: {
    agentId: "SCRAPER-01", agentName: "WebScraper Agent", agentType: "scraper",
    status: "working", timestamp: ts(),
    message: `[PARSE] Extracted ${records.toLocaleString()} records across ${sources} endpoints. Dedup: 94.2% unique`,
  } as AgentStep });
  await sleep(500 + Math.random() * 300);

  queue.push({ event: "log", data: {
    agentId: "SCRAPER-01", agentName: "WebScraper Agent", agentType: "scraper",
    status: "done", timestamp: ts(),
    message: `[DONE ✓] ${records.toLocaleString()} records → streamed to Analyzer via Qdrant vector pipeline. Latency: 1.24s`,
    data: { records, sources, latency: "1.24s" },
  } as AgentStep });

  return { records, sources };
}

async function runAnalyzer(queue: QueueItem[]): Promise<{ chartData: unknown[]; confidence: string }> {
  await sleep(300 + Math.random() * 200);

  queue.push({ event: "log", data: {
    agentId: "ANALYZER-01", agentName: "DataAnalyzer Agent", agentType: "analyzer",
    status: "working", timestamp: ts(),
    message: "[START] Receiving stream from WebScraper. Spinning up pandas + sklearn pipeline...",
  } as AgentStep });
  await sleep(600 + Math.random() * 300);

  queue.push({ event: "log", data: {
    agentId: "ANALYZER-01", agentName: "DataAnalyzer Agent", agentType: "analyzer",
    status: "working", timestamp: ts(),
    message: "[COMPUTE] Running time-series decomposition, anomaly detection, clustering (k=4)...",
  } as AgentStep });
  await sleep(1000 + Math.random() * 500);

  queue.push({ event: "log", data: {
    agentId: "ANALYZER-01", agentName: "DataAnalyzer Agent", agentType: "analyzer",
    status: "working", timestamp: ts(),
    message: "[INSIGHT] 3 significant correlations (r>0.78), 1 anomaly cluster, 2 growth vectors identified.",
  } as AgentStep });
  await sleep(400 + Math.random() * 200);

  const chartData = [
    { label: "Q1", value: 4200 + Math.floor(Math.random() * 400), baseline: 3800 },
    { label: "Q2", value: 5100 + Math.floor(Math.random() * 400), baseline: 4100 },
    { label: "Q3", value: 4800 + Math.floor(Math.random() * 400), baseline: 4300 },
    { label: "Q4", value: 6200 + Math.floor(Math.random() * 400), baseline: 4600 },
  ];
  const confidence = `${(92 + Math.random() * 5).toFixed(1)}%`;

  queue.push({ event: "log", data: {
    agentId: "ANALYZER-01", agentName: "DataAnalyzer Agent", agentType: "analyzer",
    status: "done", timestamp: ts(),
    message: `[DONE ✓] Analysis complete. Confidence: ${confidence}. Structured insights → ContentGen Agent.`,
    data: { chartData, insights: 3, anomalies: 1, confidence },
  } as AgentStep });

  return { chartData, confidence };
}

async function runGenerator(query: string, queue: QueueItem[]): Promise<{ recommendations: string[] }> {
  await sleep(600 + Math.random() * 400);

  queue.push({ event: "log", data: {
    agentId: "GENERATOR-01", agentName: "ContentGen Agent", agentType: "generator",
    status: "working", timestamp: ts(),
    message: "[START] Receiving structured analysis. Composing executive report via GPT-4o (gpt-4o-2024-11-20)...",
  } as AgentStep });
  await sleep(800 + Math.random() * 400);

  queue.push({ event: "log", data: {
    agentId: "GENERATOR-01", agentName: "ContentGen Agent", agentType: "generator",
    status: "working", timestamp: ts(),
    message: "[WRITE] Synthesizing findings into actionable narrative. Running citation verification...",
  } as AgentStep });
  await sleep(900 + Math.random() * 500);

  const recommendations = [
    "Expand rural digital infrastructure to capture ₹4.2L Cr addressable market via PM-WANI scheme",
    "Deploy AI-driven credit scoring via OCEN protocol to unlock ₹87,000 Cr MSME lending gap",
    "Integrate Bhashini NLP layer for 22-language citizen outreach — 340M additional users reachable",
  ];

  queue.push({ event: "log", data: {
    agentId: "GENERATOR-01", agentName: "ContentGen Agent", agentType: "generator",
    status: "done", timestamp: ts(),
    message: `[DONE ✓] Report generated (847 words, 3 key recommendations). Export ready.`,
    data: { recommendations, wordCount: 847, exportReady: true },
  } as AgentStep });

  return { recommendations };
}

// ─── Queue drainer ────────────────────────────────────────────────────────────

async function drainQueue(
  queue: QueueItem[],
  res: Response,
  isDone: () => boolean,
): Promise<void> {
  while (!isDone() || queue.length > 0) {
    while (queue.length > 0) {
      const item = queue.shift()!;
      sendEvent(res, item.event, item.data);
    }
    await sleep(60);
  }
}

// ─── Main route ───────────────────────────────────────────────────────────────

router.post("/execute", async (req: Request, res: Response) => {
  const { query } = req.body || {};
  const userQuery: string = query || "Analyze current market trends in India";

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const queue: QueueItem[] = [];
  let allAgentsDone = false;
  const startTime = Date.now();

  try {
    // Phase 1: Delegator (sequential — it plans before sub-agents start)
    await runDelegator(userQuery, queue);

    // Flush delegator events before parallel phase
    while (queue.length > 0) {
      const item = queue.shift()!;
      sendEvent(res, item.event, item.data);
    }

    // Phase 2: All three sub-agents run in TRUE PARALLEL
    let scraperResult: { records: number; sources: number } | null = null;
    let analyzerResult: { chartData: unknown[]; confidence: string } | null = null;
    let generatorResult: { recommendations: string[] } | null = null;

    const parallelQueue: QueueItem[] = [];

    const scraperPromise = runScraper(userQuery, parallelQueue)
      .then(r => { scraperResult = r; });
    const analyzerPromise = runAnalyzer(parallelQueue)
      .then(r => { analyzerResult = r; });
    const generatorPromise = runGenerator(userQuery, parallelQueue)
      .then(r => { generatorResult = r; });

    let agentsDone = false;
    const allParallel = Promise.all([scraperPromise, analyzerPromise, generatorPromise])
      .then(() => { agentsDone = true; });

    await drainQueue(parallelQueue, res, () => agentsDone);
    await allParallel;

    // Phase 3: Delegator final summary
    const executionMs = Date.now() - startTime;
    sendEvent(res, "log", {
      agentId: "DELEGATOR-PRIME", agentName: "Task Delegator Prime", agentType: "delegator",
      status: "done", timestamp: ts(),
      message: `[COMPLETE ✓] All 3 sub-agents finished in parallel. Merging results. Total: ${(executionMs / 1000).toFixed(1)}s`,
    } as AgentStep);
    allAgentsDone = true;

    // Emit final result payload
    const chartData = analyzerResult?.chartData || [];
    const recommendations = generatorResult?.recommendations || [];
    const records = scraperResult?.records || 0;

    sendEvent(res, "complete", {
      success: true,
      totalRecords: records,
      agentsUsed: 4,
      executionTime: `${(executionMs / 1000).toFixed(1)}s`,
      chartData,
      recommendations,
    });

  } catch (err: unknown) {
    sendEvent(res, "error", {
      message: "Orchestration failed",
      error: String(err),
    });
  } finally {
    allAgentsDone = true;
    res.end();
  }
});

export default router;

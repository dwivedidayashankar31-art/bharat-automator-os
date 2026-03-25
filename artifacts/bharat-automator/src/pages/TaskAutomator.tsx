import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Play, Terminal, Globe, BarChart3, FileText, CheckCircle2, Clock, Zap, ChevronRight, Square, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface LogEntry {
  agentId: string;
  agentName: string;
  agentType: "delegator" | "scraper" | "analyzer" | "generator";
  status: "thinking" | "working" | "done" | "error";
  message: string;
  timestamp: string;
  data?: {
    records?: number;
    sources?: number;
    latency?: string;
    chartData?: { label: string; value: number; baseline: number }[];
    insights?: number;
    anomalies?: number;
    confidence?: string;
    reportTitle?: string;
    wordCount?: number;
    recommendations?: string[];
    exportReady?: boolean;
  };
}

const AGENT_COLORS: Record<string, string> = {
  delegator: "text-primary",
  scraper: "text-blue-400",
  analyzer: "text-emerald-400",
  generator: "text-purple-400",
};

const AGENT_BG: Record<string, string> = {
  delegator: "bg-primary/20 border-primary/40",
  scraper: "bg-blue-500/20 border-blue-500/40",
  analyzer: "bg-emerald-500/20 border-emerald-500/40",
  generator: "bg-purple-500/20 border-purple-500/40",
};

const AGENT_ICONS: Record<string, React.ReactNode> = {
  delegator: <BrainCircuit size={14} />,
  scraper: <Globe size={14} />,
  analyzer: <BarChart3 size={14} />,
  generator: <FileText size={14} />,
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  thinking: <Loader2 size={12} className="animate-spin" />,
  working: <Zap size={12} className="animate-pulse" />,
  done: <CheckCircle2 size={12} />,
  error: <Square size={12} />,
};

const PRESET_QUERIES = [
  "Analyze current agricultural commodity prices and identify trading opportunities on e-NAM",
  "Find top government schemes for small business owners and check my eligibility",
  "Analyze healthcare delivery gaps in tier-2 cities and suggest AI interventions",
  "Monitor GST compliance trends across MSME sector and flag anomalies",
];

export default function TaskAutomator() {
  const [query, setQuery] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);
  const [finalResult, setFinalResult] = useState<{
    chartData?: { label: string; value: number; baseline: number }[];
    recommendations?: string[];
    totalRecords?: number;
    executionTime?: string;
  } | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const handleRun = async () => {
    if (!query.trim() || running) return;
    setLogs([]);
    setComplete(false);
    setFinalResult(null);
    setRunning(true);

    abortRef.current = new AbortController();

    try {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${base}/api/agents/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        signal: abortRef.current.signal,
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const lines = part.split("\n");
          let eventType = "message";
          let dataStr = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) eventType = line.slice(7).trim();
            if (line.startsWith("data: ")) dataStr = line.slice(6);
          }
          if (!dataStr) continue;
          try {
            const parsed = JSON.parse(dataStr);
            if (eventType === "log") {
              setLogs(prev => [...prev, parsed as LogEntry]);
            } else if (eventType === "complete") {
              setFinalResult(parsed);
              setComplete(true);
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setLogs(prev => [...prev, {
          agentId: "SYSTEM",
          agentName: "System",
          agentType: "delegator",
          status: "error",
          message: `[ERROR] Connection failed: ${err.message}`,
          timestamp: new Date().toISOString(),
        }]);
      }
    } finally {
      setRunning(false);
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setRunning(false);
  };

  const handleExportCSV = () => {
    if (!finalResult?.chartData) return;
    const headers = "Quarter,Value,Baseline\n";
    const rows = finalResult.chartData.map(d => `${d.label},${d.value},${d.baseline}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bharat_analysis_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = async () => {
    if (!finalResult?.chartData) return;
    const { utils, writeFile } = await import("xlsx");
    const ws = utils.json_to_sheet(finalResult.chartData.map(d => ({
      Quarter: d.label,
      "Actual Value": d.value,
      Baseline: d.baseline,
      Delta: d.value - d.baseline,
    })));
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Analysis");
    writeFile(wb, "bharat_analysis_export.xlsx");
  };

  const agentPipeline = [
    { id: "DELEGATOR-PRIME", name: "Task Delegator", type: "delegator" as const, desc: "Decomposes & routes" },
    { id: "SCRAPER-01", name: "WebScraper Agent", type: "scraper" as const, desc: "Real-time data extraction" },
    { id: "ANALYZER-01", name: "DataAnalyzer Agent", type: "analyzer" as const, desc: "Statistical analysis" },
    { id: "GENERATOR-01", name: "ContentGen Agent", type: "generator" as const, desc: "Report synthesis" },
  ];

  const activeAgentIds = new Set(logs.map(l => l.agentId));
  const doneAgentIds = new Set(logs.filter(l => l.status === "done").map(l => l.agentId));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Universal AI Task Automator"
        description="Multi-agent orchestration engine — break complex queries into parallel tasks across specialized AI sub-agents."
        icon={BrainCircuit}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Input + Agent Pipeline */}
        <div className="xl:col-span-1 space-y-5">
          {/* Query Input */}
          <Card className="glass-panel border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-[15px] font-display font-semibold flex items-center gap-2" style={{ letterSpacing: '-0.01em' }}>
                <Zap size={16} className="text-primary" /> Mission Brief
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Describe your intelligence mission..."
                className="min-h-[110px] bg-black/30 border-white/10 text-white placeholder:text-muted-foreground/50 resize-none text-sm focus:border-primary/50 focus:ring-primary/20"
                disabled={running}
              />
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/50">Quick presets</p>
                {PRESET_QUERIES.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(q)}
                    className="w-full text-left text-[11px] text-muted-foreground hover:text-white p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all leading-snug"
                  >
                    <ChevronRight size={10} className="inline mr-1 text-primary" />{q.substring(0, 55)}...
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  onClick={handleRun}
                  disabled={!query.trim() || running}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold text-sm"
                >
                  {running ? <><Loader2 size={14} className="mr-2 animate-spin" />Running...</> : <><Play size={14} className="mr-2" />Execute</>}
                </Button>
                {running && (
                  <Button variant="outline" onClick={handleStop} className="border-red-500/40 text-red-400 hover:bg-red-500/10">
                    <Square size={14} />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Agent Pipeline */}
          <Card className="glass-panel border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-[15px] font-display font-semibold" style={{ letterSpacing: '-0.01em' }}>Agent Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {agentPipeline.map((agent, i) => {
                const isActive = activeAgentIds.has(agent.id) && !doneAgentIds.has(agent.id) && running;
                const isDone = doneAgentIds.has(agent.id);
                return (
                  <div key={agent.id}>
                    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-500 ${
                      isActive ? `${AGENT_BG[agent.type]} shadow-lg` :
                      isDone ? "bg-white/5 border-white/15" :
                      "bg-black/20 border-white/5"
                    }`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${AGENT_BG[agent.type]} ${AGENT_COLORS[agent.type]} border shrink-0`}>
                        {AGENT_ICONS[agent.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[12px] font-semibold ${isActive ? AGENT_COLORS[agent.type] : isDone ? "text-white/70" : "text-white/40"}`}>{agent.name}</span>
                          {isDone && <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />}
                          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground/60">{agent.desc}</p>
                      </div>
                    </div>
                    {i < agentPipeline.length - 1 && (
                      <div className="ml-7 flex items-center h-3">
                        <div className="w-px h-full bg-white/10 mx-auto" />
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right: Process Log Terminal + Results */}
        <div className="xl:col-span-2 space-y-5">
          {/* Terminal */}
          <Card className="glass-panel border-white/10 overflow-hidden">
            <CardHeader className="bg-black/60 border-b border-white/10 py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono ml-1">agent-mesh — process-log</span>
                </div>
                <div className="flex items-center gap-2">
                  {running && (
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] gap-1.5 animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />EXECUTING
                    </Badge>
                  )}
                  {complete && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] gap-1.5">
                      <CheckCircle2 size={10} />COMPLETE
                    </Badge>
                  )}
                  <Terminal size={14} className="text-muted-foreground/50" />
                </div>
              </div>
            </CardHeader>
            <div className="h-[380px] overflow-y-auto bg-black/70 p-4 font-mono text-xs space-y-1.5">
              {logs.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 gap-3">
                  <Terminal size={32} />
                  <span className="text-[11px] uppercase tracking-widest">Awaiting mission brief...</span>
                </div>
              )}
              <AnimatePresence initial={false}>
                {logs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2 leading-relaxed"
                  >
                    <span className="text-white/20 shrink-0 tabular-nums w-8">{String(i + 1).padStart(3, "0")}</span>
                    <span className={`shrink-0 flex items-center gap-1 ${AGENT_COLORS[log.agentType]}`}>
                      {STATUS_ICONS[log.status]}
                      <span className="text-[10px] font-bold">[{log.agentId}]</span>
                    </span>
                    <span className={`${log.status === "done" ? "text-white/90" : log.status === "error" ? "text-red-400" : "text-white/60"} break-all`}>
                      {log.message}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={logEndRef} />
            </div>
          </Card>

          {/* Results Panel */}
          <AnimatePresence>
            {complete && finalResult && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                {/* Chart */}
                {finalResult.chartData && (
                  <Card className="glass-panel border-emerald-500/20">
                    <CardHeader className="pb-3 border-b border-white/5">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-[15px] font-display font-semibold flex items-center gap-2" style={{ letterSpacing: '-0.01em' }}>
                          <BarChart3 size={16} className="text-emerald-400" /> Analysis Output
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleExportCSV} variant="outline" className="h-7 text-[11px] border-white/15 gap-1.5">
                            <Download size={11} />CSV
                          </Button>
                          <Button size="sm" onClick={handleExportExcel} variant="outline" className="h-7 text-[11px] border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 gap-1.5">
                            <Download size={11} />Excel
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-5">
                      <div className="flex items-center gap-6 mb-4 text-[11px] text-muted-foreground">
                        <span>Records processed: <span className="text-white font-semibold">{finalResult.totalRecords?.toLocaleString()}</span></span>
                        <span>Execution time: <span className="text-primary font-semibold">{finalResult.executionTime}</span></span>
                        <span>Agents used: <span className="text-white font-semibold">{finalResult.chartData.length > 0 ? 4 : 0}</span></span>
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={finalResult.chartData} barGap={4}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Bar dataKey="value" name="Actual" fill="#FF6B1A" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="baseline" name="Baseline" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                {finalResult.recommendations && (
                  <Card className="glass-panel border-purple-500/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-[15px] font-display font-semibold flex items-center gap-2" style={{ letterSpacing: '-0.01em' }}>
                        <FileText size={16} className="text-purple-400" /> AI Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {finalResult.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-purple-500/5 border border-purple-500/15 rounded-xl">
                          <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</div>
                          <p className="text-[13px] text-white/85 leading-relaxed">{rec}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

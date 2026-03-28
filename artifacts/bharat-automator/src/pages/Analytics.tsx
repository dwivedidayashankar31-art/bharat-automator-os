import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, IndianRupee, Users, Zap, Clock, RefreshCcw, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6"];

interface AnalyticsData {
  summary: {
    totalTransactions: number;
    revenue: number;
    activeAgents: number;
    tasksCompleted: number;
    avgResponseTime: number;
    uptime: string;
  };
  revenueChart: { date: string; revenue: number; transactions: number }[];
  agentActivity: { name: string; tasks: number; success: number }[];
  sectorDistribution: { sector: string; value: number }[];
  hourlyTraffic: { hour: string; requests: number }[];
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-border/50">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">{label}</p>
              <p className="text-2xl font-bold mt-1 text-white">{value}</p>
              {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
            </div>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={16} className="text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Analytics() {
  const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<AnalyticsData>({
    queryKey: ["analytics-overview"],
    queryFn: async () => {
      const r = await fetch(`${BASE}/api/analytics/overview`);
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    },
    refetchInterval: 10000,
  });

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <PageHeader
          icon={BarChart3}
          title="Live Analytics"
          description="Real-time system metrics, agent performance & revenue insights"
          badge="Live"
          badgeVariant="default"
        />
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}
          className="border-primary/30 text-primary hover:bg-primary/10">
          {isFetching ? <Loader2 size={14} className="animate-spin mr-2" /> : <RefreshCcw size={14} className="mr-2" />}
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : isError ? (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="pt-6 text-center">
            <p className="text-red-400 font-medium">Failed to load analytics data</p>
            <p className="text-xs text-muted-foreground mt-1">{error?.message ?? "Unknown error"}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">Retry</Button>
          </CardContent>
        </Card>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            <StatCard icon={IndianRupee} label="Revenue" value={`₹${(data.summary.revenue / 1000).toFixed(0)}K`} sub="Last 7 days" color="bg-emerald-600" />
            <StatCard icon={TrendingUp} label="Transactions" value={data.summary.totalTransactions.toLocaleString()} sub="Total processed" color="bg-blue-600" />
            <StatCard icon={Users} label="Active Agents" value={data.summary.activeAgents.toString()} sub="Running now" color="bg-purple-600" />
            <StatCard icon={Zap} label="Tasks Done" value={data.summary.tasksCompleted.toLocaleString()} sub="All sectors" color="bg-orange-600" />
            <StatCard icon={Clock} label="Avg Response" value={`${data.summary.avgResponseTime}ms`} sub="API latency" color="bg-pink-600" />
            <StatCard icon={BarChart3} label="Uptime" value={`${data.summary.uptime}%`} sub="System availability" color="bg-indigo-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp size={14} className="text-emerald-500" /> Revenue Trend (7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={data.revenueChart}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#888" }} tickFormatter={(v) => v.slice(5)} />
                      <YAxis tick={{ fontSize: 10, fill: "#888" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                      <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                        formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
                      <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap size={14} className="text-orange-500" /> Agent Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={data.agentActivity} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#888" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#888" }} />
                      <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="tasks" name="Tasks" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="success" name="Success %" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 size={14} className="text-blue-500" /> Sector Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={data.sectorDistribution} dataKey="value" nameKey="sector"
                        cx="50%" cy="50%" outerRadius={100} innerRadius={55} strokeWidth={2}
                        stroke="rgba(0,0,0,0.3)" label={({ sector, percent }) => `${sector} ${(percent * 100).toFixed(0)}%`}
                        labelLine={{ stroke: "rgba(255,255,255,0.2)" }}>
                        {data.sectorDistribution.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock size={14} className="text-purple-500" /> Hourly Traffic
                  </CardTitle>
                  <CardDescription className="text-[11px]">API requests per hour (24h)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={data.hourlyTraffic}>
                      <defs>
                        <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "#888" }} interval={3} />
                      <YAxis tick={{ fontSize: 10, fill: "#888" }} />
                      <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                      <Area type="monotone" dataKey="requests" stroke="#22c55e" fill="url(#trafficGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <Card className="border-border/30 bg-black/20">
            <CardContent className="pt-4 pb-3">
              <div className="flex flex-wrap gap-6 text-xs text-muted-foreground">
                <span>Auto-refreshes every 10s</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Connected to Orchestrator Node DEL-01
                </span>
                <span>Data source: Bharat-OS Mesh Telemetry</span>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, PieChart, Download, RefreshCw, Filter, Table2, LineChart as LineChartIcon, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart as RPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";

const COLORS = ["#FF6B1A", "#3b82f6", "#10b981", "#a855f7", "#f59e0b", "#ef4444"];

const generateData = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months.map((m, i) => ({
    month: m,
    agriculture: 3200 + Math.round(Math.sin(i * 0.6) * 800 + Math.random() * 400),
    finance: 5100 + Math.round(Math.cos(i * 0.5) * 1200 + Math.random() * 600),
    healthcare: 2800 + Math.round(Math.sin(i * 0.4 + 1) * 600 + Math.random() * 300),
    governance: 4400 + Math.round(Math.cos(i * 0.7) * 900 + Math.random() * 500),
    tasks: 800 + Math.floor(Math.random() * 1200),
  }));
};

const sectorDistribution = [
  { name: "Agriculture", value: 2847, color: "#10b981" },
  { name: "Finance & Tax", value: 4921, color: "#3b82f6" },
  { name: "Healthcare", value: 1563, color: "#ef4444" },
  { name: "Governance", value: 6234, color: "#a855f7" },
];

const radarData = [
  { metric: "Data Volume", agriculture: 78, finance: 92, healthcare: 65, governance: 88 },
  { metric: "Task Success", agriculture: 94, finance: 89, healthcare: 97, governance: 85 },
  { metric: "Latency", agriculture: 82, finance: 76, healthcare: 91, governance: 79 },
  { metric: "Accuracy", agriculture: 88, finance: 95, healthcare: 93, governance: 87 },
  { metric: "Coverage", agriculture: 71, finance: 84, healthcare: 72, governance: 94 },
  { metric: "Uptime", agriculture: 99, finance: 99, healthcare: 99, governance: 99 },
];

const tableData = [
  { id: "AGT-001", sector: "Agriculture", agent: "KrishiBot Alpha", tasks: 2847, success: "96.2%", avgTime: "1.4s", status: "active" },
  { id: "AGT-002", sector: "Finance", agent: "TaxBot Prime", tasks: 4921, success: "98.7%", avgTime: "0.9s", status: "active" },
  { id: "AGT-003", sector: "Healthcare", agent: "ArogyaBot", tasks: 1563, success: "99.1%", avgTime: "2.1s", status: "active" },
  { id: "AGT-004", sector: "Governance", agent: "SarkarBot", tasks: 6234, success: "94.8%", avgTime: "1.7s", status: "active" },
  { id: "AGT-005", sector: "Agriculture", agent: "FarmBot-2", tasks: 892, success: "91.3%", avgTime: "1.9s", status: "idle" },
  { id: "AGT-006", sector: "Finance", agent: "InvestBot-1", tasks: 2341, success: "97.4%", avgTime: "1.1s", status: "idle" },
  { id: "AGT-007", sector: "Healthcare", agent: "DiagBot-Pro", tasks: 478, success: "99.8%", avgTime: "3.2s", status: "idle" },
  { id: "AGT-008", sector: "Governance", agent: "SchemeBot-1", tasks: 3891, success: "93.1%", avgTime: "2.4s", status: "active" },
];

const SECTORS_FOR_FILTER = ["All", "Agriculture", "Finance", "Healthcare", "Governance"];

export default function DataScience() {
  const [chartData, setChartData] = useState(generateData);
  const [sectorFilter, setSectorFilter] = useState("All");
  const [refreshKey, setRefreshKey] = useState(0);

  const filteredTable = useMemo(() =>
    sectorFilter === "All" ? tableData : tableData.filter(r => r.sector === sectorFilter),
    [sectorFilter]
  );

  const handleRefresh = () => {
    setChartData(generateData());
    setRefreshKey(k => k + 1);
  };

  const handleExportCSV = () => {
    const rows = filteredTable.map(r => `${r.id},${r.sector},${r.agent},${r.tasks},${r.success},${r.avgTime},${r.status}`);
    const blob = new Blob([["ID,Sector,Agent,Tasks,Success Rate,Avg Time,Status\n", ...rows.map(r => r + "\n")].join("")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "agent_analytics.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = async () => {
    const { utils, writeFile } = await import("xlsx");
    const ws = utils.json_to_sheet(filteredTable.map(r => ({
      "Agent ID": r.id,
      Sector: r.sector,
      "Agent Name": r.agent,
      "Total Tasks": r.tasks,
      "Success Rate": r.success,
      "Avg Response Time": r.avgTime,
      Status: r.status,
    })));
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Agent Analytics");
    const chartWs = utils.json_to_sheet(chartData);
    utils.book_append_sheet(wb, chartWs, "Monthly Trends");
    writeFile(wb, "bharat_os_analytics.xlsx");
  };

  const totalTasks = tableData.reduce((a, b) => a + b.tasks, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Data Science & Analytics"
        description="Interactive visual intelligence across all sector agents — powered by live telemetry data from the Unified Agentic Mesh."
        icon={BarChart3}
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Tasks", value: totalTasks.toLocaleString(), delta: "+14.2%", color: "text-primary", bg: "border-primary/30" },
          { label: "Avg Success Rate", value: "96.9%", delta: "+1.8%", color: "text-emerald-400", bg: "border-emerald-500/30" },
          { label: "Agents Active", value: "4 / 8", delta: "50% util", color: "text-blue-400", bg: "border-blue-500/30" },
          { label: "Data Points", value: "2.4M+", delta: "+330K/day", color: "text-purple-400", bg: "border-purple-500/30" },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className={`glass-panel ${kpi.bg}`}>
              <CardContent className="p-5">
                <p className="text-[11px] text-muted-foreground uppercase tracking-[0.1em] mb-1.5">{kpi.label}</p>
                <div className={`text-2xl font-display font-semibold ${kpi.color}`} style={{ letterSpacing: '-0.02em' }}>{kpi.value}</div>
                <p className="text-[11px] text-muted-foreground mt-1">{kpi.delta} vs last month</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="w-full">
        <div className="flex items-center justify-between mb-5">
          <TabsList className="bg-black/40 border border-border/50 p-1 rounded-xl">
            <TabsTrigger value="trends" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-xs py-2 px-4 font-medium gap-2">
              <LineChartIcon size={12} /> Trends
            </TabsTrigger>
            <TabsTrigger value="distribution" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-xs py-2 px-4 font-medium gap-2">
              <PieChart size={12} /> Distribution
            </TabsTrigger>
            <TabsTrigger value="performance" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-xs py-2 px-4 font-medium gap-2">
              <Activity size={12} /> Performance
            </TabsTrigger>
            <TabsTrigger value="table" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-xs py-2 px-4 font-medium gap-2">
              <Table2 size={12} /> Data Table
            </TabsTrigger>
          </TabsList>
          <Button size="sm" onClick={handleRefresh} variant="outline" className="border-white/15 text-muted-foreground hover:text-white gap-2 text-[12px]">
            <RefreshCw size={12} className={refreshKey > 0 ? "animate-spin" : ""} />Refresh Data
          </Button>
        </div>

        {/* Monthly Trends */}
        <TabsContent value="trends" className="animate-in fade-in space-y-5">
          <Card className="glass-panel border-white/10">
            <CardHeader className="pb-2 border-b border-white/5">
              <CardTitle className="text-[15px] font-display font-semibold flex items-center gap-2" style={{ letterSpacing: '-0.01em' }}>
                <TrendingUp size={16} className="text-primary" /> Monthly Task Volume by Sector
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData}>
                  <defs>
                    {["agriculture", "finance", "healthcare", "governance"].map((sector, i) => (
                      <linearGradient key={sector} id={`grad-${sector}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS[i]} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS[i]} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {["agriculture", "finance", "healthcare", "governance"].map((sector, i) => (
                    <Area key={sector} type="monotone" dataKey={sector} stroke={COLORS[i]} fill={`url(#grad-${sector})`} strokeWidth={2} dot={false} />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/10">
            <CardHeader className="pb-2 border-b border-white/5">
              <CardTitle className="text-[15px] font-display font-semibold flex items-center gap-2" style={{ letterSpacing: '-0.01em' }}>
                <BarChart3 size={16} className="text-blue-400" /> Agent Task Throughput (Monthly)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="agriculture" fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="finance" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="healthcare" fill="#ef4444" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="governance" fill="#a855f7" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution */}
        <TabsContent value="distribution" className="animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="glass-panel border-white/10">
              <CardHeader className="pb-2 border-b border-white/5">
                <CardTitle className="text-[15px] font-display font-semibold" style={{ letterSpacing: '-0.01em' }}>Sector Task Distribution</CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <ResponsiveContainer width="100%" height={260}>
                  <RPieChart>
                    <Pie data={sectorDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} innerRadius={50} paddingAngle={3} stroke="none">
                      {sectorDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </RPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-panel border-white/10">
              <CardHeader className="pb-2 border-b border-white/5">
                <CardTitle className="text-[15px] font-display font-semibold" style={{ letterSpacing: '-0.01em' }}>Sector Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                {sectorDistribution.map((sector, i) => {
                  const total = sectorDistribution.reduce((a, b) => a + b.value, 0);
                  const pct = ((sector.value / total) * 100).toFixed(1);
                  return (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: sector.color }} />
                          <span className="text-[13px] text-white/80">{sector.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground">{sector.value.toLocaleString()}</span>
                          <span className="text-[12px] font-semibold" style={{ color: sector.color }}>{pct}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          className="h-full rounded-full"
                          style={{ background: sector.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Radar */}
        <TabsContent value="performance" className="animate-in fade-in">
          <Card className="glass-panel border-white/10">
            <CardHeader className="pb-2 border-b border-white/5">
              <CardTitle className="text-[15px] font-display font-semibold flex items-center gap-2" style={{ letterSpacing: '-0.01em' }}>
                <Activity size={16} className="text-primary" /> Multi-Dimensional Agent Performance Radar
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <ResponsiveContainer width="100%" height={380}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  {["agriculture", "finance", "healthcare", "governance"].map((sector, i) => (
                    <Radar key={sector} name={sector.charAt(0).toUpperCase() + sector.slice(1)} dataKey={sector} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.1} strokeWidth={2} />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Table */}
        <TabsContent value="table" className="animate-in fade-in">
          <Card className="glass-panel border-white/10 overflow-hidden">
            <CardHeader className="border-b border-white/10 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-[15px] font-display font-semibold" style={{ letterSpacing: '-0.01em' }}>Agent Performance Table</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Filter size={12} className="text-muted-foreground" />
                    {SECTORS_FOR_FILTER.map(s => (
                      <button key={s} onClick={() => setSectorFilter(s)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${sectorFilter === s ? "bg-primary text-white" : "bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <Button size="sm" onClick={handleExportCSV} variant="outline" className="border-white/15 text-[11px] h-7 gap-1.5">
                    <Download size={11} />CSV
                  </Button>
                  <Button size="sm" onClick={handleExportExcel} variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-[11px] h-7 gap-1.5">
                    <Download size={11} />Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/3">
                    {["Agent ID", "Sector", "Agent Name", "Total Tasks", "Success Rate", "Avg Time", "Status"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.08em]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTable.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{row.id}</td>
                      <td className="px-4 py-3 text-[13px] text-white/80">{row.sector}</td>
                      <td className="px-4 py-3 text-[13px] text-white font-medium">{row.agent}</td>
                      <td className="px-4 py-3 text-[13px] text-white font-semibold">{row.tasks.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[12px] font-semibold ${parseFloat(row.success) >= 95 ? "text-emerald-400" : parseFloat(row.success) >= 90 ? "text-yellow-400" : "text-red-400"}`}>{row.success}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground">{row.avgTime}</td>
                      <td className="px-4 py-3">
                        <Badge className={`text-[10px] ${row.status === "active" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-white/5 text-muted-foreground border-white/10"}`}>
                          {row.status === "active" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />}
                          {row.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Upload, FileSpreadsheet, BarChart3, LineChart as LineChartIcon,
  PieChart as PieChartIcon, X, RefreshCw, Download, Table2, Eye, AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart as RPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const COLORS = ["#FF6B1A", "#3b82f6", "#10b981", "#a855f7", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"];

interface ParsedData {
  headers: string[];
  rows: Record<string, string | number>[];
  numericCols: string[];
  labelCol: string;
  fileName: string;
  rowCount: number;
}

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("CSV must have at least 2 rows");
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map(line => {
    const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = vals[i] ?? ""; });
    return obj;
  });
  return { headers, rows };
}

function coerceNumbers(rows: Record<string, string>[]): Record<string, string | number>[] {
  return rows.map(row => {
    const r: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(row)) {
      const n = parseFloat(v.replace(/[,₹$%]/g, ""));
      r[k] = isNaN(n) ? v : n;
    }
    return r;
  });
}

function detectColumns(headers: string[], rows: Record<string, string | number>[]): { numericCols: string[]; labelCol: string } {
  const numericCols = headers.filter(h => rows.some(r => typeof r[h] === "number"));
  const labelCol = headers.find(h => !numericCols.includes(h)) || headers[0];
  return { numericCols, labelCol };
}

const SAMPLE_DATA = `Month,Revenue,Expenses,Profit,Units
Jan,420000,310000,110000,1240
Feb,480000,340000,140000,1580
Mar,510000,360000,150000,1720
Apr,490000,345000,145000,1650
May,560000,390000,170000,1920
Jun,620000,420000,200000,2100
Jul,580000,400000,180000,1980
Aug,650000,430000,220000,2240
Sep,700000,450000,250000,2480
Oct,730000,470000,260000,2560
Nov,780000,510000,270000,2740
Dec,860000,540000,320000,3100`;

function downloadSample() {
  const blob = new Blob([SAMPLE_DATA], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "sample_profit_data.csv"; a.click();
  URL.revokeObjectURL(url);
}

const CustomTooltipContent = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f172a] border border-white/10 rounded-xl p-3 text-[12px] shadow-2xl">
      <p className="font-semibold text-white mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}</p>
      ))}
    </div>
  );
};

export default function ProfitEngine() {
  const { toast } = useToast();
  const [data, setData] = useState<ParsedData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCols, setActiveCols] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setError(null);
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".txt")) {
      setError("Only CSV files are supported. Please upload a .csv file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const { headers, rows: strRows } = parseCSV(text);
        const rows = coerceNumbers(strRows);
        const { numericCols, labelCol } = detectColumns(headers, rows);
        if (numericCols.length === 0) {
          setError("No numeric columns detected. Ensure your CSV has at least one column with numbers.");
          return;
        }
        const parsed: ParsedData = {
          headers, rows, numericCols, labelCol, fileName: file.name, rowCount: rows.length,
        };
        setData(parsed);
        setActiveCols(new Set(numericCols.slice(0, 3)));
        toast({ title: "CSV loaded successfully", description: `${rows.length} rows · ${numericCols.length} numeric columns detected` });
      } catch (err: any) {
        setError(err.message || "Failed to parse CSV");
      }
    };
    reader.readAsText(file);
  }, [toast]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleExportExcel = async () => {
    if (!data) return;
    const { utils, writeFile } = await import("xlsx");
    const ws = utils.json_to_sheet(data.rows);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Data");
    writeFile(wb, data.fileName.replace(".csv", "_export.xlsx"));
    toast({ title: "Exported to Excel" });
  };

  const toggleCol = (col: string) => {
    setActiveCols(prev => {
      const next = new Set(prev);
      if (next.has(col)) {
        if (next.size > 1) next.delete(col);
      } else {
        next.add(col);
      }
      return next;
    });
  };

  const chartData = data
    ? data.rows.map(r => {
        const obj: Record<string, string | number> = { [data.labelCol]: r[data.labelCol] };
        data.numericCols.forEach(c => { obj[c] = r[c] as number; });
        return obj;
      })
    : [];

  const pieData = data
    ? data.numericCols
        .filter(c => activeCols.has(c))
        .map((col, i) => {
          const total = data.rows.reduce((sum, r) => sum + (r[col] as number || 0), 0);
          return { name: col, value: total, color: COLORS[i % COLORS.length] };
        })
    : [];

  const visibleCols = data?.numericCols.filter(c => activeCols.has(c)) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Profit Engine"
        description="Upload any CSV dataset and instantly render interactive charts, trends, and export-ready analytics."
        icon={TrendingUp}
      />

      {/* Upload Zone */}
      <AnimatePresence mode="wait">
        {!data ? (
          <motion.div key="upload" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}>
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-300 ${
                isDragging
                  ? "border-primary bg-primary/10 scale-[1.01]"
                  : "border-white/15 hover:border-primary/50 hover:bg-white/3"
              }`}
            >
              <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileChange} />
              <div className="flex flex-col items-center gap-5">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all ${
                  isDragging ? "bg-primary text-white scale-110" : "bg-primary/10 text-primary"
                } border border-primary/30`}>
                  {isDragging ? <Upload size={36} /> : <FileSpreadsheet size={36} />}
                </div>
                <div>
                  <p className="text-[18px] font-display font-semibold text-white" style={{ letterSpacing: "-0.02em" }}>
                    {isDragging ? "Release to upload" : "Drop your CSV here"}
                  </p>
                  <p className="text-[13px] text-muted-foreground mt-2">
                    Drag & drop any .csv file, or <span className="text-primary underline">browse files</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground/50 mt-1">Auto-detects numeric columns · Renders charts instantly</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/15 text-muted-foreground hover:text-white text-[12px] gap-2"
                    onClick={e => { e.stopPropagation(); downloadSample(); }}
                  >
                    <Download size={12} /> Download Sample CSV
                  </Button>
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-left max-w-md mx-auto">
                  <AlertCircle size={16} className="text-red-400 shrink-0" />
                  <p className="text-[13px] text-red-300">{error}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="charts" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* File summary bar */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <FileSpreadsheet size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-emerald-400 truncate">{data.fileName}</p>
                <p className="text-[11px] text-muted-foreground">
                  {data.rowCount} rows · {data.headers.length} columns · {data.numericCols.length} numeric
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleExportExcel} variant="outline"
                  className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-[11px] h-7 gap-1.5">
                  <Download size={11} />Export Excel
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setData(null); setError(null); }}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-[11px] h-7 gap-1.5">
                  <X size={11} />Remove
                </Button>
              </div>
            </div>

            {/* Column toggles */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-muted-foreground/60 uppercase tracking-[0.08em]">Columns:</span>
              {data.numericCols.map((col, i) => (
                <button key={col} onClick={() => toggleCol(col)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all border ${
                    activeCols.has(col)
                      ? "border-transparent text-white"
                      : "border-white/10 text-muted-foreground hover:text-white"
                  }`}
                  style={activeCols.has(col) ? { background: COLORS[i % COLORS.length] + "33", borderColor: COLORS[i % COLORS.length] + "60", color: COLORS[i % COLORS.length] } : {}}>
                  {col}
                </button>
              ))}
            </div>

            {/* Chart Tabs */}
            <Tabs defaultValue="area" className="w-full">
              <TabsList className="bg-black/40 border border-border/50 p-1 rounded-xl mb-5 flex flex-wrap gap-1">
                <TabsTrigger value="area" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-xs py-2 px-4 font-medium gap-1.5">
                  <LineChartIcon size={12} />Area
                </TabsTrigger>
                <TabsTrigger value="bar" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-xs py-2 px-4 font-medium gap-1.5">
                  <BarChart3 size={12} />Bar
                </TabsTrigger>
                <TabsTrigger value="line" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-xs py-2 px-4 font-medium gap-1.5">
                  <LineChartIcon size={12} />Line
                </TabsTrigger>
                <TabsTrigger value="pie" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-xs py-2 px-4 font-medium gap-1.5">
                  <PieChartIcon size={12} />Pie
                </TabsTrigger>
                <TabsTrigger value="table" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-xs py-2 px-4 font-medium gap-1.5">
                  <Table2 size={12} />Table
                </TabsTrigger>
              </TabsList>

              {/* Area Chart */}
              <TabsContent value="area" className="animate-in fade-in">
                <Card className="glass-panel border-white/10">
                  <CardHeader className="pb-2 border-b border-white/5">
                    <CardTitle className="text-[15px] font-display font-semibold flex items-center gap-2" style={{ letterSpacing: '-0.01em' }}>
                      <LineChartIcon size={15} className="text-primary" /> Area Trend — {data.fileName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData}>
                        <defs>
                          {visibleCols.map((col, i) => (
                            <linearGradient key={col} id={`areaGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey={data.labelCol} tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v.toLocaleString()} />
                        <Tooltip content={<CustomTooltipContent />} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        {visibleCols.map((col, i) => (
                          <Area key={col} type="monotone" dataKey={col} stroke={COLORS[i % COLORS.length]}
                            fill={`url(#areaGrad-${i})`} strokeWidth={2} dot={false} />
                        ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Bar Chart */}
              <TabsContent value="bar" className="animate-in fade-in">
                <Card className="glass-panel border-white/10">
                  <CardHeader className="pb-2 border-b border-white/5">
                    <CardTitle className="text-[15px] font-display font-semibold" style={{ letterSpacing: '-0.01em' }}>
                      Bar Chart — {data.fileName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData} barSize={Math.max(6, 40 / visibleCols.length)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey={data.labelCol} tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v.toLocaleString()} />
                        <Tooltip content={<CustomTooltipContent />} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        {visibleCols.map((col, i) => (
                          <Bar key={col} dataKey={col} fill={COLORS[i % COLORS.length]} radius={[3, 3, 0, 0]} />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Line Chart */}
              <TabsContent value="line" className="animate-in fade-in">
                <Card className="glass-panel border-white/10">
                  <CardHeader className="pb-2 border-b border-white/5">
                    <CardTitle className="text-[15px] font-display font-semibold" style={{ letterSpacing: '-0.01em' }}>
                      Line Chart — {data.fileName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey={data.labelCol} tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v.toLocaleString()} />
                        <Tooltip content={<CustomTooltipContent />} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        {visibleCols.map((col, i) => (
                          <Line key={col} type="monotone" dataKey={col} stroke={COLORS[i % COLORS.length]}
                            strokeWidth={2.5} dot={{ r: 4, fill: COLORS[i % COLORS.length] }} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pie */}
              <TabsContent value="pie" className="animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Card className="glass-panel border-white/10">
                    <CardHeader className="pb-2 border-b border-white/5">
                      <CardTitle className="text-[15px] font-display font-semibold" style={{ letterSpacing: '-0.01em' }}>
                        Column Totals (Pie)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ResponsiveContainer width="100%" height={260}>
                        <RPieChart>
                          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                            outerRadius={95} innerRadius={50} paddingAngle={4} stroke="none">
                            {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                          </Pie>
                          <Tooltip content={<CustomTooltipContent />} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                        </RPieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card className="glass-panel border-white/10">
                    <CardHeader className="pb-2 border-b border-white/5">
                      <CardTitle className="text-[15px] font-display font-semibold" style={{ letterSpacing: '-0.01em' }}>
                        Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-4">
                      {pieData.map((d, i) => {
                        const total = pieData.reduce((s, x) => s + x.value, 0);
                        const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : "0.0";
                        return (
                          <div key={i} className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                                <span className="text-[12px] text-white/80">{d.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-muted-foreground">{d.value.toLocaleString()}</span>
                                <span className="text-[12px] font-semibold" style={{ color: d.color }}>{pct}%</span>
                              </div>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.6, delay: i * 0.08 }}
                                className="h-full rounded-full" style={{ background: d.color }} />
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Table */}
              <TabsContent value="table" className="animate-in fade-in">
                <Card className="glass-panel border-white/10 overflow-hidden">
                  <CardHeader className="border-b border-white/10 py-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-[15px] font-display font-semibold flex items-center gap-2" style={{ letterSpacing: '-0.01em' }}>
                        <Eye size={15} className="text-primary" /> Raw Data Preview
                      </CardTitle>
                      <Badge className="bg-white/5 text-muted-foreground border-white/10 text-[10px]">{data.rowCount} rows</Badge>
                    </div>
                  </CardHeader>
                  <div className="overflow-auto max-h-[450px]">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0">
                        <tr className="border-b border-white/5 bg-black/60">
                          {data.headers.map(h => (
                            <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.08em] whitespace-nowrap">
                              {h}
                              {data.numericCols.includes(h) && <span className="ml-1 text-primary/50">#</span>}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.rows.map((row, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                            {data.headers.map(h => (
                              <td key={h} className={`px-4 py-2.5 whitespace-nowrap ${
                                data.numericCols.includes(h)
                                  ? "text-[12px] font-mono text-white/90 text-right"
                                  : "text-[12px] text-white/70"
                              }`}>
                                {typeof row[h] === "number" ? (row[h] as number).toLocaleString() : String(row[h])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Stats summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {visibleCols.slice(0, 4).map((col, i) => {
                const vals = data.rows.map(r => r[col] as number).filter(v => !isNaN(v));
                const total = vals.reduce((s, v) => s + v, 0);
                const avg = Math.round(total / vals.length);
                const max = Math.max(...vals);
                return (
                  <Card key={col} className="glass-panel border-white/10">
                    <CardContent className="p-4">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] mb-1.5 truncate">{col}</p>
                      <p className="text-[22px] font-display font-semibold" style={{ letterSpacing: '-0.02em', color: COLORS[i % COLORS.length] }}>
                        {total.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">Avg: {avg.toLocaleString()} · Max: {max.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

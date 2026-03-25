import { useGetBottlenecks } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { AlertTriangle, ShieldAlert, Cpu, Scale, Wifi, TrendingUp, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/PageHeader";

const categoryConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  legal: { icon: Scale, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
  technical: { icon: Cpu, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
  regulatory: { icon: ShieldAlert, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
  infrastructure: { icon: Wifi, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
  social: { icon: TrendingUp, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/30" },
};

const severityConfig: Record<string, { label: string; color: string; pulse: boolean }> = {
  critical: { label: "CRITICAL", color: "border-red-500 text-red-400 bg-red-500/10", pulse: true },
  high: { label: "HIGH", color: "border-orange-500 text-orange-400 bg-orange-500/10", pulse: false },
  medium: { label: "MEDIUM", color: "border-yellow-500 text-yellow-400 bg-yellow-500/10", pulse: false },
};

const borderColors = ["border-l-red-500", "border-l-red-500", "border-l-red-500", "border-l-orange-500", "border-l-orange-500"];

export default function Bottlenecks() {
  const { data, isLoading } = useGetBottlenecks();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Analyzing critical bottlenecks...</p>
        </div>
      </div>
    );
  }

  const bottlenecks = data?.bottlenecks || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Critical Launch Bottlenecks"
        description="Top 5 technical and legal blockers to deploying Bharat-Automator OS at national scale — with precise bypass strategies."
        icon={AlertTriangle}
      />

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="glass-panel border-red-500/20 bg-red-500/5">
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-red-400">3</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Critical Severity</div>
          </CardContent>
        </Card>
        <Card className="glass-panel border-orange-500/20 bg-orange-500/5">
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-orange-400">2</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">High Severity</div>
          </CardContent>
        </Card>
        <Card className="glass-panel border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-emerald-400">5</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Bypass Strategies</div>
          </CardContent>
        </Card>
      </div>

      {/* Bottleneck cards */}
      <div className="space-y-6">
        {bottlenecks.map((b, i) => {
          const cat = categoryConfig[b.category] || categoryConfig.technical;
          const sev = severityConfig[b.severity] || severityConfig.medium;
          const CatIcon = cat.icon;

          return (
            <motion.div
              key={b.rank}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
            >
              <Card className={`glass-panel border-border/50 border-l-4 ${borderColors[i]} overflow-hidden`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    {/* Rank number */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center">
                      <span className="text-2xl font-bold font-display text-white/60">#{b.rank}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {/* Severity */}
                        <Badge variant="outline" className={`text-[10px] uppercase tracking-widest font-bold ${sev.color}`}>
                          {sev.pulse && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse mr-1.5" />
                          )}
                          {sev.label}
                        </Badge>
                        {/* Category */}
                        <Badge variant="outline" className={`text-[10px] uppercase tracking-widest ${cat.bg} ${cat.color}`}>
                          <CatIcon size={10} className="mr-1" />
                          {b.category}
                        </Badge>
                        {/* Resolution time */}
                        <Badge variant="outline" className="text-[10px] border-white/10 text-white/40">
                          ⏱ {b.estimatedResolutionTime}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg text-white leading-tight">{b.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed">{b.description}</p>

                  {/* Bypass Strategy */}
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 border-l-2 border-l-emerald-500">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Bypass Strategy</span>
                    </div>
                    <p className="text-sm text-emerald-100/70 leading-relaxed">{b.bypassStrategy}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

import { useGetBottlenecks } from "@workspace/api-client-react";
import { AlertTriangle, ShieldAlert, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/PageHeader";

export default function Bottlenecks() {
  const { data, isLoading } = useGetBottlenecks();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <PageHeader 
        title="Critical Launch Bottlenecks — Bypass Strategies" 
        description="Systemic impediments to nationwide agentic rollout and automated resolution pathways."
        icon={AlertTriangle}
      />

      {isLoading ? (
        <div className="h-64 flex items-center justify-center border border-white/10 rounded-2xl bg-white/5">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="animate-spin text-primary" size={32} />
            <span className="font-mono uppercase tracking-widest text-sm text-primary/80">Analyzing systemic limits...</span>
          </div>
        </div>
      ) : data ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <span className="text-sm font-mono text-muted-foreground">Last Telemetry: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : "Live"}</span>
            <Badge className="bg-destructive/20 text-destructive border-destructive/30 uppercase tracking-widest text-xs">Priority Overrides Active</Badge>
          </div>
          
          <div className="grid gap-6">
            {data.bottlenecks.map((bn) => (
              <Card key={bn.rank} className={`glass-panel overflow-hidden border-l-4 ${bn.severity === 'critical' ? 'border-l-destructive shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'border-l-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.1)]'}`}>
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-6 md:w-1/2 border-b md:border-b-0 md:border-r border-white/10">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-2xl shrink-0 ${bn.severity === 'critical' ? 'bg-destructive/20 text-destructive border border-destructive/30' : 'bg-orange-500/20 text-orange-500 border border-orange-500/30'}`}>
                          {bn.rank}
                        </div>
                        <div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {bn.severity === 'critical' ? (
                              <Badge variant="destructive" className="uppercase text-[10px] tracking-widest bg-destructive text-white animate-pulse">CRITICAL</Badge>
                            ) : (
                              <Badge variant="outline" className="uppercase text-[10px] tracking-widest border-orange-500/50 text-orange-400 bg-orange-500/10">HIGH</Badge>
                            )}
                            <Badge variant="outline" className="uppercase text-[10px] tracking-widest border-white/20 text-white/70 bg-white/5">{bn.category}</Badge>
                          </div>
                          <h3 className="text-xl font-bold text-white leading-tight">{bn.title}</h3>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{bn.description}</p>
                    </div>
                    
                    <div className="p-6 md:w-1/2 bg-primary/5 flex flex-col justify-center">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                        <ShieldAlert size={14} /> Bypass Strategy Executed
                      </h4>
                      <div className="border-l-2 border-primary/50 pl-4 py-1 mb-4">
                        <p className="text-sm text-white/90 leading-relaxed font-medium">{bn.bypassStrategy}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-auto">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Estimated Resolution:</span>
                        <Badge variant="secondary" className="bg-black/40 border border-white/10 text-xs font-mono">{bn.estimatedResolutionTime}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

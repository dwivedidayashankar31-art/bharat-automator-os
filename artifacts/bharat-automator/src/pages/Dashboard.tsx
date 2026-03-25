import { useGetOrchestratorStatus, useDispatchAgent, useListTasks } from "@workspace/api-client-react";
import { BrainCircuit, Activity, Cpu, Play, Layers, Clock, Zap, Leaf, Briefcase, HeartPulse, Building2, Terminal, Fingerprint, ShieldCheck, Banknote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { Link } from "wouter";

// Animated counter component
const AnimatedCounter = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;
    
    const duration = 1000;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      const currentVal = Math.floor(start + (end - start) * progress);
      setDisplayValue(currentVal);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);

  return <>{displayValue.toLocaleString()}</>;
};

export default function Dashboard() {
  const { toast } = useToast();
  
  const { data: statusData, isLoading: statusLoading } = useGetOrchestratorStatus({
    query: { refetchInterval: 5000 }
  });
  
  const { data: taskData, isLoading: tasksLoading } = useListTasks({
    query: { refetchInterval: 3000 }
  });

  const dispatchMutation = useDispatchAgent();

  const handleSimulate = (sector: string) => {
    dispatchMutation.mutate({
      data: {
        sector: sector as any,
        taskType: "demo_simulation",
        citizenId: "SIM-USER-99"
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Agent Dispatched",
          description: `The ${sector} agent has been simulated successfully.`,
        });
      },
      onError: (err: any) => {
        toast({
          title: "Dispatch Failed",
          description: err.message || "Could not simulate agent",
          variant: "destructive"
        });
      }
    });
  };

  const status = statusData || { status: 'offline', activeAgents: [], totalTasksExecuted: 0, uptime: '0h', memoryLayerStatus: 'Unknown', bhashiniStatus: 'Unknown' };
  const tasks = taskData?.tasks || [];

  const icons: Record<string, any> = {
    agriculture: Leaf,
    finance: Briefcase,
    healthcare: HeartPulse,
    governance: Building2
  };

  const colors: Record<string, string> = {
    agriculture: "text-emerald-500",
    finance: "text-blue-500",
    healthcare: "text-red-500",
    governance: "text-purple-500"
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Command Center" 
        description="The Mind of India: Unified Agentic Mesh monitoring and real-time execution telemetry."
        icon={BrainCircuit}
      />

      {/* Quick Action Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/app/agriculture">
          <Button className="w-full h-14 bg-white/5 hover:bg-white/10 text-white border border-white/10 justify-start px-4">
            <Leaf className="mr-3 text-emerald-500" size={20} /> Predict Yield
          </Button>
        </Link>
        <Link href="/app/finance">
          <Button className="w-full h-14 bg-white/5 hover:bg-white/10 text-white border border-white/10 justify-start px-4">
            <Briefcase className="mr-3 text-blue-500" size={20} /> File GST
          </Button>
        </Link>
        <Link href="/app/healthcare">
          <Button className="w-full h-14 bg-white/5 hover:bg-white/10 text-white border border-white/10 justify-start px-4">
            <HeartPulse className="mr-3 text-red-500" size={20} /> Check Emergency
          </Button>
        </Link>
        <Link href="/app/governance">
          <Button className="w-full h-14 bg-white/5 hover:bg-white/10 text-white border border-white/10 justify-start px-4">
            <Building2 className="mr-3 text-purple-500" size={20} /> Find Schemes
          </Button>
        </Link>
      </div>

      {/* Global Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-panel border-primary/30 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                <Activity size={20} />
              </div>
              <Badge variant="outline" className="border-primary/30 text-primary text-[10px] uppercase">Status</Badge>
            </div>
            <div className="text-3xl font-semibold font-display text-white mb-1" style={{ letterSpacing: '-0.02em' }}>
              {statusLoading ? "..." : status.status.charAt(0).toUpperCase() + status.status.slice(1)}
            </div>
            <div className="text-xs text-primary/80">Memory Layer: {status.memoryLayerStatus}</div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Layers size={20} />
              </div>
              <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-[10px] uppercase">Tasks</Badge>
            </div>
            <div className="text-3xl font-semibold font-display text-white mb-1" style={{ letterSpacing: '-0.02em' }}>
              <AnimatedCounter value={status.totalTasksExecuted} />
            </div>
            <div className="text-xs text-blue-300/80">Across all autonomous nodes</div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Cpu size={20} />
              </div>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px] uppercase">Agents</Badge>
            </div>
            <div className="text-3xl font-semibold font-display text-white mb-1" style={{ letterSpacing: '-0.02em' }}>
              <AnimatedCounter value={status.activeAgents?.length || 4} />
            </div>
            <div className="text-xs text-emerald-300/80">Active orchestrator threads</div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-purple-500/30 bg-purple-500/5">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Clock size={20} />
              </div>
              <Badge variant="outline" className="border-purple-500/30 text-purple-400 text-[10px] uppercase">Uptime</Badge>
            </div>
            <div className="text-3xl font-semibold font-display text-white mb-1" style={{ letterSpacing: '-0.02em' }}>
              {statusLoading ? "..." : status.uptime}
            </div>
            <div className="text-xs text-purple-300/80">Continuous network operation</div>
          </CardContent>
        </Card>
      </div>

      {/* India Stack Status */}
      <div className="flex flex-wrap items-center gap-3 bg-black/40 border border-white/10 p-4 rounded-2xl">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60 mr-3 font-sans">Stack Sync</span>
        {[
          { name: "Aadhaar", icon: Fingerprint, color: "text-orange-500", bg: "bg-orange-500/20" },
          { name: "UPI", icon: Banknote, color: "text-blue-500", bg: "bg-blue-500/20" },
          { name: "DigiLocker", icon: ShieldCheck, color: "text-purple-500", bg: "bg-purple-500/20" },
          { name: "Bhashini", icon: Terminal, color: "text-emerald-500", bg: "bg-emerald-500/20" },
        ].map(s => (
          <Badge key={s.name} variant="outline" className={`py-1.5 px-3 border-white/10 ${s.bg} flex items-center gap-2`}>
            <s.icon size={12} className={s.color} />
            <span className="text-white">{s.name}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
          </Badge>
        ))}
      </div>

      {/* Sector Agents Grid */}
      <div>
        <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2.5" style={{ letterSpacing: '-0.02em' }}>
          <Cpu className="text-primary" size={18} /> Agent Control Plane
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {["agriculture", "finance", "healthcare", "governance"].map((sectorName) => {
            const agent = status.activeAgents?.find(a => a.sector === sectorName) || {
              id: `Agt-${sectorName.substring(0,3).toUpperCase()}`,
              name: `${sectorName.charAt(0).toUpperCase() + sectorName.slice(1)} Node`,
              status: 'idle',
              tasksCompleted: 0
            };
            
            const isRunning = agent.status === 'running';
            const Icon = icons[sectorName] || Cpu;
            const colorClass = colors[sectorName] || "text-primary";

            return (
              <motion.div whileHover={{ y: -5 }} key={sectorName}>
                <Card className={`glass-panel overflow-hidden transition-all duration-300 ${isRunning ? 'border-primary/50 shadow-[0_0_30px_rgba(255,107,26,0.15)]' : 'border-white/10'}`}>
                  <div className={`h-1 w-full ${isRunning ? 'bg-primary' : 'bg-muted'}`} />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className={`uppercase text-[10px] tracking-widest font-bold ${isRunning ? 'border-primary text-primary' : 'border-white/20 text-muted-foreground'}`}>
                        {isRunning ? (
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"/> RUNNING</span>
                        ) : 'IDLE'}
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground">{agent.id}</span>
                    </div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Icon size={18} className={colorClass} /> {agent.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-end mb-6">
                      <div className="text-sm text-muted-foreground">Tasks Resolved</div>
                      <div className="text-2xl font-bold font-mono text-white">{agent.tasksCompleted.toLocaleString()}</div>
                    </div>
                    <Button 
                      className={`w-full font-bold tracking-wide transition-all duration-300 ${isRunning ? 'bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(255,107,26,0.4)]' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}
                      onClick={() => handleSimulate(sectorName)}
                      disabled={dispatchMutation.isPending}
                    >
                      <Zap size={16} className={`mr-2 ${isRunning ? 'animate-pulse' : ''}`} />
                      {isRunning ? 'Load Testing...' : 'Simulate Load'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Live Task Feed */}
      <Card className="glass-panel border-white/10 overflow-hidden flex flex-col">
        <CardHeader className="bg-black/30 border-b border-white/10 py-4">
          <CardTitle className="text-[15px] font-display font-semibold flex items-center gap-2.5" style={{ letterSpacing: '-0.01em' }}>
            <Activity className="text-primary animate-pulse" size={17} /> Real-Time Execution Log
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-muted-foreground uppercase bg-white/5 font-semibold tracking-widest">
              <tr>
                <th className="px-6 py-4">Task ID</th>
                <th className="px-6 py-4">Sector</th>
                <th className="px-6 py-4">Operation</th>
                <th className="px-6 py-4">Citizen / Target</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Output Snippet</th>
                <th className="px-6 py-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-xs">
              {tasksLoading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground font-sans">Loading stream...</td></tr>
              ) : tasks.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground font-sans">Awaiting execution...</td></tr>
              ) : (
                tasks.slice(0, 10).map((task) => {
                  const Icon = icons[task.sector] || Cpu;
                  const color = colors[task.sector] || "text-primary";
                  return (
                    <motion.tr 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={task.taskId} 
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 py-4 text-primary/80 group-hover:text-primary transition-colors">{task.taskId.substring(0, 8)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Icon size={14} className={color} />
                          <span className="uppercase font-sans font-bold tracking-wider">{task.sector}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/90">{task.taskType}</td>
                      <td className="px-6 py-4 text-muted-foreground">{task.citizenId}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={`text-[10px] tracking-widest uppercase border-0
                          ${task.status === 'completed' ? 'text-emerald-400 bg-emerald-500/10' : ''}
                          ${task.status === 'running' ? 'text-primary bg-primary/10' : ''}
                          ${task.status === 'failed' ? 'text-destructive bg-destructive/10' : ''}
                          ${task.status === 'queued' ? 'text-white/60 bg-white/5' : ''}
                        `}>
                          {task.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-white/50 truncate max-w-[200px]" title={task.result || ""}>
                        {task.result || "—"}
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground">
                        {format(new Date(task.startedAt), "HH:mm:ss.SSS")}
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

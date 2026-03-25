import { useGetOrchestratorStatus, useDispatchAgent, useListTasks } from "@workspace/api-client-react";
import { BrainCircuit, Activity, Cpu, CheckCircle2, Play, AlertTriangle, Layers, Clock, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/PageHeader";

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Command Center" 
        description="The Mind of India: Unified Agentic Mesh monitoring and real-time execution telemetry."
        icon={BrainCircuit}
      />

      {/* Global Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-panel bg-card/40 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Mesh Status</CardTitle>
            <Activity className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-display tracking-tight text-white mb-1">
              {statusLoading ? "..." : status.status.toUpperCase()}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Memory: {status.memoryLayerStatus} | Bhashini: {status.bhashiniStatus}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel bg-card/40 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Tasks Executed</CardTitle>
            <Layers className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-display tracking-tight text-white mb-1">
              {statusLoading ? "..." : status.totalTasksExecuted.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across all autonomous nodes</p>
          </CardContent>
        </Card>

        <Card className="glass-panel bg-card/40 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">System Uptime</CardTitle>
            <Clock className="h-5 w-5 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-display tracking-tight text-white mb-1">
              {statusLoading ? "..." : status.uptime}
            </div>
            <p className="text-xs text-muted-foreground">Continuous operation</p>
          </CardContent>
        </Card>
      </div>

      {/* Sector Agents Grid */}
      <div>
        <h2 className="text-xl font-display font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
          <Cpu className="text-primary" size={20} /> Active Sector Agents
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

            return (
              <motion.div whileHover={{ y: -5 }} key={sectorName}>
                <Card className={`glass-panel overflow-hidden transition-all duration-300 ${isRunning ? 'border-primary/50 shadow-[0_0_30px_rgba(255,153,51,0.1)]' : 'border-border/50'}`}>
                  <div className={`h-1 w-full ${isRunning ? 'bg-primary' : 'bg-muted'}`} />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className={`uppercase text-[10px] tracking-widest font-bold ${isRunning ? 'border-primary text-primary' : 'border-muted-foreground text-muted-foreground'}`}>
                        {isRunning ? (
                          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"/> RUNNING</span>
                        ) : 'IDLE'}
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground">{agent.id}</span>
                    </div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-end mb-6">
                      <div className="text-sm text-muted-foreground">Tasks Completed</div>
                      <div className="text-2xl font-bold font-display">{agent.tasksCompleted.toLocaleString()}</div>
                    </div>
                    <Button 
                      className="w-full bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/10 hover:border-primary/50 text-white transition-all duration-300"
                      variant="outline"
                      onClick={() => handleSimulate(sectorName)}
                      disabled={dispatchMutation.isPending}
                    >
                      <Zap size={16} className="mr-2" />
                      Simulate Load
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Live Task Feed */}
      <Card className="glass-panel border-border/50 overflow-hidden flex flex-col">
        <CardHeader className="bg-white/5 border-b border-border/50">
          <CardTitle className="text-lg font-display uppercase tracking-widest flex items-center gap-2">
            <Activity className="text-primary animate-pulse" size={20} /> Real-Time Execution Log
          </CardTitle>
          <CardDescription>Live streaming from the master orchestrator memory layer</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-black/20 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Task ID</th>
                <th className="px-6 py-4">Sector</th>
                <th className="px-6 py-4">Task Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Citizen ID</th>
                <th className="px-6 py-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-mono">
              {tasksLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground font-sans">Loading telemtry...</td></tr>
              ) : tasks.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground font-sans">No recent tasks executed.</td></tr>
              ) : (
                tasks.slice(0, 10).map((task) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={task.taskId} 
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-primary/80">{task.taskId.substring(0, 8)}...</td>
                    <td className="px-6 py-4 uppercase font-sans text-xs font-bold tracking-wider">{task.sector}</td>
                    <td className="px-6 py-4 text-white/80">{task.taskType}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`
                        ${task.status === 'completed' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : ''}
                        ${task.status === 'running' ? 'border-primary/50 text-primary bg-primary/10' : ''}
                        ${task.status === 'failed' ? 'border-destructive/50 text-destructive bg-destructive/10' : ''}
                        ${task.status === 'queued' ? 'border-white/20 text-white/60 bg-white/5' : ''}
                      `}>
                        {task.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{task.citizenId}</td>
                    <td className="px-6 py-4 text-right text-muted-foreground">
                      {format(new Date(task.startedAt), "HH:mm:ss.SSS")}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}

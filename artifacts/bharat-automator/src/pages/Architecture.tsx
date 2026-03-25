import { useGetSystemDiagram, useGetPythonBoilerplate, useGetBottlenecks } from "@workspace/api-client-react";
import { Network, Code2, AlertTriangle, ShieldAlert, GitBranch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { Mermaid } from "@/components/Mermaid";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { MeshFlowDiagram } from "@/components/MeshFlowDiagram";

export default function Architecture() {
  const { data: diagramData, isLoading: diagramLoading } = useGetSystemDiagram();
  const { data: pyData, isLoading: pyLoading } = useGetPythonBoilerplate();
  const { data: bottleData, isLoading: bottleLoading } = useGetBottlenecks();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Architecture Deep-Dive" 
        description="Technical specifications, system diagrams, and critical path analysis for deploying the Unified Agentic Mesh."
        icon={Network}
      />

      <Tabs defaultValue="flow" className="w-full">
        <TabsList className="bg-black/40 border border-border/50 p-1 rounded-xl mb-8 flex flex-wrap gap-1">
          <TabsTrigger value="flow" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-medium text-xs py-2.5 px-4 gap-1.5">
            <GitBranch size={12} />Mesh Graph
          </TabsTrigger>
          <TabsTrigger value="diagram" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-medium text-xs py-2.5 px-4">
            Blueprint
          </TabsTrigger>
          <TabsTrigger value="code" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-medium text-xs py-2.5 px-4">
            Orchestrator
          </TabsTrigger>
          <TabsTrigger value="bottlenecks" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-medium text-xs py-2.5 px-4">
            Bottlenecks
          </TabsTrigger>
        </TabsList>

        {/* React Flow Mesh Graph */}
        <TabsContent value="flow" className="animate-in fade-in">
          <Card className="glass-panel border-primary/20 overflow-hidden">
            <CardHeader className="border-b border-white/5 pb-4 bg-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[16px] font-display font-semibold flex items-center gap-2" style={{ letterSpacing: '-0.01em' }}>
                    <GitBranch size={16} className="text-primary" /> Unified Agentic Mesh — Interactive Graph
                  </CardTitle>
                  <CardDescription className="mt-1 text-white/60 text-[13px]">
                    Live topology of all agents, data flows, and India Stack connections. Pan and zoom to explore.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 text-[10px]">React Flow v12</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <MeshFlowDiagram />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagram" className="animate-in fade-in">
          <Card className="glass-panel border-primary/20">
            <CardHeader className="border-b border-white/5 pb-6 bg-white/5">
              <CardTitle className="text-[16px] font-display font-semibold text-primary" style={{ letterSpacing: '-0.01em' }}>System Blueprint v{diagramData?.version || "1.0"}</CardTitle>
              <CardDescription className="mt-2 text-white/70">{diagramData?.description || "Loading blueprint..."}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 bg-black/40 min-h-[500px]">
              {diagramLoading ? (
                <div className="h-[500px] flex items-center justify-center text-primary/50 animate-pulse font-mono text-sm">Rendering Blueprint...</div>
              ) : diagramData?.mermaidCode ? (
                <div className="bg-[#0f172a] p-8 rounded-xl border border-slate-800">
                  <Mermaid chart={diagramData.mermaidCode} />
                </div>
              ) : (
                <div className="h-[500px] flex items-center justify-center text-destructive">Failed to load diagram data</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="animate-in fade-in">
          <Card className="glass-panel overflow-hidden border-primary/20 bg-black/40">
            <CardHeader className="border-b border-white/5 pb-6 bg-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[16px] font-display font-semibold text-white flex items-center gap-2" style={{ letterSpacing: '-0.01em' }}>
                    <Code2 size={18} className="text-primary"/> {pyData?.title || "Python Orchestrator"}
                  </CardTitle>
                  <CardDescription className="mt-2 text-white/70">{pyData?.description}</CardDescription>
                </div>
                <Badge variant="outline" className="border-primary/50 text-primary font-mono text-xs bg-primary/10">LangGraph Stateful Mesh</Badge>
              </div>
            </CardHeader>
            <div className="p-0 text-sm">
              {pyLoading ? (
                <div className="p-10 text-center text-primary/50 animate-pulse font-mono text-sm">Loading source code...</div>
              ) : (
                <SyntaxHighlighter 
                  language="python" 
                  style={vscDarkPlus}
                  customStyle={{ margin: 0, padding: '2rem', background: 'transparent' }}
                  showLineNumbers={true}
                  lineNumberStyle={{ color: "rgba(255,255,255,0.2)", minWidth: "2.5em" }}
                >
                  {pyData?.code || "# Code not available"}
                </SyntaxHighlighter>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="bottlenecks" className="animate-in fade-in">
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-display font-semibold text-white" style={{ letterSpacing: '-0.02em' }}>Top Critical Bottlenecks</h3>
              <span className="text-xs text-muted-foreground font-mono">Last Updated: {bottleData?.lastUpdated && new Date(bottleData.lastUpdated).toLocaleDateString()}</span>
            </div>
            
            {bottleLoading ? (
              <div className="text-center p-10 text-primary/50 animate-pulse font-mono text-sm">Analyzing bottlenecks...</div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {bottleData?.bottlenecks.map((bn) => (
                  <Card key={bn.rank} className="glass-panel border-l-4 border-l-destructive border-y-white/5 border-r-white/5 overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.05)]">
                    <CardHeader className="pb-3 bg-gradient-to-r from-destructive/10 to-transparent border-b border-white/5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-destructive/20 text-destructive flex items-center justify-center font-bold text-xl font-display border border-destructive/30">
                            {bn.rank}
                          </div>
                          <CardTitle className="text-lg text-white">{bn.title}</CardTitle>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="uppercase text-[10px] tracking-widest border-white/20 text-white/70 bg-white/5">{bn.category}</Badge>
                          <Badge variant="destructive" className="uppercase text-[10px] tracking-widest bg-destructive animate-pulse">{bn.severity}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-3">The Challenge</h4>
                        <p className="text-sm text-white/80 leading-relaxed">{bn.description}</p>
                      </div>
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
                        <h4 className="text-[11px] font-semibold text-primary uppercase tracking-[0.08em] mb-3 flex items-center gap-2">
                          <ShieldAlert size={13} /> Bypass Strategy
                        </h4>
                        <p className="text-sm text-white/90 leading-relaxed">{bn.bypassStrategy}</p>
                        <div className="mt-5 text-xs font-mono text-muted-foreground flex items-center gap-2">
                          <span className="uppercase tracking-widest text-[10px]">Est. Resolution:</span>
                          <Badge variant="secondary" className="bg-white/5 border-white/10">{bn.estimatedResolutionTime}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

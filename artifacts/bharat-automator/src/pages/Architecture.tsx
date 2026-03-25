import { useGetSystemDiagram, useGetPythonBoilerplate, useGetBottlenecks } from "@workspace/api-client-react";
import { Network, Code2, AlertTriangle, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { Mermaid } from "@/components/Mermaid";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

      <Tabs defaultValue="diagram" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-border/50 p-1 rounded-xl mb-8 max-w-2xl">
          <TabsTrigger value="diagram" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-semibold tracking-wide uppercase text-xs py-3">Mesh Diagram</TabsTrigger>
          <TabsTrigger value="code" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-semibold tracking-wide uppercase text-xs py-3">Master Orchestrator</TabsTrigger>
          <TabsTrigger value="bottlenecks" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-semibold tracking-wide uppercase text-xs py-3">Bottlenecks Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="diagram" className="animate-in fade-in">
          <Card className="glass-panel border-primary/20">
            <CardHeader className="border-b border-white/5 pb-6 bg-white/5">
              <CardTitle className="text-xl font-display uppercase tracking-widest text-primary">System Blueprint v{diagramData?.version || "1.0"}</CardTitle>
              <CardDescription className="mt-2 text-white/70">{diagramData?.description || "Loading blueprint..."}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 bg-black/40 min-h-[500px]">
              {diagramLoading ? (
                <div className="h-[500px] flex items-center justify-center text-primary/50 animate-pulse font-mono uppercase tracking-widest">Rendering Blueprint...</div>
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
                  <CardTitle className="text-xl font-display tracking-widest text-white flex items-center gap-2">
                    <Code2 size={20} className="text-primary"/> {pyData?.title || "Python Orchestrator"}
                  </CardTitle>
                  <CardDescription className="mt-2 text-white/70">{pyData?.description}</CardDescription>
                </div>
                <Badge variant="outline" className="border-primary/50 text-primary font-mono text-xs bg-primary/10">LangGraph Stateful Mesh</Badge>
              </div>
            </CardHeader>
            <div className="p-0 text-sm">
              {pyLoading ? (
                <div className="p-10 text-center text-primary/50 animate-pulse font-mono uppercase tracking-widest">Loading source code...</div>
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
              <h3 className="text-xl font-display font-bold uppercase tracking-widest text-white">Top Critical Bottlenecks</h3>
              <span className="text-xs text-muted-foreground font-mono">Last Updated: {bottleData?.lastUpdated && new Date(bottleData.lastUpdated).toLocaleDateString()}</span>
            </div>
            
            {bottleLoading ? (
              <div className="text-center p-10 text-primary/50 animate-pulse font-mono uppercase tracking-widest">Analyzing bottlenecks...</div>
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
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">The Challenge</h4>
                        <p className="text-sm text-white/80 leading-relaxed">{bn.description}</p>
                      </div>
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
                        <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                          <ShieldAlert size={14} /> Bypass Strategy
                        </h4>
                        <p className="text-sm text-white/90 leading-relaxed">{bn.bypassStrategy}</p>
                        <div className="mt-5 text-xs font-mono text-muted-foreground flex items-center gap-2">
                          <span className="uppercase tracking-widest">Est. Resolution:</span>
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

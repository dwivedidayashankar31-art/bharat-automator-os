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
        <TabsList className="grid w-full grid-cols-3 bg-card/60 backdrop-blur-md border border-border/50 p-1 rounded-xl mb-8">
          <TabsTrigger value="diagram" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold tracking-wide uppercase text-xs py-3">Mesh Diagram</TabsTrigger>
          <TabsTrigger value="code" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold tracking-wide uppercase text-xs py-3">Master Orchestrator</TabsTrigger>
          <TabsTrigger value="bottlenecks" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold tracking-wide uppercase text-xs py-3">Bottlenecks Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="diagram">
          <Card className="glass-panel">
            <CardHeader className="border-b border-border/50 pb-6 bg-white/5">
              <CardTitle className="text-xl font-display uppercase tracking-widest text-primary">System Blueprint v{diagramData?.version || "1.0"}</CardTitle>
              <CardDescription>{diagramData?.description || "Loading blueprint..."}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 bg-black/20">
              {diagramLoading ? (
                <div className="h-[500px] flex items-center justify-center text-muted-foreground">Rendering Diagram...</div>
              ) : diagramData?.mermaidCode ? (
                <Mermaid chart={diagramData.mermaidCode} />
              ) : (
                <div className="h-[500px] flex items-center justify-center text-destructive">Failed to load diagram data</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code">
          <Card className="glass-panel overflow-hidden border-border/50">
            <CardHeader className="bg-black/40 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-display tracking-widest text-primary flex items-center gap-2">
                    <Code2 size={20} /> {pyData?.title || "Python Orchestrator"}
                  </CardTitle>
                  <CardDescription className="mt-2">{pyData?.description}</CardDescription>
                </div>
                <Badge variant="outline" className="border-primary/50 text-primary font-mono text-xs">LangGraph Stateful Mesh</Badge>
              </div>
            </CardHeader>
            <div className="p-0 text-sm">
              {pyLoading ? (
                <div className="p-10 text-center text-muted-foreground">Loading source code...</div>
              ) : (
                <SyntaxHighlighter 
                  language="python" 
                  style={vscDarkPlus}
                  customStyle={{ margin: 0, padding: '2rem', background: 'transparent' }}
                  showLineNumbers={true}
                >
                  {pyData?.code || "# Code not available"}
                </SyntaxHighlighter>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="bottlenecks">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-display font-bold uppercase tracking-widest text-foreground">Top Critical Bottlenecks</h3>
              <span className="text-xs text-muted-foreground font-mono">Last Updated: {bottleData?.lastUpdated && new Date(bottleData.lastUpdated).toLocaleDateString()}</span>
            </div>
            
            {bottleLoading ? (
              <div className="text-center p-10 text-muted-foreground">Analyzing bottlenecks...</div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {bottleData?.bottlenecks.map((bn) => (
                  <Card key={bn.rank} className="glass-panel border-l-4 border-l-destructive overflow-hidden">
                    <CardHeader className="pb-3 bg-gradient-to-r from-destructive/10 to-transparent">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-destructive/20 text-destructive flex items-center justify-center font-bold text-lg font-display">
                            {bn.rank}
                          </div>
                          <CardTitle className="text-lg">{bn.title}</CardTitle>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="uppercase text-[10px] tracking-widest">{bn.category}</Badge>
                          <Badge variant="destructive" className="uppercase text-[10px] tracking-widest">{bn.severity}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">The Challenge</h4>
                        <p className="text-sm text-white/80 leading-relaxed">{bn.description}</p>
                      </div>
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
                          <ShieldAlert size={14} /> Bypass Strategy
                        </h4>
                        <p className="text-sm text-white/90">{bn.bypassStrategy}</p>
                        <div className="mt-4 text-xs font-mono text-muted-foreground">Est. Resolution: {bn.estimatedResolutionTime}</div>
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

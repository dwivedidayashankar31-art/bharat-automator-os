import { useGetPythonBoilerplate } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Code2, Download, Copy, CheckCircle2, Package, StickyNote, Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Boilerplate() {
  const { data, isLoading } = useGetPythonBoilerplate();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    if (data?.code) {
      navigator.clipboard.writeText(data.code);
      setCopied(true);
      toast({ title: "Copied!", description: "Python code copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (data?.code) {
      const blob = new Blob([data.code], { type: "text/x-python" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bharat_orchestrator.py";
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Downloaded!", description: "bharat_orchestrator.py saved." });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <PageHeader 
        title="Python Master Orchestrator" 
        description="Deploy your own LangGraph/CrewAI orchestrator node connected to the Bharat OS API."
        icon={Code2}
      />

      {isLoading ? (
        <div className="h-64 flex items-center justify-center border border-white/10 rounded-2xl bg-white/5">
          <div className="animate-pulse flex items-center gap-3 text-muted-foreground">
            <Terminal size={20} /> Loading boilerplate code...
          </div>
        </div>
      ) : data ? (
        <div className="space-y-6">
          <Card className="glass-panel border-primary/20 bg-black/40">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-display text-white">{data.title}</CardTitle>
                  <CardDescription className="mt-1">{data.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10 text-white" onClick={handleCopy}>
                    {copied ? <CheckCircle2 size={14} className="mr-2 text-emerald-400" /> : <Copy size={14} className="mr-2"/>}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold" onClick={handleDownload}>
                    <Download size={14} className="mr-2"/> Download .py
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-[#0d1117] text-gray-300 p-0 overflow-x-auto font-mono text-sm leading-relaxed border-b border-white/5">
                <SyntaxHighlighter
                  language="python"
                  style={atomDark}
                  customStyle={{
                    margin: 0,
                    background: "transparent",
                    fontSize: "0.8rem",
                    lineHeight: "1.6",
                    padding: "1.5rem",
                  }}
                  showLineNumbers
                  lineNumberStyle={{ color: "rgba(255,255,255,0.2)", minWidth: "2.5em" }}
                >
                  {data?.code || "# Loading..."}
                </SyntaxHighlighter>
              </div>
              <div className="p-6">
                <h4 className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Required Dependencies</h4>
                <div className="flex flex-wrap gap-2">
                  {data.dependencies.map((dep, i) => (
                    <Badge key={i} variant="secondary" className="bg-white/5 border border-white/10 font-mono text-xs">
                      pip install {dep}
                    </Badge>
                  ))}
                </div>
                
                {data.notes && data.notes.length > 0 && (
                  <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3 text-sm text-blue-200">
                    <Terminal size={18} className="text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-blue-400 block mb-1">Execution Instructions</strong>
                      <ol className="list-decimal pl-4 space-y-1 text-white/80">
                        {data.notes.map((note, i) => (
                          <li key={i}>{note}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

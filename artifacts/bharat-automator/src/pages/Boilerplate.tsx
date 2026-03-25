import { useGetPythonBoilerplate } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Code2, Download, Copy, CheckCircle2, Package, StickyNote, Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading orchestrator boilerplate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Python Master Orchestrator"
        description="Production-ready LangGraph StateGraph with CrewAI sector agents. Copy, download, and deploy."
        icon={Code2}
      />

      {/* Meta cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-panel border-primary/20 bg-primary/5">
          <CardContent className="pt-4 flex items-center gap-3">
            <Terminal className="text-primary shrink-0" size={20} />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Framework</p>
              <p className="text-white font-bold text-sm">LangGraph + CrewAI</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel border-blue-500/20 bg-blue-500/5">
          <CardContent className="pt-4 flex items-center gap-3">
            <Package className="text-blue-400 shrink-0" size={20} />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Memory Layer</p>
              <p className="text-white font-bold text-sm">Qdrant Vector DB</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="pt-4 flex items-center gap-3">
            <CheckCircle2 className="text-emerald-400 shrink-0" size={20} />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">India Stack</p>
              <p className="text-white font-bold text-sm">Aadhaar + UPI + DigiLocker</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dependencies */}
      <Card className="glass-panel border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base uppercase tracking-widest">
            <Package size={18} className="text-primary" /> Dependencies (pip install)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(data?.dependencies || []).map((dep) => (
              <Badge key={dep} variant="outline" className="font-mono text-xs border-primary/30 text-primary/80 bg-primary/5">
                {dep}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Code Block */}
      <Card className="glass-panel border-border/50 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-black/30 border-b border-border/50 py-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-xs text-muted-foreground font-mono">bharat_orchestrator.py</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={handleCopy} className="text-xs text-muted-foreground hover:text-white">
              {copied ? <CheckCircle2 size={14} className="mr-1 text-emerald-400" /> : <Copy size={14} className="mr-1" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDownload} className="text-xs text-muted-foreground hover:text-white">
              <Download size={14} className="mr-1" /> Download .py
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-auto max-h-[70vh]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
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
          </motion.div>
        </CardContent>
      </Card>

      {/* Notes */}
      {data?.notes && data.notes.length > 0 && (
        <Card className="glass-panel border-yellow-500/20 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base uppercase tracking-widest text-yellow-400">
              <StickyNote size={18} /> Setup Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.notes.map((note, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <span className="text-yellow-400 font-bold font-mono shrink-0 mt-0.5">{String(i + 1).padStart(2, "0")}.</span>
                  <span>{note}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

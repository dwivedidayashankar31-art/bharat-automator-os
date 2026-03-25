import { useState } from "react";
import { useFileGST, useBidFreelance } from "@workspace/api-client-react";
import { Briefcase, FileText, Globe, Coins, ShieldCheck, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/PageHeader";

export default function Finance() {
  const { toast } = useToast();
  const gstMutation = useFileGST();
  const bidMutation = useBidFreelance();
  
  const [gstResult, setGstResult] = useState<any>(null);
  const [bidResult, setBidResult] = useState<any>(null);

  const handleGSTSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    gstMutation.mutate({
      data: {
        gstin: formData.get("gstin") as string,
        period: formData.get("period") as string,
        invoiceData: [{ sample: "auto_fetched_from_tally" }],
        bankAccountLinked: true
      }
    }, {
      onSuccess: (res) => {
        setGstResult(res);
        toast({ title: "Filing Successful", description: `GST filed with reference ${res.referenceNumber}` });
      }
    });
  };

  const handleBidSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const skillsArray = (formData.get("skills") as string).split(",").map(s => s.trim());
    
    bidMutation.mutate({
      data: {
        studentId: formData.get("studentId") as string,
        skills: skillsArray,
        platforms: ["Contra", "Upwork"] as any[],
        minBudget: parseFloat(formData.get("minBudget") as string)
      }
    }, {
      onSuccess: (res) => {
        setBidResult(res);
        toast({ title: "Bids Placed", description: `Autonomously placed ${res.bidsPlaced} bids on jobs.` });
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Finance & IT Agent" 
        description="Zero-click tax compliance and autonomous global freelance bidding."
        icon={Briefcase}
      />

      <Tabs defaultValue="gst" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card/60 backdrop-blur-md border border-border/50 p-1 rounded-xl max-w-md mb-8">
          <TabsTrigger value="gst" className="rounded-lg data-[state=active]:bg-primary font-semibold py-3">Tax Compliance</TabsTrigger>
          <TabsTrigger value="freelance" className="rounded-lg data-[state=active]:bg-primary font-semibold py-3">Freelance Bidding</TabsTrigger>
        </TabsList>

        <TabsContent value="gst" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="glass-panel">
            <CardHeader className="border-b border-border/50 bg-black/20">
              <CardTitle className="flex items-center gap-2 text-primary font-display tracking-widest uppercase">
                <FileText size={20} /> Auto GST Filing
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleGSTSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label>GSTIN</Label>
                  <Input name="gstin" defaultValue="27AADCB2230M1Z2" className="bg-black/20 font-mono" required />
                </div>
                <div className="space-y-2">
                  <Label>Return Period</Label>
                  <Input name="period" defaultValue="2024-Q2" className="bg-black/20" required />
                </div>
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-200 flex gap-3">
                  <ShieldCheck className="text-blue-500 shrink-0" />
                  <p>Invoices will be auto-fetched from connected ERP systems and verified against GSTR-2B before filing.</p>
                </div>
                <Button type="submit" className="w-full bg-primary" disabled={gstMutation.isPending}>
                  {gstMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                  Initiate Autonomous Filing
                </Button>
              </form>
            </CardContent>
          </Card>

          {gstResult && (
            <Card className="glass-panel border-emerald-500/30">
              <CardHeader className="bg-emerald-500/5">
                <CardTitle className="text-emerald-400 uppercase tracking-widest font-display">Filing Successful</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Reference No.</span>
                  <span className="font-mono text-white">{gstResult.referenceNumber}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 border-0 uppercase tracking-widest">{gstResult.status}</Badge>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Timestamp</span>
                  <span className="text-white/80">{new Date(gstResult.filedAt).toLocaleString()}</span>
                </div>
                <div className="mt-4 pt-4">
                  <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Next Steps</h4>
                  <ul className="space-y-1 text-sm text-white/80 list-disc pl-4">
                    {gstResult.nextSteps.map((step: string, i: number) => <li key={i}>{step}</li>)}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="freelance" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="glass-panel">
            <CardHeader className="border-b border-border/50 bg-black/20">
              <CardTitle className="flex items-center gap-2 text-primary font-display tracking-widest uppercase">
                <Globe size={20} /> Global Job Bidder
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleBidSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label>Citizen / Student ID</Label>
                  <Input name="studentId" defaultValue="DEV-IND-404" className="bg-black/20 font-mono" required />
                </div>
                <div className="space-y-2">
                  <Label>Verified Skills (comma separated)</Label>
                  <Input name="skills" defaultValue="React, Python, Machine Learning" className="bg-black/20" required />
                </div>
                <div className="space-y-2">
                  <Label>Minimum Budget Rate ($/hr)</Label>
                  <Input name="minBudget" type="number" defaultValue="45" className="bg-black/20" required />
                </div>
                <Button type="submit" className="w-full bg-primary" disabled={bidMutation.isPending}>
                  {bidMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                  Scan & Auto-Bid
                </Button>
              </form>
            </CardContent>
          </Card>

          {bidResult && (
            <Card className="glass-panel border-primary/30">
              <CardHeader className="bg-primary/5">
                <CardTitle className="text-primary uppercase tracking-widest font-display text-2xl text-center">
                  {bidResult.bidsPlaced} Bids Placed
                </CardTitle>
                <CardDescription className="text-center">Across {bidResult.platforms.join(", ")}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Targeted Opportunities</h4>
                <div className="space-y-3">
                  {bidResult.jobsTargeted.map((job: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg border border-border/50 bg-black/20 flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-sm text-white/90">{job.title}</div>
                        <div className="text-xs text-muted-foreground">{job.platform}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-primary font-bold">${job.bidAmount}</div>
                        <Badge variant="outline" className="text-[10px] uppercase mt-1">{job.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-6 pt-4 border-t border-border/50 text-xs text-muted-foreground font-mono">
                  Est. Response: {bidResult.estimatedResponseTime}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

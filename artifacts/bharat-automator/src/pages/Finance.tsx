import { useState } from "react";
import { useFileGST, useBidFreelance, useFileIncomeTax } from "@workspace/api-client-react";
import { Briefcase, FileText, Globe, Coins, ShieldCheck, Loader2, CheckCircle2, Building2, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/PageHeader";

export default function Finance() {
  const { toast } = useToast();
  
  const gstMutation = useFileGST();
  const bidMutation = useBidFreelance();
  const itrMutation = useFileIncomeTax();
  
  const [gstResult, setGstResult] = useState<any>(null);
  const [bidResult, setBidResult] = useState<any>(null);
  const [itrResult, setItrResult] = useState<any>(null);
  const [itrBankLinked, setItrBankLinked] = useState(true);

  const handleGSTSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    gstMutation.mutate({
      data: {
        gstin: formData.get("gstin") as string,
        period: formData.get("period") as string,
        invoiceData: [{ sample: "auto_fetched_from_tally" }],
        bankAccountLinked: formData.get("bankLinked") === "on"
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
    const skillsStr = formData.get("skills") as string;
    const skillsArray = skillsStr ? skillsStr.split(",").map(s => s.trim()) : ["React", "Python"];
    
    // Get checked platforms
    const platforms = ["Contra", "Truelancer", "Upwork", "Fiverr"].filter(p => formData.get(`platform_${p}`) === "on") as any[];
    
    bidMutation.mutate({
      data: {
        studentId: "DEV-IND-404",
        skills: skillsArray,
        platforms: platforms.length > 0 ? platforms : ["Upwork"],
        minBudget: parseFloat(formData.get("minBudget") as string)
      }
    }, {
      onSuccess: (res) => {
        setBidResult(res);
        toast({ title: "Bids Placed", description: `Autonomously placed ${res.bidsPlaced} bids on jobs.` });
      }
    });
  };

  const handleITRSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    itrMutation.mutate({
      data: {
        panNumber: formData.get("panNumber") as string,
        assessmentYear: formData.get("ay") as string,
        incomeDetails: { estimated: 850000 },
        form16Available: formData.get("form16") === "on"
      }
    }, {
      onSuccess: (res) => {
        setItrResult(res);
        toast({ title: "ITR Filed", description: `Income Tax Return filed successfully.` });
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
        <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-border/50 p-1 rounded-xl max-w-md mb-8">
          <TabsTrigger value="gst" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-semibold py-3">Tax Compliance</TabsTrigger>
          <TabsTrigger value="freelance" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-semibold py-3">Freelance Bidding</TabsTrigger>
        </TabsList>

        <TabsContent value="gst" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* GST Filing Card */}
            <Card className="glass-panel border-border/50">
              <CardHeader className="border-b border-border/50 bg-white/5">
                <CardTitle className="flex items-center gap-2 text-primary font-display tracking-widest uppercase">
                  <Building2 size={20} /> Corporate GSTR-3B Auto-Filer
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleGSTSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>GSTIN</Label>
                      <Input name="gstin" defaultValue="27AAACR5055K1ZF" className="bg-black/20 font-mono tracking-wider" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Return Period</Label>
                      <Select name="period" defaultValue="Oct-2024">
                        <SelectTrigger className="bg-black/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Aug-2024">August 2024</SelectItem>
                          <SelectItem value="Sep-2024">September 2024</SelectItem>
                          <SelectItem value="Oct-2024">October 2024</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="space-y-0.5">
                      <Label className="text-base">Linked Bank Account</Label>
                      <p className="text-xs text-muted-foreground">Required for immediate refunds via UPI/IMPS</p>
                    </div>
                    <Switch name="bankLinked" defaultChecked />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-muted-foreground text-xs uppercase tracking-widest">Invoices Auto-Fetched (GSTR-2B)</Label>
                    <div className="border border-white/10 rounded-lg overflow-hidden text-sm">
                      <table className="w-full">
                        <thead className="bg-white/5 text-xs text-muted-foreground text-left">
                          <tr><th className="p-2 font-medium">Invoice #</th><th className="p-2 font-medium">Supplier</th><th className="p-2 font-medium text-right">ITC Amount</th></tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono">
                          <tr><td className="p-2">INV-992</td><td className="p-2">TechCorp India</td><td className="p-2 text-right">₹12,450</td></tr>
                          <tr><td className="p-2">INV-993</td><td className="p-2">AWS Services</td><td className="p-2 text-right">₹4,200</td></tr>
                          <tr><td className="p-2">INV-994</td><td className="p-2">OfficeSpace Co</td><td className="p-2 text-right">₹18,000</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 text-lg shadow-[0_0_20px_rgba(255,107,26,0.3)]" disabled={gstMutation.isPending}>
                    {gstMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <FileText className="mr-2" />}
                    File GSTR-3B Autonomously
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-8">
              {gstResult && (
                <Card className="glass-panel border-emerald-500/40 bg-emerald-500/5 animate-in slide-in-from-right-4">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-3 text-emerald-500 mb-4">
                      <CheckCircle2 size={32} />
                      <div>
                        <h3 className="text-xl font-bold font-display uppercase tracking-wider text-white">GSTR-3B Filed</h3>
                        <p className="text-sm">Compliance automated successfully.</p>
                      </div>
                    </div>
                    <div className="bg-black/30 rounded-xl p-4 space-y-3 font-mono text-sm border border-emerald-500/20">
                      <div className="flex justify-between"><span className="text-muted-foreground">Reference No.</span><span className="text-white">{gstResult.referenceNumber}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Refund Auth.</span><span className="text-emerald-400 font-bold">₹{gstResult.refundAmount?.toLocaleString() || "34,650"}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Timestamp</span><span>{new Date().toLocaleString()}</span></div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Income Tax Card */}
              <Card className="glass-panel border-border/50">
                <CardHeader className="border-b border-border/50 bg-white/5">
                  <CardTitle className="flex items-center gap-2 text-blue-400 font-display tracking-widest uppercase">
                    <User size={20} /> Personal ITR Auto-Filer
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {itrResult ? (
                    <div className="text-center py-6 space-y-4">
                       <CheckCircle2 size={48} className="mx-auto text-blue-400" />
                       <h3 className="text-2xl font-bold text-white font-display">ITR Filed</h3>
                       <p className="text-muted-foreground font-mono">ACK: {itrResult.acknowledgementNumber}</p>
                       <p className="text-blue-400 font-bold bg-blue-500/10 py-2 rounded-lg border border-blue-500/20">Expected Refund: ₹{itrResult.refundAmount?.toLocaleString() || "12,500"}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleITRSubmit} className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>PAN Number</Label>
                          <Input name="panNumber" defaultValue="ABCDE1234F" className="bg-black/20 font-mono" required />
                        </div>
                        <div className="space-y-2">
                          <Label>Assessment Year</Label>
                          <Input name="ay" defaultValue="2024-25" className="bg-black/20" required />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                        <Label>Form 16 Auto-Fetch (via PAN)</Label>
                        <Switch name="form16" defaultChecked />
                      </div>

                      <Button type="submit" variant="secondary" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold" disabled={itrMutation.isPending}>
                        {itrMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                        File ITR Autonomously
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="freelance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="glass-panel border-border/50">
              <CardHeader className="border-b border-border/50 bg-white/5">
                <CardTitle className="flex items-center gap-2 text-primary font-display tracking-widest uppercase">
                  <Globe size={20} /> Autonomous Bidder
                </CardTitle>
                <CardDescription>AI agent continuously scans and bids on global platforms</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleBidSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label>Verified Skill Tags</Label>
                    <Input name="skills" defaultValue="React, Python, UI/UX, Data Analysis" className="bg-black/20 font-mono text-sm" required />
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Target Platforms</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {["Contra", "Upwork", "Fiverr", "Truelancer"].map(p => (
                        <div key={p} className="flex items-center space-x-2 bg-white/5 p-3 rounded-lg border border-white/10">
                          <Checkbox id={`platform_${p}`} name={`platform_${p}`} defaultChecked />
                          <label htmlFor={`platform_${p}`} className="text-sm font-medium leading-none cursor-pointer">{p}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Label>Minimum Project Budget</Label>
                      <span className="text-primary font-mono font-bold">$500</span>
                    </div>
                    <input type="range" name="minBudget" min="100" max="5000" step="100" defaultValue="500" className="w-full accent-primary" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>$100</span><span>$5,000+</span>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 shadow-[0_0_20px_rgba(255,107,26,0.3)]" disabled={bidMutation.isPending}>
                    {bidMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Globe className="mr-2" />}
                    Start Autonomous Bidding
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="h-full">
              {bidResult ? (
                <Card className="glass-panel border-primary/40 h-full animate-in slide-in-from-right-4">
                  <CardHeader className="bg-primary/5 border-b border-primary/20">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-primary uppercase tracking-widest font-display text-2xl">
                        Active Bids
                      </CardTitle>
                      <Badge className="bg-primary/20 text-primary border-primary/50 text-lg px-3">{bidResult.bidsPlaced}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {bidResult.jobsTargeted.map((job: any, i: number) => (
                        <div key={i} className="p-4 rounded-xl border border-border/50 bg-black/30 hover:bg-black/50 transition-colors flex justify-between items-center group">
                          <div>
                            <div className="font-bold text-white/90 group-hover:text-primary transition-colors">{job.title}</div>
                            <div className="flex gap-2 items-center mt-1">
                              <Badge variant="outline" className="text-[10px] uppercase text-muted-foreground border-white/10">{job.platform}</Badge>
                              <span className="text-[10px] text-muted-foreground">• Auto-generated proposal</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-emerald-400 font-bold text-lg">${job.bidAmount}</div>
                            <div className="text-[10px] uppercase tracking-widest text-primary mt-1 flex items-center justify-end gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"/>
                              {job.status.replace('_', ' ')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-center mt-6 pt-4 border-t border-border/50 text-xs text-muted-foreground flex items-center justify-center gap-2">
                      <ShieldCheck size={14}/> Agent continuously monitoring responses
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="h-full min-h-[400px] border-2 border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center text-muted-foreground bg-black/10">
                  <Globe size={48} className="mb-4 opacity-20" />
                  <p className="text-lg text-center px-8">Configure parameters and activate agent to<br/>begin hunting global opportunities.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState } from "react";
import { useCheckEligibility, useApplyScheme } from "@workspace/api-client-react";
import { Building2, Search, Zap, CheckSquare, Loader2, ArrowRight, ShieldCheck, CheckCircle2, FileText, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { motion, AnimatePresence } from "framer-motion";

export default function Governance() {
  const { toast } = useToast();
  const checkMutation = useCheckEligibility();
  const applyMutation = useApplyScheme();
  
  const [eligibility, setEligibility] = useState<any>(null);
  const [appliedSchemes, setAppliedSchemes] = useState<Record<string, any>>({});
  const [modalScheme, setModalScheme] = useState<any>(null);

  const handleCheck = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    checkMutation.mutate({
      data: {
        citizenId: formData.get("citizenId") as string,
        aadhaarVerified: formData.get("aadhaarVerified") === "true",
        annualIncome: parseFloat(formData.get("annualIncome") as string),
        age: parseInt(formData.get("age") as string, 10),
        occupation: formData.get("occupation") as any,
        state: formData.get("state") as string,
      }
    }, {
      onSuccess: (res) => {
        setEligibility(res);
        toast({ title: "Analysis Complete", description: `Found ${res.eligibleSchemes.length} matching schemes.` });
      }
    });
  };

  const handleApply = (scheme: any, isAutoAll = false) => {
    applyMutation.mutate({
      data: {
        citizenId: eligibility?.citizenId || "CIT-9872341",
        schemeId: scheme.schemeId,
        aadhaarVerified: true,
        digilockerConsent: true
      }
    }, {
      onSuccess: (res) => {
        setAppliedSchemes(prev => ({ ...prev, [scheme.schemeId]: res }));
        toast({ 
          title: "Application Submitted", 
          description: `Successfully applied to ${scheme.schemeName}.`,
        });
        if (!isAutoAll) setModalScheme(null);
      }
    });
  };

  const handleAutoApplyAll = () => {
    if (!eligibility) return;
    eligibility.eligibleSchemes.forEach((scheme: any) => {
      if (!appliedSchemes[scheme.schemeId]) {
        handleApply(scheme, true);
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="SarkarBot — Zero Bureaucracy" 
        description="Algorithmic scheme matching and one-click autonomous application processing."
        icon={Building2}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
        {/* Profile Input */}
        <Card className="glass-panel lg:col-span-4 h-fit border-purple-500/20 sticky top-24">
          <CardHeader className="bg-purple-500/5 border-b border-border/50">
            <CardTitle className="text-lg uppercase tracking-widest font-display flex items-center gap-2 text-purple-400">
              <Search size={18}/> Citizen Profile Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleCheck} className="space-y-6">
              <div className="space-y-2">
                <Label>Citizen ID / Aadhaar VID</Label>
                <Input name="citizenId" defaultValue="CIT-9872341" className="bg-black/20 font-mono tracking-widest text-center" required />
              </div>
              
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Annual Income (₹)</Label>
                    <span className="text-xs text-muted-foreground font-mono">1,50,000</span>
                  </div>
                  <input type="range" name="annualIncome" min="0" max="500000" step="10000" defaultValue="150000" className="w-full accent-purple-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input name="age" type="number" defaultValue="32" className="bg-black/20" required />
                </div>
                <div className="space-y-2">
                  <Label>Occupation</Label>
                  <Select name="occupation" defaultValue="farmer">
                    <SelectTrigger className="bg-black/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="farmer">Farmer</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                      <SelectItem value="salaried">Salaried</SelectItem>
                      <SelectItem value="self_employed">Self Employed</SelectItem>
                      <SelectItem value="senior_citizen">Senior Citizen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>State of Residence</Label>
                <Select name="state" defaultValue="Maharashtra">
                  <SelectTrigger className="bg-black/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                    <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                    <SelectItem value="Karnataka">Karnataka</SelectItem>
                    <SelectItem value="Gujarat">Gujarat</SelectItem>
                    <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex items-center justify-between">
                  <Label className="cursor-pointer">Has Agricultural Land</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="cursor-pointer">Bank Account Linked</Label>
                  <Switch defaultChecked />
                </div>
              </div>
              
              <input type="hidden" name="aadhaarVerified" value="true" />
              
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 shadow-[0_0_20px_rgba(168,85,247,0.3)]" disabled={checkMutation.isPending}>
                {checkMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Zap className="mr-2" />}
                Check All Eligibility <ArrowRight size={16} className="ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {!eligibility && !checkMutation.isPending && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full min-h-[500px] border-2 border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center text-muted-foreground bg-black/10 py-24">
                <Building2 size={64} className="mb-6 opacity-20" />
                <h3 className="text-2xl font-display text-white mb-2">Awaiting Citizen Profile</h3>
                <p className="text-lg text-center px-8 max-w-lg">Enter citizen metrics to algorithmically determine entitlements across 4,000+ central and state government schemes.</p>
              </motion.div>
            )}

            {checkMutation.isPending && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full min-h-[500px] border border-purple-500/30 rounded-2xl flex flex-col items-center justify-center text-purple-400 bg-purple-500/5 backdrop-blur-sm py-24">
                <div className="relative">
                  <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full animate-ping" />
                  <Loader2 size={64} className="animate-spin" />
                </div>
                <p className="mt-8 text-xl font-mono tracking-widest uppercase">Scanning Policy DB...</p>
              </motion.div>
            )}

            {eligibility && !checkMutation.isPending && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <Card className="glass-panel border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_40px_rgba(16,185,129,0.15)] overflow-hidden relative">
                  <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />
                  <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div>
                      <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <IndianRupee size={16} /> Total Entitlement Value
                      </h3>
                      <div className="text-5xl md:text-6xl font-display font-bold text-white leading-none">
                        ₹{eligibility.totalBenefitValue.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8 w-full md:w-auto">
                      <div className="text-right">
                        <div className="text-sm text-emerald-300 uppercase tracking-widest mb-1">Eligible Schemes</div>
                        <div className="text-4xl font-mono font-bold text-white">{eligibility.eligibleSchemes.length}</div>
                      </div>
                      <Button onClick={handleAutoApplyAll} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                        <Zap size={16} className="mr-2" /> Auto-Apply to All
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <h3 className="text-xl font-display uppercase tracking-widest text-white flex items-center gap-3">
                    <CheckSquare className="text-purple-400" size={24} /> Matched Directives
                  </h3>
                  
                  {eligibility.eligibleSchemes.map((scheme: any) => {
                    const applied = appliedSchemes[scheme.schemeId];
                    
                    return (
                      <Card key={scheme.schemeId} className={`glass-panel overflow-hidden group transition-all duration-300 ${applied ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-purple-500/50'}`}>
                        <div className="flex flex-col md:flex-row">
                          <div className="p-6 flex-1">
                            <div className="flex justify-between items-start mb-3">
                              <Badge variant="outline" className="text-xs uppercase tracking-widest bg-purple-500/10 text-purple-300 border-purple-500/30">
                                {scheme.ministry}
                              </Badge>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Match Score</span>
                                <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-purple-500" style={{ width: `${scheme.eligibilityScore}%` }} />
                                </div>
                                <span className="font-mono text-xs text-white">{scheme.eligibilityScore}%</span>
                              </div>
                            </div>
                            
                            <h4 className="text-2xl font-bold text-white mb-4 leading-tight">{scheme.schemeName}</h4>
                            
                            <div className="flex flex-wrap gap-x-8 gap-y-4 mb-6">
                              <div>
                                <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">Benefit Type</span>
                                <span className="text-white font-medium capitalize">{scheme.benefitType.replace('_', ' ')}</span>
                              </div>
                              {scheme.benefitAmount && (
                                <div>
                                  <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">Amount</span>
                                  <span className="text-emerald-400 font-mono font-bold text-lg">₹{scheme.benefitAmount.toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-2">Docs to be auto-fetched via DigiLocker</span>
                              <div className="flex flex-wrap gap-2">
                                {scheme.documentsRequired.map((doc: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="bg-white/5 border border-white/10 text-white/70 text-xs font-normal">
                                    <FileText size={12} className="mr-1 inline text-purple-400" /> {doc}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-black/40 p-6 flex flex-col justify-center items-center border-t md:border-t-0 md:border-l border-white/10 min-w-[240px]">
                            {applied ? (
                              <div className="text-center w-full">
                                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
                                  <CheckCircle2 size={32} />
                                </div>
                                <div className="text-lg font-bold text-white mb-1">Applied</div>
                                <div className="text-xs text-emerald-400 font-mono bg-emerald-500/10 py-1 px-2 rounded border border-emerald-500/20 break-all">{applied.applicationId}</div>
                                <div className="text-[10px] text-muted-foreground mt-4 uppercase tracking-widest">{applied.status.replace('_', ' ')}</div>
                              </div>
                            ) : (
                              <div className="w-full text-center space-y-4">
                                <Button 
                                  onClick={() => setModalScheme(scheme)}
                                  className="w-full h-14 bg-white hover:bg-gray-200 text-black font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all"
                                >
                                  Apply Now <ArrowRight size={18} className="ml-2" />
                                </Button>
                                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                                  <ShieldCheck size={14} className="text-purple-400" /> 1-Click e-KYC Enabled
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Custom Mini Modal for Application Confirmation */}
        <AnimatePresence>
          {modalScheme && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                className="bg-[#0a0e1a] border border-purple-500/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
              >
                <div className="bg-purple-500/10 p-6 border-b border-purple-500/20">
                  <h3 className="text-2xl font-display font-bold text-white mb-2">Confirm Application</h3>
                  <p className="text-purple-300 text-sm">{modalScheme.schemeName}</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="bg-black/40 p-4 rounded-xl border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-orange-500/20 text-orange-500 flex items-center justify-center"><ShieldCheck size={16}/></div>
                        <div>
                          <div className="text-sm font-bold text-white">Aadhaar e-KYC Consent</div>
                          <div className="text-xs text-muted-foreground">Allow agent to sign via UIDAI</div>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="h-px bg-white/10 w-full" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center"><FileText size={16}/></div>
                        <div>
                          <div className="text-sm font-bold text-white">DigiLocker Access</div>
                          <div className="text-xs text-muted-foreground">Auto-fetch required documents</div>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1 border-white/20 text-white" onClick={() => setModalScheme(null)}>Cancel</Button>
                    <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold" onClick={() => handleApply(modalScheme)} disabled={applyMutation.isPending}>
                      {applyMutation.isPending ? <Loader2 className="animate-spin mr-2"/> : null}
                      Submit Autonomously
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

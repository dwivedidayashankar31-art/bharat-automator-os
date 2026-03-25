import { useState } from "react";
import { useCheckEligibility, useApplyScheme } from "@workspace/api-client-react";
import { Building2, Search, Zap, CheckSquare, Loader2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/PageHeader";

export default function Governance() {
  const { toast } = useToast();
  const checkMutation = useCheckEligibility();
  const applyMutation = useApplyScheme();
  
  const [eligibility, setEligibility] = useState<any>(null);

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

  const handleAutoApply = (schemeId: string, schemeName: string) => {
    if (!eligibility) return;
    
    applyMutation.mutate({
      data: {
        citizenId: eligibility.citizenId,
        schemeId: schemeId,
        aadhaarVerified: true,
        digilockerConsent: true
      }
    }, {
      onSuccess: (res) => {
        toast({ 
          title: "Application Submitted", 
          description: `Auto-applied to ${schemeName}. ID: ${res.applicationId}`,
        });
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Zero-Bureaucracy Layer" 
        description="Algorithmic scheme matching and one-click application processing."
        icon={Building2}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Input */}
        <Card className="glass-panel lg:col-span-4 h-fit border-border/50">
          <CardHeader className="bg-black/20 border-b border-border/50">
            <CardTitle className="text-lg uppercase tracking-widest font-display flex items-center gap-2">
              <Search size={18} className="text-primary"/> Profile Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleCheck} className="space-y-5">
              <div className="space-y-2">
                <Label>Citizen ID / Aadhaar Virtual ID</Label>
                <Input name="citizenId" defaultValue="VID-9988-7766" className="bg-black/20 font-mono" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input name="age" type="number" defaultValue="22" className="bg-black/20" required />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input name="state" defaultValue="Maharashtra" className="bg-black/20" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Annual Income (₹)</Label>
                <Input name="annualIncome" type="number" defaultValue="150000" className="bg-black/20" required />
              </div>
              <div className="space-y-2">
                <Label>Occupation</Label>
                <Select name="occupation" defaultValue="student">
                  <SelectTrigger className="bg-black/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="farmer">Farmer</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="unemployed">Unemployed</SelectItem>
                    <SelectItem value="salaried">Salaried</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <input type="hidden" name="aadhaarVerified" value="true" />
              
              <Button type="submit" className="w-full bg-primary" disabled={checkMutation.isPending}>
                {checkMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Zap className="mr-2 h-4 w-4" />}
                Scan Eligibility Graph
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-8">
          {!eligibility ? (
            <div className="h-full min-h-[400px] border-2 border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center text-muted-foreground bg-black/10">
              <Building2 size={48} className="mb-4 opacity-20" />
              <p className="text-lg text-center px-8">Enter citizen profile metrics to algorithmically determine <br/>entitlements across 4,000+ government schemes.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-4">
              <Card className="glass-panel border-emerald-500/30 bg-emerald-500/5">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-1">Total Entitlement Value</h3>
                    <div className="text-4xl font-display font-bold text-white">
                      ₹ {eligibility.totalBenefitValue.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">Eligible Schemes</div>
                    <div className="text-2xl font-mono text-emerald-400">{eligibility.eligibleSchemes.length}</div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="text-lg font-display uppercase tracking-widest text-foreground flex items-center gap-2">
                  <CheckSquare className="text-primary" size={20} /> Matched Directives
                </h3>
                
                {eligibility.eligibleSchemes.map((scheme: any) => (
                  <Card key={scheme.schemeId} className="glass-panel border-border/50 hover:border-primary/50 transition-all overflow-hidden group">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-6 flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline" className="text-[10px] uppercase tracking-widest bg-primary/5 text-primary border-primary/20">
                            {scheme.ministry}
                          </Badge>
                          <span className="font-mono text-xs text-muted-foreground">Match: {scheme.eligibilityScore}%</span>
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2">{scheme.schemeName}</h4>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                          <div><span className="text-white/60">Benefit:</span> {scheme.benefitType.replace('_', ' ')}</div>
                          {scheme.benefitAmount && <div><span className="text-white/60">Amount:</span> ₹{scheme.benefitAmount.toLocaleString()}</div>}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {scheme.documentsRequired.map((doc: string, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-black/40 text-xs">📄 {doc}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-black/30 p-6 flex flex-col justify-center items-center border-t md:border-t-0 md:border-l border-border/50 min-w-[200px]">
                        <Button 
                          onClick={() => handleAutoApply(scheme.schemeId, scheme.schemeName)}
                          className="w-full bg-white hover:bg-white/90 text-black font-bold group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all"
                        >
                          Auto-Apply <ArrowRight size={16} className="ml-2" />
                        </Button>
                        <p className="text-[10px] text-muted-foreground mt-3 text-center">
                          Documents will be fetched<br/>directly from DigiLocker
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

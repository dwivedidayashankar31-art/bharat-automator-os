import { useState } from "react";
import { useGetPatientHistory, useBookEmergencyService } from "@workspace/api-client-react";
import { HeartPulse, Search, ActivitySquare, AlertCircle, PhoneCall, Loader2, Navigation, CheckCircle2, Siren, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { motion, AnimatePresence } from "framer-motion";

export default function Healthcare() {
  const { toast } = useToast();
  const [abhaQuery, setAbhaQuery] = useState("");
  
  const { data: patient, isLoading: patientLoading, refetch } = useGetPatientHistory(
    { abhaId: abhaQuery },
    { query: { enabled: !!abhaQuery, retry: false } }
  );

  const emergencyMutation = useBookEmergencyService();
  const [emergencyResult, setEmergencyResult] = useState<any>(null);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setAbhaQuery(formData.get("abhaId") as string);
    setTimeout(() => refetch(), 100);
  };

  const handleEmergency = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    emergencyMutation.mutate({
      data: {
        abhaId: formData.get("abhaId") as string,
        location: { lat: 28.6139, lng: 77.2090, address: formData.get("address") as string },
        emergencyType: formData.get("type") as any,
        severity: formData.get("severity") as any,
      }
    }, {
      onSuccess: (res) => {
        setEmergencyResult(res);
        toast({ title: "Ambulance Dispatched", description: `ETA: ${res.eta} minutes.`, variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Healthcare Agent (ABDM)" 
        description="Patient digital twin access and autonomous emergency dispatch system."
        icon={HeartPulse}
      />

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-border/50 p-1 rounded-xl max-w-md mb-8">
          <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white font-semibold py-3">Patient History</TabsTrigger>
          <TabsTrigger value="emergency" className="rounded-lg data-[state=active]:bg-destructive data-[state=active]:text-white font-semibold py-3">Emergency Services</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-6">
          <Card className="glass-panel border-border/50 bg-black/20">
            <CardContent className="p-4">
              <form onSubmit={handleSearch} className="flex items-center gap-4">
                <Search className="ml-4 text-primary shrink-0" size={24} />
                <Input 
                  name="abhaId" 
                  defaultValue="91-1234-5678-9012"
                  placeholder="Enter ABHA ID (e.g. 91-1234-5678-9012)" 
                  className="border-0 bg-transparent focus-visible:ring-0 text-xl font-mono py-8 px-2"
                  required 
                />
                <Button type="submit" size="lg" className="rounded-xl px-8 h-14 bg-primary hover:bg-primary/90 text-white font-bold shadow-[0_0_20px_rgba(255,107,26,0.3)]">
                  Fetch Health Twin
                </Button>
              </form>
            </CardContent>
          </Card>

          <AnimatePresence mode="wait">
            {!abhaQuery && !patientLoading && !patient && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-24 text-center border-2 border-dashed border-border/50 rounded-2xl bg-black/10">
                <UserPlus size={48} className="mx-auto mb-4 text-muted-foreground opacity-30" />
                <h3 className="text-xl font-display text-white mb-2">No Patient Selected</h3>
                <p className="text-muted-foreground">Enter an ABHA ID to retrieve comprehensive health records.</p>
              </motion.div>
            )}

            {patientLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-32 flex flex-col items-center justify-center">
                <Loader2 size={48} className="animate-spin text-primary mb-4" />
                <p className="text-lg font-mono tracking-widest text-primary/80 uppercase">Retrieving ABDM Twin...</p>
              </motion.div>
            )}
            
            {patient && !patientLoading && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-panel border-primary/30 md:col-span-1 h-fit">
                  <CardHeader className="bg-primary/5 pb-6 border-b border-primary/20 text-center flex flex-col items-center">
                    <div className="h-24 w-24 rounded-full border-4 border-primary/50 overflow-hidden mb-4 shadow-[0_0_30px_rgba(255,107,26,0.3)]">
                      <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop" alt="Patient Avatar" className="w-full h-full object-cover" />
                    </div>
                    <CardTitle className="text-3xl font-display text-white">{patient.name}</CardTitle>
                    <CardDescription className="font-mono text-primary mt-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">{patient.abhaId}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                      <span className="text-sm font-bold text-red-300 uppercase tracking-widest">Blood Group</span>
                      <span className="text-3xl font-bold text-red-500 font-display">{patient.bloodGroup}</span>
                    </div>
                    
                    <div>
                      <h4 className="text-xs text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2"><AlertCircle size={14}/> Severe Allergies</h4>
                      <div className="flex flex-wrap gap-2">
                        {patient.allergies.map((a: string, i: number) => <Badge key={i} variant="destructive" className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30">{a}</Badge>)}
                        {patient.allergies.length === 0 && <span className="text-sm text-muted-foreground">None reported</span>}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2"><ActivitySquare size={14}/> Active Conditions</h4>
                      <div className="flex flex-wrap gap-2">
                        {patient.conditions.map((c: string, i: number) => <Badge key={i} className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border-orange-500/30">{c}</Badge>)}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="md:col-span-2 space-y-6">
                  <Card className="glass-panel border-border/50">
                    <CardHeader className="bg-white/5 border-b border-border/50">
                      <CardTitle className="text-lg font-display tracking-widest uppercase flex items-center gap-2 text-white">
                        <ActivitySquare size={18} className="text-blue-400" /> Clinical History & Encounters
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="relative border-l-2 border-blue-500/30 ml-4 space-y-8 pb-4">
                        {patient.recentVisits.map((visit: any, i: number) => (
                          <div key={i} className="relative pl-8">
                            <div className="absolute w-4 h-4 rounded-full bg-blue-500 border-4 border-[#0a0e1a] -left-[9px] top-1 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                            <div className="bg-white/5 border border-white/10 p-5 rounded-xl hover:bg-white/10 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-bold text-lg text-white">{visit.diagnosis}</h5>
                                <span className="text-xs font-mono text-blue-300 bg-blue-500/10 px-2 py-1 rounded">{visit.date}</span>
                              </div>
                              <div className="text-sm text-muted-foreground mb-4">
                                <span className="text-white/80">{visit.hospital}</span> • Attending: Dr. {visit.doctor}
                              </div>
                              {visit.prescription && (
                                <div className="bg-black/40 p-3 rounded-lg border border-white/5 flex items-start gap-3">
                                  <div className="bg-purple-500/20 text-purple-400 p-1.5 rounded-md"><HeartPulse size={16} /></div>
                                  <div>
                                    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Prescription</div>
                                    <div className="text-sm text-white/90">{visit.prescription}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-panel border-border/50">
                    <CardHeader className="bg-white/5 border-b border-border/50">
                      <CardTitle className="text-lg font-display tracking-widest uppercase flex items-center gap-2 text-white">
                        <CheckCircle2 size={18} className="text-emerald-500" /> Immunization Record
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {patient.vaccinations.map((vac: string, i: number) => (
                          <div key={i} className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                            <span className="text-sm font-medium text-emerald-100">{vac}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="emergency">
          <div className="max-w-4xl mx-auto">
            <Card className="glass-panel border-destructive/50 bg-gradient-to-b from-destructive/10 to-transparent shadow-[0_0_50px_rgba(239,68,68,0.1)] overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-2 bg-destructive animate-pulse" />
              <CardHeader className="text-center pb-8 pt-10 border-b border-destructive/20">
                <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6 text-destructive border border-destructive/40 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                  <Siren size={40} className="animate-pulse" />
                </div>
                <CardTitle className="text-4xl font-display text-destructive tracking-widest uppercase mb-2">Emergency S.O.S.</CardTitle>
                <CardDescription className="text-lg text-white/70">Zero-latency autonomous ambulance dispatch</CardDescription>
              </CardHeader>
              
              <CardContent className="p-0">
                <AnimatePresence mode="wait">
                  {!emergencyResult ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 md:p-12">
                      <form onSubmit={handleEmergency} className="space-y-8">
                        <div className="space-y-3">
                          <Label className="text-destructive-foreground/80 uppercase tracking-widest text-xs">Patient Identity</Label>
                          <Input name="abhaId" defaultValue={patient?.abhaId || ""} placeholder="ABHA ID for history sharing" className="bg-black/40 border-destructive/30 focus-visible:ring-destructive h-12 text-lg" required />
                        </div>
                        
                        <div className="space-y-3">
                          <Label className="text-destructive-foreground/80 uppercase tracking-widest text-xs">Incident Location</Label>
                          <Input name="address" defaultValue="Connaught Place, New Delhi" className="bg-black/40 border-destructive/30 focus-visible:ring-destructive h-12" required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <Label className="text-destructive-foreground/80 uppercase tracking-widest text-xs">Emergency Classification</Label>
                            <RadioGroup name="type" defaultValue="cardiac" className="grid gap-3">
                              {[
                                { id: "cardiac", label: "Cardiac Arrest" },
                                { id: "accident", label: "Trauma / Accident" },
                                { id: "stroke", label: "Stroke" },
                                { id: "maternity", label: "Maternity" }
                              ].map((t) => (
                                <div key={t.id} className="flex items-center space-x-3 bg-black/40 border border-white/10 p-3 rounded-lg has-[:checked]:border-destructive has-[:checked]:bg-destructive/10 transition-colors">
                                  <RadioGroupItem value={t.id} id={`type-${t.id}`} className="border-white/50 text-destructive data-[state=checked]:border-destructive" />
                                  <Label htmlFor={`type-${t.id}`} className="flex-1 cursor-pointer font-medium">{t.label}</Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>
                          
                          <div className="space-y-4">
                            <Label className="text-destructive-foreground/80 uppercase tracking-widest text-xs">Condition Severity</Label>
                            <RadioGroup name="severity" defaultValue="critical" className="grid gap-3">
                              <div className="flex items-center space-x-3 bg-black/40 border border-white/10 p-4 rounded-lg has-[:checked]:border-destructive has-[:checked]:bg-destructive/20 transition-colors">
                                <RadioGroupItem value="critical" id="sev-critical" className="border-white/50 text-destructive data-[state=checked]:border-destructive" />
                                <Label htmlFor="sev-critical" className="flex-1 cursor-pointer font-bold text-destructive">Code Red (Critical)</Label>
                              </div>
                              <div className="flex items-center space-x-3 bg-black/40 border border-white/10 p-4 rounded-lg has-[:checked]:border-orange-500 has-[:checked]:bg-orange-500/20 transition-colors">
                                <RadioGroupItem value="moderate" id="sev-moderate" className="border-white/50 text-orange-500 data-[state=checked]:border-orange-500" />
                                <Label htmlFor="sev-moderate" className="flex-1 cursor-pointer font-bold text-orange-400">Code Yellow (Moderate)</Label>
                              </div>
                            </RadioGroup>
                          </div>
                        </div>

                        <Button 
                          type="submit" 
                          variant="destructive" 
                          size="lg" 
                          className="w-full h-20 text-2xl tracking-widest font-display font-bold mt-8 animate-pulse shadow-[0_0_40px_rgba(239,68,68,0.5)] hover:shadow-[0_0_60px_rgba(239,68,68,0.7)] transition-all rounded-2xl"
                          disabled={emergencyMutation.isPending}
                        >
                          {emergencyMutation.isPending ? <Loader2 className="animate-spin" size={32} /> : "DISPATCH EMERGENCY SERVICE NOW"}
                        </Button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 md:p-12 text-center space-y-8">
                      <div className="inline-flex items-center justify-center p-8 bg-destructive/20 border border-destructive/50 rounded-full shadow-[0_0_60px_rgba(239,68,68,0.4)] relative">
                        <div className="absolute inset-0 rounded-full border-4 border-destructive/30 animate-ping" />
                        <div className="flex flex-col items-center">
                          <h3 className="text-7xl font-display font-bold text-destructive leading-none">{emergencyResult.eta}</h3>
                          <span className="text-xl font-bold tracking-widest text-destructive/80 uppercase mt-1">Minutes</span>
                        </div>
                      </div>
                      
                      <h4 className="text-2xl text-white font-display uppercase tracking-widest">Unit Dispatched</h4>
                      
                      <div className="bg-black/40 border border-white/10 rounded-2xl p-6 max-w-lg mx-auto text-left space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b border-white/10">
                          <div className="flex items-center gap-3 text-muted-foreground"><Navigation size={18}/> <span className="uppercase tracking-wider text-xs font-bold">Unit Assigned</span></div>
                          <span className="font-mono text-white font-bold text-lg">{emergencyResult.ambulanceId} <span className="text-sm text-primary">({emergencyResult.ambulanceType})</span></span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-white/10">
                          <div className="flex items-center gap-3 text-muted-foreground"><PhoneCall size={18}/> <span className="uppercase tracking-wider text-xs font-bold">Paramedic</span></div>
                          <div className="text-right">
                            <div className="text-white font-bold">{emergencyResult.driverName}</div>
                            <a href={`tel:${emergencyResult.driverPhone}`} className="text-primary hover:underline">{emergencyResult.driverPhone}</a>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pb-2">
                          <div className="flex items-center gap-3 text-muted-foreground"><HeartPulse size={18}/> <span className="uppercase tracking-wider text-xs font-bold">Destination</span></div>
                          <span className="text-white font-bold">{emergencyResult.hospitalAssigned}</span>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-sm text-emerald-400 flex gap-3 items-center max-w-lg mx-auto font-medium">
                        <CheckCircle2 size={24} className="shrink-0" />
                        Patient digital twin data (blood group, allergies, conditions) securely transmitted to paramedics and destination ER.
                      </div>
                      
                      <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 w-full max-w-lg" onClick={() => setEmergencyResult(null)}>Cancel / Reset Demo</Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

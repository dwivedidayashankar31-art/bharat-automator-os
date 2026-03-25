import { useState } from "react";
import { useGetPatientHistory, useBookEmergencyService } from "@workspace/api-client-react";
import { HeartPulse, Search, ActivitySquare, AlertCircle, PhoneCall, Loader2, Navigation } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/PageHeader";

export default function Healthcare() {
  const { toast } = useToast();
  const [abhaQuery, setAbhaQuery] = useState("");
  
  const { data: patient, isLoading: patientLoading } = useGetPatientHistory(
    { abhaId: abhaQuery },
    { query: { enabled: !!abhaQuery, retry: false } }
  );

  const emergencyMutation = useBookEmergencyService();
  const [emergencyResult, setEmergencyResult] = useState<any>(null);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setAbhaQuery(formData.get("abhaId") as string);
  };

  const handleEmergency = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    emergencyMutation.mutate({
      data: {
        abhaId: formData.get("abhaId") as string,
        location: { lat: 28.6139, lng: 77.2090 }, // Mock GPS
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Digital Twin Lookup */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="glass-panel">
            <CardContent className="p-2">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Search className="ml-4 text-muted-foreground shrink-0" />
                <Input 
                  name="abhaId" 
                  placeholder="Enter ABHA Health ID (e.g. 14-DIGIT-ABHA)" 
                  className="border-0 bg-transparent focus-visible:ring-0 text-lg py-6"
                  required 
                />
                <Button type="submit" size="lg" className="rounded-xl px-8 bg-white/10 hover:bg-white/20 text-white border-0">Lookup</Button>
              </form>
            </CardContent>
          </Card>

          {patientLoading && <div className="text-center py-20 text-primary animate-pulse">Retrieving Health Records...</div>}
          
          {patient && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4">
              <Card className="glass-panel border-primary/30">
                <CardHeader className="bg-black/20 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl font-display">{patient.name}</CardTitle>
                      <CardDescription className="font-mono mt-1">{patient.abhaId}</CardDescription>
                    </div>
                    <div className="h-16 w-16 rounded-full border-2 border-primary/50 overflow-hidden flex items-center justify-center bg-black/40">
                      {/* Using Unsplash for generic patient avatar placeholder as specified */}
                      <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop" alt="Avatar" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <span className="text-sm font-semibold text-red-200">Blood Group</span>
                    <span className="text-xl font-bold text-red-500 font-display">{patient.bloodGroup}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-2">Active Conditions</span>
                    <div className="flex flex-wrap gap-2">
                      {patient.conditions.map((c, i) => <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border-primary/20">{c}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-2">Severe Allergies</span>
                    <div className="flex flex-wrap gap-2">
                      {patient.allergies.map((a, i) => <Badge key={i} variant="destructive" className="bg-destructive/20">{a}</Badge>)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-panel border-border/50">
                <CardHeader>
                  <CardTitle className="text-sm font-display tracking-widest uppercase flex items-center gap-2 text-muted-foreground">
                    <ActivitySquare size={16} /> Recent Encounters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {patient.recentVisits.map((visit, i) => (
                    <div key={i} className="pl-4 border-l-2 border-primary/30 py-1 relative">
                      <div className="absolute w-2 h-2 rounded-full bg-primary -left-[5px] top-2" />
                      <div className="text-sm font-semibold text-white/90">{visit.diagnosis}</div>
                      <div className="text-xs text-muted-foreground">{visit.hospital} • Dr. {visit.doctor}</div>
                      <div className="text-[10px] font-mono text-muted-foreground mt-1">{visit.date}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Emergency Dispatch */}
        <div className="xl:col-span-1">
          <Card className="glass-panel border-destructive/50 bg-gradient-to-b from-destructive/10 to-transparent">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4 text-destructive border border-destructive/30">
                <AlertCircle size={32} />
              </div>
              <CardTitle className="text-2xl font-display text-destructive tracking-widest uppercase">Emergency S.O.S.</CardTitle>
              <CardDescription>Zero-latency autonomous dispatch</CardDescription>
            </CardHeader>
            <CardContent>
              {!emergencyResult ? (
                <form onSubmit={handleEmergency} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-destructive-foreground/80">Patient ABHA ID</Label>
                    <Input name="abhaId" defaultValue={patient?.abhaId || ""} className="bg-black/40 border-destructive/30 focus-visible:ring-destructive" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-destructive-foreground/80">Emergency Type</Label>
                    <Select name="type" defaultValue="cardiac">
                      <SelectTrigger className="bg-black/40 border-destructive/30 focus-visible:ring-destructive">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cardiac">Cardiac Arrest</SelectItem>
                        <SelectItem value="accident">Trauma / Accident</SelectItem>
                        <SelectItem value="stroke">Stroke</SelectItem>
                        <SelectItem value="maternity">Maternity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-destructive-foreground/80">Severity</Label>
                    <Select name="severity" defaultValue="critical">
                      <SelectTrigger className="bg-black/40 border-destructive/30 focus-visible:ring-destructive">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical (Code Red)</SelectItem>
                        <SelectItem value="moderate">Moderate (Code Yellow)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    type="submit" 
                    variant="destructive" 
                    size="lg" 
                    className="w-full h-14 text-lg tracking-widest font-bold mt-4 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                    disabled={emergencyMutation.isPending}
                  >
                    {emergencyMutation.isPending ? <Loader2 className="animate-spin" /> : "DISPATCH AMBULANCE"}
                  </Button>
                </form>
              ) : (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-4 space-y-6">
                  <div className="text-center p-6 bg-destructive/20 border border-destructive/50 rounded-2xl">
                    <h3 className="text-4xl font-display font-bold text-destructive mb-1">{emergencyResult.eta} MIN</h3>
                    <p className="text-sm font-semibold tracking-widest text-destructive/80 uppercase">Estimated Arrival</p>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-border/50 pb-2">
                      <span className="text-muted-foreground flex items-center gap-2"><Navigation size={14}/> Unit</span>
                      <span className="font-mono text-white">{emergencyResult.ambulanceId} ({emergencyResult.ambulanceType})</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-2">
                      <span className="text-muted-foreground flex items-center gap-2"><PhoneCall size={14}/> Driver</span>
                      <span className="text-white">{emergencyResult.driverName} • {emergencyResult.driverPhone}</span>
                    </div>
                    <div className="flex justify-between pb-2">
                      <span className="text-muted-foreground flex items-center gap-2"><HeartPulse size={14}/> Destination</span>
                      <span className="text-white text-right">{emergencyResult.hospitalAssigned}</span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg text-xs text-primary flex gap-2 items-start">
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                    Patient digital twin data (blood group, allergies, conditions) securely transmitted to paramedics and destination ER.
                  </div>
                  
                  <Button variant="outline" className="w-full" onClick={() => setEmergencyResult(null)}>New Dispatch</Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

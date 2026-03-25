import { useState } from "react";
import { usePredictYield, useExecuteTrade } from "@workspace/api-client-react";
import { Leaf, Droplets, ThermometerSun, Map, Coins, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

export default function Agriculture() {
  const { toast } = useToast();
  const predictMutation = usePredictYield();
  const tradeMutation = useExecuteTrade();
  
  const [predictionData, setPredictionData] = useState<any>(null);

  const handlePredict = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    predictMutation.mutate({
      data: {
        farmerId: "FARMER-" + Math.floor(Math.random()*10000),
        cropType: formData.get("cropType") as string,
        fieldArea: parseFloat(formData.get("fieldArea") as string),
        soilMoisture: parseFloat(formData.get("soilMoisture") as string),
        temperature: parseFloat(formData.get("temperature") as string),
        rainfall: parseFloat(formData.get("rainfall") as string),
      }
    }, {
      onSuccess: (res) => {
        setPredictionData(res);
        toast({ title: "Analysis Complete", description: "Yield prediction and market strategy generated." });
      },
      onError: (err: any) => {
        toast({ title: "Analysis Failed", description: err.message, variant: "destructive" });
      }
    });
  };

  const handleTrade = () => {
    if (!predictionData) return;
    tradeMutation.mutate({
      data: {
        farmerId: predictionData.farmerId,
        cropType: predictionData.cropType,
        quantity: predictionData.predictedYield,
        minimumPrice: 2450, // Mocked intelligent floor price
        platform: "both",
        upiId: "farmer@upi"
      }
    }, {
      onSuccess: () => {
        toast({ 
          title: "Trade Executed", 
          description: "Smart contract executed across ONDC and e-NAM.",
        });
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Agriculture Sector Node" 
        description="Autonomous IoT-driven yield prediction and algorithmic trading on ONDC/e-NAM."
        icon={Leaf}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* IoT Input Form */}
        <Card className="glass-panel lg:col-span-4 h-fit">
          <CardHeader className="bg-black/20 border-b border-border/50">
            <CardTitle className="text-lg uppercase tracking-widest text-primary font-display flex items-center gap-2">
              <Map size={18}/> Sensor Telemetry
            </CardTitle>
            <CardDescription>Simulate incoming IoT field data</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handlePredict} className="space-y-5">
              <div className="space-y-2">
                <Label>Crop Variant</Label>
                <Select name="cropType" defaultValue="Wheat (HD-2967)">
                  <SelectTrigger className="bg-black/20 border-border/50">
                    <SelectValue placeholder="Select crop..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wheat (HD-2967)">Wheat (HD-2967)</SelectItem>
                    <SelectItem value="Basmati Rice">Basmati Rice</SelectItem>
                    <SelectItem value="Sugarcane">Sugarcane</SelectItem>
                    <SelectItem value="Cotton">Cotton</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Area (Hectares)</Label>
                  <Input name="fieldArea" type="number" step="0.1" defaultValue="2.5" className="bg-black/20" required />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Droplets size={14}/> Moisture %</Label>
                  <Input name="soilMoisture" type="number" defaultValue="42" className="bg-black/20" required />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><ThermometerSun size={14}/> Temp (°C)</Label>
                  <Input name="temperature" type="number" defaultValue="28.5" className="bg-black/20" required />
                </div>
                <div className="space-y-2">
                  <Label>Rainfall (mm)</Label>
                  <Input name="rainfall" type="number" defaultValue="120" className="bg-black/20" required />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wide mt-4"
                disabled={predictMutation.isPending}
              >
                {predictMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Leaf className="mr-2 h-4 w-4" />}
                Analyze Field Data
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* AI Output & Action */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {!predictionData && !predictMutation.isPending && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full min-h-[400px] border-2 border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center text-muted-foreground bg-black/10"
              >
                <Leaf size={48} className="mb-4 opacity-20" />
                <p className="text-lg">Awaiting telemetry data to synthesize strategy.</p>
              </motion.div>
            )}
            
            {predictMutation.isPending && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full min-h-[400px] border border-border/50 rounded-2xl flex flex-col items-center justify-center text-primary bg-card/20 backdrop-blur-sm"
              >
                <div className="relative">
                  <div className="absolute inset-0 border-4 border-primary rounded-full animate-ping opacity-20" />
                  <Loader2 size={48} className="animate-spin" />
                </div>
                <p className="mt-6 text-lg font-mono tracking-widest uppercase">Processing Neural Models...</p>
              </motion.div>
            )}

            {predictionData && !predictMutation.isPending && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Yield Card */}
                  <Card className="glass-panel border-emerald-500/30 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                      <Leaf size={100} />
                    </div>
                    <CardHeader>
                      <CardDescription className="text-emerald-400 font-bold tracking-widest uppercase text-xs">AI Yield Projection</CardDescription>
                      <CardTitle className="text-4xl font-display text-white mt-2">
                        {predictionData.predictedYield} <span className="text-xl text-muted-foreground font-sans">{predictionData.unit}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="w-full bg-black/40 rounded-full h-2 mt-4">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${predictionData.confidence}%` }}></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 text-right">{predictionData.confidence}% Confidence Score</p>
                      
                      <div className="mt-6 space-y-2">
                        {predictionData.recommendedActions.map((action: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-white/80">
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                            {action}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Market Card */}
                  <Card className="glass-panel border-primary/30">
                    <CardHeader>
                      <CardDescription className="text-primary font-bold tracking-widest uppercase text-xs">Market Intelligence</CardDescription>
                      <CardTitle className="text-xl text-white mt-2 leading-relaxed">
                        {predictionData.tradeRecommendation}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
                        <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">Optimal Sell Window</span>
                        <span className="font-mono text-primary font-bold text-lg">{predictionData.optimalSellDate || "Immediate"}</span>
                      </div>
                      
                      {tradeMutation.isSuccess ? (
                        <div className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-center justify-center gap-2 font-bold tracking-wide">
                          <CheckCircle2 size={20} />
                          TRADE EXECUTED
                        </div>
                      ) : (
                        <Button 
                          onClick={handleTrade}
                          disabled={tradeMutation.isPending}
                          className="w-full py-6 text-lg font-bold bg-gradient-to-r from-primary to-orange-500 hover:shadow-lg hover:shadow-primary/30 transition-all border-none"
                        >
                          {tradeMutation.isPending ? (
                            <Loader2 className="animate-spin mr-2" />
                          ) : (
                            <Coins className="mr-2" />
                          )}
                          Auto-Execute on ONDC
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

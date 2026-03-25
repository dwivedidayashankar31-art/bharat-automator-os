import { useState } from "react";
import { usePredictYield, useExecuteTrade, useGetMarketIntelligence } from "@workspace/api-client-react";
import { Leaf, Droplets, ThermometerSun, Map, Coins, ArrowRight, Loader2, CheckCircle2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

export default function Agriculture() {
  const { toast } = useToast();
  const predictMutation = usePredictYield();
  const tradeMutation = useExecuteTrade();
  
  const { data: marketData, isLoading: marketLoading } = useGetMarketIntelligence();
  
  const [predictionData, setPredictionData] = useState<any>(null);

  const handlePredict = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    predictMutation.mutate({
      data: {
        farmerId: formData.get("farmerId") as string,
        cropType: formData.get("cropType") as string,
        fieldArea: parseFloat(formData.get("fieldArea") as string),
        soilMoisture: parseFloat(formData.get("soilMoisture") as string),
        temperature: parseFloat(formData.get("temperature") as string),
        rainfall: parseFloat(formData.get("rainfall") as string),
        ndviIndex: parseFloat(formData.get("ndviIndex") as string),
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

  const handleTrade = (crop?: string, price?: number) => {
    const tradeCrop = crop || predictionData?.cropType || "Wheat";
    const tradePrice = price || predictionData?.predictedYield * 2450 || 50000;

    tradeMutation.mutate({
      data: {
        farmerId: "FARMER-9872341",
        cropType: tradeCrop,
        quantity: predictionData?.predictedYield || 2.5,
        minimumPrice: tradePrice,
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
        <Card className="glass-panel lg:col-span-4 h-fit border-emerald-500/20">
          <CardHeader className="bg-emerald-500/5 border-b border-border/50">
            <CardTitle className="text-lg uppercase tracking-widest text-emerald-500 font-display flex items-center gap-2">
              <Map size={18}/> Sensor Telemetry
            </CardTitle>
            <CardDescription>Simulate incoming IoT field data</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handlePredict} className="space-y-5">
              <div className="space-y-2">
                <Label>Farmer ID</Label>
                <Input name="farmerId" defaultValue="FARM-9872341" className="bg-black/20 font-mono" required />
              </div>
              <div className="space-y-2">
                <Label>Crop Variant</Label>
                <Select name="cropType" defaultValue="Wheat">
                  <SelectTrigger className="bg-black/20 border-border/50">
                    <SelectValue placeholder="Select crop..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wheat">Wheat</SelectItem>
                    <SelectItem value="Rice">Rice</SelectItem>
                    <SelectItem value="Cotton">Cotton</SelectItem>
                    <SelectItem value="Soybean">Soybean</SelectItem>
                    <SelectItem value="Maize">Maize</SelectItem>
                    <SelectItem value="Sugarcane">Sugarcane</SelectItem>
                    <SelectItem value="Groundnut">Groundnut</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Field Area (Hectares)</Label>
                <Input name="fieldArea" type="number" step="0.1" defaultValue="2.5" className="bg-black/20" required />
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="flex items-center gap-1"><Droplets size={14}/> Soil Moisture %</Label>
                    <span className="text-xs text-muted-foreground">58%</span>
                  </div>
                  <input type="range" name="soilMoisture" min="0" max="100" defaultValue="58" className="w-full accent-emerald-500" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="flex items-center gap-1"><ThermometerSun size={14}/> Temp (°C)</Label>
                    <span className="text-xs text-muted-foreground">28°C</span>
                  </div>
                  <input type="range" name="temperature" min="0" max="50" defaultValue="28" className="w-full accent-emerald-500" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>NDVI Index (0-1)</Label>
                    <span className="text-xs text-muted-foreground">0.72</span>
                  </div>
                  <input type="range" name="ndviIndex" min="0" max="1" step="0.01" defaultValue="0.72" className="w-full accent-emerald-500" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Rainfall (mm)</Label>
                <Input name="rainfall" type="number" defaultValue="45" className="bg-black/20" required />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold tracking-wide mt-4"
                disabled={predictMutation.isPending}
              >
                {predictMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Leaf className="mr-2 h-4 w-4" />}
                Run Yield Prediction <ArrowRight size={16} className="ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* AI Output & Action */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <AnimatePresence mode="wait">
            {!predictionData && !predictMutation.isPending && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="w-full border-2 border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center text-muted-foreground bg-black/10 py-24"
              >
                <Leaf size={48} className="mb-4 opacity-20" />
                <p className="text-lg">Run prediction to generate yield estimates and trade strategy.</p>
              </motion.div>
            )}
            
            {predictMutation.isPending && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="w-full border border-emerald-500/30 rounded-2xl flex flex-col items-center justify-center text-emerald-500 bg-emerald-500/5 backdrop-blur-sm py-24"
              >
                <Loader2 size={48} className="animate-spin" />
                <p className="mt-6 text-lg font-mono tracking-widest uppercase text-emerald-400">Analyzing Sensor Telemetry...</p>
              </motion.div>
            )}

            {predictionData && !predictMutation.isPending && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Yield Card */}
                <Card className="glass-panel border-emerald-500/30 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-emerald-500">
                    <Leaf size={100} />
                  </div>
                  <CardHeader>
                    <CardDescription className="text-emerald-400 font-bold tracking-widest uppercase text-xs">AI Yield Projection</CardDescription>
                    <CardTitle className="text-5xl font-display text-white mt-2">
                      {predictionData.predictedYield} <span className="text-2xl text-muted-foreground font-sans">{predictionData.unit}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full bg-black/40 rounded-full h-3 mt-4 overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${predictionData.confidence}%` }} transition={{ duration: 1, ease: "easeOut" }}
                        className="bg-emerald-500 h-full rounded-full relative overflow-hidden"
                      >
                         <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] -skew-x-12" />
                      </motion.div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 text-right">{predictionData.confidence}% Confidence Score</p>
                    
                    <div className="mt-6 space-y-3">
                      <h4 className="text-xs uppercase tracking-widest text-emerald-500/80 mb-2">Recommended Actions</h4>
                      {predictionData.recommendedActions.map((action: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-white/90">
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
                    <CardDescription className="text-primary font-bold tracking-widest uppercase text-xs">Trade Strategy</CardDescription>
                    <CardTitle className="text-xl text-white mt-2 leading-relaxed">
                      {predictionData.tradeRecommendation}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 mb-6">
                      <span className="text-xs text-primary/80 uppercase tracking-widest block mb-1">Optimal Target Price</span>
                      <span className="font-mono text-primary font-bold text-3xl">₹{(predictionData.predictedYield * 2450).toLocaleString()}</span>
                    </div>
                    
                    <Button 
                      onClick={() => handleTrade()}
                      disabled={tradeMutation.isPending}
                      className="w-full py-6 text-lg font-bold bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(255,107,26,0.3)] transition-all border-none"
                    >
                      {tradeMutation.isPending ? (
                        <Loader2 className="animate-spin mr-2" />
                      ) : (
                        <Coins className="mr-2" />
                      )}
                      Auto-Execute Trade on ONDC <ArrowRight size={20} className="ml-2" />
                    </Button>
                    <p className="text-[10px] text-center text-muted-foreground mt-3 uppercase tracking-widest">Powered by e-NAM & UPI</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Market Intelligence Table */}
          <Card className="glass-panel border-border/50">
            <CardHeader className="bg-white/5">
              <CardTitle className="text-lg font-display uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={18} className="text-primary" /> Market Intelligence (Live)
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-black/20 font-semibold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Crop</th>
                    <th className="px-6 py-4">Current Price</th>
                    <th className="px-6 py-4">7-Day Forecast</th>
                    <th className="px-6 py-4">Trend</th>
                    <th className="px-6 py-4">Top Mandis</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 font-sans">
                  {marketLoading ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Loading market data...</td></tr>
                  ) : marketData?.crops.map((crop, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{crop.crop}</td>
                      <td className="px-6 py-4 font-mono">₹{crop.currentPrice}</td>
                      <td className="px-6 py-4 font-mono text-muted-foreground">₹{crop.predictedPriceNext7Days}</td>
                      <td className="px-6 py-4">
                        {crop.trend === 'rising' ? <div className="flex items-center text-emerald-500"><TrendingUp size={16} className="mr-1"/> Rising</div> :
                         crop.trend === 'falling' ? <div className="flex items-center text-red-500"><TrendingDown size={16} className="mr-1"/> Falling</div> :
                         <div className="flex items-center text-yellow-500"><Minus size={16} className="mr-1"/> Stable</div>}
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {crop.mandis.slice(0,2).join(', ')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10" onClick={() => handleTrade(crop.crop, crop.currentPrice)}>
                          Trade
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

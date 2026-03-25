import { useState } from "react";
import { useAuthenticateAadhaar, useInitiateUpiPayment, useFetchDigilockerDocs } from "@workspace/api-client-react";
import { Fingerprint, Banknote, FolderLock, ShieldCheck, Loader2, ArrowRight, Terminal, RefreshCcw, CheckCircle2, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { motion } from "framer-motion";

export default function IndiaStack() {
  const { toast } = useToast();
  
  const authMutation = useAuthenticateAadhaar();
  const upiMutation = useInitiateUpiPayment();
  
  const [docQuery, setDocQuery] = useState("");
  const { data: docsData, isLoading: docsLoading, refetch: refetchDocs } = useFetchDigilockerDocs(
    { citizenId: docQuery },
    { query: { enabled: !!docQuery, retry: false } }
  );

  const [bhashiniText, setBhashiniText] = useState("");
  const [bhashiniLang, setBhashiniLang] = useState("hi");
  const [bhashiniResult, setBhashiniResult] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const handleAuth = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    authMutation.mutate({
      data: {
        aadhaarNumber: formData.get("aadhaar") as string,
        otp: formData.get("otp") as string,
        purpose: formData.get("purpose") as string || "KYC_VERIFICATION"
      }
    }, {
      onSuccess: () => toast({ title: "Authentication Success", description: "e-KYC verified securely via UIDAI." })
    });
  };

  const handleUpi = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    upiMutation.mutate({
      data: {
        fromUpiId: formData.get("from") as string,
        toUpiId: formData.get("to") as string,
        amount: parseFloat(formData.get("amount") as string),
        purpose: formData.get("purpose") as string || "AGENT_FEE"
      }
    }, {
      onSuccess: (res) => toast({ title: "UPI Intent Created", description: `Transaction ID: ${res.transactionId}` })
    });
  };

  const handleDocs = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setDocQuery(formData.get("citizenId") as string);
    setTimeout(() => refetchDocs(), 100);
  };

  const handleTranslate = () => {
    if (!bhashiniText) return;
    setIsTranslating(true);
    // Mock translation simulation
    setTimeout(() => {
      const mocks: Record<string, string> = {
        hi: "भारत-ऑटोमेटर में आपका स्वागत है।",
        ta: "भारत-ஆட்டோமேட்டருக்கு வரவேற்கிறோம்.",
        te: "భారత్-ఆటోమేటర్‌కు స్వాగతం.",
        bn: "பாரத்-ஆட்டோமேட்டருக்கு வரவேற்கிறோம்.",
        mr: "भारत-ऑटोमेटर मध्ये आपले स्वागत आहे."
      };
      setBhashiniResult(mocks[bhashiniLang] || `[Translated to ${bhashiniLang}]: ${bhashiniText}`);
      setIsTranslating(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="India Stack API Gateway" 
        description="The foundational digital public infrastructure powering the Agentic Mesh (Identity, Payments, Documents, Language)."
        icon={Fingerprint}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Aadhaar Auth */}
        <Card className="glass-panel border-orange-500/30 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 text-orange-500/10 group-hover:text-orange-500/20 transition-colors pointer-events-none"><Fingerprint size={200}/></div>
          <CardHeader className="border-b border-white/5 bg-white/5 pb-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center border border-orange-500/30">
                  <Fingerprint size={24} />
                </div>
                <div>
                  <CardTitle className="text-xl font-display text-white">Aadhaar API</CardTitle>
                  <CardDescription className="text-orange-200/70">Biometric & OTP e-KYC</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 uppercase tracking-widest text-[10px]">Online</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 relative z-10">
            {authMutation.isSuccess ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-8 text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500 border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <ShieldCheck size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white font-display mb-1">Identity Verified</h3>
                  <p className="text-sm text-muted-foreground">Token generated and securely stored in memory layer.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {authMutation.data?.permissionsGranted.map((p, i) => (
                    <Badge key={i} variant="secondary" className="bg-white/10">{p}</Badge>
                  ))}
                </div>
                <div className="text-xs font-mono text-muted-foreground mt-4">Expires at: {new Date(authMutation.data?.expiresAt || Date.now()).toLocaleString()}</div>
                <Button variant="outline" className="mt-6 border-white/20 text-white w-full" onClick={() => authMutation.reset()}>New Verification</Button>
              </motion.div>
            ) : (
              <form onSubmit={handleAuth} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-orange-200">Aadhaar Number</Label>
                  <Input name="aadhaar" placeholder="XXXX-XXXX-XXXX" defaultValue="4923-8821-9012" className="bg-black/40 border-orange-500/20 text-center font-mono tracking-widest text-lg h-12" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-orange-200">OTP <span className="text-[10px] text-muted-foreground lowercase">(use 123456)</span></Label>
                    <Input name="otp" type="password" maxLength={6} defaultValue="123456" className="bg-black/40 border-orange-500/20 text-center font-mono tracking-widest text-lg h-12" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-orange-200">Purpose</Label>
                    <Select name="purpose" defaultValue="KYC_VERIFICATION">
                      <SelectTrigger className="bg-black/40 border-orange-500/20 h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KYC_VERIFICATION">e-KYC</SelectItem>
                        <SelectItem value="DBT_TRANSFER">DBT Transfer</SelectItem>
                        <SelectItem value="DOCUMENT_SIGN">e-Sign</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full h-14 text-lg bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-[0_0_20px_rgba(249,115,22,0.3)] mt-2" disabled={authMutation.isPending}>
                  {authMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Fingerprint className="mr-2"/>}
                  Authenticate via UIDAI
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* UPI */}
        <Card className="glass-panel border-blue-500/30 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 text-blue-500/10 group-hover:text-blue-500/20 transition-colors pointer-events-none"><Banknote size={200}/></div>
          <CardHeader className="border-b border-white/5 bg-white/5 pb-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center border border-blue-500/30">
                  <Banknote size={24} />
                </div>
                <div>
                  <CardTitle className="text-xl font-display text-white">UPI Gateway</CardTitle>
                  <CardDescription className="text-blue-200/70">Real-time settlement layer</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 uppercase tracking-widest text-[10px]">Online</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 relative z-10">
            {upiMutation.isSuccess ? (
               <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-8 text-center space-y-4">
                 <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto text-blue-400 border border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                   <CheckCircle2 size={40} />
                 </div>
                 <div>
                   <h3 className="text-2xl font-bold text-white font-display mb-1">Intent Dispatched</h3>
                   <p className="text-sm text-muted-foreground">Awaiting user confirmation on UPI app.</p>
                 </div>
                 <div className="bg-black/40 p-4 rounded-xl border border-white/10 font-mono text-sm space-y-2 mt-4">
                   <div className="flex justify-between text-muted-foreground"><span>TXN ID</span><span className="text-white">{upiMutation.data?.transactionId}</span></div>
                   <div className="flex justify-between text-muted-foreground"><span>Status</span><span className="text-blue-400 uppercase">{upiMutation.data?.status}</span></div>
                   {upiMutation.data?.utrNumber && <div className="flex justify-between text-muted-foreground"><span>UTR</span><span className="text-white">{upiMutation.data?.utrNumber}</span></div>}
                 </div>
                 <Button variant="outline" className="mt-6 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 w-full" onClick={() => upiMutation.reset()}>Initiate New Payment</Button>
               </motion.div>
            ) : (
              <form onSubmit={handleUpi} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-blue-200">Sender VPA</Label>
                    <Input name="from" placeholder="sender@upi" defaultValue="citizen@okicici" className="bg-black/40 border-blue-500/20 h-12" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-blue-200">Receiver VPA</Label>
                    <Input name="to" placeholder="receiver@upi" defaultValue="govt.merchant@sbi" className="bg-black/40 border-blue-500/20 h-12" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-blue-200">Amount</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
                      <Input name="amount" type="number" defaultValue="1500" className="bg-black/40 border-blue-500/20 pl-10 font-mono text-xl h-12" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-blue-200">Purpose Note</Label>
                    <Input name="purpose" defaultValue="Agent Fee Settlement" className="bg-black/40 border-blue-500/20 h-12" />
                  </div>
                </div>
                <Button type="submit" className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)] mt-2" disabled={upiMutation.isPending}>
                  {upiMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Banknote className="mr-2"/>}
                  Generate Payment Intent
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* DigiLocker */}
        <Card className="glass-panel border-purple-500/30 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 text-purple-500/10 group-hover:text-purple-500/20 transition-colors pointer-events-none"><FolderLock size={200}/></div>
          <CardHeader className="border-b border-white/5 bg-white/5 pb-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                  <FolderLock size={24} />
                </div>
                <div>
                  <CardTitle className="text-xl font-display text-white">DigiLocker API</CardTitle>
                  <CardDescription className="text-purple-200/70">Verified credential fetching</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 uppercase tracking-widest text-[10px]">Online</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 relative z-10 h-[380px] flex flex-col">
            <form onSubmit={handleDocs} className="flex gap-3 mb-6">
              <div className="flex-1">
                <Input name="citizenId" placeholder="Citizen ID / Aadhaar" defaultValue="DOC-2024-88" className="bg-black/40 border-purple-500/20 h-12 font-mono" required />
              </div>
              <Button type="submit" className="h-12 px-6 bg-purple-600 hover:bg-purple-700 text-white font-bold shrink-0">
                <Search size={18} className="mr-2"/> Fetch Vault
              </Button>
            </form>

            <div className="flex-1 bg-black/40 rounded-xl border border-white/10 p-4 overflow-y-auto custom-scrollbar">
              {docsLoading && (
                <div className="h-full flex flex-col items-center justify-center text-purple-400 opacity-80">
                  <Loader2 size={32} className="animate-spin mb-4"/> 
                  <span className="font-mono text-sm tracking-widest uppercase">Accessing Secure Vault...</span>
                </div>
              )}
              
              {!docsLoading && !docsData && (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                  <FolderLock size={48} className="mb-4"/>
                  <span className="text-sm">Enter ID to view verified documents</span>
                </div>
              )}
              
              {docsData && (
                <div className="space-y-3">
                  <div className="text-xs text-muted-foreground uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Vault Contents ({docsData.documents.length})</div>
                  {docsData.documents.map((doc: any, i: number) => (
                    <div key={i} className="bg-white/5 hover:bg-white/10 transition-colors p-4 rounded-xl flex items-center justify-between border border-white/5">
                      <div className="flex items-start gap-3">
                        <div className="text-purple-400 mt-1"><ShieldCheck size={18}/></div>
                        <div>
                          <div className="text-sm font-bold text-white mb-1">{doc.docType}</div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{doc.issuedBy}</div>
                          <div className="text-[10px] font-mono text-white/50 mt-1">Issued: {doc.issueDate}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className={doc.verificationStatus === 'verified' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px] uppercase tracking-widest' : 'text-[10px]'}>
                        {doc.verificationStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bhashini */}
        <Card className="glass-panel border-emerald-500/30 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors pointer-events-none"><Terminal size={200}/></div>
          <CardHeader className="border-b border-white/5 bg-white/5 pb-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/30">
                  <Terminal size={24} />
                </div>
                <div>
                  <CardTitle className="text-xl font-display text-white">Bhashini NLP</CardTitle>
                  <CardDescription className="text-emerald-200/70">Real-time Indian language translation</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 uppercase tracking-widest text-[10px]">Mocked Demo</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 relative z-10 h-[380px] flex flex-col space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <Label className="text-emerald-200 text-xs uppercase tracking-widest">Input Text (English)</Label>
                <Input 
                  value={bhashiniText} 
                  onChange={(e) => setBhashiniText(e.target.value)} 
                  placeholder="Type something..." 
                  className="bg-black/40 border-emerald-500/20 h-12" 
                />
              </div>
              <div className="w-40 space-y-2">
                <Label className="text-emerald-200 text-xs uppercase tracking-widest">Target</Label>
                <Select value={bhashiniLang} onValueChange={setBhashiniLang}>
                  <SelectTrigger className="bg-black/40 border-emerald-500/20 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hi">Hindi (हिंदी)</SelectItem>
                    <SelectItem value="ta">Tamil (தமிழ்)</SelectItem>
                    <SelectItem value="te">Telugu (తెలుగు)</SelectItem>
                    <SelectItem value="bn">Bengali (বাংলা)</SelectItem>
                    <SelectItem value="mr">Marathi (मराठी)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2">
               <Button onClick={() => setBhashiniText("Welcome to Bharat-Automator.")} variant="outline" size="sm" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs">Demo Phrase</Button>
               <Button onClick={handleTranslate} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold" disabled={!bhashiniText || isTranslating}>
                 {isTranslating ? <Loader2 size={16} className="animate-spin mr-2"/> : <RefreshCcw size={16} className="mr-2"/>} Translate
               </Button>
            </div>

            <div className="flex-1 bg-black/40 rounded-xl border border-white/10 p-5 mt-2 flex items-center justify-center relative">
               <div className="absolute top-3 left-4 text-[10px] text-muted-foreground uppercase tracking-widest">Output</div>
               {isTranslating ? (
                 <div className="flex items-center gap-2 text-emerald-500 opacity-70">
                   <div className="flex space-x-1">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                   </div>
                 </div>
               ) : bhashiniResult ? (
                 <p className="text-2xl text-center text-white font-medium leading-relaxed">{bhashiniResult}</p>
               ) : (
                 <p className="text-muted-foreground text-sm">Awaiting input text</p>
               )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

import { useState } from "react";
import { useAuthenticateAadhaar, useInitiateUpiPayment, useFetchDigilockerDocs } from "@workspace/api-client-react";
import { Fingerprint, Banknote, FolderLock, ShieldCheck, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/PageHeader";

export default function IndiaStack() {
  const { toast } = useToast();
  
  const authMutation = useAuthenticateAadhaar();
  const upiMutation = useInitiateUpiPayment();
  
  const [docQuery, setDocQuery] = useState("");
  const { data: docsData, isLoading: docsLoading } = useFetchDigilockerDocs(
    { citizenId: docQuery },
    { query: { enabled: !!docQuery, retry: false } }
  );

  const handleAuth = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    authMutation.mutate({
      data: {
        aadhaarNumber: formData.get("aadhaar") as string,
        otp: formData.get("otp") as string,
        purpose: "KYC_VERIFICATION"
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
        purpose: "AGENT_FEE"
      }
    }, {
      onSuccess: (res) => toast({ title: "UPI Intent Created", description: `Transaction ID: ${res.transactionId}` })
    });
  };

  const handleDocs = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setDocQuery(formData.get("citizenId") as string);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="India Stack Integration" 
        description="The foundational API infrastructure powering the Agentic Mesh (Identity, Payments, Documents)."
        icon={Fingerprint}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Aadhaar Auth */}
        <Card className="glass-panel border-orange-500/30">
          <CardHeader className="border-b border-border/50 bg-black/20 pb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center mb-3">
              <Fingerprint size={24} />
            </div>
            <CardTitle className="text-xl font-display">Aadhaar Auth</CardTitle>
            <CardDescription>e-KYC & Consent Layer</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {authMutation.isSuccess ? (
              <div className="p-6 text-center space-y-3">
                <ShieldCheck size={48} className="mx-auto text-emerald-500" />
                <h3 className="text-lg font-bold text-white">Identity Verified</h3>
                <p className="text-sm text-muted-foreground">Token generated and securely stored in memory layer.</p>
                <Button variant="outline" className="mt-4" onClick={() => authMutation.reset()}>Reset</Button>
              </div>
            ) : (
              <form onSubmit={handleAuth} className="space-y-4">
                <Input name="aadhaar" placeholder="12-Digit Aadhaar No." className="bg-black/20 text-center font-mono tracking-widest text-lg" required />
                <Input name="otp" placeholder="6-Digit OTP" type="password" maxLength={6} className="bg-black/20 text-center font-mono tracking-widest text-lg" required />
                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={authMutation.isPending}>
                  {authMutation.isPending ? <Loader2 className="animate-spin" /> : "Authenticate"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* UPI */}
        <Card className="glass-panel border-blue-500/30">
          <CardHeader className="border-b border-border/50 bg-black/20 pb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center mb-3">
              <Banknote size={24} />
            </div>
            <CardTitle className="text-xl font-display">UPI Intent</CardTitle>
            <CardDescription>Real-time settlement layer</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {upiMutation.isSuccess ? (
               <div className="p-6 text-center space-y-3">
                 <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto text-white">
                   <Banknote size={28} />
                 </div>
                 <h3 className="text-lg font-bold text-white">Intent Dispatched</h3>
                 <p className="text-sm text-muted-foreground font-mono bg-black/30 p-2 rounded">TXN: {upiMutation.data?.transactionId}</p>
                 <Button variant="outline" className="mt-4 border-blue-500/30 text-blue-400" onClick={() => upiMutation.reset()}>New Payment</Button>
               </div>
            ) : (
              <form onSubmit={handleUpi} className="space-y-4">
                <Input name="from" placeholder="Sender UPI ID" defaultValue="citizen@okicici" className="bg-black/20" required />
                <Input name="to" placeholder="Receiver UPI ID" defaultValue="govt.merchant@sbi" className="bg-black/20" required />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input name="amount" type="number" placeholder="0.00" className="bg-black/20 pl-8 font-mono text-lg" required />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={upiMutation.isPending}>
                  {upiMutation.isPending ? <Loader2 className="animate-spin" /> : "Initiate Request"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* DigiLocker */}
        <Card className="glass-panel border-purple-500/30 flex flex-col">
          <CardHeader className="border-b border-border/50 bg-black/20 pb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
              <FolderLock size={24} />
            </div>
            <CardTitle className="text-xl font-display">DigiLocker API</CardTitle>
            <CardDescription>Verified credential fetching</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex-1 flex flex-col">
            <form onSubmit={handleDocs} className="flex gap-2 mb-6">
              <Input name="citizenId" placeholder="Aadhaar / Doc ID" defaultValue="DOC-2024-88" className="bg-black/20" required />
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white shrink-0">Fetch</Button>
            </form>

            <div className="flex-1 bg-black/30 rounded-xl border border-border/50 p-2 overflow-y-auto max-h-[200px]">
              {docsLoading && <div className="p-4 text-center text-muted-foreground text-sm flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin"/> Connecting...</div>}
              {!docsLoading && !docsData && <div className="p-4 text-center text-muted-foreground text-xs">Enter ID to view vault contents</div>}
              {docsData && (
                <div className="space-y-2">
                  {docsData.documents.map((doc: any, i: number) => (
                    <div key={i} className="bg-black/40 p-3 rounded-lg flex items-center justify-between border border-white/5">
                      <div>
                        <div className="text-sm font-semibold text-white/90">{doc.docType}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{doc.issuedBy}</div>
                      </div>
                      <Badge variant="outline" className={doc.verificationStatus === 'verified' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px]' : 'text-[10px]'}>
                        {doc.verificationStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

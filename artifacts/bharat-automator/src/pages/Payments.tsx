import { useState, useCallback } from "react";
import { CreditCard, IndianRupee, CheckCircle2, XCircle, Loader2, ShieldCheck, Zap, Smartphone, Building2, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { motion } from "framer-motion";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open(): void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface PaymentStatus {
  state: "idle" | "creating" | "processing" | "success" | "failed";
  paymentId?: string;
  orderId?: string;
  error?: string;
}

const PRESET_PLANS = [
  { label: "Starter Agent", amount: 499, description: "1 AI agent, 500 tasks/month", icon: Zap },
  { label: "Pro Mesh", amount: 1999, description: "10 agents, unlimited tasks", icon: Smartphone },
  { label: "Enterprise OS", amount: 9999, description: "Full Bharat-OS stack + support", icon: Building2 },
];

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Payments() {
  const { toast } = useToast();
  const [status, setStatus] = useState<PaymentStatus>({ state: "idle" });
  const [customAmount, setCustomAmount] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

  const initiatePayment = useCallback(async (amountInRupees: number, planLabel: string) => {
    setStatus({ state: "creating" });

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setStatus({ state: "failed", error: "Failed to load payment gateway. Check your internet connection." });
      return;
    }

    try {
      const orderRes = await fetch(`${BASE}/api/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInRupees * 100, currency: "INR", receipt: `rcpt_${planLabel.replace(/\s+/g, "_")}_${Date.now()}` }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json() as { error?: string };
        throw new Error(err.error ?? "Failed to create payment order");
      }

      const order = await orderRes.json() as { orderId: string; amount: number; currency: string; keyId: string };
      setStatus({ state: "processing" });

      const options: RazorpayOptions = {
        key: order.keyId,
        amount: order.amount as number,
        currency: order.currency,
        name: "Bharat-Automator OS",
        description: planLabel,
        order_id: order.orderId,
        prefill: { name, email, contact: phone },
        theme: { color: "#6366f1" },
        modal: {
          ondismiss: () => {
            setStatus({ state: "idle" });
            toast({ title: "Payment cancelled", description: "You closed the payment window." });
          },
        },
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await fetch(`${BASE}/api/payments/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const result = await verifyRes.json() as { success: boolean; paymentId?: string; orderId?: string; error?: string };
            if (result.success) {
              setStatus({ state: "success", paymentId: result.paymentId, orderId: result.orderId });
              toast({ title: "Payment Successful!", description: `Payment ID: ${result.paymentId}` });
            } else {
              setStatus({ state: "failed", error: result.error ?? "Payment verification failed" });
              toast({ title: "Verification Failed", description: result.error, variant: "destructive" });
            }
          } catch {
            setStatus({ state: "failed", error: "Could not verify payment" });
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment failed";
      setStatus({ state: "failed", error: message });
      toast({ title: "Payment Error", description: message, variant: "destructive" });
    }
  }, [name, email, phone, BASE, toast]);

  const handleCustomPayment = () => {
    const amount = parseFloat(customAmount);
    if (!customAmount || isNaN(amount) || amount < 1) {
      toast({ title: "Invalid amount", description: "Please enter a valid amount in ₹.", variant: "destructive" });
      return;
    }
    initiatePayment(amount, "Custom Payment");
  };

  const isLoading = status.state === "creating" || status.state === "processing";

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <PageHeader
        icon={CreditCard}
        title="Payment Processing"
        description="Secure payments powered by Razorpay — supports UPI, cards, net banking & wallets"
        badge="Razorpay"
        badgeVariant="default"
      />

      {status.state === "success" && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={24} />
                <div>
                  <p className="font-semibold text-emerald-400 text-lg">Payment Successful!</p>
                  <p className="text-sm text-muted-foreground mt-1">Your payment has been verified and processed.</p>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-mono text-muted-foreground">Payment ID: <span className="text-white">{status.paymentId}</span></p>
                    <p className="text-xs font-mono text-muted-foreground">Order ID: <span className="text-white">{status.orderId}</span></p>
                  </div>
                  <Button size="sm" variant="outline" className="mt-4 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                    onClick={() => setStatus({ state: "idle" })}>
                    Make Another Payment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {status.state === "failed" && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-red-500/30 bg-red-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <XCircle className="text-red-400 shrink-0 mt-0.5" size={24} />
                <div>
                  <p className="font-semibold text-red-400">Payment Failed</p>
                  <p className="text-sm text-muted-foreground mt-1">{status.error}</p>
                  <Button size="sm" variant="outline" className="mt-4 border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={() => setStatus({ state: "idle" })}>
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {PRESET_PLANS.map((plan, i) => {
          const Icon = plan.icon;
          const isSelected = selectedPlan === i;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card
                className={`cursor-pointer transition-all duration-200 hover:border-primary/40 ${isSelected ? "border-primary/60 bg-primary/5" : "border-border/50"}`}
                onClick={() => setSelectedPlan(i)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Icon size={16} className="text-primary" />
                    </div>
                    {isSelected && <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30">Selected</Badge>}
                  </div>
                  <CardTitle className="text-base font-semibold mt-2">{plan.label}</CardTitle>
                  <CardDescription className="text-xs">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-1 mb-4">
                    <IndianRupee size={16} className="text-primary mt-1" />
                    <span className="text-2xl font-bold text-white">{plan.amount.toLocaleString("en-IN")}</span>
                    <span className="text-xs text-muted-foreground">/month</span>
                  </div>
                  <Button
                    className="w-full"
                    size="sm"
                    disabled={isLoading}
                    onClick={(e) => { e.stopPropagation(); initiatePayment(plan.amount, plan.label); }}
                  >
                    {isLoading && selectedPlan === i ? (
                      <><Loader2 size={14} className="animate-spin mr-2" />Processing…</>
                    ) : (
                      <>Pay ₹{plan.amount.toLocaleString("en-IN")}</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet size={16} className="text-primary" /> Custom Amount
            </CardTitle>
            <CardDescription className="text-xs">Enter a specific amount for one-time payments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Amount (₹)</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="pl-8"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    min="1"
                  />
                </div>
                <Button onClick={handleCustomPayment} disabled={isLoading}>
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : "Pay"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary" /> Prefill Details
            </CardTitle>
            <CardDescription className="text-xs">Optionally pre-fill customer info in the checkout</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Name</Label>
              <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Email</Label>
              <Input type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Phone</Label>
              <Input type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/30 bg-black/20">
        <CardContent className="pt-5">
          <div className="flex flex-wrap gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>256-bit SSL encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-yellow-500" />
              <span>UPI, Cards, Net Banking, Wallets</span>
            </div>
            <div className="flex items-center gap-2">
              <IndianRupee size={14} className="text-primary" />
              <span>INR payments — RBI compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone size={14} className="text-blue-400" />
              <span>Instant payment confirmation</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

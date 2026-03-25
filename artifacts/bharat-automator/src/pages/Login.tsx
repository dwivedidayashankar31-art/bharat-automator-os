import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, ArrowRight, Loader2, ShieldCheck, ChevronLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = "aadhaar" | "otp" | "success";

export default function Login() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("aadhaar");
  const [aadhaar, setAadhaar] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const formatAadhaar = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 12);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAadhaar(formatAadhaar(e.target.value));
    setError("");
  };

  const handleSendOtp = async () => {
    const digits = aadhaar.replace(/\s/g, "");
    if (digits.length !== 12) {
      setError("Valid 12-digit Aadhaar number enter karein");
      return;
    }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setIsLoading(false);
    setStep("otp");
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError("");
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (otp.join("").length !== 6) {
      setError("6-digit OTP enter karein");
      return;
    }
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsLoading(false);
    setStep("success");
    setTimeout(() => navigate("/app"), 1500);
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-foreground flex overflow-hidden selection:bg-primary/30">
      <div className="fixed inset-0 bg-mesh opacity-40 pointer-events-none" />

      {/* Left Panel — Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 relative z-10 border-r border-white/5">
        <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer w-fit">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-10 h-10 rounded-xl" />
            <span className="font-display font-bold text-2xl tracking-widest text-white">
              BHARAT<span className="text-primary">OS</span>
            </span>
          </div>
        </Link>

        <div className="space-y-10 relative z-10">
          <div>
            <h1 className="text-5xl font-display font-bold text-white leading-tight mb-4">
              India ki Digital <br />
              <span className="text-gradient">Nervous System</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Aadhaar-verified identity se 1.4 billion citizens ki autonomy — ek login se.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", title: "End-to-End Encrypted", desc: "AES-256 encryption + UIDAI compliance" },
              { icon: Fingerprint, color: "text-primary", bg: "bg-primary/10 border-primary/20", title: "UIDAI Certified Auth", desc: "Direct integration with Aadhaar OTP API" },
              { icon: CheckCircle2, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", title: "Zero Data Storage", desc: "Auth token ephemeral — never persisted" },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${item.bg}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.bg} shrink-0`}>
                  <item.icon size={20} className={item.color} />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{item.title}</div>
                  <div className="text-muted-foreground text-xs">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">© 2026 BharatOS • UIDAI Compliant • MeitY Registered</p>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm mb-10 lg:hidden">
            <ChevronLeft size={16} /> Back to Home
          </Link>

          <AnimatePresence mode="wait">
            {step === "aadhaar" && (
              <motion.div key="aadhaar" variants={itemVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-6">
                    <Fingerprint size={12} /> Aadhaar OTP Login
                  </div>
                  <h2 className="text-4xl font-display font-bold text-white mb-2">Swagat Hai</h2>
                  <p className="text-muted-foreground">Apna Aadhaar number daalein — UIDAI ke through OTP aayega.</p>
                </div>

                <div className="glass-panel p-8 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-white/80 text-sm font-medium">Aadhaar Number</Label>
                    <Input
                      value={aadhaar}
                      onChange={handleAadhaarChange}
                      placeholder="XXXX XXXX XXXX"
                      className="bg-black/30 border-white/10 text-white text-xl font-mono tracking-[0.3em] h-14 text-center placeholder:tracking-widest placeholder:text-white/20 focus-visible:ring-primary focus-visible:border-primary"
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Aapka Aadhaar number kabhi store nahi hota
                    </p>
                  </div>

                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm text-center">
                      {error}
                    </motion.p>
                  )}

                  <Button
                    onClick={handleSendOtp}
                    disabled={isLoading}
                    className="w-full h-13 text-base font-bold bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(255,107,26,0.3)]"
                  >
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> OTP Bhej Raha Hai...</>
                    ) : (
                      <>OTP Bhejo <ArrowRight size={18} className="ml-2" /></>
                    )}
                  </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Koi account nahi?{" "}
                  <Link href="/app" className="text-primary hover:underline font-semibold">Demo Mode mein jaao</Link>
                </p>
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div key="otp" variants={itemVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                <div>
                  <button onClick={() => setStep("aadhaar")} className="inline-flex items-center gap-1 text-muted-foreground hover:text-white transition-colors text-sm mb-6">
                    <ChevronLeft size={16} /> Wapas Jao
                  </button>
                  <h2 className="text-4xl font-display font-bold text-white mb-2">OTP Enter Karein</h2>
                  <p className="text-muted-foreground">
                    6-digit OTP aapke Aadhaar-linked mobile <span className="text-white font-mono">+91 ****{aadhaar.replace(/\s/g, "").slice(-4)}</span> par bheja gaya.
                  </p>
                </div>

                <div className="glass-panel p-8 space-y-6">
                  <div className="flex gap-3 justify-center">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => otpRefs.current[i] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className="w-12 h-14 text-center text-2xl font-mono font-bold bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>

                  {error && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm text-center">
                      {error}
                    </motion.p>
                  )}

                  <Button
                    onClick={handleVerify}
                    disabled={isLoading || otp.join("").length !== 6}
                    className="w-full h-13 text-base font-bold bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(255,107,26,0.3)] disabled:opacity-40"
                  >
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verify Ho Raha Hai...</>
                    ) : (
                      <>Verify aur Login <ArrowRight size={18} className="ml-2" /></>
                    )}
                  </Button>

                  <button className="w-full text-sm text-muted-foreground hover:text-primary transition-colors text-center">
                    OTP nahi aaya? <span className="text-primary font-semibold underline">Dobara Bhejo</span>
                  </button>
                </div>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div key="success" variants={itemVariants} initial="hidden" animate="visible" className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.3)]"
                >
                  <CheckCircle2 size={48} className="text-emerald-400" />
                </motion.div>
                <h2 className="text-3xl font-display font-bold text-white">Verify Ho Gaya!</h2>
                <p className="text-muted-foreground">Command Center mein redirect ho raha hai...</p>
                <div className="flex justify-center gap-1 mt-4">
                  {[0,1,2].map(i => (
                    <motion.div key={i} className="w-2 h-2 bg-primary rounded-full"
                      animate={{ y: [-4, 0, -4] }} transition={{ delay: i * 0.2, repeat: Infinity, duration: 0.8 }} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

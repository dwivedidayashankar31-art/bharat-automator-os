import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Fingerprint, Loader2, ShieldCheck, CheckCircle2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@workspace/replit-auth-web";

export default function Login() {
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading, login } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/app");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
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
              Secure authentication se 1.4 billion citizens ki autonomy — ek login se.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", title: "End-to-End Encrypted", desc: "AES-256 encryption with PKCE OAuth 2.0" },
              { icon: Fingerprint, color: "text-primary", bg: "bg-primary/10 border-primary/20", title: "Verified Identity", desc: "Secure OIDC authentication protocol" },
              { icon: CheckCircle2, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", title: "Session Security", desc: "HttpOnly cookies — XSS safe" },
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

        <p className="text-xs text-muted-foreground">© 2026 BharatOS • Secure Authentication • Enterprise Grade</p>
      </div>

      {/* Right Panel — Auth */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-6">
                <Fingerprint size={12} /> Secure Login
              </div>
              <h2 className="text-4xl font-display font-bold text-white mb-2">Swagat Hai</h2>
              <p className="text-muted-foreground">
                BharatOS Command Center access karein — secure authentication ke through.
              </p>
            </div>

            <div className="glass-panel p-8 space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Apne account se securely login karein
                    </p>
                  </div>

                  <Button
                    onClick={login}
                    className="w-full h-13 text-base font-bold bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(255,107,26,0.3)]"
                  >
                    <LogIn size={18} className="mr-2" />
                    Log In
                  </Button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-xs text-muted-foreground">ya</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  <Link href="/app">
                    <Button
                      variant="outline"
                      className="w-full h-11 text-sm border-white/10 text-muted-foreground hover:text-white hover:bg-white/5"
                    >
                      Demo Mode mein jaao
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Login karne se aap BharatOS ke Terms of Service aur Privacy Policy se agree karte hain.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

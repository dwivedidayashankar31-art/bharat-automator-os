import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Terminal, Fingerprint, ShieldCheck, HeartPulse, Building2, CheckCircle2, Leaf, Briefcase, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

export default function Landing() {
  const [mobileNav, setMobileNav] = useState(false);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-foreground font-sans overflow-x-hidden selection:bg-primary/30">
      <div className="fixed inset-0 bg-mesh opacity-40 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-10 h-10 rounded-xl" />
          <span className="font-display font-semibold text-[22px] text-white" style={{ letterSpacing: '0.05em' }}>
            Bharat<span className="text-primary">OS</span>
          </span>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { label: "Features", id: "features" },
            { label: "India Stack", id: "indiastack" },
            { label: "Pricing", id: "pricing" },
            { label: "Reviews", id: "testimonials" },
          ].map(link => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3 items-center">
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:bg-white/10 hidden sm:inline-flex border border-white/10">Sign In</Button>
          </Link>
          <Link href="/app">
            <Button className="bg-primary hover:bg-primary/90 text-white font-bold tracking-wide shadow-[0_0_20px_rgba(255,107,26,0.3)]">
              Launch Console <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
          <button className="md:hidden p-2 text-white" onClick={() => setMobileNav(!mobileNav)}>
            {mobileNav ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav Dropdown */}
      {mobileNav && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative z-40 bg-black/90 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex flex-col gap-2 md:hidden">
          {[
            { label: "Features", id: "features" },
            { label: "India Stack", id: "indiastack" },
            { label: "Pricing", id: "pricing" },
            { label: "Reviews", id: "testimonials" },
          ].map(link => (
            <button key={link.id} onClick={() => { scrollTo(link.id); setMobileNav(false); }}
              className="text-left text-base text-white/80 hover:text-white py-2 border-b border-white/5 last:border-0">
              {link.label}
            </button>
          ))}
          <Link href="/login" onClick={() => setMobileNav(false)}>
            <button className="text-left text-base text-primary font-semibold py-2">Sign In with Aadhaar</button>
          </Link>
        </motion.div>
      )}

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6 max-w-5xl mx-auto text-center">
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold tracking-wide mb-8 shadow-[0_0_20px_rgba(255,107,26,0.2)]">
            <ShieldCheck size={16} />
            Powered by India Stack • LangGraph • CrewAI
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl sm:text-7xl font-display font-semibold text-white leading-[1.08] mb-6" style={{ letterSpacing: '-0.03em' }}>
            The Execution Engine <br className="hidden sm:block"/>
            <span className="text-gradient">for Bharat</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10" style={{ lineHeight: '1.7' }}>
            India's first Unified Agentic Mesh. 1.4 billion citizens. Zero bureaucracy. Autonomous AI agents seamlessly integrated with Aadhaar, UPI, and DigiLocker.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/app">
              <Button size="lg" className="w-full sm:w-auto h-13 px-8 text-[15px] bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-[0_0_30px_rgba(255,107,26,0.4)] tracking-[-0.01em]">
                Launch Command Center <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Link href="/app/architecture">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-13 px-8 text-[15px] border-white/20 text-white hover:bg-white/10 rounded-xl font-medium tracking-[-0.01em]">
                <Terminal size={18} className="mr-2" /> View Architecture
              </Button>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants} className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 border-y border-white/10 py-8">
            {[
              { label: "Tasks Executed", value: "3,476+" },
              { label: "Indian Languages", value: "22" },
              { label: "Digital Twins", value: "1.4M" },
              { label: "Sector Agents", value: "4" }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <span className="text-3xl sm:text-4xl font-display font-semibold text-white" style={{ letterSpacing: '-0.03em' }}>{stat.value}</span>
                <span className="text-[11px] sm:text-xs text-muted-foreground uppercase tracking-[0.1em] font-medium">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Sections */}
      <section id="features" className="py-24 relative z-10">
        <div className="max-w-6xl mx-auto px-6 space-y-32">
          {/* Agriculture */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <Leaf size={32} />
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-semibold text-white" style={{ letterSpacing: '-0.025em' }}>KrishiBot Alpha — Your AI Mandi</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Autonomous IoT yield prediction combined with smart contract trade execution across ONDC and e-NAM. Secures the best prices for farmers with zero intermediaries.
              </p>
            </div>
            <div className="flex-1 w-full glass-panel p-6 border-emerald-500/30">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <span className="text-white">Yield Prediction: Wheat</span>
                  <span className="text-emerald-400 font-mono font-bold">2.4 Tonnes</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <span className="text-white">ONDC Trade Executed</span>
                  <span className="text-emerald-400 font-mono font-bold">₹58,800</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-emerald-500 font-semibold">
                  <CheckCircle2 size={16} /> Payment settled via UPI instantly
                </div>
              </div>
            </div>
          </div>

          {/* Finance */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                <Briefcase size={32} />
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-semibold text-white" style={{ letterSpacing: '-0.025em' }}>TaxBot Prime — Zero-Effort Compliance</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Single-click GSTR-3B and ITR filing. The agent fetches invoices, calculates liability, and autonomously bids on global freelance platforms to boost citizen income.
              </p>
            </div>
            <div className="flex-1 w-full glass-panel p-6 border-blue-500/30">
              <div className="space-y-4">
                 <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                   <div className="text-xs text-blue-300 uppercase tracking-widest mb-1">Status</div>
                   <div className="text-xl font-display font-bold text-white">GSTR-3B Filed Successfully</div>
                   <div className="text-sm font-mono text-muted-foreground mt-2">REF: 27AADCB2230M1Z2</div>
                 </div>
                 <div className="flex items-center gap-2 text-sm text-blue-400 font-semibold">
                  <CheckCircle2 size={16} /> 4 Freelance Bids placed on Upwork
                </div>
              </div>
            </div>
          </div>

          {/* Healthcare */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <HeartPulse size={32} />
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-semibold text-white" style={{ letterSpacing: '-0.025em' }}>ArogyaBot — Emergency in 60 Seconds</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Direct integration with ABDM (Ayushman Bharat). Fetches patient digital twins instantly and autonomously dispatches emergency services with zero latency.
              </p>
            </div>
            <div className="flex-1 w-full glass-panel p-6 border-red-500/30">
              <div className="text-center p-6 bg-red-500/10 border border-red-500/30 rounded-xl mb-4">
                <div className="text-5xl font-display font-bold text-red-500 mb-2">7 MIN</div>
                <div className="text-sm text-red-300 tracking-widest uppercase">Ambulance ETA</div>
              </div>
              <div className="flex items-center gap-2 text-sm text-red-400 font-semibold">
                <CheckCircle2 size={16} /> Medical history transmitted to ER
              </div>
            </div>
          </div>

          {/* Governance */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                <Building2 size={32} />
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-semibold text-white" style={{ letterSpacing: '-0.025em' }}>SarkarBot — Zero Bureaucracy</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Matches citizens with 1,200+ government schemes instantly. Auto-fetches required documents from DigiLocker and applies on their behalf.
              </p>
            </div>
            <div className="flex-1 w-full glass-panel p-6 border-purple-500/30">
              <div className="space-y-4">
                 <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                   <div className="text-xs text-purple-300 uppercase tracking-widest mb-1">Eligible Benefits Found</div>
                   <div className="text-3xl font-display font-bold text-white">₹1,50,000</div>
                 </div>
                 <Button className="w-full bg-white hover:bg-white/90 text-black font-bold">Auto-Apply to All</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* India Stack Section */}
      <section id="indiastack" className="py-24 bg-black/40 border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-semibold text-white mb-4" style={{ letterSpacing: '-0.02em' }}>Deep India Stack Integration</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Native connections to India's core digital public infrastructure.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Aadhaar", desc: "Biometric & OTP e-KYC layer for instant identity verification.", icon: Fingerprint, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
              { title: "UPI", desc: "Real-time settlement for trade execution and agent fees.", icon: ArrowRight, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
              { title: "DigiLocker", desc: "Zero-document applications with verified credential fetching.", icon: ShieldCheck, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
              { title: "Bhashini", desc: "Native language support across 22 Indian languages.", icon: Terminal, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
            ].map((stack, i) => (
              <div key={i} className="glass-panel p-6 hover:-translate-y-2 transition-transform duration-300">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stack.bg} ${stack.color} border ${stack.border}`}>
                  <stack.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{stack.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{stack.desc}</p>
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold tracking-widest uppercase border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Integrated
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-semibold text-white mb-4" style={{ letterSpacing: '-0.025em' }}>Enterprise-Grade. Citizen-First.</h2>
            <p className="text-xl text-muted-foreground">Accessible pricing for everyone.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 flex flex-col">
              <h3 className="text-2xl font-bold text-white mb-2">Nagarik</h3>
              <p className="text-muted-foreground mb-6">For individual citizens</p>
              <div className="text-5xl font-display font-bold text-white mb-8">₹0<span className="text-lg text-muted-foreground font-sans font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-1 text-sm text-white/80">
                <li className="flex gap-3"><CheckCircle2 className="text-primary shrink-0" size={18} /> Access to 3 sector agents</li>
                <li className="flex gap-3"><CheckCircle2 className="text-primary shrink-0" size={18} /> Basic scheme eligibility</li>
                <li className="flex gap-3"><CheckCircle2 className="text-primary shrink-0" size={18} /> Standard priority processing</li>
              </ul>
              <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20">Get Started</Button>
            </div>
            
            <div className="glass-panel p-8 flex flex-col border-primary/50 relative overflow-hidden transform md:-translate-y-4 shadow-[0_0_40px_rgba(255,107,26,0.15)]">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-orange-400" />
              <div className="absolute top-4 right-4 bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-primary/30">Popular</div>
              <h3 className="text-2xl font-bold text-white mb-2">Udyam</h3>
              <p className="text-muted-foreground mb-6">For enterprises & startups</p>
              <div className="text-5xl font-display font-bold text-white mb-8">₹4,999<span className="text-lg text-muted-foreground font-sans font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-1 text-sm text-white/80">
                <li className="flex gap-3"><CheckCircle2 className="text-primary shrink-0" size={18} /> Unlimited sector agents</li>
                <li className="flex gap-3"><CheckCircle2 className="text-primary shrink-0" size={18} /> Full API & Webhook access</li>
                <li className="flex gap-3"><CheckCircle2 className="text-primary shrink-0" size={18} /> Priority task dispatch</li>
                <li className="flex gap-3"><CheckCircle2 className="text-primary shrink-0" size={18} /> Custom agent deployment</li>
              </ul>
              <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold">Start Free Trial</Button>
            </div>

            <div className="glass-panel p-8 flex flex-col">
              <h3 className="text-2xl font-bold text-white mb-2">Sarkar</h3>
              <p className="text-muted-foreground mb-6">For government bodies</p>
              <div className="text-5xl font-display font-bold text-white mb-8">Custom</div>
              <ul className="space-y-4 mb-8 flex-1 text-sm text-white/80">
                <li className="flex gap-3"><CheckCircle2 className="text-primary shrink-0" size={18} /> White-label portal</li>
                <li className="flex gap-3"><CheckCircle2 className="text-primary shrink-0" size={18} /> District-level deployment</li>
                <li className="flex gap-3"><CheckCircle2 className="text-primary shrink-0" size={18} /> CSC integration</li>
                <li className="flex gap-3"><CheckCircle2 className="text-primary shrink-0" size={18} /> Dedicated orchestrator node</li>
              </ul>
              <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20">Contact Sales</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-black/30 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-display font-semibold text-center text-white mb-16" style={{ letterSpacing: '-0.02em' }}>Stories from Bharat</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                text: "Mere PM-KISAN application 3 mahine se pending tha. SarkarBot ne 4 minute mein submit kiya.",
                author: "Ramesh Kumar",
                role: "Farmer, UP"
              },
              {
                text: "GST filing jo CA ko ₹5000 mein karta tha, TaxBot ne free mein kiya.",
                author: "Priya Sharma",
                role: "Small Business Owner, Mumbai"
              },
              {
                text: "Emergency mein ambulance 7 minute mein aa gayi — ArogyaBot ne khud book kiya.",
                author: "Dr. Amit Singh",
                role: "Healthcare Professional"
              }
            ].map((t, i) => (
              <div key={i} className="glass-panel p-8 flex flex-col justify-between">
                <p className="text-lg text-white/90 italic mb-8">"{t.text}"</p>
                <div>
                  <div className="font-bold text-primary">{t.author}</div>
                  <div className="text-sm text-muted-foreground">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 relative z-10 bg-[#050810]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-xl tracking-widest text-white">
              BHARAT<span className="text-primary">OS</span>
            </span>
          </div>
          <p className="text-muted-foreground text-sm">Made for India's 1.4 Billion</p>
          <div className="flex gap-6 text-sm">
            <Link href="/app" className="text-muted-foreground hover:text-white transition-colors">Command Center</Link>
            <Link href="/app/architecture" className="text-muted-foreground hover:text-white transition-colors">Architecture</Link>
            <a href="#" className="text-muted-foreground hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

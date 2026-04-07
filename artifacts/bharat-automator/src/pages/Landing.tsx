import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight, Terminal, Fingerprint, ShieldCheck, HeartPulse, Building2,
  CheckCircle2, Leaf, Briefcase, Menu, X, Github, Linkedin, Mail,
  Globe, Cloud, Zap, Database, Code2, Smartphone, CreditCard,
  BarChart3, Bot, MapPin, Phone, MessageCircle, Star, Sparkles,
  ChevronRight, ExternalLink, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

export default function Landing() {
  const [mobileNav, setMobileNav] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-foreground font-sans overflow-x-hidden selection:bg-primary/30">
      <div className="fixed inset-0 bg-mesh opacity-40 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/15 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-primary to-emerald-500 rounded-xl opacity-50 blur-md" />
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="relative w-10 h-10 rounded-xl" />
          </div>
          <span className="font-display font-bold text-[22px] text-white" style={{ letterSpacing: '0.05em' }}>
            Bharat<span className="text-primary">OS</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {[
            { label: "Features", id: "features" },
            { label: "Tech Stack", id: "techstack" },
            { label: "India Stack", id: "indiastack" },
            { label: "Pricing", id: "pricing" },
            { label: "Creator", id: "creator" },
          ].map(link => (
            <button key={link.id} onClick={() => scrollTo(link.id)}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-white transition-colors rounded-lg hover:bg-white/5">
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3 items-center">
          <a href="https://github.com/dwivedidayashankar31-art/bharat-automator-os" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex">
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10">
              <Github size={18} />
            </Button>
          </a>
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

      {mobileNav && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="relative z-40 bg-black/90 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex flex-col gap-2 md:hidden">
          {["Features", "Tech Stack", "India Stack", "Pricing", "Creator"].map(label => (
            <button key={label} onClick={() => { scrollTo(label.toLowerCase().replace(" ", "")); setMobileNav(false); }}
              className="text-left text-base text-white/80 hover:text-white py-2 border-b border-white/5 last:border-0">
              {label}
            </button>
          ))}
        </motion.div>
      )}

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-28 px-6 max-w-5xl mx-auto text-center">
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold tracking-wide mb-8 shadow-[0_0_20px_rgba(255,107,26,0.2)]">
            <Sparkles size={16} />
            India's First Unified Agentic Mesh
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl sm:text-7xl font-display font-semibold text-white leading-[1.08] mb-6" style={{ letterSpacing: '-0.03em' }}>
            The Execution Engine <br className="hidden sm:block"/>
            <span className="text-gradient">for Bharat</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10" style={{ lineHeight: '1.7' }}>
            AI-powered operating system that orchestrates specialized agents across Agriculture, Finance, Healthcare & Governance — seamlessly integrated with Aadhaar, UPI, DigiLocker & ABDM.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/app">
              <Button size="lg" className="w-full sm:w-auto h-13 px-8 text-[15px] bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-[0_0_30px_rgba(255,107,26,0.4)] tracking-[-0.01em]">
                Launch Command Center <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <a href="https://github.com/dwivedidayashankar31-art/bharat-automator-os" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-13 px-8 text-[15px] border-white/20 text-white hover:bg-white/10 rounded-xl font-medium tracking-[-0.01em]">
                <Github size={18} className="mr-2" /> View on GitHub
              </Button>
            </a>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 border-y border-white/10 py-8">
            {[
              { label: "Sector Agents", value: "4" },
              { label: "Indian Languages", value: "22" },
              { label: "API Endpoints", value: "20+" },
              { label: "India Stack APIs", value: "5" }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <span className="text-3xl sm:text-4xl font-display font-semibold text-white" style={{ letterSpacing: '-0.03em' }}>{stat.value}</span>
                <span className="text-[11px] sm:text-xs text-muted-foreground uppercase tracking-[0.1em] font-medium">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Platform Features Grid */}
      <section id="features" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-center mb-16">
            <h2 className="text-4xl font-display font-semibold text-white mb-4" style={{ letterSpacing: '-0.025em' }}>
              Everything You Need. <span className="text-primary">One Platform.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              12+ production-ready modules powered by AI agents, real-time data, and India Stack integration.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Activity, title: "Command Center", desc: "Real-time system monitoring with live metrics, health indicators, and agent status tracking.", color: "text-primary", bg: "from-primary/10 to-orange-600/5", border: "border-primary/20", link: "/app" },
              { icon: Bot, title: "AI Assistant", desc: "GPT-powered conversational AI for citizen queries about government schemes and services.", color: "text-violet-400", bg: "from-violet-500/10 to-purple-600/5", border: "border-violet-500/20", link: "/app/ai-assistant" },
              { icon: Zap, title: "Task Automator", desc: "Multi-agent execution engine with real-time logs from Delegator, Scraper, Analyzer agents.", color: "text-yellow-400", bg: "from-yellow-500/10 to-amber-600/5", border: "border-yellow-500/20", link: "/app/task-automator" },
              { icon: BarChart3, title: "Data Science Lab", desc: "Interactive analytics dashboard for processing and visualizing complex data patterns.", color: "text-cyan-400", bg: "from-cyan-500/10 to-blue-600/5", border: "border-cyan-500/20", link: "/app/data-science" },
              { icon: CreditCard, title: "Payment Processing", desc: "Razorpay UPI, Cards, Net Banking — 3-layer security with timing-safe verification.", color: "text-green-400", bg: "from-green-500/10 to-emerald-600/5", border: "border-green-500/20", link: "/app/payments" },
              { icon: Cloud, title: "Weather & Disaster", desc: "Real-time weather for any location worldwide + earthquake monitoring + 7-day forecasts.", color: "text-sky-400", bg: "from-sky-500/10 to-blue-600/5", border: "border-sky-500/20", link: "/app/weather" },
              { icon: Leaf, title: "KrishiBot Agent", desc: "ISRO satellite data + Agmarknet market intelligence + e-NAM trade execution for farmers.", color: "text-emerald-400", bg: "from-emerald-500/10 to-green-600/5", border: "border-emerald-500/20", link: "/app/agriculture" },
              { icon: Briefcase, title: "TaxBot Agent", desc: "Automated GST/ITR filing + freelance platform bidding + financial compliance automation.", color: "text-blue-400", bg: "from-blue-500/10 to-indigo-600/5", border: "border-blue-500/20", link: "/app/finance" },
              { icon: HeartPulse, title: "ArogyaBot Agent", desc: "ABDM/ABHA health records + 108 ambulance dispatch + digital patient management.", color: "text-red-400", bg: "from-red-500/10 to-rose-600/5", border: "border-red-500/20", link: "/app/healthcare" },
              { icon: Building2, title: "SarkarBot Agent", desc: "1200+ government schemes eligibility + auto-apply via DigiLocker + scholarship tracking.", color: "text-purple-400", bg: "from-purple-500/10 to-violet-600/5", border: "border-purple-500/20", link: "/app/governance" },
              { icon: Globe, title: "Architecture Visualizer", desc: "Interactive mesh graph with React Flow showing the full system architecture and agent connections.", color: "text-orange-400", bg: "from-orange-500/10 to-amber-600/5", border: "border-orange-500/20", link: "/app/architecture" },
              { icon: Smartphone, title: "Invoice Generator", desc: "GST-compliant professional invoice generation with HSN codes and export capabilities.", color: "text-teal-400", bg: "from-teal-500/10 to-cyan-600/5", border: "border-teal-500/20", link: "/app/invoices" },
            ].map((feature, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.05 } } }}>
                <Link href={feature.link}>
                  <div className={`group glass-panel p-6 cursor-pointer hover:-translate-y-1 transition-all duration-300 ${feature.border} hover:shadow-lg`}>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.bg} ${feature.color} flex items-center justify-center mb-4 border ${feature.border}`}>
                      <feature.icon size={22} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                      {feature.title}
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section id="techstack" className="py-24 bg-black/40 border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-center mb-16">
            <h2 className="text-4xl font-display font-semibold text-white mb-4" style={{ letterSpacing: '-0.025em' }}>
              Built with <span className="text-primary">Modern Tech</span>
            </h2>
            <p className="text-lg text-muted-foreground">Enterprise-grade technology stack powering the platform.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "React 19", category: "Frontend", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
              { name: "TypeScript", category: "Language", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
              { name: "Vite 7", category: "Build Tool", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
              { name: "Express 5", category: "Backend", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
              { name: "PostgreSQL", category: "Database", color: "text-blue-300", bg: "bg-blue-400/10", border: "border-blue-400/20" },
              { name: "Drizzle ORM", category: "ORM", color: "text-lime-400", bg: "bg-lime-500/10", border: "border-lime-500/20" },
              { name: "Tailwind CSS", category: "Styling", color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" },
              { name: "Framer Motion", category: "Animation", color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
              { name: "Razorpay", category: "Payments", color: "text-blue-500", bg: "bg-blue-600/10", border: "border-blue-600/20" },
              { name: "OpenAI GPT", category: "AI/ML", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
              { name: "React Flow", category: "Graphs", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
              { name: "Shadcn/UI", category: "Components", color: "text-white", bg: "bg-white/5", border: "border-white/10" },
            ].map((tech, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.4, delay: i * 0.04 } } }}
                className={`${tech.bg} border ${tech.border} rounded-xl p-4 text-center hover:scale-105 transition-transform duration-300`}>
                <div className={`text-base font-bold ${tech.color} mb-1`}>{tech.name}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{tech.category}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* India Stack */}
      <section id="indiastack" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-center mb-16">
            <h2 className="text-4xl font-display font-semibold text-white mb-4" style={{ letterSpacing: '-0.025em' }}>
              Deep <span className="text-primary">India Stack</span> Integration
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Native connections to India's core digital public infrastructure — powering 1.4 billion citizens.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Aadhaar", desc: "Biometric & OTP e-KYC for instant identity verification across all services.", icon: Fingerprint, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
              { title: "UPI", desc: "Real-time payment settlement — QR collect, autopay, and instant transfers.", icon: CreditCard, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
              { title: "DigiLocker", desc: "Zero-document applications with verified credential fetching — PAN, Aadhaar, Land Records.", icon: ShieldCheck, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
              { title: "Bhashini", desc: "AI-powered NLP supporting 22 Indian languages — speech-to-text, translation.", icon: Terminal, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
            ].map((stack, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } } }}
                className="glass-panel p-6 hover:-translate-y-2 transition-transform duration-300">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stack.bg} ${stack.color} border ${stack.border}`}>
                  <stack.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{stack.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{stack.desc}</p>
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold tracking-widest uppercase border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Integrated
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-black/40 border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-center mb-16">
            <h2 className="text-4xl font-display font-semibold text-white mb-4" style={{ letterSpacing: '-0.025em' }}>Enterprise-Grade. <span className="text-primary">Citizen-First.</span></h2>
            <p className="text-xl text-muted-foreground">Accessible pricing for everyone — from individual citizens to government bodies.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="glass-panel p-8 flex flex-col">
              <h3 className="text-2xl font-bold text-white mb-2">Nagarik</h3>
              <p className="text-muted-foreground mb-6">For individual citizens</p>
              <div className="text-5xl font-display font-bold text-white mb-8">
                <span className="text-emerald-400">Free</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-sm text-white/80">
                <li className="flex gap-3"><CheckCircle2 className="text-emerald-400 shrink-0" size={18} /> 3 sector agents access</li>
                <li className="flex gap-3"><CheckCircle2 className="text-emerald-400 shrink-0" size={18} /> Basic scheme eligibility</li>
                <li className="flex gap-3"><CheckCircle2 className="text-emerald-400 shrink-0" size={18} /> Weather & disaster alerts</li>
                <li className="flex gap-3"><CheckCircle2 className="text-emerald-400 shrink-0" size={18} /> Community support</li>
              </ul>
              <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20">Get Started Free</Button>
            </div>

            <div className="glass-panel p-8 flex flex-col border-primary/50 relative overflow-hidden transform md:-translate-y-4 shadow-[0_0_40px_rgba(255,107,26,0.15)]">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-orange-400" />
              <div className="absolute top-4 right-4 bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-primary/30">Popular</div>
              <h3 className="text-2xl font-bold text-white mb-2">Udyam</h3>
              <p className="text-muted-foreground mb-6">For enterprises & startups</p>
              <div className="text-5xl font-display font-bold text-white mb-8">
                <span className="text-primary">Custom</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-sm text-white/80">
                <li className="flex gap-3"><CheckCircle2 className="text-primary shrink-0" size={18} /> Unlimited sector agents</li>
                <li className="flex gap-3"><CheckCircle2 className="text-primary shrink-0" size={18} /> Full API & webhook access</li>
                <li className="flex gap-3"><CheckCircle2 className="text-primary shrink-0" size={18} /> Priority task dispatch</li>
                <li className="flex gap-3"><CheckCircle2 className="text-primary shrink-0" size={18} /> Custom agent deployment</li>
                <li className="flex gap-3"><CheckCircle2 className="text-primary shrink-0" size={18} /> Dedicated support</li>
              </ul>
              <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold">Contact Sales</Button>
            </div>

            <div className="glass-panel p-8 flex flex-col">
              <h3 className="text-2xl font-bold text-white mb-2">Sarkar</h3>
              <p className="text-muted-foreground mb-6">For government bodies</p>
              <div className="text-5xl font-display font-bold text-white mb-8">
                <span className="text-purple-400">Custom</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-sm text-white/80">
                <li className="flex gap-3"><CheckCircle2 className="text-purple-400 shrink-0" size={18} /> White-label portal</li>
                <li className="flex gap-3"><CheckCircle2 className="text-purple-400 shrink-0" size={18} /> District-level deployment</li>
                <li className="flex gap-3"><CheckCircle2 className="text-purple-400 shrink-0" size={18} /> CSC integration</li>
                <li className="flex gap-3"><CheckCircle2 className="text-purple-400 shrink-0" size={18} /> Dedicated orchestrator</li>
              </ul>
              <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20">Contact Sales</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="text-center mb-16">
            <h2 className="text-4xl font-display font-semibold text-white mb-4" style={{ letterSpacing: '-0.025em' }}>
              Stories from <span className="text-primary">Bharat</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { text: "Mere PM-KISAN application 3 mahine se pending tha. SarkarBot ne 4 minute mein submit kiya.", author: "Ramesh Kumar", role: "Farmer, Uttar Pradesh", stars: 5 },
              { text: "GST filing jo CA ko Rs.5000 mein karta tha, TaxBot ne free mein kiya. Ab sab automated hai.", author: "Priya Sharma", role: "Small Business Owner, Mumbai", stars: 5 },
              { text: "Emergency mein ambulance 7 minute mein aa gayi — ArogyaBot ne khud book kiya aur medical records share kiye.", author: "Dr. Amit Singh", role: "Healthcare Professional, Delhi", stars: 5 }
            ].map((t, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } } }}
                className="glass-panel p-8 flex flex-col justify-between">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-lg text-white/90 italic mb-8 flex-1">"{t.text}"</p>
                <div>
                  <div className="font-bold text-primary">{t.author}</div>
                  <div className="text-sm text-muted-foreground">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator / Founder Section */}
      <section id="creator" className="py-24 bg-black/40 border-y border-white/5 relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-display font-semibold text-white mb-4" style={{ letterSpacing: '-0.025em' }}>
                Built by <span className="text-primary">Er. Dayashankar Dwivedi</span>
              </h2>
              <p className="text-lg text-muted-foreground">Full-Stack Developer & AI Systems Architect from Madhya Pradesh, India</p>
            </div>

            <div className="glass-panel p-8 md:p-12 border-primary/20">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="shrink-0">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 via-primary to-emerald-500 rounded-full opacity-40 blur-lg animate-pulse" />
                    <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-4xl font-display font-bold text-white shadow-2xl border-2 border-primary/30">
                      DD
                    </div>
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-white mb-2">Er. Dayashankar Dwivedi</h3>
                  <p className="text-primary font-semibold mb-4">Founder & Lead Developer — BharatOS</p>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Passionate about building AI-driven solutions that empower Indian citizens. BharatOS is a vision to create a unified digital operating system that connects every Indian with government services, healthcare, agriculture intelligence, and financial automation — all through intelligent AI agents.
                  </p>

                  <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
                    <a href="mailto:dwivedidayashankar31@gmail.com" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors text-sm font-medium">
                      <Mail size={16} /> Email
                    </a>
                    <a href="tel:+917489655562" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors text-sm font-medium">
                      <Phone size={16} /> +91 74896 55562
                    </a>
                    <a href="https://wa.me/917489655562" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors text-sm font-medium">
                      <MessageCircle size={16} /> WhatsApp
                    </a>
                    <a href="https://www.linkedin.com/in/dayashankar-dwivedi" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-colors text-sm font-medium">
                      <Linkedin size={16} /> LinkedIn
                    </a>
                    <a href="https://github.com/dwivedidayashankar31-art" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors text-sm font-medium">
                      <Github size={16} /> GitHub
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center md:justify-start">
                    <MapPin size={14} className="text-primary" />
                    Panna, Madhya Pradesh, India
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative z-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-orange-500/10 to-emerald-500/20 rounded-3xl blur-xl" />
              <div className="relative glass-panel p-12 md:p-16 border-primary/20 rounded-3xl">
                <h2 className="text-4xl md:text-5xl font-display font-semibold text-white mb-6" style={{ letterSpacing: '-0.03em' }}>
                  Ready to Experience<br /><span className="text-primary">the Future of Bharat?</span>
                </h2>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
                  Join the movement to automate India's public and private sectors with AI-powered agents.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/app">
                    <Button size="lg" className="h-14 px-10 text-base bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-[0_0_30px_rgba(255,107,26,0.4)]">
                      Launch Command Center <ArrowRight size={18} className="ml-2" />
                    </Button>
                  </Link>
                  <a href="https://github.com/dwivedidayashankar31-art/bharat-automator-os" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="outline" className="h-14 px-10 text-base border-white/20 text-white hover:bg-white/10 rounded-xl">
                      <Github size={18} className="mr-2" /> Star on GitHub
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 pt-16 pb-8 relative z-10 bg-[#050810]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-10 h-10 rounded-xl" />
                <span className="font-display font-bold text-2xl text-white" style={{ letterSpacing: '0.05em' }}>
                  Bharat<span className="text-primary">OS</span>
                </span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-md mb-6">
                India's first Unified Agentic Mesh — AI-powered operating system for automating government services, financial compliance, healthcare access, and agricultural intelligence.
              </p>
              <div className="flex gap-3">
                <a href="https://github.com/dwivedidayashankar31-art/bharat-automator-os" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                  <Github size={16} />
                </a>
                <a href="https://www.linkedin.com/in/dayashankar-dwivedi" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                  <Linkedin size={16} />
                </a>
                <a href="mailto:dwivedidayashankar31@gmail.com"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                  <Mail size={16} />
                </a>
                <a href="https://wa.me/917489655562" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                  <MessageCircle size={16} />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Platform</h4>
              <div className="space-y-3">
                {[
                  { label: "Command Center", href: "/app" },
                  { label: "AI Assistant", href: "/app/ai-assistant" },
                  { label: "Weather Analytics", href: "/app/weather" },
                  { label: "Payments", href: "/app/payments" },
                  { label: "Architecture", href: "/app/architecture" },
                ].map(link => (
                  <Link key={link.href} href={link.href}>
                    <div className="text-sm text-muted-foreground hover:text-white transition-colors cursor-pointer">{link.label}</div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Sector Agents</h4>
              <div className="space-y-3">
                {[
                  { label: "KrishiBot — Agriculture", href: "/app/agriculture" },
                  { label: "TaxBot — Finance", href: "/app/finance" },
                  { label: "ArogyaBot — Healthcare", href: "/app/healthcare" },
                  { label: "SarkarBot — Governance", href: "/app/governance" },
                  { label: "Contact & Support", href: "/app/contact" },
                ].map(link => (
                  <Link key={link.href} href={link.href}>
                    <div className="text-sm text-muted-foreground hover:text-white transition-colors cursor-pointer">{link.label}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src="https://img.shields.io/badge/Made_in-Bharat-FF9933?style=flat-square&labelColor=138808" alt="Made in Bharat" className="h-5" />
              <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" className="h-5" />
              <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" className="h-5" />
            </div>
            <p className="text-muted-foreground text-sm">
              Built with passion by <span className="text-primary font-medium">Er. Dayashankar Dwivedi</span> — Panna, MP
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

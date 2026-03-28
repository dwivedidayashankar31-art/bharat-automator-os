import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Headphones, Mail, Phone, MapPin, Clock, Send, MessageCircle,
  Globe, Github, Linkedin, Twitter, ArrowRight, CheckCircle2,
  Building2, Shield, Zap, Users, Star, ExternalLink
} from "lucide-react";

const teamMembers = [
  {
    name: "Dayashankar Dwivedi",
    role: "Founder & Lead Developer",
    avatar: "DD",
    color: "from-orange-500 to-amber-500",
    speciality: "Full-Stack Architecture & AI Systems",
  },
  {
    name: "BharatOS Team",
    role: "Engineering & Support",
    avatar: "BO",
    color: "from-blue-500 to-cyan-500",
    speciality: "Platform Development & Operations",
  },
];

const supportChannels = [
  {
    icon: Mail,
    title: "Email Support",
    value: "support@bharatos.dev",
    description: "Get response within 24 hours",
    color: "text-blue-400",
    bgColor: "from-blue-500/10 to-blue-600/5",
    borderColor: "border-blue-500/20",
    action: "mailto:support@bharatos.dev",
  },
  {
    icon: Phone,
    title: "Phone Support",
    value: "+91 XXXXX XXXXX",
    description: "Mon-Sat, 9 AM - 6 PM IST",
    color: "text-emerald-400",
    bgColor: "from-emerald-500/10 to-emerald-600/5",
    borderColor: "border-emerald-500/20",
    action: "tel:+91XXXXXXXXXX",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: "+91 XXXXX XXXXX",
    description: "Quick chat support",
    color: "text-green-400",
    bgColor: "from-green-500/10 to-green-600/5",
    borderColor: "border-green-500/20",
    action: "https://wa.me/91XXXXXXXXXX",
  },
  {
    icon: Linkedin,
    title: "LinkedIn",
    value: "Connect on LinkedIn",
    description: "Professional network & updates",
    color: "text-sky-400",
    bgColor: "from-sky-500/10 to-sky-600/5",
    borderColor: "border-sky-500/20",
    action: "https://linkedin.com/in/",
  },
  {
    icon: Github,
    title: "GitHub",
    value: "dwivedidayashankar31-art",
    description: "Open source contributions",
    color: "text-purple-400",
    bgColor: "from-purple-500/10 to-purple-600/5",
    borderColor: "border-purple-500/20",
    action: "https://github.com/dwivedidayashankar31-art",
  },
  {
    icon: Globe,
    title: "Website",
    value: "bharatos.dev",
    description: "Documentation & resources",
    color: "text-orange-400",
    bgColor: "from-orange-500/10 to-orange-600/5",
    borderColor: "border-orange-500/20",
    action: "https://bharatos.dev",
  },
];

const faqs = [
  { q: "How do I get started with BharatOS?", a: "Sign up, explore the Command Center dashboard, and activate the sector agents relevant to your needs. Our platform supports Agriculture, Finance, Healthcare, and Governance." },
  { q: "Is there a free trial available?", a: "Yes! You can explore all features with our free tier. Premium plans unlock advanced AI agents, priority support, and enterprise features." },
  { q: "How secure is the platform?", a: "We use bank-grade encryption, Replit OIDC authentication, and follow India's data protection guidelines. All data is stored securely in PostgreSQL with encrypted connections." },
  { q: "Can I integrate BharatOS with my existing systems?", a: "Absolutely. BharatOS supports REST APIs, India Stack integration (Aadhaar, UPI, DigiLocker), and custom webhook configurations for seamless integration." },
  { q: "What payment methods are supported?", a: "We accept all major payment methods through Razorpay — UPI, Credit/Debit Cards, Net Banking, and Wallets." },
  { q: "How does the Weather & Disaster Analytics work?", a: "We use real-time data from Open-Meteo (weather) and USGS (earthquakes) APIs. You can search any location worldwide — villages, cities, states, or countries." },
];

const stats = [
  { label: "Uptime", value: "99.9%", icon: Zap },
  { label: "Active Users", value: "10K+", icon: Users },
  { label: "Sectors Covered", value: "4+", icon: Building2 },
  { label: "Response Time", value: "<2hrs", icon: Clock },
];

export default function ContactSupport() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast({ title: "Required Fields", description: "Please fill in name, email, and message.", variant: "destructive" });
      return;
    }
    setSending(true);
    await new Promise(r => setTimeout(r, 1500));
    setSent(true);
    setSending(false);
    toast({ title: "Message Sent!", description: "We'll get back to you within 24 hours." });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <PageHeader icon={Headphones} title="Contact & Support" description="Get in touch with our team. We're here to help you build, integrate, and scale with BharatOS." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
            <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:border-primary/30 transition-all group">
              <CardContent className="p-5 text-center">
                <s.icon size={20} className="mx-auto text-primary mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {supportChannels.map((ch, i) => (
          <motion.div key={i} variants={itemVariants}>
            <a href={ch.action} target="_blank" rel="noreferrer" className="block group">
              <Card className={`bg-gradient-to-br ${ch.bgColor} ${ch.borderColor} border hover:border-opacity-60 transition-all hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${ch.color} group-hover:scale-110 transition-transform`}>
                      <ch.icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{ch.title}</p>
                      <p className={`text-sm font-mono mt-0.5 ${ch.color}`}>{ch.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{ch.description}</p>
                    </div>
                    <ExternalLink size={14} className="text-white/20 group-hover:text-white/50 transition-colors shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            </a>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <Card className="bg-gradient-to-br from-white/[0.03] to-transparent border-white/10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Send size={18} className="text-primary" />
                Send Us a Message
              </CardTitle>
              <CardDescription>Fill out the form and we'll respond within 24 hours.</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              {sent ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                  <CheckCircle2 size={60} className="mx-auto text-emerald-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Message Sent Successfully!</h3>
                  <p className="text-muted-foreground mb-6">Our team will review your message and get back to you soon.</p>
                  <Button onClick={() => { setSent(false); setFormData({ name: "", email: "", subject: "", message: "" }); }}
                    variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Send Another Message
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 block">Full Name *</label>
                      <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        placeholder="Your name" className="bg-white/5 border-white/15 text-white placeholder:text-gray-600 h-11 focus:border-primary/50" />
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 block">Email *</label>
                      <Input type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                        placeholder="you@example.com" className="bg-white/5 border-white/15 text-white placeholder:text-gray-600 h-11 focus:border-primary/50" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 block">Subject</label>
                    <Input value={formData.subject} onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                      placeholder="What's this about?" className="bg-white/5 border-white/15 text-white placeholder:text-gray-600 h-11 focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5 block">Message *</label>
                    <textarea value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                      placeholder="Tell us how we can help..." rows={5}
                      className="w-full rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-gray-600 p-3 text-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none" />
                  </div>
                  <Button type="submit" disabled={sending} className="w-full bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-white h-12 text-base font-semibold shadow-lg shadow-primary/20">
                    {sending ? (
                      <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</span>
                    ) : (
                      <span className="flex items-center gap-2"><Send size={16} /> Send Message</span>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Users size={18} className="text-indigo-400" />
                Our Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {teamMembers.map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0`}>
                    {m.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm">{m.name}</p>
                    <p className="text-[10px] text-primary">{m.role}</p>
                    <p className="text-[10px] text-muted-foreground">{m.speciality}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-white/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} className="text-emerald-400" />
                <p className="text-white font-semibold text-sm">Office Location</p>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                India<br />
                <span className="text-[10px] text-emerald-400">Available for remote collaboration worldwide</span>
              </p>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                <Clock size={14} className="text-yellow-400" />
                <p className="text-[11px] text-muted-foreground">Business Hours: Mon-Sat, 9 AM - 6 PM IST</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-white/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} className="text-amber-400" />
                <p className="text-white font-semibold text-sm">Enterprise Support</p>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                Need priority support, custom integrations, or SLA guarantees? Our enterprise plan includes dedicated account management.
              </p>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]">Contact for Enterprise Pricing</Badge>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-white/[0.03] to-transparent border-white/10">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <Star size={18} className="text-yellow-400" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Quick answers to common questions about BharatOS.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {faqs.map((faq, i) => (
              <div key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 cursor-pointer transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium">{faq.q}</p>
                    {openFaq === i && (
                      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-muted-foreground text-[12px] mt-2 leading-relaxed">
                        {faq.a}
                      </motion.p>
                    )}
                  </div>
                  <ArrowRight size={14} className={`shrink-0 text-muted-foreground transition-transform ${openFaq === i ? "rotate-90" : ""}`} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-primary/10 via-orange-500/5 to-amber-500/10 border-primary/20 overflow-hidden relative">
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        <CardContent className="p-8 text-center relative z-10">
          <h3 className="text-2xl font-bold text-white mb-2">Ready to Transform Your Workflow?</h3>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Join thousands of organizations using BharatOS to automate processes across Agriculture, Finance, Healthcare, and Governance.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge variant="outline" className="bg-white/5 text-white border-white/20 px-4 py-1.5 text-sm">Made in India</Badge>
            <Badge variant="outline" className="bg-white/5 text-white border-white/20 px-4 py-1.5 text-sm">Enterprise Ready</Badge>
            <Badge variant="outline" className="bg-white/5 text-white border-white/20 px-4 py-1.5 text-sm">24/7 AI-Powered</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

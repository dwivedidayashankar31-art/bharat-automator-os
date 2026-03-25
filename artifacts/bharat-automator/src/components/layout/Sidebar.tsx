import { Link, useLocation } from "wouter";
import { BrainCircuit, Network, Leaf, Briefcase, HeartPulse, Building2, Fingerprint } from "lucide-react";

interface SidebarProps {
  onNavigate?: () => void;
}

const navItems = [
  { href: "/", label: "Command Center", icon: BrainCircuit },
  { href: "/architecture", label: "Architecture", icon: Network },
  { href: "/agents/agriculture", label: "Agriculture", icon: Leaf },
  { href: "/agents/finance", label: "Finance & IT", icon: Briefcase },
  { href: "/agents/healthcare", label: "Healthcare", icon: HeartPulse },
  { href: "/agents/governance", label: "Governance", icon: Building2 },
  { href: "/indiastack", label: "India Stack", icon: Fingerprint },
];

export function Sidebar({ onNavigate }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center gap-3 px-2 py-4 mb-6">
        <img 
          src={`${import.meta.env.BASE_URL}images/logo.png`} 
          alt="Bharat Automator Logo" 
          className="w-10 h-10 rounded-xl shadow-lg shadow-primary/20 border border-primary/20"
        />
        <div className="flex flex-col">
          <span className="font-display font-bold text-2xl tracking-widest text-white leading-none">
            BHARAT<span className="text-primary">OS</span>
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
            Unified Agentic Mesh
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-gradient-to-r from-primary/20 to-transparent border-l-2 border-primary text-white shadow-lg shadow-primary/5' 
                  : 'text-muted-foreground hover:text-white hover:bg-white/5 border-l-2 border-transparent'
              }`}
            >
              <item.icon size={20} className={isActive ? "text-primary" : "group-hover:text-primary/70 transition-colors"} />
              <span className="font-semibold tracking-wide text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-border/50">
        <div className="bg-card/50 p-4 rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">System Online</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Orchestrator Node: DEL-01<br/>Latency: 24ms</p>
        </div>
      </div>
    </div>
  );
}

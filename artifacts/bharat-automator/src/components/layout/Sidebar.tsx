import { Link, useLocation } from "wouter";
import {
  BrainCircuit, Network, Leaf, Briefcase, HeartPulse,
  Building2, Fingerprint, Code2, AlertTriangle, ChevronRight, Sun, Moon, MessageSquare,
  LogIn, LogOut, User, Bot, BarChart3, KeyRound, Home, TrendingUp,
  Rocket, X, Clock, CreditCard, FileText, Activity, Shield, CloudSun
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@workspace/replit-auth-web";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SidebarProps {
  onNavigate?: () => void;
}

interface NavItem {
  href?: string;
  label: string;
  icon?: React.ElementType;
  exact?: boolean;
  type?: string;
  comingSoon?: boolean;
  badge?: string;
}

const navItems: NavItem[] = [
  { href: "/app", label: "Command Center", icon: BrainCircuit, exact: true },
  { href: "/app/ai-assistant", label: "AI Assistant", icon: MessageSquare },
  { href: "/app/task-automator", label: "Task Automator", icon: Bot },
  { href: "/app/data-science", label: "Data Science", icon: BarChart3 },
  { href: "/app/profit-engine", label: "Profit Engine", icon: TrendingUp },
  { href: "/app/payments", label: "Payments", icon: CreditCard },
  { href: "/app/analytics", label: "Live Analytics", icon: Activity },
  { href: "/app/invoices", label: "Invoice Generator", icon: FileText },
  { href: "/app/weather", label: "Weather & Disaster", icon: CloudSun, badge: "Live" },
  { href: "/app/architecture", label: "Architecture", icon: Network },
  { type: "separator", label: "Sector Agents" },
  { href: "/app/agriculture", label: "Agriculture Agent", icon: Leaf },
  { href: "/app/finance", label: "Finance & IT Agent", icon: Briefcase },
  { href: "/app/healthcare", label: "Healthcare Agent", icon: HeartPulse },
  { href: "/app/governance", label: "Governance Agent", icon: Building2 },
  { type: "separator", label: "India Stack" },
  { href: "/app/indiastack", label: "India Stack", icon: Fingerprint },
  { type: "separator", label: "Admin" },
  { href: "/app/admin", label: "Admin Panel", icon: Shield, badge: "Live" },
  { href: "/app/api-keys", label: "API Key Manager", icon: KeyRound },
  { type: "separator", label: "Technical Docs" },
  { href: "/app/boilerplate", label: "Python Boilerplate", icon: Code2 },
  { href: "/app/bottlenecks", label: "Critical Bottlenecks", icon: AlertTriangle },
  { type: "separator", label: "Coming Soon" },
  { label: "Agent Marketplace", icon: Rocket, comingSoon: true, badge: "Soon" },
];

function ComingSoonModal({ label, onClose }: { label: string; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#0f1628] border border-primary/20 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display font-semibold flex items-center gap-2" style={{ letterSpacing: '-0.01em' }}>
            <Clock size={18} className="text-primary" /> Coming Soon
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-[13px]">
            <span className="text-white font-medium">{label}</span> is currently in development and will be available in the next release.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <Rocket size={18} className="text-primary shrink-0" />
            <div>
              <p className="text-[13px] font-semibold text-white">Join the waitlist</p>
              <p className="text-[11px] text-muted-foreground">We'll notify you when this feature launches.</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-[13px] font-semibold transition-colors">
            Got it
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, login, logout } = useAuth();
  const [comingSoonItem, setComingSoonItem] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border/50 shrink-0">
        <img
          src={`${import.meta.env.BASE_URL}images/logo.png`}
          alt="Bharat Automator Logo"
          className="w-9 h-9 rounded-xl shadow-lg shadow-primary/20 border border-primary/20"
        />
        <div className="flex flex-col">
          <span className="font-display font-semibold text-[18px] tracking-tight leading-none sidebar-logo-text" style={{ letterSpacing: '0.06em' }}>
            Bharat<span className="text-primary">OS</span>
          </span>
          <span className="text-[10px] text-muted-foreground/60 tracking-wider font-sans font-medium mt-0.5">
            Unified Agentic Mesh
          </span>
        </div>
        <Badge className="ml-auto text-[9px] bg-primary/20 text-primary border-primary/30 px-1.5 py-0.5 font-sans font-semibold tracking-wide">
          Pro
        </Badge>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item, i) => {
          if (item.type === "separator") {
            return (
              <div key={i} className="pt-5 pb-1.5 px-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/40 font-sans">
                  {item.label}
                </span>
              </div>
            );
          }

          const Icon = item.icon!;

          if (item.comingSoon) {
            return (
              <button
                key={i}
                onClick={() => setComingSoonItem(item.label)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-muted-foreground hover:text-white hover:bg-white/5"
              >
                <Icon size={15} className="shrink-0 group-hover:text-primary/70 transition-colors" />
                <span className="text-[13px] font-medium flex-1 text-left tracking-[-0.01em]">{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          }

          const href = item.href!;
          const isActive = item.exact ? location === href : location.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                isActive
                  ? "bg-primary/12 text-white border border-primary/20"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-r-full" />
              )}
              <Icon
                size={15}
                className={`shrink-0 transition-colors ${isActive ? "text-primary" : "group-hover:text-primary/70"}`}
              />
              <span className="text-[13px] font-medium flex-1 tracking-[-0.01em]">{item.label}</span>
              {isActive && <ChevronRight size={13} className="text-primary/40" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-border/50 space-y-2 shrink-0">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border/50 text-muted-foreground hover:text-white hover:border-primary/30 hover:bg-primary/5 transition-all text-xs font-medium"
        >
          {theme === "dark" ? (
            <><Sun size={14} className="text-yellow-400" /> Light Mode</>
          ) : (
            <><Moon size={14} className="text-blue-400" /> Dark Mode</>
          )}
          <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-white/10 uppercase tracking-widest font-bold">
            {theme === "dark" ? "ON" : "OFF"}
          </span>
        </button>

        {/* System status */}
        <div className="bg-black/30 rounded-lg p-3 border border-border/30">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">System Online</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Orchestrator Node: DEL-01<br />
            Memory: Qdrant v1.9 • Latency: 24ms
          </p>
        </div>

        {/* User profile / auth */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10">
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={user.firstName ?? "User"}
                className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/20"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <User size={14} className="text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user.firstName ?? user.email ?? "User"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">Authenticated</p>
            </div>
            <button
              onClick={logout}
              title="Log out"
              className="p-1 text-muted-foreground hover:text-red-400 transition-colors"
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={login}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-all text-xs font-medium"
          >
            <LogIn size={14} /> Log In
          </button>
        )}

        {/* Back to home */}
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-all text-xs"
        >
          <Home size={13} />
          Back to Landing Page
        </Link>
      </div>

      {/* Coming Soon Modal */}
      {comingSoonItem && (
        <ComingSoonModal label={comingSoonItem} onClose={() => setComingSoonItem(null)} />
      )}
    </div>
  );
}

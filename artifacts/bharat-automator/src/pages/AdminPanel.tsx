import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, CreditCard, Activity, TrendingUp, RefreshCw, Clock, Shield, Globe, IndianRupee, Eye } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/hooks/use-toast";

interface PaymentRecord {
  id: number;
  orderId: string;
  paymentId: string | null;
  userId: string | null;
  email: string | null;
  amount: number;
  currency: string;
  status: string;
  plan: string | null;
  createdAt: string;
  verifiedAt: string | null;
}

interface UserRecord {
  userId: string | null;
  sessionId: string | null;
  ipAddress: string | null;
  totalActions: number;
  sectors: string;
  lastAction: string;
  firstSeen: string;
  lastSeen: string;
}

interface ActivityRecord {
  id: number;
  action: string;
  sector: string;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

interface ActivityStats {
  totalActions: number;
  uniqueUsers: number;
  bySector: { sector: string; count: number }[];
  byAction: { action: string; count: number }[];
  hourlyToday: { hour: string; count: number }[];
}

interface PaymentStats {
  totalPayments: number;
  totalRevenue: number;
  verifiedPayments: number;
  verifiedRevenue: number;
}

export default function AdminPanel() {
  const { toast } = useToast();
  const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentStats>({ totalPayments: 0, totalRevenue: 0, verifiedPayments: 0, verifiedRevenue: 0 });
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [activityStats, setActivityStats] = useState<ActivityStats>({ totalActions: 0, uniqueUsers: 0, bySector: [], byAction: [], hourlyToday: [] });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<"overview" | "payments" | "users" | "activity">("overview");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [payRes, userRes, feedRes, statsRes] = await Promise.all([
        fetch(`${BASE}/api/payments/history`).then(r => r.ok ? r.json() : { payments: [], stats: {} }),
        fetch(`${BASE}/api/activity/users`).then(r => r.ok ? r.json() : { users: [] }),
        fetch(`${BASE}/api/activity/feed`).then(r => r.ok ? r.json() : { activities: [] }),
        fetch(`${BASE}/api/activity/stats`).then(r => r.ok ? r.json() : {}),
      ]);
      setPayments(payRes.payments || []);
      setPaymentStats(payRes.stats || { totalPayments: 0, totalRevenue: 0, verifiedPayments: 0, verifiedRevenue: 0 });
      setUsers(userRes.users || []);
      setActivities(feedRes.activities || []);
      setActivityStats(statsRes);
      setLastRefresh(new Date());
    } catch {
      toast({ title: "Error", description: "Failed to load admin data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [BASE, toast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const interval = setInterval(fetchAll, 15000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const formatCurrency = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: Eye },
    { id: "payments" as const, label: "Payments", icon: CreditCard },
    { id: "users" as const, label: "Users", icon: Users },
    { id: "activity" as const, label: "Activity Log", icon: Activity },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader icon={Shield} title="Admin Control Panel" description="Real-time user data, payment records, and system activity monitoring." />

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {tabs.map(t => (
            <Button key={t.id} variant={activeTab === t.id ? "default" : "outline"} size="sm"
              onClick={() => setActiveTab(t.id)} className={activeTab === t.id ? "bg-primary text-white" : "border-white/20 text-white hover:bg-white/10"}>
              <t.icon size={14} className="mr-1.5" /> {t.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
            <Clock size={10} /> {lastRefresh.toLocaleTimeString()} (auto: 15s)
          </span>
          <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading} className="border-white/20 text-white hover:bg-white/10">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </Button>
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-blue-300/70 uppercase tracking-widest font-bold">Total Users</p>
                    <p className="text-3xl font-bold text-white mt-1">{activityStats.uniqueUsers || 0}</p>
                  </div>
                  <Users className="text-blue-400" size={28} />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-emerald-300/70 uppercase tracking-widest font-bold">Total Revenue</p>
                    <p className="text-3xl font-bold text-white mt-1">{formatCurrency(Number(paymentStats.verifiedRevenue) || 0)}</p>
                  </div>
                  <IndianRupee className="text-emerald-400" size={28} />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-orange-300/70 uppercase tracking-widest font-bold">Payments</p>
                    <p className="text-3xl font-bold text-white mt-1">{Number(paymentStats.totalPayments) || 0}</p>
                    <p className="text-[10px] text-emerald-400 mt-0.5">{Number(paymentStats.verifiedPayments) || 0} verified</p>
                  </div>
                  <CreditCard className="text-orange-400" size={28} />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-purple-300/70 uppercase tracking-widest font-bold">Total Actions</p>
                    <p className="text-3xl font-bold text-white mt-1">{activityStats.totalActions || 0}</p>
                  </div>
                  <Activity className="text-purple-400" size={28} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card/50 backdrop-blur border-white/10">
              <CardHeader>
                <CardTitle className="text-lg text-white">Sector Breakdown</CardTitle>
                <CardDescription>Activity distribution across sectors</CardDescription>
              </CardHeader>
              <CardContent>
                {activityStats.bySector.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-6">No activity data yet. Use the platform to generate data.</p>
                ) : (
                  <div className="space-y-3">
                    {activityStats.bySector.map((s, i) => {
                      const total = activityStats.bySector.reduce((sum, x) => sum + Number(x.count), 0);
                      const pct = total > 0 ? (Number(s.count) / total * 100) : 0;
                      const colors = ["bg-blue-500", "bg-emerald-500", "bg-orange-500", "bg-purple-500", "bg-pink-500", "bg-cyan-500"];
                      return (
                        <div key={s.sector} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-white">{s.sector}</span>
                            <span className="text-muted-foreground font-mono">{Number(s.count)} ({pct.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2">
                            <div className={`h-2 rounded-full ${colors[i % colors.length]}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-white/10">
              <CardHeader>
                <CardTitle className="text-lg text-white">Top Actions</CardTitle>
                <CardDescription>Most used features</CardDescription>
              </CardHeader>
              <CardContent>
                {activityStats.byAction.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-6">No actions recorded yet.</p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {activityStats.byAction.slice(0, 10).map((a, i) => (
                      <div key={a.action} className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-muted-foreground w-5">{i + 1}.</span>
                          <span className="text-sm text-white font-mono">{a.action}</span>
                        </div>
                        <Badge variant="outline" className="bg-white/5 text-white border-white/20 font-mono">{Number(a.count)}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "payments" && (
        <Card className="bg-card/50 backdrop-blur border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-white">Payment Records</CardTitle>
                <CardDescription>All Razorpay transactions stored in database</CardDescription>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                {Number(paymentStats.totalPayments)} total | {formatCurrency(Number(paymentStats.verifiedRevenue))} verified
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-10">No payments recorded yet. Payments will appear here once users make transactions.</p>
            ) : (
              <div className="border border-white/10 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 text-xs text-muted-foreground">
                    <tr>
                      <th className="p-3 text-left font-medium">Order ID</th>
                      <th className="p-3 text-left font-medium">Payment ID</th>
                      <th className="p-3 text-left font-medium">User/Email</th>
                      <th className="p-3 text-left font-medium">Plan</th>
                      <th className="p-3 text-right font-medium">Amount</th>
                      <th className="p-3 text-center font-medium">Status</th>
                      <th className="p-3 text-right font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {payments.map(p => (
                      <tr key={p.id} className="hover:bg-white/5">
                        <td className="p-3 font-mono text-[11px] text-white">{p.orderId?.slice(0, 20)}</td>
                        <td className="p-3 font-mono text-[11px] text-muted-foreground">{p.paymentId?.slice(0, 20) || "—"}</td>
                        <td className="p-3 text-white">{p.email || p.userId || "Anonymous"}</td>
                        <td className="p-3 text-orange-400">{p.plan || "Custom"}</td>
                        <td className="p-3 text-right font-mono text-emerald-400">{formatCurrency(p.amount)}</td>
                        <td className="p-3 text-center">
                          <Badge variant="outline" className={
                            p.status === "verified" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                            p.status === "failed" ? "bg-red-500/10 text-red-400 border-red-500/30" :
                            "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                          }>{p.status}</Badge>
                        </td>
                        <td className="p-3 text-right text-[11px] text-muted-foreground">{formatTime(p.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "users" && (
        <Card className="bg-card/50 backdrop-blur border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-white">User Profiles & Portfolio</CardTitle>
                <CardDescription>All users who have interacted with the system</CardDescription>
              </div>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                {users.length} users tracked
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-10">No users tracked yet. Activity will be recorded as users interact with the platform.</p>
            ) : (
              <div className="border border-white/10 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 text-xs text-muted-foreground">
                    <tr>
                      <th className="p-3 text-left font-medium">User / Session</th>
                      <th className="p-3 text-left font-medium">IP Address</th>
                      <th className="p-3 text-left font-medium">Sectors Used</th>
                      <th className="p-3 text-center font-medium">Total Actions</th>
                      <th className="p-3 text-left font-medium">Last Action</th>
                      <th className="p-3 text-right font-medium">First Seen</th>
                      <th className="p-3 text-right font-medium">Last Seen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u, i) => (
                      <tr key={i} className="hover:bg-white/5">
                        <td className="p-3 text-white font-mono text-[11px]">{u.userId || u.sessionId?.slice(0, 12) || "Anonymous"}</td>
                        <td className="p-3 font-mono text-[11px] text-muted-foreground">{u.ipAddress || "—"}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {u.sectors?.split(", ").map(s => (
                              <Badge key={s} variant="outline" className="text-[9px] bg-white/5 text-white border-white/20">{s}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 text-center font-bold text-white">{Number(u.totalActions)}</td>
                        <td className="p-3 text-orange-400 font-mono text-[11px]">{u.lastAction}</td>
                        <td className="p-3 text-right text-[11px] text-muted-foreground">{formatTime(u.firstSeen)}</td>
                        <td className="p-3 text-right text-[11px] text-muted-foreground">{formatTime(u.lastSeen)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "activity" && (
        <Card className="bg-card/50 backdrop-blur border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-white">Real-Time Activity Log</CardTitle>
                <CardDescription>Live feed of all system events (last 50)</CardDescription>
              </div>
              <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                {activityStats.totalActions} total events
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-10">No activity recorded yet. Use any feature to start tracking.</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {activities.map(a => (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30 text-[9px]">{a.sector}</Badge>
                        <span className="text-sm text-white font-mono truncate">{a.action}</span>
                      </div>
                      {a.ipAddress && <span className="text-[10px] text-muted-foreground font-mono">IP: {a.ipAddress}</span>}
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{formatTime(a.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

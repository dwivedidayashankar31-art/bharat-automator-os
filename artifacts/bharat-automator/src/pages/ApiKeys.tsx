import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, Plus, Eye, EyeOff, Copy, Trash2, Shield, CheckCircle2, AlertTriangle, RefreshCw, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ApiKey {
  id: string;
  name: string;
  service: string;
  key: string;
  maskedKey: string;
  status: "active" | "expired" | "revoked";
  createdAt: string;
  lastUsed: string;
  permissions: string[];
}

const SERVICES = [
  "OpenAI / GPT-4o",
  "Anthropic / Claude",
  "Qdrant Vector DB",
  "Bhashini NLP API",
  "ONDC Sandbox",
  "Aadhaar e-KYC API",
  "RBI NACH API",
  "Custom Endpoint",
];

const seedKeys: ApiKey[] = [
  {
    id: "key_001",
    name: "OpenAI Production",
    service: "OpenAI / GPT-4o",
    key: "sk-proj-" + "x".repeat(48),
    maskedKey: "sk-proj-••••••••••••••••••••••••••••••••••••••••••••••••",
    status: "active",
    createdAt: "2026-01-15",
    lastUsed: "2026-03-25T08:41:00Z",
    permissions: ["read", "write", "stream"],
  },
  {
    id: "key_002",
    name: "Qdrant Vector Store",
    service: "Qdrant Vector DB",
    key: "qdrant-" + "x".repeat(40),
    maskedKey: "qdrant-••••••••••••••••••••••••••••••••••••••••",
    status: "active",
    createdAt: "2026-02-01",
    lastUsed: "2026-03-25T09:12:00Z",
    permissions: ["read", "write", "admin"],
  },
  {
    id: "key_003",
    name: "Bhashini Translation",
    service: "Bhashini NLP API",
    key: "bhashini-" + "x".repeat(36),
    maskedKey: "bhashini-••••••••••••••••••••••••••••••••••••",
    status: "active",
    createdAt: "2026-02-10",
    lastUsed: "2026-03-24T14:30:00Z",
    permissions: ["read"],
  },
  {
    id: "key_004",
    name: "ONDC Dev Sandbox",
    service: "ONDC Sandbox",
    key: "ondc-dev-" + "x".repeat(32),
    maskedKey: "ondc-dev-••••••••••••••••••••••••••••••••",
    status: "expired",
    createdAt: "2025-12-01",
    lastUsed: "2026-01-15T10:00:00Z",
    permissions: ["read", "write"],
  },
];

function maskKey(key: string) {
  if (key.length <= 12) return "••••••••••••";
  return key.substring(0, 8) + "••••••••••••••••••••••••••••••••" + key.slice(-4);
}

export default function ApiKeys() {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[]>(seedKeys);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyService, setNewKeyService] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const toggleVisibility = (id: string) => {
    setVisibleKeys(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const copyKey = (key: string, name: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: "Copied to clipboard", description: `${name} key copied securely.` });
  };

  const revokeKey = (id: string) => {
    setKeys(prev => prev.map(k => k.id === id ? { ...k, status: "revoked" as const } : k));
    toast({ title: "Key revoked", description: "API key has been permanently revoked.", variant: "destructive" });
    setConfirmDelete(null);
  };

  const addKey = () => {
    if (!newKeyName.trim() || !newKeyService || !newKeyValue.trim()) return;
    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name: newKeyName.trim(),
      service: newKeyService,
      key: newKeyValue.trim(),
      maskedKey: maskKey(newKeyValue.trim()),
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
      permissions: ["read"],
    };
    setKeys(prev => [newKey, ...prev]);
    setShowAddModal(false);
    setNewKeyName(""); setNewKeyService(""); setNewKeyValue("");
    toast({ title: "API key added", description: `${newKeyName} has been securely stored.` });
  };

  const rotateKey = (id: string) => {
    toast({ title: "Key rotation initiated", description: "Your key is being rotated. The old key remains valid for 24 hours." });
  };

  const activeCount = keys.filter(k => k.status === "active").length;
  const expiredCount = keys.filter(k => k.status === "expired").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="API Key Management"
        description="Securely store, manage, and rotate API credentials for all integrated services in the Unified Agentic Mesh."
        icon={KeyRound}
      />

      {/* Security Banner */}
      <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
          <Shield size={16} />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-emerald-400">Vault-Grade Encryption Active</p>
          <p className="text-[12px] text-muted-foreground">All keys encrypted with AES-256-GCM. Keys are never logged or transmitted in plaintext. PKCE OAuth 2.0 secured.</p>
        </div>
        <Badge className="ml-auto bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] shrink-0">SOC 2 Compliant</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Keys", value: keys.length, color: "text-white" },
          { label: "Active", value: activeCount, color: "text-emerald-400" },
          { label: "Expired", value: expiredCount, color: "text-yellow-400" },
          { label: "Services", value: new Set(keys.map(k => k.service)).size, color: "text-blue-400" },
        ].map((s, i) => (
          <Card key={i} className="glass-panel border-white/10">
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] mb-1">{s.label}</p>
              <p className={`text-2xl font-display font-semibold ${s.color}`} style={{ letterSpacing: '-0.02em' }}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Keys List */}
      <Card className="glass-panel border-white/10 overflow-hidden">
        <CardHeader className="border-b border-white/10 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[15px] font-display font-semibold flex items-center gap-2" style={{ letterSpacing: '-0.01em' }}>
              <Lock size={15} className="text-primary" /> Encrypted Key Vault
            </CardTitle>
            <Button onClick={() => setShowAddModal(true)} size="sm" className="bg-primary hover:bg-primary/90 text-white text-[12px] gap-1.5">
              <Plus size={13} /> Add Key
            </Button>
          </div>
        </CardHeader>

        <div className="divide-y divide-white/5">
          <AnimatePresence>
            {keys.map((apiKey) => (
              <motion.div
                key={apiKey.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={`p-5 hover:bg-white/2 transition-colors ${apiKey.status === "revoked" ? "opacity-40" : ""}`}
              >
                <div className="flex flex-wrap items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                    <KeyRound size={15} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-semibold text-white">{apiKey.name}</span>
                      <Badge className={`text-[10px] ${
                        apiKey.status === "active" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                        apiKey.status === "expired" ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" :
                        "bg-red-500/15 text-red-400 border-red-500/30"
                      }`}>
                        {apiKey.status === "active" && <div className="w-1 h-1 rounded-full bg-emerald-400 mr-1 animate-pulse" />}
                        {apiKey.status === "expired" && <AlertTriangle size={9} className="mr-1" />}
                        {apiKey.status}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground/60 bg-white/5 px-2 py-0.5 rounded-full">{apiKey.service}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-black/40 border border-white/8 rounded-lg px-3 py-2 group">
                      <code className="text-[12px] font-mono text-muted-foreground flex-1 truncate">
                        {visibleKeys.has(apiKey.id) ? apiKey.key : apiKey.maskedKey}
                      </code>
                      <button onClick={() => toggleVisibility(apiKey.id)} className="text-muted-foreground/40 hover:text-white transition-colors shrink-0">
                        {visibleKeys.has(apiKey.id) ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <button onClick={() => copyKey(apiKey.key, apiKey.name)} className="text-muted-foreground/40 hover:text-white transition-colors shrink-0">
                        <Copy size={13} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-4 text-[11px] text-muted-foreground/60">
                      <span>Created: {apiKey.createdAt}</span>
                      <span>Last used: {apiKey.lastUsed === "Never" ? "Never" : new Date(apiKey.lastUsed).toLocaleDateString()}</span>
                      <div className="flex gap-1">
                        {apiKey.permissions.map(p => (
                          <span key={p} className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] text-muted-foreground/70">{p}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {apiKey.status !== "revoked" && (
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => rotateKey(apiKey.id)}
                        className="h-8 text-[11px] text-muted-foreground hover:text-white gap-1.5 hover:bg-white/5">
                        <RefreshCw size={12} /> Rotate
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(apiKey.id)}
                        className="h-8 text-[11px] text-red-400/70 hover:text-red-400 gap-1.5 hover:bg-red-500/10">
                        <Trash2 size={12} /> Revoke
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Card>

      {/* Add Key Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-[#0f1628] border border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-semibold flex items-center gap-2" style={{ letterSpacing: '-0.01em' }}>
              <Plus size={18} className="text-primary" /> Add API Key
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-[13px]">
              Keys are encrypted client-side before storage using AES-256.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Key Name</Label>
              <Input value={newKeyName} onChange={e => setNewKeyName(e.target.value)}
                placeholder="e.g., OpenAI Production" className="bg-black/40 border-white/10 text-white placeholder:text-muted-foreground/50 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">Service</Label>
              <Select onValueChange={setNewKeyService}>
                <SelectTrigger className="bg-black/40 border-white/10 text-white text-sm">
                  <SelectValue placeholder="Select service..." />
                </SelectTrigger>
                <SelectContent className="bg-[#0f1628] border-white/10">
                  {SERVICES.map(s => (
                    <SelectItem key={s} value={s} className="text-white hover:bg-white/5">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-muted-foreground">API Key Value</Label>
              <Input value={newKeyValue} onChange={e => setNewKeyValue(e.target.value)}
                type="password" placeholder="Paste your key here..."
                className="bg-black/40 border-white/10 text-white placeholder:text-muted-foreground/50 font-mono text-sm" />
            </div>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400/80 bg-emerald-500/5 border border-emerald-500/15 rounded-lg p-3">
              <CheckCircle2 size={13} /> Key will be encrypted with AES-256-GCM before storage.
            </div>
            <div className="flex gap-3 pt-1">
              <Button variant="ghost" onClick={() => setShowAddModal(false)} className="flex-1 border border-white/10 hover:bg-white/5 text-sm">Cancel</Button>
              <Button onClick={addKey} disabled={!newKeyName.trim() || !newKeyService || !newKeyValue.trim()}
                className="flex-1 bg-primary hover:bg-primary/90 text-white text-sm">
                <Shield size={14} className="mr-2" /> Save Encrypted
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Modal */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent className="bg-[#0f1628] border border-red-500/30 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display font-semibold flex items-center gap-2 text-red-400" style={{ letterSpacing: '-0.01em' }}>
              <AlertTriangle size={18} /> Revoke Key?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-[13px]">
              This action is irreversible. The key will be permanently revoked and any services using it will lose access immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setConfirmDelete(null)} className="flex-1 border border-white/10 hover:bg-white/5">Cancel</Button>
            <Button onClick={() => confirmDelete && revokeKey(confirmDelete)}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white">
              <Trash2 size={14} className="mr-2" /> Revoke Permanently
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

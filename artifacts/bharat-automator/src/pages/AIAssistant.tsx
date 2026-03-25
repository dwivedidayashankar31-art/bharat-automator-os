import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Plus, Trash2, Bot, User, Loader2, Sparkles, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { useListOpenaiConversations, useCreateOpenaiConversation, useDeleteOpenaiConversation, useGetOpenaiConversation } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: number | string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

const SUGGESTED_PROMPTS = [
  "Which government schemes am I eligible for?",
  "How do I file my GST return?",
  "Explain how UPI works for a farmer selling crops on ONDC",
  "What is Ayushman Bharat Digital Mission?",
  "Help me understand my Aadhaar-linked DigiLocker",
];

export default function AIAssistant() {
  const { toast } = useToast();
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [creatingNew, setCreatingNew] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: conversations, refetch: refetchConvs } = useListOpenaiConversations();
  const { data: convData, refetch: refetchConv } = useGetOpenaiConversation(
    activeConvId ?? 0,
    { query: { enabled: activeConvId !== null } }
  );
  const createConv = useCreateOpenaiConversation();
  const deleteConv = useDeleteOpenaiConversation();

  useEffect(() => {
    if (convData?.messages) {
      setMessages(convData.messages as Message[]);
    }
  }, [convData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewConversation = async () => {
    const title = newTitle.trim() || "New Chat";
    try {
      const conv = await createConv.mutateAsync({ data: { title } });
      setActiveConvId(conv.id);
      setMessages([]);
      setNewTitle("");
      setCreatingNew(false);
      refetchConvs();
    } catch {
      toast({ title: "Failed to create conversation", variant: "destructive" });
    }
  };

  const handleDeleteConversation = async (id: number) => {
    try {
      await deleteConv.mutateAsync({ id });
      if (activeConvId === id) {
        setActiveConvId(null);
        setMessages([]);
      }
      refetchConvs();
    } catch {
      toast({ title: "Failed to delete conversation", variant: "destructive" });
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !activeConvId || isStreaming) return;

    const userMsg: Message = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    const assistantMsg: Message = {
      id: `temp-asst-${Date.now()}`,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsStreaming(true);

    try {
      const res = await fetch(`${BASE_URL}/api/openai/conversations/${activeConvId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.content) {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last.role === "assistant") {
                  return [...updated.slice(0, -1), { ...last, content: last.content + parsed.content }];
                }
                return updated;
              });
            }
          } catch {}
        }
      }

      await refetchConv();
    } catch (err) {
      toast({ title: "Failed to send message", variant: "destructive" });
      setMessages((prev) => prev.slice(0, -2));
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-full gap-0 -m-4 sm:-m-8 lg:-m-10">
      <div className="px-4 sm:px-8 lg:px-10 pt-4 sm:pt-8 lg:pt-10 pb-4 flex-shrink-0">
        <PageHeader
          title="AI Assistant"
          description="BharatOS AI — Your intelligent guide to India's digital ecosystem"
          icon={MessageSquare}
        />
      </div>

      <div className="flex flex-1 min-h-0 border-t border-border/30">
        {/* Sidebar - conversation list */}
        <div className="w-64 shrink-0 border-r border-border/30 bg-black/20 flex flex-col hidden sm:flex">
          <div className="p-3 border-b border-border/30">
            {creatingNew ? (
              <div className="flex gap-2">
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Chat title..."
                  className="h-8 text-xs"
                  onKeyDown={(e) => e.key === "Enter" && handleNewConversation()}
                  autoFocus
                />
                <Button size="sm" className="h-8 px-2 shrink-0" onClick={handleNewConversation}>
                  <Plus size={14} />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-xs border-primary/20 hover:border-primary/40"
                onClick={() => setCreatingNew(true)}
              >
                <Plus size={14} className="text-primary" />
                New Conversation
              </Button>
            )}
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {conversations?.map((conv) => (
                <div
                  key={conv.id}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                    activeConvId === conv.id
                      ? "bg-primary/15 border border-primary/20 text-white"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
                  onClick={() => setActiveConvId(conv.id)}
                >
                  <span className="text-xs font-medium truncate flex-1">{conv.title}</span>
                  <button
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all ml-1 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(conv.id);
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {!conversations?.length && (
                <p className="text-[11px] text-muted-foreground/50 text-center py-4 px-2">
                  No conversations yet. Start a new one!
                </p>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-h-0">
          {activeConvId === null ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
              <div className="text-center space-y-3 max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                  <Sparkles className="text-primary" size={28} />
                </div>
                <h2 className="text-xl font-semibold text-white">BharatOS AI Assistant</h2>
                <p className="text-muted-foreground text-sm">
                  Ask me anything about government schemes, taxes, healthcare, agriculture, or India Stack services. I'm here to help all 1.4B citizens navigate digital India.
                </p>
              </div>

              <div className="w-full max-w-lg space-y-2">
                <p className="text-xs text-muted-foreground/60 uppercase tracking-wider font-semibold mb-3">Suggested questions</p>
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    className="w-full text-left px-4 py-3 rounded-xl border border-border/40 text-sm text-muted-foreground hover:text-white hover:border-primary/30 hover:bg-white/5 transition-all"
                    onClick={async () => {
                      const conv = await createConv.mutateAsync({ data: { title: prompt.slice(0, 40) } });
                      setActiveConvId(conv.id);
                      setMessages([]);
                      refetchConvs();
                      setTimeout(() => sendMessage(prompt), 100);
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Mobile new conversation button */}
              <Button
                className="sm:hidden"
                onClick={() => {
                  setCreatingNew(true);
                }}
              >
                <Plus size={16} className="mr-2" />
                Start New Chat
              </Button>
            </div>
          ) : (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 p-4 sm:p-6">
                <div className="space-y-4 max-w-3xl mx-auto">
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {msg.role === "assistant" && (
                          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
                            <Bot size={14} className="text-primary" />
                          </div>
                        )}
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            msg.role === "user"
                              ? "bg-primary/20 border border-primary/20 text-white rounded-br-sm"
                              : "bg-white/5 border border-border/30 text-foreground rounded-bl-sm"
                          }`}
                        >
                          {msg.content === "" && msg.role === "assistant" ? (
                            <div className="flex gap-1 items-center py-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          )}
                          <p className="text-[10px] text-muted-foreground/40 mt-1.5">
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                        {msg.role === "user" && (
                          <div className="w-8 h-8 rounded-lg bg-white/10 border border-border/20 flex items-center justify-center shrink-0 mt-1">
                            <User size={14} className="text-muted-foreground" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="border-t border-border/30 p-4 bg-black/20">
                <form onSubmit={handleSubmit} className="flex gap-3 max-w-3xl mx-auto">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about government schemes, taxes, healthcare, ONDC..."
                    disabled={isStreaming}
                    className="flex-1 bg-white/5 border-border/30 focus:border-primary/40 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    disabled={!input.trim() || isStreaming}
                    className="px-4 shrink-0"
                  >
                    {isStreaming ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                  </Button>
                </form>
                <p className="text-[10px] text-muted-foreground/30 text-center mt-2">
                  BharatOS AI · Powered by GPT-5.2 · Conversations are saved
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send,
  BrainCircuit,
  TrendingUp,
  BarChart3,
  Wallet,
  Calculator,
  Target,
  ChevronDown,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Level = "leigo" | "inter" | "expert";
type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Qual o melhor investimento agora com a Selic alta?",
  "Calcula meu IR com salário de R$ 5.000",
  "Quanto tempo pra FIRE com R$ 50k, gasto R$ 3k e aporte R$ 1k?",
  "Qual a diferença entre PGBL e VGBL?",
  "Quanto é o INSS de R$ 4.500?",
  "Qual o preço da PETR4 agora?",
];

const NAV_ITEMS = [
  { icon: BrainCircuit, label: "Chat IA", id: "chat" },
  { icon: BarChart3, label: "Mercado B3", id: "mercado" },
  { icon: Wallet, label: "Carteira", id: "carteira" },
  { icon: Calculator, label: "Calculadoras", id: "calc" },
  { icon: TrendingUp, label: "FIRE", id: "fire" },
  { icon: Target, label: "Metas", id: "metas" },
];

const LEVEL_LABELS: Record<Level, string> = {
  leigo: "Iniciante",
  inter: "Intermediário",
  expert: "Expert",
};

function AssistantMessage({ content }: { content: string }) {
  if (!content) {
    return (
      <span className="flex gap-1 items-center h-5">
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
      </span>
    );
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
        ul: ({ children }) => <ul className="mb-3 ml-4 space-y-1 list-disc marker:text-primary">{children}</ul>,
        ol: ({ children }) => <ol className="mb-3 ml-4 space-y-1 list-decimal marker:text-primary">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        h2: ({ children }) => <h2 className="font-semibold text-base mt-4 mb-2 text-foreground">{children}</h2>,
        h3: ({ children }) => <h3 className="font-medium text-sm mt-3 mb-1.5 text-foreground">{children}</h3>,
        table: ({ children }) => (
          <div className="overflow-x-auto mb-3">
            <table className="w-full text-xs border-collapse">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="text-left px-3 py-2 bg-secondary font-medium text-foreground border border-border">{children}</th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-2 border border-border text-muted-foreground">{children}</td>
        ),
        code: ({ children }) => (
          <code className="bg-secondary px-1.5 py-0.5 rounded text-xs font-mono text-primary">{children}</code>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-primary pl-3 mb-3 text-muted-foreground italic">{children}</blockquote>
        ),
        hr: () => <hr className="border-border my-4" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState<Level>("leigo");
  const [showLevelMenu, setShowLevelMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, level }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: updated[updated.length - 1].content + chunk,
          };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Erro ao conectar. Verifique a chave da API no `.env.local`.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-border flex flex-col bg-card">
        <div className="h-16 flex items-center px-5 border-b border-border">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
              F
            </div>
            FinançaIA
          </Link>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors w-full text-left ${
                activeTab === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="relative">
            <button
              onClick={() => setShowLevelMenu(!showLevelMenu)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary text-sm hover:bg-secondary/80 transition-colors"
            >
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="flex-1 text-left">{LEVEL_LABELS[level]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            {showLevelMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-card border border-border rounded-xl overflow-hidden shadow-lg z-10">
                {(["leigo", "inter", "expert"] as Level[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLevel(l); setShowLevelMenu(false); }}
                    className={`w-full text-left px-3 py-2.5 text-sm hover:bg-secondary transition-colors ${level === l ? "text-primary font-medium" : "text-muted-foreground"}`}
                  >
                    {LEVEL_LABELS[l]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="h-16 border-b border-border flex items-center px-6 shrink-0">
          <h1 className="font-semibold text-sm">
            {NAV_ITEMS.find((n) => n.id === activeTab)?.label ?? "Chat IA"}
          </h1>
        </div>

        {activeTab !== "chat" ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="font-medium">Em breve</p>
              <p className="text-sm mt-1 text-muted-foreground">Esta seção está sendo desenvolvida.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center px-6 gap-8">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <BrainCircuit className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-lg font-semibold mb-1">Como posso te ajudar?</h2>
                    <p className="text-muted-foreground text-sm max-w-xs">
                      Pergunte sobre IR, investimentos, FIRE, INSS ou cotações da B3.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-w-xl w-full">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="text-left p-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col gap-5">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div
                        className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {msg.role === "user" ? "V" : "F"}
                      </div>
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-card border border-border rounded-tl-sm text-foreground"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <span className="leading-relaxed">{msg.content}</span>
                        ) : (
                          <AssistantMessage content={msg.content} />
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            <div className="border-t border-border p-4 shrink-0">
              <div className="max-w-3xl mx-auto flex gap-3 items-end bg-card border border-border rounded-2xl px-4 py-3 focus-within:border-primary/50 transition-colors">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Pergunte algo sobre suas finanças..."
                  rows={1}
                  className="flex-1 bg-transparent resize-none outline-none text-sm placeholder:text-muted-foreground max-h-36 overflow-y-auto"
                  onInput={(e) => {
                    const t = e.target as HTMLTextAreaElement;
                    t.style.height = "auto";
                    t.style.height = t.scrollHeight + "px";
                  }}
                />
                <Button
                  size="icon"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 rounded-xl disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Enter para enviar · Shift+Enter para nova linha
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

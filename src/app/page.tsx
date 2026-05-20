import Link from "next/link";
import {
  BrainCircuit,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  Wallet,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: BrainCircuit,
    title: "Chat com IA Financeira",
    desc: "Pergunte qualquer coisa sobre IR, INSS, investimentos e planejamento. A IA adapta a linguagem ao seu nível.",
  },
  {
    icon: BarChart3,
    title: "Análise Técnica B3",
    desc: "Dados em tempo real de ações brasileiras, indicadores técnicos e análise fundamentalista integrada.",
  },
  {
    icon: Shield,
    title: "Open Finance",
    desc: "Conecte suas contas de 8+ bancos — Nubank, Itaú, Bradesco e mais. Visão completa do seu patrimônio.",
  },
  {
    icon: TrendingUp,
    title: "Simulador FIRE",
    desc: "Calcule sua data de independência financeira com base na sua taxa de poupança e portfólio atual.",
  },
  {
    icon: Wallet,
    title: "Carteira Inteligente",
    desc: "Gerencie ações, FIIs, renda fixa e criptos em um só lugar com alocação automática sugerida pela IA.",
  },
  {
    icon: Zap,
    title: "Alertas e Metas",
    desc: "Defina metas financeiras e receba alertas personalizados quando estiver desviando do plano.",
  },
];

const stats = [
  { value: "8+", label: "Bancos conectados" },
  { value: "14,75%", label: "Selic atual" },
  { value: "3", label: "Níveis de usuário" },
  { value: "100%", label: "Dados privados" },
];

const plans = [
  {
    name: "Grátis",
    price: "R$ 0",
    period: "/mês",
    features: ["Chat IA (20 msgs/dia)", "Calculadora IR", "Simulador INSS", "Mercado B3 básico"],
    cta: "Começar grátis",
    highlight: false,
  },
  {
    name: "Pro",
    price: "R$ 39",
    period: "/mês",
    features: ["Chat IA ilimitado", "Open Finance completo", "Carteira avançada", "Simulador FIRE", "Alertas personalizados"],
    cta: "Assinar Pro",
    highlight: true,
  },
  {
    name: "Expert",
    price: "R$ 199",
    period: "/mês",
    features: ["Tudo do Pro", "Análise técnica avançada", "Relatórios em PDF", "Consultoria via chat", "API access"],
    cta: "Assinar Expert",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
              F
            </div>
            <span>FinançaIA</span>
          </div>
          <div className="flex-1" />
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">Entrar</Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Começar grátis
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm mb-8">
            <Zap className="w-3.5 h-3.5" />
            Powered by Claude Sonnet
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-none">
            Suas finanças,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              explicadas pela IA
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            O assistente financeiro que fala a sua língua. IR, investimentos, FIRE e Open Finance — tudo em um só lugar, com inteligência artificial do seu lado.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/dashboard">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-12 px-8 text-base">
                Começar grátis
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base border-border">
                Ver demonstração
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 border-y border-border/50">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa para crescer financeiramente
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Ferramentas profissionais com linguagem acessível, para qualquer nível de conhecimento.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl border border-border bg-card hover:border-primary/40 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Planos simples e transparentes</h2>
            <p className="text-muted-foreground text-lg">Sem surpresas. Cancele quando quiser.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-6 rounded-2xl border flex flex-col gap-6 ${
                  plan.highlight
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border bg-card"
                }`}
              >
                {plan.highlight && (
                  <div className="text-xs font-medium text-primary bg-primary/10 rounded-full px-3 py-1 w-fit">
                    Mais popular
                  </div>
                )}
                <div>
                  <div className="text-lg font-semibold mb-1">{plan.name}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                </div>
                <ul className="flex flex-col gap-3 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard">
                  <Button
                    className={`w-full ${plan.highlight ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para assumir o controle das suas finanças?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Comece grátis hoje. Sem cartão de crédito.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-10 text-base gap-2">
              Começar agora
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
              F
            </div>
            FinançaIA
          </div>
          <div>© 2025 FinançaIA. Todos os direitos reservados.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
            <a href="#" className="hover:text-foreground transition-colors">Termos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

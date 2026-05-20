import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_BASE = `Você é o FinançaIA — um assessor financeiro brasileiro. Pense em si mesmo como um amigo que entende muito de dinheiro: direto, humano, sem papo de chatbot.

Ferramentas disponíveis: use-as sempre que precisar de números reais (cotações, Selic, cálculos). Nunca invente dados.

FORMATO — siga rigorosamente:
- PROIBIDO: emojis de qualquer tipo. Zero. Nenhum.
- PROIBIDO: headers (##, ###) em respostas curtas ou conversacionais. Use apenas em explicações longas onde a navegação realmente ajuda.
- PROIBIDO: listas com mais de 5 itens quando um parágrafo resolve.
- PERMITIDO: negrito para números e termos-chave. Tabelas quando há comparação real. Parágrafos diretos.
- Responda o que foi perguntado na primeira frase. Contexto e detalhes vêm depois.
- Tom: conversa, não relatório. "olha", "na prática", "é simples" são bem-vindos.
- Máximo de 3 parágrafos para perguntas simples.

Nunca recomende carteira personalizada — para isso, indique um CFP credenciado.`;

const LEVEL_SUFFIX: Record<string, string> = {
  leigo: "\n\nO usuário é INICIANTE. Use linguagem do dia a dia, analogias simples (ex: Tesouro Direto é como emprestar dinheiro para o governo). Explique qualquer termo técnico que usar. Nunca assuma conhecimento prévio.",
  inter: "\n\nO usuário é INTERMEDIÁRIO. Pode usar termos como CDI, Selic, P/L, DY sem explicar do zero. Mas ainda contextualiza decisões e consequências práticas.",
  expert: "\n\nO usuário é EXPERT. Fale como par: duration, spread, carrego, valuation, thesis de investimento. Vá direto ao ponto técnico.",
};

const TOOLS: Anthropic.Tool[] = [
  {
    name: "get_stock_price",
    description: "Busca cotação ao vivo de uma ação na B3. Use quando o usuário perguntar sobre preço, cotação, variação de uma ação.",
    input_schema: {
      type: "object" as const,
      properties: {
        ticker: { type: "string", description: "Código da ação na B3 (ex: PETR4, VALE3, ITUB4, BBAS3)" },
      },
      required: ["ticker"],
    },
  },
  {
    name: "calculate_ir",
    description: "Calcula o Imposto de Renda mensal sobre salário usando a tabela progressiva 2025.",
    input_schema: {
      type: "object" as const,
      properties: {
        salario_bruto: { type: "number", description: "Salário bruto mensal em reais" },
        deducoes: { type: "number", description: "Total de deduções (INSS já descontado, dependentes, pensão) em reais. Se não souber, omita." },
      },
      required: ["salario_bruto"],
    },
  },
  {
    name: "calculate_inss",
    description: "Calcula a contribuição INSS sobre o salário usando a tabela progressiva 2025.",
    input_schema: {
      type: "object" as const,
      properties: {
        salario: { type: "number", description: "Salário bruto mensal em reais" },
      },
      required: ["salario"],
    },
  },
  {
    name: "calculate_fire",
    description: "Calcula anos até a independência financeira (FIRE) e patrimônio necessário.",
    input_schema: {
      type: "object" as const,
      properties: {
        patrimonio_atual: { type: "number", description: "Patrimônio investido atual em reais" },
        gasto_mensal: { type: "number", description: "Gasto mensal atual em reais" },
        aporte_mensal: { type: "number", description: "Quanto investe por mês em reais" },
        taxa_retorno_anual: { type: "number", description: "Taxa de retorno real anual estimada (ex: 0.06 para 6% real). Padrão: 0.06" },
      },
      required: ["patrimonio_atual", "gasto_mensal", "aporte_mensal"],
    },
  },
  {
    name: "get_selic",
    description: "Retorna a taxa Selic meta atual do Banco Central do Brasil.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
];

async function executeTool(name: string, input: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case "get_stock_price": {
      const ticker = (input.ticker as string).toUpperCase().trim();
      const token = process.env.NEXT_PUBLIC_BRAPI_TOKEN ?? "";
      const url = token
        ? `https://brapi.dev/api/quote/${ticker}?token=${token}`
        : `https://brapi.dev/api/quote/${ticker}`;
      try {
        const res = await fetch(url, { next: { revalidate: 60 } });
        const data = await res.json();
        const q = data.results?.[0];
        if (!q) return { erro: `Ação ${ticker} não encontrada na B3` };
        return {
          ticker: q.symbol,
          nome: q.shortName,
          preco: q.regularMarketPrice,
          variacao_pct: q.regularMarketChangePercent?.toFixed(2) + "%",
          variacao_r$: q.regularMarketChange?.toFixed(2),
          volume: q.regularMarketVolume,
          abertura: q.regularMarketOpen,
          minimo_dia: q.regularMarketDayLow,
          maximo_dia: q.regularMarketDayHigh,
          fechamento_anterior: q.regularMarketPreviousClose,
          pe_ratio: q.priceEarnings ?? null,
          dividend_yield: q.dividendsYield ? q.dividendsYield + "%" : null,
        };
      } catch {
        return { erro: `Falha ao buscar cotação de ${ticker}` };
      }
    }

    case "calculate_ir": {
      const bruto = input.salario_bruto as number;
      const deducoes = (input.deducoes as number) ?? 0;
      const base = Math.max(0, bruto - deducoes);

      let ir = 0;
      let aliquota = 0;

      if (base > 4664.68) { aliquota = 27.5; ir = base * 0.275 - 896.00; }
      else if (base > 3751.05) { aliquota = 22.5; ir = base * 0.225 - 662.77; }
      else if (base > 2826.65) { aliquota = 15; ir = base * 0.15 - 381.44; }
      else if (base > 2259.20) { aliquota = 7.5; ir = base * 0.075 - 169.44; }

      ir = Math.max(0, ir);
      return {
        salario_bruto: bruto,
        deducoes,
        base_calculo: base.toFixed(2),
        aliquota_marginal: aliquota + "%",
        aliquota_efetiva: bruto > 0 ? ((ir / bruto) * 100).toFixed(2) + "%" : "0%",
        ir_mensal: ir.toFixed(2),
        ir_anual: (ir * 12).toFixed(2),
        salario_liquido_mensal: (bruto - ir - deducoes).toFixed(2),
        tabela: "Progressiva 2025",
      };
    }

    case "calculate_inss": {
      const salario = input.salario as number;
      const faixas = [
        { limite: 1518.00, aliquota: 0.075 },
        { limite: 2793.88, aliquota: 0.09 },
        { limite: 4190.83, aliquota: 0.12 },
        { limite: 8157.41, aliquota: 0.14 },
      ];
      let inss = 0;
      let anterior = 0;
      for (const f of faixas) {
        if (salario <= anterior) break;
        inss += (Math.min(salario, f.limite) - anterior) * f.aliquota;
        anterior = f.limite;
      }
      return {
        salario,
        inss_mensal: inss.toFixed(2),
        inss_anual: (inss * 12).toFixed(2),
        aliquota_efetiva: ((inss / Math.min(salario, 8157.41)) * 100).toFixed(2) + "%",
        salario_apos_inss: (salario - inss).toFixed(2),
        teto_inss_2025: "R$ 8.157,41",
        tabela: "Progressiva 2025",
      };
    }

    case "calculate_fire": {
      const P = input.patrimonio_atual as number;
      const gasto = input.gasto_mensal as number;
      const aporte = input.aporte_mensal as number;
      const taxa = (input.taxa_retorno_anual as number) ?? 0.06;

      const gasto_anual = gasto * 12;
      const necessario = gasto_anual / 0.04;
      const taxa_mensal = Math.pow(1 + taxa, 1 / 12) - 1;

      let anos = 0;
      let pat = P;
      while (pat < necessario && anos < 100) {
        for (let m = 0; m < 12; m++) {
          pat = pat * (1 + taxa_mensal) + aporte;
        }
        anos++;
      }

      const ano_fire = new Date().getFullYear() + anos;
      const taxa_poupanca = ((aporte / (aporte + gasto)) * 100).toFixed(1);

      return {
        patrimonio_atual: P,
        gasto_mensal: gasto,
        aporte_mensal: aporte,
        taxa_retorno_real_anual: (taxa * 100).toFixed(1) + "%",
        patrimonio_necessario: Math.round(necessario),
        falta_acumular: Math.round(Math.max(0, necessario - P)),
        anos_ate_fire: anos >= 100 ? ">100 anos com aportes atuais" : anos,
        ano_estimado_fire: anos < 100 ? ano_fire : null,
        taxa_poupanca: taxa_poupanca + "%",
        renda_passiva_mensal: (necessario * 0.04 / 12).toFixed(2),
        regra: "4% SWR (Safe Withdrawal Rate)",
      };
    }

    case "get_selic": {
      try {
        const res = await fetch(
          "https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json",
          { next: { revalidate: 3600 } }
        );
        const data = await res.json();
        const v = parseFloat(data[0].valor);
        return {
          selic_meta_anual: v.toFixed(2) + "% a.a.",
          selic_mensal: ((Math.pow(1 + v / 100, 1 / 12) - 1) * 100).toFixed(4) + "% a.m.",
          data_referencia: data[0].data,
          cdi_estimado: (v - 0.1).toFixed(2) + "% a.a.",
        };
      } catch {
        return { selic_meta_anual: "14,75% a.a.", nota: "Cache — API BCB indisponível" };
      }
    }

    default:
      return { erro: `Ferramenta '${name}' desconhecida` };
  }
}

export async function POST(req: NextRequest) {
  const { messages, level } = await req.json();

  const system = SYSTEM_BASE + (LEVEL_SUFFIX[level] ?? "");
  const encoder = new TextEncoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        let currentMessages: Anthropic.MessageParam[] = messages;
        const MAX_ITERATIONS = 5;

        for (let i = 0; i < MAX_ITERATIONS; i++) {
          const stream = anthropic.messages.stream({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4096,
            system,
            messages: currentMessages,
            tools: TOOLS,
          });

          const toolBlocks: Array<{ id: string; name: string; input: string }> = [];
          let currentTool: { id: string; name: string; input: string } | null = null;

          for await (const event of stream) {
            if (event.type === "content_block_start") {
              if (event.content_block.type === "tool_use") {
                currentTool = { id: event.content_block.id, name: event.content_block.name, input: "" };
              }
            } else if (event.type === "content_block_delta") {
              if (event.delta.type === "text_delta") {
                controller.enqueue(encoder.encode(event.delta.text));
              } else if (event.delta.type === "input_json_delta" && currentTool) {
                currentTool.input += event.delta.partial_json;
              }
            } else if (event.type === "content_block_stop" && currentTool) {
              toolBlocks.push(currentTool);
              currentTool = null;
            }
          }

          const finalMsg = await stream.finalMessage();

          if (toolBlocks.length === 0) break;

          controller.enqueue(encoder.encode("\n\n"));

          const results = await Promise.all(
            toolBlocks.map(async (t) => {
              let input: Record<string, unknown> = {};
              try { input = JSON.parse(t.input || "{}"); } catch {}
              const result = await executeTool(t.name, input);
              return { type: "tool_result" as const, tool_use_id: t.id, content: JSON.stringify(result) };
            })
          );

          currentMessages = [
            ...currentMessages,
            { role: "assistant", content: finalMsg.content },
            { role: "user", content: results },
          ];
        }

        controller.close();
      } catch (err) {
        console.error(err);
        controller.enqueue(encoder.encode("\n\nErro interno. Verifique a chave da API."));
        controller.close();
      }
    },
  });

  return new NextResponse(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}

/**
 * Serviço de histórico de análises.
 * Implementação atual: localStorage. Para migrar para o backend, basta
 * substituir o corpo destas funções por chamadas a `apiRequest`.
 */
import type { AnaliseSalva } from "@/types/api";

const CHAVE = "nba-props-analyzer:historico";

function ler(): AnaliseSalva[] {
  if (typeof window === "undefined") return [];
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return [];
    const dados = JSON.parse(bruto) as AnaliseSalva[];
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

function escrever(analises: AnaliseSalva[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAVE, JSON.stringify(analises));
}

export async function listarAnalises(): Promise<AnaliseSalva[]> {
  return ler().sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1));
}

export async function salvarAnalise(
  analise: Omit<AnaliseSalva, "id" | "criadoEm">,
): Promise<AnaliseSalva> {
  const nova: AnaliseSalva = {
    ...analise,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now()),
    criadoEm: new Date().toISOString(),
  };
  escrever([nova, ...ler()]);
  return nova;
}

export async function removerAnalise(id: string): Promise<void> {
  escrever(ler().filter((analise) => analise.id !== id));
}

export function exportarCsv(analises: AnaliseSalva[]): string {
  const cabecalho = [
    "Jogador",
    "Data da análise",
    "Temporada",
    "Jogos",
    "Linha",
    "Odd",
    "Lado",
    "Média",
    "% histórico",
    "Edge",
    "EV",
    "Casa de aposta",
    "Observações",
  ];

  const linhas = analises.map((a) => [
    a.jogadorNome,
    new Date(a.criadoEm).toLocaleString("pt-BR"),
    a.temporada,
    a.jogos,
    a.linha,
    a.odd,
    a.lado,
    a.media.toFixed(2),
    a.percentualHistorico.toFixed(1),
    a.edge.toFixed(4),
    a.ev.toFixed(4),
    a.casaDeAposta ?? "",
    (a.observacoes ?? "").replace(/[\r\n;]+/g, " "),
  ]);

  return [cabecalho, ...linhas].map((linha) => linha.join(";")).join("\n");
}

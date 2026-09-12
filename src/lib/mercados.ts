import type { Mercado, Partida } from "@/types/api";

export interface DefinicaoMercado {
  chave: Mercado;
  rotulo: string;
  /** Nome no singular usado em textos ("por partida"). */
  unidade: string;
  unidadeCurta: string;
  campo: keyof Pick<Partida, "pontos" | "assistencias" | "rebotes">;
}

export const MERCADOS: DefinicaoMercado[] = [
  { chave: "pontos", rotulo: "Pontos", unidade: "pontos", unidadeCurta: "pts", campo: "pontos" },
  {
    chave: "assistencias",
    rotulo: "Assistências",
    unidade: "assistências",
    unidadeCurta: "ast",
    campo: "assistencias",
  },
  { chave: "rebotes", rotulo: "Rebotes", unidade: "rebotes", unidadeCurta: "reb", campo: "rebotes" },
];

export const MERCADO_PADRAO: Mercado = "pontos";

export function definicaoMercado(mercado: Mercado): DefinicaoMercado {
  return MERCADOS.find((item) => item.chave === mercado) ?? MERCADOS[0]!;
}

/** Valor da estatística selecionada; `null` quando o backend não enviou o dado. */
export function valorMercado(partida: Partida, mercado: Mercado): number | null {
  const valor = partida[definicaoMercado(mercado).campo];
  return typeof valor === "number" && Number.isFinite(valor) ? valor : null;
}

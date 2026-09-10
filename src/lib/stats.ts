import type { LadoAposta, Partida } from "@/types/api";

export function media(valores: number[]): number {
  if (valores.length === 0) return 0;
  return valores.reduce((total, valor) => total + valor, 0) / valores.length;
}

export function mediana(valores: number[]): number {
  if (valores.length === 0) return 0;
  const ordenado = [...valores].sort((a, b) => a - b);
  const meio = Math.floor(ordenado.length / 2);
  return ordenado.length % 2 === 0 ? (ordenado[meio - 1]! + ordenado[meio]!) / 2 : ordenado[meio]!;
}

export function desvioPadrao(valores: number[]): number {
  if (valores.length < 2) return 0;
  const m = media(valores);
  const variancia = valores.reduce((total, valor) => total + (valor - m) ** 2, 0) / valores.length;
  return Math.sqrt(variancia);
}

/** Partidas ordenadas da mais recente para a mais antiga. */
export function ordenarPartidas(partidas: Partida[]): Partida[] {
  return [...partidas].sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0));
}

/** Aplica o filtro local de quantidade de jogos (undefined = temporada inteira). */
export function limitarPartidas(partidas: Partida[], quantidade?: number): Partida[] {
  const recentes = ordenarPartidas(partidas);
  return quantidade ? recentes.slice(0, quantidade) : recentes;
}

export function ehJogoEmCasa(adversario: string): boolean {
  return !adversario.toLowerCase().includes("@");
}

export function nomeAdversario(adversario: string): string {
  const partes = adversario.split(/vs\.?|@/i);
  return (partes[partes.length - 1] ?? adversario).trim();
}

export interface PerfilEstatistico {
  jogos: number;
  media: number;
  mediana: number;
  desvioPadrao: number;
  maximo: number;
  minimo: number;
  mediaUltimos5: number;
  mediaUltimos10: number;
  tendencia: number;
  consistencia: {
    coeficiente: number;
    rotulo: "Alta" | "Média" | "Baixa";
  };
}

export function calcularPerfil(partidas: Partida[]): PerfilEstatistico {
  const recentes = ordenarPartidas(partidas);
  const pontos = recentes.map((p) => p.pontos);
  const m = media(pontos);
  const dp = desvioPadrao(pontos);
  const ultimos5 = media(pontos.slice(0, 5));
  const ultimos10 = media(pontos.slice(0, 10));
  const coeficiente = m > 0 ? dp / m : 0;

  return {
    jogos: pontos.length,
    media: m,
    mediana: mediana(pontos),
    desvioPadrao: dp,
    maximo: pontos.length ? Math.max(...pontos) : 0,
    minimo: pontos.length ? Math.min(...pontos) : 0,
    mediaUltimos5: ultimos5,
    mediaUltimos10: ultimos10,
    tendencia: ultimos5 - m,
    consistencia: {
      coeficiente,
      rotulo: coeficiente <= 0.2 ? "Alta" : coeficiente <= 0.35 ? "Média" : "Baixa",
    },
  };
}

export interface ResultadoAposta {
  jogosAnalisados: number;
  vitorias: number;
  derrotas: number;
  empates: number;
  percentualAcerto: number;
  probabilidadeEstimada: number;
  probabilidadeImplicita: number;
  oddJusta: number;
  edge: number;
  ev: number;
  lucroSimulado: number;
  temValor: boolean;
}

export function calcularAposta(
  partidas: Partida[],
  linha: number,
  odd: number,
  lado: LadoAposta,
): ResultadoAposta {
  const jogos = partidas.length;
  let vitorias = 0;
  let empates = 0;

  for (const partida of partidas) {
    if (partida.pontos === linha) {
      empates += 1;
      continue;
    }
    const acerto = lado === "Over" ? partida.pontos > linha : partida.pontos < linha;
    if (acerto) vitorias += 1;
  }

  const derrotas = jogos - vitorias - empates;
  const decididos = vitorias + derrotas;
  const probabilidade = decididos > 0 ? vitorias / decididos : 0;
  const probabilidadeImplicita = odd > 0 ? 1 / odd : 0;
  const ev = probabilidade * (odd - 1) - (1 - probabilidade);
  const lucroSimulado = vitorias * (odd - 1) - derrotas;

  return {
    jogosAnalisados: jogos,
    vitorias,
    derrotas,
    empates,
    percentualAcerto: probabilidade * 100,
    probabilidadeEstimada: probabilidade,
    probabilidadeImplicita,
    oddJusta: probabilidade > 0 ? 1 / probabilidade : 0,
    edge: probabilidade - probabilidadeImplicita,
    ev,
    lucroSimulado,
    temValor: ev > 0,
  };
}

export interface ComparativoAmostra {
  rotulo: string;
  jogos: number;
  media: number;
  desvioPadrao: number;
  percentualOver: number;
  percentualUnder: number;
}

export function compararAmostras(partidas: Partida[], linha: number): ComparativoAmostra[] {
  const amostras: Array<{ rotulo: string; quantidade?: number }> = [
    { rotulo: "Últimos 5 jogos", quantidade: 5 },
    { rotulo: "Últimos 10 jogos", quantidade: 10 },
    { rotulo: "Últimos 15 jogos", quantidade: 15 },
    { rotulo: "Temporada inteira" },
  ];

  return amostras.map(({ rotulo, quantidade }) => {
    const selecionadas = limitarPartidas(partidas, quantidade);
    const pontos = selecionadas.map((p) => p.pontos);
    const decididos = selecionadas.filter((p) => p.pontos !== linha);
    const over = decididos.filter((p) => p.pontos > linha).length;
    const total = decididos.length;
    return {
      rotulo,
      jogos: selecionadas.length,
      media: media(pontos),
      desvioPadrao: desvioPadrao(pontos),
      percentualOver: total ? (over / total) * 100 : 0,
      percentualUnder: total ? ((total - over) / total) * 100 : 0,
    };
  });
}

export function formatarNumero(valor: number, casas = 2): string {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

export function formatarPercentual(valor: number, casas = 1): string {
  return `${formatarNumero(valor, casas)}%`;
}

export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  if (!ano || !mes || !dia) return iso;
  return `${dia}/${mes}/${ano}`;
}

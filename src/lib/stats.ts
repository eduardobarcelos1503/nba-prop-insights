import { definicaoMercado, valorMercado } from "@/lib/mercados";
import type { LadoAposta, Mercado, Partida, ResultadoJogo } from "@/types/api";

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

/** Valores do mercado, ignorando partidas sem o dado. */
export function valoresDoMercado(partidas: Partida[], mercado: Mercado): number[] {
  return partidas
    .map((partida) => valorMercado(partida, mercado))
    .filter((valor): valor is number => valor !== null);
}

export function ehJogoEmCasa(adversario: string): boolean {
  return !adversario.toLowerCase().includes("@");
}

export function nomeAdversario(adversario: string): string {
  const partes = adversario.split(/vs\.?|@/i);
  return (partes[partes.length - 1] ?? adversario).trim();
}

/** Green, Red ou Push de um valor frente à linha e ao lado escolhido. */
export function resultadoDoJogo(
  valor: number | null,
  linha: number,
  lado: LadoAposta,
): ResultadoJogo | null {
  if (valor === null) return null;
  if (valor === linha) return "Push";
  const acertou = lado === "Over" ? valor > linha : valor < linha;
  return acertou ? "Green" : "Red";
}

export interface PerfilEstatistico {
  mercado: Mercado;
  jogos: number;
  media: number;
  mediana: number;
  desvioPadrao: number;
  maximo: number;
  minimo: number;
  mediaUltimos5: number;
  mediaUltimos10: number;
  tendencia: number;
  ultimoValor: number | null;
  consistencia: {
    coeficiente: number;
    rotulo: "Alta" | "Média" | "Baixa";
  };
}

export function calcularPerfil(partidas: Partida[], mercado: Mercado): PerfilEstatistico {
  const recentes = ordenarPartidas(partidas);
  const valores = valoresDoMercado(recentes, mercado);
  const m = media(valores);
  const dp = desvioPadrao(valores);
  const ultimos5 = media(valores.slice(0, 5));
  const ultimos10 = media(valores.slice(0, 10));
  const coeficiente = m > 0 ? dp / m : 0;

  return {
    mercado,
    jogos: valores.length,
    media: m,
    mediana: mediana(valores),
    desvioPadrao: dp,
    maximo: valores.length ? Math.max(...valores) : 0,
    minimo: valores.length ? Math.min(...valores) : 0,
    mediaUltimos5: ultimos5,
    mediaUltimos10: ultimos10,
    tendencia: valores.length ? ultimos5 - m : 0,
    ultimoValor: valores.length ? valores[0]! : null,
    consistencia: {
      coeficiente,
      rotulo: coeficiente <= 0.2 ? "Alta" : coeficiente <= 0.35 ? "Média" : "Baixa",
    },
  };
}

export interface ResultadoAposta {
  mercado: Mercado;
  linha: number;
  odd: number;
  lado: LadoAposta;
  jogosAnalisados: number;
  greens: number;
  reds: number;
  pushes: number;
  /** `null` quando não existem greens nem reds (evita NaN). */
  percentualAcerto: number | null;
  probabilidadeEstimada: number;
  probabilidadeImplicita: number;
  oddJusta: number;
  edge: number;
  ev: number;
  lucroSimulado: number;
  temValor: boolean;
  /** Sequência da mais recente para a mais antiga. */
  sequenciaRecente: ResultadoJogo[];
  ultimoResultado: ResultadoJogo | null;
  diferencaMediaLinha: number;
}

export function calcularAposta(
  partidas: Partida[],
  mercado: Mercado,
  linha: number,
  odd: number,
  lado: LadoAposta,
): ResultadoAposta {
  const recentes = ordenarPartidas(partidas);
  const sequencia = recentes
    .map((partida) => resultadoDoJogo(valorMercado(partida, mercado), linha, lado))
    .filter((item): item is ResultadoJogo => item !== null);

  const greens = sequencia.filter((item) => item === "Green").length;
  const reds = sequencia.filter((item) => item === "Red").length;
  const pushes = sequencia.filter((item) => item === "Push").length;

  const decididos = greens + reds;
  const probabilidade = decididos > 0 ? greens / decididos : 0;
  const probabilidadeImplicita = odd > 0 ? 1 / odd : 0;
  const ev = decididos > 0 ? probabilidade * (odd - 1) - (1 - probabilidade) : 0;
  const lucroSimulado = greens * (odd - 1) - reds;
  const mediaMercado = media(valoresDoMercado(recentes, mercado));

  return {
    mercado,
    linha,
    odd,
    lado,
    jogosAnalisados: sequencia.length,
    greens,
    reds,
    pushes,
    percentualAcerto: decididos > 0 ? probabilidade * 100 : null,
    probabilidadeEstimada: probabilidade,
    probabilidadeImplicita,
    oddJusta: probabilidade > 0 ? 1 / probabilidade : 0,
    edge: decididos > 0 ? probabilidade - probabilidadeImplicita : 0,
    ev,
    lucroSimulado,
    temValor: decididos > 0 && ev > 0,
    sequenciaRecente: sequencia.slice(0, 10),
    ultimoResultado: sequencia[0] ?? null,
    diferencaMediaLinha: mediaMercado - linha,
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

export function compararAmostras(
  partidas: Partida[],
  mercado: Mercado,
  linha: number,
): ComparativoAmostra[] {
  const amostras: Array<{ rotulo: string; quantidade?: number }> = [
    { rotulo: "Últimos 5 jogos", quantidade: 5 },
    { rotulo: "Últimos 10 jogos", quantidade: 10 },
    { rotulo: "Últimos 15 jogos", quantidade: 15 },
    { rotulo: "Temporada inteira" },
  ];

  return amostras.map(({ rotulo, quantidade }) => {
    const selecionadas = limitarPartidas(partidas, quantidade);
    const valores = valoresDoMercado(selecionadas, mercado);
    const decididos = valores.filter((valor) => valor !== linha);
    const over = decididos.filter((valor) => valor > linha).length;
    const total = decididos.length;
    return {
      rotulo,
      jogos: valores.length,
      media: media(valores),
      desvioPadrao: desvioPadrao(valores),
      percentualOver: total ? (over / total) * 100 : 0,
      percentualUnder: total ? ((total - over) / total) * 100 : 0,
    };
  });
}

export function formatarNumero(valor: number, casas = 2): string {
  if (!Number.isFinite(valor)) return "—";
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

/** Mostra no máximo duas casas decimais, sem zeros desnecessários. */
export function formatarValor(valor: number | null): string {
  if (valor === null || !Number.isFinite(valor)) return "—";
  return valor.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

export function formatarPercentual(valor: number | null, casas = 1): string {
  if (valor === null || !Number.isFinite(valor)) return "—";
  return `${formatarNumero(valor, casas)}%`;
}

export function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  if (!ano || !mes || !dia) return iso;
  return `${dia}/${mes}/${ano}`;
}

export function rotuloMercado(mercado: Mercado): string {
  return definicaoMercado(mercado).rotulo;
}

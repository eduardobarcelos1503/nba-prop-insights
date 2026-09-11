/**
 * CAMADA DE MOCK ISOLADA — MODO DE DEMONSTRAÇÃO
 *
 * Para remover: apague a pasta `src/mocks` e o bloco `if (DEMO_MODE)` em
 * `src/services/http.ts`. Nenhum componente importa este arquivo diretamente.
 */
import type { Jogador, JogadorNbaResposta, Partida, TipoTemporada } from "@/types/api";

const JOGADORES: Array<Jogador & { nbaId: number; base: number; variacao: number }> = [
  { id: "jamesle01", nome: "LeBron James", nbaId: 2544, base: 26, variacao: 8 },
  { id: "curryst01", nome: "Stephen Curry", nbaId: 201939, base: 28, variacao: 10 },
  { id: "doncilu01", nome: "Luka Doncic", nbaId: 1629029, base: 32, variacao: 9 },
  { id: "antetgi01", nome: "Giannis Antetokounmpo", nbaId: 203507, base: 30, variacao: 7 },
  { id: "edwaran01", nome: "Anthony Edwards", nbaId: 1630162, base: 27, variacao: 9 },
  { id: "tatumja01", nome: "Jayson Tatum", nbaId: 1628369, base: 27, variacao: 8 },
  { id: "gilgesh01", nome: "Shai Gilgeous-Alexander", nbaId: 1628983, base: 31, variacao: 6 },
  { id: "jokicni01", nome: "Nikola Jokic", nbaId: 203999, base: 26, variacao: 7 },
  { id: "wembavi01", nome: "Victor Wembanyama", nbaId: 1641705, base: 24, variacao: 9 },
  { id: "bookede01", nome: "Devin Booker", nbaId: 1626164, base: 25, variacao: 8 },
];

const TIMES = ["GSW", "BOS", "DEN", "MIA", "PHX", "NYK", "DAL", "MIL", "OKC", "SAS", "PHI", "CLE"];

/** Gerador determinístico simples para manter os dados estáveis entre renders. */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function gerarPartidas(code: string, base: number, variacao: number, jogos: number): Partida[] {
  const semente = code.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  const time = TIMES[semente % TIMES.length]!;
  const partidas: Partida[] = [];

  for (let i = 0; i < jogos; i += 1) {
    const r1 = pseudoRandom(semente + i * 3.1);
    const r2 = pseudoRandom(semente + i * 7.7);
    const pontos = Math.max(4, Math.round(base + (r1 - 0.45) * variacao * 2));
    const dia = new Date(Date.UTC(2025, 9, 21));
    dia.setUTCDate(dia.getUTCDate() + i * 2);
    const adversario = TIMES[Math.floor(r2 * TIMES.length)]!;
    partidas.push({
      game_id: `00225000${String(i + 1).padStart(2, "0")}`,
      data: dia.toISOString().slice(0, 10),
      adversario: r2 > 0.5 ? `${time} vs. ${adversario}` : `${time} @ ${adversario}`,
      pontos,
    });
  }

  return partidas;
}

function media(valores: number[]) {
  return valores.reduce((t, v) => t + v, 0) / (valores.length || 1);
}

export const mockDelay = (ms = 420) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function mockJogadores(): Jogador[] {
  return JOGADORES.map(({ id, nome }) => ({ id, nome }));
}

export function mockJogadorNba(
  code: string,
  temporada: string,
  tipo: TipoTemporada,
): JogadorNbaResposta {
  const jogador = JOGADORES.find((j) => j.id === code) ?? JOGADORES[0]!;
  const quantidade = tipo === "Playoffs" ? 14 : tipo === "Pre Season" ? 6 : 32;
  const partidas = gerarPartidas(code, jogador.base, jogador.variacao, quantidade);
  const pontos = partidas.map((p) => p.pontos);
  const m = media(pontos);
  const dp = Math.sqrt(pontos.reduce((t, v) => t + (v - m) ** 2, 0) / pontos.length);

  return {
    code: jogador.id,
    nome: jogador.nome,
    nba_player_id: jogador.nbaId,
    temporada,
    tipo_temporada: tipo,
    pontos,
    media: Number(m.toFixed(2)),
    maximo: Math.max(...pontos),
    minimo: Math.min(...pontos),
    desvio_padrao: Number(dp.toFixed(2)),
    jogos: pontos.length,
    partidas,
  };
}

/** JWT falso (sem assinatura válida) apenas para o modo demonstração. */
export function mockToken(nome: string, email: string): string {
  const cabecalho = { alg: "none", typ: "JWT" };
  const payload = {
    sub: email,
    nome,
    email,
    role: email.toLowerCase().startsWith("admin") ? "admin" : "user",
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12,
  };
  const b64 = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${b64(cabecalho)}.${b64(payload)}.demo`;
}

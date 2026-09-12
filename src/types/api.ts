export type TipoTemporada = "Todos" | "Regular Season" | "Playoffs" | "Pre Season";

export type LadoAposta = "Over" | "Under";

/** Mercados suportados pela análise. */
export type Mercado = "pontos" | "assistencias" | "rebotes";

/** Resultado de um jogo frente à linha da aposta. */
export type ResultadoJogo = "Green" | "Red" | "Push";

export type Temporada = "2025-26" | "2026-27";

export interface Jogador {
  id: string;
  nome: string;
  nba_player_id?: number;
  ativo?: boolean;
}

export interface Partida {
  game_id: string;
  data: string;
  adversario: string;
  pontos: number | null;
  resultado?: "W" | "L" | string | null;
  minutos?: number | null;
  assistencias?: number | null;
  rebotes?: number | null;
  roubos?: number | null;
  tocos?: number | null;
  turnovers?: number | null;
  cestas_3?: number | null;
  tentativas_3?: number | null;
  plus_minus?: number | null;
}

export interface JogadorNbaResposta {
  code: string;
  nome: string;
  nba_player_id: number;
  temporada: string;
  tipo_temporada: string;
  origem?: string;
  jogos: number;
  /** Média de pontos calculada pelo backend (não usar para outros mercados). */
  media: number;
  pontos: number[];
  maximo?: number;
  minimo?: number;
  desvio_padrao?: number;
  partidas: Partida[];
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface LoginResposta {
  token: string;
}

export interface CadastroPayload {
  nome: string;
  email: string;
  senha: string;
}

export interface CriarJogadorPayload {
  nome: string;
}

export interface SincronizarPayload {
  temporada: string;
  tipo: TipoTemporada;
}

export interface TokenClaims {
  sub?: string;
  nome?: string;
  email?: string;
  role?: string;
  roles?: string[];
  is_admin?: boolean;
  admin?: boolean;
  exp?: number;
  [key: string]: unknown;
}

export interface UsuarioSessao {
  nome: string;
  email: string;
  isAdmin: boolean;
}

export interface AnaliseSalva {
  id: string;
  criadoEm: string;
  jogadorId: string;
  jogadorNome: string;
  temporada: string;
  tipoTemporada: string;
  /** Ausente em análises salvas antes da inclusão de assistências e rebotes. */
  mercado?: Mercado;
  jogos: number;
  linha: number;
  odd: number;
  lado: LadoAposta;
  media: number;
  percentualHistorico: number;
  edge: number;
  ev: number;
  casaDeAposta?: string | undefined;
  observacoes?: string | undefined;
}

export type TipoTemporada = "Regular Season" | "Playoffs" | "Pre Season";

export type LadoAposta = "Over" | "Under";

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
  pontos: number;
}

export interface JogadorNbaResposta {
  code: string;
  nome: string;
  nba_player_id: number;
  temporada: string;
  tipo_temporada: TipoTemporada;
  pontos: number[];
  media: number;
  maximo: number;
  minimo: number;
  desvio_padrao: number;
  jogos: number;
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
  tipoTemporada: TipoTemporada;
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

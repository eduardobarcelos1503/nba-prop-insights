import type {
  CriarJogadorPayload,
  Jogador,
  JogadorNbaResposta,
  SincronizarPayload,
  TipoTemporada,
} from "@/types/api";

import { apiRequest } from "./http";

/** Busca inteligente: GET /jogadores?busca=NOME */
export function buscarJogadores(busca: string, signal?: AbortSignal) {
  return apiRequest<Jogador[]>("/jogadores", {
    auth: true,
    query: { busca },
    ...(signal ? { signal } : {}),
  });
}

export function listarJogadores() {
  return apiRequest<Jogador[]>("/jogadores", { auth: true });
}

export function buscarPartidas(
  id: string,
  temporada: string,
  tipo: TipoTemporada = "Todos",
  signal?: AbortSignal,
) {
  return apiRequest<JogadorNbaResposta>(`/jogadores/${encodeURIComponent(id)}/nba`, {
    auth: true,
    query: { temporada, tipo },
    ...(signal ? { signal } : {}),
  });
}

export function criarJogador(payload: CriarJogadorPayload) {
  return apiRequest<Jogador>("/jogadores", { method: "POST", body: payload, auth: true });
}

export function sincronizarJogador(code: string, payload: SincronizarPayload) {
  return apiRequest<unknown>(`/jogadores/${encodeURIComponent(code)}/sincronizar`, {
    method: "POST",
    body: payload,
    auth: true,
  });
}

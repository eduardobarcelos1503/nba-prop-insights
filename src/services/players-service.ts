import type {
  CriarJogadorPayload,
  Jogador,
  JogadorNbaResposta,
  SincronizarPayload,
  TipoTemporada,
} from "@/types/api";

import { apiRequest } from "./http";

export function listarJogadores() {
  return apiRequest<Jogador[]>("/jogadores", { auth: true });
}

export function buscarPartidas(code: string, temporada: string, tipo: TipoTemporada) {
  return apiRequest<JogadorNbaResposta>(`/jogadores/${code}/nba`, {
    auth: true,
    query: { temporada, tipo },
  });
}

export function criarJogador(payload: CriarJogadorPayload) {
  return apiRequest<Jogador>("/jogadores", { method: "POST", body: payload, auth: true });
}

export function sincronizarJogador(code: string, payload: SincronizarPayload) {
  return apiRequest<unknown>(`/jogadores/${code}/sincronizar`, {
    method: "POST",
    body: payload,
    auth: true,
  });
}

import type { CadastroPayload, LoginPayload, LoginResposta } from "@/types/api";

import { apiRequest } from "./http";

export function login(payload: LoginPayload) {
  return apiRequest<LoginResposta>("/login", { method: "POST", body: payload });
}

export function cadastrar(payload: CadastroPayload) {
  return apiRequest<LoginResposta | void>("/cadastro", { method: "POST", body: payload });
}

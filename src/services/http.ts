import { API_BASE_URL, DEMO_MODE } from "@/lib/env";

import { resolverMock } from "./mock-adapter";
import { limparToken, obterToken } from "./token-storage";

export class ApiError extends Error {
  readonly status: number;
  readonly detalhes?: unknown;

  constructor(mensagem: string, status: number, detalhes?: unknown) {
    super(mensagem);
    this.name = "ApiError";
    this.status = status;
    this.detalhes = detalhes;
  }
}

export const MENSAGENS_ERRO: Record<number, string> = {
  400: "Dados inválidos. Revise as informações e tente novamente.",
  401: "Sua sessão expirou. Faça login novamente.",
  403: "Você não tem permissão para acessar este recurso.",
  404: "Não encontramos o que você procura.",
  409: "Este registro já existe.",
  422: "Não foi possível processar os dados enviados.",
  429: "Muitas requisições. Aguarde alguns instantes.",
  500: "O servidor encontrou um problema. Tente novamente em instantes.",
};

export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof ApiError) {
    return erro.message || MENSAGENS_ERRO[erro.status] || "Não foi possível concluir a operação.";
  }
  if (erro instanceof Error) return erro.message;
  return "Erro inesperado. Tente novamente.";
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Rotas protegidas enviam Authorization: Bearer <token>. */
  auth?: boolean;
  query?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
}

function montarUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(
    `${API_BASE_URL}${path}`,
    typeof window === "undefined" ? "http://localhost" : window.location.origin,
  );
  for (const [chave, valor] of Object.entries(query ?? {})) {
    if (valor !== undefined && valor !== "") url.searchParams.set(chave, String(valor));
  }
  return url.toString();
}

async function extrairMensagem(resposta: Response): Promise<string> {
  try {
    const dados = (await resposta.json()) as Record<string, unknown>;
    const mensagem = dados["erro"] ?? dados["mensagem"] ?? dados["message"] ?? dados["detail"];
    if (typeof mensagem === "string") return mensagem;
  } catch {
    /* corpo não é JSON */
  }
  return MENSAGENS_ERRO[resposta.status] ?? "Não foi possível concluir a operação.";
}

/**
 * Camada centralizada de comunicação HTTP.
 * Todos os serviços do app passam por aqui.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = false, query, signal } = options;

  // --- MODO DE DEMONSTRAÇÃO (remover junto com src/mocks) ---
  if (DEMO_MODE) {
    return resolverMock<T>(method, path, { body, query });
  }
  // --- fim do modo de demonstração ---

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = obterToken();
    if (!token) {
      throw new ApiError(MENSAGENS_ERRO[401]!, 401);
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  let resposta: Response;
  try {
    resposta = await fetch(montarUrl(path, query), {
      method,
      headers,
      signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Não foi possível conectar ao servidor. Verifique sua conexão.", 0);
  }

  if (resposta.status === 401) {
    limparToken();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.assign("/login");
    }
    throw new ApiError(MENSAGENS_ERRO[401]!, 401);
  }

  if (!resposta.ok) {
    throw new ApiError(await extrairMensagem(resposta), resposta.status);
  }

  if (resposta.status === 204) return undefined as T;

  return (await resposta.json()) as T;
}

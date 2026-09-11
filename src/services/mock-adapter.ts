/**
 * Ponte entre a camada HTTP e os mocks.
 * REMOÇÃO: apague este arquivo, a pasta `src/mocks` e o bloco DEMO_MODE em http.ts.
 */
import { mockDelay, mockJogadorNba, mockJogadores, mockToken } from "@/mocks";
import type { TipoTemporada } from "@/types/api";

import { ApiError } from "./http";

interface Contexto {
  body: unknown | undefined;
  query: Record<string, string | number | undefined> | undefined;
}

export async function resolverMock<T>(
  method: string,
  path: string,
  { body, query }: Contexto,
): Promise<T> {
  await mockDelay();

  if (method === "POST" && path === "/login") {
    const dados = body as { email?: string; senha?: string };
    if (!dados?.email || !dados?.senha || dados.senha.length < 4) {
      throw new ApiError("E-mail ou senha inválidos.", 401);
    }
    return { token: mockToken(dados.email.split("@")[0]!, dados.email) } as T;
  }

  if (method === "POST" && path === "/cadastro") {
    const dados = body as { nome?: string; email?: string; senha?: string };
    if (!dados?.nome || !dados?.email || !dados?.senha) {
      throw new ApiError("Preencha todos os campos.", 400);
    }
    return { token: mockToken(dados.nome, dados.email) } as T;
  }

  if (method === "GET" && path === "/jogadores") {
    return mockJogadores() as T;
  }

  if (method === "POST" && path === "/jogadores") {
    const dados = body as { nome?: string };
    if (!dados?.nome) throw new ApiError("Informe o nome do jogador.", 400);
    const code = dados.nome
      .toLowerCase()
      .replace(/[^a-z]/g, "")
      .slice(0, 8);
    return { id: code, nome: dados.nome } as T;
  }

  const sincronizar = path.match(/^\/jogadores\/([^/]+)\/sincronizar$/);
  if (method === "POST" && sincronizar) {
    return {
      code: sincronizar[1],
      mensagem: "Sincronização concluída no modo demonstração.",
      jogos_importados: 32,
    } as T;
  }

  const nba = path.match(/^\/jogadores\/([^/]+)\/nba$/);
  if (method === "GET" && nba) {
    const temporada = String(query?.["temporada"] ?? "2025-26");
    const tipo = String(query?.["tipo"] ?? "Regular Season") as TipoTemporada;
    return mockJogadorNba(nba[1]!, temporada, tipo) as T;
  }

  throw new ApiError(`Rota não disponível no modo demonstração: ${method} ${path}`, 404);
}

import type { TokenClaims, UsuarioSessao } from "@/types/api";

const CHAVE = "nba-props-analyzer:token";

export function obterToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CHAVE);
}

export function salvarToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHAVE, token);
}

export function limparToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CHAVE);
}

export function lerClaims(token: string): TokenClaims | null {
  try {
    const parte = token.split(".")[1];
    if (!parte) return null;
    const base64 = parte.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join(""),
    );
    return JSON.parse(json) as TokenClaims;
  } catch {
    return null;
  }
}

export function tokenExpirado(claims: TokenClaims | null): boolean {
  if (!claims?.exp) return false;
  return claims.exp * 1000 <= Date.now();
}

export function sessaoDoToken(token: string): UsuarioSessao | null {
  const claims = lerClaims(token);
  if (!claims || tokenExpirado(claims)) return null;

  const papeis = [claims.role, ...(claims.roles ?? [])].filter(Boolean).map(String);
  const isAdmin =
    claims.is_admin === true ||
    claims.admin === true ||
    papeis.some((papel) => papel.toLowerCase() === "admin" || papel.toLowerCase() === "administrador");

  const email = claims.email ?? claims.sub ?? "";
  return {
    nome: claims.nome ?? (email ? email.split("@")[0]! : "Usuário"),
    email,
    isAdmin,
  };
}

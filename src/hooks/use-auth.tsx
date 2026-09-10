import { useNavigate } from "@tanstack/react-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { cadastrar as cadastrarRequest, login as loginRequest } from "@/services/auth-service";
import { limparToken, obterToken, salvarToken, sessaoDoToken } from "@/services/token-storage";
import type { UsuarioSessao } from "@/types/api";

interface AuthContextValue {
  usuario: UsuarioSessao | null;
  carregando: boolean;
  autenticado: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  registrar: (nome: string, email: string, senha: string) => Promise<void>;
  sair: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSessao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = obterToken();
    if (token) {
      const sessao = sessaoDoToken(token);
      if (sessao) setUsuario(sessao);
      else limparToken();
    }
    setCarregando(false);
  }, []);

  const aplicarToken = useCallback((token: string) => {
    salvarToken(token);
    const sessao = sessaoDoToken(token);
    if (!sessao) {
      limparToken();
      throw new Error("Token inválido ou expirado recebido do servidor.");
    }
    setUsuario(sessao);
  }, []);

  const entrar = useCallback(
    async (email: string, senha: string) => {
      const { token } = await loginRequest({ email, senha });
      aplicarToken(token);
    },
    [aplicarToken],
  );

  const registrar = useCallback(
    async (nome: string, email: string, senha: string) => {
      const resposta = await cadastrarRequest({ nome, email, senha });
      if (resposta && typeof resposta === "object" && "token" in resposta && resposta.token) {
        aplicarToken(resposta.token);
        return;
      }
      const { token } = await loginRequest({ email, senha });
      aplicarToken(token);
    },
    [aplicarToken],
  );

  const sair = useCallback(() => {
    limparToken();
    setUsuario(null);
    navigate({ to: "/login", replace: true });
  }, [navigate]);

  const valor = useMemo<AuthContextValue>(
    () => ({ usuario, carregando, autenticado: usuario !== null, entrar, registrar, sair }),
    [usuario, carregando, entrar, registrar, sair],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return contexto;
}

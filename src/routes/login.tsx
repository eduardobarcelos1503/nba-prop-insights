import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, LogIn, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { DEMO_MODE } from "@/lib/env";
import { mensagemDeErro } from "@/services/http";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — NBA Props Analyzer" },
      {
        name: "description",
        content:
          "Acesse o NBA Props Analyzer para analisar linhas de pontuação, edge e valor esperado das props da NBA.",
      },
      { property: "og:title", content: "Entrar — NBA Props Analyzer" },
      {
        property: "og:description",
        content: "Acesse suas análises de props de pontuação da NBA.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { entrar, autenticado, carregando } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!carregando && autenticado) navigate({ to: "/dashboard", replace: true });
  }, [autenticado, carregando, navigate]);

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    if (!email.includes("@") || senha.length < 4) {
      setErro("Informe um e-mail válido e uma senha com pelo menos 4 caracteres.");
      return;
    }
    setEnviando(true);
    try {
      await entrar(email.trim(), senha);
      navigate({ to: "/dashboard", replace: true });
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="gradient-accent mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl text-primary-foreground">
            <Trophy className="size-7" />
          </span>
          <h1 className="text-2xl font-semibold">NBA Props Analyzer</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Entre para analisar props de pontuação com dados históricos.
          </p>
        </div>

        <form onSubmit={aoEnviar} className="surface-card space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="usuario@email.com"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
            />
          </div>

          {erro ? (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {erro}
            </p>
          ) : null}

          <Button type="submit" className="w-full" size="lg" disabled={enviando}>
            {enviando ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
            Entrar
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Não tem conta?{" "}
            <Link to="/cadastro" className="font-medium text-primary hover:underline">
              Criar cadastro
            </Link>
          </p>

          {DEMO_MODE ? (
            <p className="rounded-lg border border-info/30 bg-info/10 p-3 text-xs text-foreground/80">
              Modo de demonstração ativo: qualquer e-mail e senha entram. Use um e-mail começando
              com <strong>admin</strong> para ver a área administrativa.
            </p>
          ) : null}
        </form>
      </div>
    </main>
  );
}

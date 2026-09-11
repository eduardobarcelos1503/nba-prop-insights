import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Trophy, UserPlus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { mensagemDeErro } from "@/services/http";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta — NBA Props Analyzer" },
      {
        name: "description",
        content:
          "Crie sua conta no NBA Props Analyzer e comece a avaliar linhas de pontuação da NBA com estatística.",
      },
      { property: "og:title", content: "Criar conta — NBA Props Analyzer" },
      {
        property: "og:description",
        content: "Cadastre-se para analisar props de pontuação da NBA.",
      },
    ],
  }),
  component: CadastroPage,
});

function CadastroPage() {
  const { registrar } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);

    if (nome.trim().length < 2) return setErro("Informe seu nome completo.");
    if (!email.includes("@")) return setErro("Informe um e-mail válido.");
    if (senha.length < 6) return setErro("A senha deve ter pelo menos 6 caracteres.");
    if (senha !== confirmacao) return setErro("As senhas não coincidem.");

    setEnviando(true);
    try {
      await registrar(nome.trim(), email.trim(), senha);
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
          <h1 className="text-2xl font-semibold">Criar cadastro</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Leva menos de um minuto para começar suas análises.
          </p>
        </div>

        <form onSubmit={aoEnviar} className="surface-card space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={nome}
              placeholder="Seu nome"
              onChange={(evento) => setNome(evento.target.value)}
            />
          </div>

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
              autoComplete="new-password"
              placeholder="Mínimo de 6 caracteres"
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmacao">Confirmar senha</Label>
            <Input
              id="confirmacao"
              type="password"
              autoComplete="new-password"
              placeholder="Repita a senha"
              value={confirmacao}
              onChange={(evento) => setConfirmacao(evento.target.value)}
            />
          </div>

          {erro ? (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {erro}
            </p>
          ) : null}

          <Button type="submit" className="w-full" size="lg" disabled={enviando}>
            {enviando ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UserPlus className="size-4" />
            )}
            Criar conta
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

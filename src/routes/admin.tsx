import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Loader2, RefreshCw, Shield, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppHeader } from "@/components/layout/AppHeader";
import { RequireAuth } from "@/components/layout/RequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TEMPORADAS, TIPOS } from "@/components/dashboard/SeletorAnalise";
import { mensagemDeErro } from "@/services/http";
import { criarJogador, sincronizarJogador } from "@/services/players-service";
import type { TipoTemporada } from "@/types/api";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administração — NBA Props Analyzer" },
      {
        name: "description",
        content: "Cadastre jogadores e sincronize partidas da NBA por temporada e tipo.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Administração — NBA Props Analyzer" },
      {
        property: "og:description",
        content: "Ferramentas administrativas do NBA Props Analyzer.",
      },
    ],
  }),
  component: () => (
    <RequireAuth somenteAdmin>
      <AdminPage />
    </RequireAuth>
  ),
});

function AdminPage() {
  const [nome, setNome] = useState("");
  const [code, setCode] = useState("");
  const [temporada, setTemporada] = useState("2025-26");
  const [tipo, setTipo] = useState<TipoTemporada>("Regular Season");

  const criarMutation = useMutation({
    mutationFn: criarJogador,
    onSuccess: (jogador) => {
      toast.success(`Jogador cadastrado: ${jogador?.nome ?? nome}`);
      if (jogador?.id) setCode(jogador.id);
      setNome("");
    },
    onError: (erro) => toast.error(mensagemDeErro(erro)),
  });

  const sincronizarMutation = useMutation({
    mutationFn: () => sincronizarJogador(code.trim(), { temporada, tipo }),
    onSuccess: () => toast.success("Sincronização concluída."),
    onError: (erro) => toast.error(mensagemDeErro(erro)),
  });

  return (
    <div className="min-h-screen bg-background">
      <AppHeader temporada={temporada} />

      <main className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex items-center gap-2">
          <Shield className="size-5 text-primary" />
          <h1 className="text-2xl font-semibold sm:text-3xl">Área administrativa</h1>
        </div>

        <section className="surface-card p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Cadastrar jogador</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            O backend gera o código do jogador a partir do nome informado.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="nome-jogador">Nome do jogador</Label>
              <Input
                id="nome-jogador"
                placeholder="LeBron James"
                value={nome}
                onChange={(evento) => setNome(evento.target.value)}
              />
            </div>
            <Button
              onClick={() => {
                if (nome.trim().length < 3) {
                  toast.error("Informe o nome completo do jogador.");
                  return;
                }
                criarMutation.mutate({ nome: nome.trim() });
              }}
              disabled={criarMutation.isPending}
            >
              {criarMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UserPlus className="size-4" />
              )}
              Cadastrar
            </Button>
          </div>

          {criarMutation.isError ? (
            <p className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {mensagemDeErro(criarMutation.error)}
            </p>
          ) : null}

          {criarMutation.isSuccess ? (
            <p className="mt-3 flex items-center gap-2 rounded-lg border border-success/40 bg-success/10 p-3 text-sm text-success">
              <CheckCircle2 className="size-4" /> Jogador cadastrado com sucesso.
            </p>
          ) : null}
        </section>

        <section className="surface-card p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Sincronizar partidas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Informe o código do jogador e a temporada para importar os jogos.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="code">Código do jogador</Label>
              <Input
                id="code"
                placeholder="jamesle01"
                value={code}
                onChange={(evento) => setCode(evento.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Temporada</Label>
              <Select value={temporada} onValueChange={setTemporada}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPORADAS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={(valor) => setTipo(valor as TipoTemporada)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            className="mt-4"
            onClick={() => {
              if (!code.trim()) {
                toast.error("Informe o código do jogador.");
                return;
              }
              sincronizarMutation.mutate();
            }}
            disabled={sincronizarMutation.isPending}
          >
            {sincronizarMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Sincronizar
          </Button>

          {sincronizarMutation.isError ? (
            <p className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {mensagemDeErro(sincronizarMutation.error)}
            </p>
          ) : null}

          {sincronizarMutation.isSuccess ? (
            <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-muted/50 p-3 text-xs">
              {JSON.stringify(sincronizarMutation.data, null, 2)}
            </pre>
          ) : null}
        </section>
      </main>
    </div>
  );
}

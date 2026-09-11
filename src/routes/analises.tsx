import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Download, History, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EstadoErro, EstadoVazio } from "@/components/common/EstadoVazio";
import { AppHeader } from "@/components/layout/AppHeader";
import { RequireAuth } from "@/components/layout/RequireAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatarNumero, formatarPercentual } from "@/lib/stats";
import {
  exportarCsv,
  listarAnalises,
  removerAnalise,
} from "@/services/historico-service";
import { mensagemDeErro } from "@/services/http";
import type { AnaliseSalva } from "@/types/api";

export const Route = createFileRoute("/analises")({
  head: () => ({
    meta: [
      { title: "Histórico de análises — NBA Props Analyzer" },
      {
        name: "description",
        content:
          "Consulte, filtre, ordene por EV e exporte para CSV todas as análises de props salvas.",
      },
      { property: "og:title", content: "Histórico de análises — NBA Props Analyzer" },
      {
        property: "og:description",
        content: "Todas as suas análises de props da NBA em um só lugar.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <AnalisesPage />
    </RequireAuth>
  ),
});

function AnalisesPage() {
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [lado, setLado] = useState("todos");
  const [ordem, setOrdem] = useState("ev-desc");
  const [detalhe, setDetalhe] = useState<AnaliseSalva | null>(null);
  const [paraExcluir, setParaExcluir] = useState<AnaliseSalva | null>(null);

  const analisesQuery = useQuery({ queryKey: ["analises"], queryFn: listarAnalises });

  const excluirMutation = useMutation({
    mutationFn: removerAnalise,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analises"] });
      toast.success("Análise excluída.");
    },
    onError: (erro) => toast.error(mensagemDeErro(erro)),
  });

  const filtradas = useMemo(() => {
    const lista = (analisesQuery.data ?? []).filter((analise) => {
      const nomeOk = analise.jogadorNome.toLowerCase().includes(busca.trim().toLowerCase());
      const dataOk = dataInicio ? analise.criadoEm.slice(0, 10) >= dataInicio : true;
      const ladoOk = lado === "todos" ? true : analise.lado === lado;
      return nomeOk && dataOk && ladoOk;
    });

    return lista.sort((a, b) => {
      if (ordem === "ev-desc") return b.ev - a.ev;
      if (ordem === "ev-asc") return a.ev - b.ev;
      if (ordem === "data-asc") return a.criadoEm < b.criadoEm ? -1 : 1;
      return a.criadoEm < b.criadoEm ? 1 : -1;
    });
  }, [analisesQuery.data, busca, dataInicio, lado, ordem]);

  function exportar() {
    if (filtradas.length === 0) {
      toast.error("Nenhuma análise para exportar.");
      return;
    }
    const csv = exportarCsv(filtradas);
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analises-nba-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado.");
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="size-5 text-primary" />
            <h1 className="text-2xl font-semibold sm:text-3xl">Histórico de análises</h1>
          </div>
          <Button variant="outline" onClick={exportar}>
            <Download className="size-4" /> Exportar CSV
          </Button>
        </div>

        <section className="surface-card grid gap-4 p-5 sm:p-6 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="busca">Pesquisar jogador</Label>
            <div className="relative">
              <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
              <Input
                id="busca"
                className="pl-9"
                placeholder="Nome do jogador"
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data">A partir de</Label>
            <Input
              id="data"
              type="date"
              value={dataInicio}
              onChange={(evento) => setDataInicio(evento.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Lado</Label>
            <Select value={lado} onValueChange={setLado}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Over e Under</SelectItem>
                <SelectItem value="Over">Somente Over</SelectItem>
                <SelectItem value="Under">Somente Under</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Ordenar por</Label>
            <Select value={ordem} onValueChange={setOrdem}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ev-desc">EV (maior primeiro)</SelectItem>
                <SelectItem value="ev-asc">EV (menor primeiro)</SelectItem>
                <SelectItem value="data-desc">Data (mais recente)</SelectItem>
                <SelectItem value="data-asc">Data (mais antiga)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {analisesQuery.isLoading ? (
          <Skeleton className="h-72 w-full rounded-xl" />
        ) : analisesQuery.isError ? (
          <EstadoErro
            mensagem={mensagemDeErro(analisesQuery.error)}
            onTentarNovamente={() => analisesQuery.refetch()}
          />
        ) : filtradas.length === 0 ? (
          <EstadoVazio
            titulo="Nenhuma análise encontrada"
            descricao="Salve uma análise no dashboard ou ajuste os filtros de pesquisa para ver resultados aqui."
          />
        ) : (
          <section className="surface-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jogador</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Temporada</TableHead>
                    <TableHead className="text-right">Jogos</TableHead>
                    <TableHead className="text-right">Linha</TableHead>
                    <TableHead className="text-right">Odd</TableHead>
                    <TableHead>Lado</TableHead>
                    <TableHead className="text-right">% acerto</TableHead>
                    <TableHead className="text-right">EV</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtradas.map((analise) => (
                    <TableRow key={analise.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {analise.jogadorNome}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(analise.criadoEm).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{analise.temporada}</TableCell>
                      <TableCell className="text-right tabular-nums">{analise.jogos}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatarNumero(analise.linha, 1)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatarNumero(analise.odd)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            analise.lado === "Over"
                              ? "border-success/40 text-success"
                              : "border-info/40 text-info"
                          }
                        >
                          {analise.lado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatarPercentual(analise.percentualHistorico)}
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold tabular-nums ${
                          analise.ev > 0 ? "text-success" : "text-destructive"
                        }`}
                      >
                        {formatarNumero(analise.ev, 3)}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button variant="ghost" size="sm" onClick={() => setDetalhe(analise)}>
                          Detalhes
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          aria-label="Excluir análise"
                          onClick={() => setParaExcluir(analise)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        )}
      </main>

      <Dialog open={detalhe !== null} onOpenChange={(aberto) => !aberto && setDetalhe(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{detalhe?.jogadorNome}</DialogTitle>
          </DialogHeader>
          {detalhe ? (
            <div className="space-y-2 text-sm">
              {[
                ["Data da análise", new Date(detalhe.criadoEm).toLocaleString("pt-BR")],
                ["Temporada", `${detalhe.temporada} · ${detalhe.tipoTemporada}`],
                ["Jogos considerados", String(detalhe.jogos)],
                ["Linha", formatarNumero(detalhe.linha, 1)],
                ["Odd", formatarNumero(detalhe.odd)],
                ["Lado", detalhe.lado],
                ["Média da amostra", formatarNumero(detalhe.media, 1)],
                ["Percentual histórico", formatarPercentual(detalhe.percentualHistorico)],
                ["Edge", formatarPercentual(detalhe.edge * 100)],
                ["Valor esperado", formatarNumero(detalhe.ev, 3)],
                ["Casa de aposta", detalhe.casaDeAposta || "—"],
                ["Observações", detalhe.observacoes || "—"],
              ].map(([rotulo, valor]) => (
                <div key={rotulo} className="flex justify-between gap-4 border-b border-border py-1.5">
                  <span className="text-muted-foreground">{rotulo}</span>
                  <span className="text-right font-medium">{valor}</span>
                </div>
              ))}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={paraExcluir !== null}
        onOpenChange={(aberto) => !aberto && setParaExcluir(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir esta análise?</AlertDialogTitle>
            <AlertDialogDescription>
              A análise de {paraExcluir?.jogadorNome} será removida do histórico. Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (paraExcluir) excluirMutation.mutate(paraExcluir.id);
                setParaExcluir(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

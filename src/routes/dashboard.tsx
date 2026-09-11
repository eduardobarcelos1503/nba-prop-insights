import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Info } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EstadoErro, EstadoVazio } from "@/components/common/EstadoVazio";
import { CalculadoraAposta, type FormularioAposta } from "@/components/dashboard/CalculadoraAposta";
import { ComparacaoAmostras } from "@/components/dashboard/ComparacaoAmostras";
import { GraficoPontos } from "@/components/dashboard/GraficoPontos";
import { PerfilEstatisticoCard } from "@/components/dashboard/PerfilEstatistico";
import { SeletorAnalise } from "@/components/dashboard/SeletorAnalise";
import { TabelaPartidas } from "@/components/dashboard/TabelaPartidas";
import { AppHeader } from "@/components/layout/AppHeader";
import { RequireAuth } from "@/components/layout/RequireAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { DEMO_MODE } from "@/lib/env";
import {
  calcularAposta,
  calcularPerfil,
  compararAmostras,
  limitarPartidas,
  type ResultadoAposta,
} from "@/lib/stats";
import { salvarAnalise } from "@/services/historico-service";
import { mensagemDeErro } from "@/services/http";
import { buscarPartidas, listarJogadores } from "@/services/players-service";
import type { TipoTemporada } from "@/types/api";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — NBA Props Analyzer" },
      {
        name: "description",
        content:
          "Selecione jogador, temporada e amostra para avaliar linhas de pontuação com média, desvio padrão, edge e EV.",
      },
      { property: "og:title", content: "Dashboard — NBA Props Analyzer" },
      {
        property: "og:description",
        content: "Perfil estatístico, gráfico interativo e calculadora de aposta em um só lugar.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <DashboardPage />
    </RequireAuth>
  ),
});

interface ConsultaAtiva {
  jogadorId: string;
  temporada: string;
  tipo: TipoTemporada;
}

function DashboardPage() {
  const [jogadorId, setJogadorId] = useState("");
  const [temporada, setTemporada] = useState("2025-26");
  const [tipo, setTipo] = useState<TipoTemporada>("Regular Season");
  const [amostra, setAmostra] = useState("10");
  const [consulta, setConsulta] = useState<ConsultaAtiva | null>(null);
  const [janelaGrafico, setJanelaGrafico] = useState(10);
  const [formulario, setFormulario] = useState<FormularioAposta>({
    linha: "25.5",
    odd: "1.90",
    lado: "Over",
    casaDeAposta: "",
    observacoes: "",
  });
  const [erros, setErros] = useState<{ linha?: string; odd?: string }>({});
  const [resultado, setResultado] = useState<ResultadoAposta | null>(null);

  const jogadoresQuery = useQuery({
    queryKey: ["jogadores"],
    queryFn: listarJogadores,
    staleTime: 5 * 60 * 1000,
  });

  const analiseQuery = useQuery({
    queryKey: ["jogador-nba", consulta?.jogadorId, consulta?.temporada, consulta?.tipo],
    queryFn: () => buscarPartidas(consulta!.jogadorId, consulta!.temporada, consulta!.tipo),
    enabled: consulta !== null,
    staleTime: 5 * 60 * 1000,
  });

  const quantidade = amostra === "todos" ? undefined : Number(amostra);
  const partidasFiltradas = useMemo(
    () => limitarPartidas(analiseQuery.data?.partidas ?? [], quantidade),
    [analiseQuery.data, quantidade],
  );

  const perfil = useMemo(() => calcularPerfil(partidasFiltradas), [partidasFiltradas]);
  const linhaNumero = Number(formulario.linha.replace(",", "."));
  const oddNumero = Number(formulario.odd.replace(",", "."));
  const linhaValida = Number.isFinite(linhaNumero) && linhaNumero >= 0;

  const comparativos = useMemo(
    () => compararAmostras(analiseQuery.data?.partidas ?? [], linhaValida ? linhaNumero : 0),
    [analiseQuery.data, linhaNumero, linhaValida],
  );

  function validar(): boolean {
    const novos: { linha?: string; odd?: string } = {};
    if (!Number.isFinite(linhaNumero) || linhaNumero < 0) {
      novos.linha = "Informe uma linha maior ou igual a zero.";
    }
    if (!Number.isFinite(oddNumero) || oddNumero <= 1) {
      novos.odd = "A odd decimal deve ser maior que 1.";
    }
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  function calcular() {
    if (!analiseQuery.data || partidasFiltradas.length === 0) {
      toast.error("Analise um jogador antes de calcular.");
      return;
    }
    if (!validar()) return;
    setResultado(calcularAposta(partidasFiltradas, linhaNumero, oddNumero, formulario.lado));
  }

  async function salvar() {
    if (!analiseQuery.data || !resultado) return;
    try {
      await salvarAnalise({
        jogadorId: analiseQuery.data.code,
        jogadorNome: analiseQuery.data.nome,
        temporada: analiseQuery.data.temporada,
        tipoTemporada: analiseQuery.data.tipo_temporada,
        jogos: partidasFiltradas.length,
        linha: linhaNumero,
        odd: oddNumero,
        lado: formulario.lado,
        media: perfil.media,
        percentualHistorico: resultado.percentualAcerto,
        edge: resultado.edge,
        ev: resultado.ev,
        casaDeAposta: formulario.casaDeAposta.trim() || undefined,
        observacoes: formulario.observacoes.trim() || undefined,
      });
      toast.success("Análise salva no histórico.");
    } catch (falha) {
      toast.error(mensagemDeErro(falha));
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader temporada={temporada} />

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-5 text-primary" />
          <h1 className="text-2xl font-semibold sm:text-3xl">Análise de props de pontuação</h1>
        </div>

        {DEMO_MODE ? (
          <p className="flex items-start gap-2 rounded-xl border border-info/30 bg-info/10 p-3 text-sm text-foreground/80">
            <Info className="mt-0.5 size-4 shrink-0 text-info" />
            Modo de demonstração ativo com dados simulados. Defina{" "}
            <code className="font-mono">VITE_API_BASE_URL</code> para consumir o backend real.
          </p>
        ) : null}

        <SeletorAnalise
          jogadores={jogadoresQuery.data ?? []}
          carregandoJogadores={jogadoresQuery.isLoading}
          jogadorId={jogadorId}
          temporada={temporada}
          tipo={tipo}
          amostra={amostra}
          analisando={analiseQuery.isFetching}
          onJogador={setJogadorId}
          onTemporada={setTemporada}
          onTipo={setTipo}
          onAmostra={(valor) => {
            setAmostra(valor);
            if (valor !== "todos") setJanelaGrafico(Math.min(Number(valor), 20));
          }}
          onAnalisar={() => {
            if (!jogadorId) return;
            setResultado(null);
            setConsulta({ jogadorId, temporada, tipo });
          }}
        />

        {jogadoresQuery.isError ? (
          <EstadoErro
            mensagem={mensagemDeErro(jogadoresQuery.error)}
            onTentarNovamente={() => jogadoresQuery.refetch()}
          />
        ) : null}

        {!consulta ? (
          <EstadoVazio
            titulo="Nenhuma análise ainda"
            descricao="Escolha um jogador, a temporada e a amostra de jogos e clique em “Analisar jogador” para ver o perfil estatístico completo."
          />
        ) : analiseQuery.isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-80 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ) : analiseQuery.isError ? (
          <EstadoErro
            mensagem={mensagemDeErro(analiseQuery.error)}
            onTentarNovamente={() => analiseQuery.refetch()}
          />
        ) : partidasFiltradas.length === 0 ? (
          <EstadoVazio
            titulo="Sem partidas nesta seleção"
            descricao="Não encontramos jogos para esse jogador na temporada e tipo selecionados. Tente outra combinação."
          />
        ) : (
          <div className="animate-in fade-in space-y-5 duration-500">
            <PerfilEstatisticoCard
              nome={analiseQuery.data!.nome}
              temporada={analiseQuery.data!.temporada}
              tipo={analiseQuery.data!.tipo_temporada}
              perfil={perfil}
            />

            <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
              <GraficoPontos
                partidas={analiseQuery.data!.partidas}
                media={perfil.media}
                linha={linhaValida ? linhaNumero : perfil.media}
                janela={janelaGrafico}
                onJanela={setJanelaGrafico}
              />
              <CalculadoraAposta
                formulario={formulario}
                onChange={setFormulario}
                onCalcular={calcular}
                onSalvar={salvar}
                resultado={resultado}
                erros={erros}
                podeSalvar={resultado !== null}
              />
            </div>

            <ComparacaoAmostras
              amostras={comparativos}
              linha={linhaValida ? linhaNumero : perfil.media}
            />

            <TabelaPartidas
              partidas={partidasFiltradas}
              linha={linhaValida ? linhaNumero : perfil.media}
              lado={formulario.lado}
            />
          </div>
        )}
      </main>
    </div>
  );
}

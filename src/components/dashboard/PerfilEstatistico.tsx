import { Activity, ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatarNumero, type PerfilEstatistico as Perfil } from "@/lib/stats";
import type { TipoTemporada } from "@/types/api";

function Metrica({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{rotulo}</p>
      <p
        className={`mt-1 text-2xl font-semibold tabular-nums ${destaque ? "text-primary" : ""}`}
      >
        {valor}
      </p>
    </div>
  );
}

export function PerfilEstatisticoCard({
  nome,
  temporada,
  tipo,
  perfil,
}: {
  nome: string;
  temporada: string;
  tipo: TipoTemporada;
  perfil: Perfil;
}) {
  const tendenciaPositiva = perfil.tendencia > 0.5;
  const tendenciaNegativa = perfil.tendencia < -0.5;

  return (
    <section className="surface-card overflow-hidden">
      <div className="gradient-hero flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
        <div>
          <h2 className="text-xl font-semibold text-white sm:text-2xl">{nome}</h2>
          <p className="text-sm text-white/70">
            {temporada} · {tipo} · {perfil.jogos} jogos considerados
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge
            className={
              tendenciaPositiva
                ? "bg-success/20 text-success"
                : tendenciaNegativa
                  ? "bg-destructive/20 text-destructive"
                  : "bg-white/15 text-white"
            }
          >
            {tendenciaPositiva ? (
              <ArrowUpRight className="size-3.5" />
            ) : tendenciaNegativa ? (
              <ArrowDownRight className="size-3.5" />
            ) : (
              <Minus className="size-3.5" />
            )}
            Tendência {formatarNumero(perfil.tendencia, 1)} pts
          </Badge>
          <Badge className="bg-info/20 text-info">
            <Activity className="size-3.5" /> Consistência {perfil.consistencia.rotulo}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-5 sm:p-6 md:grid-cols-4">
        <Metrica rotulo="Média" valor={formatarNumero(perfil.media, 1)} destaque />
        <Metrica rotulo="Mediana" valor={formatarNumero(perfil.mediana, 1)} />
        <Metrica rotulo="Desvio padrão" valor={formatarNumero(perfil.desvioPadrao, 2)} />
        <Metrica rotulo="Jogos" valor={String(perfil.jogos)} />
        <Metrica rotulo="Maior pontuação" valor={String(perfil.maximo)} />
        <Metrica rotulo="Menor pontuação" valor={String(perfil.minimo)} />
        <Metrica rotulo="Média últimos 5" valor={formatarNumero(perfil.mediaUltimos5, 1)} />
        <Metrica rotulo="Média últimos 10" valor={formatarNumero(perfil.mediaUltimos10, 1)} />
      </div>
    </section>
  );
}

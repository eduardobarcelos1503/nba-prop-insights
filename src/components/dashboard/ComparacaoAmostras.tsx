import { Layers } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { formatarNumero, formatarPercentual, type ComparativoAmostra } from "@/lib/stats";

export function ComparacaoAmostras({
  amostras,
  linha,
}: {
  amostras: ComparativoAmostra[];
  linha: number;
}) {
  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <Layers className="size-4 text-primary" />
        <h2 className="text-lg font-semibold">Comparação de amostras</h2>
        <span className="text-sm text-muted-foreground">
          na linha de {formatarNumero(linha, 1)}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {amostras.map((amostra) => (
          <div key={amostra.rotulo} className="rounded-xl border border-border bg-muted/40 p-4">
            <p className="text-sm font-semibold">{amostra.rotulo}</p>
            <p className="text-xs text-muted-foreground">{amostra.jogos} jogos</p>

            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Média</span>
                <span className="font-semibold tabular-nums">
                  {formatarNumero(amostra.media, 1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Desvio padrão</span>
                <span className="font-semibold tabular-nums">
                  {formatarNumero(amostra.desvioPadrao)}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-success">Over {formatarPercentual(amostra.percentualOver)}</span>
                <span className="text-destructive">
                  Under {formatarPercentual(amostra.percentualUnder)}
                </span>
              </div>
              <Progress value={amostra.percentualOver} className="h-2" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

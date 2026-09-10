import {
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { formatarData, formatarNumero, limitarPartidas, ordenarPartidas } from "@/lib/stats";
import type { Partida } from "@/types/api";

interface GraficoPontosProps {
  partidas: Partida[];
  media: number;
  linha: number;
  janela: number;
  onJanela: (valor: number) => void;
}

interface Ponto {
  data: string;
  rotulo: string;
  adversario: string;
  pontos: number;
  acima: boolean;
}

function TooltipCustom({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: Ponto }>;
}) {
  if (!active || !payload?.length) return null;
  const ponto = payload[0]!.payload;
  return (
    <div className="rounded-lg border border-border bg-popover p-3 text-sm shadow-lg">
      <p className="font-semibold">{formatarData(ponto.data)}</p>
      <p className="text-muted-foreground">{ponto.adversario}</p>
      <p className="mt-1 font-semibold text-primary">{ponto.pontos} pontos</p>
    </div>
  );
}

export function GraficoPontos({ partidas, media, linha, janela, onJanela }: GraficoPontosProps) {
  const selecionadas = ordenarPartidas(limitarPartidas(partidas, janela)).slice().reverse();
  const dados: Ponto[] = selecionadas.map((partida) => ({
    data: partida.data,
    rotulo: formatarData(partida.data).slice(0, 5),
    adversario: partida.adversario,
    pontos: partida.pontos,
    acima: partida.pontos > linha,
  }));

  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Pontuação por partida</h2>
          <p className="text-sm text-muted-foreground">
            Verde acima da linha de {formatarNumero(linha, 1)} · vermelho abaixo
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[5, 10, 15, 20].map((valor) => (
            <Button
              key={valor}
              size="sm"
              variant={janela === valor ? "default" : "outline"}
              onClick={() => onJanela(valor)}
            >
              {valor}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-72 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={dados} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="rotulo"
              tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
              stroke="var(--color-border)"
            />
            <YAxis
              tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
              stroke="var(--color-border)"
            />
            <Tooltip content={<TooltipCustom />} />
            <ReferenceLine
              y={media}
              stroke="var(--color-info)"
              strokeDasharray="6 4"
              label={{
                value: `Média ${formatarNumero(media, 1)}`,
                position: "insideTopLeft",
                fill: "var(--color-info)",
                fontSize: 11,
              }}
            />
            <ReferenceLine
              y={linha}
              stroke="var(--color-primary)"
              strokeWidth={2}
              label={{
                value: `Linha ${formatarNumero(linha, 1)}`,
                position: "insideBottomLeft",
                fill: "var(--color-primary)",
                fontSize: 11,
              }}
            />
            <Line
              type="monotone"
              dataKey="pontos"
              stroke="var(--color-chart-2)"
              strokeWidth={2}
              dot={false}
              activeDot={false}
            />
            <Scatter dataKey="pontos">
              {dados.map((ponto) => (
                <Cell
                  key={`${ponto.data}-${ponto.pontos}`}
                  fill={ponto.acima ? "var(--color-success)" : "var(--color-destructive)"}
                />
              ))}
            </Scatter>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

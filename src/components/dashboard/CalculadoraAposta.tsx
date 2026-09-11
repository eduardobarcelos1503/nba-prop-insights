import { Calculator, Save, ShieldCheck, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { formatarNumero, formatarPercentual, type ResultadoAposta } from "@/lib/stats";
import type { LadoAposta } from "@/types/api";

export interface FormularioAposta {
  linha: string;
  odd: string;
  lado: LadoAposta;
  casaDeAposta: string;
  observacoes: string;
}

interface CalculadoraApostaProps {
  formulario: FormularioAposta;
  onChange: (formulario: FormularioAposta) => void;
  onCalcular: () => void;
  onSalvar: () => void;
  resultado: ResultadoAposta | null;
  erros: { linha?: string; odd?: string };
  podeSalvar: boolean;
}

function Item({ rotulo, valor, cor }: { rotulo: string; valor: string; cor?: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{rotulo}</p>
      <p className={`mt-0.5 text-lg font-semibold tabular-nums ${cor ?? ""}`}>{valor}</p>
    </div>
  );
}

export function CalculadoraAposta({
  formulario,
  onChange,
  onCalcular,
  onSalvar,
  resultado,
  erros,
  podeSalvar,
}: CalculadoraApostaProps) {
  const atualizar = (campo: keyof FormularioAposta, valor: string) =>
    onChange({ ...formulario, [campo]: valor });

  return (
    <section className="surface-card glow-ring p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <Calculator className="size-4 text-primary" />
        <h2 className="text-lg font-semibold">Calculadora de aposta</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="linha">Linha</Label>
          <Input
            id="linha"
            inputMode="decimal"
            placeholder="25.5"
            value={formulario.linha}
            onChange={(evento) => atualizar("linha", evento.target.value)}
            aria-invalid={Boolean(erros.linha)}
          />
          {erros.linha ? <p className="text-xs text-destructive">{erros.linha}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="odd">Odd decimal</Label>
          <Input
            id="odd"
            inputMode="decimal"
            placeholder="1.90"
            value={formulario.odd}
            onChange={(evento) => atualizar("odd", evento.target.value)}
            aria-invalid={Boolean(erros.odd)}
          />
          {erros.odd ? <p className="text-xs text-destructive">{erros.odd}</p> : null}
        </div>

        <div className="space-y-2">
          <Label>Lado da aposta</Label>
          <Select
            value={formulario.lado}
            onValueChange={(valor) => atualizar("lado", valor as LadoAposta)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Over">Over</SelectItem>
              <SelectItem value="Under">Under</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="casa">Casa de aposta (opcional)</Label>
          <Input
            id="casa"
            placeholder="Ex.: Bet365"
            value={formulario.casaDeAposta}
            onChange={(evento) => atualizar("casaDeAposta", evento.target.value)}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="observacoes">Observação (opcional)</Label>
          <Textarea
            id="observacoes"
            rows={2}
            placeholder="Anote o contexto da análise, lesões, ritmo de jogo..."
            value={formulario.observacoes}
            onChange={(evento) => atualizar("observacoes", evento.target.value)}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button onClick={onCalcular}>
          <Calculator className="size-4" /> Calcular análise
        </Button>
        <Button variant="outline" onClick={onSalvar} disabled={!podeSalvar}>
          <Save className="size-4" /> Salvar no histórico
        </Button>
      </div>

      {resultado ? (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={
                resultado.temValor
                  ? "bg-success/20 text-success"
                  : "bg-destructive/20 text-destructive"
              }
            >
              {resultado.temValor ? (
                <ShieldCheck className="size-3.5" />
              ) : (
                <ShieldAlert className="size-3.5" />
              )}
              {resultado.temValor ? "Valor positivo" : "Sem valor"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {resultado.vitorias}V — {resultado.derrotas}D
              {resultado.empates ? ` — ${resultado.empates} push` : ""}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Item rotulo="Jogos analisados" valor={String(resultado.jogosAnalisados)} />
            <Item
              rotulo="Percentual de acerto"
              valor={formatarPercentual(resultado.percentualAcerto)}
            />
            <Item
              rotulo="Prob. implícita"
              valor={formatarPercentual(resultado.probabilidadeImplicita * 100)}
            />
            <Item rotulo="Odd justa" valor={formatarNumero(resultado.oddJusta)} />
            <Item
              rotulo="Edge"
              valor={formatarPercentual(resultado.edge * 100)}
              cor={resultado.edge > 0 ? "text-success" : "text-destructive"}
            />
            <Item
              rotulo="Valor esperado (EV)"
              valor={formatarNumero(resultado.ev, 3)}
              cor={resultado.ev > 0 ? "text-success" : "text-destructive"}
            />
            <Item
              rotulo="Lucro simulado (1u)"
              valor={`${resultado.lucroSimulado > 0 ? "+" : ""}${formatarNumero(resultado.lucroSimulado)}u`}
              cor={resultado.lucroSimulado > 0 ? "text-success" : "text-destructive"}
            />
            <Item
              rotulo="Prob. estimada"
              valor={formatarPercentual(resultado.probabilidadeEstimada * 100)}
            />
          </div>

          <p className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs text-foreground/80">
            Os resultados representam somente o histórico da amostra selecionada. Desempenho passado
            não garante resultados futuros.
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          Informe a linha e a odd para calcular acerto histórico, edge e valor esperado.
        </p>
      )}
    </section>
  );
}

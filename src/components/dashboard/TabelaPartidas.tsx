import { CheckCircle2, Home, Plane, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ehJogoEmCasa, formatarData, formatarNumero, nomeAdversario } from "@/lib/stats";
import type { LadoAposta, Partida } from "@/types/api";

export function TabelaPartidas({
  partidas,
  linha,
  lado,
}: {
  partidas: Partida[];
  linha: number;
  lado: LadoAposta;
}) {
  return (
    <section className="surface-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Histórico de partidas</h2>
        <Badge variant="outline">{partidas.length} jogos na amostra</Badge>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Adversário</TableHead>
              <TableHead>Local</TableHead>
              <TableHead className="text-right">Pontos</TableHead>
              <TableHead className="text-right">Dif. da linha</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead className="text-right">Acerto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partidas.map((partida) => {
              const diferenca = partida.pontos - linha;
              const resultado = diferenca > 0 ? "Over" : diferenca < 0 ? "Under" : "Push";
              const acertou = resultado === lado;
              return (
                <TableRow key={partida.game_id}>
                  <TableCell className="whitespace-nowrap font-medium">
                    {formatarData(partida.data)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {nomeAdversario(partida.adversario)}
                  </TableCell>
                  <TableCell>
                    {ehJogoEmCasa(partida.adversario) ? (
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Home className="size-3.5" /> Casa
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Plane className="size-3.5" /> Fora
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {partida.pontos}
                  </TableCell>
                  <TableCell
                    className={`text-right tabular-nums ${
                      diferenca > 0 ? "text-success" : diferenca < 0 ? "text-destructive" : ""
                    }`}
                  >
                    {diferenca > 0 ? "+" : ""}
                    {formatarNumero(diferenca, 1)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        resultado === "Over"
                          ? "border-success/40 text-success"
                          : resultado === "Under"
                            ? "border-destructive/40 text-destructive"
                            : ""
                      }
                    >
                      {resultado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {resultado === "Push" ? (
                      <span className="text-sm text-muted-foreground">—</span>
                    ) : acertou ? (
                      <CheckCircle2 className="ml-auto size-5 text-success" />
                    ) : (
                      <XCircle className="ml-auto size-5 text-destructive" />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

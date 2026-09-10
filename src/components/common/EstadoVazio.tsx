import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

export function EstadoVazio({
  titulo,
  descricao,
  icone,
  acao,
}: {
  titulo: string;
  descricao: string;
  icone?: ReactNode;
  acao?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icone ?? <Inbox className="size-5" />}
      </span>
      <h3 className="text-base font-semibold">{titulo}</h3>
      <p className="max-w-md text-sm text-muted-foreground">{descricao}</p>
      {acao}
    </div>
  );
}

export function EstadoErro({
  mensagem,
  onTentarNovamente,
}: {
  mensagem: string;
  onTentarNovamente?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <AlertTriangle className="size-5" />
      </span>
      <h3 className="text-base font-semibold">Algo não saiu como esperado</h3>
      <p className="max-w-md text-sm text-muted-foreground">{mensagem}</p>
      {onTentarNovamente ? (
        <Button variant="outline" size="sm" onClick={onTentarNovamente}>
          <RefreshCw className="size-4" /> Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}

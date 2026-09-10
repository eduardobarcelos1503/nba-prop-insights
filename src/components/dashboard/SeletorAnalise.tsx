import { Check, ChevronsUpDown, Search, TrendingUp } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Jogador, TipoTemporada } from "@/types/api";

export const TEMPORADAS = ["2025-26", "2024-25", "2023-24", "2022-23"];
export const TIPOS: TipoTemporada[] = ["Regular Season", "Playoffs", "Pre Season"];
export const AMOSTRAS: Array<{ valor: string; rotulo: string }> = [
  { valor: "5", rotulo: "Últimos 5 jogos" },
  { valor: "10", rotulo: "Últimos 10 jogos" },
  { valor: "15", rotulo: "Últimos 15 jogos" },
  { valor: "20", rotulo: "Últimos 20 jogos" },
  { valor: "todos", rotulo: "Temporada inteira" },
];

interface SeletorAnaliseProps {
  jogadores: Jogador[];
  carregandoJogadores: boolean;
  jogadorId: string;
  temporada: string;
  tipo: TipoTemporada;
  amostra: string;
  analisando: boolean;
  onJogador: (id: string) => void;
  onTemporada: (valor: string) => void;
  onTipo: (valor: TipoTemporada) => void;
  onAmostra: (valor: string) => void;
  onAnalisar: () => void;
}

export function SeletorAnalise({
  jogadores,
  carregandoJogadores,
  jogadorId,
  temporada,
  tipo,
  amostra,
  analisando,
  onJogador,
  onTemporada,
  onTipo,
  onAmostra,
  onAnalisar,
}: SeletorAnaliseProps) {
  const [aberto, setAberto] = useState(false);
  const selecionado = jogadores.find((jogador) => jogador.id === jogadorId);

  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <Search className="size-4 text-primary" />
        <h2 className="text-lg font-semibold">Configurar análise</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="space-y-2 lg:col-span-2">
          <Label>Jogador</Label>
          {carregandoJogadores ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Popover open={aberto} onOpenChange={setAberto}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between font-normal"
                >
                  {selecionado ? selecionado.nome : "Pesquisar jogador por nome"}
                  <ChevronsUpDown className="size-4 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[min(24rem,90vw)] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Digite o nome do jogador..." />
                  <CommandList>
                    <CommandEmpty>Nenhum jogador encontrado.</CommandEmpty>
                    <CommandGroup>
                      {jogadores.map((jogador) => (
                        <CommandItem
                          key={jogador.id}
                          value={jogador.nome}
                          onSelect={() => {
                            onJogador(jogador.id);
                            setAberto(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "size-4",
                              jogador.id === jogadorId ? "opacity-100" : "opacity-0",
                            )}
                          />
                          {jogador.nome}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>

        <div className="space-y-2">
          <Label>Temporada</Label>
          <Select value={temporada} onValueChange={onTemporada}>
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
          <Label>Tipo de temporada</Label>
          <Select value={tipo} onValueChange={(valor) => onTipo(valor as TipoTemporada)}>
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

        <div className="space-y-2 lg:col-span-2">
          <Label>Amostra de jogos</Label>
          <Select value={amostra} onValueChange={onAmostra}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AMOSTRAS.map((item) => (
                <SelectItem key={item.valor} value={item.valor}>
                  {item.rotulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end lg:col-span-2">
          <Button
            className="w-full"
            size="lg"
            onClick={onAnalisar}
            disabled={!jogadorId || analisando}
          >
            <TrendingUp className="size-4" />
            {analisando ? "Analisando..." : "Analisar jogador"}
          </Button>
        </div>
      </div>
    </section>
  );
}

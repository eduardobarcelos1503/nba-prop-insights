import { useQuery } from "@tanstack/react-query";
import { ChevronsUpDown, Loader2, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AvatarJogador } from "@/components/dashboard/AvatarJogador";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { mensagemDeErro } from "@/services/http";
import { buscarJogadores } from "@/services/players-service";
import type { Jogador } from "@/types/api";

const MINIMO_CARACTERES = 2;
const DEBOUNCE_MS = 300;

/** Remove duplicados por id e coloca os jogadores ativos primeiro. */
function organizar(jogadores: Jogador[]): Jogador[] {
  const vistos = new Set<string>();
  const unicos = jogadores.filter((jogador) => {
    if (vistos.has(jogador.id)) return false;
    vistos.add(jogador.id);
    return true;
  });

  return unicos.sort((a, b) => {
    const ativoA = a.ativo === false ? 1 : 0;
    const ativoB = b.ativo === false ? 1 : 0;
    if (ativoA !== ativoB) return ativoA - ativoB;
    return a.nome.localeCompare(b.nome, "pt-BR");
  });
}

export function BuscaJogador({
  selecionado,
  onSelecionar,
}: {
  selecionado: Jogador | null;
  onSelecionar: (jogador: Jogador) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [termo, setTermo] = useState("");
  const [termoDebounce, setTermoDebounce] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setTermoDebounce(termo.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [termo]);

  const habilitado = termoDebounce.length >= MINIMO_CARACTERES;

  const jogadoresQuery = useQuery({
    queryKey: ["jogadores", "busca", termoDebounce],
    // O signal cancela a requisição anterior quando o usuário continua digitando.
    queryFn: ({ signal }) => buscarJogadores(termoDebounce, signal),
    enabled: habilitado,
    staleTime: 5 * 60 * 1000,
  });

  const jogadores = useMemo(() => organizar(jogadoresQuery.data ?? []), [jogadoresQuery.data]);
  const carregando = habilitado && (jogadoresQuery.isLoading || termo.trim() !== termoDebounce);

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={aberto}
          className="h-auto w-full justify-between gap-2 py-2 font-normal"
        >
          <span className="flex min-w-0 items-center gap-2">
            {selecionado ? (
              <>
                <AvatarJogador nome={selecionado.nome} className="size-8 text-xs" />
                <span className="truncate">{selecionado.nome}</span>
              </>
            ) : (
              <>
                <Search className="size-4 text-primary" />
                <span className="text-muted-foreground">Pesquisar jogador por nome</span>
              </>
            )}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(26rem,92vw)] p-0" align="start">
        {/* shouldFilter=false: a filtragem acontece no backend */}
        <Command shouldFilter={false}>
          <CommandInput
            value={termo}
            onValueChange={setTermo}
            placeholder="Digite pelo menos 2 letras..."
          />
          <CommandList>
            {!habilitado ? (
              <p className="p-4 text-sm text-muted-foreground">
                Digite pelo menos {MINIMO_CARACTERES} caracteres para buscar.
              </p>
            ) : carregando ? (
              <p className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Buscando jogadores...
              </p>
            ) : jogadoresQuery.isError ? (
              <p className="p-4 text-sm text-destructive">{mensagemDeErro(jogadoresQuery.error)}</p>
            ) : (
              <>
                <CommandEmpty>Nenhum jogador encontrado.</CommandEmpty>
                <CommandGroup>
                  {jogadores.map((jogador) => (
                    <CommandItem
                      key={jogador.id}
                      value={jogador.id}
                      onSelect={() => {
                        onSelecionar(jogador);
                        setAberto(false);
                      }}
                      className="gap-2"
                    >
                      <AvatarJogador nome={jogador.nome} className="size-7 text-[11px]" />
                      <span className="truncate">{jogador.nome}</span>
                      {jogador.ativo === false ? (
                        <Badge variant="outline" className="ml-auto text-[10px]">
                          Inativo
                        </Badge>
                      ) : null}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

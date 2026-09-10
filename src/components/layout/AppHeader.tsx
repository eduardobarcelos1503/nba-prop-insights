import { Link, useNavigate } from "@tanstack/react-router";
import {
  History,
  LayoutDashboard,
  LogOut,
  Moon,
  Shield,
  Sun,
  Trophy,
  Menu,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";

interface AppHeaderProps {
  temporada?: string;
}

export function AppHeader({ temporada }: AppHeaderProps) {
  const { usuario, sair } = useAuth();
  const { tema, alternarTema } = useTheme();
  const navigate = useNavigate();

  const iniciais = (usuario?.nome ?? "U")
    .split(" ")
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/dashboard" className="flex items-center gap-3">
          <span className="gradient-accent flex size-9 items-center justify-center rounded-xl text-primary-foreground">
            <Trophy className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold sm:text-base">NBA Props Analyzer</span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              Análise de props de pontuação
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {temporada ? (
            <Badge variant="outline" className="hidden border-info/40 text-info sm:inline-flex">
              Temporada {temporada}
            </Badge>
          ) : null}

          <nav className="hidden items-center gap-1 md:flex">
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard">
                <LayoutDashboard className="size-4" /> Dashboard
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/analises">
                <History className="size-4" /> Histórico
              </Link>
            </Button>
            {usuario?.isAdmin ? (
              <Button asChild variant="ghost" size="sm">
                <Link to="/admin">
                  <Shield className="size-4" /> Admin
                </Link>
              </Button>
            ) : null}
          </nav>

          <Button
            variant="ghost"
            size="icon"
            onClick={alternarTema}
            aria-label={tema === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
          >
            {tema === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
                  {iniciais}
                </span>
                <span className="hidden max-w-28 truncate sm:inline">{usuario?.nome}</span>
                <Menu className="size-4 md:hidden" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="truncate">
                {usuario?.email || "Sessão ativa"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/dashboard" })}>
                <LayoutDashboard className="size-4" /> Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/analises" })}>
                <History className="size-4" /> Histórico de análises
              </DropdownMenuItem>
              {usuario?.isAdmin ? (
                <DropdownMenuItem onClick={() => navigate({ to: "/admin" })}>
                  <Shield className="size-4" /> Área administrativa
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={sair} className="text-destructive focus:text-destructive">
                <LogOut className="size-4" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

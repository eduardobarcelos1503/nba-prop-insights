import { createFileRoute, Link } from "@tanstack/react-router";
import { Home, SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/$")({
  head: () => ({
    meta: [
      { title: "Página não encontrada — NBA Props Analyzer" },
      { name: "description", content: "Esta página não existe no NBA Props Analyzer." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Página não encontrada — NBA Props Analyzer" },
      { property: "og:description", content: "Esta página não existe no NBA Props Analyzer." },
    ],
  }),
  component: NaoEncontrada,
});

function NaoEncontrada() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <span className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <SearchX className="size-7" />
        </span>
        <h1 className="text-gradient-accent text-5xl font-bold">404</h1>
        <h2 className="mt-3 text-xl font-semibold">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          O endereço acessado não existe ou foi movido. Volte ao painel para continuar suas análises.
        </p>
        <Button asChild className="mt-6">
          <Link to="/dashboard">
            <Home className="size-4" /> Ir para o dashboard
          </Link>
        </Button>
      </div>
    </main>
  );
}

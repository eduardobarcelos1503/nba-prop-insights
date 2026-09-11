import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NBA Props Analyzer — análise de props de pontuação" },
      {
        name: "description",
        content:
          "Dashboard para analisar props de pontuação da NBA: média, desvio padrão, percentual histórico, edge e valor esperado.",
      },
      { property: "og:title", content: "NBA Props Analyzer" },
      {
        property: "og:description",
        content: "Analise linhas de pontuação da NBA com estatística e valor esperado.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { autenticado, carregando } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (carregando) return;
    navigate({ to: autenticado ? "/dashboard" : "/login", replace: true });
  }, [autenticado, carregando, navigate]);

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <Skeleton className="h-10 w-56" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </main>
  );
}

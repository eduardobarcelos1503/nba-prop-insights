import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export function RequireAuth({
  children,
  somenteAdmin = false,
}: {
  children: ReactNode;
  somenteAdmin?: boolean;
}) {
  const { autenticado, carregando, usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (carregando) return;
    if (!autenticado) {
      navigate({ to: "/login", replace: true });
      return;
    }
    if (somenteAdmin && !usuario?.isAdmin) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [autenticado, carregando, navigate, somenteAdmin, usuario]);

  if (carregando || !autenticado || (somenteAdmin && !usuario?.isAdmin)) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 p-6">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  return <>{children}</>;
}

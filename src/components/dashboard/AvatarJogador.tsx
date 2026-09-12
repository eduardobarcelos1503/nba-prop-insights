import { cn } from "@/lib/utils";

/** Avatar com as iniciais do jogador — o backend não fornece fotos. */
export function AvatarJogador({
  nome,
  className,
}: {
  nome: string;
  className?: string;
}) {
  const iniciais = nome
    .trim()
    .split(/\s+/)
    .filter((parte) => parte.length > 1)
    .slice(0, 2)
    .map((parte) => parte[0]!.toUpperCase())
    .join("");

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground",
        className,
      )}
    >
      {iniciais || "NBA"}
    </span>
  );
}

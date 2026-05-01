import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon, titulo, subtitulo, action, className,
}: {
  icon: LucideIcon;
  titulo: string;
  subtitulo?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-12 px-6", className)}>
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold mb-1">{titulo}</h3>
      {subtitulo && <p className="text-sm text-muted-foreground max-w-xs">{subtitulo}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
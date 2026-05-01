import { cn } from "@/lib/utils";
import type { EstadoReporte } from "@/lib/types";

const map: Record<EstadoReporte, { label: string; cls: string }> = {
  pendiente: { label: "Pendiente", cls: "bg-warning/15 text-warning border-warning/30" },
  en_proceso: { label: "En proceso", cls: "bg-info/15 text-info border-info/30" },
  resuelto: { label: "Resuelto", cls: "bg-success/15 text-success border-success/30" },
};

export function StatusBadge({ estado, className }: { estado: EstadoReporte; className?: string }) {
  const { label, cls } = map[estado];
  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border", cls, className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
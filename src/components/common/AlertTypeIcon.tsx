import { Shield, Smartphone, AlertTriangle, Info } from "lucide-react";
import type { TipoAlerta } from "@/lib/types";
import { cn } from "@/lib/utils";

const map: Record<TipoAlerta, { Icon: typeof Shield; color: string; bar: string; label: string }> = {
  epp: { Icon: Shield, color: "text-primary", bar: "bg-primary", label: "EPP" },
  celular: { Icon: Smartphone, color: "text-danger", bar: "bg-danger", label: "Celular" },
  riesgo: { Icon: AlertTriangle, color: "text-warning", bar: "bg-warning", label: "Riesgo" },
  info: { Icon: Info, color: "text-info", bar: "bg-info", label: "Información" },
};

export function AlertTypeIcon({ tipo, size = 32, className }: { tipo: TipoAlerta; size?: number; className?: string }) {
  const { Icon, color } = map[tipo];
  return <Icon size={size} className={cn(color, className)} aria-label={map[tipo].label} />;
}

export function alertaMeta(tipo: TipoAlerta) { return map[tipo]; }
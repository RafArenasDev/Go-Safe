import { cn } from "@/lib/utils";
import type { Rol } from "@/lib/types";
import { iniciales } from "@/lib/format";

const bg: Record<Rol, string> = {
  conductor: "bg-role-conductor",
  bodega: "bg-role-bodega",
  supervisor: "bg-role-supervisor",
};
const label: Record<Rol, string> = {
  conductor: "Conductor",
  bodega: "Bodega",
  supervisor: "Supervisor",
};

export function RoleAvatar({ nombre, rol, size = 40, className }: { nombre: string; rol: Rol; size?: number; className?: string }) {
  return (
    <div
      className={cn("rounded-full flex items-center justify-center text-white font-bold shrink-0", bg[rol], className)}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-label={nombre}
    >
      {iniciales(nombre)}
    </div>
  );
}

export function RoleBadge({ rol, className }: { rol: Rol; className?: string }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white", bg[rol], className)}>
      {label[rol]}
    </span>
  );
}

export const rolLabel = label;
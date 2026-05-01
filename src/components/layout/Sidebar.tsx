import { NavLink } from "react-router-dom";
import { Home, FileWarning, ClipboardCheck, GraduationCap, Bell, FileText, User, BarChart3, Truck, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { RoleAvatar, rolLabel } from "@/components/common/RoleAvatarBadge";
import logo from "@/assets/logo-gosafe.png";
import { cn } from "@/lib/utils";
import type { Rol } from "@/lib/types";

type Item = { to: string; label: string; icon: typeof Home; roles?: Rol[] };

const items: Item[] = [
  { to: "/dashboard", label: "Inicio", icon: Home },
  { to: "/reportes", label: "Reportes", icon: FileWarning },
  { to: "/checklist", label: "Checklist", icon: ClipboardCheck, roles: ["bodega", "supervisor"] },
  { to: "/inspeccion", label: "Inspección Pre-Op", icon: Truck, roles: ["conductor", "supervisor"] },
  { to: "/capacitacion", label: "Capacitación", icon: GraduationCap },
  { to: "/indicadores", label: "Indicadores", icon: BarChart3, roles: ["supervisor"] },
  { to: "/alertas", label: "Alertas", icon: Bell },
  { to: "/documentos", label: "Documentos", icon: FileText },
  { to: "/perfil", label: "Perfil", icon: User },
];

export function Sidebar() {
  const { usuario } = useAuth();
  if (!usuario) return null;

  const visibles = items.filter(i => !i.roles || i.roles.includes(usuario.rol));

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-60 bg-sidebar border-r border-sidebar-border z-30">
      <div className="px-5 py-5 border-b border-sidebar-border">
        <img src={logo} alt="GoSafe Logo" className="w-full h-auto" />
      </div>
      <nav className="flex-1 overflow-y-auto py-3">
        <ul className="space-y-1 px-2">
          {visibles.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  )
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <NavLink to="/perfil" className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
          <RoleAvatar nombre={usuario.nombre} rol={usuario.rol} size={36} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold truncate">{usuario.nombre}</div>
            <div className="text-[11px] text-muted-foreground truncate">{rolLabel[usuario.rol]} · {usuario.area}</div>
          </div>
        </NavLink>
      </div>
    </aside>
  );
}

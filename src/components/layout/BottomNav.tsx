import { NavLink, useLocation } from "react-router-dom";
import { Home, FileWarning, ClipboardCheck, GraduationCap, MoreHorizontal } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/storage";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Inicio", icon: Home },
  { to: "/reportes", label: "Reportes", icon: FileWarning },
  { to: "/checklist", label: "Checklist", icon: ClipboardCheck },
  { to: "/capacitacion", label: "Capacitación", icon: GraduationCap },
  { to: "/mas", label: "Más", icon: MoreHorizontal },
];

export function BottomNav() {
  const { usuario } = useAuth();
  const [unread, setUnread] = useState(0);
  const location = useLocation();

  useEffect(() => {
    setUnread(db.alertas.list().filter(a => !a.leida).length);
  }, [location.pathname]);

  if (!usuario) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-card/95 backdrop-blur border-t border-border safe-pb">
      <ul className="grid grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2.5 min-h-[56px] text-[11px] font-medium transition-colors relative",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
              {to === "/mas" && unread > 0 && (
                <span className="absolute top-1.5 right-[28%] w-2 h-2 rounded-full bg-danger ring-2 ring-card" aria-label={`${unread} alertas sin leer`} />
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
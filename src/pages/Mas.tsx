import { Link } from "react-router-dom";
import { Bell, FileText, User, BarChart3, ClipboardCheck, Truck, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/storage";
import { useState } from "react";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { RoleAvatar, RoleBadge } from "@/components/common/RoleAvatarBadge";

export default function Mas() {
  const { usuario, logout } = useAuth();
  const [confirm, setConfirm] = useState(false);
  const nav = useNavigate();
  if (!usuario) return null;

  const sinLeer = db.alertas.list().filter(a => !a.leida).length;

  const items = [
    { to: "/alertas", icon: Bell, label: "Alertas", badge: sinLeer || undefined, all: true },
    { to: "/inspeccion", icon: Truck, label: "Inspección Pre-Op", roles: ["conductor", "supervisor"] as const },
    { to: "/checklist", icon: ClipboardCheck, label: "Checklist", roles: ["bodega", "supervisor"] as const },
    { to: "/indicadores", icon: BarChart3, label: "Indicadores", roles: ["supervisor"] as const },
    { to: "/documentos", icon: FileText, label: "Documentos", all: true },
    { to: "/perfil", icon: User, label: "Perfil", all: true },
  ];

  return (
    <div>
      <Link to="/perfil" className="gosafe-card p-4 flex items-center gap-3 mb-5">
        <RoleAvatar nombre={usuario.nombre} rol={usuario.rol} size={48} />
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{usuario.nombre}</div>
          <div className="flex items-center gap-2 mt-1"><RoleBadge rol={usuario.rol} /><span className="text-xs text-muted-foreground truncate">{usuario.area}</span></div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </Link>

      <div className="gosafe-card divide-y divide-border">
        {items.filter(i => i.all || (i.roles as readonly string[] | undefined)?.includes(usuario.rol)).map(i => (
          <Link key={i.to} to={i.to} className="flex items-center gap-3 p-4 hover:bg-accent/50 transition-colors">
            <i.icon className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 font-medium">{i.label}</span>
            {i.badge ? <span className="bg-danger text-danger-foreground text-[10px] font-bold rounded-full px-2 py-0.5">{i.badge}</span> : null}
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <button
        onClick={() => setConfirm(true)}
        className="mt-6 w-full gosafe-card p-4 flex items-center justify-center gap-2 text-danger font-semibold hover:bg-danger/10 transition-colors"
      >
        <LogOut className="w-4 h-4" /> Cerrar sesión
      </button>

      <ConfirmModal
        open={confirm} onOpenChange={setConfirm}
        titulo="Cerrar sesión"
        mensaje="¿Estás seguro que deseas cerrar sesión?"
        confirmLabel="Sí, cerrar sesión"
        danger
        onConfirm={() => { logout(); toast.success("Sesión cerrada correctamente"); nav("/login", { replace: true }); }}
      />
    </div>
  );
}
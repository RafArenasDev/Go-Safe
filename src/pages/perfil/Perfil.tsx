import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/storage";
import { RoleAvatar, RoleBadge } from "@/components/common/RoleAvatarBadge";
import { Button } from "@/components/ui/button";
import { LogOut, Mail, MapPin, CalendarDays, FileWarning, GraduationCap, ClipboardCheck } from "lucide-react";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { toast } from "sonner";
import { formatearFechaRelativa } from "@/lib/format";

export default function Perfil() {
  const { usuario, logout } = useAuth();
  const nav = useNavigate();
  const [confirm, setConfirm] = useState(false);
  if (!usuario) return null;

  const reportes = db.reportes.list().filter(r => r.usuarioId === usuario.id);
  const caps = db.capacitaciones.list();
  const progreso = db.progreso.list().filter(p => p.usuarioId === usuario.id);
  const checklists = db.checklists.list().filter(c => c.usuarioId === usuario.id);

  type Activity = { tipo: string; texto: string; fecha: string; Icon: typeof FileWarning };
  const actividades: Activity[] = [
    ...reportes.slice(0, 4).map(r => ({ tipo: "reporte", texto: `Reporte enviado: ${r.titulo}`, fecha: r.fecha, Icon: FileWarning })),
    ...progreso.slice(0, 3).map(p => {
      const c = caps.find(x => x.id === p.capacitacionId);
      return { tipo: "cap", texto: `Capacitación completada: ${c?.titulo ?? ""}`, fecha: p.fecha, Icon: GraduationCap };
    }),
    ...checklists.slice(0, 2).map(c => ({ tipo: "chk", texto: `Checklist de ${c.categoria} completado`, fecha: c.fecha, Icon: ClipboardCheck })),
  ].sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha)).slice(0, 8);

  return (
    <div>
      <div className="flex flex-col items-center text-center gap-3 mb-6">
        <RoleAvatar nombre={usuario.nombre} rol={usuario.rol} size={84} />
        <div>
          <h1 className="text-xl font-bold">{usuario.nombre}</h1>
          <div className="flex items-center justify-center gap-2 mt-1.5">
            <RoleBadge rol={usuario.rol} />
            <span className="text-xs text-muted-foreground">{usuario.area}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat n={reportes.length} l="Reportes" />
        <Stat n={`${progreso.length}/${caps.length}`} l="Capacitaciones" />
        <Stat n={checklists.length} l="Checklists" />
      </div>

      <section className="gosafe-card p-4 space-y-2.5 mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Información</h2>
        <Info icon={Mail} label="Correo" value={usuario.email} />
        <Info icon={MapPin} label="Área" value={usuario.area} />
        <Info icon={CalendarDays} label="Ingreso" value={new Date(usuario.fechaIngreso).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })} />
      </section>

      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Actividad reciente</h2>
        <ol className="relative border-l border-border ml-2 space-y-3 pl-4">
          {actividades.map((a, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
              <div className="flex items-start gap-2">
                <a.Icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm">{a.texto}</div>
                  <div className="text-[11px] text-muted-foreground">{formatearFechaRelativa(a.fecha)}</div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <Button onClick={() => setConfirm(true)} variant="outline" className="w-full h-12 border-danger/30 text-danger hover:bg-danger/10 hover:text-danger">
        <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
      </Button>

      <ConfirmModal open={confirm} onOpenChange={setConfirm}
        titulo="Cerrar sesión" mensaje="¿Estás seguro que deseas cerrar sesión?"
        confirmLabel="Sí, cerrar sesión" danger
        onConfirm={() => { logout(); toast.success("Sesión cerrada correctamente"); nav("/login", { replace: true }); }} />
    </div>
  );
}

function Stat({ n, l }: { n: number | string; l: string }) {
  return (
    <div className="gosafe-card p-3 text-center">
      <div className="text-xl font-extrabold text-primary">{n}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{l}</div>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium truncate">{value}</span>
    </div>
  );
}
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/storage";
import type { Reporte } from "@/lib/types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { CircularProgress, ProgressBar } from "@/components/common/ProgressBar";
import { RoleAvatar } from "@/components/common/RoleAvatarBadge";
import { formatearFechaCorta, formatearFechaRelativa } from "@/lib/format";
import { AlertTriangle, ClipboardCheck, FileWarning, GraduationCap, ShieldAlert, TrendingUp, TrendingDown, Activity, Bell, PhoneOff } from "lucide-react";
import { SkeletonList } from "@/components/common/SkeletonCard";
import { AlertTypeIcon } from "@/components/common/AlertTypeIcon";

export default function Dashboard() {
  const { usuario } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t); }, []);

  if (!usuario) return null;

  return (
    <div>
      <header className="mb-5">
        <p className="text-sm text-muted-foreground">¡Hola, {usuario.nombre.split(" ")[0]}!</p>
        <h1 className="text-2xl font-bold tracking-tight">{
          usuario.rol === "supervisor" ? "Panel de control" :
          usuario.rol === "bodega" ? "Operación de bodega" : "Tu jornada"
        }</h1>
      </header>

      {loading ? <SkeletonList count={3} /> : (
        usuario.rol === "conductor" ? <VistaConductor /> :
        usuario.rol === "bodega" ? <VistaBodega /> :
        <VistaSupervisor />
      )}
    </div>
  );
}

// function EPPBanner() {
//   return (
//     <div className="rounded-xl bg-gradient-to-r from-primary/90 to-primary text-primary-foreground p-4 flex items-start gap-3">
//       <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
//       <div>
//         <div className="font-semibold">Recuerda usar tu EPP en toda la jornada</div>
//         <div className="text-xs opacity-90 mt-0.5">Casco, chaleco reflectivo y zapatos de seguridad obligatorios.</div>
//       </div>
//     </div>
//   );
// }

// function CelularBanner() {
//   return (
//     <div className="rounded-xl bg-gradient-to-r from-warning/90 to-warning text-warning-foreground p-4 flex items-start gap-3">
//       <PhoneOff className="w-6 h-6 shrink-0 mt-0.5" />
//       <div>
//         <div className="font-semibold">No uses el celular mientras conduces</div>
//         <div className="text-xs opacity-90 mt-0.5">Es obligación legal en todo el territorio nacional.</div>
//       </div>
//     </div>
//   );
// }

function AccionRapida({ to, icon: Icon, label, color }: { to: string; icon: typeof FileWarning; label: string; color: string }) {
  return (
    <Link to={to} className="gosafe-card p-4 flex flex-col items-center text-center gap-2 active:scale-[0.98]">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className="text-xs font-medium leading-tight">{label}</span>
    </Link>
  );
}

function VistaConductor() {
  const { usuario } = useAuth();
  const reportes = db.reportes.list().filter(r => r.usuarioId === usuario!.id).slice(0, 3);
  const alertas = db.alertas.list().filter(a => !a.leida).slice(0, 2);

  return (
    <div className="space-y-6">
      {/* <CelularBanner />
      <EPPBanner /> */}
      <div className="grid grid-cols-3 gap-3">
        <AccionRapida to="/inspeccion" icon={ClipboardCheck} label="Inspección Pre-Op" color="bg-info" />
        <AccionRapida to="/reportes/nuevo" icon={FileWarning} label="Reportar Novedad" color="bg-primary" />
        <AccionRapida to="/capacitacion" icon={GraduationCap} label="Mis Capacitaciones" color="bg-role-supervisor" />
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Mis últimas novedades</h2>
        <div className="space-y-2">
          {reportes.length === 0 && <p className="text-sm text-muted-foreground">Aún no has reportado novedades.</p>}
          {reportes.map(r => <ReporteMini key={r.id} r={r} />)}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Alertas recientes</h2>
        <div className="space-y-2">
          {alertas.map(a => (
            <Link to="/alertas" key={a.id} className="gosafe-card p-3 flex items-center gap-3">
              <AlertTypeIcon tipo={a.tipo} size={24} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{a.titulo}</div>
                <div className="text-xs text-muted-foreground truncate">{a.descripcion}</div>
              </div>
              <span className="text-[10px] text-muted-foreground">{formatearFechaRelativa(a.fecha)}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function ReporteMini({ r }: { r: Reporte }) {
  return (
    <Link to={`/reportes/${r.id}`} className="gosafe-card p-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
        <FileWarning className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{r.titulo}</div>
        <div className="text-[11px] text-muted-foreground">{formatearFechaCorta(r.fecha)}</div>
      </div>
      <StatusBadge estado={r.estado} />
    </Link>
  );
}

function VistaBodega() {
  const plantillas = db.plantillas.list().find(p => p.categoria === "bodega");
  const total = plantillas?.items.length ?? 0;
  const completados = db.checklists.list().filter(c => c.categoria === "bodega").length > 0 ? Math.round(total * 0.6) : 0;
  const reportes = db.reportes.list().filter(r => r.area === "Bodega Central").slice(0, 4);
  const riesgos = db.reportes.list().filter(r => r.area === "Bodega Central" && r.estado !== "resuelto").length;
  const pendientes = db.reportes.list().filter(r => r.estado === "pendiente").length;
  const checklistMes = db.checklists.list().length + 12;

  return (
    <div className="space-y-6">
      <div className="gosafe-card p-5 flex items-center gap-5">
        <CircularProgress value={(completados/Math.max(total,1))*100} size={88} label="hoy" />
        <div className="flex-1">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Checklist del día</div>
          <div className="text-lg font-bold mt-0.5">{completados} de {total} ítems</div>
          <Link to="/checklist" className="text-xs text-primary font-semibold mt-1 inline-block">Continuar →</Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Metric label="Riesgos activos" value={riesgos} color="text-danger" />
        <Metric label="Reportes pendientes" value={pendientes} color="text-warning" />
        <Metric label="Checklists del mes" value={checklistMes} color="text-success" />
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Reportes recientes</h2>
        <div className="space-y-2">{reportes.map(r => <ReporteMini key={r.id} r={r} />)}</div>
      </section>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="gosafe-card p-3 text-center">
      <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
      <div className="text-[10px] uppercase text-muted-foreground tracking-wider mt-0.5 leading-tight">{label}</div>
    </div>
  );
}

function VistaSupervisor() {
  const reportes = db.reportes.list();
  const incidentesMes = reportes.filter(r => new Date(r.fecha).getMonth() === new Date().getMonth() - 1 || new Date(r.fecha).getMonth() === new Date().getMonth()).length;
  const checklistsHoy = db.checklists.list().filter(c => new Date(c.fecha).toDateString() === new Date().toDateString()).length + 8;
  const riesgos = reportes.filter(r => r.estado !== "resuelto").length;
  const sinLeer = db.alertas.list().filter(a => !a.leida).length;

  const porArea = ["Calle Norte", "Bodega Central", "Oficina Principal"].map(a => ({
    area: a,
    incidentes: reportes.filter(r => r.area === a).length,
  }));
  const max = Math.max(...porArea.map(p => p.incidentes), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <KpiCard title="Incidentes del mes" value={incidentesMes} icon={Activity} hint="vs mes anterior" trend={-12} />
        <KpiCard title="Checklists hoy" value={checklistsHoy} icon={ClipboardCheck} hint="meta: 25" progress={Math.min(100, (checklistsHoy/25)*100)} />
        <KpiCard title="Riesgos activos" value={riesgos} icon={AlertTriangle} valueColor={riesgos > 5 ? "text-danger" : riesgos > 0 ? "text-warning" : "text-success"} />
        <KpiCard title="Alertas sin leer" value={sinLeer} icon={Bell} valueColor={sinLeer > 0 ? "text-danger" : "text-success"} />
      </div>

      <section className="gosafe-card p-5">
        <h2 className="text-sm font-semibold mb-4">Incidentes por área</h2>
        <div className="space-y-3">
          {porArea.map(p => (
            <div key={p.area}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{p.area}</span>
                <span className="font-semibold">{p.incidentes}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(p.incidentes/max)*100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Actividad reciente</h2>
        <Feed />
      </section>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, hint, trend, progress, valueColor }: { title: string; value: number; icon: typeof Activity; hint?: string; trend?: number; progress?: number; valueColor?: string }) {
  return (
    <div className="gosafe-card p-4">
      <div className="flex items-start justify-between">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{title}</div>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className={`text-3xl font-extrabold mt-2 ${valueColor ?? ""}`}>{value}</div>
      {hint && (
        <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
          {typeof trend === "number" && (trend < 0 ? <TrendingDown className="w-3 h-3 text-success" /> : <TrendingUp className="w-3 h-3 text-danger" />)}
          {typeof trend === "number" ? <span>{Math.abs(trend)}% {hint}</span> : hint}
        </div>
      )}
      {typeof progress === "number" && <ProgressBar value={progress} className="mt-2" />}
    </div>
  );
}

function Feed() {
  const usuarios = db.usuarios.list();
  const reportes = db.reportes.list().slice(0, 8);
  return (
    <div className="gosafe-card divide-y divide-border">
      {reportes.map(r => {
        const u = usuarios.find(x => x.id === r.usuarioId)!;
        return (
          <div key={r.id} className="flex items-center gap-3 p-3">
            <RoleAvatar nombre={u.nombre} rol={u.rol} size={32} />
            <div className="flex-1 min-w-0">
              <div className="text-sm"><span className="font-semibold">{u.nombre.split(" ")[0]}</span> reportó: <span className="text-muted-foreground">{r.titulo}</span></div>
              <div className="text-[11px] text-muted-foreground">{formatearFechaRelativa(r.fecha)}</div>
            </div>
            <StatusBadge estado={r.estado} />
          </div>
        );
      })}
    </div>
  );
}
import { db } from "@/lib/storage";
import { Activity, AlertTriangle, Bell, ClipboardCheck } from "lucide-react";
import { ProgressBar } from "@/components/common/ProgressBar";
import { PageHeader } from "@/components/common/PageHeader";
import { cn } from "@/lib/utils";

export default function Indicadores() {
  const reportes = db.reportes.list();
  const incidentesMes = reportes.length;
  const checklists = db.checklists.list().length + 18;
  const meta = 60;
  const riesgos = reportes.filter(r => r.estado !== "resuelto").length;
  const sinLeer = db.alertas.list().filter(a => !a.leida).length;

  const meses = ["Nov", "Dic", "Ene", "Feb", "Mar", "Abr"];
  const datos = [4, 7, 5, 9, 6, 8];
  const max = Math.max(...datos);

  const tipos: Record<string, number> = {};
  reportes.forEach(r => { const k = r.tipo.replace("_", " "); tipos[k] = (tipos[k] ?? 0) + 1; });
  const top = Object.entries(tipos).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topMax = Math.max(...top.map(t => t[1]), 1);

  const areas = ["Calle Norte", "Bodega Central", "Oficina Principal"].map(a => ({
    area: a,
    incidentes: reportes.filter(r => r.area === a).length,
    checklists: Math.floor(Math.random() * 15 + 5),
  }));

  return (
    <div>
      <PageHeader titulo="Indicadores" subtitulo="KPIs operacionales del mes" />

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Kpi label="Incidentes del mes" value={incidentesMes} icon={Activity} hint="↓ 12% vs mes anterior" hintColor="text-success" />
        <Kpi label="Checklists realizados" value={checklists} icon={ClipboardCheck} extra={<ProgressBar value={(checklists/meta)*100} className="mt-2" />} />
        <Kpi label="Riesgos activos" value={riesgos} icon={AlertTriangle} valueColor={riesgos > 5 ? "text-danger" : riesgos > 0 ? "text-warning" : "text-success"} />
        <Kpi label="Alertas sin leer" value={sinLeer} icon={Bell} valueColor={sinLeer > 0 ? "text-danger" : "text-success"} />
      </div>

      <section className="gosafe-card p-5 mb-6">
        <h2 className="text-sm font-semibold mb-4">Incidentes — últimos 6 meses</h2>
        <div className="flex items-end gap-3 h-40">
          {datos.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-primary/80 rounded-t-md transition-all" style={{ height: `${(d/max)*100}%` }} />
              <span className="text-[10px] text-muted-foreground">{meses[i]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Por área</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {areas.map(a => (
            <div key={a.area} className="gosafe-card p-4">
              <div className="font-semibold text-sm mb-2">{a.area}</div>
              <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Incidentes</span><span className="font-bold text-danger">{a.incidentes}</span></div>
              <div className="flex items-center justify-between text-xs mt-1"><span className="text-muted-foreground">Checklists</span><span className="font-bold">{a.checklists}</span></div>
            </div>
          ))}
        </div>
      </section>

      <section className="gosafe-card p-5">
        <h2 className="text-sm font-semibold mb-3">Top 5 tipos de reporte</h2>
        <ul className="space-y-2.5">
          {top.map(([k, v]) => (
            <li key={k}>
              <div className="flex justify-between text-xs mb-1"><span className="capitalize">{k}</span><span className="font-semibold">{v}</span></div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${(v/topMax)*100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Kpi({ label, value, icon: Icon, hint, hintColor, extra, valueColor }: { label: string; value: number; icon: typeof Activity; hint?: string; hintColor?: string; extra?: React.ReactNode; valueColor?: string }) {
  return (
    <div className="gosafe-card p-4">
      <div className="flex items-start justify-between">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className={cn("text-3xl font-extrabold mt-2", valueColor)}>{value}</div>
      {hint && <div className={cn("text-[11px] mt-1", hintColor ?? "text-muted-foreground")}>{hint}</div>}
      {extra}
    </div>
  );
}
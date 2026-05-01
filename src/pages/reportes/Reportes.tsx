import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Triangle, Zap, Cross, Inbox, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/storage";
import type { EstadoReporte, TipoReporte } from "@/lib/types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatearFechaCorta } from "@/lib/format";
import { EmptyState } from "@/components/common/EmptyState";
import { SkeletonList } from "@/components/common/SkeletonCard";
import { FAB } from "@/components/common/FAB";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/common/PageHeader";

const tipoIcono: Record<TipoReporte, { Icon: typeof Triangle; color: string }> = {
  condicion_insegura: { Icon: Triangle, color: "text-warning" },
  incidente: { Icon: Zap, color: "text-primary" },
  accidente: { Icon: Cross, color: "text-danger" },
};

type Filtro = "todos" | EstadoReporte | "area";

export default function Reportes() {
  const { usuario } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [areaSel, setAreaSel] = useState<string>("Todas");

  useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);

  const reportes = useMemo(() => {
    let r = db.reportes.list();
    if (usuario?.rol === "conductor") r = r.filter(x => x.usuarioId === usuario.id);
    if (filtro !== "todos" && filtro !== "area") r = r.filter(x => x.estado === filtro);
    if (filtro === "area" && areaSel !== "Todas") r = r.filter(x => x.area === areaSel);
    if (q.trim()) {
      const ql = q.toLowerCase();
      r = r.filter(x => x.titulo.toLowerCase().includes(ql) || x.descripcion.toLowerCase().includes(ql) || x.area.toLowerCase().includes(ql));
    }
    return r;
  }, [usuario, filtro, areaSel, q]);

  const chips: { v: Filtro; label: string }[] = [
    { v: "todos", label: "Todos" },
    { v: "pendiente", label: "Pendiente" },
    { v: "en_proceso", label: "En proceso" },
    { v: "resuelto", label: "Resuelto" },
    ...(usuario?.rol === "supervisor" ? [{ v: "area" as Filtro, label: "Por área" }] : []),
  ];

  return (
    <div>
      <PageHeader titulo="Reportes" subtitulo={usuario?.rol === "conductor" ? "Tus novedades" : "Novedades del equipo"} />

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar reporte…" className="pl-9 bg-card border-border h-11" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 mb-3 scrollbar-none">
        {chips.map(c => (
          <button key={c.v} onClick={() => setFiltro(c.v)}
            className={cn("px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors",
              filtro === c.v ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground")}>
            {c.label}
          </button>
        ))}
      </div>

      {filtro === "area" && usuario?.rol === "supervisor" && (
        <div className="flex gap-2 mb-3">
          {["Todas", "Calle Norte", "Bodega Central", "Oficina Principal"].map(a => (
            <button key={a} onClick={() => setAreaSel(a)}
              className={cn("px-2.5 py-1 rounded-md text-[11px] font-medium border", areaSel === a ? "bg-info/15 text-info border-info/30" : "bg-card border-border text-muted-foreground")}>
              {a}
            </button>
          ))}
        </div>
      )}

      {loading ? <SkeletonList count={4} /> : reportes.length === 0 ? (
        <EmptyState icon={Inbox} titulo="No hay reportes aún" subtitulo="Cuando registres una novedad aparecerá aquí." />
      ) : (
        <ul className="space-y-2">
          {reportes.map(r => {
            const { Icon, color } = tipoIcono[r.tipo];
            return (
              <li key={r.id}>
                <Link to={`/reportes/${r.id}`} className="gosafe-card p-3 flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0", color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-sm truncate">{r.titulo}</div>
                      <StatusBadge estado={r.estado} />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{r.descripcion}</p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                      <span>{formatearFechaCorta(r.fecha)}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                      <span className="px-1.5 py-0.5 rounded bg-muted">{r.area}</span>
                      {r.foto && <Camera className="w-3 h-3 ml-auto" />}
                    </div>
                  </div>
                  {r.foto && <img src={r.foto} alt="" className="w-12 h-12 rounded-lg object-cover" />}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <FAB onClick={() => nav("/reportes/nuevo")} ariaLabel="Nuevo reporte" />
    </div>
  );
}
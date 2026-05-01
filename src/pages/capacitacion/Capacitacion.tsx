import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Play, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/storage";
import type { RolCapacitacion } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/common/ProgressBar";
import { PageHeader } from "@/components/common/PageHeader";

const colorRol: Record<RolCapacitacion, string> = { conductor: "bg-role-conductor", bodega: "bg-role-bodega", general: "bg-info" };

export default function Capacitacion() {
  const { usuario } = useAuth();
  const caps = db.capacitaciones.list();
  const progreso = db.progreso.list().filter(p => p.usuarioId === usuario?.id);
  const visto = (id: string) => progreso.some(p => p.capacitacionId === id);

  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<"todos" | RolCapacitacion>("todos");

  const list = useMemo(() => caps.filter(c => {
    if (filtro !== "todos" && c.rol !== filtro) return false;
    if (q && !c.titulo.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [caps, filtro, q]);

  const completados = caps.filter(c => visto(c.id)).length;

  return (
    <div>
      <PageHeader titulo="Capacitación" subtitulo="Mantente al día con tu formación" />

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar capacitación…" className="pl-9 bg-card border-border h-11" />
      </div>

      {usuario?.rol === "supervisor" && (
        <div className="flex gap-2 mb-3">
          {(["todos", "conductor", "bodega", "general"] as const).map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border capitalize",
                filtro === f ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground")}>
              {f}
            </button>
          ))}
        </div>
      )}

      <div className="gosafe-card p-4 mb-4">
        <ProgressBar value={completados} max={caps.length} label={`${completados} de ${caps.length} capacitaciones completadas`} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {list.map(c => (
          <Link to={`/capacitacion/${c.id}`} key={c.id} className="gosafe-card overflow-hidden group">
            <div className="relative aspect-video bg-muted flex items-center justify-center">
              <img src={`https://i.ytimg.com/vi/${c.youtubeId}/hqdefault.jpg`} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" loading="lazy" />
              <Play className="relative w-10 h-10 text-white fill-white drop-shadow" />
              <span className="absolute bottom-1.5 right-1.5 text-[10px] bg-black/70 text-white px-1.5 py-0.5 rounded">{c.duracionMin} min</span>
              <span className={cn("absolute top-1.5 left-1.5 text-[10px] text-white px-1.5 py-0.5 rounded font-semibold capitalize", colorRol[c.rol])}>{c.rol}</span>
            </div>
            <div className="p-3">
              <div className="text-sm font-semibold line-clamp-2 mb-2">{c.titulo}</div>
              <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                visto(c.id) ? "bg-success/15 text-success border-success/30" : "bg-muted text-muted-foreground border-border")}>
                {visto(c.id) ? "Visto" : "Pendiente"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
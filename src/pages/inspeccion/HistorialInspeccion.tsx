import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import { ProgressBar } from "@/components/common/ProgressBar";
import { formatearFechaCorta } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function HistorialInspeccion() {
  const { usuario } = useAuth();
  const lista = db.inspecciones.list().filter(i => usuario?.rol === "supervisor" || i.usuarioId === usuario?.id);

  return (
    <div>
      <Link to="/inspeccion" className="flex items-center gap-1 text-sm text-muted-foreground mb-3 hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>
      <h1 className="text-2xl font-bold mb-5">Historial de inspecciones</h1>
      <ul className="space-y-2">
        {lista.map(i => (
          <li key={i.id} className="gosafe-card p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">Placa {i.placa}</div>
                <div className="text-[11px] text-muted-foreground">{formatearFechaCorta(i.fecha)}</div>
              </div>
              <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border",
                i.cumplimiento === 100 ? "bg-success/15 text-success border-success/30" : "bg-warning/15 text-warning border-warning/30")}>
                {i.cumplimiento === 100 ? "Apto" : "Con advertencias"}
              </span>
            </div>
            <ProgressBar value={i.cumplimiento} className="mt-2" color={i.cumplimiento === 100 ? "bg-success" : "bg-warning"} />
          </li>
        ))}
      </ul>
    </div>
  );
}
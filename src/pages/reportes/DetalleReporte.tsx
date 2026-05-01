import { useNavigate, useParams } from "react-router-dom";
import { db } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { ArrowLeft, MapPin } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatearFechaCorta } from "@/lib/format";
import { toast } from "sonner";
import type { EstadoReporte } from "@/lib/types";
import { EmptyState } from "@/components/common/EmptyState";
import { Inbox } from "lucide-react";

export default function DetalleReporte() {
  const { id } = useParams();
  const nav = useNavigate();
  const { usuario } = useAuth();
  const [reporte, setReporte] = useState(() => db.reportes.list().find(r => r.id === id));
  const [nuevoEstado, setNuevoEstado] = useState<EstadoReporte>(reporte?.estado ?? "pendiente");

  if (!reporte) return <EmptyState icon={Inbox} titulo="Reporte no encontrado" />;

  const actualizar = () => {
    if (!reporte) return;
    const ahora = new Date().toISOString();
    const historial = [...reporte.historial, { estado: nuevoEstado, fecha: ahora, por: usuario?.nombre }];
    const updated = db.reportes.update(reporte.id, { estado: nuevoEstado, historial });
    setReporte(updated);
    toast.success("Estado actualizado correctamente ✓");
  };

  return (
    <div>
      <button onClick={() => nav(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-3 hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      {reporte.foto && <img src={reporte.foto} alt="" className="w-full max-h-72 object-cover rounded-xl mb-4 border border-border" />}

      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{reporte.tipo.replace("_", " ")}</span>
        <StatusBadge estado={reporte.estado} />
      </div>
      <h1 className="text-xl font-bold">{reporte.titulo}</h1>
      <div className="text-xs text-muted-foreground mt-1">{formatearFechaCorta(reporte.fecha)} · {reporte.usuarioNombre}</div>

      <p className="text-sm leading-relaxed mt-4 text-foreground/90">{reporte.descripcion}</p>

      {reporte.ubicacion && (
        <div className="mt-4 gosafe-card p-3 flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-primary" /> {reporte.ubicacion}
        </div>
      )}

      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Historial de estados</h2>
        <ol className="relative border-l border-border ml-2 space-y-4 pl-4">
          {reporte.historial.map((h, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
              <div className="text-sm font-medium capitalize">{h.estado.replace("_", " ")}</div>
              <div className="text-[11px] text-muted-foreground">{formatearFechaCorta(h.fecha)}{h.por ? ` · ${h.por}` : ""}</div>
            </li>
          ))}
        </ol>
      </section>

      {usuario?.rol === "supervisor" && (
        <div className="mt-6 gosafe-card p-4">
          <div className="text-sm font-semibold mb-2">Cambiar estado</div>
          <div className="flex gap-2">
            <Select value={nuevoEstado} onValueChange={(v) => setNuevoEstado(v as EstadoReporte)}>
              <SelectTrigger className="bg-background border-border flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en_proceso">En proceso</SelectItem>
                <SelectItem value="resuelto">Resuelto</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={actualizar} className="bg-primary hover:bg-primary-glow text-primary-foreground">Actualizar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
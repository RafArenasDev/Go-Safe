import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/storage";
import { Check, X, CheckCircle2, AlertTriangle, History } from "lucide-react";
import { ProgressBar } from "@/components/common/ProgressBar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/common/PageHeader";

const INSPECTION_GROUPS = [
  { items: ["Freno de pedal", "Freno de emergencia"] },
  { items: ["Llantas calibradas (aire)", "Estado de las llantas"] },
  { items: ["Luces bajas", "Luces altas", "Direccionales"] },
];

const ALL_INSPECTION_ITEMS = INSPECTION_GROUPS.flatMap(g => g.items);

export default function Inspeccion() {
  const { usuario } = useAuth();
  const nav = useNavigate();
  const [respuestas, setRespuestas] = useState<Record<string, "si" | "no">>({});
  const [resultado, setResultado] = useState<{ pct: number; fallos: string[] } | null>(null);

  if (!usuario || (usuario.rol !== "conductor" && usuario.rol !== "supervisor")) return <p className="text-sm text-muted-foreground">Inspección no disponible para tu rol.</p>;

  const totalItems = ALL_INSPECTION_ITEMS.length;
  const completados = Object.keys(respuestas).length;
  const sies = Object.values(respuestas).filter(v => v === "si").length;
  const pct = totalItems > 0 ? Math.round((sies / totalItems) * 100) : 0;
  const placa = usuario.placa ?? "TRK-847";

  const completar = () => {
    if (completados < totalItems) { toast.error("Error: completa todos los ítems"); return; }
    const fallos = ALL_INSPECTION_ITEMS.filter(it => respuestas[it] === "no");
    db.inspecciones.add({
      id: `i${Date.now()}`,
      fecha: new Date().toISOString(),
      usuarioId: usuario.id,
      usuarioNombre: usuario.nombre,
      placa,
      items: ALL_INSPECTION_ITEMS.map(it => ({ seccion: "Vehículo", item: it, respuesta: respuestas[it] ?? null })),
      cumplimiento: pct,
    });
    setResultado({ pct, fallos });
    toast.success("Inspección completada ✓");
  };

  if (resultado) {
    const apto = resultado.pct === 100;
    return (
      <div className={cn("rounded-2xl p-6 text-center border", apto ? "bg-success/15 border-success/30" : "bg-warning/10 border-warning/30")}>
        {apto ? <CheckCircle2 className="w-16 h-16 text-success mx-auto" /> : <AlertTriangle className="w-16 h-16 text-warning mx-auto" />}
        <h2 className="text-xl font-bold mt-3">{apto ? "¡Vehículo apto para operación!" : "Vehículo con advertencias"}</h2>
        <p className="text-sm text-muted-foreground mt-1">Cumplimiento: {resultado.pct}%</p>
        {!apto && (
          <div className="mt-4 text-left bg-card rounded-lg p-3 border border-border">
            <div className="text-xs font-semibold text-warning uppercase mb-2">Ítems en advertencia:</div>
            <ul className="text-sm space-y-1 list-disc pl-5">{resultado.fallos.map((f, i) => <li key={i}>{f}</li>)}</ul>
          </div>
        )}
        <div className="mt-5 flex gap-2 justify-center">
          {!apto && <Button onClick={() => nav("/reportes/nuevo")} className="bg-primary hover:bg-primary-glow text-primary-foreground">Reportar novedad</Button>}
          <Button variant="outline" className="border-border" onClick={() => nav("/dashboard")}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader titulo="Inspección Pre-Operacional" subtitulo={new Date().toLocaleString("es-CO", { dateStyle: "full", timeStyle: "short" })}
        action={<Link to="/inspeccion/historial" className="text-xs flex items-center gap-1 text-primary font-semibold"><History className="w-3.5 h-3.5" /> Historial</Link>} />

      <div className="gosafe-card p-4 mb-4 flex items-center gap-3">
        <div className="flex-1">
          <div className="text-xs text-muted-foreground">Conductor</div>
          <div className="font-semibold">{usuario.nombre}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Placa</div>
          <div className="font-bold text-primary">{placa}</div>
        </div>
      </div>

      <div className="mb-4">
        <ProgressBar value={completados} max={totalItems} label={`${completados} de ${totalItems} ítems · ${pct}% cumplimiento`} />
      </div>

      <div className="space-y-3">
        {INSPECTION_GROUPS.map((group, i) => (
          <div key={i} className="gosafe-card border-border">
            <ul className="divide-y divide-border">
              {group.items.map(it => {
                const r = respuestas[it];
                return (
                  <li key={it} className="flex items-center gap-2 px-4 py-3">
                    <span className="flex-1 text-sm font-medium">{it}</span>
                    <button onClick={() => setRespuestas({ ...respuestas, [it]: "si" })}
                      className={cn("w-11 h-11 rounded-lg border flex items-center justify-center", r === "si" ? "bg-success border-success text-white" : "bg-muted border-border text-muted-foreground")}><Check className="w-5 h-5" /></button>
                    <button onClick={() => setRespuestas({ ...respuestas, [it]: "no" })}
                      className={cn("w-11 h-11 rounded-lg border flex items-center justify-center", r === "no" ? "bg-danger border-danger text-white" : "bg-muted border-border text-muted-foreground")}><X className="w-5 h-5" /></button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <Button onClick={completar} disabled={completados < totalItems} className="w-full h-12 mt-5 bg-primary hover:bg-primary-glow text-primary-foreground font-semibold">
        Completar Inspección
      </Button>
    </div>
  );
}

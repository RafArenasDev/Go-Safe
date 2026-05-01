import { useMemo, useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { db } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import type { CategoriaChecklist } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/common/ProgressBar";
import { SignaturePad, SignatureHandle } from "@/components/common/SignaturePad";
import { toast } from "sonner";
import { Check, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/common/PageHeader";

const labelCat: Record<CategoriaChecklist, string> = { vehiculo: "Vehículo", bodega: "Bodega", oficina: "Oficina" };

export default function Checklist() {
  const { usuario } = useAuth();
  const plantillas = db.plantillas.list();
  if (!usuario) return null;

  const tabsPermitidas: CategoriaChecklist[] = usuario.rol === "supervisor"
    ? ["vehiculo", "bodega", "oficina"]
    : usuario.rol === "bodega" ? ["bodega", "oficina"] : ["vehiculo"];

  const [activa, setActiva] = useState<CategoriaChecklist>(tabsPermitidas[0]);
  const [respuestas, setRespuestas] = useState<Record<string, "si" | "no" | undefined>>({});
  const [success, setSuccess] = useState<{ categoria: CategoriaChecklist; total: number; ok: number } | null>(null);
  const sigRef = useRef<SignatureHandle>(null);

  const items = useMemo(() => plantillas.find(p => p.categoria === activa)?.items ?? [], [activa, plantillas]);
  const completados = useMemo(() => items.filter(i => respuestas[`${activa}::${i}`]).length, [respuestas, activa, items]);
  const todoOk = completados === items.length && items.length > 0;

  const fechaHoy = new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const guardar = () => {
    if (!todoOk) { toast.error("Error: completa todos los ítems"); return; }
    if (sigRef.current?.isEmpty()) { toast.error("Falta la firma del responsable"); return; }
    const firma = sigRef.current!.toDataURL();
    const respList = items.map(i => ({ item: i, respuesta: respuestas[`${activa}::${i}`]! }));
    db.checklists.add({
      id: `chk${Date.now()}`,
      categoria: activa,
      fecha: new Date().toISOString(),
      usuarioId: usuario.id,
      usuarioNombre: usuario.nombre,
      respuestas: respList,
      firma,
    });
    setSuccess({ categoria: activa, total: items.length, ok: respList.filter(r => r.respuesta === "si").length });
    toast.success("Checklist guardado correctamente ✓");
  };

  if (success) {
    return (
      <div className="text-center py-10">
        <div className="w-20 h-20 mx-auto rounded-full bg-success/20 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-12 h-12 text-success" />
        </div>
        <h2 className="text-xl font-bold">Checklist guardado exitosamente</h2>
        <p className="text-sm text-muted-foreground mt-1">{labelCat[success.categoria]} · {success.ok}/{success.total} ítems en orden</p>
        <div className="mt-6 flex gap-2 justify-center">
          <Button variant="outline" className="border-border" onClick={() => { setSuccess(null); setRespuestas({}); sigRef.current?.clear(); }}>Otro checklist</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader titulo="Checklist diario" subtitulo={`${fechaHoy.charAt(0).toUpperCase() + fechaHoy.slice(1)} · ${usuario.nombre}`} />

      <Tabs value={activa} onValueChange={v => { setActiva(v as CategoriaChecklist); setRespuestas({}); }}>
        <TabsList className="bg-card border border-border w-full">
          {tabsPermitidas.map(c => <TabsTrigger key={c} value={c} className="flex-1">{labelCat[c]}</TabsTrigger>)}
        </TabsList>

        {tabsPermitidas.map(cat => (
          <TabsContent key={cat} value={cat} className="mt-4 space-y-4">
            <ProgressBar value={completados} max={items.length} label={`${completados} de ${items.length} ítems completados`} />
            <ul className="space-y-2">
              {items.map(it => {
                const key = `${cat}::${it}`;
                const r = respuestas[key];
                const isVehiculo = cat === 'vehiculo';
                
                const separatorAfter = isVehiculo && (it === 'Freno de emergencia' || it === 'Estado de las llantas');

                return (
                  <li key={it} className={cn("gosafe-card p-3 flex items-center gap-3 min-h-[56px]", separatorAfter && "mb-4")}>
                    <span className="flex-1 text-sm">{it}</span>
                    <div className="flex gap-1.5">
                      <button onClick={() => setRespuestas({ ...respuestas, [key]: "si" })}
                        className={cn("w-11 h-11 rounded-lg flex items-center justify-center border transition-colors",
                          r === "si" ? "bg-success border-success text-white" : "bg-muted border-border text-muted-foreground hover:text-foreground")}
                        aria-label="Sí"><Check className="w-5 h-5" /></button>
                      <button onClick={() => setRespuestas({ ...respuestas, [key]: "no" })}
                        className={cn("w-11 h-11 rounded-lg flex items-center justify-center border transition-colors",
                          r === "no" ? "bg-danger border-danger text-white" : "bg-muted border-border text-muted-foreground hover:text-foreground")}
                        aria-label="No"><X className="w-5 h-5" /></button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="gosafe-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Firma del responsable</span>
                <button onClick={() => sigRef.current?.clear()} className="text-xs text-primary font-medium">Limpiar firma</button>
              </div>
              <SignaturePad ref={sigRef} />
            </div>

            <Button onClick={guardar} disabled={!todoOk} className="w-full h-12 bg-primary hover:bg-primary-glow text-primary-foreground font-semibold">
              Guardar Checklist
            </Button>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

import { useState } from "react";
import { db } from "@/lib/storage";
import type { Alerta } from "@/lib/types";
import { AlertTypeIcon, alertaMeta } from "@/components/common/AlertTypeIcon";
import { formatearFechaRelativa, agruparPorFecha } from "@/lib/format";
import { Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/common/PageHeader";

export default function Alertas() {
  const [items, setItems] = useState<Alerta[]>(db.alertas.list());
  const sinLeer = items.filter(a => !a.leida).length;

  const marcar = (id: string) => { db.alertas.marcarLeida(id); setItems(db.alertas.list()); };
  const todas = () => { db.alertas.marcarTodas(); setItems(db.alertas.list()); };

  if (items.length === 0) return <EmptyState icon={ShieldCheck} titulo="¡Todo al día!" subtitulo="Sin alertas pendientes." />;

  const grupos = agruparPorFecha(items);

  return (
    <div>
      <PageHeader titulo="Alertas" subtitulo={`${sinLeer} alertas sin leer`}
        action={sinLeer > 0 ? <Button size="sm" variant="outline" className="border-border text-xs" onClick={todas}>Marcar todas</Button> : null} />

      {Object.entries(grupos).map(([k, arr]) => arr.length === 0 ? null : (
        <section key={k} className="mb-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">{k}</h2>
          <ul className="space-y-2">
            {arr.map(a => {
              const meta = alertaMeta(a.tipo);
              return (
                <li key={a.id} className={cn("gosafe-card p-3 flex items-start gap-3 border-l-4 relative", a.leida ? "opacity-70" : "")}
                    style={{ borderLeftColor: `hsl(var(--${a.tipo === "epp" ? "primary" : a.tipo === "celular" ? "danger" : a.tipo === "riesgo" ? "warning" : "info"}))` }}>
                  <AlertTypeIcon tipo={a.tipo} size={28} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{a.titulo}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{a.descripcion}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">{formatearFechaRelativa(a.fecha)}</div>
                  </div>
                  {!a.leida && (
                    <button onClick={() => marcar(a.id)} aria-label="Marcar como leída"
                      className="w-8 h-8 rounded-full bg-muted hover:bg-success hover:text-white flex items-center justify-center transition-colors">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
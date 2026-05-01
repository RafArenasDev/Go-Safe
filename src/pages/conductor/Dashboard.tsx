import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, FileWarning, ClipboardCheck, GraduationCap } from "lucide-react";

const alertas = [
  {
    titulo: "Vehículo TRK-847 con frenos largos",
    fecha: "3 de abr, 9:42 a. m.",
    estado: "Pendiente",
    leido: false
  },
  {
    titulo: "Atropellé a un perro",
    fecha: "7 de abr, 9:42 a. m.",
    estado: "En proceso",
    leido: false
  },
  {
    titulo: "Colisión leve con bordillo en parqueadero",
    fecha: "9 de abr, 9:42 a. m.",
    estado: "En proceso",
    leido: true
  }
];

export default function ConductorDashboard() {
  return (
    <div className="px-5 pb-5">
      <header className="pt-6 pb-8 space-y-1.5">
        <p className="text-muted-foreground">¡Hola, Carlos!</p>
        <h1 className="text-3xl font-bold text-foreground">Tu jornada</h1>
      </header>

      <main className="space-y-8">
        <section className="grid grid-cols-3 gap-4">
          <Button variant="gosafe-outline" className="h-24 flex-col gap-1.5 bg-indigo-500/10 border-indigo-500/20 text-indigo-500">
            <ClipboardCheck />
            <span>Inspección Pre-Op</span>
          </Button>
          <Button variant="gosafe-outline" className="h-24 flex-col gap-1.5 bg-primary/5 border-primary/20 text-primary">
            <FileWarning />
            <span>Reportar Novedad</span>
          </Button>
          <Button variant="gosafe-outline" className="h-24 flex-col gap-1.5 bg-violet-500/10 border-violet-500/20 text-violet-500">
            <GraduationCap />
            <span>Mis Capacitaciones</span>
          </Button>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Mis últimas novedades</h2>
          <div className="space-y-3">
            {alertas.map((alerta, index) => (
              <div key={index} className="p-4 flex items-center gap-4 border rounded-xl">
                <div className="p-2.5 bg-muted/20 border border-muted/30 rounded-lg">
                  <Info className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold leading-tight">{alerta.titulo}</h3>
                  <p className="text-xs text-muted-foreground">{alerta.fecha}</p>
                </div>
                <Badge variant={alerta.estado === "Pendiente" ? "warning" : "info"} className="whitespace-nowrap">
                  {alerta.estado}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
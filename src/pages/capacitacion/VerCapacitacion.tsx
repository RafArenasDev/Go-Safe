import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Play, Check } from "lucide-react";
import { db } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { ProgressBar } from "@/components/common/ProgressBar";

export default function VerCapacitacion() {
  const { id } = useParams();
  const nav = useNavigate();
  const { usuario } = useAuth();
  const cap = db.capacitaciones.list().find(c => c.id === id);
  const yaVisto = !!db.progreso.list().find(p => p.usuarioId === usuario?.id && p.capacitacionId === id);
  const [visto, setVisto] = useState(yaVisto);

  if (!cap) return <p>Capacitación no encontrada.</p>;

  const marcar = () => {
    db.progreso.add({ usuarioId: usuario!.id, capacitacionId: cap.id, fecha: new Date().toISOString() });
    setVisto(true);
    toast.success("Capacitación marcada como vista ✓");
  };

  return (
    <div>
      <button onClick={() => nav(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-3 hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4 relative">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${cap.youtubeId}`}
          title={cap.titulo}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <h1 className="text-xl font-bold">{cap.titulo}</h1>
      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
        <span className="capitalize">{cap.rol}</span> · <span>{cap.duracionMin} min</span>
      </div>
      <p className="text-sm leading-relaxed mt-3">{cap.descripcion}</p>

      <ProgressBar value={visto ? 100 : 35} className="mt-4" label="Progreso" />

      <Button onClick={marcar} disabled={visto} className="w-full h-12 mt-4 bg-primary hover:bg-primary-glow text-primary-foreground font-semibold">
        {visto ? <><Check className="w-4 h-4 mr-2" /> Visto</> : "Marcar como visto"}
      </Button>
    </div>
  );
}
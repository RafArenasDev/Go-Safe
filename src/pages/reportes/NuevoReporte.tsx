import { FormEvent, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, MapPin, Triangle, Zap, Cross, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/lib/storage";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { TipoReporte } from "@/lib/types";

const tipos: { v: TipoReporte; label: string; Icon: typeof Triangle; color: string }[] = [
  { v: "condicion_insegura", label: "Condición insegura", Icon: Triangle, color: "border-warning text-warning" },
  { v: "incidente", label: "Incidente", Icon: Zap, color: "border-primary text-primary" },
  { v: "accidente", label: "Accidente", Icon: Cross, color: "border-danger text-danger" },
];

export default function NuevoReporte() {
  const { usuario } = useAuth();
  const isMobile = useIsMobile();
  const nav = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [tipo, setTipo] = useState<TipoReporte>("condicion_insegura");
  const [desc, setDesc] = useState("");
  const [foto, setFoto] = useState<string | undefined>();
  const [ubic, setUbic] = useState("");
  const [gpsLoad, setGpsLoad] = useState(false);
  const [area, setArea] = useState<string>(usuario?.area === "Bodega Central" ? "Bodega Central" : usuario?.area === "Zona Norte" ? "Calle Norte" : "Oficina Principal");
  const [submitting, setSubmitting] = useState(false);

  const descError = desc.trim().length > 0 && desc.trim().length < 20 ? "Mínimo 20 caracteres." : null;
  const truncatedUbic = ubic.length > 40 ? ubic.substring(0, 37) + "..." : ubic;

  const onFile = (f: File | undefined) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setFoto(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleCameraClick = async () => {
    if (isMobile && navigator.permissions) {
      try {
        const status = await navigator.permissions.query({ name: "camera" });
        if (status.state === "denied") {
          toast.error("Permiso de cámara bloqueado.", { 
            description: "Para continuar, habilita el permiso en los ajustes de tu navegador.",
            duration: 6000,
          });
          return;
        }
      } catch (error) {
        console.warn("No se pudo verificar el permiso de la cámara:", error);
      }
    }
    fileRef.current?.click();
  };

  const obtenerGPS = () => {
    setGpsLoad(true);
    if (!navigator.geolocation) {
      toast.error("GPS no disponible en este dispositivo.");
      setGpsLoad(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords;
        const coordsString = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        setUbic(coordsString); // Set coords immediately as fallback

        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
          if (!response.ok) throw new Error("Servicio de geocodificación no disponible");
          const data = await response.json();
          
          if (data && data.address) {
            const { road, neighbourhood, state } = data.address;
            const locationString = [road, neighbourhood, state].filter(Boolean).join(', ');
            setUbic(locationString || coordsString);
          } else {
             toast.info("No se encontró el nombre de la ubicación, se usarán las coordenadas.");
          }
        } catch (error) {
          toast.warning("No se pudo obtener el nombre de la ubicación, se usarán las coordenadas.");
        } finally {
          setGpsLoad(false);
        }
      },
      (error) => {
        let message = "No se pudo obtener la ubicación.";
        let description = "Inténtalo de nuevo más tarde.";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Permiso de GPS denegado.";
          description = "Por favor, activa los permisos de ubicación para este sitio en los ajustes de tu navegador.";
        }
        toast.error(message, { description, duration: 6000 });
        setUbic("Ubicación no disponible");
        setGpsLoad(false);
      },
      { timeout: 10000, enableHighAccuracy: isMobile },
    );
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!usuario) return;
    if (desc.trim().length < 20) { toast.error("Error: completa todos los campos requeridos"); return; }
    setSubmitting(true);
    setTimeout(() => {
      const titulo = desc.trim().split("\n")[0].slice(0, 60);
      const ahora = new Date().toISOString();
      db.reportes.add({
        id: `r${Date.now()}`,
        tipo, titulo, descripcion: desc.trim(), estado: "pendiente",
        area, fecha: ahora, usuarioId: usuario.id, usuarioNombre: usuario.nombre,
        foto, ubicacion: ubic || undefined,
        historial: [{ estado: "pendiente", fecha: ahora }],
      });
      toast.success("Reporte enviado exitosamente ✓");
      nav("/reportes", { replace: true });
    }, 600);
  };

  return (
    <div>
      <button onClick={() => nav(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-3 hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>
      <h1 className="text-2xl font-bold mb-5">Nuevo Reporte</h1>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <Label className="mb-2 block">Tipo de reporte</Label>
          <div className="grid grid-cols-3 gap-2">
            {tipos.map(t => (
              <button type="button" key={t.v} onClick={() => setTipo(t.v)}
                className={cn(
                  "gosafe-card p-3 flex flex-col items-center gap-1.5 border-2 transition-all min-h-[88px]",
                  tipo === t.v ? t.color + " bg-card" : "border-border text-muted-foreground"
                )}
              >
                <t.Icon className="w-6 h-6" />
                <span className="text-[11px] text-center font-medium leading-tight text-foreground">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="desc">Descripción</Label>
          <Textarea id="desc" value={desc} onChange={e => setDesc(e.target.value)}
            placeholder="Describe detalladamente lo ocurrido..."
            className="bg-card border-border min-h-[120px] mt-1.5" />
          <div className="flex justify-between text-xs mt-1">
            <span className={cn("text-muted-foreground", descError && "text-danger")}>{descError ?? "Mínimo 20 caracteres"}</span>
            <span className="text-muted-foreground">{desc.length}</span>
          </div>
        </div>

        <div>
          <Label className="mb-1.5 block">Foto</Label>
          <input ref={fileRef} type="file" accept="image/*" capture={isMobile ? "environment" : undefined} className="hidden"
            onChange={e => onFile(e.target.files?.[0])} />
          {foto ? (
            <div className="relative">
              <img src={foto} alt="Foto del reporte" className="w-full max-h-64 object-cover rounded-xl border border-border" />
              <button type="button" onClick={() => setFoto(undefined)} className="absolute top-2 right-2 bg-card/90 rounded-md px-2 py-1 text-xs">Quitar</button>
            </div>
          ) : (
            <Button type="button" variant="outline" className="w-full h-12 border-border bg-card" onClick={handleCameraClick}>
              <Camera className="w-4 h-4 mr-2" /> Capturar foto
            </Button>
          )}
          <p className="text-xs text-muted-foreground mt-1.5 px-1">Si la cámara no se abre, revisa los permisos del sitio en tu navegador.</p>
        </div>

        <div>
          <Label className="mb-1.5 block">Ubicación</Label>
          <Button type="button" variant="outline" className="w-full h-12 border-border bg-card" onClick={obtenerGPS} disabled={gpsLoad}>
            {gpsLoad ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MapPin className="w-4 h-4 mr-2" />}
            {ubic ? truncatedUbic : "Obtener ubicación GPS"}
          </Button>
          <p className="text-xs text-muted-foreground mt-1.5 px-1">Si la ubicación falla, asegúrate de haber otorgado los permisos.</p>
        </div>

        <div>
          <Label className="mb-1.5 block">Área</Label>
          <Select value={area} onValueChange={setArea}>
            <SelectTrigger className="bg-card border-border h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Calle Norte">Calle Norte</SelectItem>
              <SelectItem value="Bodega Central">Bodega Central</SelectItem>
              <SelectItem value="Oficina Principal">Oficina Principal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={submitting || desc.trim().length < 20} className="w-full h-12 text-base bg-primary hover:bg-primary-glow text-primary-foreground font-semibold">
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enviar reporte"}
        </Button>
      </form>
    </div>
  );
}

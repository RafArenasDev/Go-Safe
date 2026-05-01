export type Rol = "conductor" | "bodega" | "supervisor";

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
  area: string;
  placa?: string;
  fechaIngreso: string; // ISO
}

export type TipoReporte = "condicion_insegura" | "incidente" | "accidente";
export type EstadoReporte = "pendiente" | "en_proceso" | "resuelto";

export interface HistorialEstado {
  estado: EstadoReporte;
  fecha: string;
  por?: string;
}

export interface Reporte {
  id: string;
  tipo: TipoReporte;
  titulo: string;
  descripcion: string;
  estado: EstadoReporte;
  area: string;
  fecha: string; // ISO
  usuarioId: string;
  usuarioNombre: string;
  foto?: string; // dataURL
  ubicacion?: string;
  historial: HistorialEstado[];
}

export type CategoriaChecklist = "vehiculo" | "bodega" | "oficina";

export interface PlantillaChecklist {
  categoria: CategoriaChecklist;
  items: string[];
}

export interface ChecklistCompletado {
  id: string;
  categoria: CategoriaChecklist;
  fecha: string;
  usuarioId: string;
  usuarioNombre: string;
  respuestas: { item: string; respuesta: "si" | "no" }[];
  firma: string; // dataURL
}

export interface InspeccionItem {
  seccion: string;
  item: string;
  respuesta: "si" | "no" | null;
  foto?: string;
}

export interface Inspeccion {
  id: string;
  fecha: string;
  usuarioId: string;
  usuarioNombre: string;
  placa: string;
  items: InspeccionItem[];
  cumplimiento: number; // 0..100
}

export type RolCapacitacion = "conductor" | "bodega" | "general";

export interface Capacitacion {
  id: string;
  titulo: string;
  descripcion: string;
  duracionMin: number;
  rol: RolCapacitacion;
  youtubeId: string;
}

export interface ProgresoCapacitacion {
  usuarioId: string;
  capacitacionId: string;
  fecha: string;
}

export type TipoAlerta = "epp" | "celular" | "riesgo" | "info";

export interface Alerta {
  id: string;
  tipo: TipoAlerta;
  titulo: string;
  descripcion: string;
  fecha: string; // ISO
  leida: boolean;
}

export type CategoriaDocumento = "procedimiento" | "manual" | "norma";

export interface Documento {
  id: string;
  titulo: string;
  categoria: CategoriaDocumento;
  formato: "pdf" | "word" | "excel";
  fecha: string;
  url: string;
}
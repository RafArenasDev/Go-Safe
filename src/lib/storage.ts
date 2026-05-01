import type {
  Usuario, Reporte, PlantillaChecklist, ChecklistCompletado,
  Inspeccion, Capacitacion, ProgresoCapacitacion, Alerta, Documento,
} from "./types";

const K = {
  init: "gosafe_inicializado",
  usuarios: "gosafe_usuarios",
  sesion: "gosafe_sesion",
  reportes: "gosafe_reportes",
  plantillas: "gosafe_plantillas_checklist",
  checklists: "gosafe_checklists_completados",
  inspecciones: "gosafe_inspecciones",
  capacitaciones: "gosafe_capacitaciones",
  progreso: "gosafe_progreso_capacitacion",
  alertas: "gosafe_alertas",
  documentos: "gosafe_documentos",
} as const;

export const Keys = K;

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function set<T>(key: string, val: T) {
  localStorage.setItem(key, JSON.stringify(val));
}

export const db = {
  usuarios: {
    list: () => get<Usuario[]>(K.usuarios, []),
    save: (u: Usuario[]) => set(K.usuarios, u),
  },
  reportes: {
    list: () => get<Reporte[]>(K.reportes, []),
    save: (r: Reporte[]) => set(K.reportes, r),
    add: (r: Reporte) => { const all = get<Reporte[]>(K.reportes, []); all.unshift(r); set(K.reportes, all); },
    update: (id: string, patch: Partial<Reporte>) => {
      const all = get<Reporte[]>(K.reportes, []);
      const idx = all.findIndex(x => x.id === id);
      if (idx >= 0) { all[idx] = { ...all[idx], ...patch }; set(K.reportes, all); }
      return all[idx];
    },
  },
  plantillas: {
    list: () => get<PlantillaChecklist[]>(K.plantillas, []),
    save: (p: PlantillaChecklist[]) => set(K.plantillas, p),
  },
  checklists: {
    list: () => get<ChecklistCompletado[]>(K.checklists, []),
    add: (c: ChecklistCompletado) => { const all = get<ChecklistCompletado[]>(K.checklists, []); all.unshift(c); set(K.checklists, all); },
  },
  inspecciones: {
    list: () => get<Inspeccion[]>(K.inspecciones, []),
    add: (i: Inspeccion) => { const all = get<Inspeccion[]>(K.inspecciones, []); all.unshift(i); set(K.inspecciones, all); },
  },
  capacitaciones: {
    list: () => get<Capacitacion[]>(K.capacitaciones, []),
    save: (c: Capacitacion[]) => set(K.capacitaciones, c),
  },
  progreso: {
    list: () => get<ProgresoCapacitacion[]>(K.progreso, []),
    save: (p: ProgresoCapacitacion[]) => set(K.progreso, p),
    add: (p: ProgresoCapacitacion) => {
      const all = get<ProgresoCapacitacion[]>(K.progreso, []);
      if (!all.find(x => x.usuarioId === p.usuarioId && x.capacitacionId === p.capacitacionId)) {
        all.push(p); set(K.progreso, all);
      }
    },
  },
  alertas: {
    list: () => get<Alerta[]>(K.alertas, []),
    save: (a: Alerta[]) => set(K.alertas, a),
    marcarLeida: (id: string) => {
      const all = get<Alerta[]>(K.alertas, []);
      const next = all.map(a => a.id === id ? { ...a, leida: true } : a);
      set(K.alertas, next);
    },
    marcarTodas: () => {
      const all = get<Alerta[]>(K.alertas, []).map(a => ({ ...a, leida: true }));
      set(K.alertas, all);
    },
  },
  documentos: {
    list: () => get<Documento[]>(K.documentos, []),
    save: (d: Documento[]) => set(K.documentos, d),
  },
};

export function sesionGet(): Usuario | null {
  try {
    const raw = sessionStorage.getItem(K.sesion);
    return raw ? JSON.parse(raw) as Usuario : null;
  } catch { return null; }
}
export function sesionSet(u: Usuario) { sessionStorage.setItem(K.sesion, JSON.stringify(u)); }
export function sesionClear() { sessionStorage.removeItem(K.sesion); }

export function inicializarDatos(force = false) {
  if (!force && localStorage.getItem(K.init) === "1") return;

  const usuarios: Usuario[] = [
    { id: "u1", nombre: "Carlos Andrés Ríos", email: "conductor@gosafe.com", password: "gosafe123", rol: "conductor", area: "Zona Norte", placa: "TRK-847", fechaIngreso: "2023-03-15" },
    { id: "u2", nombre: "Luisa Fernanda Vargas", email: "bodega@gosafe.com", password: "gosafe123", rol: "bodega", area: "Bodega Central", fechaIngreso: "2023-03-15" },
    { id: "u3", nombre: "Mauricio Ospina", email: "supervisor@gosafe.com", password: "gosafe123", rol: "supervisor", area: "Todas las áreas", fechaIngreso: "2022-08-01" },
  ];
  db.usuarios.save(usuarios);

  const reportesRaw: Array<[string, Reporte["tipo"], Reporte["estado"], string, string]> = [
    ["Piso mojado en pasillo 3 sin señalización", "condicion_insegura", "pendiente", "Bodega Central", "2025-04-10"],
    ["Colisión leve con bordillo en Carrera 15", "accidente", "en_proceso", "Calle Norte", "2025-04-09"],
    ["Operario sin casco en zona de carga", "condicion_insegura", "resuelto", "Bodega Central", "2025-04-08"],
    ["Derrame de aceite hidráulico en bahía 2", "incidente", "pendiente", "Bodega Central", "2025-04-08"],
    ["Luminaria apagada en bodega sector B", "condicion_insegura", "pendiente", "Bodega Central", "2025-04-07"],
    ["Atropellé a un perro", "incidente", "en_proceso", "Calle Norte", "2025-04-07"],
    ["Extintor vencido en oficina principal", "condicion_insegura", "resuelto", "Oficina Principal", "2025-04-06"],
    ["Caída de mercancía por estiba mal asegurada", "accidente", "en_proceso", "Bodega Central", "2025-04-05"],
    ["Fuga de gas detectada en comedor", "incidente", "resuelto", "Oficina Principal", "2025-04-04"],
    ["Vehículo TRK-847 con frenos en mal estado", "condicion_insegura", "pendiente", "Calle Norte", "2025-04-03"],
    ["Conductor sin cinturón en vía principal", "condicion_insegura", "resuelto", "Calle Norte", "2025-04-02"],
    ["Puerta de emergencia bloqueada con cajas", "condicion_insegura", "pendiente", "Bodega Central", "2025-04-01"],
    ["Lesión menor por caída en rampa de acceso", "accidente", "resuelto", "Bodega Central", "2025-03-30"],
    ["Cables eléctricos expuestos en taller mecánico", "condicion_insegura", "en_proceso", "Calle Norte", "2025-03-29"],
    ["Ingreso a zona restringida sin autorización", "incidente", "pendiente", "Bodega Central", "2025-03-28"],
  ];
  const reportes: Reporte[] = reportesRaw.map((r, i) => {
    const u = r[3].includes("Calle") ? usuarios[0] : r[3].includes("Bodega") ? usuarios[1] : usuarios[2];
    return {
      id: `r${i + 1}`,
      tipo: r[1],
      titulo: r[0],
      descripcion: r[0] + ". Se detectó la condición durante la jornada operativa y se solicita revisión inmediata por parte del equipo de seguridad.",
      estado: r[2],
      area: r[3],
      fecha: new Date(r[4] + "T09:42:00").toISOString(),
      usuarioId: u.id,
      usuarioNombre: u.nombre,
      ubicacion: r[3] === "Calle Norte" ? "Bogotá, Cundinamarca" : r[3],
      historial: [
        { estado: "pendiente", fecha: new Date(r[4] + "T09:42:00").toISOString() },
        ...(r[2] !== "pendiente" ? [{ estado: "en_proceso" as const, fecha: new Date(r[4] + "T11:00:00").toISOString() }] : []),
        ...(r[2] === "resuelto" ? [{ estado: "resuelto" as const, fecha: new Date(r[4] + "T15:00:00").toISOString() }] : []),
      ],
    };
  });
  db.reportes.save(reportes);

  const plantillas: PlantillaChecklist[] = [
    { categoria: "vehiculo", items: [
      "Freno de pedal",
      "Freno de emergencia",
      "Llantas calibradas (aire)",
      "Estado de las llantas",
      "Luces bajas",
      "Luces altas",
      "Direccionales",
    ]},
    { categoria: "bodega", items: [
      "Guantes",
      "Botas",
    ]},
    { categoria: "oficina", items: [
      "Sillas ergonómicas correctamente ajustadas", "Cables eléctricos organizados y protegidos",
      "Salidas de emergencia despejadas y señalizadas", "Botiquín visible y con elementos completos",
      "Extintores accesibles y señalizados", "Pantallas de computador a altura adecuada",
    ]},
  ];
  db.plantillas.save(plantillas);

  const capacitaciones: Capacitacion[] = [
    { id: "c1", titulo: "Conducción defensiva en vía urbana", descripcion: "Aprende técnicas para anticipar y evitar riesgos en la vía urbana colombiana.", duracionMin: 12, rol: "conductor", youtubeId: "dQw4w9WgXcQ" },
    { id: "c2", titulo: "Manejo seguro de carga pesada", descripcion: "Procedimientos para cargar, asegurar y descargar mercancía sin lesiones.", duracionMin: 8, rol: "bodega", youtubeId: "dQw4w9WgXcQ" },
    { id: "c3", titulo: "Ergonomía en el puesto de trabajo", descripcion: "Postura, descansos y ajustes para evitar lesiones por esfuerzo repetitivo.", duracionMin: 6, rol: "general", youtubeId: "dQw4w9WgXcQ" },
    { id: "c4", titulo: "Uso correcto del EPP", descripcion: "Cuándo y cómo usar cada elemento de protección personal.", duracionMin: 5, rol: "general", youtubeId: "dQw4w9WgXcQ" },
    { id: "c5", titulo: "Protocolo ante accidentes de tránsito", descripcion: "Pasos a seguir tras un siniestro vial para proteger vidas y evidencia.", duracionMin: 15, rol: "conductor", youtubeId: "dQw4w9WgXcQ" },
    { id: "c6", titulo: "Almacenamiento seguro de mercancías", descripcion: "Estibado, apilamiento y rotación correcta en bodega.", duracionMin: 10, rol: "bodega", youtubeId: "dQw4w9WgXcQ" },
    { id: "c7", titulo: "Primeros auxilios básicos", descripcion: "Atención inicial a víctimas mientras llega ayuda profesional.", duracionMin: 20, rol: "general", youtubeId: "dQw4w9WgXcQ" },
    { id: "c8", titulo: "Prevención de incendios en bodega", descripcion: "Identificación de riesgos y uso de extintores.", duracionMin: 7, rol: "bodega", youtubeId: "dQw4w9WgXcQ" },
  ];
  db.capacitaciones.save(capacitaciones);

  // Progreso inicial
  db.progreso.save([
    { usuarioId: "u1", capacitacionId: "c1", fecha: new Date().toISOString() },
    { usuarioId: "u1", capacitacionId: "c5", fecha: new Date().toISOString() },
    { usuarioId: "u2", capacitacionId: "c2", fecha: new Date().toISOString() },
  ]);

  const ahora = Date.now();
  const horas = (h: number) => new Date(ahora - h * 3600 * 1000).toISOString();
  const dias = (d: number) => new Date(ahora - d * 24 * 3600 * 1000).toISOString();

  const alertas: Alerta[] = [
    { id: "a1", tipo: "celular", titulo: "No uses el celular mientras conduces", descripcion: "Es obligación legal en todo el territorio nacional.", fecha: horas(1), leida: false },
    { id: "a2", tipo: "epp", titulo: "¡Usa tu EPP!", descripcion: "Casco, chaleco reflectivo y zapatos de seguridad obligatorios.", fecha: horas(3), leida: false },
    { id: "a3", tipo: "riesgo", titulo: "Zona de riesgo activa", descripcion: "Sector B de bodega. Acceso restringido.", fecha: horas(5), leida: true },
    { id: "a4", tipo: "info", titulo: "Respeta los límites de velocidad", descripcion: "Recuerda los límites en zona industrial.", fecha: dias(1), leida: true },
    { id: "a5", tipo: "info", titulo: "Inspección vehicular pendiente", descripcion: "Complétala antes de salir a ruta.", fecha: dias(1), leida: false },
    { id: "a6", tipo: "riesgo", titulo: "Lluvia intensa en Autopista Norte", descripcion: "Reduce velocidad y aumenta distancia.", fecha: dias(2), leida: true },
    { id: "a7", tipo: "info", titulo: "Simulacro de evacuación", descripcion: "Viernes 25 de abril, 3:00 p.m.", fecha: dias(2), leida: true },
    { id: "a8", tipo: "info", titulo: "Vence certificado técnico TRK-847", descripcion: "El próximo viernes vence la revisión.", fecha: dias(3), leida: false },
    { id: "a9", tipo: "riesgo", titulo: "Zonas restringidas", descripcion: "No ingreses sin permiso escrito del supervisor.", fecha: dias(3), leida: true },
    { id: "a10", tipo: "info", titulo: "Capacitación obligatoria disponible", descripcion: "Primeros auxilios básicos. Complétala esta semana.", fecha: dias(4), leida: true },
  ];
  db.alertas.save(alertas);

  const documentos: Documento[] = [
    { id: "d1", titulo: "Reglamento interno de tránsito y transporte", categoria: "procedimiento", formato: "pdf", fecha: "2025-01-15", url: "https://www.mintransporte.gov.co/" },
    { id: "d2", titulo: "Manual de conducción defensiva urbana", categoria: "manual", formato: "pdf", fecha: "2025-01-10", url: "https://www.mintransporte.gov.co/" },
    { id: "d3", titulo: "Protocolo de atención a accidentes de tránsito", categoria: "procedimiento", formato: "pdf", fecha: "2024-12-20", url: "#" },
    { id: "d4", titulo: "Norma OHSAS 18001 — Resumen ejecutivo", categoria: "norma", formato: "pdf", fecha: "2024-12-01", url: "#" },
    { id: "d5", titulo: "Guía de uso correcto del EPP", categoria: "manual", formato: "pdf", fecha: "2025-02-05", url: "#" },
    { id: "d6", titulo: "Procedimiento de inspección pre-operacional", categoria: "procedimiento", formato: "pdf", fecha: "2025-02-01", url: "#" },
    { id: "d7", titulo: "Resolución 40595 — Transporte de mercancías peligrosas", categoria: "norma", formato: "pdf", fecha: "2024-11-15", url: "#" },
    { id: "d8", titulo: "Instructivo de reporte de incidentes y accidentes", categoria: "manual", formato: "pdf", fecha: "2025-03-01", url: "#" },
  ];
  db.documentos.save(documentos);

  // Inspecciones mock para Carlos Ríos
  const inspecciones: Inspeccion[] = [100, 95, 87, 100, 92].map((c, i) => ({
    id: `i${i + 1}`,
    fecha: dias(i * 3 + 1),
    usuarioId: "u1",
    usuarioNombre: "Carlos Andrés Ríos",
    placa: "TRK-847",
    items: [],
    cumplimiento: c,
  }));
  db.inspecciones.add = ((orig) => orig)(db.inspecciones.add); // no-op typing
  localStorage.setItem(Keys.inspecciones, JSON.stringify(inspecciones));

  localStorage.setItem(K.init, "1");
}
export function formatearFechaRelativa(iso: string): string {
  const fecha = new Date(iso);
  const diff = Date.now() - fecha.getTime();
  const min = Math.floor(diff / 60000);
  const horas = Math.floor(min / 60);
  const dias = Math.floor(horas / 24);
  if (min < 1) return "Justo ahora";
  if (min < 60) return `Hace ${min} min`;
  if (horas < 24) return `Hace ${horas} h`;
  if (dias === 1) return "Ayer";
  if (dias < 7) return `Hace ${dias} días`;
  return fecha.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

export function formatearFechaCorta(iso: string): string {
  const f = new Date(iso);
  const hoy = new Date();
  const ayer = new Date(); ayer.setDate(hoy.getDate() - 1);
  const esHoy = f.toDateString() === hoy.toDateString();
  const esAyer = f.toDateString() === ayer.toDateString();
  const hora = f.toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit", hour12: true }).replace(/\s?(AM|PM)/i, m => " " + m.toLowerCase().replace("m", ".m."));
  if (esHoy) return `Hoy, ${hora}`;
  if (esAyer) return `Ayer, ${hora}`;
  return f.toLocaleDateString("es-CO", { day: "numeric", month: "short" }) + `, ${hora}`;
}

export function iniciales(nombre: string): string {
  return nombre.split(" ").filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join("");
}

export function agruparPorFecha<T extends { fecha: string }>(items: T[]): Record<string, T[]> {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);
  const semana = new Date(hoy); semana.setDate(hoy.getDate() - 7);
  const grupos: Record<string, T[]> = { "Hoy": [], "Ayer": [], "Esta semana": [], "Anteriores": [] };
  items.forEach(it => {
    const f = new Date(it.fecha); f.setHours(0,0,0,0);
    if (f.getTime() === hoy.getTime()) grupos["Hoy"].push(it);
    else if (f.getTime() === ayer.getTime()) grupos["Ayer"].push(it);
    else if (f >= semana) grupos["Esta semana"].push(it);
    else grupos["Anteriores"].push(it);
  });
  return grupos;
}
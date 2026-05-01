import { useMemo, useState } from "react";
import { Search, FileText, ExternalLink, FileWarning } from "lucide-react";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/storage";
import type { CategoriaDocumento } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";

const colorFmt = { pdf: "text-danger bg-danger/15", word: "text-info bg-info/15", excel: "text-success bg-success/15" } as const;
const labelCat: Record<CategoriaDocumento, string> = { procedimiento: "Procedimiento", manual: "Manual", norma: "Norma" };

export default function Documentos() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"todos" | CategoriaDocumento>("todos");

  const docs = useMemo(() => db.documentos.list().filter(d => {
    if (cat !== "todos" && d.categoria !== cat) return false;
    if (q && !d.titulo.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [q, cat]);

  return (
    <div>
      <PageHeader titulo="Documentos" subtitulo="Manuales, normas y procedimientos" />

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar documento…" className="pl-9 bg-card border-border h-11" />
      </div>

      <div className="flex gap-2 mb-4">
        {(["todos", "procedimiento", "manual", "norma"] as const).map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border capitalize",
              cat === c ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground")}>
            {c === "todos" ? "Todos" : labelCat[c] + "s"}
          </button>
        ))}
      </div>

      {docs.length === 0 ? <EmptyState icon={FileWarning} titulo="No se encontraron documentos" /> : (
        <ul className="space-y-2">
          {docs.map(d => (
            <li key={d.id} className="gosafe-card p-3 flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colorFmt[d.formato])}>
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{d.titulo}</div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                  <span className="px-1.5 py-0.5 rounded bg-muted">{labelCat[d.categoria]}</span>
                  <span>{new Date(d.fecha).toLocaleDateString("es-CO")}</span>
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="border-border">
                <a href={d.url} target="_blank" rel="noreferrer"><ExternalLink className="w-3.5 h-3.5 mr-1" /> Ver</a>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
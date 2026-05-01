export function PageHeader({ titulo, subtitulo, action }: { titulo: string; subtitulo?: string; action?: React.ReactNode }) {
  return (
    <header className="flex items-start justify-between gap-3 mb-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{titulo}</h1>
        {subtitulo && <p className="text-sm text-muted-foreground mt-0.5">{subtitulo}</p>}
      </div>
      {action}
    </header>
  );
}
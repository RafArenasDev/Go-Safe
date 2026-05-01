import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function ConfirmModal({
  open, onOpenChange, titulo, mensaje, onConfirm, confirmLabel = "Confirmar", cancelLabel = "Cancelar", danger = false,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  titulo: string; mensaje: string;
  onConfirm: () => void; confirmLabel?: string; cancelLabel?: string; danger?: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          <AlertDialogDescription>{mensaje}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={danger ? "bg-danger text-danger-foreground hover:bg-danger/90" : ""}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
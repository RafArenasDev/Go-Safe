import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function FAB({ onClick, className, ariaLabel = "Acción", icon: Icon = Plus }: { onClick: () => void; className?: string; ariaLabel?: string; icon?: typeof Plus }) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "fixed bottom-24 md:bottom-8 right-5 md:right-8 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary-glow active:scale-95 transition-all flex items-center justify-center",
        className,
      )}
    >
      <Icon className="w-6 h-6" />
    </button>
  );
}
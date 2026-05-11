import { cn } from "@/lib/utils";

/** Renders ₹ in Inter so it does not break under display fonts (e.g. Cormorant Garamond). */
export function RupeeSymbol({ className }: { className?: string }) {
  return (
    <span
      className={cn("rupee", className)}
      style={{ fontFamily: "Inter, sans-serif" }}
      aria-hidden
    >
      ₹
    </span>
  );
}

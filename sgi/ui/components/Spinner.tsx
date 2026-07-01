import { cn } from "@/ui/lib/cn";

export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";

const dims: Record<SpinnerSize, number> = { xs: 12, sm: 16, md: 20, lg: 24, xl: 32 };

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const d = dims[size];
  return (
    <svg
      width={d}
      height={d}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("animate-spin", className)}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"
        strokeDasharray="32" strokeDashoffset="12" />
    </svg>
  );
}

interface LoadingOverlayProps {
  label?: string;
  className?: string;
}

export function LoadingOverlay({ label = "Carregando…", className }: LoadingOverlayProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-16 text-text-3", className)}>
      <Spinner size="lg" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}

export function LoadingBar({ className }: { className?: string }) {
  return (
    <div className={cn("h-0.5 w-full overflow-hidden bg-surface-2", className)}>
      <div
        className="h-full bg-primary"
        style={{ animation: "loadbar 1.4s ease infinite", width: "40%" }}
      />
      <style>{`@keyframes loadbar{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}`}</style>
    </div>
  );
}

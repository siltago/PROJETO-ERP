"use client";

import { useEffect, useRef, ReactNode, HTMLAttributes } from "react";
import { cn } from "@/ui/lib/cn";
import { Button } from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  children: ReactNode;
  footer?: ReactNode;
  hideClose?: boolean;
  className?: string;
}

const sizes = {
  sm:   "max-w-sm",
  md:   "max-w-md",
  lg:   "max-w-lg",
  xl:   "max-w-2xl",
  full: "max-w-[95vw] max-h-[95vh]",
};

export function Modal({
  open, onClose, title, description, size = "md",
  children, footer, hideClose, className,
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        style={{ animation: `fadeIn var(--motion-modal) var(--ease-out) both` }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={ref}
        className={cn(
          "relative z-10 w-full flex flex-col max-h-[90vh]",
          "bg-surface border border-border overflow-hidden",
          "shadow-xl",
          sizes[size],
          className
        )}
        style={{
          borderRadius: "var(--radius-xl)",
          animation: `slideUp var(--motion-modal) var(--ease-out) both`,
        }}
      >
        {/* Header */}
        {(title || !hideClose) && (
          <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 shrink-0">
            <div>
              {title && <h2 className="text-base font-semibold text-text">{title}</h2>}
              {description && <p className="mt-0.5 text-sm text-text-2">{description}</p>}
            </div>
            {!hideClose && (
              <button
                onClick={onClose}
                className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-text-2 hover:bg-surface-2 hover:text-text transition-colors"
                aria-label="Fechar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-thin">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 border-t border-border px-6 py-4 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px) scale(0.97) } to { opacity: 1; transform: none } }
      `}</style>
    </div>
  );
}

/* Confirm Dialog — versão simplificada para confirmações */
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
}

export function ConfirmDialog({
  open, onClose, onConfirm, title, description,
  confirmLabel = "Confirmar", cancelLabel = "Cancelar",
  variant = "primary", loading,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            variant={variant === "danger" ? "danger" : undefined}
          >
            {loading ? "Aguarde…" : confirmLabel}
          </Button>
        </>
      }
    >
      <div />
    </Modal>
  );
}

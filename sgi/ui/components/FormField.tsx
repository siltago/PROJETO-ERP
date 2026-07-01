import { createContext, useContext, useId, ReactNode, HTMLAttributes, LabelHTMLAttributes } from "react";
import { cn } from "@/ui/lib/cn";

/* ── Context ──────────────────────────────────────────── */
interface FormFieldCtx {
  id: string;
  error?: string;
  required?: boolean;
}
const Ctx = createContext<FormFieldCtx>({ id: "" });

/* ── FormField ────────────────────────────────────────── */
interface FormFieldProps {
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function FormField({ error, required, className, children }: FormFieldProps) {
  const id = useId();
  return (
    <Ctx.Provider value={{ id, error, required }}>
      <div className={cn("flex flex-col gap-1.5", className)}>
        {children}
      </div>
    </Ctx.Provider>
  );
}

/* ── FormLabel ────────────────────────────────────────── */
interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
}

export function FormLabel({ className, children, ...props }: FormLabelProps) {
  const { id, required } = useContext(Ctx);
  return (
    <label
      htmlFor={props.htmlFor ?? id}
      className={cn("label", className)}
      {...props}
    >
      {children}
      {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
    </label>
  );
}

/* ── FormControl ──────────────────────────────────────── */
interface FormControlProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function FormControl({ className, children, ...props }: FormControlProps) {
  const { id } = useContext(Ctx);
  return (
    <div id={id} className={cn("relative", className)} {...props}>
      {children}
    </div>
  );
}

/* ── FormMessage (error) ──────────────────────────────── */
export function FormMessage({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  const { id, error } = useContext(Ctx);
  const msg = children ?? error;
  if (!msg) return null;
  return (
    <p
      id={`${id}-error`}
      role="alert"
      className={cn("text-[13px] text-danger", className)}
      {...props}
    >
      {msg}
    </p>
  );
}

/* ── FormHint ─────────────────────────────────────────── */
export function FormHint({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  const { id, error } = useContext(Ctx);
  if (error) return null;
  return (
    <p
      id={`${id}-hint`}
      className={cn("text-[13px] text-text-3", className)}
      {...props}
    >
      {children}
    </p>
  );
}

/* ── Form ─────────────────────────────────────────────── */
interface FormProps extends HTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  gap?: "sm" | "md" | "lg";
}

const gapStyles = { sm: "gap-3", md: "gap-5", lg: "gap-6" };

export function Form({ gap = "md", className, children, ...props }: FormProps) {
  return (
    <form
      className={cn("flex flex-col", gapStyles[gap], className)}
      {...props}
    >
      {children}
    </form>
  );
}

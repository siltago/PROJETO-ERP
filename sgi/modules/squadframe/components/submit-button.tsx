"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/ui/components/Button";
import type { ButtonVariant, ButtonSize } from "@/ui/components/Button";

interface Props {
  label?: string;
  pendingLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export function SubmitButton({
  label = "Salvar",
  pendingLabel = "Salvando…",
  variant,
  size,
  className,
}: Props) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} variant={variant} size={size} className={className}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

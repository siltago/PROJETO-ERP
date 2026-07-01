"use client";

import { Button } from "@/ui/components/Button";

export function PrintButton() {
  return (
    <Button
      onClick={() => window.print()}
      className="text-sm px-4 py-1.5"
    >
      Imprimir / Salvar PDF
    </Button>
  );
}

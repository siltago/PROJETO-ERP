"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="btn-primary text-sm px-4 py-1.5"
    >
      Imprimir / Salvar PDF
    </button>
  );
}

"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { alterarStatusPedido, registrarValorFinal, confirmarDebitoPedido } from "@/app/compras/actions";
import { AssinarModal } from "@/modules/squadframe/components/assinar-modal";
import { usePode } from "@/modules/squadframe/components/user-provider";

type Transicao = { label: string; status: string; variant: "primary" | "ghost" | "danger" };

const TRANSICOES: Record<string, Transicao[]> = {
  RASCUNHO:               [{ label: "Enviar aprovação", status: "AGUARDANDO_APROVACAO", variant: "primary" }, { label: "Cancelar", status: "CANCELADO", variant: "danger" }],
  AGUARDANDO_APROVACAO:   [{ label: "Aprovar", status: "APROVADO", variant: "primary" }, { label: "Rejeitar", status: "REJEITADO", variant: "danger" }],
  REJEITADO:              [{ label: "Devolver para edição", status: "RASCUNHO", variant: "primary" }, { label: "Cancelar pedido", status: "CANCELADO", variant: "danger" }],
  APROVADO:               [{ label: "Emitir pedido", status: "AGUARDANDO_RECEBIMENTO", variant: "primary" }, { label: "Cancelar", status: "CANCELADO", variant: "danger" }],
  EMITIDO:                [{ label: "Emitir pedido", status: "AGUARDANDO_RECEBIMENTO", variant: "primary" }],
  AGUARDANDO_RECEBIMENTO: [],
  RECEBIDO_PARCIAL:       [],
  RECEBIDO:               [{ label: "Finalizar", status: "FINALIZADO", variant: "primary" }],
  FINALIZADO:             [],
  CANCELADO:              [],
};

const ACAO_LABEL: Record<string, string> = {
  AGUARDANDO_APROVACAO: "Enviar para Aprovação",
  APROVADO: "Aprovar Pedido de Compra",
  REJEITADO: "Rejeitar Pedido",
  RASCUNHO: "Devolver para Edição",
  EMITIDO: "Emitir Pedido de Compra",
  AGUARDANDO_RECEBIMENTO: "Marcar como Aguardando Recebimento",
  FINALIZADO: "Finalizar Pedido",
  CANCELADO: "Cancelar Pedido",
};

export function PedidoCliente({ pedido }: { pedido: any }) {
  const podeCriar    = usePode("compras.pedido.criar");
  const podeAprovar  = usePode("compras.pedido.aprovar");
  const podeCancelar = usePode("compras.pedido.cancelar");
  const [obs, setObs] = useState("");
  const [showObs, setShowObs] = useState(false);
  const [acaoPendente, setAcaoPendente] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const pendingFn = useRef<(() => Promise<void>) | null>(null);
  const [modalAcao, setModalAcao] = useState<string | null>(null);
  const [showValorFinal, setShowValorFinal] = useState(false);
  const [valorFinalInput, setValorFinalInput] = useState(
    pedido.valor_final != null ? String(pedido.valor_final) : ""
  );
  const [pendingVF, startVF] = useTransition();
  const [erroVF, setErroVF] = useState<string | null>(null);
  const [pendingDebito, startDebito] = useTransition();
  const [erroDebito, setErroDebito] = useState<string | null>(null);
  const [okDebito, setOkDebito] = useState(false);
  const router = useRouter();

  const podeEditarAgora = podeCriar && ["RASCUNHO", "AGUARDANDO_APROVACAO", "REJEITADO"].includes(pedido.status);

  // Débito pendente: pedido emitido com FD mas sem débito registrado (sem carteira ou saldo insuficiente na época)
  const STATUS_POS_EMISSAO = ["AGUARDANDO_RECEBIMENTO", "EMITIDO", "RECEBIDO_PARCIAL", "RECEBIDO", "FINALIZADO"];
  const temDebitoPendente =
    pedido.usa_carteira &&
    !pedido.debito_registrado &&
    STATUS_POS_EMISSAO.includes(pedido.status);

  function handleConfirmarDebito() {
    setErroDebito(null);
    setOkDebito(false);
    startDebito(async () => {
      try {
        await confirmarDebitoPedido(pedido.id);
        setOkDebito(true);
        router.refresh();
      } catch (e: any) {
        setErroDebito(e.message);
      }
    });
  }
  const transicoes = (TRANSICOES[pedido.status] ?? []).filter((t) => {
    if (t.status === "APROVADO")  return podeAprovar;
    // A partir de REJEITADO, aprovador e comprador podem devolver ou cancelar
    if (pedido.status === "REJEITADO") return podeAprovar || podeCriar || (t.status === "CANCELADO" && podeCancelar);
    if (t.status === "CANCELADO") return podeCancelar;
    return podeCriar;
  });

  function handleAcao(status: string) {
    if (["CANCELADO", "REJEITADO", "RASCUNHO"].includes(status)) {
      setAcaoPendente(status); setShowObs(true); return;
    }
    pedirAssinatura(status, "");
  }

  function pedirAssinatura(status: string, observacoes: string) {
    pendingFn.current = async () => {
      start(async () => {
        try {
          await alterarStatusPedido(pedido.id, status, observacoes || undefined);
          router.refresh();
          setShowObs(false); setObs(""); setAcaoPendente(null);
        } catch (e: any) { setErro(e.message); }
      });
    };
    setModalAcao(ACAO_LABEL[status] ?? status);
  }

  const podeRegistrarRecebimento =
    podeCriar && ["AGUARDANDO_RECEBIMENTO", "RECEBIDO_PARCIAL"].includes(pedido.status);

  // Valor final só editável enquanto aguarda recebimento — some após o primeiro recebimento ser registrado
  const statusPermiteValorFinal = pedido.status === "AGUARDANDO_RECEBIMENTO";
  const podeRegistrarValorFinal = podeCriar && statusPermiteValorFinal;

  function salvarValorFinal() {
    const v = parseFloat(valorFinalInput.replace(",", ".").replace(/[^0-9.]/g, ""));
    if (isNaN(v) || v <= 0) { setErroVF("Insira um valor válido."); return; }
    setErroVF(null);
    startVF(async () => {
      try {
        await registrarValorFinal(pedido.id, v);
        setShowValorFinal(false);
        router.refresh();
      } catch (e: any) { setErroVF(e.message); }
    });
  }

  if (!transicoes.length && !podeEditarAgora && !podeRegistrarRecebimento && !podeRegistrarValorFinal) return null;

  return (
    <>
      {modalAcao && (
        <AssinarModal
          acao={modalAcao}
          onConfirm={async () => { setModalAcao(null); await pendingFn.current?.(); }}
          onCancel={() => setModalAcao(null)}
        />
      )}

      {/* Banner de débito pendente */}
      {temDebitoPendente && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/40 dark:bg-amber-900/20">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                Débito pendente na carteira
              </p>
              <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
                Este pedido usa faturamento direto mas o débito ainda não foi registrado.
                {" "}Verifique se há saldo na carteira desta obra/fornecedor e confirme o débito.
              </p>
              {erroDebito && <p className="mt-1 text-xs text-red-600">{erroDebito}</p>}
              {okDebito && <p className="mt-1 text-xs text-green-700">Débito registrado com sucesso.</p>}
            </div>
            <button
              disabled={pendingDebito}
              onClick={handleConfirmarDebito}
              className="shrink-0 rounded-card border border-amber-300 bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {pendingDebito ? "Debitando…" : "Confirmar débito"}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col items-end gap-2">
        <div className="flex flex-wrap gap-2 justify-end">
          {podeEditarAgora && (
            <Link href={`/compras/pedidos/${pedido.id}/editar`} className="btn-ghost">
              Editar
            </Link>
          )}
          {podeRegistrarValorFinal && (
            <button
              onClick={() => setShowValorFinal((v) => !v)}
              className={`btn-ghost flex items-center gap-1.5 ${pedido.valor_final != null ? "text-green-700 border-green-200 bg-green-50 hover:bg-green-100" : ""}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              {pedido.valor_final != null
                ? `Valor final: ${Number(pedido.valor_final).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`
                : "Adicionar valor final"}
            </button>
          )}
          {podeRegistrarRecebimento && (
            <Link href={`/compras/pedidos/${pedido.id}/receber`} className="btn-primary">
              Registrar recebimento
            </Link>
          )}
          {transicoes.map((t) => (
            <button key={t.status} disabled={pending} onClick={() => handleAcao(t.status)}
              className={
                t.variant === "primary" ? "btn-primary" :
                t.variant === "danger"  ? "inline-flex items-center justify-center rounded-card border border-red-200 bg-surface px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800/50 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-50" :
                "btn-ghost"
              }>
              {t.label}
            </button>
          ))}
        </div>

        {showValorFinal && (
          <div className="w-80 rounded-xl border border-line bg-surface p-4 shadow-lg">
            <p className="text-sm font-semibold text-ink mb-1">Valor final do pedido</p>
            <p className="text-xs text-ink-soft mb-3">
              Informe o valor real confirmado com o fornecedor. Esse valor será usado no controle financeiro.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-ink-soft shrink-0">R$</span>
              <input
                type="text"
                inputMode="decimal"
                value={valorFinalInput}
                onChange={(e) => setValorFinalInput(e.target.value)}
                placeholder="0,00"
                className="field h-9 flex-1 text-sm font-mono"
                onKeyDown={(e) => e.key === "Enter" && salvarValorFinal()}
                autoFocus
              />
              <button onClick={salvarValorFinal} disabled={pendingVF} className="btn-primary h-9 px-3 text-sm shrink-0">
                {pendingVF ? "…" : "Salvar"}
              </button>
              <button onClick={() => { setShowValorFinal(false); setErroVF(null); }} className="btn-ghost h-9 px-3 text-sm shrink-0">
                ✕
              </button>
            </div>
            {erroVF && <p className="mt-2 text-xs text-red-500">{erroVF}</p>}
          </div>
        )}

        {showObs && (
          <div className="w-72 rounded-lg border border-line bg-surface p-3 shadow-sm">
            <label className="label">Motivo <span className="text-ink-faint font-normal">(opcional)</span></label>
            <textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2} className="field text-sm" />
            <div className="mt-2 flex gap-2">
              <button onClick={() => { setShowObs(false); pedirAssinatura(acaoPendente!, obs); }}
                className="btn-primary flex-1 text-xs">
                Continuar
              </button>
              <button onClick={() => { setShowObs(false); setAcaoPendente(null); }} className="btn-ghost text-xs">
                Cancelar
              </button>
            </div>
          </div>
        )}
        {erro && <p className="text-sm text-red-600">{erro}</p>}
      </div>
    </>
  );
}

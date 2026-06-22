"use client";

import { useTransition } from "react";
import { useToast } from "@/components/toast";

export function useAction() {
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  function run<T>(
    action: () => Promise<T>,
    opts?: {
      onSuccess?: (result: T) => void;
      onError?: (err: string) => void;
      successMsg?: string;
    },
  ) {
    startTransition(async () => {
      try {
        const result = await action();
        if (opts?.successMsg) toast(opts.successMsg, "sucesso");
        opts?.onSuccess?.(result);
      } catch (err: any) {
        const msg: string = err?.message ?? "Ocorreu um erro inesperado.";
        toast(msg, "erro");
        opts?.onError?.(msg);
      }
    });
  }

  return { run, pending };
}

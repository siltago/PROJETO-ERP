import { redirect } from "next/navigation";

export default function FinanceiroLegacyRedirect({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const aba = searchParams.aba ?? "dashboard";
  redirect(`/financeiro?aba=${aba}`);
}

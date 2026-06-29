import { redirect } from "next/navigation";

export default function CarteirasLegacyRedirect() {
  redirect("/financeiro?aba=carteiras");
}

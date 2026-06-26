import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { getUsuarioAtual } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const usuario = await getUsuarioAtual();
  if (!usuario) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { subscription, browser, platform } = body;

  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return NextResponse.json({ error: "Subscription inválida" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { error } = await admin.from("push_subscriptions").upsert(
    {
      user_id: usuario.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      browser: browser ?? null,
      platform: platform ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" },
  );

  if (error) {
    console.error("[Push] upsert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const usuario = await getUsuarioAtual();
  if (!usuario) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { endpoint } = await req.json();
  if (!endpoint) return NextResponse.json({ error: "endpoint obrigatório" }, { status: 400 });

  const admin = createAdminClient();
  await admin
    .from("push_subscriptions")
    .delete()
    .eq("user_id", usuario.id)
    .eq("endpoint", endpoint);

  return NextResponse.json({ ok: true });
}

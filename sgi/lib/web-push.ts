import "server-only";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const webpush = require("web-push");

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:admin@squadframe.com";

let vapidConfigured = false;
if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
  vapidConfigured = true;
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  actions?: Array<{ action: string; title: string }>;
}

export interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export async function sendPushToSubscription(
  subscription: PushSubscription,
  payload: PushPayload,
): Promise<void> {
  if (!vapidConfigured) return;

  await webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: { p256dh: subscription.p256dh, auth: subscription.auth },
    },
    JSON.stringify({
      icon: "/icon.png",
      badge: "/icon.png",
      ...payload,
    }),
  );
}

export async function sendPushToSubscriptions(
  subscriptions: PushSubscription[],
  payload: PushPayload,
): Promise<void> {
  if (!vapidConfigured || !subscriptions.length) return;

  await Promise.allSettled(
    subscriptions.map((sub) => sendPushToSubscription(sub, payload)),
  );
}

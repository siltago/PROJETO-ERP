// Allows importing CSS files as side-effects in TypeScript
declare module "*.css" {}

// PWA: beforeinstallprompt event (não está no lib.dom.d.ts padrão)
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

import { createRoot } from "react-dom/client";
import { WhiteLabelProvider } from "@/hooks/useWhiteLabel";
import { ThemeLockProvider } from "@/providers/ThemeLockProvider";
import App from "./App.tsx";
import "./index.css";

/**
 * Prevent stale UI/theme in the Lovable preview.
 *
 * The preview runs on a stable lovableproject.com origin; if a PWA service worker
 * was previously installed for that origin, it can keep serving an older build
 * (old colors + outdated sidebar items).
 *
 * In preview/dev only, we unregister SW + clear caches once per tab session.
 */
const isPreviewHost = window.location.hostname.includes("lovableproject.com");
const shouldDisableServiceWorker = import.meta.env.DEV || isPreviewHost;

if (shouldDisableServiceWorker && "serviceWorker" in navigator) {
  // Always clean up on preview/dev - no session gate to ensure fresh assets
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister());
  }).catch(() => {});

  if (typeof caches !== "undefined") {
    caches.keys().then((keys) => {
      keys.forEach((k) => caches.delete(k));
    }).catch(() => {});
  }
}

createRoot(document.getElementById("root")!).render(
  <ThemeLockProvider>
    <WhiteLabelProvider>
      <App />
    </WhiteLabelProvider>
  </ThemeLockProvider>
);

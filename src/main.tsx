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
  const onceKey = "lovable:disable-sw-and-caches:v1";

  if (!sessionStorage.getItem(onceKey)) {
    sessionStorage.setItem(onceKey, "1");

    Promise.all([
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => Promise.all(regs.map((r) => r.unregister())))
        .catch(() => undefined),
      typeof caches !== "undefined"
        ? caches
            .keys()
            .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
            .catch(() => undefined)
        : Promise.resolve(undefined),
    ]).finally(() => {
      // Reload once to ensure we fetch the latest assets without SW interference.
      window.location.reload();
    });
  }
}

createRoot(document.getElementById("root")!).render(
  <ThemeLockProvider>
    <WhiteLabelProvider>
      <App />
    </WhiteLabelProvider>
  </ThemeLockProvider>
);

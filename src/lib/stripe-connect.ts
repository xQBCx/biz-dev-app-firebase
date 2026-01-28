import { loadConnectAndInitialize } from "@stripe/connect-js";

let stripeConnectInstance: ReturnType<typeof loadConnectAndInitialize> | null = null;

export const initializeStripeConnect = (clientSecret: string) => {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    throw new Error("Stripe publishable key not configured");
  }

  stripeConnectInstance = loadConnectAndInitialize({
    publishableKey,
    fetchClientSecret: async () => clientSecret,
    appearance: {
      overlays: "dialog",
      variables: {
        colorPrimary: "#0F172A",
        colorBackground: "#FFFFFF",
        colorText: "#0F172A",
        colorDanger: "#EF4444",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontSizeBase: "14px",
        spacingUnit: "4px",
        borderRadius: "8px"
      }
    }
  });

  return stripeConnectInstance;
};

export const getStripeConnectInstance = () => stripeConnectInstance;

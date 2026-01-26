import type { Appearance } from "@stripe/stripe-js";

/**
 * Biz Dev branded Stripe Appearance configuration
 * Uses the app's design system tokens for a seamless, native experience
 */
export const bizDevStripeAppearance: Appearance = {
  theme: "flat",
  variables: {
    // Primary branding colors matching Biz Dev
    colorPrimary: "hsl(210, 100%, 63%)",
    colorBackground: "hsl(0, 0%, 10%)",
    colorText: "hsl(0, 0%, 100%)",
    colorTextSecondary: "hsl(240, 5%, 65%)",
    colorTextPlaceholder: "hsl(240, 4%, 46%)",
    colorDanger: "hsl(0, 84%, 60%)",
    colorSuccess: "hsl(142, 71%, 45%)",
    
    // Typography
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    fontSizeBase: "14px",
    fontWeightNormal: "400",
    fontWeightMedium: "500",
    fontWeightBold: "600",
    
    // Spacing and borders
    borderRadius: "8px",
    spacingUnit: "4px",
    spacingGridRow: "16px",
    spacingGridColumn: "16px",
  },
  rules: {
    ".Tab": {
      backgroundColor: "hsl(0, 0%, 15%)",
      border: "1px solid hsl(240, 4%, 26%)",
      boxShadow: "none",
      color: "hsl(240, 5%, 65%)",
    },
    ".Tab:hover": {
      backgroundColor: "hsl(0, 0%, 18%)",
      border: "1px solid hsl(240, 4%, 36%)",
    },
    ".Tab--selected": {
      backgroundColor: "hsl(210, 100%, 63%)",
      border: "1px solid hsl(210, 100%, 63%)",
      color: "hsl(0, 0%, 100%)",
      boxShadow: "0 0 0 2px hsla(210, 100%, 63%, 0.2)",
    },
    ".Tab--selected:hover": {
      backgroundColor: "hsl(210, 100%, 58%)",
      border: "1px solid hsl(210, 100%, 58%)",
    },
    ".TabIcon": {
      fill: "currentColor",
    },
    ".TabIcon--selected": {
      fill: "hsl(0, 0%, 100%)",
    },
    ".TabLabel": {
      fontWeight: "500",
    },
    ".Input": {
      backgroundColor: "hsl(0, 0%, 15%)",
      border: "1px solid hsl(240, 4%, 26%)",
      boxShadow: "none",
      color: "hsl(0, 0%, 100%)",
      padding: "12px",
      transition: "border-color 0.15s ease, box-shadow 0.15s ease",
    },
    ".Input:hover": {
      border: "1px solid hsl(240, 4%, 36%)",
    },
    ".Input:focus": {
      border: "1px solid hsl(210, 100%, 63%)",
      boxShadow: "0 0 0 3px hsla(210, 100%, 63%, 0.15)",
      outline: "none",
    },
    ".Input--invalid": {
      border: "1px solid hsl(0, 84%, 60%)",
      boxShadow: "0 0 0 3px hsla(0, 84%, 60%, 0.15)",
    },
    ".Input::placeholder": {
      color: "hsl(240, 4%, 46%)",
    },
    ".Label": {
      color: "hsl(240, 5%, 65%)",
      fontWeight: "500",
      fontSize: "13px",
      marginBottom: "6px",
    },
    ".Error": {
      color: "hsl(0, 84%, 60%)",
      fontSize: "13px",
      marginTop: "6px",
    },
    ".Block": {
      backgroundColor: "hsl(0, 0%, 12%)",
      border: "1px solid hsl(240, 4%, 26%)",
      borderRadius: "8px",
      padding: "16px",
    },
    ".CheckboxInput": {
      backgroundColor: "hsl(0, 0%, 15%)",
      border: "1px solid hsl(240, 4%, 26%)",
    },
    ".CheckboxInput--checked": {
      backgroundColor: "hsl(210, 100%, 63%)",
      border: "1px solid hsl(210, 100%, 63%)",
    },
    ".CheckboxLabel": {
      color: "hsl(240, 5%, 65%)",
      fontSize: "13px",
    },
    ".RedirectText": {
      color: "hsl(240, 5%, 65%)",
      fontSize: "13px",
    },
    ".TermsText": {
      color: "hsl(240, 4%, 46%)",
      fontSize: "12px",
    },
    ".TermsLink": {
      color: "hsl(210, 100%, 63%)",
    },
    ".PaymentMethodSelector": {
      backgroundColor: "transparent",
    },
    ".AccordionItem": {
      backgroundColor: "hsl(0, 0%, 12%)",
      border: "1px solid hsl(240, 4%, 26%)",
      borderRadius: "8px",
    },
    ".AccordionItemHeader": {
      backgroundColor: "transparent",
      padding: "16px",
    },
    ".AccordionItemHeader--selected": {
      backgroundColor: "transparent",
    },
  },
};

/**
 * Light mode variant for Biz Dev (if needed in future)
 */
export const bizDevStripeAppearanceLight: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "hsl(210, 100%, 50%)",
    colorBackground: "hsl(0, 0%, 100%)",
    colorText: "hsl(0, 0%, 10%)",
    colorTextSecondary: "hsl(240, 5%, 46%)",
    borderRadius: "8px",
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
};

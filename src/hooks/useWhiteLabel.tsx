import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface WhiteLabelConfig {
  platform: "bizdev" | "xbuilderx";
  brandName: string;
  logoUrl: string;
  primaryColor: string;
  landingPage: string;
}

const WhiteLabelContext = createContext<WhiteLabelConfig>({
  platform: "bizdev",
  brandName: "Biz Dev App",
  logoUrl: "/assets/bizdev-logo.png",
  primaryColor: "hsl(210 100% 63%)",
  landingPage: "/",
});

export const useWhiteLabel = () => useContext(WhiteLabelContext);

interface WhiteLabelProviderProps {
  children: ReactNode;
}

export const WhiteLabelProvider = ({ children }: WhiteLabelProviderProps) => {
  const [config, setConfig] = useState<WhiteLabelConfig>({
    platform: "bizdev",
    brandName: "Biz Dev App",
    logoUrl: "/assets/bizdev-logo.png",
    primaryColor: "hsl(210 100% 63%)",
    landingPage: "/",
  });

  useEffect(() => {
    const hostname = window.location.hostname;
    
    // Check if accessing from xbuilderx.com domain
    if (hostname.includes("xbuilderx.com")) {
      setConfig({
        platform: "xbuilderx",
        brandName: "xBUILDERx",
        logoUrl: "/assets/bizdev-logo.png", // Can be updated to xBUILDERx logo
        primaryColor: "hsl(210 100% 63%)",
        landingPage: "/xbuilderx",
      });
    }
  }, []);

  return (
    <WhiteLabelContext.Provider value={config}>
      {children}
    </WhiteLabelContext.Provider>
  );
};

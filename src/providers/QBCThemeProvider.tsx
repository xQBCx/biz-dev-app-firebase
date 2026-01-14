import { useEffect, ReactNode } from 'react';
import { useIsPublicDomain } from '@/hooks/useDomainRouting';

/**
 * QBC Cyber-Quantum Theme Variables
 * Applied when visiting from quantumbitcode.com domain
 */
const QBC_THEME = {
  // Core colors - Deep Space Black + Electric Cyan
  '--background': '230 25% 7%',
  '--foreground': '210 40% 96%',
  '--card': '230 25% 10%',
  '--card-foreground': '210 40% 96%',
  '--popover': '230 25% 12%',
  '--popover-foreground': '210 40% 96%',
  
  // Primary - Electric Cyan
  '--primary': '185 100% 50%',
  '--primary-foreground': '230 25% 7%',
  
  // Secondary - Deep Purple
  '--secondary': '280 60% 20%',
  '--secondary-foreground': '210 40% 96%',
  
  // Muted
  '--muted': '230 25% 15%',
  '--muted-foreground': '210 20% 60%',
  
  // Accent - Neon Purple
  '--accent': '280 100% 65%',
  '--accent-foreground': '210 40% 96%',
  
  // Destructive
  '--destructive': '0 70% 50%',
  '--destructive-foreground': '210 40% 96%',
  
  // Border/Input
  '--border': '230 25% 20%',
  '--input': '230 25% 15%',
  '--ring': '185 100% 50%',
  
  // QBC Specific tokens
  '--qbc-cyan': '185 100% 50%',
  '--qbc-purple': '280 100% 65%',
  '--qbc-pink': '320 100% 60%',
  '--qbc-deep-space': '230 25% 7%',
  '--qbc-glow': '185 100% 50%',
} as const;

interface QBCThemeProviderProps {
  children: ReactNode;
}

export function QBCThemeProvider({ children }: QBCThemeProviderProps) {
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply QBC theme
    Object.entries(QBC_THEME).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    // Add dark class for dark mode styling
    root.classList.add('dark', 'qbc-theme');
    
    // Update theme-color meta tag
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', 'hsl(230, 25%, 7%)');
    }
    
    // Cleanup on unmount
    return () => {
      Object.keys(QBC_THEME).forEach((key) => {
        root.style.removeProperty(key);
      });
      root.classList.remove('dark', 'qbc-theme');
    };
  }, []);

  return <>{children}</>;
}

/**
 * Hook to check if QBC theme should be applied
 */
export function useIsQBCDomain(): boolean {
  const hostname = typeof window !== 'undefined' 
    ? window.location.hostname.toLowerCase() 
    : '';
  
  return (
    hostname === 'quantumbitcode.com' ||
    hostname === 'www.quantumbitcode.com' ||
    hostname.endsWith('.quantumbitcode.com')
  );
}

import { useEffect, ReactNode } from 'react';

/**
 * ThemeLockProvider
 * 
 * This provider runs once at app start and forces the baseline flat, light theme.
 * It prevents any accidental or cached overrides from changing the platform surfaces.
 * 
 * Locked values:
 * - Light backgrounds (no navy/dark)
 * - No shadows (completely flat)
 * - Consistent border radius
 */

const LOCKED_THEME_VARIABLES = {
  // Light mode baseline - flat, minimal
  '--background': '0 0% 100%',
  '--foreground': '0 0% 10%',
  '--card': '0 0% 100%',
  '--card-foreground': '0 0% 10%',
  '--popover': '0 0% 100%',
  '--popover-foreground': '0 0% 10%',
  '--primary': '0 0% 10%',
  '--primary-foreground': '0 0% 100%',
  '--secondary': '0 0% 96%',
  '--secondary-foreground': '0 0% 10%',
  '--muted': '0 0% 96%',
  '--muted-foreground': '0 0% 45%',
  '--accent': '0 0% 96%',
  '--accent-foreground': '0 0% 10%',
  '--destructive': '0 0% 20%',
  '--destructive-foreground': '0 0% 98%',
  '--border': '0 0% 90%',
  '--input': '0 0% 96%',
  '--ring': '0 0% 10%',
  '--radius': '0.5rem',
  // Force no shadows
  '--shadow-elevated': 'none',
  '--shadow-chrome': 'none',
  '--shadow-inset': 'none',
  '--shadow-glow': 'none',
  '--shadow-neon-blue': 'none',
} as const;

function applyThemeLock() {
  const root = document.documentElement;
  
  Object.entries(LOCKED_THEME_VARIABLES).forEach(([variable, value]) => {
    const currentValue = getComputedStyle(root).getPropertyValue(variable).trim();
    
    // Only log if there's a mismatch (helps identify regressors)
    if (currentValue && currentValue !== value) {
      console.warn(`[ThemeLock] Correcting ${variable}: "${currentValue}" → "${value}"`);
    }
    
    root.style.setProperty(variable, value);
  });

  // Also update the theme-color meta tag dynamically
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', '#ffffff');
  }

  // Remove dark class if somehow present (we're locking to light)
  root.classList.remove('dark');
}

interface ThemeLockProviderProps {
  children: ReactNode;
}

export function ThemeLockProvider({ children }: ThemeLockProviderProps) {
  useEffect(() => {
    // Apply immediately on mount
    applyThemeLock();

    // Also apply after a small delay to catch any late-loading styles
    const timeoutId = setTimeout(applyThemeLock, 100);

    // Set up a MutationObserver to detect any attempts to change the theme
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          // Re-apply if someone tries to change root styles
          applyThemeLock();
        }
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          // Remove dark class if someone adds it
          const root = document.documentElement;
          if (root.classList.contains('dark')) {
            root.classList.remove('dark');
            console.warn('[ThemeLock] Removed unauthorized dark mode class');
          }
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  return <>{children}</>;
}

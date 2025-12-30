import { useEffect, ReactNode } from 'react';

/**
 * ThemeLockProvider - AGGRESSIVE THEME ENFORCEMENT
 * 
 * Forces flat, light, monochromatic theme by:
 * 1. Setting CSS variables immediately (before paint)
 * 2. Removing any dark class
 * 3. Watching for and reverting any changes
 * 4. Re-applying every 100ms to catch late-loaders
 */

// These are the ONLY allowed values for platform surfaces
const LOCKED_THEME = {
  // Light backgrounds - NO navy, NO blue tints
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
  // NO SHADOWS - completely flat
  '--shadow-elevated': 'none',
  '--shadow-chrome': 'none',
  '--shadow-inset': 'none',
  '--shadow-glow': 'none',
  '--shadow-neon-blue': 'none',
  // NO colored tokens
  '--navy-deep': '0 0% 15%',
  '--royal-blue': '0 0% 30%',
  '--chrome': '0 0% 60%',
  '--brushed-silver': '0 0% 80%',
  '--neon-blue': '0 0% 20%',
  '--neon-purple': '0 0% 30%',
  '--neon-pink': '0 0% 40%',
} as const;

function forceTheme() {
  const root = document.documentElement;
  
  // Remove dark class
  if (root.classList.contains('dark')) {
    root.classList.remove('dark');
    console.warn('[ThemeLock] Removed dark class');
  }
  
  // Force all theme variables
  Object.entries(LOCKED_THEME).forEach(([prop, value]) => {
    root.style.setProperty(prop, value);
  });

  // Force theme-color meta
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta && meta.getAttribute('content') !== '#ffffff') {
    meta.setAttribute('content', '#ffffff');
  }
}

interface ThemeLockProviderProps {
  children: ReactNode;
}

export function ThemeLockProvider({ children }: ThemeLockProviderProps) {
  useEffect(() => {
    // Apply immediately
    forceTheme();

    // Apply again after short delays to catch any late CSS
    const t1 = setTimeout(forceTheme, 50);
    const t2 = setTimeout(forceTheme, 200);
    const t3 = setTimeout(forceTheme, 500);
    const t4 = setTimeout(forceTheme, 1000);

    // Keep checking periodically
    const interval = setInterval(forceTheme, 2000);

    // Watch for any changes
    const observer = new MutationObserver(() => {
      forceTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  return <>{children}</>;
}

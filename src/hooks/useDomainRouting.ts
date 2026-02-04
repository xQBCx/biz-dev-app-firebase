import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Domain-based routing hook
 * Redirects visitors from specific domains to their corresponding routes
 * Supports: bdsrvs.com, quantumbitcode.com
 */
export function useDomainRouting() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const hostname = window.location.hostname.toLowerCase();
    
    // Check if visiting from bdsrvs.com domain
    const isBdsrvsDomain = 
      hostname === 'bdsrvs.com' || 
      hostname === 'www.bdsrvs.com' ||
      hostname.endsWith('.bdsrvs.com');

    // Check if visiting from quantumbitcode.com domain
    const isQBCDomain = 
      hostname === 'quantumbitcode.com' || 
      hostname === 'www.quantumbitcode.com' ||
      hostname.endsWith('.quantumbitcode.com');

    // Handle bdsrvs.com routing
    if (isBdsrvsDomain && !location.pathname.startsWith('/bdsrvs')) {
      // Allow auth and other app routes to pass through without redirect
      const appRoutes = ['/auth', '/dashboard', '/accept-invite', '/verify-identity'];
      const isAppRoute = appRoutes.some(route => location.pathname.startsWith(route));
      
      if (isAppRoute) {
        // Don't redirect - let user access auth and app routes
        return;
      }
      
      // Map root to /bdsrvs, preserve other paths
      if (location.pathname === '/' || location.pathname === '') {
        navigate('/bdsrvs', { replace: true });
      } else {
        // For any other path, prefix with /bdsrvs if it's a valid bdsrvs subpage
        const validSubpages = ['/about', '/services', '/contact'];
        if (validSubpages.includes(location.pathname)) {
          navigate(`/bdsrvs${location.pathname}`, { replace: true });
        } else {
          // Default to bdsrvs home for unknown paths
          navigate('/bdsrvs', { replace: true });
        }
      }
    }

    // Handle quantumbitcode.com routing
    if (isQBCDomain && !location.pathname.startsWith('/qbc')) {
      // Map root to /qbc, preserve other paths
      if (location.pathname === '/' || location.pathname === '') {
        navigate('/qbc', { replace: true });
      } else {
        // For any other path, prefix with /qbc if it's a valid qbc subpage
        const validSubpages = ['/generator', '/about', '/docs', '/pricing'];
        if (validSubpages.includes(location.pathname)) {
          navigate(`/qbc${location.pathname}`, { replace: true });
        } else {
          // Default to qbc home for unknown paths
          navigate('/qbc', { replace: true });
        }
      }
    }
  }, [location.pathname, navigate]);
}

/**
 * Check if we're on a public domain (no sidebar/auth required)
 */
export function useIsPublicDomain(): boolean {
  const hostname = window.location.hostname.toLowerCase();
  
  const isBdsrvsDomain = 
    hostname === 'bdsrvs.com' || 
    hostname === 'www.bdsrvs.com' ||
    hostname.endsWith('.bdsrvs.com');

  const isQBCDomain = 
    hostname === 'quantumbitcode.com' || 
    hostname === 'www.quantumbitcode.com' ||
    hostname.endsWith('.quantumbitcode.com');

  return isBdsrvsDomain || isQBCDomain;
}

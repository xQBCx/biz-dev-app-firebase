import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Domain-based routing hook
 * Redirects visitors from specific domains to their corresponding routes
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

    // If on bdsrvs domain and not already on a /bdsrvs route, redirect
    if (isBdsrvsDomain && !location.pathname.startsWith('/bdsrvs')) {
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
  }, [location.pathname, navigate]);
}

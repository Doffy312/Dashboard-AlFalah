import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Ensures that navigating between pages resets scroll position to top (0, 0),
 * while preserving smooth scroll behavior for hash links (e.g. /#kontak).
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If navigating with a hash (e.g., /#kontak)
    if (hash) {
      const targetId = hash.replace('#', '');
      const element = document.getElementById(targetId);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Fallback for lazy-loaded sections or DOM render delay
        const timer = setTimeout(() => {
          const delayedElement = document.getElementById(targetId);
          if (delayedElement) {
            delayedElement.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          }
        }, 100);
        return () => clearTimeout(timer);
      }
    } else {
      // Standard route change without hash -> reset scroll to top immediately
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname, hash]);

  return null;
}

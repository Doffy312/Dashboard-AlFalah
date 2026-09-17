import { lazy } from 'react';

/**
 * lazyWithRetry — Resilient component lazy loading
 * 
 * Automatically handles chunk loading errors caused by:
 * 1. New application deployments (hash mismatch where old chunks are replaced)
 * 2. Temporary network disconnections / packet drops
 * 
 * When a chunk fails to load, it attempts a controlled page reload once to fetch
 * the latest application assets before throwing to ErrorBoundary.
 */
export function lazyWithRetry(componentImport) {
  return lazy(async () => {
    const reloadKey = 'chunk_reload_attempted';
    
    try {
      const module = await componentImport();
      // Successful load: clear any previous reload flag
      try {
        sessionStorage.removeItem(reloadKey);
      } catch {
        // ignore storage access restrictions
      }
      return module;
    } catch (error) {
      const isChunkError =
        error?.name === 'ChunkLoadError' ||
        error?.message?.includes('dynamically imported module') ||
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('Failed to fetch');

      let alreadyReloaded = false;
      try {
        alreadyReloaded = sessionStorage.getItem(reloadKey) === 'true';
      } catch {
        // ignore storage access restrictions
      }

      if (isChunkError && !alreadyReloaded) {
        try {
          sessionStorage.setItem(reloadKey, 'true');
        } catch {
          // ignore storage access restrictions
        }
        
        console.warn('Chunk load error detected, auto-refreshing to fetch latest version:', error);
        window.location.reload();
        // Return a pending promise while the browser performs the reload
        return new Promise(() => {});
      }

      // If already reloaded once and still failing (e.g. server completely unreachable), bubble up
      throw error;
    }
  });
}

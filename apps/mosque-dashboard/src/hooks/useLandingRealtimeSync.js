import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * useLandingRealtimeSync — Lightweight realtime sync for public pages.
 *
 * Lazily loads Socket.IO (via dynamic import) to avoid bloating the initial
 * bundle, then listens for `dataUpdate` events from the backend.  When a
 * finance-related entity changes (transactions / ziswaf) the relevant React
 * Query caches are invalidated so charts & stats refresh automatically.
 *
 * This hook is completely independent from `useRealtimeSync` used inside the
 * authenticated DashboardLayout and does NOT modify any existing behaviour.
 */
export function useLandingRealtimeSync() {
  const queryClient = useQueryClient();
  const socketRef = useRef(null);
  const mountedRef = useRef(true);

  // -------------------------------------------------------------------
  // Query keys that are relevant to public finance views
  // -------------------------------------------------------------------
  const invalidateFinanceQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    queryClient.invalidateQueries({ queryKey: ['transactionSummary'] });
    queryClient.invalidateQueries({ queryKey: ['dashboardCashflow'] });
    queryClient.invalidateQueries({ queryKey: ['dashboardAllocation'] });
    queryClient.invalidateQueries({ queryKey: ['dashboardCategoryTrends'] });
  }, [queryClient]);

  useEffect(() => {
    mountedRef.current = true;

    // Lazy-load socket.io-client so it stays out of the critical bundle
    const connectSocket = async () => {
      try {
        const { io } = await import('socket.io-client');

        // Guard: component may have unmounted while we were importing
        if (!mountedRef.current) return;

        let backendUrl = undefined;
        const rawApiUrl = import.meta.env.VITE_API_URL;
        if (rawApiUrl) {
          try {
            let trimmed = rawApiUrl.trim();
            if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/')) {
              trimmed = `https://${trimmed}`;
            }
            backendUrl = new URL(trimmed, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000').origin;
          } catch {
            backendUrl = undefined;
          }
        }

        const socket = io(backendUrl, {
          withCredentials: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 3000,
          transports: ['websocket', 'polling'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          console.log('🌐 [Landing] Connected to realtime sync');
        });

        socket.on('dataUpdate', (payload) => {
          const entity = payload?.entity;

          // Only react to finance-related entity changes
          if (['transactions', 'ziswaf'].includes(entity)) {
            console.log(`🔄 [Landing] Finance data updated (${entity})`);
            invalidateFinanceQueries();
          }
        });

        socket.on('disconnect', () => {
          console.log('🌐 [Landing] Disconnected from realtime sync');
        });
      } catch (err) {
        // Socket.IO failed to load or connect — polling fallback
        // (handled via refetchInterval in query options) will still work
        console.warn('⚠️ [Landing] Realtime sync unavailable:', err.message);
      }
    };

    connectSocket();

    return () => {
      mountedRef.current = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [invalidateFinanceQueries]);
}

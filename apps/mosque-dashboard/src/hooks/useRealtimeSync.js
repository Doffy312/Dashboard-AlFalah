import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimeSync() {
  const queryClient = useQueryClient();
  const socketRef = useRef(null);

  useEffect(() => {
    // Determine the backend URL (assuming it's similar to the API URL or same host)
    // If your API is at http://localhost:3000/api, the socket is at http://localhost:3000
    const backendUrl = import.meta.env.VITE_API_URL 
      ? new URL(import.meta.env.VITE_API_URL).origin 
      : undefined;

    socketRef.current = io(backendUrl, {
      withCredentials: true,
    });

    socketRef.current.on('connect', () => {
      console.log('🔌 Connected to realtime sync server');
    });

    socketRef.current.on('dataUpdate', (payload) => {
      console.log(`🔄 Realtime update received for entity: ${payload.entity}`);
      
      // Invalidate queries based on the entity that was updated
      switch (payload.entity) {
        case 'transactions':
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
          queryClient.invalidateQueries({ queryKey: ['dashboardCashflow'] });
          queryClient.invalidateQueries({ queryKey: ['dashboardAllocation'] });
          queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
          queryClient.invalidateQueries({ queryKey: ['dashboardRecentActivity'] });
          break;
        case 'jemaah':
          queryClient.invalidateQueries({ queryKey: ['jemaah'] });
          queryClient.invalidateQueries({ queryKey: ['jemaahSummary'] });
          queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
          break;
        case 'inventaris':
          queryClient.invalidateQueries({ queryKey: ['inventories'] });
          queryClient.invalidateQueries({ queryKey: ['inventorySummary'] });
          queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
          break;
        case 'programs':
          queryClient.invalidateQueries({ queryKey: ['programs'] });
          queryClient.invalidateQueries({ queryKey: ['programSummary'] });
          queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
          queryClient.invalidateQueries({ queryKey: ['dashboardUpcomingPrograms'] });
          break;
        default:
          // If entity is unknown or global update, invalidate everything
          queryClient.invalidateQueries();
          break;
      }
    });

    socketRef.current.on('notificationUpdated', () => {
      console.log(`🔔 Realtime notification update received`);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    socketRef.current.on('disconnect', () => {
      console.log('🔌 Disconnected from realtime sync server');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [queryClient]);
}

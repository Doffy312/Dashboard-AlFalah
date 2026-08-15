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
      
      // Always invalidate all dashboard queries on any data update
      // This prevents bugs where widgets don't update when data changes
      const invalidateDashboard = () => {
        queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
        queryClient.invalidateQueries({ queryKey: ['dashboardCashflow'] });
        queryClient.invalidateQueries({ queryKey: ['dashboardAllocation'] });
        queryClient.invalidateQueries({ queryKey: ['dashboardRecentActivity'] });
        queryClient.invalidateQueries({ queryKey: ['dashboardUpcomingPrograms'] });
        queryClient.invalidateQueries({ queryKey: ['dashboardCompletedPrograms'] });
      };
      
      invalidateDashboard();
      
      // Invalidate specific entity list queries
      switch (payload.entity) {
        case 'transactions':
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
          break;
        case 'jemaah':
          queryClient.invalidateQueries({ queryKey: ['jemaah'] });
          queryClient.invalidateQueries({ queryKey: ['jemaahSummary'] });
          break;
        case 'inventaris':
          queryClient.invalidateQueries({ queryKey: ['inventaris'] });
          queryClient.invalidateQueries({ queryKey: ['inventarisSummary'] });
          break;
        case 'programs':
          queryClient.invalidateQueries({ queryKey: ['programs'] });
          queryClient.invalidateQueries({ queryKey: ['programSummary'] });
          break;
        case 'ziswaf':
          queryClient.invalidateQueries({ queryKey: ['ziswaf'] });
          break;
        case 'jadwal':
          queryClient.invalidateQueries({ queryKey: ['jadwal'] });
          break;
        case 'articles':
          queryClient.invalidateQueries({ queryKey: ['articles'] });
          break;
        case 'contact-messages':
        case 'contactMessages':
          queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
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
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
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

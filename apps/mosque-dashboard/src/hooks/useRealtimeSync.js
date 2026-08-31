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
      console.log(`🔄 Realtime update received for entity: ${payload?.entity}`);
      
      const entity = payload?.entity;
      
      // Smart Scoped Invalidation: Refresh only affected widgets and tables
      switch (entity) {
        case 'transactions':
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
          queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
          queryClient.invalidateQueries({ queryKey: ['dashboardCashflow'] });
          queryClient.invalidateQueries({ queryKey: ['dashboardAllocation'] });
          queryClient.invalidateQueries({ queryKey: ['dashboardRecentActivity'] });
          break;
        case 'ziswaf':
          queryClient.invalidateQueries({ queryKey: ['ziswaf'] });
          queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
          queryClient.invalidateQueries({ queryKey: ['dashboardCashflow'] });
          queryClient.invalidateQueries({ queryKey: ['dashboardAllocation'] });
          break;
        case 'jemaah':
          queryClient.invalidateQueries({ queryKey: ['jemaah'] });
          queryClient.invalidateQueries({ queryKey: ['jemaahSummary'] });
          queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
          break;
        case 'inventaris':
          queryClient.invalidateQueries({ queryKey: ['inventaris'] });
          queryClient.invalidateQueries({ queryKey: ['inventarisSummary'] });
          queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
          break;
        case 'programs':
          queryClient.invalidateQueries({ queryKey: ['programs'] });
          queryClient.invalidateQueries({ queryKey: ['programSummary'] });
          queryClient.invalidateQueries({ queryKey: ['dashboardUpcomingPrograms'] });
          queryClient.invalidateQueries({ queryKey: ['dashboardCompletedPrograms'] });
          queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
          break;
        case 'qurban':
          queryClient.invalidateQueries({ queryKey: ['qurban'] });
          queryClient.invalidateQueries({ queryKey: ['qurbanSummary'] });
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
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          break;
        case 'notifications':
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          break;
        default:
          // Fallback if entity is undefined or global
          queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
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

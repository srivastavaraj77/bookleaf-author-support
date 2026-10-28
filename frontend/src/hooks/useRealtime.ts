import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../services/api';

export function useRealtime(onTicketUpdate?: (data: any) => void) {
  const { token, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    // Connect to SSE stream
    const sseUrl = `${API_BASE}/events/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    es.addEventListener('new_message', (e) => {
      try {
        const data = JSON.parse(e.data);
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
        queryClient.invalidateQueries({ queryKey: ['ticket', data.ticket_id] });
        queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
        queryClient.invalidateQueries({ queryKey: ['authorDashboard'] });
        if (onTicketUpdate) onTicketUpdate(data);
      } catch (err) {
        console.error('Error handling SSE new_message', err);
      }
    });

    es.addEventListener('status_change', (e) => {
      try {
        const data = JSON.parse(e.data);
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
        queryClient.invalidateQueries({ queryKey: ['ticket', data.ticket_id] });
        queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
        queryClient.invalidateQueries({ queryKey: ['authorDashboard'] });
        if (onTicketUpdate) onTicketUpdate(data);
      } catch (err) {
        console.error('Error handling SSE status_change', err);
      }
    });

    es.addEventListener('new_ticket', (e) => {
      try {
        const data = JSON.parse(e.data);
        queryClient.invalidateQueries({ queryKey: ['adminTickets'] });
        queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      } catch (err) {
        console.error('Error handling SSE new_ticket', err);
      }
    });

    es.onerror = (err) => {
      // Reconnection handled automatically by browser EventSource
      console.warn('SSE stream notice/reconnecting...', err);
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [isAuthenticated, token, queryClient, onTicketUpdate]);
}


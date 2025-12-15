'use client';

import { useAuthStore } from '@/store/auth-store';
import { Event, useEventsStore } from '@/store/events-store';
import { useNotificationsStore } from '@/store/notifications-store';
import { Client } from '@stomp/stompjs';
import { useCallback, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { toast } from 'sonner';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws';

export function useWebSocket() {
  const clientRef = useRef<Client | null>(null);
  const { updateEvent } = useEventsStore();
  const { user, token, updateBalance } = useAuthStore();
  const { addNotification } = useNotificationsStore();

  const handleNotification = useCallback((notification: { type: string; message: string }) => {
    // Add to notification store
    addNotification(notification.type, notification.message);

    // Show toast based on type
    switch (notification.type) {
      case 'BET_WON':
        toast.success(notification.message, {
          duration: 8000,
          icon: '🎉',
        });
        break;
      case 'BET_LOST':
        toast.error(notification.message, {
          duration: 6000,
          icon: '😢',
        });
        break;
      case 'MONEY_REQUEST_APPROVED':
        toast.success(notification.message, {
          duration: 6000,
          icon: '💰',
        });
        break;
      case 'MONEY_REQUEST_REJECTED':
        toast.error(notification.message, {
          duration: 6000,
          icon: '❌',
        });
        break;
      case 'EVENT_LOCKED':
        toast.info(notification.message, {
          duration: 5000,
          icon: '🔒',
        });
        break;
      case 'NEW_MONEY_REQUEST':
        toast.info(notification.message, {
          duration: 5000,
          icon: '📩',
        });
        break;
      case 'NEW_EVENT':
        toast.success(notification.message, {
          duration: 6000,
          icon: '🏆',
          style: {
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            color: 'white',
            border: '2px solid #a78bfa',
          },
        });
        break;
      case 'BADGE_UNLOCKED':
        toast.success(notification.message, {
          duration: 8000,
          icon: '🏆',
          style: {
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: 'white',
            border: '2px solid #fbbf24',
          },
        });
        break;
      default:
        toast.info(notification.message, {
          duration: 5000,
        });
    }
  }, [addNotification]);

  const connect = useCallback(() => {
    if (clientRef.current?.connected) return;
    if (!user?.id || !token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        console.log('✅ WebSocket connected');

        // Subscribe to event updates
        client.subscribe('/topic/events', (message) => {
          const event: Event = JSON.parse(message.body);
          updateEvent(event);
        });

        // Subscribe to user-specific notifications via topic
        client.subscribe(`/topic/user/${user.id}/notifications`, (message) => {
          const notification = JSON.parse(message.body);
          console.log('📬 Received notification:', notification);
          handleNotification(notification);
        });

        // Subscribe to global notifications (new events, etc.)
        client.subscribe('/topic/global/notifications', (message) => {
          const notification = JSON.parse(message.body);
          console.log('🌐 Global notification:', notification);
          handleNotification(notification);
        });

        // Admin: subscribe to money request notifications
        if (user.role === 'ADMIN') {
          client.subscribe('/topic/admin/requests', (message) => {
            const data = JSON.parse(message.body);

            // Check if it's a new request or a handled event
            if (data.action) {
              // Request was handled (APPROVED/REJECTED), could refresh list
              return;
            }

            // New money request
            handleNotification({
              type: 'NEW_MONEY_REQUEST',
              message: `Nova solicitação de R$ ${data.amountRequested?.toFixed(2)} de ${data.userEmail}`,
            });
          });
        }
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      },
    });

    client.activate();
    clientRef.current = client;
  }, [user?.id, user?.email, user?.role, token, updateEvent, handleNotification]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { connect, disconnect };
}

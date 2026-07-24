import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface AuctionSocketMessage {
  auctionId: number;
  bidId: string;
  currentPrice: number;
  bidCount: number;
  bidderNickname: string;
  bidTime: string;
  status: string;
}

function getWsBaseUrl(): string {
  if (import.meta.env.VITE_WS_BASE_URL) {
    return import.meta.env.VITE_WS_BASE_URL.replace(/\/$/, '');
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL || '';
  const url = new URL(apiBase, window.location.origin);
  return `${url.protocol}//${url.host}`;
}

export function useAuctionSocket(
  auctionId: string | undefined,
  isFinished: boolean,
  onMessage: (payload: AuctionSocketMessage) => void,
) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!auctionId || isFinished) return;

    const wsUrl = `${getWsBaseUrl()}/ws`;

    const client = new Client({
      // Cookie auth: SockJS handshake sends HttpOnly cookie; server JwtHandshakeInterceptor reads it.
      webSocketFactory: () => new SockJS(wsUrl),
      onConnect: () => {
        client.subscribe(`/topic/auctions/${auctionId}`, (message) => {
          try {
            const payload = JSON.parse(message.body) as AuctionSocketMessage;
            onMessageRef.current(payload);
          } catch (error) {
            console.error('Failed to parse auction socket message:', error);
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers['message']);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [auctionId, isFinished]);
}

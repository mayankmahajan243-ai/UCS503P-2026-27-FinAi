import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

/**
 * Derive WebSocket URL from VITE_API_URL or fall back to localhost.
 * VITE_API_URL = "http://localhost:8080/api" → WS = "http://localhost:8080/ws"
 */
function getWsUrl() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
  // Strip trailing /api or /api/ and append /ws
  return apiUrl.replace(/\/api\/?$/, "/ws");
}

/**
 * useLivePrices — subscribes to WebSocket /topic/prices
 * Returns: { prices, connected }  →  Map<symbol, { price, changePercent }>
 */
export default function useLivePrices(initialStocks = []) {
  const [prices, setPrices] = useState(() => {
    const map = {};
    if (Array.isArray(initialStocks)) {
      initialStocks.forEach(s => {
        if (s && s.symbol) {
          map[s.symbol] = {
            price: s.price ?? 0,
            changePercent: s.changePercent ?? 0,
          };
        }
      });
    }
    return map;
  });

  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    try {
      const wsUrl = getWsUrl();
      const client = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        reconnectDelay: 5000,          // 5s initial reconnect
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        debug: () => {},               // suppress verbose debug
        onConnect: () => {
          if (!isMounted) return;
          setConnected(true);
          client.subscribe("/topic/prices", (msg) => {
            try {
              const ticks = JSON.parse(msg.body);
              if (!Array.isArray(ticks)) return;
              setPrices(prev => {
                const next = { ...prev };
                ticks.forEach(t => {
                  if (t && t.symbol) {
                    next[t.symbol] = {
                      price: parseFloat(t.price),
                      changePercent: parseFloat(t.changePercent),
                    };
                  }
                });
                return next;
              });
            } catch (e) { /* ignore parse errors */ }
          });
        },
        onDisconnect: () => { if (isMounted) setConnected(false); },
        onStompError: () => { if (isMounted) setConnected(false); },
        onWebSocketError: () => { if (isMounted) setConnected(false); },
        onWebSocketClose: () => { if (isMounted) setConnected(false); },
      });

      client.activate();
      clientRef.current = client;
    } catch (err) {
      console.warn("WebSocket fallback notice:", err);
    }

    return () => {
      isMounted = false;
      if (clientRef.current) {
        try {
          clientRef.current.deactivate();
        } catch (e) {}
      }
    };
  }, []);

  // Seed prices when initialStocks loads (first fetch from REST)
  useEffect(() => {
    if (!Array.isArray(initialStocks) || initialStocks.length === 0) return;
    setPrices(prev => {
      const map = { ...prev };
      initialStocks.forEach(s => {
        if (s && s.symbol && !map[s.symbol]) {
          map[s.symbol] = {
            price: s.price ?? 0,
            changePercent: s.changePercent ?? 0,
          };
        }
      });
      return map;
    });
  }, [initialStocks]);

  return { prices, connected };
}

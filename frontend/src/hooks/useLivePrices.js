import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

/**
 * useLivePrices — subscribes to WebSocket /topic/prices
 * Returns: { prices }  →  Map<symbol, { price, changePercent }>
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

  const clientRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    try {
      const client = new Client({
        webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
        reconnectDelay: 4000,
        debug: () => {}, // suppress verbose debug in console
        onConnect: () => {
          if (!isMounted) return;
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
        onStompError: () => {},
        onWebSocketError: () => {}
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

  return { prices };
}

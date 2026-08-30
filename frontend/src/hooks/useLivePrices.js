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
    initialStocks.forEach(s => {
      map[s.symbol] = {
        price: s.price ?? 0,
        changePercent: s.changePercent ?? 0,
      };
    });
    return map;
  });

  const clientRef = useRef(null);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 3000,
      onConnect: () => {
        client.subscribe("/topic/prices", (msg) => {
          try {
            const ticks = JSON.parse(msg.body);
            if (!Array.isArray(ticks)) return;
            setPrices(prev => {
              const next = { ...prev };
              ticks.forEach(t => {
                next[t.symbol] = {
                  price: parseFloat(t.price),
                  changePercent: parseFloat(t.changePercent),
                };
              });
              return next;
            });
          } catch (e) { /* ignore parse errors */ }
        });
      },
    });

    client.activate();
    clientRef.current = client;

    return () => { client.deactivate(); };
  }, []);

  // Seed prices when initialStocks loads (first fetch from REST)
  useEffect(() => {
    if (initialStocks.length === 0) return;
    setPrices(prev => {
      const map = { ...prev };
      initialStocks.forEach(s => {
        if (!map[s.symbol]) {
          map[s.symbol] = {
            price: s.price ?? 0,
            changePercent: s.changePercent ?? 0,
          };
        }
      });
      return map;
    });
  }, [initialStocks.length]);

  return { prices };
}

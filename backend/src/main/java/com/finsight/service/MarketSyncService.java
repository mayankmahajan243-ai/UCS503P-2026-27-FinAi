package com.finsight.service;

import com.finsight.model.Stock;
import com.finsight.repository.StockRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MarketSyncService {

    private final StockRepository stockRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final Random random = new Random();

    // In-memory live price cache — never hits DB on every tick
    private final Map<String, BigDecimal> priceCache   = new ConcurrentHashMap<>();
    private final Map<String, BigDecimal> changeCache  = new ConcurrentHashMap<>();

    private int dbSaveCounter = 0;

    public MarketSyncService(StockRepository stockRepository, SimpMessagingTemplate messagingTemplate) {
        this.stockRepository   = stockRepository;
        this.messagingTemplate = messagingTemplate;
    }

    // ─────────────────────────────────────────────────────────────
    // Runs every 800ms — simulate price ticks + push via WebSocket
    // ─────────────────────────────────────────────────────────────
    @Scheduled(fixedRate = 800)
    public void simulateLiveMarketTicks() {

        List<Stock> stocks = stockRepository.findAll();
        if (stocks.isEmpty()) return;

        // Initialise cache on first run
        if (priceCache.isEmpty()) {
            stocks.forEach(s -> {
                if (s.getPrice() != null) {
                    priceCache.put(s.getSymbol(), s.getPrice());
                    changeCache.put(s.getSymbol(), s.getChangePercent() != null ? s.getChangePercent() : BigDecimal.ZERO);
                }
            });
        }

        // ── Simulate tick in memory ──────────────────────────────
        List<Map<String, Object>> ticks = new ArrayList<>();
        for (Stock stock : stocks) {
            String symbol = stock.getSymbol();
            BigDecimal lastPrice = priceCache.getOrDefault(symbol, stock.getPrice());
            if (lastPrice == null) continue;

            // Realistic micro-fluctuation: ±0.12% per 800ms tick
            double pct = (random.nextDouble() * 0.24) - 0.12;
            double newPrice = lastPrice.doubleValue() * (1 + pct / 100.0);
            BigDecimal updatedPrice  = BigDecimal.valueOf(newPrice).setScale(2, RoundingMode.HALF_UP);
            BigDecimal updatedChange = BigDecimal.valueOf(pct).setScale(2, RoundingMode.HALF_UP);

            priceCache.put(symbol, updatedPrice);
            changeCache.put(symbol, updatedChange);

            Map<String, Object> tick = new LinkedHashMap<>();
            tick.put("symbol", symbol);
            tick.put("price", updatedPrice);
            tick.put("changePercent", updatedChange);
            tick.put("ts", System.currentTimeMillis());
            ticks.add(tick);
        }

        // ── Broadcast to WebSocket subscribers ───────────────────
        try {
            messagingTemplate.convertAndSend("/topic/prices", ticks);
        } catch (Exception e) {
            // WebSocket not yet connected — ignore
        }

        // ── Persist to DB every 5 seconds (every ~6 ticks) ───────
        dbSaveCounter++;
        if (dbSaveCounter >= 6) {
            dbSaveCounter = 0;
            stocks.forEach(s -> {
                BigDecimal p = priceCache.get(s.getSymbol());
                BigDecimal c = changeCache.get(s.getSymbol());
                if (p != null) { s.setPrice(p); s.setChangePercent(c); }
            });
            stockRepository.saveAll(stocks);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Read live price from cache (used by TradeService etc.)
    // ─────────────────────────────────────────────────────────────
    public BigDecimal getLivePrice(String symbol) {
        return priceCache.containsKey(symbol)
                ? priceCache.get(symbol)
                : stockRepository.findBySymbol(symbol)
                        .map(Stock::getPrice)
                        .orElseThrow(() -> new RuntimeException("Stock not found: " + symbol));
    }
}
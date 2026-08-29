package com.finsight.service;

import com.finsight.model.Stock;
import com.finsight.repository.StockRepository;
import org.springframework.stereotype.Service;
import yahoofinance.YahooFinance;
import yahoofinance.quotes.stock.StockQuote;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MarketDataService {

    private final StockRepository stocks;
    private long lastFetchTime = 0;
    private boolean isRateLimited = false;
    private long rateLimitCooldown = 0;
    private static final long CACHE_DURATION = 120000; // 2 minutes normal cache
    private static final long COOLDOWN_DURATION = 900000; // 15 minutes cooldown if HTTP 429 hit

    public MarketDataService(StockRepository stocks) {
        this.stocks = stocks;
    }

    public synchronized List<Map<String, Object>> stocksWithAIScores() {
        List<Stock> dbStocks = stocks.findAll();

        long now = System.currentTimeMillis();

        // Check if we are currently in a rate-limit cooldown period
        if (isRateLimited && now < rateLimitCooldown) {
            // Skip live fetch silently, use local database values
            return mapToResponse(dbStocks);
        } else if (isRateLimited && now >= rateLimitCooldown) {
            isRateLimited = false; // Reset cooldown
        }

        // Fetch live data if cache expired
        if (now - lastFetchTime > CACHE_DURATION) {
            String[] symbols = dbStocks.stream().map(s -> s.getSymbol() + ".NS").toArray(String[]::new);
            try {
                if (symbols.length > 0) {
                    Map<String, yahoofinance.Stock> liveData = YahooFinance.get(symbols);
                    boolean updated = false;

                    for (Stock s : dbStocks) {
                        String ticker = s.getSymbol() + ".NS";
                        if (liveData.containsKey(ticker) && liveData.get(ticker) != null) {
                            StockQuote quote = liveData.get(ticker).getQuote();
                            if (quote.getPrice() != null) {
                                s.setPrice(quote.getPrice());
                                s.setChangePercent(quote.getChangeInPercent());
                                updated = true;
                            }
                        }
                    }
                    if (updated) {
                        stocks.saveAll(dbStocks);
                        lastFetchTime = System.currentTimeMillis();
                    }
                }
            } catch (Exception e) {
                if (e.getMessage() != null && e.getMessage().contains("429")) {
                    isRateLimited = true;
                    rateLimitCooldown = System.currentTimeMillis() + COOLDOWN_DURATION;
                    System.err.println("FinSight Engine: Yahoo Finance rate limit (429) hit. Entering 15-minute fallback mode using local database values.");
                } else {
                    System.err.println("FinSight Engine: Live data fetch warning: " + e.getMessage());
                }
            }
        }

        return mapToResponse(dbStocks);
    }

    private List<Map<String, Object>> mapToResponse(List<Stock> dbStocks) {
        return dbStocks.stream().map(s -> {
            Map<String, Object> stockData = new HashMap<>();
            stockData.put("symbol", s.getSymbol());
            stockData.put("companyName", s.getCompanyName());
            stockData.put("sector", s.getSector());
            stockData.put("price", s.getPrice());
            stockData.put("changePercent", s.getChangePercent());
            stockData.put("aiScore", calculateScore(s));
            stockData.put("peRatio", s.getPeRatio());
            stockData.put("roe", s.getRoe());
            return stockData;
        }).collect(Collectors.toList());
    }

    private int calculateScore(Stock s) {
        double score = 50;
        if (s.getRoe() != null) score += Math.min(20, Math.max(-10, s.getRoe().doubleValue() / 3));
        if (s.getPeRatio() != null) score += s.getPeRatio().doubleValue() < 25 ? 10 : -4;
        if (s.getDebtToEquity() != null) score += s.getDebtToEquity().doubleValue() < .5 ? 8 : -5;
        if (s.getChangePercent() != null) score += Math.min(8, Math.max(-8, s.getChangePercent().doubleValue() * 2));
        return Math.max(0, Math.min(100, (int) Math.round(score)));
    }

    public Stock find(String symbol) {
        return stocks.findBySymbol(symbol).orElseThrow(() -> new RuntimeException("Stock not found: " + symbol));
    }
}
package com.finsight.service;

import com.finsight.model.Stock;
import com.finsight.repository.StockRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MarketDataService {
    private final StockRepository stocks;

    public MarketDataService(StockRepository stocks) {
        this.stocks = stocks;
    }

    public List<Map<String, Object>> stocksWithAIScores() {

        return stocks.findAll().stream()
                .map(s -> {
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
                })
                .toList();
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
        return stocks.findBySymbol(symbol).orElseThrow();
    }
}

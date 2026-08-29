package com.finsight.service;

import com.finsight.model.Stock;
import com.finsight.repository.StockRepository;
import org.springframework.stereotype.Service;
import yahoofinance.YahooFinance;
import yahoofinance.quotes.stock.StockQuote;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MarketDataService {

    private final StockRepository stocks;

    public MarketDataService(StockRepository stocks) {
        this.stocks = stocks;
    }

    public List<Map<String, Object>> stocksWithAIScores() {
        List<Stock> dbStocks = stocks.findAll();

        // 1. Prepare symbols for NSE (append .NS)
        String[] symbols = dbStocks.stream()
                .map(s -> s.getSymbol() + ".NS")
                .toArray(String[]::new);

        Map<String, yahoofinance.Stock> tempLiveData = new HashMap<>();
        try {
            // 2. Fetch live data in a SINGLE batch request for extreme speed
            if (symbols.length > 0) {
                tempLiveData = YahooFinance.get(symbols);
            }
        } catch (IOException e) {
            System.err.println("FinSight Engine: Live data fetch failed, falling back to DB data. " + e.getMessage());
        }

        // 3. Make it final so the lambda expression does not throw an error
        final Map<String, yahoofinance.Stock> liveData = tempLiveData;

        return dbStocks.stream()
                .map(s -> {
                    Map<String, Object> stockData = new HashMap<>();

                    BigDecimal currentPrice = s.getPrice();
                    BigDecimal changePercent = s.getChangePercent();

                    // 4. Override DB values with live market data
                    String ticker = s.getSymbol() + ".NS";
                    if (liveData != null && liveData.containsKey(ticker) && liveData.get(ticker) != null) {
                        StockQuote quote = liveData.get(ticker).getQuote();
                        if (quote.getPrice() != null) {
                            currentPrice = quote.getPrice();
                            s.setPrice(currentPrice); // Update entity for accurate AI scoring
                        }
                        if (quote.getChangeInPercent() != null) {
                            changePercent = quote.getChangeInPercent();
                            s.setChangePercent(changePercent);
                        }
                    }

                    stockData.put("symbol", s.getSymbol());
                    stockData.put("companyName", s.getCompanyName());
                    stockData.put("sector", s.getSector());
                    stockData.put("price", currentPrice);
                    stockData.put("changePercent", changePercent);
                    stockData.put("aiScore", calculateScore(s));
                    stockData.put("peRatio", s.getPeRatio());
                    stockData.put("roe", s.getRoe());

                    return stockData;
                })
                .collect(Collectors.toList());
    }

    private int calculateScore(Stock s) {
        double score = 50;
        if (s.getRoe() != null) score += Math.min(20, Math.max(-10, s.getRoe().doubleValue() / 3));
        if (s.getPeRatio() != null) score += s.getPeRatio().doubleValue() < 25 ? 10 : -4;
        if (s.getDebtToEquity() != null) score += s.getDebtToEquity().doubleValue() < .5 ? 8 : -5;

        // AI Score now reacts to live intraday momentum
        if (s.getChangePercent() != null) score += Math.min(8, Math.max(-8, s.getChangePercent().doubleValue() * 2));

        return Math.max(0, Math.min(100, (int) Math.round(score)));
    }

    public Stock find(String symbol) {
        Stock dbStock = stocks.findBySymbol(symbol).orElseThrow(() -> new RuntimeException("Stock not found"));

        try {
            // Fetch single stock live data
            yahoofinance.Stock liveStock = YahooFinance.get(symbol + ".NS");
            if (liveStock != null && liveStock.getQuote().getPrice() != null) {
                dbStock.setPrice(liveStock.getQuote().getPrice());
                dbStock.setChangePercent(liveStock.getQuote().getChangeInPercent());
            }
        } catch (IOException e) {
            System.err.println("FinSight Engine: Live quote failed for " + symbol);
        }
        return dbStock;
    }
}
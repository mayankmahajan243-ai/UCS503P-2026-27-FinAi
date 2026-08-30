package com.finsight.service;

import com.finsight.model.Stock;
import com.finsight.repository.StockRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Random;

@Service
public class MarketSyncService {

    private final StockRepository stockRepository;
    private final Random random = new Random();

    public MarketSyncService(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }

    // Runs automatically every 15 seconds to simulate live market ticks & volatility
    @Scheduled(fixedRate = 15000)
    public void simulateLiveMarketTicks() {
        List<Stock> stocks = stockRepository.findAll();
        if (stocks.isEmpty()) return;

        boolean updated = false;
        for (Stock stock : stocks) {
            if (stock.getPrice() == null) continue;

            // Generate a realistic random price change between -0.8% and +0.8%
            double percentChange = (random.nextDouble() * 1.6) - 0.8;
            double currentPrice = stock.getPrice().doubleValue();
            double newPrice = currentPrice * (1 + (percentChange / 100.0));

            // Round to 2 decimal places
            BigDecimal updatedPrice = BigDecimal.valueOf(newPrice).setScale(2, RoundingMode.HALF_UP);
            BigDecimal updatedChangePercent = BigDecimal.valueOf(percentChange).setScale(2, RoundingMode.HALF_UP);

            stock.setPrice(updatedPrice);
            stock.setChangePercent(updatedChangePercent);
            updated = true;
        }

        if (updated) {
            stockRepository.saveAll(stocks);
            System.out.println("FinSight Live Engine: Market tick executed — NIFTY 50 prices updated dynamically.");
        }
    }
}
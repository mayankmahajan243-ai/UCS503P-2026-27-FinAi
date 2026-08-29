package com.finsight.service;

import com.finsight.model.Holding;
import com.finsight.model.Stock;
import com.finsight.model.Wallet;
import com.finsight.repository.HoldingRepository;
import com.finsight.repository.WalletRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class PortfolioService {

    private final HoldingRepository holdings;
    private final WalletRepository wallets;
    private final MarketDataService market;

    public PortfolioService(HoldingRepository holdings, WalletRepository wallets, MarketDataService market) {
        this.holdings = holdings;
        this.wallets = wallets;
        this.market = market;
    }

    public Map<String,Object> summary(String userId) {
        List<Holding> list = holdings.findByUserId(userId);
        List<Map<String,Object>> rows = new ArrayList<>();
        double invested = 0, current = 0;

        for (Holding h : list) {
            Stock s = market.find(h.getSymbol());
            double currentPrice = s.getPrice() != null ? s.getPrice().doubleValue() : h.getAveragePrice().doubleValue();
            double inv = h.getQuantity().doubleValue() * h.getAveragePrice().doubleValue();
            double cur = h.getQuantity().doubleValue() * currentPrice;
            double pnl = cur - inv;
            invested += inv;
            current += cur;

            rows.add(Map.of(
                    "symbol", h.getSymbol(),
                    "quantity", h.getQuantity(),
                    "averagePrice", h.getAveragePrice(),
                    "currentPrice", currentPrice,
                    "profitLoss", round(pnl),
                    "marketValue", round(cur),
                    "allocation", 0
            ));
        }

        final double total = current;
        double maxAllocation = 0;

        List<Map<String,Object>> finalizedRows = new ArrayList<>();
        for (Map<String, Object> r : rows) {
            Map<String,Object> m = new LinkedHashMap<>(r);
            double allocation = total == 0 ? 0 : ((Number) r.get("marketValue")).doubleValue() / total * 100;
            m.put("allocation", round(allocation));
            if (allocation > maxAllocation) maxAllocation = allocation;
            finalizedRows.add(m);
        }

        double pnl = current - invested;

        // Fetch user's virtual wallet cash balance
        Wallet wallet = wallets.findById(userId).orElse(Wallet.builder().balance(new BigDecimal("1000000.00")).build());
        double cashBalance = wallet.getBalance().doubleValue();
        double netWorth = current + cashBalance;

        return Map.of(
                "invested", round(invested),
                "currentValue", round(current),
                "cashBalance", round(cashBalance),
                "netWorth", round(netWorth),
                "profitLoss", round(pnl),
                "profitPercent", invested == 0 ? 0 : round(pnl / invested * 100),
                "diversificationScore", calculateDiversification(list.size(), maxAllocation),
                "holdings", finalizedRows
        );
    }

    private int calculateDiversification(int holdingCount, double maxAllocation) {
        if (holdingCount == 0) return 0;
        int score = 50;
        if (holdingCount >= 10) score += 30;
        else if (holdingCount >= 5) score += 20;
        else if (holdingCount >= 3) score += 10;

        if (maxAllocation > 50) score -= 20;
        else if (maxAllocation > 30) score -= 10;
        else if (maxAllocation <= 15) score += 20;

        return Math.max(0, Math.min(100, score));
    }

    private double round(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
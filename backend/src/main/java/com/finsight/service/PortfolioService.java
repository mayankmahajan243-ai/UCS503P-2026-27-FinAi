package com.finsight.service;

import com.finsight.model.Holding;
import com.finsight.model.Stock;
import com.finsight.repository.HoldingRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class PortfolioService {
    private final HoldingRepository holdings;
    private final MarketDataService market;

    public PortfolioService(HoldingRepository holdings, MarketDataService market) {
        this.holdings = holdings;
        this.market = market;
    }

    public Map<String,Object> summary(String userId) {
        List<Holding> list = holdings.findByUserId(userId);
        List<Map<String,Object>> rows = new ArrayList<>();
        double invested = 0, current = 0;

        for (Holding h : list) {
            Stock s = market.find(h.getSymbol());
            double inv = h.getQuantity().doubleValue() * h.getAveragePrice().doubleValue();
            double cur = h.getQuantity().doubleValue() * s.getPrice().doubleValue();
            double pnl = cur - inv;
            invested += inv; current += cur;
            rows.add(Map.of(
                "symbol", h.getSymbol(),
                "quantity", h.getQuantity(),
                "averagePrice", h.getAveragePrice(),
                "currentPrice", s.getPrice(),
                "profitLoss", round(pnl),
                "marketValue", round(cur),
                "allocation", 0
            ));
        }
        final double total = current;
        rows = rows.stream().map(r -> {
            Map<String,Object> m = new LinkedHashMap<>(r);
            double allocation = total == 0 ? 0 : ((Number) r.get("marketValue")).doubleValue() / total * 100;
            m.put("allocation", round(allocation));
            return m;
        }).toList();

        double pnl = current - invested;
        return Map.of(
            "invested", round(invested),
            "currentValue", round(current),
            "profitLoss", round(pnl),
            "profitPercent", invested == 0 ? 0 : round(pnl / invested * 100),
            "diversificationScore", diversificationScore(list),
            "holdings", rows
        );
    }

    private int diversificationScore(List<Holding> list) {
        return list.size() >= 5 ? 90 : list.size() >= 3 ? 78 : list.size() * 20;
    }

    private double round(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}

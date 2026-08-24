package com.finsight.service;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AIService {
    private final PortfolioService portfolioService;
    private final MarketDataService marketDataService;

    public AIService(PortfolioService portfolioService, MarketDataService marketDataService) {
        this.portfolioService = portfolioService;
        this.marketDataService = marketDataService;
    }

    public Map<String,Object> insights(String userId) {
        Map<String,Object> portfolio = portfolioService.summary(userId);
        List<Map<String,Object>> stocks = marketDataService.stocksWithAIScores();

        List<Map<String,Object>> recs = stocks.stream()
            .sorted((a,b) -> Integer.compare((Integer)b.get("aiScore"), (Integer)a.get("aiScore")))
            .limit(4)
            .map(s -> {
                int score = (Integer)s.get("aiScore");
                String label = score >= 80 ? "Strong candidate for deeper research" : score >= 68 ? "Watch closely" : "Neutral";
                List<String> factors = new ArrayList<>();
                if (((Number)s.get("roe")).doubleValue() > 20) factors.add("strong ROE");
                if (((Number)s.get("peRatio")).doubleValue() < 25) factors.add("reasonable valuation");
                if (((Number)s.get("changePercent")).doubleValue() > 0) factors.add("positive momentum");
                return Map.of(
                    "symbol", s.get("symbol"),
                    "score", score,
                    "label", label,
                    "reason", "Score combines fundamentals, valuation and recent momentum. Use the factors below to verify the thesis.",
                    "factors", factors
                );
            }).toList();

        return Map.of(
            "riskProfile", "Moderate",
            "riskScore", 46,
            "confidence", 82,
            "summary", "Your portfolio is moderately positioned with healthy diversification. AI sees several candidates worth researching further.",
            "recommendations", recs,
            "riskFlags", List.of(
                "Technology exposure should be monitored as a sector concentration risk.",
                "Consider reviewing position sizes if any single stock exceeds your personal allocation limit."
            ),
            "portfolio", portfolio
        );
    }
}

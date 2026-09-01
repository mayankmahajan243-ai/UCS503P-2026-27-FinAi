package com.finsight.service;

import com.finsight.model.Stock;
import com.finsight.repository.StockRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AIInsightsService {

    private final StockRepository stockRepository;
    private final AiServiceClient aiServiceClient;

    public AIInsightsService(StockRepository stockRepository, AiServiceClient aiServiceClient) {
        this.stockRepository = stockRepository;
        this.aiServiceClient = aiServiceClient;
    }

    public Map<String, Object> getInsights(String userId) {

        List<Stock> stocks = stockRepository.findAll();

        List<Map<String, Object>> analysedStocks = new ArrayList<>();

        for (Stock stock : stocks) {

            int fundamentalScore = calculateFundamentalScore(stock);
            int valuationScore = calculateValuationScore(stock);
            int momentumScore = calculateMomentumScore(stock);
            int riskScore = calculateRiskScore(stock);

            int aiScore = Math.round(
                    (fundamentalScore
                            + valuationScore
                            + momentumScore
                            + riskScore) / 4.0f
            );

            // Hybrid: blend with Python AI service score if available
            try {
                var pyScore = aiServiceClient.scoreStock(
                        stock.getSymbol(),
                        stock.getPeRatio() != null ? stock.getPeRatio().doubleValue() : 25,
                        stock.getRoe() != null ? stock.getRoe().doubleValue() : 15,
                        stock.getDebtToEquity() != null ? stock.getDebtToEquity().doubleValue() : 0.5,
                        stock.getChangePercent() != null ? stock.getChangePercent().doubleValue() : 0,
                        0
                );
                if (pyScore != null && pyScore.get("score") != null) {
                    double pythonScore = ((Number) pyScore.get("score")).doubleValue();
                    // Weighted blend: 70% Java + 30% Python
                    aiScore = (int) Math.round(aiScore * 0.7 + pythonScore * 0.3);
                }
            } catch (Exception ignored) {
                // Fallback to Java-only scoring
            }

            String recommendation = getRecommendation(aiScore);

            Map<String, Object> data = new LinkedHashMap<>();

            data.put("symbol", stock.getSymbol());
            data.put("companyName", stock.getCompanyName());
            data.put("sector", stock.getSector());

            data.put("price", stock.getPrice());
            data.put("changePercent", stock.getChangePercent());

            data.put("fundamentalScore", fundamentalScore);
            data.put("valuationScore", valuationScore);
            data.put("momentumScore", momentumScore);
            data.put("riskScore", riskScore);

            data.put("aiScore", aiScore);
            data.put("recommendation", recommendation);

            data.put(
                    "summary",
                    generateSummary(
                            stock,
                            aiScore,
                            fundamentalScore,
                            valuationScore,
                            momentumScore,
                            riskScore
                    )
            );

            analysedStocks.add(data);
        }

        analysedStocks.sort(
                (a, b) ->
                        Integer.compare(
                                (Integer) b.get("aiScore"),
                                (Integer) a.get("aiScore")
                        )
        );

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("userId", userId);
        response.put("marketSentiment", calculateMarketSentiment(analysedStocks));
        response.put("totalStocksAnalysed", analysedStocks.size());

        response.put(
                "topStocks",
                analysedStocks.stream()
                        .limit(10)
                        .toList()
        );

        response.put("allStocks", analysedStocks);

        return response;
    }

    // -----------------------------
    // FUNDAMENTAL SCORE
    // -----------------------------

    private int calculateFundamentalScore(Stock stock) {

        double score = 50;

        if (stock.getRoe() != null) {

            double roe = stock.getRoe().doubleValue();

            if (roe >= 20) {
                score += 25;
            } else if (roe >= 15) {
                score += 18;
            } else if (roe >= 10) {
                score += 10;
            } else if (roe < 5) {
                score -= 10;
            }
        }

        if (stock.getDebtToEquity() != null) {

            double debt = stock.getDebtToEquity().doubleValue();

            if (debt < 0.3) {
                score += 15;
            } else if (debt < 0.5) {
                score += 10;
            } else if (debt < 1) {
                score += 3;
            } else {
                score -= 12;
            }
        }

        return clamp(score);
    }

    // -----------------------------
    // VALUATION SCORE
    // -----------------------------

    private int calculateValuationScore(Stock stock) {

        double score = 50;

        if (stock.getPeRatio() != null) {

            double pe = stock.getPeRatio().doubleValue();

            if (pe < 15) {
                score += 25;
            } else if (pe < 20) {
                score += 18;
            } else if (pe < 25) {
                score += 10;
            } else if (pe < 35) {
                score -= 5;
            } else {
                score -= 15;
            }
        }

        return clamp(score);
    }

    // -----------------------------
    // MOMENTUM SCORE
    // -----------------------------

    private int calculateMomentumScore(Stock stock) {

        double score = 50;

        if (stock.getChangePercent() != null) {

            double change = stock.getChangePercent().doubleValue();

            if (change >= 3) {
                score += 30;
            } else if (change >= 2) {
                score += 22;
            } else if (change >= 1) {
                score += 15;
            } else if (change >= 0) {
                score += 5;
            } else if (change > -2) {
                score -= 10;
            } else {
                score -= 20;
            }
        }

        return clamp(score);
    }

    // -----------------------------
    // RISK SCORE
    // Higher = safer
    // -----------------------------

    private int calculateRiskScore(Stock stock) {

        double score = 70;

        if (stock.getDebtToEquity() != null) {

            double debt = stock.getDebtToEquity().doubleValue();

            if (debt < 0.3) {
                score += 20;
            } else if (debt < 0.5) {
                score += 10;
            } else if (debt < 1) {
                score -= 5;
            } else {
                score -= 20;
            }
        }

        if (stock.getChangePercent() != null) {

            double change =
                    Math.abs(stock.getChangePercent().doubleValue());

            if (change > 5) {
                score -= 15;
            }
        }

        return clamp(score);
    }

    // -----------------------------
    // RECOMMENDATION
    // -----------------------------

    private String getRecommendation(int score) {

        if (score >= 80) {
            return "BUY";
        }

        if (score >= 65) {
            return "ACCUMULATE";
        }

        if (score >= 50) {
            return "HOLD";
        }

        if (score >= 35) {
            return "WATCH";
        }

        return "AVOID";
    }

    // -----------------------------
    // AI SUMMARY
    // -----------------------------

    private String generateSummary(
            Stock stock,
            int aiScore,
            int fundamentalScore,
            int valuationScore,
            int momentumScore,
            int riskScore
    ) {

        StringBuilder summary = new StringBuilder();

        if (aiScore >= 80) {

            summary.append(
                    stock.getCompanyName()
                            + " shows strong overall characteristics. "
            );

        } else if (aiScore >= 65) {

            summary.append(
                    stock.getCompanyName()
                            + " shows a healthy combination of fundamentals and momentum. "
            );

        } else if (aiScore >= 50) {

            summary.append(
                    stock.getCompanyName()
                            + " currently has a balanced risk-reward profile. "
            );

        } else {

            summary.append(
                    stock.getCompanyName()
                            + " requires caution based on the current metrics. "
            );
        }

        if (fundamentalScore >= 75) {

            summary.append(
                    "Fundamentals are strong. "
            );

        } else if (fundamentalScore < 45) {

            summary.append(
                    "Fundamental strength is relatively weak. "
            );
        }

        if (valuationScore >= 75) {

            summary.append(
                    "Valuation appears attractive. "
            );

        } else if (valuationScore < 45) {

            summary.append(
                    "Valuation may require additional attention. "
            );
        }

        if (momentumScore >= 75) {

            summary.append(
                    "Recent momentum is positive."
            );

        } else if (momentumScore < 45) {

            summary.append(
                    "Recent momentum is relatively weak."
            );
        }

        return summary.toString();
    }

    // -----------------------------
    // MARKET SENTIMENT
    // -----------------------------

    private String calculateMarketSentiment(
            List<Map<String, Object>> stocks
    ) {

        if (stocks.isEmpty()) {
            return "NEUTRAL";
        }

        double average =
                stocks.stream()
                        .mapToInt(
                                stock ->
                                        (Integer) stock.get("aiScore")
                        )
                        .average()
                        .orElse(50);

        if (average >= 75) {
            return "VERY BULLISH";
        }

        if (average >= 65) {
            return "BULLISH";
        }

        if (average >= 50) {
            return "NEUTRAL";
        }

        if (average >= 35) {
            return "BEARISH";
        }

        return "VERY BEARISH";
    }

    private int clamp(double score) {

        return Math.max(
                0,
                Math.min(
                        100,
                        (int) Math.round(score)
                )
        );
    }
}
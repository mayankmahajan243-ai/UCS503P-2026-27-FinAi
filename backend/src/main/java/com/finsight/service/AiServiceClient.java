package com.finsight.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.Map;

/**
 * HTTP client for the Python FastAPI AI microservice.
 * Falls back gracefully when the AI service is unavailable.
 */
@Service
public class AiServiceClient {

    private final RestClient restClient;
    private volatile boolean available = true;
    private volatile long unavailableSince = 0;
    private static final long CIRCUIT_RESET_MS = 60_000; // 1 minute

    public AiServiceClient(@Value("${app.ai-service.url:http://localhost:9000}") String baseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    /**
     * Score a stock via the Python AI service.
     * Returns null if the service is unavailable (circuit open).
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> scoreStock(String symbol, double peRatio, double roe,
                                           double debtToEquity, double momentum, double sentiment) {
        if (!isAvailable()) return null;
        try {
            return restClient.post()
                    .uri("/score")
                    .body(Map.of(
                            "symbol", symbol,
                            "pe_ratio", peRatio,
                            "roe", roe,
                            "debt_to_equity", debtToEquity,
                            "momentum", momentum,
                            "sentiment", sentiment
                    ))
                    .retrieve()
                    .body(Map.class);
        } catch (Exception e) {
            tripCircuit();
            return null;
        }
    }

    /**
     * Analyze sentiment of a headline.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> analyzeSentiment(String headline) {
        if (!isAvailable()) return null;
        try {
            return restClient.post()
                    .uri("/sentiment")
                    .body(Map.of("headline", headline))
                    .retrieve()
                    .body(Map.class);
        } catch (Exception e) {
            tripCircuit();
            return null;
        }
    }

    /**
     * Check if the AI service is healthy.
     */
    public boolean healthCheck() {
        try {
            restClient.get().uri("/health").retrieve().body(Map.class);
            available = true;
            return true;
        } catch (Exception e) {
            tripCircuit();
            return false;
        }
    }

    private boolean isAvailable() {
        if (available) return true;
        // Auto-reset circuit after timeout
        if (System.currentTimeMillis() - unavailableSince > CIRCUIT_RESET_MS) {
            available = true;
            return true;
        }
        return false;
    }

    private void tripCircuit() {
        available = false;
        unavailableSince = System.currentTimeMillis();
    }
}

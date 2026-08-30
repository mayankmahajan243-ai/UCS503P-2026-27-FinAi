package com.finsight.controller;

import com.finsight.model.PriceAlert;
import com.finsight.repository.AlertRepository;
import com.finsight.service.MarketDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "http://localhost:5173")
public class AlertController {

    private final AlertRepository repo;
    private final MarketDataService market;

    public AlertController(AlertRepository repo, MarketDataService market) {
        this.repo = repo;
        this.market = market;
    }

    // GET /api/alerts/{userId}  — returns alerts with triggered flag
    @GetMapping("/{userId}")
    public List<?> get(@PathVariable String userId) {
        List<PriceAlert> alerts = repo.findByUserId(userId);
        return alerts.stream().map(a -> {
            double currentPrice = 0;
            try {
                currentPrice = market.find(a.getSymbol()).getPrice().doubleValue();
            } catch (Exception ignored) {}
            boolean triggered = a.getDirection().equals("ABOVE")
                    ? currentPrice >= a.getTargetPrice().doubleValue()
                    : currentPrice <= a.getTargetPrice().doubleValue();
            return Map.of(
                    "id", a.getId(),
                    "symbol", a.getSymbol(),
                    "direction", a.getDirection(),
                    "targetPrice", a.getTargetPrice(),
                    "active", a.isActive(),
                    "currentPrice", currentPrice,
                    "triggered", triggered
            );
        }).toList();
    }

    // POST /api/alerts/{userId}
    @PostMapping("/{userId}")
    public ResponseEntity<?> create(
            @PathVariable String userId,
            @RequestBody Map<String, Object> body) {
        String symbol    = ((String) body.get("symbol")).toUpperCase().trim();
        String direction = ((String) body.get("direction")).toUpperCase().trim();
        BigDecimal target = new BigDecimal(body.get("targetPrice").toString());

        PriceAlert alert = PriceAlert.builder()
                .userId(userId)
                .symbol(symbol)
                .direction(direction)
                .targetPrice(target)
                .active(true)
                .build();
        return ResponseEntity.ok(repo.save(alert));
    }

    // DELETE /api/alerts/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Alert deleted"));
    }
}

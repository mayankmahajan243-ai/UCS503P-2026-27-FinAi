package com.finsight.controller;

import com.finsight.model.WatchlistItem;
import com.finsight.repository.WatchlistRepository;
import com.finsight.service.MarketDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/watchlist")
@CrossOrigin(origins = "http://localhost:5173")
public class WatchlistController {

    private final WatchlistRepository repo;
    private final MarketDataService market;

    public WatchlistController(WatchlistRepository repo, MarketDataService market) {
        this.repo = repo;
        this.market = market;
    }

    // GET /api/watchlist/{userId}
    @GetMapping("/{userId}")
    public List<Map<String, Object>> get(@PathVariable String userId) {
        return repo.findByUserId(userId).stream()
                .map(w -> market.stocksWithAIScores().stream()
                        .filter(s -> s.get("symbol").equals(w.getSymbol()))
                        .findFirst()
                        .orElse(Map.of("symbol", w.getSymbol())))
                .toList();
    }

    // POST /api/watchlist/{userId}?symbol=RELIANCE
    @PostMapping("/{userId}")
    public ResponseEntity<?> add(@PathVariable String userId, @RequestParam String symbol) {
        String sym = symbol.toUpperCase().trim();
        // prevent duplicates
        boolean exists = repo.findByUserId(userId).stream()
                .anyMatch(w -> w.getSymbol().equals(sym));
        if (exists) {
            return ResponseEntity.ok(Map.of("message", sym + " already in watchlist"));
        }
        WatchlistItem item = repo.save(WatchlistItem.builder().userId(userId).symbol(sym).build());
        return ResponseEntity.ok(item);
    }

    // DELETE /api/watchlist/{userId}/{symbol}
    @DeleteMapping("/{userId}/{symbol}")
    public ResponseEntity<?> remove(@PathVariable String userId, @PathVariable String symbol) {
        repo.findByUserId(userId).stream()
                .filter(w -> w.getSymbol().equalsIgnoreCase(symbol))
                .forEach(repo::delete);
        return ResponseEntity.ok(Map.of("message", symbol + " removed from watchlist"));
    }
}
